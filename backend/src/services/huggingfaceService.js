const { HfInference } = require('@huggingface/inference');
const logger = require('../utils/logger');

// Vérifier si la clé API Hugging Face est configurée
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || '';
const HUGGINGFACE_API_CONFIGURED = !!HUGGINGFACE_API_KEY;

// Initialisation du client Hugging Face (uniquement si la clé est configurée)
let hf = null;
if (HUGGINGFACE_API_CONFIGURED) {
  hf = new HfInference(HUGGINGFACE_API_KEY);
  logger.info('Service Hugging Face initialisé avec une clé API');
} else {
  logger.warn('Aucune clé API Hugging Face configurée. Mode secours activé.');
}

// Modèle par défaut - un modèle multilingue de taille moyenne (alternatives gratuites)
const DEFAULT_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';

/**
 * Traiter le prompt pour remplacer les variables
 * @param {string} prompt - Prompt avec variables
 * @param {Object} variables - Variables à remplacer
 * @returns {string} - Prompt traité
 */
const processPrompt = (prompt, variables) => {
  if (!prompt) return '';
  
  let processedPrompt = prompt;
  for (const [key, value] of Object.entries(variables)) {
    processedPrompt = processedPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  
  return processedPrompt;
};

/**
 * Construire les instructions système basées sur le contexte de l'entreprise
 * @param {Object} company - Objet entreprise complet
 * @returns {string} - Instructions système complètes
 */
const buildSystemInstructions = (company) => {
  if (!company.voiceAssistant || !company.voiceAssistant.prompts) {
    // Fallback sur un prompt par défaut si la configuration n'existe pas
    return `Vous êtes Lydia, un assistant vocal intelligent pour ${company.name}. 
            Répondez aux questions des clients de manière utile et précise.`;
  }
  
  // Variables de base disponibles pour tous les prompts
  const baseVariables = {
    companyName: company.name,
    companyDescription: company.description || '',
  };
  
  // Récupérer le prompt système de base
  const basePrompt = processPrompt(
    company.voiceAssistant.prompts.baseSystemPrompt,
    baseVariables
  );
  
  // Ajouter les informations de l'entreprise si disponibles
  let companyInfoSection = '';
  
  if (company.voiceAssistant.companyInfo) {
    const info = company.voiceAssistant.companyInfo;
    
    // Ajouter les produits
    if (info.products && info.products.length > 0) {
      companyInfoSection += `\n\nProduits:\n${info.products.join('\n- ')}`;
    }
    
    // Ajouter les services
    if (info.services && info.services.length > 0) {
      companyInfoSection += `\n\nServices:\n- ${info.services.join('\n- ')}`;
    }
    
    // Ajouter la FAQ
    if (info.faq && info.faq.length > 0) {
      companyInfoSection += '\n\nFAQ:';
      info.faq.forEach(item => {
        companyInfoSection += `\nQ: ${item.question}\nR: ${item.answer}`;
      });
    }
  }
  
  // Instructions générales pour les capacités et limites
  const generalInstructions = `
    Instructions:
    - Restez dans le cadre des informations fournies sur l'entreprise.
    - Si vous ne connaissez pas la réponse, proposez de transférer l'appel à un conseiller.
    - Utilisez un ton conversationnel et naturel adapté au contexte d'un appel téléphonique.
    - Gardez vos réponses concises pour éviter de longs monologues.
    - N'inventez pas d'informations qui ne sont pas explicitement mentionnées.
  `;
  
  return `${basePrompt}${companyInfoSection}\n${generalInstructions}`;
};

/**
 * Formater les messages pour l'API Hugging Face
 * @param {Array} messages - Messages au format ChatGPT
 * @returns {string} - Texte formaté pour Hugging Face
 */
const formatMessagesForHuggingFace = (messages) => {
  let formattedText = '';
  
  messages.forEach(msg => {
    if (msg.role === 'system') {
      formattedText += `Instructions: ${msg.content}\n\n`;
    } else if (msg.role === 'user') {
      formattedText += `Utilisateur: ${msg.content}\n`;
    } else if (msg.role === 'assistant') {
      formattedText += `Assistant: ${msg.content}\n`;
    }
  });
  
  formattedText += 'Assistant:';
  
  return formattedText;
};

/**
 * Mode de secours - génère une réponse sans API
 * @param {string} text - Texte de l'utilisateur
 * @param {Object} company - Informations sur l'entreprise
 * @returns {string} - Réponse générique
 */
const generateFallbackResponse = (text, company) => {
  const companyName = company?.name || 'notre entreprise';
  const responses = [
    `Merci pour votre message. Chez ${companyName}, nous prenons en compte toutes les demandes. Un conseiller vous recontactera prochainement.`,
    `Votre demande a bien été enregistrée. L'équipe de ${companyName} vous répondra dans les plus brefs délais.`,
    `Nous avons bien reçu votre message concernant "${text.substring(0, 20)}...". Un représentant de ${companyName} vous contactera sous peu.`,
    `Merci de votre intérêt pour ${companyName}. Nous traiterons votre demande et reviendrons vers vous rapidement.`
  ];
  
  // Sélectionner une réponse aléatoire
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
};

/**
 * Analyser une requête vocale et générer une réponse
 * @param {string} transcription - Transcription du message vocal de l'utilisateur
 * @param {Object} company - Objet entreprise complet
 * @param {Object} context - Contexte de la conversation (historique, etc.)
 * @param {string} scenarioName - Nom du scénario à utiliser (optionnel)
 * @returns {Promise<Object>} - Réponse générée et actions détectées
 */
const generateResponse = async (transcription, company, context = {}, scenarioName = null) => {
  try {
    // Vérifier si l'API est configurée
    if (!HUGGINGFACE_API_CONFIGURED || !hf) {
      logger.warn('API Hugging Face non configurée. Utilisation du mode secours.');
      const fallbackResponse = generateFallbackResponse(transcription, company);
      return {
        response: fallbackResponse,
        actions: [],
        fallback: true
      };
    }
    
    // Variables de base disponibles
    const baseVariables = {
      companyName: company.name,
      userInput: transcription,
    };
    
    // Construire le système de messages pour l'API
    const systemContent = buildSystemInstructions(company);
    
    const messages = [
      {
        role: 'system',
        content: systemContent
      }
    ];

    // Ajouter les instructions spécifiques au scénario si disponibles
    if (scenarioName && company.voiceAssistant && company.voiceAssistant.prompts) {
      try {
        // Générer le prompt spécifique au scénario (si disponible)
        if (company.generatePromptForScenario) {
          const scenarioPrompt = company.generatePromptForScenario(scenarioName, baseVariables);
          
          if (scenarioPrompt) {
            messages[0].content += `\n\nScénario spécifique: ${scenarioName}\n${scenarioPrompt}`;
          }
        }
      } catch (error) {
        logger.warn(`Erreur lors de la génération du prompt pour le scénario ${scenarioName}:`, error);
      }
    }

    // Ajouter l'historique de conversation si disponible
    if (context.history && Array.isArray(context.history)) {
      messages.push(...context.history);
    }

    // Ajouter la requête actuelle de l'utilisateur
    messages.push({
      role: 'user',
      content: transcription
    });

    // Formater pour Hugging Face
    const formattedPrompt = formatMessagesForHuggingFace(messages);
    
    // Appeler l'API Hugging Face
    logger.info(`Envoi de la requête à Hugging Face avec le modèle: ${process.env.HUGGINGFACE_MODEL || DEFAULT_MODEL}`);
    
    const response = await hf.textGeneration({
      model: process.env.HUGGINGFACE_MODEL || DEFAULT_MODEL,
      inputs: formattedPrompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        top_p: 0.95,
        do_sample: true,
        return_full_text: false
      }
    });

    const responseContent = response.generated_text.trim();
    logger.info(`Réponse générée pour ${company.name}: ${responseContent.substring(0, 100)}...`);
    
    // Détecter les actions dans la réponse (si présentes)
    const actionMatches = responseContent.match(/\[ACTION:([^\]]+)\]/g);
    const detectedActions = [];
    
    if (actionMatches) {
      actionMatches.forEach(match => {
        const actionName = match.replace('[ACTION:', '').replace(']', '').trim();
        detectedActions.push(actionName);
      });
    }
    
    // Nettoyer la réponse en enlevant les tags d'action
    const cleanResponse = responseContent.replace(/\[ACTION:[^\]]+\]/g, '').trim();
    
    return {
      response: cleanResponse,
      actions: detectedActions
    };
  } catch (error) {
    logger.error('Erreur lors de la génération de réponse Hugging Face:', error);
    
    // En cas d'erreur, utiliser le mode secours
    const fallbackResponse = generateFallbackResponse(transcription, company);
    return {
      response: fallbackResponse,
      actions: [],
      fallback: true,
      error: error.message
    };
  }
};

/**
 * Détecter si une requête nécessite un transfert vers un humain
 * @param {string} transcription - Transcription du message vocal
 * @param {Object} company - Configuration de l'entreprise
 * @returns {Promise<boolean>} - True si un transfert est nécessaire
 */
const needsHumanTransfer = async (transcription, company = null) => {
  try {
    // Vérifier si l'API est configurée
    if (!HUGGINGFACE_API_CONFIGURED || !hf) {
      logger.warn('API Hugging Face non configurée. Considérant que le transfert est nécessaire.');
      return true;
    }
    
    // Prompt simple pour détecter si un transfert à un humain est nécessaire
    let prompt = `Instructions: Vous analysez si une demande client nécessite l'intervention d'un humain.
Répondez uniquement par "vrai" ou "faux".
Voici les cas qui nécessitent un humain:
- Le client demande explicitement de parler à un conseiller
- La demande concerne une plainte ou réclamation complexe
- La demande concerne un problème technique spécifique
- La demande concerne un remboursement
- Le client semble énervé ou en détresse

Utilisateur: ${transcription}
Assistant:`;
    
    // Si l'entreprise a un prompt personnalisé pour le transfert, l'ajouter
    if (company && company.voiceAssistant && company.voiceAssistant.prompts && company.voiceAssistant.prompts.transferPrompt) {
      prompt = `Instructions: Vous analysez si une demande client nécessite l'intervention d'un humain.
Répondez uniquement par "vrai" ou "faux".
Voici les cas qui nécessitent un humain:
${company.voiceAssistant.prompts.transferPrompt}

Utilisateur: ${transcription}
Assistant:`;
    }
    
    const response = await hf.textGeneration({
      model: process.env.HUGGINGFACE_MODEL || DEFAULT_MODEL,
      inputs: prompt,
      parameters: {
        max_new_tokens: 10,
        temperature: 0.1,
        return_full_text: false
      }
    });

    const result = response.generated_text.trim().toLowerCase();
    const needsTransfer = result.includes('vrai');
    
    logger.info(`Analyse de transfert pour: "${transcription.substring(0, 50)}..." - Résultat: ${needsTransfer}`);
    return needsTransfer;
  } catch (error) {
    logger.error('Erreur lors de l\'analyse de transfert:', error);
    // En cas d'erreur, on préfère transférer à un humain par précaution
    return true;
  }
};

/**
 * Analyser le sentiment d'un message
 * @param {string} text - Texte à analyser
 * @returns {Promise<Object>} - Analyse du sentiment (positif, négatif, neutre)
 */
const analyzeSentiment = async (text) => {
  try {
    // Vérifier si l'API est configurée
    if (!HUGGINGFACE_API_CONFIGURED || !hf) {
      logger.warn('API Hugging Face non configurée. Renvoi d\'une analyse par défaut.');
      return { 
        sentiment: 'neutre', 
        score: 0.5, 
        explanation: 'Analyse par défaut (API non configurée)',
        fallback: true
      };
    }
    
    const prompt = `Instructions: Analysez le sentiment du texte suivant et répondez au format JSON avec la structure:
{ "sentiment": "positif|négatif|neutre", "score": 0-1, "explanation": "brève explication" }
Ne répondez qu'avec ce format JSON, rien d'autre.

Utilisateur: ${text}
Assistant:`;

    const response = await hf.textGeneration({
      model: process.env.HUGGINGFACE_MODEL || DEFAULT_MODEL,
      inputs: prompt,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.2,
        return_full_text: false
      }
    });

    const responseText = response.generated_text.trim();
    try {
      // Extraire le JSON si le modèle a généré du texte autour
      const jsonMatch = responseText.match(/\{.*\}/s);
      if (jsonMatch) {
        const sentiment = JSON.parse(jsonMatch[0]);
        logger.info(`Analyse de sentiment effectuée: ${sentiment.sentiment}`);
        return sentiment;
      } else {
        throw new Error('Impossible d\'extraire le JSON');
      }
    } catch (parseError) {
      logger.error('Erreur lors du parsing de l\'analyse de sentiment:', parseError, responseText);
      return { sentiment: 'neutre', score: 0.5, explanation: 'Erreur d\'analyse' };
    }
  } catch (error) {
    logger.error('Erreur lors de l\'analyse de sentiment:', error);
    return { 
      sentiment: 'neutre', 
      score: 0.5, 
      explanation: 'Erreur d\'analyse',
      error: error.message
    };
  }
};

/**
 * Détecter les intentions de l'utilisateur
 * @param {string} text - Texte à analyser
 * @param {Object} company - Configuration de l'entreprise
 * @returns {Promise<Object>} - Intentions détectées et scénario recommandé
 */
const detectIntent = async (text, company) => {
  try {
    // Vérifier si l'API est configurée
    if (!HUGGINGFACE_API_CONFIGURED || !hf) {
      logger.warn('API Hugging Face non configurée. Renvoi d\'une analyse d\'intention par défaut.');
      return { 
        primaryIntent: "default", 
        secondaryIntents: [], 
        entities: {},
        recommendedScenario: null,
        fallback: true
      };
    }
    
    let prompt = `Instructions: Analysez l'intention de l'utilisateur dans ce message et répondez au format JSON avec la structure:
{ 
  "primaryIntent": "intention principale",
  "secondaryIntents": ["intention secondaire 1", "intention secondaire 2"],
  "entities": { "entité1": "valeur1", "entité2": "valeur2" },
  "recommendedScenario": "nom du scénario recommandé"
}
Ne répondez qu'avec ce format JSON, rien d'autre.`;
    
    // Ajouter les scénarios disponibles s'ils existent
    if (company && company.voiceAssistant && company.voiceAssistant.prompts && company.voiceAssistant.prompts.scenarios) {
      prompt += `\n\nScénarios disponibles:`;
      company.voiceAssistant.prompts.scenarios.forEach(scenario => {
        prompt += `\n- ${scenario.name}: ${scenario.description || 'Pas de description'}`;
        if (scenario.triggers && scenario.triggers.length > 0) {
          prompt += ` (déclencheurs: ${scenario.triggers.join(', ')})`;
        }
      });
    }
    
    prompt += `\n\nUtilisateur: ${text}\nAssistant:`;
    
    const response = await hf.textGeneration({
      model: process.env.HUGGINGFACE_MODEL || DEFAULT_MODEL,
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.2,
        return_full_text: false
      }
    });

    const responseText = response.generated_text.trim();
    try {
      // Extraire le JSON si le modèle a généré du texte autour
      const jsonMatch = responseText.match(/\{.*\}/s);
      if (jsonMatch) {
        const intent = JSON.parse(jsonMatch[0]);
        logger.info(`Analyse d'intention effectuée: ${intent.primaryIntent}`);
        return intent;
      } else {
        throw new Error('Impossible d\'extraire le JSON');
      }
    } catch (parseError) {
      logger.error('Erreur lors du parsing de l\'analyse d\'intention:', parseError, responseText);
      return { 
        primaryIntent: "unknown", 
        secondaryIntents: [], 
        entities: {},
        recommendedScenario: null
      };
    }
  } catch (error) {
    logger.error('Erreur lors de l\'analyse d\'intention:', error);
    return { 
      primaryIntent: "unknown", 
      secondaryIntents: [], 
      entities: {},
      recommendedScenario: null,
      error: error.message
    };
  }
};

module.exports = {
  generateResponse,
  needsHumanTransfer,
  analyzeSentiment,
  detectIntent,
  processPrompt
};
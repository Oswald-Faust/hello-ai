const { OpenAI } = require('openai');
const logger = require('../utils/logger');

// Initialisation du client OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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
    
    // Ajouter les informations sur l'équipe
    if (info.team && info.team.length > 0) {
      companyInfoSection += '\n\nÉquipe:';
      info.team.forEach(member => {
        companyInfoSection += `\n- ${member.name}, ${member.role}`;
        if (member.expertise && member.expertise.length > 0) {
          companyInfoSection += ` (expertise: ${member.expertise.join(', ')})`;
        }
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
 * Analyser une requête vocale et générer une réponse
 * @param {string} transcription - Transcription du message vocal de l'utilisateur
 * @param {Object} company - Objet entreprise complet
 * @param {Object} context - Contexte de la conversation (historique, etc.)
 * @param {string} scenarioName - Nom du scénario à utiliser (optionnel)
 * @returns {Promise<Object>} - Réponse générée et actions détectées
 */
const generateResponse = async (transcription, company, context = {}, scenarioName = null) => {
  try {
    // Variables de base disponibles
    const baseVariables = {
      companyName: company.name,
      userInput: transcription,
      // Ajouter d'autres variables de contexte si nécessaires
    };
    
    // Construire le système de messages pour l'API
    const systemContent = buildSystemInstructions(company);
    
    const messages = [
      {
        role: 'system',
        content: systemContent
      }
    ];

    // Si un scénario spécifique est demandé et disponible
    let scenarioInstructions = '';
    let detectedActions = [];
    
    if (scenarioName && company.voiceAssistant && company.voiceAssistant.prompts) {
      try {
        // Générer le prompt spécifique au scénario
        const scenarioPrompt = company.generatePromptForScenario(scenarioName, baseVariables);
        
        if (scenarioPrompt) {
          scenarioInstructions = `\n\nScénario spécifique: ${scenarioName}\n${scenarioPrompt}`;
          
          // Ajouter les actions disponibles pour ce scénario
          const scenario = company.voiceAssistant.prompts.scenarios.find(s => s.name === scenarioName);
          if (scenario && scenario.actions && scenario.actions.length > 0) {
            scenarioInstructions += '\n\nActions disponibles:';
            scenario.actions.forEach(action => {
              scenarioInstructions += `\n- ${action.name}: ${action.description}`;
            });
            scenarioInstructions += '\n\nSi une action est appropriée, indiquez-la clairement dans votre réponse en utilisant le format [ACTION:nom_action].';
          }
        }
      } catch (error) {
        logger.warn(`Erreur lors de la génération du prompt pour le scénario ${scenarioName}:`, error);
      }
    }
    
    // Ajouter les instructions spécifiques au scénario si disponibles
    if (scenarioInstructions) {
      messages[0].content += scenarioInstructions;
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

    // Appeler l'API OpenAI
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const responseContent = completion.choices[0].message.content;
    logger.info(`Réponse générée pour ${company.name}: ${responseContent.substring(0, 100)}...`);
    
    // Détecter les actions dans la réponse
    const actionMatches = responseContent.match(/\[ACTION:([^\]]+)\]/g);
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
    logger.error('Erreur lors de la génération de réponse OpenAI:', error);
    throw error;
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
    let systemPrompt = `Vous êtes un système d'analyse qui détermine si une demande client nécessite l'intervention d'un humain.
                   Répondez uniquement par "vrai" si la demande nécessite clairement un humain, ou "faux" si l'IA peut gérer.
                   Considérez comme nécessitant un humain: demandes explicites de parler à un conseiller, plaintes complexes,
                   problèmes techniques spécifiques, demandes de remboursement, ou situations émotionnellement chargées.`;
                   
    // Si l'entreprise a un prompt personnalisé pour le transfert, l'utiliser
    if (company && company.voiceAssistant && company.voiceAssistant.prompts && company.voiceAssistant.prompts.transferPrompt) {
      systemPrompt += `\n\nCritères spécifiques de l'entreprise ${company.name}: ${company.voiceAssistant.prompts.transferPrompt}`;
    }
    
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: transcription
        }
      ],
      max_tokens: 10,
      temperature: 0.1,
    });

    const response = completion.choices[0].message.content.trim().toLowerCase();
    const needsTransfer = response === 'true';
    
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
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Analysez le sentiment du texte suivant et répondez au format JSON avec la structure:
                   { "sentiment": "positif|négatif|neutre", "score": 0-1, "explanation": "brève explication" }`
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: 150,
      temperature: 0.2,
    });

    const response = completion.choices[0].message.content;
    try {
      const sentiment = JSON.parse(response);
      logger.info(`Analyse de sentiment effectuée: ${sentiment.sentiment}`);
      return sentiment;
    } catch (parseError) {
      logger.error('Erreur lors du parsing de l\'analyse de sentiment:', parseError);
      return { sentiment: 'neutre', score: 0.5, explanation: 'Erreur d\'analyse' };
    }
  } catch (error) {
    logger.error('Erreur lors de l\'analyse de sentiment:', error);
    return { sentiment: 'neutre', score: 0.5, explanation: 'Erreur d\'analyse' };
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
    let intentPrompt = `Analysez l'intention de l'utilisateur dans ce message et répondez au format JSON avec la structure:
                      { 
                        "primaryIntent": "intention principale",
                        "secondaryIntents": ["intention secondaire 1", "intention secondaire 2"],
                        "entities": { "entité1": "valeur1", "entité2": "valeur2" },
                        "recommendedScenario": "nom du scénario recommandé"
                      }`;
    
    // Ajouter les scénarios disponibles s'ils existent
    if (company && company.voiceAssistant && company.voiceAssistant.prompts && company.voiceAssistant.prompts.scenarios) {
      intentPrompt += `\n\nScénarios disponibles:`;
      company.voiceAssistant.prompts.scenarios.forEach(scenario => {
        intentPrompt += `\n- ${scenario.name}: ${scenario.description || 'Pas de description'}`;
        if (scenario.triggers && scenario.triggers.length > 0) {
          intentPrompt += ` (déclencheurs: ${scenario.triggers.join(', ')})`;
        }
      });
    }
    
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: intentPrompt
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: 300,
      temperature: 0.2,
    });

    const response = completion.choices[0].message.content;
    try {
      const intent = JSON.parse(response);
      logger.info(`Analyse d'intention effectuée: ${intent.primaryIntent}`);
      return intent;
    } catch (parseError) {
      logger.error('Erreur lors du parsing de l\'analyse d\'intention:', parseError);
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
      recommendedScenario: null
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
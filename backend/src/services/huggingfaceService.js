const { HfInference } = require('@huggingface/inference');
const logger = require('../utils/logger');
const conversationService = require('./conversationService');
const mongoose = require('mongoose');

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
 * Construire les instructions système basées sur une configuration de conversation
 * @param {Object} conversationConfig - Configuration de conversation
 * @param {Object} pdfContext - Contexte extrait des PDFs
 * @param {Object} providedVariables - Variables fournies par l'utilisateur
 * @returns {string} - Instructions système complètes
 */
const buildConfigBasedInstructions = async (conversationConfig, pdfContext = null, providedVariables = {}) => {
  if (!conversationConfig) {
    return "Vous êtes un assistant IA professionnel qui aide les utilisateurs.";
  }
  
  try {
    // Utiliser la nouvelle méthode generateSystemPrompt pour générer un prompt adapté
    // en fonction du type de conversation, de l'industrie, du niveau de formalité, etc.
    let systemPrompt = conversationConfig.generateSystemPrompt();
    
    // Enrichir avec les variables disponibles
    systemPrompt = conversationConfig.enrichPromptWithVariables(systemPrompt, providedVariables);
    
    // Ajouter les paramètres de contexte
    if (conversationConfig.contextParameters && Object.keys(conversationConfig.contextParameters).length > 0) {
      systemPrompt += "\n\nContexte spécifique:";
      for (const [key, value] of Object.entries(conversationConfig.contextParameters)) {
        systemPrompt += `\n- ${key}: ${value}`;
      }
    }
    
    // Ajouter les informations de l'entreprise si disponibles
    const company = await conversationConfig.getCompany();
    if (company && company.voiceAssistant && company.voiceAssistant.companyInfo) {
      const info = company.voiceAssistant.companyInfo;
      
      systemPrompt += `\n\nInformations sur ${company.name}:`;
      
      // Ajouter les produits
      if (info.products && info.products.length > 0) {
        systemPrompt += `\n\nProduits:\n- ${info.products.join('\n- ')}`;
      }
      
      // Ajouter les services
      if (info.services && info.services.length > 0) {
        systemPrompt += `\n\nServices:\n- ${info.services.join('\n- ')}`;
      }
      
      // Ajouter la FAQ (limité à 3 éléments pour éviter les prompts trop longs)
      if (info.faq && info.faq.length > 0) {
        systemPrompt += '\n\nQuestions fréquentes:';
        info.faq.slice(0, 3).forEach(item => {
          systemPrompt += `\nQ: ${item.question}\nR: ${item.answer}`;
        });
        
        if (info.faq.length > 3) {
          systemPrompt += `\n... (${info.faq.length - 3} questions supplémentaires disponibles)`;
        }
      }
    }
    
    // Ajouter le contenu des PDFs si disponible
    if (pdfContext && Array.isArray(pdfContext) && pdfContext.length > 0) {
      systemPrompt += "\n\nInformations supplémentaires issues des documents fournis:";
      
      // Limiter la taille du contenu PDF
      let pdfContentText = "";
      const maxPdfContentLength = 5000;
      
      pdfContext.forEach(pdf => {
        pdfContentText += `\n\nDocument: ${pdf.documentName}\n`;
        
        if (pdf.data && pdf.data.chunks && pdf.data.chunks.length > 0) {
          const availableChunks = pdf.data.chunks.slice(0, 3);
          availableChunks.forEach(chunk => {
            pdfContentText += chunk + "\n";
          });
          
          if (pdf.data.chunks.length > availableChunks.length) {
            pdfContentText += `\n[Document tronqué - ${pdf.data.chunks.length - availableChunks.length} sections supplémentaires]`;
          }
        }
      });
      
      if (pdfContentText.length > maxPdfContentLength) {
        pdfContentText = pdfContentText.substring(0, maxPdfContentLength) + "...\n[Contenu tronqué pour respecter les limites de tokens]";
      }
      
      systemPrompt += pdfContentText;
      
      // Ajouter les instructions spécifiques pour l'utilisation des données PDF
      const pdfInstructions = conversationConfig.aiSettings?.pdfInstructions ||
        "Utilisez ces informations pour répondre aux questions de l'utilisateur. Si les informations ne sont pas suffisantes ou pertinentes, vous pouvez répondre en fonction de vos connaissances générales, mais privilégiez toujours les informations fournies dans le contexte ci-dessus.";
      
      systemPrompt += `\n\n${pdfInstructions}`;
    }
    
    // Ajouter des instructions spécifiques pour chaque industrie si applicable
    if (conversationConfig.industryType && conversationConfig.industryType !== 'general') {
      systemPrompt += `\n\nInstructions spécifiques au secteur ${conversationConfig.industryType}:\n`;
      
      switch (conversationConfig.industryType) {
        case 'healthcare':
          systemPrompt += "- Respectez la confidentialité des informations médicales\n";
          systemPrompt += "- Précisez que vos réponses ne remplacent pas un avis médical professionnel\n";
          systemPrompt += "- Employez un vocabulaire accessible tout en restant précis";
          break;
        case 'finance':
          systemPrompt += "- Indiquez clairement qu'il s'agit d'informations générales et non de conseils financiers personnalisés\n";
          systemPrompt += "- Restez neutre dans vos explications des produits financiers\n";
          systemPrompt += "- Soyez précis concernant les informations réglementaires";
          break;
        case 'legal':
          systemPrompt += "- Précisez que vos réponses ne constituent pas un avis juridique\n";
          systemPrompt += "- Restez factuel et évitez d'interpréter les lois\n";
          systemPrompt += "- Suggérez de consulter un professionnel du droit pour des questions spécifiques";
          break;
        case 'technology':
          systemPrompt += "- Adaptez le niveau technique selon le contexte\n";
          systemPrompt += "- Expliquez les concepts complexes de manière accessible\n";
          systemPrompt += "- Restez à jour dans vos références technologiques";
          break;
        case 'education':
          systemPrompt += "- Adoptez une approche pédagogique et structurée\n";
          systemPrompt += "- Encouragez la réflexion critique et l'apprentissage\n";
          systemPrompt += "- Adaptez votre niveau de langage au public cible";
          break;
        // D'autres industries peuvent être ajoutées selon les besoins
      }
    }
    
    // Ajouter des instructions sur le niveau de formalité si défini
    if (conversationConfig.formalityLevel) {
      systemPrompt += `\n\nTon et style: Adoptez un ton ${conversationConfig.formalityLevel} dans vos réponses.`;
    }
    
    return systemPrompt;
  } catch (error) {
    logger.error(`Erreur lors de la génération des instructions basées sur la configuration: ${error.message}`);
    return "Vous êtes un assistant IA professionnel qui aide les utilisateurs.";
  }
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
 * Nettoyer la réponse générée pour obtenir uniquement le contenu de la réponse
 * @param {string} generatedText - Texte brut généré par le modèle
 * @returns {string} - Réponse nettoyée
 */
const cleanGeneratedResponse = (generatedText) => {
  // Si le texte est vide, renvoyer une chaîne vide
  if (!generatedText) return '';
  
  // Supprimer tout préfixe comme "Assistant:" qui pourrait être dans la réponse
  let cleanedText = generatedText.trim();
  
  // Supprimer "Assistant:" au début s'il existe
  cleanedText = cleanedText.replace(/^Assistant\s*:\s*/i, '');
  
  // Garder uniquement la première réponse (avant tout nouveau "Utilisateur:")
  const userPattern = /\n\s*utilisateur\s*:/i;
  if (userPattern.test(cleanedText)) {
    cleanedText = cleanedText.split(userPattern)[0].trim();
  }
  
  // Supprimer les balises d'action s'il y en a
  cleanedText = cleanedText.replace(/\[ACTION:[^\]]+\]/g, '');
  
  // Supprimer les préfixes de dialogue potentiels
  cleanedText = cleanedText.replace(/^(- )?(utilisateur|assistant)\s*:\s*/gi, '');
  
  // Nettoyer les sauts de ligne multiples
  cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n');
  
  return cleanedText.trim();
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
        
        // Vérifier si le scénario fait référence à une configuration de conversation
        const scenario = company.voiceAssistant.prompts.scenarios.find(s => s.name === scenarioName);
        if (scenario && scenario.conversationConfigId) {
          // Essayer de récupérer la configuration de conversation
          const ConversationConfig = require('../models/ConversationConfig');
          const conversationConfig = await ConversationConfig.findById(scenario.conversationConfigId);
          
          if (conversationConfig) {
            // Préparer le contexte avec les données PDF
            const conversationContext = await conversationService.getConversationContext(conversationConfig._id);
            
            // Remplacer les instructions système par celles basées sur la configuration
            messages[0].content = await buildConfigBasedInstructions(
              conversationConfig, 
              conversationContext.pdfContent, 
              baseVariables
            );
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
    
    // Ajout d'instructions pour obtenir une réponse directe
    let enhancedPrompt = formattedPrompt;

    // Si c'est le premier message (pas d'historique), on demande une réponse plus concise et directe
    if (!context.history || context.history.length === 0) {
      enhancedPrompt += ' Répondez directement à la question de manière concise, en une seule réponse. Ne simulez pas un dialogue. Ne posez pas de questions à l\'utilisateur.';
    } else {
      // S'il y a un historique, c'est une conversation en cours, on peut être plus naturel
      enhancedPrompt += ' Continuez cette conversation de manière cohérente avec l\'historique. Soyez conversationnel mais concis.';
    }

    // Appeler l'API Hugging Face
    logger.info(`Envoi de la requête à Hugging Face avec le modèle: ${process.env.HUGGINGFACE_MODEL || DEFAULT_MODEL}`);
    
    // Ajuster les paramètres en fonction du contexte
    let maxTokens = 150;
    if (context.history && context.history.length > 0) {
      maxTokens = 200; // Réponses plus longues si conversation
    }

    const response = await hf.textGeneration({
      model: process.env.HUGGINGFACE_MODEL || DEFAULT_MODEL,
      inputs: enhancedPrompt,
      parameters: {
        max_new_tokens: maxTokens,
        temperature: 0.5,
        top_p: 0.9,
        do_sample: true,
        return_full_text: false
      }
    });

    // Nettoyer la réponse pour obtenir uniquement le contenu pertinent
    const responseText = cleanGeneratedResponse(response.generated_text);
    
    logger.info(`Réponse générée pour ${company.name}: ${responseText.substring(0, 100)}...`);
    
    // Détecter les actions dans la réponse (si présentes)
    const actionMatches = responseText.match(/\[ACTION:([^\]]+)\]/g);
    const detectedActions = [];
    
    if (actionMatches) {
      actionMatches.forEach(match => {
        const actionName = match.replace('[ACTION:', '').replace(']', '').trim();
        detectedActions.push(actionName);
      });
    }
    
    // Nettoyer la réponse en enlevant les tags d'action
    const cleanResponse = responseText.replace(/\[ACTION:[^\]]+\]/g, '').trim();
    
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
 * Générer une réponse en utilisant une configuration de conversation spécifique
 * @param {string} userInput - Texte de l'utilisateur
 * @param {string|Object} configOrId - ID de configuration ou objet configuration
 * @param {Object} context - Contexte de la conversation (historique, variables, etc.)
 * @returns {Promise<Object>} - Réponse générée
 */
const generateResponseWithConfig = async (userInput, configOrId, context = {}) => {
  try {
    if (!userInput) {
      return { response: '', error: 'Aucun texte fourni' };
    }
    
    // Vérifier si l'API est configurée
    if (!HUGGINGFACE_API_CONFIGURED || !hf) {
      logger.warn('API Hugging Face non configurée. Utilisation du mode secours.');
      return {
        response: "Je ne peux pas traiter votre demande pour le moment. Le service est temporairement indisponible.",
        fallback: true
      };
    }
    
    // Récupérer la configuration de conversation
    let conversationConfig;
    if (typeof configOrId === 'string') {
      const ConversationConfig = require('../models/ConversationConfig');
      conversationConfig = await ConversationConfig.findById(configOrId);
      if (!conversationConfig) {
        return { response: '', error: 'Configuration non trouvée' };
      }
    } else {
      conversationConfig = configOrId;
    }
    
    // Initialiser le contexte de conversation en utilisant notre service
    const conversationContext = await conversationService.initializeConversation(
      conversationConfig._id,
      context.variables || {}
    );
    
    // Valider les variables requises
    if (context.variables) {
      const validation = conversationConfig.validateVariables(context.variables);
      if (validation !== true) {
        return { 
          response: `Informations manquantes: ${validation.missing.join(', ')}`, 
          error: 'Variables requises manquantes',
          missingVariables: validation.missing
        };
      }
    }
    
    // Préparer le contexte pour l'IA en utilisant notre service
    const aiContext = conversationService.prepareAIContext(conversationContext);
    
    const messages = [
      {
        role: 'system',
        content: aiContext.systemPrompt
      }
    ];
    
    // Ajouter l'historique de conversation si disponible
    if (context.history && Array.isArray(context.history)) {
      messages.push(...context.history);
    }
    
    // Ajouter la requête actuelle de l'utilisateur
    messages.push({
      role: 'user',
      content: userInput
    });
    
    // Formater pour Hugging Face
    const formattedPrompt = formatMessagesForHuggingFace(messages);
    
    // Paramètres pour la génération
    const temperature = conversationConfig.aiSettings?.temperature || 0.5;
    const modelId = conversationConfig.aiSettings?.modelId || process.env.HUGGINGFACE_MODEL || DEFAULT_MODEL;
    
    // Ajuster les maxTokens en fonction du type de conversation
    let maxTokens = 150;
    
    // Ajuster la longueur de réponse en fonction du type de conversation
    switch (conversationConfig.conversationType) {
      case 'technical_support':
      case 'financial_advice':
      case 'medical_assistance':
      case 'legal_assistance':
      case 'tutorial':
        // Ces types nécessitent généralement des réponses plus détaillées
        maxTokens = 250;
        break;
      case 'faq':
      case 'information':
        // Réponses informatives de taille moyenne
        maxTokens = 200;
        break;
      case 'lead_generation':
      case 'sales':
        // Réponses commerciales persuasives mais concises
        maxTokens = 180;
        break;
      default:
        // Comportement par défaut
        maxTokens = context.history && context.history.length > 0 ? 200 : 150;
    }
    
    // Ajuster en fonction du style de communication si défini
    if (conversationConfig.aiSettings?.communicationStyle) {
      switch (conversationConfig.aiSettings.communicationStyle) {
        case 'concise':
          maxTokens = Math.min(maxTokens, 120);
          break;
        case 'detailed':
          maxTokens = Math.max(maxTokens, 250);
          break;
      }
    }
    
    logger.info(`Génération avec config ${conversationConfig.name}, modèle: ${modelId}, type: ${conversationConfig.conversationType}`);
    
    // Inclure des données contextuelles dans les logs
    if (conversationConfig.industryType) {
      logger.info(`Contexte: industrie ${conversationConfig.industryType}, formalité ${conversationConfig.formalityLevel || 'standard'}`);
    }
    
    const response = await hf.textGeneration({
      model: modelId,
      inputs: formattedPrompt,
      parameters: {
        max_new_tokens: maxTokens,
        temperature: temperature,
        top_p: 0.9,
        do_sample: true,
        return_full_text: false,
        ...conversationConfig.aiSettings?.additionalParams
      }
    });
    
    // Nettoyer la réponse
    const responseText = cleanGeneratedResponse(response.generated_text);
    
    return {
      response: responseText,
      config: conversationConfig.name,
      model: modelId,
      conversationType: conversationConfig.conversationType,
      industryType: conversationConfig.industryType || 'general'
    };
  } catch (error) {
    logger.error('Erreur lors de la génération de réponse avec configuration:', error);
    return {
      response: "Je suis désolé, une erreur s'est produite lors du traitement de votre demande.",
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
  "recommendedScenario": "nom du scénario recommandé",
  "recommendedConversationType": "type de conversation recommandé"
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
    
    // Ajouter les types de conversations disponibles dans ConversationConfig
    try {
      const ConversationConfig = mongoose.model('ConversationConfig');
      const schema = ConversationConfig.schema;
      const conversationTypes = schema.path('conversationType').enumValues;
      
      if (conversationTypes && conversationTypes.length > 0) {
        prompt += `\n\nTypes de conversations disponibles:`;
        
        // Regrouper les types par catégorie pour une meilleure lisibilité
        const typesByCategory = {
          'Commerciaux': conversationTypes.filter(type => 
            ['sales', 'lead_generation', 'product_demo', 'pricing_inquiry', 'upsell', 'cross_sell', 'retention', 'win_back'].includes(type)
          ),
          'Support': conversationTypes.filter(type => 
            ['support', 'technical_support', 'billing_support', 'product_issue', 'returns', 'complaint_handling', 'feature_request'].includes(type)
          ),
          'RH': conversationTypes.filter(type => 
            ['recruitment', 'onboarding', 'training', 'employee_feedback', 'performance_review', 'exit_interview'].includes(type)
          ),
          'Marketing': conversationTypes.filter(type => 
            ['market_research', 'campaign_feedback', 'product_feedback', 'survey', 'newsletter_subscription'].includes(type)
          ),
          'Légal': conversationTypes.filter(type => 
            ['legal_assistance', 'compliance_check', 'data_request', 'privacy_concern'].includes(type)
          ),
          'Éducation': conversationTypes.filter(type => 
            ['course_information', 'enrollment_assistance', 'mentoring', 'tutoring', 'assignment_help'].includes(type)
          ),
          'Finance': conversationTypes.filter(type => 
            ['financial_advice', 'loan_inquiry', 'investment_guidance', 'insurance_assistance', 'tax_help'].includes(type)
          ),
          'Santé': conversationTypes.filter(type => 
            ['medical_assistance', 'appointment_scheduling', 'prescription_renewal', 'health_guidance'].includes(type)
          ),
          'Général': conversationTypes.filter(type => 
            ['information', 'custom', 'faq', 'general_inquiry', 'feedback', 'event_registration', 'partnership_inquiry'].includes(type)
          )
        };
        
        // Ajouter chaque catégorie au prompt
        Object.entries(typesByCategory).forEach(([category, types]) => {
          if (types.length > 0) {
            prompt += `\n- ${category}: ${types.join(', ')}`;
          }
        });
        
        // Demander d'inclure un type de conversation recommandé basé sur le message
        prompt += `\n\nVeuillez recommander à la fois un scénario et un type de conversation qui correspondent le mieux à l'intention de l'utilisateur.`;
      }
    } catch (error) {
      logger.error('Erreur lors de la récupération des types de conversation:', error);
    }
    
    // Ajouter les configurations de conversation disponibles
    if (company && company.conversationConfigs && company.conversationConfigs.length > 0) {
      try {
        const ConversationConfig = require('../models/ConversationConfig');
        const configs = await ConversationConfig.find({
          _id: { $in: company.conversationConfigs },
          active: true
        }).select('name description conversationType industryType');
        
        if (configs && configs.length > 0) {
          prompt += `\n\nConfigurations de conversation disponibles:`;
          configs.forEach(config => {
            prompt += `\n- ${config.name} (type: ${config.conversationType}, industrie: ${config.industryType || 'général'}): ${config.description || 'Pas de description'}`;
          });
          
          // Demander de recommander une configuration si pertinent
          prompt += `\n\nEn plus du scénario et du type, veuillez recommander une configuration de conversation appropriée en ajoutant "recommendedConfig": "nom de la configuration" dans le JSON.`;
        }
      } catch (configError) {
        logger.error('Erreur lors de la récupération des configurations:', configError);
      }
    }
    
    prompt += `\n\nUtilisateur: ${text}\nAssistant:`;
    
    const response = await hf.textGeneration({
      model: process.env.HUGGINGFACE_MODEL || DEFAULT_MODEL,
      inputs: prompt,
      parameters: {
        max_new_tokens: 400,
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
        logger.info(`Analyse d'intention effectuée: ${intent.primaryIntent}, type recommandé: ${intent.recommendedConversationType || 'non spécifié'}`);
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
        recommendedScenario: null,
        recommendedConversationType: null
      };
    }
  } catch (error) {
    logger.error('Erreur lors de l\'analyse d\'intention:', error);
    return { 
      primaryIntent: "unknown", 
      secondaryIntents: [], 
      entities: {},
      recommendedScenario: null,
      recommendedConversationType: null,
      error: error.message
    };
  }
};

module.exports = {
  generateResponse,
  generateResponseWithConfig,
  needsHumanTransfer,
  analyzeSentiment,
  detectIntent,
  processPrompt,
  buildConfigBasedInstructions
};
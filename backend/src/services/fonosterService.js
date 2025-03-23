const { Auth, VoiceServer, CreateVoiceAppOptions } = require('@fonoster/sdk');
const logger = require('../utils/logger');
const voiceService = require('./voiceService');

let fonosterClient = null;
let voiceServer = null;

// Initialisation du client Fonoster
const initFonoster = async () => {
  try {
    if (process.env.FONOSTER_API_KEY) {
      // Authentification avec API Key
      fonosterClient = await Auth.withApiKey(process.env.FONOSTER_API_KEY);
      voiceServer = new VoiceServer(fonosterClient);
      logger.info('Client Fonoster initialisé avec API Key');
      return fonosterClient;
    } else if (process.env.FONOSTER_USERNAME && process.env.FONOSTER_PASSWORD) {
      // Authentification avec identifiants
      fonosterClient = await Auth.withCredentials(
        process.env.FONOSTER_USERNAME,
        process.env.FONOSTER_PASSWORD
      );
      voiceServer = new VoiceServer(fonosterClient);
      logger.info('Client Fonoster initialisé avec identifiants');
      return fonosterClient;
    } else {
      logger.warn('Identifiants Fonoster non configurés. Les fonctionnalités vocales ne seront pas disponibles.');
      return null;
    }
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation du client Fonoster:', error);
    throw error;
  }
};

/**
 * Créer une application vocale
 * @param {Object} options - Options pour l'application vocale
 * @returns {Promise<Object>} - Informations sur l'application créée
 */
const createVoiceApp = async (options = {}) => {
  if (!fonosterClient) {
    await initFonoster();
    if (!fonosterClient) {
      throw new Error('Client Fonoster non initialisé. Vérifiez vos identifiants.');
    }
  }
  
  try {
    const appOptions = new CreateVoiceAppOptions();
    appOptions.setName(options.name || 'Lydia Assistant Vocal');
    appOptions.setWebhookUrl(options.webhookUrl || process.env.WEBHOOK_URL);
    appOptions.setVoiceUrl(options.voiceUrl || process.env.VOICE_URL);
    
    const app = await voiceServer.createVoiceApp(appOptions);
    logger.info(`Nouvelle application vocale créée: ${app.getName()}`);
    return app;
  } catch (error) {
    logger.error('Erreur lors de la création de l\'application vocale:', error);
    throw error;
  }
};

/**
 * Récupérer un numéro de téléphone
 * @param {Object} options - Options pour le numéro
 * @returns {Promise<Object>} - Informations sur le numéro obtenu
 */
const getPhoneNumber = async (options = {}) => {
  if (!fonosterClient) {
    await initFonoster();
    if (!fonosterClient) {
      throw new Error('Client Fonoster non initialisé. Vérifiez vos identifiants.');
    }
  }
  
  try {
    // Dans Fonoster, on utilise généralement des numéros SIP plutôt que des numéros physiques
    // Si besoin, on peut aussi intégrer avec des fournisseurs comme Numberify
    
    // Pour l'exemple, nous retournons un objet simulant un numéro
    return {
      phoneNumber: options.phoneNumber || 'sip:voiceapp@fonoster.io',
      applicationId: options.appId,
      friendlyName: options.friendlyName || 'Lydia Assistant Vocal'
    };
  } catch (error) {
    logger.error('Erreur lors de l\'obtention du numéro:', error);
    throw error;
  }
};

/**
 * Configurer un webhook pour une application vocale
 * @param {string} appId - ID de l'application vocale
 * @param {string} webhookUrl - URL du webhook pour les appels entrants
 * @returns {Promise<Object>} - Informations sur l'application mise à jour
 */
const configureWebhook = async (appId, webhookUrl) => {
  if (!fonosterClient) {
    await initFonoster();
    if (!fonosterClient) {
      throw new Error('Client Fonoster non initialisé. Vérifiez vos identifiants.');
    }
  }
  
  try {
    // Mettre à jour le webhook de l'application
    const app = await voiceServer.getVoiceApp(appId);
    const options = new CreateVoiceAppOptions();
    
    options.setName(app.getName());
    options.setWebhookUrl(webhookUrl);
    options.setVoiceUrl(app.getVoiceUrl());
    
    const updatedApp = await voiceServer.updateVoiceApp(appId, options);
    logger.info(`Webhook configuré pour ${updatedApp.getName()}: ${webhookUrl}`);
    return updatedApp;
  } catch (error) {
    logger.error('Erreur lors de la configuration du webhook:', error);
    throw error;
  }
};

/**
 * Générer une réponse vocale pour un appel entrant
 * @param {string} message - Message à dire à l'appelant
 * @param {Object} options - Options supplémentaires
 * @param {Object} company - Objet entreprise (optionnel)
 * @returns {Object} - Réponse compatible avec l'API de Fonoster
 */
const generateVoiceResponse = async (message, options = {}, company = null) => {
  // Si l'entreprise est fournie et utilise Fish Audio, générer l'audio avec ce service
  if (company && company.voiceAssistant && company.voiceAssistant.voice && 
      company.voiceAssistant.voice.provider === 'fishaudio') {
    try {
      // Générer le fichier audio avec Fish Audio
      const audioFilePath = await voiceService.generateAudio(message, company.voiceAssistant.voice);
      
      // Fonoster utilise un format JSON pour définir ses réponses vocales avec un fichier audio
      const response = {
        play: {
          url: audioFilePath
        }
      };
      
      // Si on doit collecter des informations de l'utilisateur
      if (options.gather) {
        response.gather = {
          timeout: options.gather.timeout || 5,
          finishOnKey: options.gather.finishOnKey || '#',
          numDigits: options.gather.numDigits,
          hints: options.gather.hints || [],
          speechTimeout: options.gather.speechTimeout || 'auto',
          action: options.gather.action
        };
        
        if (options.gather.prompt) {
          // Générer le fichier audio pour le prompt
          const promptAudioPath = await voiceService.generateAudio(
            options.gather.prompt, 
            company.voiceAssistant.voice
          );
          
          response.gather.play = {
            url: promptAudioPath
          };
        }
      }
      
      // Si on doit rediriger vers un humain
      if (options.redirect) {
        response.dial = {
          calleeNumber: options.redirect
        };
      }
      
      return response;
    } catch (error) {
      logger.error('Erreur lors de la génération audio avec Fish Audio, fallback sur Fonoster:', error);
      // En cas d'erreur, on revient au comportement par défaut de Fonoster
    }
  }
  
  // Comportement par défaut avec Fonoster
  const response = {
    say: {
      text: message,
      voice: options.voice || 'female',
      language: options.language || 'fr-FR'
    }
  };

  // Si on doit collecter des informations de l'utilisateur
  if (options.gather) {
    response.gather = {
      timeout: options.gather.timeout || 5,
      finishOnKey: options.gather.finishOnKey || '#',
      numDigits: options.gather.numDigits,
      hints: options.gather.hints || [],
      speechTimeout: options.gather.speechTimeout || 'auto',
      action: options.gather.action
    };
    
    if (options.gather.prompt) {
      response.gather.say = {
        text: options.gather.prompt,
        voice: options.voice || 'female',
        language: options.language || 'fr-FR'
      };
    }
  }

  // Si on doit rediriger vers un humain
  if (options.redirect) {
    response.dial = {
      calleeNumber: options.redirect
    };
  }

  return response;
};

/**
 * Initier un appel sortant
 * @param {string} to - Numéro de téléphone à appeler
 * @param {string} from - Numéro de téléphone source
 * @param {string} webhookUrl - URL du webhook pour gérer l'appel
 * @returns {Promise<Object>} - Informations sur l'appel
 */
const makeOutboundCall = async (to, from, webhookUrl) => {
  if (!fonosterClient) {
    await initFonoster();
    if (!fonosterClient) {
      throw new Error('Client Fonoster non initialisé. Vérifiez vos identifiants.');
    }
  }
  
  try {
    // Créer une requête d'appel
    const callRequest = {
      from: from,
      to: to,
      webhook: webhookUrl
    };
    
    const call = await voiceServer.call(callRequest);
    logger.info(`Appel sortant initié vers ${to} depuis ${from}`);
    return call;
  } catch (error) {
    logger.error('Erreur lors de l\'initiation de l\'appel sortant:', error);
    throw error;
  }
};

/**
 * Simuler la récupération de numéros disponibles
 * @param {Object} options - Options de recherche
 * @returns {Promise<Array>} - Liste des numéros disponibles simulés
 */
const getAvailableNumbers = async (options = {}) => {
  // Simuler un délai de réseau
  await new Promise(resolve => setTimeout(resolve, 500));

  // Générer des numéros simulés en fonction du pays
  const countryCode = options.country === 'FR' ? '+33' :
                     options.country === 'BE' ? '+32' :
                     options.country === 'CH' ? '+41' :
                     options.country === 'US' ? '+1' :
                     options.country === 'CA' ? '+1' : '+33';
  
  // Générer des numéros basés sur l'indicatif régional si fourni
  const areaPrefix = options.areaCode || '';
  
  // Simuler 5 numéros disponibles
  const numbers = [];
  for (let i = 0; i < 5; i++) {
    // Générer un numéro aléatoire à 6 chiffres
    const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
    
    let formattedNumber;
    if (countryCode === '+33') {
      // Format français: +33 1 XX XX XX
      const prefix = areaPrefix || ['1', '2', '3', '4', '5', '6', '7', '9'][Math.floor(Math.random() * 8)];
      formattedNumber = `${countryCode} ${prefix} ${randomSuffix.substring(0, 2)} ${randomSuffix.substring(2, 4)} ${randomSuffix.substring(4, 6)}`;
    } else {
      // Format générique
      formattedNumber = `${countryCode} ${areaPrefix}${randomSuffix}`;
    }
    
    numbers.push({
      phoneNumber: formattedNumber.replace(/\s+/g, ''), // Version sans espaces pour l'API
      friendly_name: formattedNumber, // Version avec espaces pour l'affichage
      location: options.country === 'FR' ? 'France' :
               options.country === 'BE' ? 'Belgique' :
               options.country === 'CH' ? 'Suisse' :
               options.country === 'US' ? 'États-Unis' :
               options.country === 'CA' ? 'Canada' : 'International',
      capabilities: {
        voice: true,
        sms: true,
        mms: false
      }
    });
  }
  
  return numbers;
};

// Initialiser le client au démarrage
(async () => {
  try {
    await initFonoster();
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation automatique de Fonoster:', error);
  }
})();

module.exports = {
  client: fonosterClient,
  voiceServer,
  initFonoster,
  createVoiceApp,
  getPhoneNumber,
  configureWebhook,
  generateVoiceResponse,
  makeOutboundCall,
  getAvailableNumbers
}; 
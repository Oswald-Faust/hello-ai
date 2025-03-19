const { Auth, VoiceServer, CreateVoiceAppOptions } = require('@fonoster/sdk');
const logger = require('../utils/logger');

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
 * @returns {Object} - Réponse compatible avec l'API de Fonoster
 */
const generateVoiceResponse = (message, options = {}) => {
  // Fonoster utilise un format JSON pour définir ses réponses vocales
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
  makeOutboundCall
}; 
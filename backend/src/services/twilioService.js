const twilio = require('twilio');
const logger = require('../utils/logger');

// Initialisation du client Twilio seulement si les identifiants sont disponibles
let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
} else {
  logger.warn('Identifiants Twilio non configurés. Les fonctionnalités Twilio ne seront pas disponibles.');
}

/**
 * Acheter un nouveau numéro de téléphone virtuel
 * @param {Object} options - Options pour l'achat du numéro
 * @param {string} options.areaCode - Code régional souhaité
 * @param {string} options.country - Code pays (par défaut 'FR')
 * @returns {Promise<Object>} - Informations sur le numéro acheté
 */
const purchasePhoneNumber = async (options = {}) => {
  if (!client) {
    throw new Error('Client Twilio non initialisé. Vérifiez vos identifiants.');
  }
  
  try {
    const availableNumbers = await client.availablePhoneNumbers(options.country || 'FR')
      .local
      .list({
        areaCode: options.areaCode,
        limit: 1
      });

    if (availableNumbers.length === 0) {
      throw new Error('Aucun numéro disponible avec les critères spécifiés');
    }

    const number = await client.incomingPhoneNumbers.create({
      phoneNumber: availableNumbers[0].phoneNumber,
      friendlyName: options.friendlyName || 'Lydia Assistant Vocal'
    });

    logger.info(`Nouveau numéro acheté: ${number.phoneNumber}`);
    return number;
  } catch (error) {
    logger.error('Erreur lors de l\'achat du numéro:', error);
    throw error;
  }
};

/**
 * Configurer un webhook pour un numéro de téléphone
 * @param {string} phoneNumberSid - SID du numéro de téléphone
 * @param {string} webhookUrl - URL du webhook pour les appels entrants
 * @returns {Promise<Object>} - Informations sur le numéro mis à jour
 */
const configureWebhook = async (phoneNumberSid, webhookUrl) => {
  if (!client) {
    throw new Error('Client Twilio non initialisé. Vérifiez vos identifiants.');
  }
  
  try {
    const updatedNumber = await client.incomingPhoneNumbers(phoneNumberSid)
      .update({
        voiceUrl: webhookUrl,
        statusCallback: `${webhookUrl.split('?')[0].replace(/\/incoming.*$/, '/twilio-status')}`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST'
      });

    logger.info(`Webhook configuré pour ${updatedNumber.phoneNumber}: ${webhookUrl}`);
    return updatedNumber;
  } catch (error) {
    logger.error('Erreur lors de la configuration du webhook:', error);
    throw error;
  }
};

/**
 * Générer une réponse TwiML pour un appel entrant
 * @param {string} message - Message à dire à l'appelant
 * @param {Object} options - Options supplémentaires
 * @returns {string} - Réponse TwiML
 */
const generateTwiMLResponse = (message, options = {}) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  // Ajouter un message vocal
  const say = response.say({
    voice: options.voice || 'Polly.Léa',
    language: options.language || 'fr-FR'
  });
  say.addText(message);

  // Si on doit collecter des informations de l'utilisateur
  if (options.gather) {
    const gather = response.gather({
      input: options.gather.input || 'speech',
      language: options.gather.language || 'fr-FR',
      action: options.gather.action,
      method: options.gather.method || 'POST',
      speechTimeout: options.gather.speechTimeout || 'auto',
      speechModel: options.gather.speechModel || 'phone_call'
    });
    
    const gatherSay = gather.say({
      voice: options.voice || 'Polly.Léa',
      language: options.language || 'fr-FR'
    });
    gatherSay.addText(options.gather.prompt);
  }

  // Si on doit rediriger vers un humain
  if (options.redirect) {
    response.dial(options.redirect);
  }

  return response.toString();
};

/**
 * Initier un appel sortant
 * @param {string} to - Numéro de téléphone à appeler
 * @param {string} from - Numéro de téléphone source
 * @param {string} webhookUrl - URL du webhook pour gérer l'appel
 * @returns {Promise<Object>} - Informations sur l'appel
 */
const makeOutboundCall = async (to, from, webhookUrl) => {
  if (!client) {
    throw new Error('Client Twilio non initialisé. Vérifiez vos identifiants.');
  }
  
  try {
    const call = await client.calls.create({
      to,
      from,
      url: webhookUrl
    });

    logger.info(`Appel sortant initié vers ${to} depuis ${from}`);
    return call;
  } catch (error) {
    logger.error('Erreur lors de l\'initiation de l\'appel sortant:', error);
    throw error;
  }
};

/**
 * Rechercher des numéros de téléphone disponibles
 * @param {Object} options - Options de recherche
 * @returns {Promise<Array>} - Liste des numéros disponibles
 */
const searchAvailableNumbers = async (options = {}) => {
  if (!client) {
    throw new Error('Client Twilio non initialisé. Vérifiez vos identifiants.');
  }
  
  try {
    const availableNumbers = await client.availablePhoneNumbers(options.country || 'FR')
      .local
      .list({
        areaCode: options.areaCode,
        limit: options.limit || 10
      });

    // Transformer en format standardisé
    return availableNumbers.map(number => ({
      phoneNumber: number.phoneNumber,
      friendly_name: number.friendlyName,
      location: number.locality || number.region,
      capabilities: {
        voice: number.capabilities.voice,
        sms: number.capabilities.sms,
        mms: number.capabilities.mms
      }
    }));
  } catch (error) {
    logger.error('Erreur lors de la recherche de numéros disponibles:', error);
    throw error;
  }
};

/**
 * Obtenir la tarification des numéros de téléphone par pays
 * @param {string} country - Code pays
 * @returns {Promise<Object>} - Informations de tarification
 */
const getPhoneNumberPricing = async (country = 'FR') => {
  if (!client) {
    throw new Error('Client Twilio non initialisé. Vérifiez vos identifiants.');
  }
  
  try {
    // Récupérer les informations de tarification
    const pricingInfo = await client.pricing.v2.phoneNumbers
      .countries(country)
      .fetch();
    
    // Formatter les résultats
    const pricing = {
      country: pricingInfo.country,
      countryName: pricingInfo.countryName,
      phoneNumberPrices: []
    };
    
    if (pricingInfo.phoneNumberPrices && pricingInfo.phoneNumberPrices.length > 0) {
      pricing.phoneNumberPrices = pricingInfo.phoneNumberPrices.map(price => ({
        type: price.type,
        basePrice: price.basePrice,
        currentPrice: price.currentPrice,
        currency: price.currency
      }));
    }
    
    return pricing;
  } catch (error) {
    logger.error('Erreur lors de la récupération des tarifs:', error);
    
    // En cas d'erreur ou si l'API de pricing n'est pas disponible, renvoyer des données par défaut
    return {
      country,
      countryName: country === 'FR' ? 'France' : 'Unknown',
      phoneNumberPrices: [
        {
          type: 'local',
          basePrice: '1.00',
          currentPrice: '1.00',
          currency: 'EUR'
        }
      ]
    };
  }
};

/**
 * Valider un numéro de téléphone
 * @param {string} phoneNumber - Numéro à valider
 * @returns {Promise<Object>} - Informations de validation
 */
const validatePhoneNumber = async (phoneNumber) => {
  if (!client) {
    throw new Error('Client Twilio non initialisé. Vérifiez vos identifiants.');
  }
  
  try {
    const validationResult = await client.lookups.v2
      .phoneNumbers(phoneNumber)
      .fetch({ fields: 'line_type_intelligence' });
    
    return {
      isValid: true,
      phoneNumber: validationResult.phoneNumber,
      countryCode: validationResult.countryCode,
      carrier: validationResult.carrier,
      type: validationResult.lineTypeIntelligence?.type
    };
  } catch (error) {
    logger.error('Erreur lors de la validation du numéro:', error);
    return {
      isValid: false,
      error: error.message
    };
  }
};

/**
 * Active l'enregistrement des appels pour un numéro
 * @param {string} phoneNumberSid - SID du numéro de téléphone
 * @param {string} recordingWebhookUrl - URL pour recevoir les enregistrements
 * @returns {Promise<Object>} - Informations sur le numéro mis à jour
 */
const enableCallRecording = async (phoneNumberSid, recordingWebhookUrl) => {
  if (!client) {
    throw new Error('Client Twilio non initialisé. Vérifiez vos identifiants.');
  }
  
  try {
    const updatedNumber = await client.incomingPhoneNumbers(phoneNumberSid)
      .update({
        voiceMethod: 'POST',
        recordingStatusCallback: recordingWebhookUrl,
        recordingStatusCallbackMethod: 'POST'
      });

    logger.info(`Enregistrement des appels activé pour ${updatedNumber.phoneNumber}`);
    return updatedNumber;
  } catch (error) {
    logger.error('Erreur lors de l\'activation de l\'enregistrement des appels:', error);
    throw error;
  }
};

module.exports = {
  client,
  purchasePhoneNumber,
  configureWebhook,
  generateTwiMLResponse,
  makeOutboundCall,
  searchAvailableNumbers,
  getPhoneNumberPricing,
  validatePhoneNumber,
  enableCallRecording
}; 
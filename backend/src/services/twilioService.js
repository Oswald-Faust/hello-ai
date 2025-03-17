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
        voiceUrl: webhookUrl
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

module.exports = {
  client,
  purchasePhoneNumber,
  configureWebhook,
  generateTwiMLResponse,
  makeOutboundCall
}; 
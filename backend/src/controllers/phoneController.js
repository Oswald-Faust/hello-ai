const twilioService = require('../services/twilioService');
const fonosterService = require('../services/fonosterService');
const logger = require('../utils/logger');
const { errorResponse, successResponse } = require('../utils/responseHandler');

/**
 * Récupérer des numéros de téléphone disponibles
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getAvailableNumbers = async (req, res) => {
  try {
    const { provider = 'fonoster', country = 'FR', areaCode } = req.query;
    
    let numbers = [];
    
    if (provider === 'twilio') {
      // Récupérer les numéros disponibles via Twilio
      numbers = await twilioService.searchAvailableNumbers({
        country,
        areaCode,
        limit: 10
      });
    } else if (provider === 'fonoster') {
      // Récupérer les numéros disponibles via Fonoster
      // Fonoster utilise un système différent, nous simulons la disponibilité
      numbers = await fonosterService.getAvailableNumbers({
        country,
        areaCode
      });
    } else {
      return errorResponse(res, 400, 'Fournisseur non supporté. Utilisez "fonoster" ou "twilio".');
    }
    
    return successResponse(res, 200, 'Numéros disponibles récupérés avec succès', { numbers });
  } catch (error) {
    logger.error('Erreur lors de la récupération des numéros disponibles:', error);
    return errorResponse(res, 500, 'Erreur lors de la récupération des numéros disponibles', error);
  }
};

/**
 * Récupérer les tarifs des numéros de téléphone
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getPhoneNumberPricing = async (req, res) => {
  try {
    const { provider = 'fonoster', country = 'FR' } = req.query;
    
    let pricing = {};
    
    if (provider === 'twilio') {
      // Récupérer les tarifs Twilio
      pricing = await twilioService.getPhoneNumberPricing(country);
    } else if (provider === 'fonoster') {
      // Récupérer les tarifs Fonoster (simulé)
      pricing = {
        purchase: '5.00 EUR',
        monthly: '3.00 EUR',
        perMinute: '0.015 EUR'
      };
    } else {
      return errorResponse(res, 400, 'Fournisseur non supporté. Utilisez "fonoster" ou "twilio".');
    }
    
    return successResponse(res, 200, 'Tarifs récupérés avec succès', { pricing });
  } catch (error) {
    logger.error('Erreur lors de la récupération des tarifs:', error);
    return errorResponse(res, 500, 'Erreur lors de la récupération des tarifs', error);
  }
};

/**
 * Valider un numéro de téléphone
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.validatePhoneNumber = async (req, res) => {
  try {
    const { phoneNumber, provider = 'fonoster' } = req.body;
    
    if (!phoneNumber) {
      return errorResponse(res, 400, 'Le numéro de téléphone est requis');
    }
    
    let validation = {};
    
    if (provider === 'twilio') {
      // Valider le numéro via Twilio
      validation = await twilioService.validatePhoneNumber(phoneNumber);
    } else if (provider === 'fonoster') {
      // Valider le numéro via Fonoster (simulé)
      validation = {
        isValid: /^\+\d{10,15}$/.test(phoneNumber),
        type: 'mobile',
        countryCode: phoneNumber.startsWith('+33') ? 'FR' : 'Unknown'
      };
    } else {
      return errorResponse(res, 400, 'Fournisseur non supporté. Utilisez "fonoster" ou "twilio".');
    }
    
    return successResponse(res, 200, 'Numéro validé avec succès', { validation });
  } catch (error) {
    logger.error('Erreur lors de la validation du numéro:', error);
    return errorResponse(res, 500, 'Erreur lors de la validation du numéro', error);
  }
}; 
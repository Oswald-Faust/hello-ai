const logger = require('../utils/logger');

/**
 * Middleware de gestion des erreurs
 * @param {Error} err - Erreur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
const errorHandler = (err, req, res, next) => {
  // Définir le statut de l'erreur
  const statusCode = err.status || 500;
  
  // Logger l'erreur
  logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  // Envoyer la réponse
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler; 
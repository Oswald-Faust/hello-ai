/**
 * Gestionnaire de réponses pour les API
 * Fournit des fonctions pour formater les réponses de manière cohérente
 */

/**
 * Envoie une réponse de succès
 * @param {Object} res - Objet de réponse Express
 * @param {Number} statusCode - Code de statut HTTP
 * @param {String} message - Message de succès
 * @param {Object} data - Données à renvoyer
 * @returns {Object} Réponse formatée
 */
exports.successResponse = (res, statusCode = 200, message = 'Opération réussie', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    status: statusCode,
    message,
    data
  });
};

/**
 * Envoie une réponse d'erreur
 * @param {Object} res - Objet de réponse Express
 * @param {Number} statusCode - Code de statut HTTP
 * @param {String} message - Message d'erreur
 * @param {Object} errors - Détails des erreurs
 * @returns {Object} Réponse formatée
 */
exports.errorResponse = (res, statusCode = 500, message = 'Une erreur est survenue', errors = null) => {
  return res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    errors
  });
};

/**
 * Envoie une réponse de validation d'erreur
 * @param {Object} res - Objet de réponse Express
 * @param {Object} errors - Erreurs de validation
 * @returns {Object} Réponse formatée
 */
exports.validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    status: 400,
    message: 'Erreur de validation',
    errors
  });
};

/**
 * Envoie une réponse d'erreur d'authentification
 * @param {Object} res - Objet de réponse Express
 * @param {String} message - Message d'erreur
 * @returns {Object} Réponse formatée
 */
exports.authErrorResponse = (res, message = 'Non autorisé') => {
  return res.status(401).json({
    success: false,
    status: 401,
    message
  });
};

/**
 * Envoie une réponse d'erreur d'autorisation
 * @param {Object} res - Objet de réponse Express
 * @param {String} message - Message d'erreur
 * @returns {Object} Réponse formatée
 */
exports.forbiddenResponse = (res, message = 'Accès interdit') => {
  return res.status(403).json({
    success: false,
    status: 403,
    message
  });
};

/**
 * Envoie une réponse pour ressource non trouvée
 * @param {Object} res - Objet de réponse Express
 * @param {String} message - Message d'erreur
 * @returns {Object} Réponse formatée
 */
exports.notFoundResponse = (res, message = 'Ressource non trouvée') => {
  return res.status(404).json({
    success: false,
    status: 404,
    message
  });
}; 
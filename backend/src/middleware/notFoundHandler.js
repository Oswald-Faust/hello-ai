/**
 * Middleware pour gérer les routes non trouvées
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

module.exports = notFoundHandler; 
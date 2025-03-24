const logger = require('../utils/logger');

/**
 * Middleware pour vérifier que l'utilisateur a un des rôles autorisés
 * @param {Array} roles - Tableau des rôles autorisés
 * @returns {Function} Middleware Express
 */
const roleMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        logger.warn(`[ROLE MIDDLEWARE] Tentative d'accès sans authentification`);
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }

      const userRole = req.user.role;
      
      if (!roles.includes(userRole)) {
        logger.warn(`[ROLE MIDDLEWARE] Accès refusé à l'utilisateur ${req.user.id} avec le rôle ${userRole}. Rôles autorisés: ${roles.join(', ')}`);
        return res.status(403).json({
          success: false,
          message: 'Accès refusé - Rôle insuffisant'
        });
      }

      logger.info(`[ROLE MIDDLEWARE] Accès autorisé pour l'utilisateur ${req.user.id} avec le rôle ${userRole}`);
      next();
    } catch (error) {
      logger.error(`[ROLE MIDDLEWARE] Erreur lors de la vérification du rôle: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification du rôle',
        error: error.message
      });
    }
  };
};

module.exports = roleMiddleware; 
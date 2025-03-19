const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Middleware pour vérifier l'authentification de l'utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.authenticate = async (req, res, next) => {
  try {
    logger.info(`[AUTH MIDDLEWARE] Vérification de l'authentification`);
    
    // Chercher le token dans plusieurs sources
    let token;
    
    // 1. Depuis les headers Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      logger.info(`[AUTH MIDDLEWARE] Token trouvé dans Authorization header`);
      token = req.headers.authorization.split(' ')[1];
    } 
    // 2. Depuis les cookies
    else if (req.cookies && req.cookies.token) {
      logger.info(`[AUTH MIDDLEWARE] Token trouvé dans les cookies`);
      token = req.cookies.token;
    }
    // 3. Depuis le corps de la requête (moins sécurisé, mais parfois nécessaire)
    else if (req.body && req.body.token) {
      logger.info(`[AUTH MIDDLEWARE] Token trouvé dans le corps de la requête`);
      token = req.body.token;
    }
    
    // Vérifier si un token a été trouvé
    if (!token) {
      logger.warn(`[AUTH MIDDLEWARE] Aucun token trouvé`);
      return res.status(401).json({
        success: false,
        message: 'Non autorisé. Authentification requise.'
      });
    }

    // Vérifier le token
    let decoded;
    try {
      logger.info(`[AUTH MIDDLEWARE] Vérification du token JWT`);
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      logger.warn(`[AUTH MIDDLEWARE] Token invalide ou expiré: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }

    // Vérifier si l'utilisateur existe toujours
    logger.info(`[AUTH MIDDLEWARE] Recherche de l'utilisateur avec ID: ${decoded.id}`);
    const user = await User.findById(decoded.id);
    if (!user) {
      logger.warn(`[AUTH MIDDLEWARE] L'utilisateur avec ID ${decoded.id} n'existe pas`);
      return res.status(401).json({
        success: false,
        message: 'L\'utilisateur associé à ce token n\'existe plus'
      });
    }
    
    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      logger.warn(`[AUTH MIDDLEWARE] L'utilisateur ${user.email} est désactivé`);
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé. Veuillez contacter l\'administrateur.'
      });
    }

    // Ajouter l'utilisateur à la requête
    logger.info(`[AUTH MIDDLEWARE] Authentification réussie pour l'utilisateur: ${user.email}`);
    req.user = user;

    next();
  } catch (error) {
    logger.error(`[AUTH MIDDLEWARE] Erreur d'authentification: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'authentification'
    });
  }
};

/**
 * Middleware pour vérifier les rôles des utilisateurs
 * @param  {...String} roles - Rôles autorisés
 * @returns {Function} Middleware Express
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Vérifier si l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Non autorisé. Veuillez vous connecter'
      });
    }

    // Vérifier si l'utilisateur a le rôle requis
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Accès interdit. Vous n\'avez pas les droits nécessaires'
      });
    }

    next();
  };
};

/**
 * Middleware pour vérifier si l'utilisateur est un administrateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      message: 'Accès refusé. Droits d\'administrateur requis.'
    });
  }
};

/**
 * Middleware pour vérifier si l'utilisateur est un administrateur d'entreprise
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.isCompanyAdmin = (req, res, next) => {
  const { companyId } = req.params;
  
  // Vérifier si l'utilisateur est un admin global ou un admin/manager de l'entreprise spécifiée
  if (
    req.user && (
      req.user.role === 'admin' || 
      (req.user.company.toString() === companyId && ['admin', 'manager'].includes(req.user.role))
    )
  ) {
    next();
  } else {
    return res.status(403).json({
      message: 'Accès refusé. Droits d\'administrateur d\'entreprise requis.'
    });
  }
};

/**
 * Middleware pour vérifier si l'utilisateur appartient à l'entreprise
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.isCompanyMember = (req, res, next) => {
  const { companyId } = req.params;
  
  if (
    req.user && (
      req.user.role === 'admin' || 
      req.user.company.toString() === companyId
    )
  ) {
    next();
  } else {
    return res.status(403).json({
      message: 'Accès refusé. Vous n\'êtes pas membre de cette entreprise.'
    });
  }
};

/**
 * Middleware qui combine l'authentification et la vérification du rôle administrateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.adminAccess = async (req, res, next) => {
  try {
    logger.info(`[AUTH MIDDLEWARE] Vérification de l'accès administrateur`);
    
    // Authentifier l'utilisateur d'abord
    await exports.authenticate(req, res, (err) => {
      if (err) {
        return next(err);
      }
      
      // Une fois authentifié, vérifier si c'est un admin
      if (!req.user || req.user.role !== 'admin') {
        logger.warn(`[AUTH MIDDLEWARE] Tentative d'accès administrateur refusée pour l'utilisateur ${req.user ? req.user.email : 'non authentifié'}`);
        return res.status(403).json({
          success: false,
          message: 'Accès refusé. Privilèges administrateur requis.'
        });
      }
      
      logger.info(`[AUTH MIDDLEWARE] Accès administrateur accordé pour l'utilisateur ${req.user.email}`);
      next();
    });
  } catch (error) {
    logger.error(`[AUTH MIDDLEWARE] Erreur lors de la vérification de l'accès administrateur: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la vérification des droits d\'accès'
    });
  }
};

/**
 * Middleware pour vérifier les accès au tableau de bord administrateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.adminDashboardAccess = async (req, res, next) => {
  try {
    logger.info(`[AUTH MIDDLEWARE] Vérification de l'accès au tableau de bord administrateur`);
    
    // Authentifier l'utilisateur d'abord
    await exports.authenticate(req, res, (err) => {
      if (err) {
        return next(err);
      }
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise pour accéder au tableau de bord administrateur'
        });
      }
      
      // Vérifier le rôle administrateur ou les permissions spécifiques
      if (req.user.role !== 'admin' && !req.user.permissions?.includes('dashboard_access')) {
        logger.warn(`[AUTH MIDDLEWARE] Tentative d'accès au tableau de bord administrateur refusée pour l'utilisateur ${req.user.email}`);
        return res.status(403).json({
          success: false,
          message: 'Accès refusé. Vous n\'avez pas les permissions nécessaires pour accéder au tableau de bord administrateur.'
        });
      }
      
      logger.info(`[AUTH MIDDLEWARE] Accès au tableau de bord administrateur accordé pour l'utilisateur ${req.user.email}`);
      next();
    });
  } catch (error) {
    logger.error(`[AUTH MIDDLEWARE] Erreur lors de la vérification de l'accès au tableau de bord: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la vérification des droits d\'accès'
    });
  }
};

module.exports = exports; 
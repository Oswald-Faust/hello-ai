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
    // Vérifier si le token est présent
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Non autorisé. Token manquant ou invalide'
      });
    }

    // Extraire le token
    const token = authHeader.split(' ')[1];

    // Vérifier le token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Token invalide ou expiré'
      });
    }

    // Vérifier si l'utilisateur existe toujours
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'L\'utilisateur associé à ce token n\'existe plus'
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = {
      id: user._id,
      role: user.role
    };

    next();
  } catch (error) {
    logger.error(`Erreur d'authentification: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Erreur lors de l\'authentification'
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

module.exports = exports; 
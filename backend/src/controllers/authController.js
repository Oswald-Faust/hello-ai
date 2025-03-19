const jwt = require('jsonwebtoken');






const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Company = require('../models/Company');
const logger = require('../utils/logger');
const { promisify } = require('util');
const crypto = require('crypto');

/**
 * Enregistrer un nouvel utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
const catchAsync = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Envoyer le token avec la réponse
const sendTokenResponse = (user, statusCode, res) => {
  try {
    logger.info(`[AUTH CONTROLLER] Génération du token pour l'utilisateur: ${user.email}`);
    const token = user.generateAuthToken();

    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 heures
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    };

    logger.info(`[AUTH CONTROLLER] Envoi de la réponse avec token pour: ${user.email}`);
    
    res
      .status(statusCode)
      .cookie('token', token, cookieOptions)
      .json({
        success: true,
        token,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          company: user.company
        }
      });
  } catch (error) {
    logger.error(`[AUTH CONTROLLER] Erreur lors de l'envoi du token: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du token'
    });
  }
};

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
exports.register = catchAsync(async (req, res, next) => {
  try {
    logger.info(`[AUTH CONTROLLER] Début du processus d'inscription`);
    logger.info(`[AUTH CONTROLLER] Corps de la requête: ${JSON.stringify(req.body)}`);
    
    const { firstName, lastName, email, password, companyId, companyName } = req.body;

    logger.info(`[AUTH CONTROLLER] Champs extraits: firstName=${firstName}, lastName=${lastName}, email=${email}, companyId=${companyId}, companyName=${companyName}`);

    // Vérifier les paramètres obligatoires
    if (!firstName) logger.warn(`[AUTH CONTROLLER] firstName manquant`);
    if (!lastName) logger.warn(`[AUTH CONTROLLER] lastName manquant`);
    if (!email) logger.warn(`[AUTH CONTROLLER] email manquant`);
    if (!password) logger.warn(`[AUTH CONTROLLER] password manquant`);
    
    if (!firstName || !lastName || !email || !password) {
      logger.warn(`[AUTH CONTROLLER] Paramètres obligatoires manquants`);
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir tous les champs obligatoires'
      });
    }

    // Préparer les données utilisateur
    const userData = {
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: String(email).trim().toLowerCase(),
      password: String(password)
    };
    
    logger.info(`[AUTH CONTROLLER] Données utilisateur préparées: ${JSON.stringify({...userData, password: '********'})}`);

    // Si companyId est fourni, vérifier et associer l'entreprise existante
    if (companyId) {
      logger.info(`[AUTH CONTROLLER] CompanyId fourni: ${companyId}`);
      // Vérifier si l'entreprise existe
      const company = await Company.findById(companyId);
      if (!company) {
        logger.warn(`[AUTH CONTROLLER] Entreprise non trouvée avec l'ID: ${companyId}`);
        return res.status(400).json({
          success: false,
          message: 'Entreprise non trouvée'
        });
      }
      logger.info(`[AUTH CONTROLLER] Entreprise trouvée: ${company.name}`);
      userData.company = companyId;
    } 
    // Si companyName est fourni, créer une nouvelle entreprise
    else if (companyName) {
      logger.info(`[AUTH CONTROLLER] CompanyName fourni: ${companyName}`);
      try {
        const newCompany = await Company.create({
          name: String(companyName).trim(),
          isActive: true
        });
        logger.info(`[AUTH CONTROLLER] Nouvelle entreprise créée avec ID: ${newCompany._id}`);
        userData.company = newCompany._id;
      } catch (error) {
        logger.error(`[AUTH CONTROLLER] Erreur lors de la création de l'entreprise: ${error.message}`);
        return res.status(400).json({
          success: false,
          message: 'Erreur lors de la création de l\'entreprise',
          error: error.message
        });
      }
    } else {
      logger.info(`[AUTH CONTROLLER] Aucune entreprise fournie, création d'utilisateur sans entreprise`);
    }

    logger.info(`[AUTH CONTROLLER] Tentative de création de l'utilisateur`);
    const user = await User.create(userData);
    logger.info(`[AUTH CONTROLLER] Utilisateur créé avec ID: ${user._id}`);

    sendTokenResponse(user, 201, res);
    logger.info(`[AUTH CONTROLLER] Inscription terminée avec succès, token envoyé`);
  } catch (error) {
    logger.error(`[AUTH CONTROLLER] Erreur lors de l'enregistrement: ${error.message}`);
    logger.error(`[AUTH CONTROLLER] Stack trace: ${error.stack}`);
    return res.status(400).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement: ' + error.message
    });
  }
});

// @desc    Connexion d'un utilisateur
// @route   POST /api/auth/login
// @access  Public
exports.login = catchAsync(async (req, res, next) => {
  try {
    logger.info(`[AUTH CONTROLLER] Tentative de connexion pour: ${req.body.email}`);
    const { email, password } = req.body;

    // Vérifier si email et mot de passe sont fournis
    if (!email || !password) {
      logger.warn(`[AUTH CONTROLLER] Email ou mot de passe manquant`);
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }

    // Vérifier si l'utilisateur existe
    logger.info(`[AUTH CONTROLLER] Recherche de l'utilisateur avec email: ${email}`);
    const user = await User.findOne({ email }).select('+password').populate('company');
    if (!user) {
      logger.warn(`[AUTH CONTROLLER] Utilisateur non trouvé: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      logger.warn(`[AUTH CONTROLLER] Tentative de connexion d'un compte inactif: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Ce compte est désactivé. Veuillez contacter l\'administrateur.'
      });
    }

    // Vérifier si le mot de passe correspond
    logger.info(`[AUTH CONTROLLER] Vérification du mot de passe pour: ${email}`);
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn(`[AUTH CONTROLLER] Mot de passe incorrect pour: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Mettre à jour la date de dernière connexion
    user.lastLogin = Date.now();
    await user.save();
    logger.info(`[AUTH CONTROLLER] Connexion réussie pour: ${email}`);

    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error(`[AUTH CONTROLLER] Erreur lors de la connexion: ${error.message}`);
    logger.error(`[AUTH CONTROLLER] Stack trace: ${error.stack}`);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion'
    });
  }
});

// @desc    Déconnexion de l'utilisateur
// @route   POST /api/auth/logout
// @access  Private
exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

// @desc    Obtenir le profil de l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('company');

  res.status(200).json({
    success: true,
    user
  });
});

// @desc    Mettre à jour le profil
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = catchAsync(async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  }).populate('company');

  res.status(200).json({
    success: true,
    user
  });
});

// @desc    Mettre à jour le mot de passe
// @route   PUT /api/auth/password
// @access  Private
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Vérifier le mot de passe actuel
  if (!(await user.comparePassword(req.body.currentPassword))) {
    return res.status(401).json({
      success: false,
      message: 'Mot de passe actuel incorrect'
    });
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Mot de passe oublié
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Aucun utilisateur trouvé avec cet email'
    });
  }

  // Obtenir le token de réinitialisation
  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // TODO: Envoyer l'email avec le token
  // Pour l'instant, nous retournons simplement le token
  res.status(200).json({
    success: true,
    resetToken
  });
});

// @desc    Réinitialiser le mot de passe
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = catchAsync(async (req, res, next) => {
  // Obtenir le token hashé
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }

  // Définir le nouveau mot de passe
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Rafraîchir le token JWT
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = catchAsync(async (req, res, next) => {
  try {
    logger.info(`[AUTH CONTROLLER] Tentative de rafraîchissement du token`);
    
    // Récupérer le token depuis les cookies, le body ou les headers
    const refreshToken = req.cookies.refresh_token || 
                        req.body.token || 
                        (req.headers.authorization && req.headers.authorization.startsWith('Bearer') 
                          ? req.headers.authorization.split(' ')[1] : null);
    
    if (!refreshToken) {
      logger.warn(`[AUTH CONTROLLER] Aucun token de rafraîchissement fourni`);
      return res.status(400).json({
        success: false,
        message: 'Aucun token de rafraîchissement fourni'
      });
    }
    
    // Vérifier le token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Trouver l'utilisateur
    logger.info(`[AUTH CONTROLLER] Recherche de l'utilisateur pour le rafraîchissement du token: ${decoded.id}`);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      logger.warn(`[AUTH CONTROLLER] Utilisateur non trouvé pour le rafraîchissement du token`);
      return res.status(404).json({
        success: false, 
        message: 'Utilisateur non trouvé'
      });
    }
    
    if (!user.isActive) {
      logger.warn(`[AUTH CONTROLLER] Tentative de rafraîchissement de token pour un compte inactif`);
      return res.status(401).json({
        success: false,
        message: 'Ce compte est désactivé'
      });
    }
    
    // Générer un nouveau token
    logger.info(`[AUTH CONTROLLER] Génération d'un nouveau token pour: ${user.email}`);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error(`[AUTH CONTROLLER] Erreur lors du rafraîchissement du token: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
});

module.exports = exports; 
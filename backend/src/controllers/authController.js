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
  const token = user.generateAuthToken();

  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 heures
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

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
};

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
exports.register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, companyId } = req.body;

  // Vérifier les paramètres obligatoires
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir tous les champs obligatoires'
    });
  }

  // Créer l'utilisateur avec ou sans entreprise
  const userData = {
    firstName,
    lastName,
    email,
    password
  };

  // Ajouter l'entreprise si elle est spécifiée
  if (companyId) {
    // Vérifier si l'entreprise existe
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }
    userData.company = companyId;
  }

  const user = await User.create(userData);

  sendTokenResponse(user, 201, res);
});

// @desc    Connexion d'un utilisateur
// @route   POST /api/auth/login
// @access  Public
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Vérifier si email et mot de passe sont fournis
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir un email et un mot de passe'
    });
  }

  // Vérifier si l'utilisateur existe
  const user = await User.findOne({ email }).select('+password').populate('company');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Identifiants invalides'
    });
  }

  // Vérifier si le mot de passe correspond
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Identifiants invalides'
    });
  }

  // Mettre à jour la date de dernière connexion
  user.lastLogin = Date.now();
  await user.save();

  sendTokenResponse(user, 200, res);
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

module.exports = exports; 
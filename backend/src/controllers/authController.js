const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Company = require('../models/Company');
const logger = require('../utils/logger');

/**
 * Enregistrer un nouvel utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, companyId, role } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }
    
    // Vérifier si l'entreprise existe
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        message: 'Entreprise non trouvée'
      });
    }
    
    // Créer un nouvel utilisateur
    const user = new User({
      firstName,
      lastName,
      email,
      password, // Le mot de passe sera hashé dans le modèle
      company: companyId,
      role: role || 'user' // Par défaut, le rôle est 'user'
    });
    
    // Sauvegarder l'utilisateur
    await user.save();
    
    logger.info(`Nouvel utilisateur créé: ${user.email}`);
    
    // Générer un token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );
    
    // Retourner la réponse
    res.status(201).json({
      status: 'success',
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
    logger.error(`Erreur lors de l'enregistrement: ${error.message}`);
    next(error);
  }
};

/**
 * Connecter un utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email }).populate('company', 'name');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Vérifier si l'utilisateur est actif
    if (!user.active) {
      return res.status(401).json({
        message: 'Votre compte a été désactivé. Veuillez contacter l\'administrateur.'
      });
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Mettre à jour la date de dernière connexion
    user.lastLogin = new Date();
    await user.save();
    
    // Générer un token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );
    
    logger.info(`Utilisateur connecté: ${user.email}`);
    
    // Retourner la réponse
    res.status(200).json({
      status: 'success',
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
    logger.error(`Erreur lors de la connexion: ${error.message}`);
    next(error);
  }
};

/**
 * Déconnecter un utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.logout = (req, res) => {
  // Dans une implémentation JWT simple, il n'y a pas besoin de déconnexion côté serveur
  // Le client doit simplement supprimer le token
  res.status(200).json({
    status: 'success',
    message: 'Déconnexion réussie'
  });
};

/**
 * Obtenir les informations de l'utilisateur connecté
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    // L'utilisateur est déjà disponible dans req.user grâce au middleware d'authentification
    const user = await User.findById(req.user.id).populate('company', 'name');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      status: 'success',
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
    logger.error(`Erreur lors de la récupération de l'utilisateur: ${error.message}`);
    next(error);
  }
};

/**
 * Rafraîchir le token d'authentification
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Token non fourni'
      });
    }

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
      return res.status(404).json({
        status: 'error',
        message: 'Utilisateur non trouvé'
      });
    }

    // Générer un nouveau token
    const newToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    res.status(200).json({
      status: 'success',
      token: newToken
    });
  } catch (error) {
    logger.error(`Erreur lors du rafraîchissement du token: ${error.message}`);
    next(error);
  }
};

/**
 * Récupérer le profil de l'utilisateur connecté
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('company', 'name');
    
    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur non trouvé'
      });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    logger.error('Erreur lors de la récupération du profil:', error);
    return res.status(500).json({
      message: 'Erreur lors de la récupération du profil',
      error: error.message
    });
  }
};

/**
 * Mettre à jour le profil de l'utilisateur connecté
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, preferences } = req.body;
    
    // Créer un objet avec les champs à mettre à jour
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).populate('company', 'name');
    
    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur non trouvé'
      });
    }
    
    logger.info(`Profil mis à jour pour: ${user.email}`);
    
    return res.status(200).json({
      message: 'Profil mis à jour avec succès',
      user
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du profil:', error);
    return res.status(500).json({
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message
    });
  }
};

/**
 * Changer le mot de passe de l'utilisateur connecté
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Vérifier si les mots de passe sont fournis
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Le mot de passe actuel et le nouveau mot de passe sont requis'
      });
    }
    
    // Vérifier si le nouveau mot de passe est assez long
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: 'Le nouveau mot de passe doit contenir au moins 8 caractères'
      });
    }
    
    const user = await User.findById(req.user._id);
    
    // Vérifier le mot de passe actuel
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Mot de passe actuel incorrect'
      });
    }
    
    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();
    
    logger.info(`Mot de passe changé pour: ${user.email}`);
    
    return res.status(200).json({
      message: 'Mot de passe changé avec succès'
    });
  } catch (error) {
    logger.error('Erreur lors du changement de mot de passe:', error);
    return res.status(500).json({
      message: 'Erreur lors du changement de mot de passe',
      error: error.message
    });
  }
};

/**
 * Demander une réinitialisation de mot de passe
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    // Ne pas révéler si l'utilisateur existe ou non
    if (!user) {
      return res.status(200).json({
        message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé'
      });
    }
    
    // Générer un token de réinitialisation
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Stocker le token et sa date d'expiration
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
    await user.save();
    
    // TODO: Envoyer un email avec le lien de réinitialisation
    // Le lien devrait être quelque chose comme: 
    // `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    
    logger.info(`Demande de réinitialisation de mot de passe pour: ${user.email}`);
    
    return res.status(200).json({
      message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé'
    });
  } catch (error) {
    logger.error('Erreur lors de la demande de réinitialisation de mot de passe:', error);
    return res.status(500).json({
      message: 'Erreur lors de la demande de réinitialisation de mot de passe',
      error: error.message
    });
  }
};

/**
 * Réinitialiser le mot de passe avec un token
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Vérifier si le token et le nouveau mot de passe sont fournis
    if (!token || !newPassword) {
      return res.status(400).json({
        message: 'Le token et le nouveau mot de passe sont requis'
      });
    }
    
    // Vérifier si le nouveau mot de passe est assez long
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: 'Le nouveau mot de passe doit contenir au moins 8 caractères'
      });
    }
    
    // Trouver l'utilisateur avec ce token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        message: 'Le token de réinitialisation est invalide ou a expiré'
      });
    }
    
    // Mettre à jour le mot de passe
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    logger.info(`Mot de passe réinitialisé pour: ${user.email}`);
    
    return res.status(200).json({
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error) {
    logger.error('Erreur lors de la réinitialisation du mot de passe:', error);
    return res.status(500).json({
      message: 'Erreur lors de la réinitialisation du mot de passe',
      error: error.message
    });
  }
};

module.exports = exports; 
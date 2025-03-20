const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Schema = mongoose.Schema;
const logger = require('../utils/logger');

/**
 * Schéma pour les utilisateurs de la plateforme Lydia
 */
const UserSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir un email valide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères']
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: false
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  preferences: {
    language: {
      type: String,
      default: 'fr'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      callAlerts: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Créer des index pour améliorer les performances des recherches
UserSchema.index({ company: 1 });

// Méthode pour comparer les mots de passe
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour obtenir le nom complet
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Middleware pour hasher le mot de passe avant de sauvegarder
UserSchema.pre('save', async function(next) {
  logger.info(`[USER MODEL] Pre-save hook déclenché pour l'utilisateur: ${this.email}`);
  
  if (!this.isModified('password')) {
    logger.info(`[USER MODEL] Mot de passe non modifié, skip du hashage`);
    return next();
  }
  
  try {
    logger.info(`[USER MODEL] Hashage du mot de passe pour: ${this.email}`);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    logger.info(`[USER MODEL] Mot de passe hashé avec succès`);
    next();
  } catch (error) {
    logger.error(`[USER MODEL] Erreur lors du hashage du mot de passe: ${error.message}`);
    next(error);
  }
});

// Middleware pour valider les données avant la sauvegarde
UserSchema.pre('validate', function(next) {
  logger.info(`[USER MODEL] Validation des données utilisateur: ${this.email}`);
  
  // Log des champs obligatoires manquants
  if (!this.firstName) logger.warn(`[USER MODEL] firstName manquant pour: ${this.email}`);
  if (!this.lastName) logger.warn(`[USER MODEL] lastName manquant pour: ${this.email}`);
  if (!this.email) logger.warn(`[USER MODEL] email manquant`);
  if (!this.password) logger.warn(`[USER MODEL] password manquant pour: ${this.email}`);
  
  next();
});

// Générer un token JWT
UserSchema.methods.generateAuthToken = function() {
  try {
    logger.info(`[USER MODEL] Génération d'un token JWT pour l'utilisateur: ${this.email}`);
    
    if (!process.env.JWT_SECRET) {
      logger.error(`[USER MODEL] JWT_SECRET n'est pas défini dans les variables d'environnement`);
      throw new Error('La configuration JWT est incomplète');
    }
    
    if (!process.env.JWT_EXPIRATION) {
      logger.warn(`[USER MODEL] JWT_EXPIRATION n'est pas défini, utilisation de la valeur par défaut 24h`);
    }
    
    const token = jwt.sign(
      { 
        id: this._id, 
        role: this.role,
        email: this.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '24h' }
    );
    
    logger.info(`[USER MODEL] Token JWT généré avec succès pour: ${this.email}`);
    return token;
  } catch (error) {
    logger.error(`[USER MODEL] Erreur lors de la génération du token JWT: ${error.message}`);
    throw error;
  }
};

// Générer un token de réinitialisation de mot de passe
UserSchema.methods.generateResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  
  return resetToken;
};

const User = mongoose.model('User', UserSchema);

module.exports = User; 
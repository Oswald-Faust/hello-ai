const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('../utils/logger');
require('dotenv').config();

/**
 * Script pour créer un utilisateur administrateur par défaut
 */
const createAdminUser = async () => {
  try {
    // Vérifier si la connexion est déjà établie
    if (mongoose.connection.readyState !== 1) {
      // Se connecter à la base de données si ce n'est pas déjà fait
      const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lydia';
      await mongoose.connect(dbUri);
      logger.info('Connexion à MongoDB établie avec succès');
    }

    // Vérifier si un administrateur existe déjà
    const adminExists = await User.findOne({ email: 'admin@lydia.com' });
    
    if (adminExists) {
      logger.info('Un utilisateur administrateur existe déjà');
      // Ne pas fermer la connexion si elle est utilisée par l'application
      if (require.main === module) {
        mongoose.connection.close();
      }
      return;
    }

    // Créer l'utilisateur administrateur
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'Lydia',
      email: 'admin@lydia.com',
      password: 'Admin123!',  // Ce mot de passe sera hashé automatiquement par le middleware
      role: 'superadmin',
      isActive: true
    });

    await adminUser.save();
    logger.info('Utilisateur administrateur créé avec succès');
    logger.info(`Email: admin@lydia.com | Mot de passe: Admin123!`);

    // Ne pas fermer la connexion si elle est utilisée par l'application
    if (require.main === module) {
      mongoose.connection.close();
    }
    
  } catch (error) {
    logger.error(`Erreur lors de la création de l'administrateur: ${error.message}`);
    // Ne pas fermer la connexion si elle est utilisée par l'application
    if (require.main === module) {
      mongoose.connection.close();
    }
    if (require.main === module) {
      process.exit(1);
    }
  }
};

// Exécuter la fonction si le script est appelé directement
if (require.main === module) {
  createAdminUser();
}

module.exports = { createAdminUser }; 
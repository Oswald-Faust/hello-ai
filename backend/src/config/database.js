const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Configuration MongoDB
const connectMongoDB = async () => {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      logger.info('Connexion à MongoDB établie avec succès');
    } catch (error) {
      logger.error('Erreur lors de la connexion à MongoDB:', error);
    }
  } else {
    logger.info('Aucune URI MongoDB fournie, fonctionnement sans MongoDB');
  }
};

// Initialiser la connexion MongoDB si configurée
if (process.env.MONGODB_URI) {
  connectMongoDB();
}

module.exports = {
  mongoose,
  connectDB: connectMongoDB
}; 
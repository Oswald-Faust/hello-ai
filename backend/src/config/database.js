const { Pool } = require('pg');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Configuration PostgreSQL
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test de connexion PostgreSQL
pgPool.connect((err, client, release) => {
  if (err) {
    return logger.error('Erreur lors de la connexion à PostgreSQL:', err.stack);
  }
  logger.info('Connexion à PostgreSQL établie avec succès');
  release();
});

// Configuration MongoDB (pour certaines fonctionnalités qui bénéficient d'une base NoSQL)
const connectMongoDB = async () => {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
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
  pgPool,
  query: (text, params) => pgPool.query(text, params),
  mongoose
}; 
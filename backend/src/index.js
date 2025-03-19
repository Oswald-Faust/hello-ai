require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
const logger = require('./utils/logger');
const db = require('./config/database');
const routes = require('./routes');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createWriteStream } = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const corsOptions = require('./utils/corsConfig');
const { createAdminUser } = require('./seeders/adminSeeder');

// Initialisation de l'application Express
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: corsOptions
});

// Middleware
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Configuration du parsing JSON avec des limites plus élevées et une meilleure gestion des erreurs
app.use(express.json({ 
  limit: '1mb',
  strict: false // Plus permissif avec le JSON mal formé
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: '1mb'
}));

app.use(compression());
app.use(cookieParser());

// Middleware pour gérer les erreurs de parsing JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.error(`[JSON ERROR] Erreur de parsing JSON: ${err.message}`);
    logger.error(`[JSON ERROR] Données reçues: ${err.body}`);
    logger.error(`[JSON ERROR] URL: ${req.originalUrl}`);
    logger.error(`[JSON ERROR] Méthode: ${req.method}`);
    logger.error(`[JSON ERROR] Headers: ${JSON.stringify(req.headers)}`);
    
    return res.status(400).json({
      success: false,
      message: 'JSON invalide dans la requête: ' + err.message,
      receivedData: err.body
    });
  }
  next(err);
});

// Middleware de journalisation des requêtes
app.use((req, res, next) => {
  logger.info(`[REQUEST] ${req.method} ${req.originalUrl}`);
  
  if (Object.keys(req.body).length > 0) {
    // Ne pas logger les mots de passe ou données sensibles
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '********';
    logger.info(`[REQUEST BODY] ${JSON.stringify(sanitizedBody)}`);
  }
  
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    logger.info(`[RESPONSE] ${req.method} ${req.originalUrl} - Statut: ${res.statusCode}`);
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
});

// Routes
app.use('/api', routes);

// Socket.io pour les notifications en temps réel
io.on('connection', (socket) => {
  logger.info(`Client connecté: ${socket.id}`);
  
  socket.on('disconnect', () => {
    logger.info(`Client déconnecté: ${socket.id}`);
  });
});

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  standardHeaders: true,
  legacyHeaders: false,
});

// Appliquer le rate limiting à toutes les routes API
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/calls', require('./routes/callRoutes'));

// Route de base pour vérifier que l'API fonctionne
app.get('/api', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API Lydia!' });
});

// Middleware pour les routes non trouvées
app.use(require('./middleware/notFoundHandler'));

// Middleware de gestion des erreurs
app.use(require('./middleware/errorHandler'));

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connecté à MongoDB'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Une erreur est survenue sur le serveur'
  });
});

// Fonction de démarrage du serveur
const startServer = async () => {
  try {
    // Connecter à la base de données
    await db.connectDB();
    
    // Créer l'utilisateur administrateur par défaut
    await createAdminUser();
    
    // Configurer le port
    const PORT = process.env.PORT || 3001;
    
    // Démarrer le serveur
    httpServer.listen(PORT, () => {
      logger.info(`Serveur démarré sur le port ${PORT}`);
      logger.info(`Environnement: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error(`Erreur lors du démarrage du serveur: ${error.message}`);
    process.exit(1);
  }
};

// Lancer le serveur
startServer();

// Gestion des signaux pour arrêt propre
process.on('SIGTERM', () => {
  logger.info('SIGTERM reçu. Arrêt du serveur...');
  httpServer.close(() => {
    logger.info('Serveur arrêté');
    process.exit(0);
  });
});

module.exports = app; 
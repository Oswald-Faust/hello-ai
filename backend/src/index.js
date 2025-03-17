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

// Initialisation de l'application Express
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

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

// Démarrage du serveur
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  logger.info(`Serveur démarré sur le port ${PORT}`);
});

// Gestion des signaux pour arrêt propre
process.on('SIGTERM', () => {
  logger.info('SIGTERM reçu. Arrêt du serveur...');
  httpServer.close(() => {
    logger.info('Serveur arrêté');
    process.exit(0);
  });
});

module.exports = app; 
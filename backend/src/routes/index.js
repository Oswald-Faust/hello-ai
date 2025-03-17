const express = require('express');
const router = express.Router();

// Importer les routes spécifiques
const companyRoutes = require('./companyRoutes');
const callRoutes = require('./callRoutes');
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');

// Définir les routes principales
router.use('/companies', companyRoutes);
router.use('/calls', callRoutes);
router.use('/users', userRoutes);
router.use('/auth', authRoutes);

// Route de base pour vérifier que l'API fonctionne
router.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API Lydia',
    version: '1.0.0',
    status: 'online'
  });
});

module.exports = router; 
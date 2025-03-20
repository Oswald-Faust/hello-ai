const express = require('express');
const router = express.Router();

// Importer les routes
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const companyRoutes = require('./companyRoutes');
const userRoutes = require('./userRoutes');
const callRoutes = require('./callRoutes');
const voiceRoutes = require('./voiceRoutes');

// Monter les routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/companies', companyRoutes);
router.use('/users', userRoutes);
router.use('/calls', callRoutes);
router.use('/voices', voiceRoutes);

// Route de base pour vérifier que l'API fonctionne
router.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API Lydia',
    version: '1.0.0',
    status: 'online'
  });
});

module.exports = router; 
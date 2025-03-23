const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const { authenticate } = require('../middleware/authMiddleware');

// Routes protégées par authentification
router.use(authenticate);

// Initialiser une conversation
router.post('/initialize', conversationController.initializeConversation);

// Générer une réponse IA
router.post('/generate-response', conversationController.generateResponse);

// Lister les configurations par catégorie
router.get('/configurations/:category', conversationController.listConfigurationsByCategory);
router.get('/configurations', conversationController.listConfigurationsByCategory);

// Suggérer des configurations adaptées à un cas d'usage
router.post('/suggest-configurations', conversationController.suggestConfigurations);

module.exports = router; 
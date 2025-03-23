const express = require('express');
const router = express.Router();
const conversationConfigController = require('../controllers/conversationConfigController');
const { authenticate } = require('../middleware/authMiddleware');

// Routes CRUD pour les configurations
router.post('/', conversationConfigController.createConfig);
router.get('/', conversationConfigController.getAllConfigs);
router.get('/:id', conversationConfigController.getConfigById);
router.put('/:id', conversationConfigController.updateConfig);
router.delete('/:id', conversationConfigController.deleteConfig);

// Routes pour filtrer par type et catégorie
router.get('/type/:type', conversationConfigController.getConfigsByType);
router.get('/industry/:industry', conversationConfigController.getConfigsByIndustry);

// Routes pour obtenir les metadata
router.get('/metadata/conversation-types', conversationConfigController.getConversationTypes);
router.get('/metadata/industry-types', conversationConfigController.getIndustryTypes);

// Route pour générer le prompt système
router.get('/:id/system-prompt', conversationConfigController.generateSystemPrompt);

// Routes pour la gestion des PDFs
router.post('/:id/pdf', conversationConfigController.uploadPdf);
router.delete('/:configId/pdf/:pdfId', conversationConfigController.deletePdf);

// Routes pour les intégrations avec systèmes externes
router.post('/:configId/integration', conversationConfigController.configureIntegration);

module.exports = router; 
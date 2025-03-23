const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticate, authorize, isAdmin } = require('../middleware/authMiddleware');
const callController = require('../controllers/callController');

/**
 * @route   POST /api/companies
 * @desc    Créer une nouvelle entreprise
 * @access  Private/Admin
 */
router.post('/', authenticate, authorize(['admin']), companyController.createCompany);

/**
 * @route   GET /api/companies
 * @desc    Récupérer toutes les entreprises
 * @access  Private/Admin
 */
router.get('/', authenticate, authorize(['admin']), companyController.getAllCompanies);

/**
 * @route   GET /api/companies/stats
 * @desc    Récupérer les statistiques des entreprises
 * @access  Private/Admin
 */
router.get('/stats', authenticate, authorize(['admin']), companyController.getCompaniesStats);

/**
 * @route   GET /api/companies/count
 * @desc    Récupérer le nombre total d'entreprises
 * @access  Private/Admin
 */
router.get('/count', authenticate, authorize(['admin']), companyController.getCompaniesCount);

/**
 * @route   GET /api/companies/:id
 * @desc    Récupérer une entreprise par son ID
 * @access  Private
 */
router.get('/:id', authenticate, companyController.getCompanyById);

/**
 * @route   PUT /api/companies/:id
 * @desc    Mettre à jour une entreprise
 * @access  Private
 */
router.put('/:id', authenticate, companyController.updateCompany);

/**
 * @route   DELETE /api/companies/:id
 * @desc    Supprimer une entreprise
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, authorize(['admin']), companyController.deleteCompany);

/**
 * @route   GET /api/companies/:id/settings
 * @desc    Récupérer les paramètres d'une entreprise
 * @access  Private
 */
router.get('/:id/settings', authenticate, companyController.getCompanySettings);

/**
 * @route   PUT /api/companies/:id/settings
 * @desc    Mettre à jour les paramètres d'une entreprise
 * @access  Private
 */
router.put('/:id/settings', authenticate, companyController.updateCompanySettings);

/**
 * @route   GET /api/companies/:id/voice-assistant
 * @desc    Récupérer la configuration de l'assistant vocal
 * @access  Private
 */
router.get('/:id/voice-assistant', authenticate, companyController.getVoiceAssistantPrompts);

/**
 * @route   PUT /api/companies/:id/voice-assistant
 * @desc    Mettre à jour la configuration de l'assistant vocal
 * @access  Private
 */
router.put('/:id/voice-assistant', authenticate, companyController.updateVoiceAssistantPrompts);

/**
 * @route   POST /api/companies/:id/voice-assistant/scenarios
 * @desc    Créer un nouveau scénario pour l'assistant vocal
 * @access  Private
 */
router.post('/:id/voice-assistant/scenarios', authenticate, companyController.createVoiceAssistantScenario);

/**
 * @route   PUT /api/companies/:id/voice-assistant/scenarios/:scenarioName
 * @desc    Mettre à jour un scénario existant
 * @access  Private
 */
router.put('/:id/voice-assistant/scenarios/:scenarioName', authenticate, companyController.updateVoiceAssistantScenario);

/**
 * @route   DELETE /api/companies/:id/voice-assistant/scenarios/:scenarioName
 * @desc    Supprimer un scénario
 * @access  Private
 */
router.delete('/:id/voice-assistant/scenarios/:scenarioName', authenticate, companyController.deleteVoiceAssistantScenario);

/**
 * @route   POST /api/companies/:id/voice-assistant/test-prompt
 * @desc    Tester un prompt avec des variables spécifiques
 * @access  Private
 */
router.post('/:id/voice-assistant/test-prompt', authenticate, companyController.testVoiceAssistantPrompt);

// Routes pour la gestion des numéros de téléphone
router.post('/:companyId/phone-number', authenticate, authorize(['companyAdmin']), companyController.purchasePhoneNumber);

// Routes pour la configuration vocale
router.put('/:companyId/voice-config', authenticate, authorize(['companyAdmin']), companyController.updateVoiceConfig);

// Routes pour les réponses personnalisées
router.post('/:companyId/custom-responses', authenticate, authorize(['companyAdmin']), companyController.addCustomResponse);
router.delete('/:companyId/custom-responses/:responseId', authenticate, authorize(['companyAdmin']), companyController.deleteCustomResponse);

// Routes pour les paramètres de transfert
router.put('/:companyId/transfer-settings', authenticate, authorize(['companyAdmin']), companyController.updateTransferSettings);

// Routes pour les heures d'ouverture
router.put('/:companyId/business-hours', authenticate, authorize(['companyAdmin']), companyController.updateBusinessHours);

/**
 * @route   GET /api/companies/:companyId/calls
 * @desc    Récupérer les appels pour une entreprise spécifique
 * @access  Private
 */
router.get('/:companyId/calls', authenticate, callController.getCallsByCompany);

/**
 * @route   GET /api/companies/:companyId/calls/stats
 * @desc    Récupérer les statistiques des appels pour une entreprise spécifique
 * @access  Private
 */
router.get('/:companyId/calls/stats', authenticate, callController.getCallStats);

/**
 * @route   GET /api/companies/:companyId/calls/dashboard
 * @desc    Récupérer les statistiques pour le tableau de bord des appels
 * @access  Private
 */
router.get('/:companyId/calls/dashboard', authenticate, callController.getCallDashboardStats);

module.exports = router; 
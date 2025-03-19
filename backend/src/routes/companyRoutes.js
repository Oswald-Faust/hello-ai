const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticate, authorize, isAdmin } = require('../middleware/authMiddleware');

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
 * @access  Private/Admin
 */
router.put('/:id', authenticate, authorize(['admin']), companyController.updateCompany);

/**
 * @route   PATCH /api/companies/:id/settings
 * @desc    Mettre à jour les paramètres d'une entreprise
 * @access  Private/Admin
 */
router.patch('/:companyId/settings', authenticate, authorize(['admin']), companyController.updateCompanySettings);

/**
 * @route   DELETE /api/companies/:id
 * @desc    Supprimer une entreprise
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, authorize(['admin']), companyController.deleteCompany);

/**
 * @route   PATCH /api/companies/:id/status
 * @desc    Activer/désactiver une entreprise
 * @access  Private/Admin
 */
router.patch('/:id/status', authenticate, authorize(['admin']), companyController.toggleCompanyStatus);

/**
 * @route   PATCH /api/companies/:id/subscription
 * @desc    Mettre à jour l'abonnement d'une entreprise
 * @access  Private/Admin
 */
router.patch('/:id/subscription', authenticate, authorize(['admin']), companyController.updateSubscription);

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

module.exports = router; 
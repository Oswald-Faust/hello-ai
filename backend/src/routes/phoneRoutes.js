const express = require('express');
const router = express.Router();
const phoneController = require('../controllers/phoneController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/phone-numbers/available
 * @desc    Récupérer des numéros disponibles
 * @access  Private
 */
router.get('/available', authenticate, phoneController.getAvailableNumbers);

/**
 * @route   GET /api/phone-numbers/pricing
 * @desc    Récupérer les tarifs des numéros
 * @access  Private
 */
router.get('/pricing', authenticate, phoneController.getPhoneNumberPricing);

/**
 * @route   POST /api/phone-numbers/validate
 * @desc    Valider un numéro de téléphone
 * @access  Private
 */
router.post('/validate', authenticate, phoneController.validatePhoneNumber);

module.exports = router; 
const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/calls
 * @desc    Créer un nouvel appel
 * @access  Private
 */
router.post('/', authenticate, callController.createCall);

/**
 * @route   GET /api/calls
 * @desc    Récupérer tous les appels
 * @access  Private
 */
router.get('/', authenticate, callController.getAllCalls);

/**
 * @route   GET /api/calls/stats
 * @desc    Récupérer les statistiques des appels
 * @access  Private
 */
router.get('/stats', authenticate, callController.getCallStats);

/**
 * @route   GET /api/calls/:id
 * @desc    Récupérer un appel par son ID
 * @access  Private
 */
router.get('/:id', authenticate, callController.getCallById);

/**
 * @route   PUT /api/calls/:id
 * @desc    Mettre à jour un appel
 * @access  Private
 */
router.put('/:id', authenticate, callController.updateCall);

/**
 * @route   DELETE /api/calls/:id
 * @desc    Supprimer un appel
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, authorize(['admin']), callController.deleteCall);

/**
 * @route   POST /api/calls/:id/conversation
 * @desc    Ajouter une entrée à la conversation d'un appel
 * @access  Private
 */
router.post('/:id/conversation', authenticate, callController.addConversationEntry);

/**
 * @route   PATCH /api/calls/:id/status
 * @desc    Mettre à jour le statut d'un appel
 * @access  Private
 */
router.patch('/:id/status', authenticate, callController.updateCallStatus);

module.exports = router; 
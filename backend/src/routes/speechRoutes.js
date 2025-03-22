const express = require('express');
const router = express.Router();
const speechController = require('../controllers/speechController');
const { authenticate } = require('../middleware/authMiddleware');

/**
 * Routes pour la reconnaissance vocale et les conversations audio
 */

/**
 * @route   POST /api/speech/transcribe
 * @desc    Convertir un fichier audio en texte (transcription)
 * @access  Private
 */
router.post('/transcribe', authenticate, speechController.processAudioToText);

/**
 * @route   POST /api/speech/conversation
 * @desc    Traiter un fichier audio, générer une réponse et la convertir en audio
 * @access  Private
 */
router.post('/conversation', authenticate, speechController.processAudioConversation);

/**
 * @route   GET /api/speech/download/:fileName
 * @desc    Télécharger un fichier audio généré
 * @access  Public (avec un token temporaire)
 */
router.get('/download/:fileName', speechController.downloadAudio);

module.exports = router; 
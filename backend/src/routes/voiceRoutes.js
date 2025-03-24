const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');
const { authenticate } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configuration de multer pour le téléchargement des fichiers audio
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite de 10MB
  },
  fileFilter: function (req, file, cb) {
    const allowedExtensions = ['.mp3', '.wav', '.ogg', '.m4a'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté'));
    }
  }
});

/**
 * Routes pour les services de voix (TTS)
 * Utilise gTTS (Google Text-to-Speech) comme solution principale (gratuit)
 * Compatible avec les anciennes routes pour PlayHT et Fish Audio
 */

/**
 * @route   GET /api/voices/available
 * @desc    Récupérer la liste des voix disponibles (avec paramètre provider optionnel)
 * @access  Private
 */
router.get('/available', authenticate, voiceController.getAvailableVoicesController);

/**
 * @route   POST /api/voices/upload/:id
 * @desc    Télécharger une voix personnalisée pour une entreprise
 * @access  Private
 */
router.post('/upload/:id', authenticate, upload.single('file'), voiceController.uploadCustomVoice);

/**
 * @route   POST /api/voices/test
 * @desc    Tester une voix avec un texte
 * @access  Private
 */
router.post('/test', authenticate, voiceController.testVoiceGenerationController);

/**
 * @route   GET /api/voices/download/:filename
 * @desc    Télécharger un fichier audio de test
 * @access  Public (avec un token temporaire)
 */
router.get('/download/:filename', voiceController.downloadAudioController);

/**
 * @route   PUT /api/voices/config/:id
 * @desc    Mettre à jour la configuration de voix d'une entreprise
 * @access  Private
 */
router.put('/config/:id', authenticate, voiceController.configureCompanyVoiceController);

/**
 * @route   POST /api/voices/generate/:id
 * @desc    Générer un audio à partir du texte pour une entreprise
 * @access  Private
 */
router.post('/generate/:id', authenticate, voiceController.generateCompanyAudioController);

// Route pour tester la conversation avec OpenAI et génération vocale
router.post('/conversation', authenticate, voiceController.testConversationWithVoice);

// Routes pour Hugging Face et gTTS (alternatives gratuites)
router.post('/hf-conversation', authenticate, voiceController.generateConversation);
router.post('/hf-conversation-with-history', authenticate, voiceController.generateConversationWithHistory);
router.post('/sentiment', authenticate, voiceController.analyzeSentiment);

// === Routes pour la compatibilité avec l'ancien système ===

// Anciennes routes de test (redirection vers les nouvelles routes)
router.post('/test-voice', authenticate, voiceController.testVoiceGenerationController);
router.get('/download-test/:filename', voiceController.downloadAudioController);

// Anciennes routes de configuration (redirection vers les nouvelles routes)
router.put('/companies/:id/config', authenticate, voiceController.configureCompanyVoiceController);

// Anciennes routes de génération (redirection vers les nouvelles routes)
router.post('/companies/:id/generate', authenticate, voiceController.generateCompanyAudioController);

module.exports = router; 
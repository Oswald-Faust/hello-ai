const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
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
 * @route   GET /api/voices
 * @desc    Récupérer la liste des voix disponibles
 * @access  Private
 */
router.get('/', authenticate, voiceController.getAvailableVoices);

/**
 * @route   POST /api/voices/companies/:id/custom
 * @desc    Télécharger une voix personnalisée pour une entreprise
 * @access  Private
 */
router.post('/companies/:id/custom', authenticate, upload.single('audio'), voiceController.uploadCustomVoice);

/**
 * @route   POST /api/voices/test
 * @desc    Tester une voix avec un texte
 * @access  Private
 */
router.post('/test', authenticate, voiceController.testVoice);

/**
 * @route   GET /api/voices/download/:fileName
 * @desc    Télécharger un fichier audio de test
 * @access  Public (avec un token temporaire)
 */
router.get('/download/:fileName', voiceController.downloadTestAudio);

/**
 * @route   PUT /api/voices/companies/:id/config
 * @desc    Mettre à jour la configuration de voix d'une entreprise
 * @access  Private
 */
router.put('/companies/:id/config', authenticate, voiceController.updateVoiceConfig);

/**
 * @route   POST /api/voices/companies/:id/generate
 * @desc    Générer un audio à partir du texte pour une entreprise
 * @access  Private
 */
router.post('/companies/:id/generate', authenticate, voiceController.generateCompanyAudio);

module.exports = router; 
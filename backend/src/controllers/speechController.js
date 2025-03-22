const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const logger = require('../utils/logger');
const huggingfaceService = require('../services/huggingfaceService');
const speechService = require('../services/speechService');  // Service de reconnaissance vocale
const gtts = require('node-gtts')('fr');
const { errorResponse, successResponse } = require('../utils/responseHandler');

// Répertoires pour stocker les fichiers audio
const SPEECH_UPLOAD_DIR = process.env.SPEECH_UPLOAD_DIR || 'uploads/speech';
const AUDIO_CACHE_DIR = process.env.TTS_CACHE_DIR || 'audio_cache';

// Créer les répertoires s'ils n'existent pas
if (!fsSync.existsSync(SPEECH_UPLOAD_DIR)) {
  fsSync.mkdirSync(SPEECH_UPLOAD_DIR, { recursive: true });
}

if (!fsSync.existsSync(AUDIO_CACHE_DIR)) {
  fsSync.mkdirSync(AUDIO_CACHE_DIR, { recursive: true });
}

// Configuration pour l'upload des fichiers audio
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, SPEECH_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo max
  fileFilter: (req, file, cb) => {
    const filetypes = /wav|mp3|ogg|m4a|webm/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Seuls les fichiers audio (WAV, MP3, OGG, M4A, WEBM) sont autorisés"));
  }
}).single('audio');

/**
 * Traiter un fichier audio envoyé et le convertir en texte
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const processAudioToText = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      logger.error('Erreur lors de l\'upload du fichier audio:', err);
      return errorResponse(res, 400, err.message);
    }

    if (!req.file) {
      return errorResponse(res, 400, 'Aucun fichier audio fourni');
    }

    try {
      // Utiliser notre service de reconnaissance vocale
      const transcription = await speechService.transcribeAudio(req.file.path);
      
      logger.info(`Transcription audio: "${transcription}"`);
      
      // Détecter la langue (optionnel)
      const detectedLanguage = await speechService.detectLanguage(req.file.path);
      
      // Nettoyer le fichier temporaire après utilisation
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        logger.warn('Erreur lors de la suppression du fichier temporaire:', unlinkError);
      }
      
      return successResponse(res, 200, 'Audio transcrit avec succès', {
        transcription,
        language: detectedLanguage
      });
    } catch (error) {
      logger.error('Erreur lors de la transcription de l\'audio:', error);
      
      // Nettoyer le fichier temporaire en cas d'erreur
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        logger.warn('Erreur lors de la suppression du fichier temporaire:', unlinkError);
      }
      
      return errorResponse(res, 500, 'Erreur lors de la transcription de l\'audio', error);
    }
  });
};

/**
 * Traiter un fichier audio et générer une réponse conversationnelle avec audio
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const processAudioConversation = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      logger.error('Erreur lors de l\'upload du fichier audio:', err);
      return errorResponse(res, 400, err.message);
    }

    if (!req.file) {
      return errorResponse(res, 400, 'Aucun fichier audio fourni');
    }

    try {
      // Transcrire l'audio en texte avec notre service
      const transcription = await speechService.transcribeAudio(req.file.path);
      
      logger.info(`Transcription audio: "${transcription}"`);
      
      // Extraire les informations de la requête
      const company = req.body.company ? JSON.parse(req.body.company) : { 
        name: 'Entreprise', 
        description: 'Description non spécifiée' 
      };
      
      const conversationId = req.body.conversationId;
      let history = [];
      
      if (req.body.history) {
        try {
          history = JSON.parse(req.body.history);
        } catch (parseError) {
          logger.warn('Erreur lors du parsing de l\'historique:', parseError);
        }
      }
      
      // Préparer le contexte
      const context = {
        history: history.map(msg => ({
          role: msg.role || (msg.isUser ? 'user' : 'assistant'),
          content: msg.content || msg.text
        }))
      };
      
      // Générer une réponse avec Hugging Face
      const result = await huggingfaceService.generateResponse(
        transcription,  // Utiliser la transcription réelle
        company,
        context
      );
      
      if (!result || !result.response) {
        return errorResponse(res, 500, 'Impossible de générer une réponse');
      }
      
      // Générer un fichier audio avec gTTS
      const fileName = `${uuidv4()}.mp3`;
      const filePath = path.join(AUDIO_CACHE_DIR, fileName);
      
      // Utiliser gTTS pour générer l'audio
      const ttsPromise = new Promise((resolve, reject) => {
        gtts.save(filePath, result.response, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(filePath);
          }
        });
      });
      
      await ttsPromise;
      
      // Construire l'URL de téléchargement
      const downloadUrl = `/api/speech/download/${fileName}`;
      
      // Ajouter la nouvelle paire question/réponse à l'historique
      const updatedHistory = context.history || [];
      updatedHistory.push({ role: 'user', content: transcription });
      updatedHistory.push({ role: 'assistant', content: result.response });
      
      // Limiter l'historique aux 10 derniers messages
      const limitedHistory = updatedHistory.slice(-10);
      
      // Nettoyer le fichier temporaire
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        logger.warn('Erreur lors de la suppression du fichier temporaire:', unlinkError);
      }
      
      // Répondre avec succès
      return successResponse(res, 200, 'Conversation audio générée avec succès', {
        originalAudio: req.file.originalname,
        transcription,  // Utiliser la transcription réelle
        generatedText: result.response,
        actions: result.actions || [],
        audioUrl: downloadUrl,
        fileName,
        conversationId: conversationId || uuidv4(),
        history: limitedHistory
      });
    } catch (error) {
      logger.error('Erreur lors du traitement de la conversation audio:', error);
      
      // Nettoyer le fichier temporaire en cas d'erreur
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        logger.warn('Erreur lors de la suppression du fichier temporaire:', unlinkError);
      }
      
      return errorResponse(res, 500, 'Erreur lors du traitement de la conversation audio', error);
    }
  });
};

/**
 * Télécharger un fichier audio généré
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const downloadAudio = (req, res) => {
  try {
    const fileName = req.params.fileName;
    const filePath = path.join(AUDIO_CACHE_DIR, fileName);

    // Vérifier si le fichier existe
    if (!fsSync.existsSync(filePath)) {
      return errorResponse(res, 404, 'Fichier audio non trouvé');
    }

    // Définir les headers pour le téléchargement
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    // Envoyer le fichier
    const fileStream = fsSync.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    logger.error('Erreur lors du téléchargement de l\'audio:', error);
    return errorResponse(
      res,
      500,
      'Erreur lors du téléchargement du fichier audio',
      error
    );
  }
};

module.exports = {
  processAudioToText,
  processAudioConversation,
  downloadAudio
}; 
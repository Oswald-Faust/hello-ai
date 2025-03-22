const Company = require('../models/Company');
const voiceService = require('../services/voiceService');
const logger = require('../utils/logger');
const { errorResponse, successResponse, validationErrorResponse } = require('../utils/responseHandler');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const openaiService = require('../services/openaiService');
const huggingfaceService = require('../services/huggingfaceService');
const gtts = require('node-gtts')('fr');
const fsSync = require('fs');

// Répertoire pour stocker les fichiers audio temporaires
const AUDIO_CACHE_DIR = process.env.TTS_CACHE_DIR || 'audio_cache';

// Créer le répertoire de cache s'il n'existe pas
if (!fsSync.existsSync(AUDIO_CACHE_DIR)) {
  fsSync.mkdirSync(AUDIO_CACHE_DIR, { recursive: true });
}

// Configuration pour l'upload des fichiers audio
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 Mo max
  fileFilter: (req, file, cb) => {
    const filetypes = /wav|mp3|ogg|m4a/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Seuls les fichiers audio (WAV, MP3, OGG, M4A) sont autorisés"));
  }
}).single('file');

/**
 * Obtenir la liste des voix disponibles
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 */
const getAvailableVoicesController = async (req, res) => {
  try {
    // Utiliser gTTS par défaut, sauf si un autre fournisseur est spécifié
    const provider = req.query.provider || 'gtts';
    
    logger.info(`Récupération des voix disponibles pour le fournisseur: ${provider}`);
    const voices = await voiceService.getAvailableVoices(provider);
    
    return successResponse(res, 200, 'Voix récupérées avec succès', voices);
  } catch (error) {
    logger.error('Erreur lors de la récupération des voix disponibles:', error);
    
    if (error.message && error.message.includes('non configurée')) {
      return errorResponse(res, 403, 'Clés API non configurées. Utilisez gTTS pour un service gratuit.');
    }
    
    return errorResponse(res, 500, error.message || 'Erreur lors de la récupération des voix');
  }
};

/**
 * Télécharger un fichier audio pour créer un modèle de voix personnalisé
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 */
const uploadCustomVoiceController = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        logger.error('Erreur lors de l\'upload du fichier:', err);
        return errorResponse(res, 400, err.message);
      }

    if (!req.file) {
        return validationErrorResponse(res, 'Aucun fichier audio fourni');
    }
    
      const { name, description, language } = req.body;
      const provider = req.body.provider || 'gtts';

    if (!name) {
        return validationErrorResponse(res, 'Le nom du modèle de voix est requis');
      }

      try {
        const audioFile = await fs.readFile(req.file.path);
        
        logger.info(`Création d'un modèle de voix personnalisé: ${name} avec fournisseur: ${provider}`);
        const result = await voiceService.uploadCustomVoice(audioFile, name, {
      description,
          language,
          provider
        });
        
        // Suppression du fichier temporaire
        await fs.unlink(req.file.path);
        
        return successResponse(res, 200, 'Modèle de voix créé avec succès', result);
      } catch (uploadError) {
        // Suppression du fichier temporaire en cas d'erreur
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          logger.error('Erreur lors de la suppression du fichier temporaire:', unlinkError);
        }
        
        logger.error('Erreur lors de la création du modèle de voix:', uploadError);
        
        if (uploadError.message && uploadError.message.includes('non configurée')) {
          return errorResponse(res, 403, 'Clés API non configurées. Utilisez gTTS pour un service gratuit.');
        }
        
        return errorResponse(res, 500, uploadError.message || 'Erreur lors de la création du modèle de voix');
      }
    });
  } catch (error) {
    logger.error('Erreur lors du traitement de l\'upload:', error);
    return errorResponse(res, 500, error.message || 'Erreur lors du traitement de l\'upload');
  }
};

/**
 * Tester la génération d'audio avec un texte et des paramètres spécifiques
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 */
const testVoiceGenerationController = async (req, res) => {
  try {
    const { text, voice } = req.body;
    
    if (!text) {
      return validationErrorResponse(res, 'Le texte à convertir est requis');
    }
    
    // Valeurs par défaut pour les tests
    const voiceConfig = {
      provider: voice?.provider || 'gtts',
      voiceId: voice?.voiceId,
      language: voice?.language || 'fr',
      speed: voice?.speed || 1.0,
      pitch: voice?.pitch || 1.0,
      format: voice?.format || 'mp3'
    };
    
    logger.info(`Test de génération audio pour: "${text.substring(0, 50)}..." avec config:`, voiceConfig);
    const audioFilePath = await voiceService.generateAudio(text, voiceConfig);
    
    // Calcul du nom de fichier pour l'URL
    const filename = path.basename(audioFilePath);
    const downloadUrl = `${req.protocol}://${req.get('host')}/api/voices/download/${filename}`;
    
    return successResponse(res, 200, 'Audio généré avec succès', { 
      audioFilePath,
      downloadUrl 
    });
  } catch (error) {
    logger.error('Erreur lors du test de génération audio:', error);
    
    if (error.message && error.message.includes('non configurée')) {
      return errorResponse(res, 403, 'Clés API non configurées. Utilisez gTTS pour un service gratuit.');
    }
    
    return errorResponse(res, 500, error.message || 'Erreur lors de la génération audio');
  }
};

/**
 * Télécharger un fichier audio généré
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 */
const downloadAudioController = async (req, res) => {
  try {
    const { filename } = req.params;
    const audioPath = path.join(process.cwd(), process.env.TTS_CACHE_DIR || 'audio_cache', filename);
    
    try {
      await fs.access(audioPath);
    } catch (error) {
      logger.error(`Fichier audio non trouvé: ${audioPath}`);
      return errorResponse(res, 404, 'Fichier audio non trouvé');
    }
    
    logger.info(`Téléchargement du fichier audio: ${audioPath}`);
    return res.download(audioPath);
  } catch (error) {
    logger.error('Erreur lors du téléchargement du fichier audio:', error);
    return errorResponse(res, 500, error.message || 'Erreur lors du téléchargement du fichier audio');
  }
};

/**
 * Configurer la voix par défaut pour une entreprise
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 */
const configureCompanyVoiceController = async (req, res) => {
  try {
    const { id } = req.params;
    const { provider, voiceId, speed, format } = req.body;
    
    if (!id) {
      return validationErrorResponse(res, 'L\'ID de l\'entreprise est requis');
    }
    
    // Ici, vous pourriez sauvegarder la configuration dans une base de données
    // Pour cet exemple, nous retournons simplement la configuration reçue
    const voiceConfig = {
      provider: provider || 'gtts',
      voiceId: voiceId,
      language: req.body.language || 'fr',
      speed: speed || 1.0,
      format: format || 'mp3'
    };
    
    logger.info(`Configuration de la voix pour l'entreprise ${id}:`, voiceConfig);
    
    return successResponse(res, 200, 'Configuration de voix sauvegardée', {
      companyId: id,
      voiceConfig
    });
  } catch (error) {
    logger.error('Erreur lors de la configuration de voix:', error);
    return errorResponse(res, 500, error.message || 'Erreur lors de la configuration de voix');
  }
};

/**
 * Générer un audio pour une entreprise avec la voix configurée
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 */
const generateCompanyAudioController = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    
    if (!id) {
      return validationErrorResponse(res, 'L\'ID de l\'entreprise est requis');
    }
    
    if (!text) {
      return validationErrorResponse(res, 'Le texte à convertir est requis');
    }
    
    // Dans une véritable application, vous récupéreriez la configuration depuis la base de données
    // Pour cet exemple, nous utilisons une configuration par défaut
    const voiceConfig = {
      provider: 'gtts', // Par défaut, on utilise gTTS qui est gratuit
      language: 'fr',   // Langue par défaut: français
      speed: 1.0,
      format: 'mp3'
    };
    
    logger.info(`Génération audio pour l'entreprise ${id}: "${text.substring(0, 50)}..."`);
    const audioFilePath = await voiceService.generateAudio(text, voiceConfig);
    
    // Calcul du nom de fichier pour l'URL
    const filename = path.basename(audioFilePath);
    const downloadUrl = `${req.protocol}://${req.get('host')}/api/voices/download/${filename}`;
    
    return successResponse(res, 200, 'Audio généré avec succès', { 
      audioFilePath,
      downloadUrl 
    });
  } catch (error) {
    logger.error('Erreur lors de la génération audio pour l\'entreprise:', error);
    return errorResponse(res, 500, error.message || 'Erreur lors de la génération audio');
  }
};

/**
 * Tester la conversation avec OpenAI et la génération vocale
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 */
const testConversationWithVoice = async (req, res) => {
  try {
    const { text, voice, companyInfo } = req.body;
    
    if (!text) {
      return validationErrorResponse(res, 'Le texte à envoyer est requis');
    }
    
    // Créer un objet entreprise simulé pour le test
    const company = {
      name: companyInfo?.name || 'Entreprise de test',
      description: companyInfo?.description || 'Description de l\'entreprise de test',
      voiceAssistant: {
        prompts: {
          baseSystemPrompt: companyInfo?.prompt || `Vous êtes un assistant vocal intelligent pour {{companyName}}. 
            Répondez aux questions des clients de manière utile et précise. 
            Gardez vos réponses concises et conversationnelles.`
        }
      }
    };
    
    logger.info(`Test de conversation avec OpenAI: "${text.substring(0, 50)}..."`);
    
    // Générer une réponse avec OpenAI
    const aiResponseData = await openaiService.generateResponse(text, company);
    const aiResponse = aiResponseData.response;
    
    logger.info(`Réponse OpenAI obtenue: "${aiResponse.substring(0, 50)}..."`);
    
    // Valeurs par défaut pour les tests
    const voiceConfig = {
      provider: voice?.provider || 'gtts',
      language: voice?.language || 'fr',
      speed: voice?.speed || 1.0,
      pitch: voice?.pitch || 1.0,
      format: voice?.format || 'mp3'
    };
    
    // Générer l'audio de la réponse
    logger.info(`Génération audio pour la réponse OpenAI`);
    const audioFilePath = await voiceService.generateAudio(aiResponse, voiceConfig);
    
    // Calcul du nom de fichier pour l'URL
    const filename = path.basename(audioFilePath);
    const downloadUrl = `${req.protocol}://${req.get('host')}/api/voices/download/${filename}`;
    
    return successResponse(res, 200, 'Conversation testée avec succès', { 
      input: text,
      response: aiResponse,
      audioFilePath,
      downloadUrl
    });
  } catch (error) {
    logger.error('Erreur lors du test de conversation avec OpenAI:', error);
    
    if (error.message && error.message.includes('non configurée')) {
      return errorResponse(res, 403, 'Clés API non configurées. Vérifiez votre configuration OpenAI ou gTTS.');
    }
    
    return errorResponse(res, 500, error.message || 'Erreur lors du test de conversation');
  }
};

/**
 * Générer une conversation avec Hugging Face et convertir en audio avec gTTS
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const generateConversation = async (req, res) => {
  try {
    const { text, voice, company } = req.body;

    if (!text) {
      return errorResponse(res, 400, 'Le texte est requis');
    }

    // Configurer la langue (par défaut français)
    const language = voice?.language || process.env.TTS_DEFAULT_LANGUAGE || 'fr';
    const speed = voice?.speed || process.env.TTS_DEFAULT_SPEED || 1.0;

    // Générer une réponse avec Hugging Face
    const result = await huggingfaceService.generateResponse(
      text,
      company || { name: 'Entreprise', description: 'Description non spécifiée' }
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
    const downloadUrl = `/api/voices/download/${fileName}`;

    // Répondre avec succès
    return successResponse(res, 200, 'Conversation générée avec succès', {
      originalText: text,
      generatedText: result.response,
      actions: result.actions || [],
      audioUrl: downloadUrl,
      fileName
    });
  } catch (error) {
    logger.error('Erreur lors de la génération de conversation:', error);
    return errorResponse(
      res,
      500,
      'Erreur lors de la génération de la conversation',
      error
    );
  }
};

/**
 * Générer une conversation avec historique
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const generateConversationWithHistory = async (req, res) => {
  try {
    const { text, voice, company, conversationId, history } = req.body;

    if (!text) {
      return errorResponse(res, 400, 'Le texte est requis');
    }

    // Configurer la langue (par défaut français)
    const language = voice?.language || process.env.TTS_DEFAULT_LANGUAGE || 'fr';
    const speed = voice?.speed || process.env.TTS_DEFAULT_SPEED || 1.0;

    // Préparer le contexte avec l'historique si disponible
    let context = {};
    if (history && Array.isArray(history)) {
      context.history = history.map(msg => ({
        role: msg.role || (msg.isUser ? 'user' : 'assistant'),
        content: msg.content || msg.text
      }));
    }

    // Générer une réponse avec Hugging Face
    const result = await huggingfaceService.generateResponse(
      text,
      company || { name: 'Entreprise', description: 'Description non spécifiée' },
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
    const downloadUrl = `/api/voices/download/${fileName}`;

    // Ajouter la nouvelle paire question/réponse à l'historique
    const updatedHistory = context.history || [];
    updatedHistory.push({ role: 'user', content: text });
    updatedHistory.push({ role: 'assistant', content: result.response });

    // Limiter l'historique aux 10 derniers messages pour éviter qu'il ne devienne trop grand
    const limitedHistory = updatedHistory.slice(-10);

    // Répondre avec succès
    return successResponse(res, 200, 'Conversation générée avec succès', {
      originalText: text,
      generatedText: result.response,
      actions: result.actions || [],
      audioUrl: downloadUrl,
      fileName,
      conversationId: conversationId || uuidv4(), // Générer un nouvel ID si aucun n'est fourni
      history: limitedHistory
    });
  } catch (error) {
    logger.error('Erreur lors de la génération de conversation avec historique:', error);
    return errorResponse(
      res,
      500,
      'Erreur lors de la génération de la conversation',
      error
    );
  }
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

/**
 * Analyser le sentiment d'un texte
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const analyzeSentiment = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return errorResponse(res, 400, 'Le texte est requis');
    }

    const sentiment = await huggingfaceService.analyzeSentiment(text);
    
    return successResponse(res, 200, 'Analyse de sentiment effectuée', {
      text,
      sentiment
    });
  } catch (error) {
    logger.error('Erreur lors de l\'analyse de sentiment:', error);
    return errorResponse(
      res,
      500,
      'Erreur lors de l\'analyse de sentiment',
      error
    );
  }
};

module.exports = {
  getAvailableVoices: getAvailableVoicesController,
  uploadCustomVoice: uploadCustomVoiceController,
  testVoiceGeneration: testVoiceGenerationController,
  downloadAudio: downloadAudioController,
  configureCompanyVoice: configureCompanyVoiceController,
  generateCompanyAudio: generateCompanyAudioController,
  testConversationWithVoice,
  generateConversation,
  generateConversationWithHistory,
  downloadAudio,
  analyzeSentiment
}; 
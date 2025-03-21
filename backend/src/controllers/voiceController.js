const Company = require('../models/Company');
const voiceService = require('../services/voiceService');
const logger = require('../utils/logger');
const { errorResponse, successResponse, validationErrorResponse } = require('../utils/responseHandler');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const openaiService = require('../services/openaiService');

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
    const { text, voice, companyInfo, useOpenAI = false } = req.body;
    
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
    
    logger.info(`Test de conversation ${useOpenAI ? 'avec OpenAI' : 'simulée'}: "${text.substring(0, 50)}..."`);
    
    // Variable pour stocker la réponse AI
    let aiResponse;
    
    if (useOpenAI) {
      // Utiliser OpenAI si explicitement demandé (attention aux coûts)
      try {
        const aiResponseData = await openaiService.generateResponse(text, company);
        aiResponse = aiResponseData.response;
        logger.info(`Réponse OpenAI obtenue: "${aiResponse.substring(0, 50)}..."`);
      } catch (openaiError) {
        logger.error('Erreur OpenAI:', openaiError);
        
        // Utiliser le mode simulation en cas d'erreur OpenAI
        aiResponse = simulateAIResponse(text, company);
        logger.info(`Utilisation de la réponse simulée suite à une erreur OpenAI: "${aiResponse.substring(0, 50)}..."`);
      }
    } else {
      // Mode simulation (gratuit) - génère une réponse sans appel API
      aiResponse = simulateAIResponse(text, company);
      logger.info(`Réponse simulée générée: "${aiResponse.substring(0, 50)}..."`);
    }
    
    // Valeurs par défaut pour les tests
    const voiceConfig = {
      provider: voice?.provider || 'gtts',
      language: voice?.language || 'fr',
      speed: voice?.speed || 1.0,
      pitch: voice?.pitch || 1.0,
      format: voice?.format || 'mp3'
    };
    
    // Générer l'audio de la réponse
    logger.info(`Génération audio pour la réponse`);
    const audioFilePath = await voiceService.generateAudio(aiResponse, voiceConfig);
    
    // Calcul du nom de fichier pour l'URL
    const filename = path.basename(audioFilePath);
    const downloadUrl = `${req.protocol}://${req.get('host')}/api/voices/download/${filename}`;
    
    return successResponse(res, 200, 'Conversation testée avec succès', { 
      input: text,
      response: aiResponse,
      mode: useOpenAI ? 'openai' : 'simulation',
      audioFilePath,
      downloadUrl
    });
  } catch (error) {
    logger.error('Erreur lors du test de conversation:', error);
    
    if (error.message && error.message.includes('non configurée')) {
      return errorResponse(res, 403, 'Clés API non configurées. Utilisez le mode simulation (useOpenAI=false).');
    }
    
    return errorResponse(res, 500, error.message || 'Erreur lors du test de conversation');
  }
};

/**
 * Simule une réponse d'IA sans faire d'appel API (gratuit)
 * @param {string} text - Texte de l'utilisateur
 * @param {Object} company - Informations sur l'entreprise
 * @returns {string} - Réponse simulée
 */
function simulateAIResponse(text, company) {
  // Extraire des mots clés du texte de l'utilisateur
  const lowerText = text.toLowerCase();
  
  // Réponses prédéfinies basées sur des mots clés
  if (lowerText.includes('bonjour') || lowerText.includes('salut') || lowerText.includes('hello')) {
    return `Bonjour ! Je suis l'assistant virtuel de ${company.name}. Comment puis-je vous aider aujourd'hui ?`;
  }
  
  if (lowerText.includes('tarif') || lowerText.includes('prix') || lowerText.includes('coût')) {
    return `Chez ${company.name}, nous proposons plusieurs formules tarifaires adaptées à vos besoins. Nous avons un forfait de base à partir de 99€/mois, et des options plus avancées selon les fonctionnalités souhaitées. Je serais ravi de vous donner plus de détails sur une formule en particulier.`;
  }
  
  if (lowerText.includes('service') || lowerText.includes('offre') || lowerText.includes('proposition')) {
    return `${company.name} propose une gamme complète de services vocaux, notamment la synthèse vocale, la reconnaissance vocale, et des solutions de centre d'appel automatisé. Nos services sont entièrement personnalisables selon les besoins spécifiques de votre entreprise.`;
  }
  
  if (lowerText.includes('contact') || lowerText.includes('joindre') || lowerText.includes('parler')) {
    return `Vous pouvez contacter notre équipe commerciale au 01 23 45 67 89 ou par email à contact@${company.name.toLowerCase().replace(/\s/g, '')}.com. Nous sommes disponibles du lundi au vendredi de 9h à 18h.`;
  }
  
  if (lowerText.includes('merci') || lowerText.includes('au revoir') || lowerText.includes('bye')) {
    return `Je vous en prie ! Merci d'avoir contacté ${company.name}. N'hésitez pas à revenir vers nous si vous avez d'autres questions. Bonne journée !`;
  }
  
  // Réponse par défaut si aucun mot clé n'est détecté
  return `Merci pour votre message concernant "${text.substring(0, 30)}...". Chez ${company.name}, nous sommes dédiés à fournir des solutions vocales de haute qualité. Pour toute information spécifique, n'hésitez pas à préciser votre demande. Comment puis-je vous aider davantage ?`;
}

module.exports = {
  getAvailableVoices: getAvailableVoicesController,
  uploadCustomVoice: uploadCustomVoiceController,
  testVoiceGeneration: testVoiceGenerationController,
  downloadAudio: downloadAudioController,
  configureCompanyVoice: configureCompanyVoiceController,
  generateCompanyAudio: generateCompanyAudioController,
  testConversationWithVoice
}; 
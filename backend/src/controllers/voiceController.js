const Company = require('../models/Company');
const voiceService = require('../services/voiceService');
const logger = require('../utils/logger');
const { errorResponse, successResponse } = require('../utils/responseHandler');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

/**
 * Liste des voix disponibles
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getAvailableVoices = async (req, res) => {
  try {
    const voices = await voiceService.getAvailableVoices();
    return res.status(200).json(successResponse('Liste des voix récupérée avec succès', voices));
  } catch (error) {
    logger.error('Erreur lors de la récupération des voix disponibles:', error);
    return res.status(500).json(errorResponse('Erreur lors de la récupération des voix disponibles'));
  }
};

/**
 * Télécharger une voix personnalisée
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.uploadCustomVoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, language } = req.body;
    
    // Vérifier que l'ID d'entreprise est valide
    if (!id) {
      return res.status(400).json(errorResponse('ID d\'entreprise requis'));
    }
    
    // Vérifier que le fichier audio est présent
    if (!req.file) {
      return res.status(400).json(errorResponse('Fichier audio requis'));
    }
    
    // Vérifier que le nom est présent
    if (!name) {
      return res.status(400).json(errorResponse('Nom de la voix requis'));
    }
    
    // Trouver l'entreprise
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json(errorResponse('Entreprise non trouvée'));
    }
    
    // Vérifier les permissions
    if (!req.user.isAdmin && req.user.company.toString() !== id) {
      return res.status(403).json(errorResponse('Vous n\'avez pas les droits pour cette action'));
    }
    
    // Télécharger la voix personnalisée
    const audioBuffer = await fs.readFile(req.file.path);
    const customVoice = await voiceService.uploadCustomVoice(audioBuffer, name, {
      description,
      language: language || 'fr-FR'
    });
    
    // Mettre à jour l'entreprise avec la nouvelle voix
    if (!company.voiceAssistant) {
      company.voiceAssistant = { voice: {} };
    } else if (!company.voiceAssistant.voice) {
      company.voiceAssistant.voice = {};
    }
    
    company.voiceAssistant.voice.provider = 'fishaudio';
    company.voiceAssistant.voice.customVoiceId = customVoice.id;
    company.voiceAssistant.voice.customVoiceName = name;
    await company.save();
    
    // Supprimer le fichier temporaire
    await fs.unlink(req.file.path);
    
    return res.status(200).json(successResponse('Voix personnalisée téléchargée avec succès', {
      voiceId: customVoice.id,
      name: customVoice.name
    }));
  } catch (error) {
    logger.error('Erreur lors du téléchargement de la voix personnalisée:', error);
    return res.status(500).json(errorResponse('Erreur lors du téléchargement de la voix personnalisée'));
  }
};

/**
 * Tester une voix
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.testVoice = async (req, res) => {
  try {
    const { text, voiceConfig } = req.body;
    
    // Vérifier que le texte est présent
    if (!text) {
      return res.status(400).json(errorResponse('Texte requis'));
    }
    
    // Générer l'audio
    const audioFilePath = await voiceService.generateAudio(text, voiceConfig);
    
    // Créer un nom de fichier temporaire pour le téléchargement
    const fileName = `test_${uuidv4()}.${voiceConfig.format || 'mp3'}`;
    const downloadPath = `/api/voices/download/${fileName}`;
    
    // Stocker temporairement le chemin du fichier pour le téléchargement
    req.app.locals.tempAudioFiles = req.app.locals.tempAudioFiles || {};
    req.app.locals.tempAudioFiles[fileName] = audioFilePath;
    
    // Configurer une suppression automatique après 1 heure
    setTimeout(() => {
      if (req.app.locals.tempAudioFiles && req.app.locals.tempAudioFiles[fileName]) {
        delete req.app.locals.tempAudioFiles[fileName];
      }
    }, 3600000); // 1 heure
    
    return res.status(200).json(successResponse('Test audio généré avec succès', {
      downloadUrl: downloadPath
    }));
  } catch (error) {
    logger.error('Erreur lors du test de la voix:', error);
    return res.status(500).json(errorResponse('Erreur lors du test de la voix'));
  }
};

/**
 * Télécharger un fichier audio de test
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.downloadTestAudio = async (req, res) => {
  try {
    const { fileName } = req.params;
    
    // Vérifier que le fichier existe
    if (!req.app.locals.tempAudioFiles || !req.app.locals.tempAudioFiles[fileName]) {
      return res.status(404).json(errorResponse('Fichier audio non trouvé'));
    }
    
    const filePath = req.app.locals.tempAudioFiles[fileName];
    res.download(filePath, fileName);
  } catch (error) {
    logger.error('Erreur lors du téléchargement du fichier audio:', error);
    return res.status(500).json(errorResponse('Erreur lors du téléchargement du fichier audio'));
  }
};

/**
 * Mettre à jour la configuration de voix d'une entreprise
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.updateVoiceConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const voiceConfig = req.body;
    
    // Vérifier que l'ID d'entreprise est valide
    if (!id) {
      return res.status(400).json(errorResponse('ID d\'entreprise requis'));
    }
    
    // Trouver l'entreprise
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json(errorResponse('Entreprise non trouvée'));
    }
    
    // Vérifier les permissions
    if (!req.user.isAdmin && req.user.company.toString() !== id) {
      return res.status(403).json(errorResponse('Vous n\'avez pas les droits pour cette action'));
    }
    
    // Mettre à jour la configuration de voix
    if (!company.voiceAssistant) {
      company.voiceAssistant = { voice: voiceConfig };
    } else {
      company.voiceAssistant.voice = {
        ...company.voiceAssistant.voice,
        ...voiceConfig
      };
    }
    
    await company.save();
    
    return res.status(200).json(successResponse('Configuration de voix mise à jour avec succès', company.voiceAssistant.voice));
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de la configuration de voix:', error);
    return res.status(500).json(errorResponse('Erreur lors de la mise à jour de la configuration de voix'));
  }
};

/**
 * Générer un audio à partir du texte pour une entreprise spécifique
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.generateCompanyAudio = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    
    // Vérifier que l'ID d'entreprise est valide
    if (!id) {
      return res.status(400).json(errorResponse('ID d\'entreprise requis'));
    }
    
    // Vérifier que le texte est présent
    if (!text) {
      return res.status(400).json(errorResponse('Texte requis'));
    }
    
    // Trouver l'entreprise
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json(errorResponse('Entreprise non trouvée'));
    }
    
    // Vérifier que la configuration de voix existe
    if (!company.voiceAssistant || !company.voiceAssistant.voice) {
      return res.status(400).json(errorResponse('Configuration de voix non définie pour cette entreprise'));
    }
    
    // Générer l'audio
    const audioFilePath = await voiceService.generateAudio(text, company.voiceAssistant.voice);
    
    // Créer un nom de fichier temporaire pour le téléchargement
    const fileName = `company_${id}_${uuidv4()}.${company.voiceAssistant.voice.format || 'mp3'}`;
    const downloadPath = `/api/voices/download/${fileName}`;
    
    // Stocker temporairement le chemin du fichier pour le téléchargement
    req.app.locals.tempAudioFiles = req.app.locals.tempAudioFiles || {};
    req.app.locals.tempAudioFiles[fileName] = audioFilePath;
    
    // Configurer une suppression automatique après 1 heure
    setTimeout(() => {
      if (req.app.locals.tempAudioFiles && req.app.locals.tempAudioFiles[fileName]) {
        delete req.app.locals.tempAudioFiles[fileName];
      }
    }, 3600000); // 1 heure
    
    return res.status(200).json(successResponse('Audio généré avec succès', {
      downloadUrl: downloadPath
    }));
  } catch (error) {
    logger.error('Erreur lors de la génération de l\'audio:', error);
    return res.status(500).json(errorResponse('Erreur lors de la génération de l\'audio'));
  }
}; 
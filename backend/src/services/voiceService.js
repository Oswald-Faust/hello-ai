const axios = require('axios');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

/**
 * Service pour la gestion des voix personnalisées
 * Supporte différents fournisseurs dont Fish Audio
 */

// Configuration par défaut pour Fish Audio
const FISH_AUDIO_API_URL = 'https://api.fish.audio/v1/tts';
const FISH_AUDIO_API_KEY = '5fe6e1f02cb54fe5bac8745d9096c737';

// Répertoire de cache pour les fichiers audio
const AUDIO_CACHE_DIR = path.join(process.cwd(), 'audio_cache');

// Créer le répertoire de cache s'il n'existe pas
const initAudioCache = async () => {
  try {
    await fs.mkdir(AUDIO_CACHE_DIR, { recursive: true });
    logger.info(`Répertoire de cache audio créé: ${AUDIO_CACHE_DIR}`);
  } catch (error) {
    logger.error('Erreur lors de la création du répertoire de cache audio:', error);
    throw error;
  }
};

/**
 * Générer un fichier audio à partir de texte avec Fish Audio
 * @param {string} text - Texte à convertir en audio
 * @param {Object} options - Options de voix (voice_id, language, etc.)
 * @returns {Promise<string>} - Chemin vers le fichier audio généré
 */
const generateAudioWithFishAudio = async (text, options = {}) => {
  try {
    if (!FISH_AUDIO_API_KEY) {
      throw new Error('Clé API Fish Audio non configurée');
    }

    // Paramètres par défaut
    const voiceId = options.voiceId || 'fr_female_1';
    const language = options.language || 'fr-FR';
    const speed = options.speed || 1.0;
    const pitch = options.pitch || 1.0;
    const format = options.format || 'mp3';
    
    // Créer un hash unique pour ce texte et ces paramètres
    const hash = require('crypto')
      .createHash('md5')
      .update(`${text}-${voiceId}-${language}-${speed}-${pitch}`)
      .digest('hex');
    
    const cacheFilePath = path.join(AUDIO_CACHE_DIR, `${hash}.${format}`);
    
    // Vérifier si le fichier est déjà en cache
    try {
      await fs.access(cacheFilePath);
      logger.info(`Fichier audio trouvé en cache: ${cacheFilePath}`);
      return cacheFilePath;
    } catch (error) {
      // Le fichier n'existe pas en cache, on le génère
      logger.info(`Génération d'un nouveau fichier audio pour: "${text.substring(0, 50)}..."`);
    }

    // Appel à l'API Fish Audio
    const response = await axios({
      method: 'post',
      url: `${FISH_AUDIO_API_URL}/v1/tts`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FISH_AUDIO_API_KEY}`
      },
      data: {
        text,
        voice_id: voiceId,
        language,
        speed,
        pitch,
        output_format: format
      },
      responseType: 'arraybuffer'
    });

    // Sauvegarder la réponse dans un fichier
    await fs.writeFile(cacheFilePath, response.data);
    logger.info(`Fichier audio généré et sauvegardé: ${cacheFilePath}`);
    
    return cacheFilePath;
  } catch (error) {
    logger.error('Erreur lors de la génération audio avec Fish Audio:', error);
    throw error;
  }
};

/**
 * Obtenir la liste des voix disponibles sur Fish Audio
 * @returns {Promise<Array>} - Liste des voix disponibles
 */
const getAvailableVoices = async () => {
  try {
    if (!FISH_AUDIO_API_KEY) {
      throw new Error('Clé API Fish Audio non configurée');
    }

    const response = await axios({
      method: 'get',
      url: `${FISH_AUDIO_API_URL}/v1/voices`,
      headers: {
        'Authorization': `Bearer ${FISH_AUDIO_API_KEY}`
      }
    });

    return response.data.voices;
  } catch (error) {
    logger.error('Erreur lors de la récupération des voix disponibles:', error);
    throw error;
  }
};

/**
 * Télécharger un modèle de voix personnalisé vers Fish Audio
 * @param {Buffer} audioFile - Fichier audio d'exemple pour la voix
 * @param {string} name - Nom du modèle de voix
 * @param {Object} options - Options supplémentaires
 * @returns {Promise<Object>} - Informations sur le modèle de voix créé
 */
const uploadCustomVoice = async (audioFile, name, options = {}) => {
  try {
    if (!FISH_AUDIO_API_KEY) {
      throw new Error('Clé API Fish Audio non configurée');
    }

    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('name', name);
    
    if (options.description) {
      formData.append('description', options.description);
    }
    
    if (options.language) {
      formData.append('language', options.language);
    }

    const response = await axios({
      method: 'post',
      url: `${FISH_AUDIO_API_URL}/v1/voices/custom`,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${FISH_AUDIO_API_KEY}`
      },
      data: formData
    });

    logger.info(`Modèle de voix personnalisé créé: ${name}`);
    return response.data;
  } catch (error) {
    logger.error('Erreur lors du téléchargement du modèle de voix personnalisé:', error);
    throw error;
  }
};

/**
 * Générer un audio avec la voix appropriée (adapté aux différents fournisseurs)
 * @param {string} text - Texte à convertir en audio
 * @param {Object} voiceConfig - Configuration de la voix
 * @returns {Promise<string>} - URL ou chemin vers le fichier audio généré
 */
const generateAudio = async (text, voiceConfig = {}) => {
  try {
    // Déterminer le fournisseur de voix
    const provider = voiceConfig.provider || 'fishaudio';
    
    switch (provider.toLowerCase()) {
      case 'fishaudio':
        return await generateAudioWithFishAudio(text, voiceConfig);
      // Ajoutez d'autres fournisseurs ici au besoin
      default:
        throw new Error(`Fournisseur de voix non supporté: ${provider}`);
    }
  } catch (error) {
    logger.error('Erreur lors de la génération audio:', error);
    throw error;
  }
};

// Initialiser le cache au démarrage
(async () => {
  try {
    await initAudioCache();
  } catch (error) {
    logger.warn('Erreur lors de l\'initialisation du cache audio:', error);
  }
})();

module.exports = {
  generateAudio,
  getAvailableVoices,
  uploadCustomVoice,
  generateAudioWithFishAudio
}; 
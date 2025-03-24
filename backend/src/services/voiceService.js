const axios = require('axios');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');
const gTTS = require('node-gtts');

/**
 * Service pour la gestion des voix personnalisées
 * Utilise gTTS comme solution principale (gratuite et sans API requise)
 * Garde la compatibilité avec Fish Audio et PlayHT si nécessaire
 */

// Configuration par défaut pour gTTS
const TTS_DEFAULT_LANGUAGE = process.env.TTS_DEFAULT_LANGUAGE || 'fr';
const TTS_DEFAULT_SPEED = parseFloat(process.env.TTS_DEFAULT_SPEED) || 1.0;

// Configuration par défaut pour Fish Audio
const FISH_AUDIO_API_URL = 'https://api.fish.audio/v1/tts';
const FISH_AUDIO_API_KEY = process.env.FISH_AUDIO_API_KEY;

// Configuration par défaut pour PlayHT
const PLAYHT_API_URL = 'https://api.play.ht/api/v2';
const PLAYHT_API_KEY = process.env.PLAYHT_API_KEY;
const PLAYHT_USER_ID = process.env.PLAYHT_USER_ID;

// Répertoire de cache pour les fichiers audio
const AUDIO_CACHE_DIR = path.join(process.cwd(), process.env.TTS_CACHE_DIR || 'audio_cache');

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
 * Générer un fichier audio à partir de texte avec gTTS (Google TTS)
 * @param {string} text - Texte à convertir en audio
 * @param {Object} options - Options de voix (langue, vitesse, etc.)
 * @returns {Promise<string>} - Chemin vers le fichier audio généré
 */
const generateAudioWithGTTS = async (text, options = {}) => {
  try {
    // Paramètres par défaut
    const language = options.language || TTS_DEFAULT_LANGUAGE;
    const speed = options.speed || TTS_DEFAULT_SPEED;
    const voiceId = options.voiceId || 'default'; // Pour la compatibilité
    const format = 'mp3'; // gTTS génère toujours du MP3
    
    // Créer un hash unique pour ce texte et ces paramètres
    const crypto = require('crypto');
    const hash = crypto
      .createHash('md5')
      .update(`${text}-${language}-${speed}-${voiceId}`)
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

    // Créer une instance de gTTS avec la langue choisie
    const gtts = gTTS(language);
    
    // Promisifier la fonction save
    return new Promise((resolve, reject) => {
      gtts.save(cacheFilePath, text, (err) => {
        if (err) {
          logger.error('Erreur lors de la génération audio avec gTTS:', err);
          return reject(err);
        }
        
        logger.info(`Fichier audio généré et sauvegardé: ${cacheFilePath}`);
        resolve(cacheFilePath);
      });
    });
  } catch (error) {
    logger.error('Erreur lors de la génération audio avec gTTS:', error);
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
      .update(`fishaudio-${text}-${voiceId}-${language}-${speed}-${pitch}`)
      .digest('hex');
    
    const cacheFilePath = path.join(AUDIO_CACHE_DIR, `${hash}.${format}`);
    
    // Vérifier si le fichier est déjà en cache
    try {
      await fs.access(cacheFilePath);
      logger.info(`Fichier audio trouvé en cache: ${cacheFilePath}`);
      return cacheFilePath;
    } catch (error) {
      // Le fichier n'existe pas en cache, on le génère
      logger.info(`Génération d'un nouveau fichier audio avec Fish Audio pour: "${text.substring(0, 50)}..."`);
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
 * Générer un fichier audio à partir de texte avec PlayHT
 * @param {string} text - Texte à convertir en audio
 * @param {Object} options - Options de voix (voiceId, language, etc.)
 * @returns {Promise<string>} - Chemin vers le fichier audio généré
 */
const generateAudioWithPlayHT = async (text, options = {}) => {
  try {
    if (!PLAYHT_API_KEY || !PLAYHT_USER_ID) {
      throw new Error('Clés API PlayHT non configurées');
    }

    // Paramètres par défaut
    const voiceId = options.voiceId || 's3://voice-cloning-zero-shot/7c38b588-14e8-42b9-bacd-e03d1d673c3c/pauline/manifest.json';
    const speed = options.speed || 1.0;
    const format = options.format || 'mp3';
    
    // Créer un hash unique pour ce texte et ces paramètres
    const hash = require('crypto')
      .createHash('md5')
      .update(`playht-${text}-${voiceId}-${speed}`)
      .digest('hex');
    
    const cacheFilePath = path.join(AUDIO_CACHE_DIR, `${hash}.${format}`);
    
    // Vérifier si le fichier est déjà en cache
    try {
      await fs.access(cacheFilePath);
      logger.info(`Fichier audio trouvé en cache: ${cacheFilePath}`);
      return cacheFilePath;
    } catch (error) {
      // Le fichier n'existe pas en cache, on le génère
      logger.info(`Génération d'un nouveau fichier audio avec PlayHT pour: "${text.substring(0, 50)}..."`);
    }

    // Étape 1: Créer la transcription TTS
    const createResponse = await axios({
      method: 'post',
      url: `${PLAYHT_API_URL}/tts`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': PLAYHT_API_KEY,
        'X-User-ID': PLAYHT_USER_ID
      },
      data: {
        text,
        voice: voiceId,
        speed,
        quality: 'premium'
      }
    });

    const transcriptionId = createResponse.data.transcriptionId;
    logger.info(`Transcription PlayHT créée: ${transcriptionId}`);
    
    // Étape 2: Attendre que l'audio soit prêt
    let audioUrl = null;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!audioUrl && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde
      
      const statusResponse = await axios({
        method: 'get',
        url: `${PLAYHT_API_URL}/tts/${transcriptionId}`,
        headers: {
          'Authorization': PLAYHT_API_KEY,
          'X-User-ID': PLAYHT_USER_ID
        }
      });
      
      if (statusResponse.data.status === 'COMPLETED') {
        audioUrl = statusResponse.data.audioUrl;
      }
      
      attempts++;
    }
    
    if (!audioUrl) {
      throw new Error('Échec de la génération audio avec PlayHT: délai d\'attente dépassé');
    }
    
    // Étape 3: Télécharger le fichier audio
    const audioResponse = await axios({
      method: 'get',
      url: audioUrl,
      responseType: 'arraybuffer'
    });

    // Sauvegarder la réponse dans un fichier
    await fs.writeFile(cacheFilePath, audioResponse.data);
    logger.info(`Fichier audio généré et sauvegardé: ${cacheFilePath}`);
    
    return cacheFilePath;
  } catch (error) {
    logger.error('Erreur lors de la génération audio avec PlayHT:', error);
    throw error;
  }
};

/**
 * Obtenir la liste des voix disponibles
 * @param {string} provider - Fournisseur de voix (gtts, fishaudio, playht)
 * @returns {Promise<Array>} - Liste des voix disponibles
 */
const getAvailableVoices = async (provider = 'gtts') => {
  try {
    if (provider.toLowerCase() === 'gtts') {
      // Liste des langues disponibles dans gTTS
      const voices = [
        { id: 'fr', name: 'Français', language: 'fr', gender: 'neutral' },
        { id: 'fr-ca', name: 'Français (Canada)', language: 'fr-ca', gender: 'neutral' },
        { id: 'fr-fr', name: 'Français (France)', language: 'fr-fr', gender: 'neutral' },
        { id: 'en', name: 'Anglais', language: 'en', gender: 'neutral' },
        { id: 'en-us', name: 'Anglais (US)', language: 'en-us', gender: 'neutral' },
        { id: 'en-gb', name: 'Anglais (UK)', language: 'en-gb', gender: 'neutral' },
        { id: 'es', name: 'Espagnol', language: 'es', gender: 'neutral' },
        { id: 'de', name: 'Allemand', language: 'de', gender: 'neutral' },
        { id: 'it', name: 'Italien', language: 'it', gender: 'neutral' },
        { id: 'pt', name: 'Portugais', language: 'pt', gender: 'neutral' },
        { id: 'ru', name: 'Russe', language: 'ru', gender: 'neutral' },
        { id: 'ja', name: 'Japonais', language: 'ja', gender: 'neutral' },
        { id: 'ko', name: 'Coréen', language: 'ko', gender: 'neutral' },
        { id: 'zh-cn', name: 'Chinois (Simplifié)', language: 'zh-cn', gender: 'neutral' },
        { id: 'zh-tw', name: 'Chinois (Traditionnel)', language: 'zh-tw', gender: 'neutral' },
        { id: 'ar', name: 'Arabe', language: 'ar', gender: 'neutral' }
      ];
      
      return voices;
    } else if (provider.toLowerCase() === 'fishaudio') {
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
    } else if (provider.toLowerCase() === 'playht') {
      if (!PLAYHT_API_KEY || !PLAYHT_USER_ID) {
        throw new Error('Clés API PlayHT non configurées');
      }

      const response = await axios({
        method: 'get',
        url: `${PLAYHT_API_URL}/voices`,
        headers: {
          'Authorization': PLAYHT_API_KEY,
          'X-User-ID': PLAYHT_USER_ID
        }
      });

      return response.data;
    } else if (provider.toLowerCase() === 'fonoster') {
      // Liste des voix disponibles pour Fonoster
      const voices = [
        { id: 'fr-FR-Standard-A', name: 'Français - Julie', gender: 'female', language: 'fr-FR', provider: 'fonoster' },
        { id: 'fr-FR-Standard-B', name: 'Français - Thomas', gender: 'male', language: 'fr-FR', provider: 'fonoster' },
        { id: 'fr-FR-Standard-C', name: 'Français - Emma', gender: 'female', language: 'fr-FR', provider: 'fonoster' },
        { id: 'fr-FR-Standard-D', name: 'Français - Antoine', gender: 'male', language: 'fr-FR', provider: 'fonoster' },
        { id: 'fr-FR-Standard-E', name: 'Français - Sophie', gender: 'female', language: 'fr-FR', provider: 'fonoster' }
      ];
      
      return voices;
    } else {
      throw new Error(`Fournisseur non supporté: ${provider}`);
    }
  } catch (error) {
    logger.error(`Erreur lors de la récupération des voix disponibles (${provider}):`, error);
    throw error;
  }
};

/**
 * Télécharger un modèle de voix personnalisé
 * Note: Cette fonction est limitée avec gTTS car c'est un service gratuit sans fonctionnalités avancées.
 * Pour les voix personnalisées, Fish Audio ou PlayHT sont recommandés.
 * @param {Buffer} audioFile - Fichier audio d'exemple pour la voix
 * @param {string} name - Nom du modèle de voix
 * @param {Object} options - Options supplémentaires
 * @returns {Promise<Object>} - Informations sur le modèle de voix créé
 */
const uploadCustomVoice = async (audioFile, name, options = {}) => {
  try {
    const provider = options.provider || 'gtts';
    
    if (provider.toLowerCase() === 'gtts') {
      // gTTS ne supporte pas le clonage de voix, on retourne une "fausse" voix custom
      logger.info(`gTTS ne supporte pas le clonage de voix, utilisation d'une voix générique ${options.language || 'fr'}`);
      return {
        id: options.language || 'fr',
        name: name,
        description: options.description || 'Voix générée par gTTS',
        language: options.language || 'fr',
        success: true,
        message: 'Utilisation d\'une voix générique gTTS (le clonage de voix n\'est pas disponible)'
      };
    } else if (provider.toLowerCase() === 'fishaudio') {
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

      logger.info(`Modèle de voix personnalisé créé sur Fish Audio: ${name}`);
      return response.data;
    } else if (provider.toLowerCase() === 'playht') {
      if (!PLAYHT_API_KEY || !PLAYHT_USER_ID) {
        throw new Error('Clés API PlayHT non configurées');
      }

      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('name', name);
      
      if (options.description) {
        formData.append('description', options.description);
      }

      const response = await axios({
        method: 'post',
        url: `${PLAYHT_API_URL}/voice-cloning`,
        headers: {
          'Authorization': PLAYHT_API_KEY,
          'X-User-ID': PLAYHT_USER_ID,
          'Content-Type': 'multipart/form-data'
        },
        data: formData
      });

      logger.info(`Modèle de voix personnalisé créé sur PlayHT: ${name}`);
    return response.data;
    } else {
      throw new Error(`Fournisseur non supporté pour le clonage de voix: ${provider}`);
    }
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
    const provider = voiceConfig.provider || 'gtts';
    
    switch (provider.toLowerCase()) {
      case 'gtts':
        return await generateAudioWithGTTS(text, voiceConfig);
      case 'fishaudio':
        return await generateAudioWithFishAudio(text, voiceConfig);
      case 'playht':
        return await generateAudioWithPlayHT(text, voiceConfig);
      default:
        // Par défaut, utiliser gTTS
        logger.warn(`Fournisseur de voix non supporté: ${provider}, utilisation de gTTS à la place`);
        return await generateAudioWithGTTS(text, voiceConfig);
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
  generateAudioWithGTTS,
  generateAudioWithFishAudio,
  generateAudioWithPlayHT
}; 
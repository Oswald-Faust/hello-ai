import api from './api';

/**
 * Service pour gérer les fonctionnalités de voix et de synthèse vocale
 */
const voiceService = {
  /**
   * Récupérer la liste des voix disponibles
   * @param {string} provider - Fournisseur de voix (playht par défaut, fishaudio en alternative)
   * @returns {Promise<Array>} - Liste des voix disponibles
   */
  getAvailableVoices: async (provider = 'playht') => {
    try {
      const response = await api.get(`/voices/available?provider=${provider}`);
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des voix:', error);
      throw error;
    }
  },

  /**
   * Tester une voix avec un texte
   * @param {string} text - Texte à synthétiser
   * @param {Object} voiceConfig - Configuration de la voix
   * @returns {Promise<string>} - URL pour télécharger l'audio généré
   */
  testVoice: async (text, voiceConfig = { provider: 'playht' }) => {
    try {
      const response = await api.post('/voices/test', {
        text,
        voiceConfig
      });
      return response.data.data.downloadUrl;
    } catch (error) {
      console.error('Erreur lors du test de la voix:', error);
      throw error;
    }
  },

  /**
   * Télécharger une voix personnalisée pour une entreprise
   * @param {string} companyId - ID de l'entreprise
   * @param {File} audioFile - Fichier audio d'exemple
   * @param {string} name - Nom de la voix
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<Object>} - Informations sur la voix créée
   */
  uploadCustomVoice: async (companyId, audioFile, name, options = {}) => {
    try {
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('name', name);
      
      if (options.description) {
        formData.append('description', options.description);
      }
      
      if (options.language) {
        formData.append('language', options.language);
      }
      
      // Utiliser PlayHT par défaut
      formData.append('provider', options.provider || 'playht');

      const response = await api.post(`/voices/upload/${companyId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors du téléchargement de la voix personnalisée:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour la configuration de voix d'une entreprise
   * @param {string} companyId - ID de l'entreprise
   * @param {Object} voiceConfig - Configuration de la voix
   * @returns {Promise<Object>} - Configuration mise à jour
   */
  updateVoiceConfig: async (companyId, voiceConfig) => {
    try {
      const response = await api.put(`/voices/config/${companyId}`, voiceConfig);
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la configuration de voix:', error);
      throw error;
    }
  },

  /**
   * Générer un audio pour une entreprise spécifique
   * @param {string} companyId - ID de l'entreprise
   * @param {string} text - Texte à synthétiser
   * @returns {Promise<string>} - URL pour télécharger l'audio généré
   */
  generateCompanyAudio: async (companyId, text) => {
    try {
      const response = await api.post(`/voices/generate/${companyId}`, { text });
      return response.data.data.downloadUrl;
    } catch (error) {
      console.error('Erreur lors de la génération audio:', error);
      throw error;
    }
  },

  /**
   * Récupérer les voix françaises recommandées
   * @param {string} provider - Fournisseur de voix (playht par défaut)
   * @returns {Array} - Liste des voix françaises recommandées
   */
  getRecommendedFrenchVoices: (provider = 'playht') => {
    if (provider === 'playht') {
      return [
        {
          id: 's3://voice-cloning-zero-shot/7c38b588-14e8-42b9-bacd-e03d1d673c3c/pauline/manifest.json',
          name: 'Pauline',
          gender: 'female',
          description: 'Voix française féminine naturelle'
        },
        {
          id: 's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/f-fr-5/manifest.json',
          name: 'Émilie',
          gender: 'female',
          description: 'Voix française féminine claire'
        },
        {
          id: 's3://voice-cloning-zero-shot/2391d3f8-16cc-4c96-a7dc-e30e81881305/fr-male-2/manifest.json',
          name: 'François',
          gender: 'male',
          description: 'Voix française masculine professionnelle'
        }
      ];
    } else if (provider === 'fishaudio') {
      return [
        {
          id: 'fr_female_1',
          name: 'Marie',
          gender: 'female',
          description: 'Voix féminine française standard'
        },
        {
          id: 'fr_male_1',
          name: 'Pierre',
          gender: 'male',
          description: 'Voix masculine française standard'
        }
      ];
    }
    
    return [];
  }
};

export default voiceService; 
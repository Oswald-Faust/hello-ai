import API from './api';

export interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  language: string;
  accent?: string;
  provider: string;
}

export interface VoiceTestResponse {
  success: boolean;
  audioUrl: string;
  message?: string;
}

/**
 * Service pour gérer les fonctionnalités de voix et de synthèse vocale
 */
const voiceService = {
  /**
   * Récupère la liste des voix disponibles
   * @param provider - Le fournisseur de voix à utiliser (optionnel)
   * @returns La liste des voix disponibles
   */
  getAvailableVoices: async (provider?: string): Promise<Voice[]> => {
    // Utiliser un cache local pour éviter les requêtes répétées
    const cacheKey = `voices_${provider || 'default'}`;
    const cachedVoices = sessionStorage.getItem(cacheKey);
    
    if (cachedVoices) {
      try {
        const parsedVoices = JSON.parse(cachedVoices);
        // Vérifier si le cache n'est pas trop ancien (15 minutes)
        const cacheTime = parseInt(sessionStorage.getItem(`${cacheKey}_time`) || '0');
        const now = Date.now();
        
        if (now - cacheTime < 15 * 60 * 1000) {
          console.log(`[VoiceService] Utilisation des voix en cache pour ${provider}`);
          return parsedVoices;
        }
      } catch (e) {
        console.error('[VoiceService] Erreur lors de la lecture du cache:', e);
        // Continuer avec la requête API en cas d'erreur de cache
      }
    }
    
    // En cas d'échec ou absence de cache, utiliser les voix recommandées comme fallback initial
    const fallbackVoices = voiceService.getRecommendedFrenchVoices(provider);
    
    try {
      // Configurer un timeout plus court que celui d'Axios par défaut
      const params = provider ? { provider } : {};
      const response = await API.get('/voices/available', { 
        params,
        timeout: 8000 // 8 secondes seulement
      });
      
      const voices = response.data.data;
      
      // Mettre en cache les résultats
      if (voices && voices.length > 0) {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(voices));
          sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString());
        } catch (e) {
          console.error('[VoiceService] Erreur lors de la mise en cache des voix:', e);
        }
      }
      
      return voices;
    } catch (error) {
      console.error(`[VoiceService] Erreur lors du chargement des voix (${provider}):`, error);
      
      // En cas d'erreur, retourner le fallback
      return fallbackVoices as Voice[];
    }
  },

  /**
   * Teste une voix avec un texte spécifique
   * @param text - Le texte à convertir en voix
   * @param voiceConfig - La configuration de la voix
   * @returns Les informations sur l'audio généré
   */
  testVoice: async (text: string, voiceConfig: any): Promise<VoiceTestResponse> => {
    try {
      console.log('Envoi de la requête de test avec config:', voiceConfig);
      const response = await API.post('/voices/test', {
        text,
        voice: voiceConfig // Assurez-vous que le paramètre est correctement nommé pour correspondre au backend
      });
      
      console.log('Réponse du serveur:', response.data);
      
      // Vérifier que la réponse contient les données attendues
      if (response.data && response.data.data) {
        const data = response.data.data;
        
        // Utiliser l'URL de téléchargement si elle existe
        if (data.downloadUrl) {
          return {
            success: true,
            audioUrl: data.downloadUrl.startsWith('/') ? data.downloadUrl : `/${data.downloadUrl}`,
            message: 'Audio généré avec succès'
          };
        }
        
        // Utiliser l'URL audio si elle existe
        if (data.audioUrl) {
          return {
            success: true,
            audioUrl: data.audioUrl.startsWith('/') ? data.audioUrl : `/${data.audioUrl}`,
            message: 'Audio généré avec succès'
          };
        }
        
        // Si on a juste le chemin du fichier, construire une URL d'API
        if (data.audioFilePath) {
          // Extraire juste le nom du fichier du chemin complet
          const fileName = data.audioFilePath.split('/').pop();
          const audioUrl = `/api/voices/download/${fileName}`;
          console.log('URL construite à partir du chemin de fichier:', audioUrl);
          
          return {
            success: true,
            audioUrl: audioUrl,
            message: 'Audio généré avec succès'
          };
        }
        
        // Si on a le nom de fichier directement
        if (data.fileName) {
          const audioUrl = `/api/voices/download/${data.fileName}`;
          return {
            success: true,
            audioUrl: audioUrl,
            message: 'Audio généré avec succès'
          };
        }
      }
      
      // Cas où la structure de la réponse n'est pas celle attendue
      console.error('Format de réponse inattendu:', response.data);
      return {
        success: false,
        audioUrl: '',
        message: 'Format de réponse incorrect'
      };
    } catch (error) {
      console.error('Erreur lors du test de la voix:', error);
      return {
        success: false,
        audioUrl: '',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  /**
   * Configure la voix d'une entreprise
   * @param companyId - L'ID de l'entreprise
   * @param voiceConfig - La configuration de la voix
   * @returns Les informations sur la configuration mise à jour
   */
  configureCompanyVoice: async (companyId: string, voiceConfig: any): Promise<any> => {
    const response = await API.put(`/voices/config/${companyId}`, voiceConfig);
    return response.data.data;
  },

  /**
   * Génère un audio pour une entreprise spécifique
   * @param companyId - L'ID de l'entreprise
   * @param text - Le texte à convertir en voix
   * @returns Les informations sur l'audio généré
   */
  generateCompanyAudio: async (companyId: string, text: string): Promise<any> => {
    const response = await API.post(`/voices/generate/${companyId}`, { text });
    return response.data.data;
  },

  /**
   * Télécharge un fichier audio personnalisé
   * @param companyId - L'ID de l'entreprise
   * @param file - Le fichier audio à télécharger
   * @param name - Le nom du modèle de voix
   * @param description - La description du modèle de voix (optionnel)
   * @returns Les informations sur le modèle de voix créé
   */
  uploadCustomVoice: async (companyId: string, file: File, name: string, description?: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    
    if (description) {
      formData.append('description', description);
    }

    const response = await API.post(`/voices/upload/${companyId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.data;
  },

  /**
   * Obtient l'URL pour télécharger un fichier audio
   * @param filename - Le nom du fichier audio
   * @returns L'URL du fichier audio
   */
  getAudioUrl: (filename: string): string => {
    return `${API.defaults.baseURL}/voices/download/${filename}`;
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
    } else if (provider === 'fonoster') {
      return [
        {
          id: 'fr-FR-Standard-A',
          name: 'Français - Julie',
          gender: 'female', 
          language: 'fr-FR',
          provider: 'fonoster',
          description: 'Voix féminine française professionnelle'
        },
        {
          id: 'fr-FR-Standard-B',
          name: 'Français - Thomas',
          gender: 'male',
          language: 'fr-FR',
          provider: 'fonoster',
          description: 'Voix masculine française professionnelle'
        },
        {
          id: 'fr-FR-Standard-C',
          name: 'Français - Emma',
          gender: 'female',
          language: 'fr-FR',
          provider: 'fonoster',
          description: 'Voix féminine française jeune'
        }
      ];
    } else if (provider === 'gtts') {
      return [
        {
          id: 'fr',
          name: 'Voix française',
          gender: 'female',
          language: 'fr',
          provider: 'gtts',
          description: 'Voix française standard'
        },
        {
          id: 'fr',
          name: 'Voix française',
          gender: 'male',
          language: 'fr',
          provider: 'gtts',
          description: 'Voix française standard'
        }
      ];
    }
    
    return [];
  }
};

export default voiceService; 
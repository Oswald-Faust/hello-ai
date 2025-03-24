import API from './api';

export interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  language: string;
  provider: 'gtts';
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
   * @returns La liste des voix disponibles
   */
  getAvailableVoices: async (): Promise<Voice[]> => {
    // Retourner directement les voix recommandées car nous n'utilisons que gTTS
    return voiceService.getRecommendedVoices();
  },

  /**
   * Teste la configuration de voix avec un texte donné
   * @param text - Le texte à convertir en voix
   * @param voiceConfig - La configuration de la voix
   * @returns La réponse du test avec l'URL de l'audio
   */
  testVoice: async (text: string, voiceConfig: any): Promise<VoiceTestResponse> => {
    try {
      const response = await API.post('/voices/test', {
        text,
        voice: {
          ...voiceConfig,
          provider: 'gtts' as const, // Forcer l'utilisation de gTTS
          format: 'mp3'    // Forcer le format MP3
        }
      });

      if (response.data?.success && response.data?.data?.audioUrl) {
        return {
          success: true,
          audioUrl: response.data.data.audioUrl,
          message: 'Audio généré avec succès'
        };
      }

      throw new Error('Format de réponse incorrect');
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
    const response = await API.put(`/voices/config/${companyId}`, {
      ...voiceConfig,
      provider: 'gtts' as const, // Forcer l'utilisation de gTTS
      format: 'mp3'    // Forcer le format MP3
    });
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
    // Si le filename commence déjà par /voices/download, ne pas l'ajouter à nouveau
    const audioPath = filename.startsWith('/voices/download') 
      ? filename 
      : `/voices/download/${filename}`;
    
    // Utiliser l'URL de base de l'API sans le /api
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `${baseUrl}${audioPath}`;
  },

  /**
   * Récupérer les voix recommandées (uniquement gTTS)
   * @returns Liste des voix recommandées
   */
  getRecommendedVoices: (): Voice[] => {
    return [
      {
        id: 'fr',
        name: 'Voix française féminine',
        gender: 'female' as const,
        language: 'fr',
        provider: 'gtts' as const
      },
      {
        id: 'fr',
        name: 'Voix française masculine',
        gender: 'male' as const,
        language: 'fr',
        provider: 'gtts' as const
      }
    ];
  }
};

export default voiceService; 
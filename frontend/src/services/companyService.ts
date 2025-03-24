import API from './api';

export interface Company {
  _id: string;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  fonosterPhoneNumber?: string;
  twilioPhoneNumber?: string;
  isActive: boolean;
  settings: Map<string, any>;
  businessHours?: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  voiceAssistant?: {
    companyInfo?: {
      products?: string[];
      services?: string[];
      faq?: Array<{ question: string; answer: string }>;
      team?: Array<{ name: string; role: string; expertise: string[] }>;
    };
    prompts?: {
      baseSystemPrompt?: string;
      welcomePrompt?: string;
      transferPrompt?: string;
      scenarios?: Array<{
        name: string;
        description?: string;
        prompt: string;
        requiredVariables?: string[];
        triggers?: string[];
      }>;
    };
    voice?: {
      gender?: 'male' | 'female';
      accent?: string;
      speed?: number;
      pitch?: number;
      provider?: 'fishaudio' | 'fonoster' | 'twilio' | 'custom';
      voiceId?: string;
      customVoiceId?: string;
      customVoiceName?: string;
      format?: 'mp3' | 'wav' | 'ogg';
    };
  };
  customResponses?: Array<{ keyword: string; response: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyUpdate {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  isActive?: boolean;
  settings?: Map<string, any>;
  businessHours?: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  voiceAssistant?: {
    companyInfo?: {
      products?: string[];
      services?: string[];
      faq?: Array<{ question: string; answer: string }>;
      team?: Array<{ name: string; role: string; expertise: string[] }>;
    };
    prompts?: {
      baseSystemPrompt?: string;
      welcomePrompt?: string;
      transferPrompt?: string;
      scenarios?: Array<{
        name: string;
        description?: string;
        prompt: string;
        requiredVariables?: string[];
        triggers?: string[];
      }>;
    };
    voice?: {
      gender?: 'male' | 'female';
      accent?: string;
      speed?: number;
      pitch?: number;
      provider?: 'fishaudio' | 'fonoster' | 'twilio' | 'custom';
      voiceId?: string;
      customVoiceId?: string;
      customVoiceName?: string;
      format?: 'mp3' | 'wav' | 'ogg';
    };
  };
  customResponses?: Array<{ keyword: string; response: string }>;
}

const companyService = {
  /**
   * Récupère l'entreprise de l'utilisateur connecté
   * @returns Les informations de l'entreprise
   */
  getUserCompany: async (): Promise<Company> => {
    const response = await API.get('/users/me/company');
    return response.data.data.company;
  },

  /**
   * Récupère une entreprise par son ID
   * @param companyId ID de l'entreprise
   * @returns Les informations de l'entreprise
   */
  getCompanyById: async (companyId: string): Promise<Company> => {
    const response = await API.get(`/companies/${companyId}`);
    return response.data.data.company;
  },

  /**
   * Met à jour les informations d'une entreprise
   * @param companyId ID de l'entreprise
   * @param companyData Données à mettre à jour
   * @returns L'entreprise mise à jour
   */
  updateCompany: async (companyId: string, companyData: CompanyUpdate): Promise<Company> => {
    const response = await API.put(`/companies/${companyId}`, companyData);
    return response.data.data.company;
  },

  /**
   * Met à jour les paramètres d'une entreprise
   * @param companyId ID de l'entreprise
   * @param settings Paramètres à mettre à jour
   * @returns L'entreprise mise à jour
   */
  updateCompanySettings: async (companyId: string, settings: any): Promise<Company> => {
    const response = await API.patch(`/companies/${companyId}/settings`, { settings });
    return response.data.data.company;
  },

  /**
   * Met à jour la configuration de l'assistant vocal d'une entreprise
   * @param companyId ID de l'entreprise
   * @param voiceAssistant Configuration de l'assistant vocal
   * @returns L'entreprise mise à jour
   */
  updateVoiceAssistant: async (companyId: string, voiceAssistant: any): Promise<Company> => {
    const response = await API.patch(`/companies/${companyId}/voice-assistant`, { voiceAssistant });
    return response.data.data.company;
  }
};

export default companyService; 
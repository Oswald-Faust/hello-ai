import api from './api';

interface CallFilters {
  status?: string;
  direction?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface CallStats {
  totalCalls: number;
  completedCalls: number;
  transferredCalls: number;
  missedCalls: number;
  avgDuration: number;
  sentiments: {
    positif: number;
    négatif: number;
    neutre: number;
  };
}

const callService = {
  /**
   * Récupérer la liste des appels pour une entreprise
   * @param companyId ID de l'entreprise
   * @param filters Filtres pour la recherche
   * @returns Liste des appels paginée
   */
  getCallsByCompany: async (companyId: string, filters: CallFilters = {}) => {
    try {
      const { page = 1, limit = 10, status, direction, startDate, endDate } = filters;
      
      let url = `/companies/${companyId}/calls?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      if (direction) url += `&direction=${direction}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des appels:', error);
      throw error;
    }
  },
  
  /**
   * Récupérer les détails d'un appel spécifique
   * @param callId ID de l'appel
   * @returns Détails de l'appel
   */
  getCallDetails: async (callId: string) => {
    try {
      const response = await api.get(`/calls/${callId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de l\'appel:', error);
      throw error;
    }
  },
  
  /**
   * Récupérer les statistiques des appels pour une entreprise
   * @param companyId ID de l'entreprise
   * @param startDate Date de début (optionnelle)
   * @param endDate Date de fin (optionnelle)
   * @returns Statistiques des appels
   */
  getCallStats: async (companyId: string, startDate?: string, endDate?: string): Promise<CallStats> => {
    try {
      let url = `/companies/${companyId}/calls/stats`;
      
      if (startDate || endDate) {
        url += '?';
        if (startDate) url += `startDate=${startDate}`;
        if (startDate && endDate) url += '&';
        if (endDate) url += `endDate=${endDate}`;
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques d\'appels:', error);
      throw error;
    }
  },
  
  /**
   * Récupérer les statistiques d'appels pour un tableau de bord
   * @param companyId ID de l'entreprise
   * @param period Période (day, week, month)
   * @returns Statistiques pour le tableau de bord
   */
  getDashboardStats: async (companyId: string, period: 'day' | 'week' | 'month' = 'week') => {
    try {
      const response = await api.get(`/companies/${companyId}/calls/dashboard?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques du tableau de bord:', error);
      throw error;
    }
  },
  
  /**
   * Récupérer le transcript d'un appel
   * @param callId ID de l'appel
   * @returns Transcript de l'appel
   */
  getCallTranscript: async (callId: string) => {
    try {
      const response = await api.get(`/calls/${callId}/transcript`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du transcript:', error);
      throw error;
    }
  },
  
  /**
   * Marquer un appel comme lu (pour notifications)
   * @param callId ID de l'appel
   * @returns Statut de l'opération
   */
  markCallAsRead: async (callId: string) => {
    try {
      const response = await api.patch(`/calls/${callId}/read`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du marquage de l\'appel comme lu:', error);
      throw error;
    }
  },
  
  /**
   * Mettre à jour le statut d'un appel
   * @param callId ID de l'appel
   * @param status Nouveau statut
   * @returns Appel mis à jour
   */
  updateCallStatus: async (callId: string, status: string) => {
    try {
      const response = await api.patch(`/calls/${callId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de l\'appel:', error);
      throw error;
    }
  }
};

export default callService; 
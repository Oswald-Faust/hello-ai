import API from './api';

export interface UserDashboardStats {
  conversations: {
    total: number;
    recent: number;
    change: number;
  };
  calls: {
    total: number;
    recent: number;
    change: number;
  };
  documents: {
    total: number;
    recent: number;
    change: number;
  };
  usageTime: {
    total: string;
    change: number;
  };
  recentActivities: Array<{
    id: string;
    type: string;
    action: string;
    details?: string;
    timestamp: string;
    time?: string;
  }>;
}

const dashboardService = {
  /**
   * Récupère les statistiques du tableau de bord pour l'utilisateur connecté
   * @param period Période de temps pour les statistiques (jour, semaine, mois)
   * @returns Les statistiques du tableau de bord
   */
  getUserDashboardStats: async (period: 'day' | 'week' | 'month' = 'week'): Promise<UserDashboardStats> => {
    const response = await API.get(`/users/me/dashboard-stats?period=${period}`);
    return response.data.data;
  },

  /**
   * Récupère les activités récentes de l'utilisateur
   * @param limit Nombre maximum d'activités à récupérer
   * @returns Liste des activités récentes
   */
  getUserRecentActivities: async (limit: number = 5): Promise<any[]> => {
    const response = await API.get(`/users/me/activities?limit=${limit}`);
    return response.data.data.activities;
  },

  /**
   * Récupère les conversations récentes de l'utilisateur
   * @param limit Nombre maximum de conversations à récupérer
   * @returns Liste des conversations récentes
   */
  getUserRecentConversations: async (limit: number = 5): Promise<any[]> => {
    const response = await API.get(`/users/me/conversations?limit=${limit}`);
    return response.data.data.conversations;
  },

  /**
   * Récupère les appels récents de l'utilisateur
   * @param limit Nombre maximum d'appels à récupérer
   * @returns Liste des appels récents
   */
  getUserRecentCalls: async (limit: number = 5): Promise<any[]> => {
    const response = await API.get(`/users/me/calls?limit=${limit}`);
    return response.data.data.calls;
  }
};

export default dashboardService; 
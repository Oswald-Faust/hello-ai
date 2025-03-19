import axios from 'axios';
import { API_URL } from '../config';

const API = axios.create({
  baseURL: API_URL,
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface DashboardStats {
  userStats: {
    total: number;
    active: number;
    admin: number;
  };
  companyStats: {
    total: number;
    active: number;
  };
  callStats: {
    total: number;
    last30Days: number;
  };
  recentActivities: Array<{
    type: string;
    date: string;
    data: {
      id: string;
      name: string;
      email: string;
      company?: string;
      phone?: string;
    };
  }>;
}

export interface SystemStats {
  uptime: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  nodeVersion: string;
  environment: {
    nodeEnv: string;
    platform: string;
    arch: string;
  };
}

export interface SystemLog {
  level: string;
  timestamp: string;
  message: string;
  service: string;
}

export interface PaginatedLogs {
  logs: SystemLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CompanyStats {
  totalCompanies: number;
  activeCompanies: number;
  companiesGrowth: Array<{
    period: string;
    count: number;
  }>;
  topCompaniesByUsers: Array<{
    _id: string;
    name: string;
    userCount: number;
  }>;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  usersGrowth: Array<{
    period: string;
    count: number;
  }>;
}

const adminService = {
  // Statistiques du tableau de bord
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await API.get('/admin/dashboard/stats');
    return response.data.data;
  },

  // Statistiques système
  getSystemStats: async (): Promise<SystemStats> => {
    const response = await API.get('/admin/system/stats');
    return response.data.data;
  },

  // Logs système
  getSystemLogs: async (page = 1, limit = 10): Promise<PaginatedLogs> => {
    const response = await API.get(`/admin/system/logs?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  // Statistiques des utilisateurs
  getUsersStats: async (): Promise<UserStats> => {
    const response = await API.get('/users/stats');
    return response.data;
  },

  // Obtenir tous les utilisateurs avec pagination
  getUsers: async (page = 1, limit = 10, search = '', companyId = '') => {
    let url = `/users?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (companyId) url += `&companyId=${companyId}`;
    
    const response = await API.get(url);
    return response.data;
  },

  // Créer un utilisateur
  createUser: async (userData: any) => {
    const response = await API.post('/users', userData);
    return response.data;
  },

  // Mettre à jour un utilisateur
  updateUser: async (userId: string, userData: any) => {
    const response = await API.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Changer le statut actif/inactif d'un utilisateur
  toggleUserStatus: async (userId: string, isActive: boolean) => {
    const response = await API.patch(`/users/${userId}/status`, { isActive });
    return response.data;
  },

  // Mettre à jour le rôle d'un utilisateur
  updateUserRole: async (userId: string, role: string) => {
    const response = await API.patch(`/users/${userId}/role`, { role });
    return response.data;
  },

  // Supprimer un utilisateur
  deleteUser: async (userId: string) => {
    const response = await API.delete(`/users/${userId}`);
    return response.data;
  },

  // Réinitialiser le mot de passe d'un utilisateur
  resetUserPassword: async (userId: string, newPassword: string) => {
    const response = await API.post(`/users/${userId}/reset-password`, { newPassword });
    return response.data;
  },

  // Statistiques des entreprises
  getCompaniesStats: async (): Promise<CompanyStats> => {
    const response = await API.get('/companies/stats');
    return response.data.data;
  },

  // Obtenir toutes les entreprises avec pagination
  getCompanies: async (page = 1, limit = 10, search = '', active?: boolean) => {
    let url = `/companies?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (active !== undefined) url += `&active=${active}`;
    
    const response = await API.get(url);
    return response.data.data;
  },

  // Créer une entreprise
  createCompany: async (companyData: any) => {
    const response = await API.post('/companies', companyData);
    return response.data;
  },

  // Obtenir une entreprise par son ID
  getCompanyById: async (companyId: string) => {
    const response = await API.get(`/companies/${companyId}`);
    return response.data.data;
  },

  // Mettre à jour une entreprise
  updateCompany: async (companyId: string, companyData: any) => {
    const response = await API.put(`/companies/${companyId}`, companyData);
    return response.data;
  },

  // Changer le statut actif/inactif d'une entreprise
  toggleCompanyStatus: async (companyId: string) => {
    const response = await API.patch(`/companies/${companyId}/status`);
    return response.data;
  },

  // Mettre à jour les paramètres d'une entreprise
  updateCompanySettings: async (companyId: string, settings: any) => {
    const response = await API.patch(`/companies/${companyId}/settings`, { settings });
    return response.data;
  },

  // Supprimer une entreprise
  deleteCompany: async (companyId: string) => {
    const response = await API.delete(`/companies/${companyId}`);
    return response.data;
  }
};

export default adminService; 
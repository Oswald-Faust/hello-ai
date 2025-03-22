import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Créer une instance axios avec la configuration de base
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    // Logger la requête pour le débogage
    console.log(`[API] Requête ${config.method?.toUpperCase()} vers ${config.url}`);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('[API] Token ajouté à la requête');
    } else {
      console.log('[API] Aucun token disponible pour cette requête');
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Erreur lors de la configuration de la requête:', error);
    return Promise.reject(error);
  }
);

// Variable pour éviter des tentatives multiples de rafraîchissement
let isRefreshing = false;
let failedQueue: { resolve: (value: any) => void; reject: (reason?: any) => void; config: AxiosRequestConfig }[] = [];

// Fonction pour traiter la file d'attente des requêtes en échec
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      if (token) {
        prom.config.headers = prom.config.headers || {};
        prom.config.headers['Authorization'] = `Bearer ${token}`;
      }
      prom.resolve(api(prom.config));
    }
  });
  
  failedQueue = [];
};

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Réponse reçue de ${response.config.url} avec statut ${response.status}`);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Logger l'erreur pour faciliter le débogage
    console.error(`[API] Erreur ${error.response?.status} pour ${originalRequest.url}:`, 
      error.response?.data || error.message);
    
    // Gérer les erreurs 401 (non autorisé)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Vérifier si la tentative de rafraîchissement est déjà en cours
      if (isRefreshing) {
        console.log('[API] Rafraîchissement déjà en cours, mise en file d\'attente de la requête');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      console.log('[API] Tentative de rafraîchissement du token');
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          console.error('[API] Aucun refresh token disponible');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          processQueue(new Error('Aucun refresh token disponible'));
          document.cookie = `redirectUrl=${window.location.pathname}; path=/; max-age=600`;
          window.location.href = '/auth/login';
          return Promise.reject(error);
        }
        
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken
        });
        
        if (response.data && response.data.token) {
          console.log('[API] Token rafraîchi avec succès');
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          
          // Mettre à jour l'en-tête d'autorisation pour la requête originale
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers['Authorization'] = `Bearer ${response.data.token}`;
          
          // Traiter la file d'attente avec le nouveau token
          processQueue(null, response.data.token);
          
          return api(originalRequest);
        } else {
          console.error('[API] Échec du rafraîchissement du token: réponse invalide');
          processQueue(new Error('Réponse de rafraîchissement invalide'));
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('[API] Échec du rafraîchissement du token:', refreshError);
        // Effacer les données d'authentification
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Traiter la file d'attente avec une erreur
        processQueue(refreshError);
        
        // Rediriger vers la page de connexion
        document.cookie = `redirectUrl=${window.location.pathname}; path=/; max-age=600`;
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 
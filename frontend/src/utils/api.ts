import axios from 'axios';

// Créer une instance Axios avec une configuration de base
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
  (config) => {
    console.log('[API] Requête sortante:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers,
      data: config.data ? JSON.parse(JSON.stringify(config.data)) : undefined,
    });
    
    const token = localStorage.getItem('token');
    if (token) {
      console.log('[API] Token trouvé, ajout de l\'en-tête Authorization');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('[API] Aucun token trouvé');
    }
    return config;
  },
  (error) => {
    console.error('[API] Erreur lors de la préparation de la requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => {
    console.log('[API] Réponse reçue:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('[API] Erreur de réponse:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data
    });
    
    const originalRequest = error.config;

    // Si l'erreur est 401 et que nous n'avons pas déjà essayé de rafraîchir le token
    // ET nous avons un token à rafraîchir ET ce n'est pas déjà une requête de rafraîchissement
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      localStorage.getItem('token') &&
      !originalRequest.url?.includes('/auth/refresh-token') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      console.log('[API] Tentative de rafraîchissement du token...');
      originalRequest._retry = true;

      try {
        // Essayer de rafraîchir le token
        const refreshToken = localStorage.getItem('token');
        if (!refreshToken) {
          throw new Error('Aucun token à rafraîchir');
        }

        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          { token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { token } = response.data;
        if (token) {
          localStorage.setItem('token', token);
          console.log('[API] Token rafraîchi avec succès');

          // Mettre à jour le token dans la requête originale
          originalRequest.headers.Authorization = `Bearer ${token}`;
          console.log('[API] Réessai de la requête originale');
          return api(originalRequest);
        } else {
          throw new Error('Aucun token reçu du serveur');
        }
      } catch (refreshError) {
        console.error('[API] Échec du rafraîchissement du token:', refreshError);
        // Si le rafraîchissement échoue, déconnecter l'utilisateur
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Rediriger vers la page de connexion en évitant les redirections infinies
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { api }; 
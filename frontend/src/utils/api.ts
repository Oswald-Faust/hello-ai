import axios from 'axios';

// Créer une instance Axios avec une configuration de base
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si l'erreur est 401 (non autorisé) et que ce n'est pas une tentative de rafraîchissement de token
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {
      originalRequest._retry = true;

      try {
        // Tenter de rafraîchir le token
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/refresh-token`,
            { token }
          );

          const newToken = response.data.token;
          localStorage.setItem('token', newToken);

          // Réessayer la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si le rafraîchissement échoue, rediriger vers la page de connexion
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Rediriger vers la page de connexion si nous sommes dans un navigateur
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export { api }; 
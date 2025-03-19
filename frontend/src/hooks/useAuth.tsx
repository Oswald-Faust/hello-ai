import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId?: string;
  role?: string;
}

export type AuthContextType = {
  user: User | null;
  error: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | undefined>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    companyId?: string;
    companyName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer l'utilisateur actuel
  const fetchCurrentUser = async () => {
    try {
      console.log('[AUTH HOOK] Récupération des informations utilisateur...');
      const response = await api.get('/auth/me');
      const userData = response.data.user;
      console.log('[AUTH HOOK] Informations utilisateur récupérées:', userData);
      
      // Mettre à jour le localStorage avec les données les plus récentes
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('[AUTH HOOK] Erreur lors de la récupération des informations utilisateur:', err);
      // Si l'erreur est due à un token invalide, on nettoie le localStorage
      // Note: Ne pas supprimer le refreshToken ici, car l'intercepteur API peut l'utiliser
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('user');
      
      // Si un token existe, on essaie d'initialiser l'utilisateur
      if (token) {
        console.log('[AUTH HOOK] Token trouvé, tentative de récupération de la session');
        
        // Si on a les données utilisateur en cache, on les utilise d'abord
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            console.log('[AUTH HOOK] Utilisateur initialisé depuis le localStorage');
          } catch (e) {
            console.error('[AUTH HOOK] Erreur lors du parsing des données utilisateur:', e);
          }
        }
        
        // Puis on vérifie avec le serveur pour obtenir les dernières données
        await fetchCurrentUser();
      } 
      // Si seulement un refreshToken existe, on peut essayer de récupérer un nouveau token
      else if (refreshToken) {
        console.log('[AUTH HOOK] Refresh token trouvé, tentative de récupération d\'un nouveau token');
        try {
          const response = await api.post('/auth/refresh-token', { refreshToken });
          
          if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            if (response.data.refreshToken) {
              localStorage.setItem('refreshToken', response.data.refreshToken);
            }
            
            // Récupérer les données utilisateur avec le nouveau token
            await fetchCurrentUser();
          } else {
            console.log('[AUTH HOOK] Échec de rafraîchissement du token');
            setLoading(false);
          }
        } catch (err) {
          console.error('[AUTH HOOK] Erreur lors du rafraîchissement du token:', err);
          // En cas d'échec, nous nettoyons le refresh token
          localStorage.removeItem('refreshToken');
          setLoading(false);
        }
      } else {
        console.log('[AUTH HOOK] Aucun token trouvé, utilisateur non authentifié');
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      console.log('[AUTH HOOK] Tentative de connexion pour:', email);
      
      const response = await api.post('/auth/login', { email, password });
      const { token, refreshToken, user } = response.data;
      
      if (!token) {
        throw new Error('Aucun token reçu du serveur');
      }
      
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(user));
      console.log('[AUTH HOOK] Connexion réussie pour:', email);
      console.log('[AUTH HOOK] Rôle utilisateur:', user.role);
      
      setUser(user);
      
      // Retourner le rôle de l'utilisateur pour permettre une redirection conditionnelle
      return user.role;
    } catch (err: any) {
      console.error('[AUTH HOOK] Erreur lors de la connexion:', err);
      setError(err.response?.data?.message || 'Erreur lors de la connexion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    companyId?: string;
    companyName?: string;
  }) => {
    try {
      console.log('[AUTH HOOK] Début de l\'inscription avec les données:', { 
        ...userData, 
        password: userData.password ? '********' : undefined 
      });
      
      setError(null);
      setLoading(true);
      
      const response = await api.post('/auth/register', userData);
      console.log('[AUTH HOOK] Réponse reçue:', response.status, response.statusText);
      console.log('[AUTH HOOK] Données de réponse:', response.data);
      
      const { token, refreshToken, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Données de réponse incomplètes');
      }
      
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(user));
      console.log('[AUTH HOOK] Utilisateur enregistré en local storage');
      
      setUser(user);
      console.log('[AUTH HOOK] État utilisateur mis à jour');
    } catch (err: any) {
      console.error('[AUTH HOOK] Erreur lors de l\'inscription:', err);
      console.error('[AUTH HOOK] Détails de l\'erreur:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      console.log('[AUTH HOOK] Tentative de déconnexion...');
      await api.post('/auth/logout');
      console.log('[AUTH HOOK] Déconnexion réussie côté serveur');
    } catch (err) {
      console.error('[AUTH HOOK] Erreur lors de la déconnexion:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
      console.log('[AUTH HOOK] Session locale nettoyée');
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setError(null);
      setLoading(true);
      console.log('[AUTH HOOK] Mise à jour du profil avec les données:', data);
      
      const response = await api.put('/auth/profile', data);
      const updatedUser = response.data.user;
      
      // Mettre à jour le localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      console.log('[AUTH HOOK] Profil mis à jour avec succès');
    } catch (err: any) {
      console.error('[AUTH HOOK] Erreur lors de la mise à jour du profil:', err);
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    error,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
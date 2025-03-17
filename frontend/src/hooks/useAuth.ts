import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { api } from '@/utils/api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  company: {
    _id: string;
    name: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyId: string;
}

// Créer le contexte d'authentification
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}

// Fournisseur d'authentification
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Vérifier si le token est valide en récupérant le profil
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (err) {
          // Si le token n'est pas valide, supprimer les données stockées
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Stocker le token et les informations utilisateur
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la connexion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      setLoading(true);
      
      // Appeler l'API de déconnexion
      await api.post('/auth/logout');
      
      // Supprimer les données stockées
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      setUser(null);
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      // Stocker le token et les informations utilisateur
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de mise à jour du profil
  const updateProfile = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put('/auth/profile', userData);
      const updatedUser = response.data.user;
      
      // Mettre à jour les informations utilisateur stockées
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du profil');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 
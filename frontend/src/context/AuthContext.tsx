import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';

// Types
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
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  updateProfile: (userData: UpdateProfileData) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyId?: string;
  companyName?: string;
  role?: string;
}

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  preferences?: {
    language?: string;
    theme?: string;
    notifications?: {
      email?: boolean;
      sms?: boolean;
      callAlerts?: boolean;
    };
  };
}

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

// Provider du contexte
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Initialiser l'état d'authentification au chargement
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
      // Configurer l'en-tête d'autorisation pour toutes les requêtes
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    
    setIsLoading(false);
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        email,
        password
      });

      const { token: newToken, user: userData } = response.data;
      
      // Stocker les informations d'authentification
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Mettre à jour l'état
      setToken(newToken);
      setUser(userData);
      
      // Configurer l'en-tête d'autorisation pour toutes les requêtes
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      toast.success('Connexion réussie');
      router.push('/dashboard');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast.error('Email ou mot de passe incorrect');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    // Supprimer les informations d'authentification
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Réinitialiser l'état
    setToken(null);
    setUser(null);
    
    // Supprimer l'en-tête d'autorisation
    delete axios.defaults.headers.common['Authorization'];
    
    toast.success('Déconnexion réussie');
    router.push('/login');
  };

  // Fonction d'inscription
  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, userData);

      const { token: newToken, user: newUser } = response.data;
      
      // Stocker les informations d'authentification
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Mettre à jour l'état
      setToken(newToken);
      setUser(newUser);
      
      // Configurer l'en-tête d'autorisation pour toutes les requêtes
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      toast.success('Inscription réussie');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'inscription';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de mise à jour du profil
  const updateProfile = async (userData: UpdateProfileData) => {
    try {
      setIsLoading(true);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const { user: updatedUser } = response.data;
      
      // Mettre à jour les informations utilisateur
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Erreur de mise à jour du profil:', error);
      toast.error('Erreur lors de la mise à jour du profil');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de changement de mot de passe
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setIsLoading(true);
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`,
        {
          currentPassword,
          newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      toast.success('Mot de passe changé avec succès');
    } catch (error) {
      console.error('Erreur de changement de mot de passe:', error);
      toast.error('Erreur lors du changement de mot de passe');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Valeur du contexte
  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    register,
    updateProfile,
    changePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 
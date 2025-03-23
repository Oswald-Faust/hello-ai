import { createContext, useContext, useState, useEffect } from 'react';
import authService, { UserRegistration, RegistrationData } from '@/services/authService';

// Interface utilisateur simplifiée
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export type AuthContextType = {
  user: User | null;
  error: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string>;
  register: (userData: UserRegistration) => Promise<void>;
  registerComplete: (registrationData: RegistrationData) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Identifiants fixes pour le mode démo
const ADMIN_EMAIL = 'admin@lydia.com';
const ADMIN_PASSWORD = 'Admin123!';
const USER_EMAIL = 'user@lydia.com';
const USER_PASSWORD = 'User123!';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('[AUTH HOOK] Utilisateur initialisé depuis le localStorage:', parsedUser.role);
      } catch (e) {
        console.error('[AUTH HOOK] Erreur lors du parsing des données utilisateur:', e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<string> => {
    try {
      setError(null);
      setLoading(true);
      console.log('[AUTH HOOK] Tentative de connexion pour:', email);

      // Mode démo pour les tests sans backend
      if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        // Vérification simple des identifiants admin
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          const adminUser: User = {
            id: '1',
            firstName: 'Admin',
            lastName: 'User',
            email: ADMIN_EMAIL,
            role: 'admin'
          };
          
          // Stocker l'utilisateur dans le localStorage
          localStorage.setItem('user', JSON.stringify(adminUser));
          
          console.log('[AUTH HOOK] Connexion admin réussie (mode démo)');
          setUser(adminUser);
          return 'admin';
        } 
        // Vérification simple des identifiants utilisateur normal
        else if (email === USER_EMAIL && password === USER_PASSWORD) {
          const normalUser: User = {
            id: '2',
            firstName: 'Utilisateur',
            lastName: 'Normal',
            email: USER_EMAIL,
            role: 'user'
          };
          
          // Stocker l'utilisateur dans le localStorage
          localStorage.setItem('user', JSON.stringify(normalUser));
          
          console.log('[AUTH HOOK] Connexion utilisateur normal réussie (mode démo)');
          setUser(normalUser);
          return 'user';
        } else {
          throw new Error('Email ou mot de passe incorrect');
        }
      } else {
        // Utiliser le service d'authentification réel
        const response = await authService.login(email, password);
        setUser(response.user);
        return response.user.role;
      }
    } catch (err: any) {
      console.error('[AUTH HOOK] Erreur lors de la connexion:', err);
      const errorMessage = err.message || 'Erreur lors de la connexion';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: UserRegistration): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      console.log('[AUTH HOOK] Tentative d\'inscription pour:', userData.email);

      if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        // En mode démo, simuler l'inscription
        const newUser: User = {
          id: '3',
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role || 'user'
        };
        
        localStorage.setItem('user', JSON.stringify(newUser));
        console.log('[AUTH HOOK] Inscription réussie (mode démo)');
        setUser(newUser);
      } else {
        // Utiliser le service d'authentification réel
        const response = await authService.register(userData);
        setUser(response.user);
      }
    } catch (err: any) {
      console.error('[AUTH HOOK] Erreur lors de l\'inscription:', err);
      const errorMessage = err.message || 'Erreur lors de l\'inscription';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const registerComplete = async (registrationData: RegistrationData): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      console.log('[AUTH HOOK] Tentative d\'inscription complète pour:', registrationData.user.email);

      if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        // En mode démo, simuler l'inscription
        const newUser: User = {
          id: '3',
          firstName: registrationData.user.firstName,
          lastName: registrationData.user.lastName,
          email: registrationData.user.email,
          role: registrationData.userType === 'company' ? 'companyAdmin' : 
                registrationData.userType === 'employee' ? 'user' : 'freelance'
        };
        
        localStorage.setItem('user', JSON.stringify(newUser));
        console.log('[AUTH HOOK] Inscription complète réussie (mode démo)');
        setUser(newUser);
      } else {
        // Utiliser le service d'authentification réel
        const response = await authService.completeRegistration(registrationData);
        setUser(response.user);
      }
    } catch (err: any) {
      console.error('[AUTH HOOK] Erreur lors de l\'inscription complète:', err);
      const errorMessage = err.message || 'Erreur lors de l\'inscription';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      authService.logout();
    } else {
      localStorage.removeItem('user');
    }
    setUser(null);
    console.log('[AUTH HOOK] Déconnexion réussie');
    window.location.replace('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        error,
        loading,
        login,
        register,
        registerComplete,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}

// Ajouter un export par défaut pour compatibilité
export default useAuth; 
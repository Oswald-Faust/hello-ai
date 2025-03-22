import { createContext, useContext, useState, useEffect } from 'react';

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
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Identifiants fixes
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
        
        console.log('[AUTH HOOK] Connexion admin réussie');
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
        
        console.log('[AUTH HOOK] Connexion utilisateur normal réussie');
        setUser(normalUser);
        return 'user';
      }
      else {
        throw new Error('Email ou mot de passe incorrect');
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

  const logout = () => {
    localStorage.removeItem('user');
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
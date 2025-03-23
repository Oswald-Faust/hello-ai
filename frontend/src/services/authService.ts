import api from './api';

// Types d'utilisateurs
export type UserType = 'freelance' | 'company' | 'employee';

// Interface pour l'entreprise
export interface CompanyRegistration {
  name: string;
  email?: string;
  phone?: string;
  industry?: string;
  size?: string;
  description?: string;
}

// Interface pour l'utilisateur
export interface UserRegistration {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  jobTitle?: string;
  companyId?: string;
  role?: string;
  companyName?: string;
}

// Interface pour le processus d'inscription complet
export interface RegistrationData {
  userType: UserType;
  user: UserRegistration;
  company?: CompanyRegistration;
}

/**
 * Service d'authentification pour gérer l'inscription, la connexion et les opérations utilisateur
 */
class AuthService {
  /**
   * Enregistre un nouvel utilisateur
   * @param userData Les données d'utilisateur à enregistrer
   * @returns Les données utilisateur et le token
   */
  async register(userData: UserRegistration): Promise<{ user: any; token: string }> {
    try {
      console.log('[AUTH SERVICE] Enregistrement de l\'utilisateur:', userData.email);
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      console.error('[AUTH SERVICE] Erreur lors de l\'enregistrement:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  }

  /**
   * Enregistre une nouvelle entreprise
   * @param companyData Les données de l'entreprise à enregistrer
   * @returns Les données de l'entreprise créée
   */
  async registerCompany(companyData: CompanyRegistration): Promise<{ company: any }> {
    try {
      console.log('[AUTH SERVICE] Enregistrement de l\'entreprise:', companyData.name);
      const response = await api.post('/companies', companyData);
      return response.data;
    } catch (error: any) {
      console.error('[AUTH SERVICE] Erreur lors de l\'enregistrement de l\'entreprise:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'enregistrement de l\'entreprise');
    }
  }

  /**
   * Processus d'inscription complet (utilisateur + entreprise si applicable)
   * @param registrationData Données d'inscription complètes
   * @returns Les données utilisateur, entreprise et token
   */
  async completeRegistration(registrationData: RegistrationData): Promise<{ user: any; company?: any; token: string }> {
    try {
      console.log('[AUTH SERVICE] Démarrage du processus d\'inscription complet pour:', registrationData.userType);
      
      let userData = {
        ...registrationData.user
      };
      
      // Si c'est une entreprise, on ajoute le nom de l'entreprise directement dans la requête
      if (registrationData.userType === 'company' && registrationData.company) {
        console.log('[AUTH SERVICE] Préparation de la création d\'entreprise:', registrationData.company.name);
        userData = {
          ...userData,
          companyName: registrationData.company.name,
          // Attribuer le rôle en fonction du type d'utilisateur
          role: 'companyAdmin'
        };
      } else if (registrationData.userType === 'employee') {
        // Pour un employé, on utilise le companyId existant
        userData = {
          ...userData,
          role: 'user'
        };
      } else {
        // Pour un freelance
        userData = {
          ...userData,
          role: 'freelance'
        };
      }
      
      console.log('[AUTH SERVICE] Envoi des données d\'inscription:', { ...userData, password: '********' });
      
      // Le backend va créer l'utilisateur et l'entreprise si nécessaire en une seule requête
      const response = await api.post('/auth/register', userData);
      
      // Stocker le token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Stocker les infos utilisateur
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return {
        user: response.data.user,
        company: response.data.company,
        token: response.data.token
      };
    } catch (error: any) {
      console.error('[AUTH SERVICE] Erreur lors du processus d\'inscription:', error);
      throw new Error(error.response?.data?.message || error.message || 'Erreur lors du processus d\'inscription');
    }
  }

  /**
   * Connecte un utilisateur existant
   * @param email Email de l'utilisateur
   * @param password Mot de passe de l'utilisateur
   * @returns Les données utilisateur et le token
   */
  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    try {
      console.log('[AUTH SERVICE] Tentative de connexion pour:', email);
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('[AUTH SERVICE] Erreur lors de la connexion:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Email ou mot de passe incorrect');
    }
  }

  /**
   * Déconnecte l'utilisateur courant
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('[AUTH SERVICE] Déconnexion réussie');
  }

  /**
   * Vérifie si l'utilisateur est connecté
   * @returns true si l'utilisateur est connecté, false sinon
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Récupère l'utilisateur actuellement connecté
   * @returns L'utilisateur connecté ou null
   */
  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Vérifie si une entreprise existe déjà par son nom
   * @param companyName Nom de l'entreprise à vérifier
   * @returns true si l'entreprise existe, false sinon
   */
  async checkCompanyExists(companyName: string): Promise<boolean> {
    try {
      const response = await api.get(`/companies/check?name=${encodeURIComponent(companyName)}`);
      return response.data.exists;
    } catch (error) {
      console.error('[AUTH SERVICE] Erreur lors de la vérification de l\'entreprise:', error);
      return false;
    }
  }
}

// Exporter une instance unique du service
export default new AuthService(); 
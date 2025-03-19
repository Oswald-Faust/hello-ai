// Configuration de l'application
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Constantes générales
export const APP_NAME = 'Lydia';

// Configuration de pagination par défaut
export const DEFAULT_PAGE_SIZE = 10;

// Rôles utilisateur
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// Statuts
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending'
}; 
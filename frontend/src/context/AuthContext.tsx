import React from 'react';
import { AuthProvider as NewAuthProvider, useAuth as useNewAuth } from '@/hooks/useAuth';

// Ce fichier existe pour assurer la compatibilité avec le code existant
// qui pourrait utiliser l'ancien contexte d'authentification.
// Il redirige tout vers notre nouvelle implémentation dans hooks/useAuth.tsx

// Réexporte le Provider
export const AuthProvider = NewAuthProvider;

// Réexporte le hook
export const useAuth = useNewAuth;

export default {
  AuthProvider,
  useAuth
}; 
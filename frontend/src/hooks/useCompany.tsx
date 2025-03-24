import { useState, useEffect, useCallback } from 'react';
import companyService, { Company, CompanyUpdate } from '@/services/companyService';
import { useAuth } from './useAuth';

export interface UseCompanyReturn {
  company: Company | null;
  loading: boolean;
  error: Error | null;
  refreshCompany: () => Promise<void>;
  updateCompany: (companyData: CompanyUpdate) => Promise<void>;
  updateSettings: (settings: any) => Promise<void>;
  updateVoiceAssistant: (voiceAssistant: any) => Promise<void>;
}

export const useCompany = (): UseCompanyReturn => {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fonction pour récupérer les informations de l'entreprise
  const fetchCompany = useCallback(async () => {
    if (!user) {
      setCompany(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const companyData = await companyService.getUserCompany();
      setCompany(companyData);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des données de l\'entreprise:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fonction pour rafraîchir les données de l'entreprise
  const refreshCompany = useCallback(async () => {
    await fetchCompany();
  }, [fetchCompany]);

  // Fonction pour mettre à jour les informations de l'entreprise
  const updateCompany = useCallback(async (companyData: CompanyUpdate) => {
    if (!company) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedCompany = await companyService.updateCompany(company._id, companyData);
      setCompany(updatedCompany);
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de l\'entreprise:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Erreur inconnue'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [company]);

  // Fonction pour mettre à jour les paramètres de l'entreprise
  const updateSettings = useCallback(async (settings: any) => {
    if (!company) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedCompany = await companyService.updateCompanySettings(company._id, settings);
      setCompany(updatedCompany);
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour des paramètres:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Erreur inconnue'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [company]);

  // Fonction pour mettre à jour la configuration de l'assistant vocal
  const updateVoiceAssistant = useCallback(async (voiceAssistant: any) => {
    if (!company) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedCompany = await companyService.updateVoiceAssistant(company._id, voiceAssistant);
      setCompany(updatedCompany);
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de l\'assistant vocal:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Erreur inconnue'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [company]);

  // Charger les données de l'entreprise au montage du composant
  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  return {
    company,
    loading,
    error,
    refreshCompany,
    updateCompany,
    updateSettings,
    updateVoiceAssistant
  };
}; 
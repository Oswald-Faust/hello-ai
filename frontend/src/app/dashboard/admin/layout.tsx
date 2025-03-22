'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Vérifier si l'utilisateur est connecté et a le rôle d'admin
      if (!user) {
        console.log('[ADMIN LAYOUT] Utilisateur non connecté, redirection vers login');
        window.location.href = '/auth/login';
        return;
      }

      if (user.role !== 'admin') {
        console.log('[ADMIN LAYOUT] Accès refusé, redirection vers dashboard utilisateur');
        window.location.href = '/dashboard';
        return;
      }

      setAuthChecked(true);
    }
  }, [user, loading, router]);

  // Afficher un indicateur de chargement pendant la vérification
  if (loading || !authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Rendu du contenu si l'utilisateur est authentifié en tant qu'admin
  return <>{children}</>;
} 
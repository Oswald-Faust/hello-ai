import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Phone, Users, Building, Clock, TrendingUp, BarChart2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';

const Dashboard: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  // Rediriger en fonction du rôle
  useEffect(() => {
    if (!user) {
      // Ajouter un délai pour éviter les redirections trop rapides
      const timer = setTimeout(() => {
        router.push('/login');
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      // Ajouter un délai pour les redirections basées sur le rôle
      const timer = setTimeout(() => {
        if (user.role === 'admin') {
          // Si c'est un admin, le rediriger vers le dashboard admin
          router.push('/dashboard/admin');
        } else {
          // Tous les autres utilisateurs sont redirigés vers le dashboard utilisateur
          router.push('/dashboard/user');
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  // Afficher un loader pendant la redirection
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-t-primary-600 border-gray-200 rounded-full animate-spin"></div>
    </div>
  );
};

export default Dashboard; 
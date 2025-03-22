import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';

const AdminDashboard: NextPage = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Vérifier si l'utilisateur est un admin
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'admin') {
      // Si l'utilisateur n'est pas un admin, le rediriger
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-t-primary-600 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <button
            onClick={logout}
            className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Déconnexion
          </button>
        </div>
      </header>
      
      <main className="py-10">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="p-8 bg-white rounded-lg shadow">
            <h2 className="mb-6 text-2xl font-semibold">Bienvenue dans le Dashboard Admin</h2>
            
            <div className="p-4 mb-6 bg-blue-100 border border-blue-200 rounded-md">
              <p className="text-blue-800">
                <strong>Félicitations!</strong> Vous êtes connecté en tant qu'administrateur.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="p-6 bg-purple-100 rounded-lg">
                <h3 className="mb-2 text-lg font-medium text-purple-800">Utilisateurs</h3>
                <p className="text-purple-600">Gérer les utilisateurs de l'application</p>
              </div>
              
              <div className="p-6 bg-green-100 rounded-lg">
                <h3 className="mb-2 text-lg font-medium text-green-800">Entreprises</h3>
                <p className="text-green-600">Gérer les entreprises inscrites</p>
              </div>
              
              <div className="p-6 bg-yellow-100 rounded-lg">
                <h3 className="mb-2 text-lg font-medium text-yellow-800">Statistiques</h3>
                <p className="text-yellow-600">Consulter les statistiques d'utilisation</p>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gray-100 rounded-md">
              <h3 className="mb-2 text-lg font-medium">Informations de connexion</h3>
              <p><strong>Nom:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Rôle:</strong> {user.role}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 
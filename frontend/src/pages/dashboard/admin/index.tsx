import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/layout/AdminLayout';
import { UsersIcon, BuildingIcon, ChartBarIcon, ClockIcon } from 'lucide-react';

const AdminDashboard: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  // Vérifier si l'utilisateur est un admin
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'admin') {
      // Si l'utilisateur n'est pas un admin, le rediriger
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-t-primary-600 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Données factices pour le dashboard
  const stats = [
    {
      id: 1,
      name: 'Utilisateurs',
      value: '84',
      change: '+12%',
      changeType: 'increase',
      icon: <UsersIcon className="w-8 h-8 text-blue-500" />
    },
    {
      id: 2,
      name: 'Entreprises',
      value: '12',
      change: '+3',
      changeType: 'increase',
      icon: <BuildingIcon className="w-8 h-8 text-green-500" />
    },
    {
      id: 3,
      name: 'Appels traités',
      value: '524',
      change: '+18%',
      changeType: 'increase',
      icon: <ChartBarIcon className="w-8 h-8 text-purple-500" />
    },
    {
      id: 4,
      name: 'Temps moyen',
      value: '2m 34s',
      change: '-8%',
      changeType: 'decrease',
      icon: <ClockIcon className="w-8 h-8 text-yellow-500" />
    }
  ];

  // Activités récentes fictives
  const recentActivities = [
    { id: 1, action: 'Nouvel utilisateur créé', user: 'Jean Dupont', time: 'Il y a 1 heure' },
    { id: 2, action: 'Entreprise ajoutée', user: 'Marie Martin', time: 'Il y a 3 heures' },
    { id: 3, action: 'Paramètres mis à jour', user: 'Admin', time: 'Il y a 5 heures' },
    { id: 4, action: 'Rapport généré', user: 'System', time: 'Il y a 1 jour' }
  ];

  return (
    <AdminLayout>
      <div className="px-4 sm:px-0">
        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 gap-5 mt-2 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="overflow-hidden bg-white rounded-lg shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">{stat.icon}</div>
                  <div className="flex-1 w-0 ml-5">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd>
                        <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className={`bg-gray-50 px-5 py-3 ${
                stat.changeType === 'increase' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                <div className="text-sm">
                  <span>{stat.change} depuis le mois dernier</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tableau de bord principal */}
        <div className="grid grid-cols-1 gap-5 mt-8 lg:grid-cols-3">
          {/* Carte de bienvenue */}
          <div className="overflow-hidden bg-white rounded-lg shadow lg:col-span-1">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Bienvenue, {user.firstName}!</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Vous êtes connecté au tableau de bord administrateur.</p>
              </div>
              <div className="p-4 mt-3 bg-blue-50 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">Accédez à toutes les fonctionnalités d'administration depuis la barre latérale.</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Informations de connexion</h4>
                <p className="text-sm text-gray-600"><span className="font-medium">Rôle:</span> {user.role}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Dernière connexion:</span> Aujourd'hui, 10:30</p>
              </div>
            </div>
          </div>

          {/* Activités récentes */}
          <div className="overflow-hidden bg-white rounded-lg shadow lg:col-span-2">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Activités récentes</h3>
              <div className="mt-6 flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentActivities.map((activity) => (
                    <li key={activity.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                            <svg className="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.user}</p>
                        </div>
                        <div>
                          <div className="inline-flex items-center text-xs font-medium text-gray-500">{activity.time}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <a href="/dashboard/admin/logs" className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                  Voir toutes les activités
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Dernière section */}
        <div className="grid grid-cols-1 gap-5 mt-8 lg:grid-cols-2">
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Accès rapide</h3>
              <div className="grid grid-cols-2 gap-4 mt-5">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/admin/users')}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
                >
                  Gérer les utilisateurs
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/admin/companies')}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700"
                >
                  Gérer les entreprises
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/admin/reports')}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700"
                >
                  Rapports
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/admin/settings')}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md shadow-sm hover:bg-yellow-700"
                >
                  Paramètres
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">État du système</h3>
              <div className="mt-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500">Serveur API</span>
                  <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Opérationnel</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500">Base de données</span>
                  <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Opérationnelle</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Service d'authentification</span>
                  <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Opérationnel</span>
                </div>
                <div className="mt-6">
                  <a href="/dashboard/admin/system" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Voir les détails du système →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 
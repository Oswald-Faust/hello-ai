import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import UserLayout from '@/components/layouts/UserLayout';
import { MessageCircle, PhoneCall, FileText, Clock } from 'lucide-react';

const UserDashboard: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role === 'admin') {
      // Si l'utilisateur est un admin, le rediriger vers le dashboard admin
      router.push('/dashboard/admin');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-t-primary-600 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Données fictives pour le dashboard utilisateur
  const stats = [
    {
      id: 1,
      name: 'Conversations',
      value: '12',
      change: '+3',
      changeType: 'increase',
      icon: <MessageCircle className="w-8 h-8 text-blue-500" />
    },
    {
      id: 2,
      name: 'Appels réalisés',
      value: '24',
      change: '+5',
      changeType: 'increase',
      icon: <PhoneCall className="w-8 h-8 text-green-500" />
    },
    {
      id: 3,
      name: 'Documents',
      value: '8',
      change: '+2',
      changeType: 'increase',
      icon: <FileText className="w-8 h-8 text-purple-500" />
    },
    {
      id: 4,
      name: 'Temps d\'utilisation',
      value: '3h 15m',
      change: '+22%',
      changeType: 'increase',
      icon: <Clock className="w-8 h-8 text-yellow-500" />
    }
  ];

  // Activités récentes fictives
  const recentActivities = [
    { id: 1, action: 'Conversation avec Lydia', details: 'Support client', time: 'Il y a 30 minutes' },
    { id: 2, action: 'Appel effectué', details: 'Client: Dupont SA', time: 'Il y a 2 heures' },
    { id: 3, action: 'Document généré', details: 'Résumé de réunion', time: 'Il y a 1 jour' },
    { id: 4, action: 'Document partagé', details: 'Présentation produit', time: 'Il y a 2 jours' }
  ];

  return (
    <UserLayout>
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Tableau de bord</h1>
        
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
                  <span>{stat.change} depuis la semaine dernière</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 gap-5 mt-8 lg:grid-cols-3">
          {/* Carte de bienvenue */}
          <div className="overflow-hidden bg-white rounded-lg shadow lg:col-span-1">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Bienvenue, {user.firstName}!</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Votre assistant intelligent Lydia est prêt à vous aider.</p>
              </div>
              <div className="p-4 mt-3 bg-blue-50 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">Commencez une nouvelle conversation ou consultez vos activités récentes.</p>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/user/conversations/new')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Nouvelle conversation
                </button>
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
                          <p className="text-sm text-gray-500">{activity.details}</p>
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
                <a href="/dashboard/user/activities" className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                  Voir toutes les activités
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Dernière section - Accès rapide */}
        <div className="overflow-hidden bg-white rounded-lg shadow mt-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Accès rapide</h3>
            <div className="grid grid-cols-1 gap-4 mt-5 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard/user/conversations')}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
              >
                Voir mes conversations
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard/user/calls')}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700"
              >
                Voir mes appels
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard/user/documents')}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700"
              >
                Voir mes documents
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserDashboard; 
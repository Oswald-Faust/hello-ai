import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useCompany } from '@/hooks/useCompany';
import UserLayout from '@/components/layouts/UserLayout';
import { MessageCircle, PhoneCall, FileText, Clock, Loader2 } from 'lucide-react';
import dashboardService from '@/services/dashboardService';

const UserDashboard: NextPage = () => {
  const { user } = useAuth();
  const { company, loading: companyLoading } = useCompany();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    if (!user) {
      // Ajouter un délai pour éviter les redirections trop rapides et les boucles
      const timer = setTimeout(() => {
        router.push('/login');
      }, 500);
      
      return () => clearTimeout(timer);
    } else if (user.role === 'admin') {
      // Si l'utilisateur est un admin, le rediriger vers le dashboard admin
      router.push('/dashboard/admin');
    }
  }, [user, router]);

  // Charger les données du dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Attendre un court délai pour s'assurer que les hooks d'authentification sont prêts
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Récupérer les statistiques du dashboard
        const dashboardStats = await dashboardService.getUserDashboardStats();
        setStats(dashboardStats);
        
        // Récupérer les activités récentes
        const activities = await dashboardService.getUserRecentActivities();
        setRecentActivities(activities);
      } catch (error) {
        console.error('Erreur lors du chargement des données du dashboard:', error);
        // Utiliser des données fictives en cas d'erreur
        setStats({
          conversations: { total: 0, recent: 0, change: 0 },
          calls: { total: 0, recent: 0, change: 0 },
          documents: { total: 0, recent: 0, change: 0 },
          usageTime: { total: '0h 0m', change: 0 }
        });
        setRecentActivities([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-t-primary-600 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Formatter les statistiques pour l'affichage
  const formattedStats = stats ? [
    {
      id: 1,
      name: 'Conversations',
      value: stats.conversations?.total.toString() || '0',
      change: stats.conversations?.change > 0 ? `+${stats.conversations.change}` : stats.conversations?.change.toString() || '0',
      changeType: stats.conversations?.change >= 0 ? 'increase' : 'decrease',
      icon: <MessageCircle className="w-8 h-8 text-blue-500" />
    },
    {
      id: 2,
      name: 'Appels réalisés',
      value: stats.calls?.total.toString() || '0',
      change: stats.calls?.change > 0 ? `+${stats.calls.change}` : stats.calls?.change.toString() || '0',
      changeType: stats.calls?.change >= 0 ? 'increase' : 'decrease',
      icon: <PhoneCall className="w-8 h-8 text-green-500" />
    },
    {
      id: 3,
      name: 'Documents',
      value: stats.documents?.total.toString() || '0',
      change: stats.documents?.change > 0 ? `+${stats.documents.change}` : stats.documents?.change.toString() || '0',
      changeType: stats.documents?.change >= 0 ? 'increase' : 'decrease',
      icon: <FileText className="w-8 h-8 text-purple-500" />
    },
    {
      id: 4,
      name: 'Temps d\'utilisation',
      value: stats.usageTime?.total || '0h 0m',
      change: stats.usageTime?.change > 0 ? `+${stats.usageTime.change}%` : `${stats.usageTime?.change}%` || '0%',
      changeType: stats.usageTime?.change >= 0 ? 'increase' : 'decrease',
      icon: <Clock className="w-8 h-8 text-yellow-500" />
    }
  ] : [];

  // Formater la date relative
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Il y a moins d\'une minute';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} minute(s)`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} heure(s)`;
    if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 86400)} jour(s)`;
    return `Le ${date.toLocaleDateString('fr-FR')}`;
  };

  const formatActivity = (activity: any) => {
    const time = formatRelativeTime(activity.timestamp);
    let action = '';
    let details = '';
    
    switch(activity.type) {
      case 'conversation':
        action = 'Conversation avec Lydia';
        details = activity.details || 'Conversation IA';
        break;
      case 'call':
        action = 'Appel effectué';
        details = activity.details || 'Appel téléphonique';
        break;
      case 'document':
        action = activity.action || 'Document traité';
        details = activity.details || 'Fichier';
        break;
      default:
        action = activity.action || 'Activité';
        details = activity.details || '';
    }
    
    return {
      id: activity.id,
      action,
      details,
      time
    };
  };

  // Formatter les activités pour l'affichage
  const formattedActivities = recentActivities.map(formatActivity);

  return (
    <UserLayout>
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Tableau de bord</h1>
        
        {isLoading || companyLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Cartes de statistiques */}
            <div className="grid grid-cols-1 gap-5 mt-2 sm:grid-cols-2 lg:grid-cols-4">
              {formattedStats.map((stat) => (
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
                  {company && (
                    <div className="p-4 mt-3 bg-indigo-50 rounded-md">
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm text-indigo-700 font-medium">Entreprise: {company.name}</p>
                          {company.fonosterPhoneNumber && (
                            <p className="text-sm text-indigo-600">Numéro de téléphone: {company.fonosterPhoneNumber}</p>
                          )}
                          {!company.fonosterPhoneNumber && (
                            <p className="text-sm text-indigo-600">Configurez votre assistant vocal pour recevoir un numéro de téléphone.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
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

              {/* Guide de configuration de l'IA vocale */}
              <div className="overflow-hidden bg-white rounded-lg shadow lg:col-span-2">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Configuration de votre IA vocale</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Suivez ces étapes pour configurer votre assistant Lydia et commencer à recevoir des appels.
                  </p>
                  
                  <div className="mt-4 space-y-4">
                    <div className="relative flex pb-6">
                      <div className="absolute inset-0 flex items-center justify-center h-full w-6">
                        <div className="h-full w-0.5 bg-indigo-200"></div>
                      </div>
                      <div className="relative flex items-center justify-center flex-shrink-0 w-6 h-6 bg-indigo-600 rounded-full">
                        <span className="text-white text-xs">1</span>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">Choisir votre voix</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Sélectionnez le type de voix que vous souhaitez utiliser pour votre assistant Lydia.
                        </p>
                        <button
                          onClick={() => router.push('/dashboard/user/voice/settings?step=voice')}
                          className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          Configurer la voix →
                        </button>
                      </div>
                    </div>

                    <div className="relative flex pb-6">
                      <div className="absolute inset-0 flex items-center justify-center h-full w-6">
                        <div className="h-full w-0.5 bg-indigo-200"></div>
                      </div>
                      <div className="relative flex items-center justify-center flex-shrink-0 w-6 h-6 bg-indigo-600 rounded-full">
                        <span className="text-white text-xs">2</span>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">Personnaliser les messages d'accueil</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Définissez les messages que votre assistant utilisera pour accueillir vos clients.
                        </p>
                        <button
                          onClick={() => router.push('/dashboard/user/voice/settings?step=greeting')}
                          className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          Configurer les messages →
                        </button>
                      </div>
                    </div>

                    <div className="relative flex pb-6">
                      <div className="absolute inset-0 flex items-center justify-center h-full w-6">
                        <div className="h-full w-0.5 bg-indigo-200"></div>
                      </div>
                      <div className="relative flex items-center justify-center flex-shrink-0 w-6 h-6 bg-indigo-600 rounded-full">
                        <span className="text-white text-xs">3</span>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">Configurer les scénarios de réponse</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Créez des scénarios de réponse pour différentes situations d'appel.
                        </p>
                        <button
                          onClick={() => router.push('/dashboard/user/voice/settings?step=scenarios')}
                          className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          Configurer les scénarios →
                        </button>
                      </div>
                    </div>

                    <div className="relative flex">
                      <div className="relative flex items-center justify-center flex-shrink-0 w-6 h-6 bg-green-600 rounded-full">
                        <svg className="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">Activer votre numéro de téléphone</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Une fois la configuration terminée, activez votre numéro pour commencer à recevoir des appels.
                        </p>
                        <button
                          onClick={() => router.push('/dashboard/user/voice/settings?step=activation')}
                          className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          Activer le service →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activités récentes */}
              <div className="overflow-hidden bg-white rounded-lg shadow lg:col-span-2">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Activités récentes</h3>
                  <div className="mt-6 flow-root">
                    {formattedActivities.length > 0 ? (
                      <ul className="-my-5 divide-y divide-gray-200">
                        {formattedActivities.map((activity) => (
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
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500">Pas d'activités récentes</p>
                      </div>
                    )}
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
                <div className="grid grid-cols-1 gap-4 mt-5 sm:grid-cols-4">
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
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard/user/voice/settings')}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
                  >
                    Configurer mon IA vocale
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </UserLayout>
  );
};

export default UserDashboard; 
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/layout/AdminLayout';
import { Calendar, ArrowDown, ArrowUp, Users, Building, FileText, Clock, Download } from 'lucide-react';

const AnalyticsAdminPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [dateRange, setDateRange] = useState('month');

  // Vérifier si l'utilisateur est un admin
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Données factices pour les graphiques et statistiques
  const userStats = {
    total: 1284,
    newThisMonth: 127,
    activeToday: 342,
    growthRate: 12.4
  };

  const companyStats = {
    total: 78,
    newThisMonth: 8,
    activeToday: 65,
    growthRate: 9.7
  };

  const activityData = [
    { day: 'Lun', value: 65 },
    { day: 'Mar', value: 78 },
    { day: 'Mer', value: 85 },
    { day: 'Jeu', value: 72 },
    { day: 'Ven', value: 93 },
    { day: 'Sam', value: 41 },
    { day: 'Dim', value: 38 }
  ];

  const usersByDevice = [
    { device: 'Desktop', percentage: 64 },
    { device: 'Mobile', percentage: 28 },
    { device: 'Tablet', percentage: 8 }
  ];

  const usersByCountry = [
    { country: 'France', users: 724, percentage: 56 },
    { country: 'Belgique', users: 217, percentage: 17 },
    { country: 'Suisse', users: 156, percentage: 12 },
    { country: 'Canada', users: 105, percentage: 8 },
    { country: 'Autres', users: 82, percentage: 7 }
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-t-primary-600 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="px-4 sm:px-0">
        {/* En-tête avec sélecteur de période */}
        <div className="pb-5 mb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold leading-6 text-gray-900">Statistiques</h2>
          <div className="flex items-center mt-3 sm:mt-0">
            <div className="relative inline-block text-left">
              <select
                className="block py-2 pl-3 pr-10 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="week">7 derniers jours</option>
                <option value="month">30 derniers jours</option>
                <option value="quarter">3 derniers mois</option>
                <option value="year">12 derniers mois</option>
              </select>
            </div>
            
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Download className="w-5 h-5 mr-2 -ml-1" />
              Exporter
            </button>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 gap-5 mt-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="px-4 py-5 overflow-hidden bg-white rounded-lg shadow sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Utilisateurs totaux</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{userStats.total}</dd>
            <div className="flex items-center mt-2 text-sm">
              <span className={`flex items-center ${userStats.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {userStats.growthRate > 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                {Math.abs(userStats.growthRate)}%
              </span>
              <span className="ml-2 text-gray-500">vs dernière période</span>
            </div>
          </div>
          
          <div className="px-4 py-5 overflow-hidden bg-white rounded-lg shadow sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Nouveaux ce mois</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{userStats.newThisMonth}</dd>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-gray-500">
                {Math.round((userStats.newThisMonth / userStats.total) * 100)}% du total
              </span>
            </div>
          </div>
          
          <div className="px-4 py-5 overflow-hidden bg-white rounded-lg shadow sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Entreprises</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{companyStats.total}</dd>
            <div className="flex items-center mt-2 text-sm">
              <span className={`flex items-center ${companyStats.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {companyStats.growthRate > 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                {Math.abs(companyStats.growthRate)}%
              </span>
              <span className="ml-2 text-gray-500">vs dernière période</span>
            </div>
          </div>
          
          <div className="px-4 py-5 overflow-hidden bg-white rounded-lg shadow sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Utilisateurs actifs aujourd'hui</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{userStats.activeToday}</dd>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-gray-500">
                {Math.round((userStats.activeToday / userStats.total) * 100)}% du total
              </span>
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 gap-5 mt-8 lg:grid-cols-2">
          {/* Activité par jour */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Activité par jour</h3>
            <div className="mt-6">
              <div className="flex items-end justify-between h-64">
                {activityData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-10 bg-primary-600 rounded-t"
                      style={{ height: `${(item.value / 100) * 200}px` }}
                    ></div>
                    <div className="mt-2 text-xs font-medium text-gray-500">{item.day}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Répartition par appareil */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Répartition par appareil</h3>
            <div className="mt-6">
              <div className="space-y-4">
                {usersByDevice.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-700">{item.device}</div>
                      <div className="text-sm font-medium text-gray-900">{item.percentage}%</div>
                    </div>
                    <div className="relative w-full h-4 mt-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="absolute top-0 left-0 h-4 bg-primary-600"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tableaux détaillés */}
        <div className="grid grid-cols-1 gap-5 mt-8 lg:grid-cols-2">
          {/* Utilisateurs par pays */}
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Utilisateurs par pays</h3>
            </div>
            <div className="border-t border-gray-200">
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">
                            Pays
                          </th>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">
                            Utilisateurs
                          </th>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">
                            Pourcentage
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {usersByCountry.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                              {item.country}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {item.users}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-sm text-gray-900">{item.percentage}%</span>
                                <div className="w-24 h-2 ml-3 bg-gray-200 rounded-full">
                                  <div
                                    className="h-2 bg-primary-600 rounded-full"
                                    style={{ width: `${item.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Métriques clés */}
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Métriques clés</h3>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Temps moyen de session</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">8m 12s</dd>
                </div>
                <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Pages vues par session</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">5.7</dd>
                </div>
                <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Taux de rebond</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">32.4%</dd>
                </div>
                <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Nouveaux vs. récurrents</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">28% / 72%</dd>
                </div>
                <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Taux de conversion</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">9.8%</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        
        {/* Actions et remarques */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Opportunités d'amélioration</h3>
            <div className="mt-5 border-t border-gray-200">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Engagement des utilisateurs</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    Le taux d'engagement a baissé de 5% par rapport au mois dernier. Envisagez d'envoyer une campagne d'email pour réactiver les utilisateurs dormants.
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Optimisation mobile</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    Le taux de rebond sur mobile est 15% plus élevé que sur desktop. Une révision de l'expérience mobile pourrait améliorer la rétention.
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Expansion géographique</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    Augmentation de 23% des visiteurs du Canada. Envisagez d'ajouter du contenu plus spécifique pour ce marché en croissance.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsAdminPage; 
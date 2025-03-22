import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Phone, Users, Building, Clock, TrendingUp, BarChart2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';

const Dashboard: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  // Rediriger si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role === 'admin') {
      // Si c'est un admin, le rediriger vers le dashboard admin
      router.push('/dashboard/admin');
    }
  }, [user, router]);

  // Si l'utilisateur n'est pas encore chargé, afficher un loader
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-t-primary-600 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Ces données seraient normalement chargées depuis l'API
  const stats = [
    {
      id: 1,
      name: 'Appels aujourd\'hui',
      value: '24',
      icon: <Phone className="w-6 h-6 text-primary-500" />,
      change: '+12%',
      changeType: 'increase'
    },
    {
      id: 2,
      name: 'Durée moyenne',
      value: '3m 42s',
      icon: <Clock className="w-6 h-6 text-indigo-500" />,
      change: '-8%',
      changeType: 'decrease'
    },
    {
      id: 3,
      name: 'Utilisateurs actifs',
      value: '12',
      icon: <Users className="w-6 h-6 text-green-500" />,
      change: '+2',
      changeType: 'increase'
    },
    {
      id: 4,
      name: 'Entreprises',
      value: '3',
      icon: <Building className="w-6 h-6 text-yellow-500" />,
      change: '0',
      changeType: 'neutral'
    }
  ];

  const recentCalls = [
    {
      id: 1,
      caller: '+33 6 12 34 56 78',
      duration: '4m 12s',
      timestamp: '2023-03-17T10:30:00',
      status: 'completed'
    },
    {
      id: 2,
      caller: '+33 6 98 76 54 32',
      duration: '2m 45s',
      timestamp: '2023-03-17T11:15:00',
      status: 'completed'
    },
    {
      id: 3,
      caller: '+33 6 55 44 33 22',
      duration: '1m 30s',
      timestamp: '2023-03-17T13:20:00',
      status: 'missed'
    },
    {
      id: 4,
      caller: '+33 6 11 22 33 44',
      duration: '5m 18s',
      timestamp: '2023-03-17T14:05:00',
      status: 'completed'
    },
    {
      id: 5,
      caller: '+33 6 99 88 77 66',
      duration: '0m 45s',
      timestamp: '2023-03-17T15:30:00',
      status: 'missed'
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  };

  return (
    <MainLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="mt-2 text-sm text-gray-700 sm:mt-0">
            Bienvenue, {user?.firstName} {user?.lastName}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.id} className="overflow-hidden">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">{stat.icon}</div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className={`bg-gray-50 px-5 py-3 ${
                stat.changeType === 'increase' 
                  ? 'text-green-600' 
                  : stat.changeType === 'decrease' 
                    ? 'text-red-600' 
                    : 'text-gray-500'
              }`}>
                <div className="text-sm flex items-center">
                  {stat.changeType === 'increase' ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : stat.changeType === 'decrease' ? (
                    <TrendingUp className="w-4 h-4 mr-1 transform rotate-180" />
                  ) : null}
                  <span>{stat.change} depuis hier</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Appels récents</CardTitle>
              <p className="text-sm text-gray-500">Les 5 derniers appels reçus</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Numéro
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durée
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentCalls.map((call) => (
                      <tr key={call.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {call.caller}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(call.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {call.duration}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            call.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {call.status === 'completed' ? 'Terminé' : 'Manqué'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Statistiques d'appels</CardTitle>
              <p className="text-sm text-gray-500">Répartition des appels par jour</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <BarChart2 className="w-16 h-16 mx-auto text-gray-400" />
                  <p className="mt-2">Les graphiques seront disponibles prochainement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard; 
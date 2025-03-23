import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import UserLayout from '@/components/layouts/UserLayout';
import { PhoneCall, Search, Plus, Filter, ArrowUpRight, ArrowDownLeft, Phone, BarChart2 } from 'lucide-react';

const CallsPage: NextPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Données fictives pour les appels
  const calls = [
    { 
      id: '1',
      type: 'incoming',
      contact: 'Service Client',
      number: '+33 1 23 45 67 89',
      duration: '5:23',
      date: '2023-06-15T10:30:00',
      status: 'completed'
    },
    { 
      id: '2',
      type: 'outgoing',
      contact: 'Jean Dupont',
      number: '+33 6 12 34 56 78',
      duration: '3:12',
      date: '2023-06-14T14:15:00',
      status: 'completed'
    },
    { 
      id: '3',
      type: 'incoming',
      contact: 'Inconnu',
      number: '+33 7 65 43 21 09',
      duration: '0:48',
      date: '2023-06-12T09:45:00',
      status: 'missed'
    },
    { 
      id: '4',
      type: 'outgoing',
      contact: 'Marie Martin',
      number: '+33 6 98 76 54 32',
      duration: '12:05',
      date: '2023-06-10T16:20:00',
      status: 'completed'
    },
    { 
      id: '5',
      type: 'incoming',
      contact: 'Paul Bernard',
      number: '+33 6 11 22 33 44',
      duration: '0:33',
      date: '2023-06-08T11:05:00',
      status: 'missed'
    }
  ];

  // Filtrer les appels en fonction du terme de recherche
  const filteredCalls = calls.filter(
    (call) =>
      call.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <UserLayout>
      <div className="px-4 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Mes appels</h1>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard/user/calls/monitoring')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Tableau de bord
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/dashboard/user/calls/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvel appel
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="Rechercher un appel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <div className="h-full py-0 pl-2 pr-3 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md">
                <Filter className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Liste des appels */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredCalls.length > 0 ? (
              filteredCalls.map((call) => (
                <li key={call.id}>
                  <div 
                    className="block hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/dashboard/user/calls/${call.id}`)}
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              call.type === 'incoming' 
                                ? call.status === 'missed' 
                                  ? 'bg-red-100' 
                                  : 'bg-green-100'
                                : 'bg-blue-100'
                            }`}>
                              {call.type === 'incoming' ? (
                                <ArrowDownLeft className={`h-6 w-6 ${
                                  call.status === 'missed' ? 'text-red-600' : 'text-green-600'
                                }`} />
                              ) : (
                                <ArrowUpRight className="h-6 w-6 text-blue-600" />
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {call.contact}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {call.number}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="text-sm text-gray-500">
                            {formatDate(call.date)}
                          </p>
                          <div className="mt-1 flex items-center">
                            {call.status !== 'missed' && (
                              <span className="text-sm text-gray-500 mr-2">
                                {call.duration}
                              </span>
                            )}
                            {call.status === 'missed' ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Manqué
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Terminé
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-5 sm:px-6 text-center">
                <p className="text-sm text-gray-500">Aucun appel trouvé</p>
                <div className="mt-4 flex justify-center space-x-3">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard/user/calls/new')}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Passer un appel
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard/user/calls/monitoring')}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <BarChart2 className="h-3 w-3 mr-1" />
                    Voir le tableau de bord
                  </button>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </UserLayout>
  );
};

export default CallsPage; 
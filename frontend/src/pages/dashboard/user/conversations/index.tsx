import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import UserLayout from '@/components/layouts/UserLayout';
import { MessageCircle, Search, Plus, Filter } from 'lucide-react';

const ConversationsPage: NextPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Données fictives pour les conversations
  const conversations = [
    { 
      id: '1',
      title: 'Support technique - imprimante',
      lastMessage: 'Comment puis-je configurer mon imprimante sans fil ?',
      date: '2023-06-15T10:30:00',
      status: 'completed'
    },
    { 
      id: '2',
      title: 'Question facturation',
      lastMessage: 'Je souhaiterais des informations sur ma dernière facture.',
      date: '2023-06-14T14:15:00',
      status: 'completed'
    },
    { 
      id: '3',
      title: 'Installation logiciel',
      lastMessage: 'Pouvez-vous m\'aider avec l\'installation du logiciel ?',
      date: '2023-06-12T09:45:00',
      status: 'completed'
    },
    { 
      id: '4',
      title: 'Demande de devis',
      lastMessage: 'J\'aimerais obtenir un devis pour vos services.',
      date: '2023-06-10T16:20:00',
      status: 'completed'
    },
    { 
      id: '5',
      title: 'Problème de connexion',
      lastMessage: 'Je n\'arrive pas à me connecter à mon compte.',
      date: '2023-06-08T11:05:00',
      status: 'completed'
    }
  ];

  // Filtrer les conversations en fonction du terme de recherche
  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-semibold text-gray-900">Mes conversations</h1>
          <button
            type="button"
            onClick={() => router.push('/dashboard/user/conversations/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle conversation
          </button>
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
              placeholder="Rechercher une conversation..."
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

        {/* Liste des conversations */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <li key={conversation.id}>
                  <div 
                    className="block hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/dashboard/user/conversations/${conversation.id}`)}
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <MessageCircle className="h-6 w-6 text-indigo-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {conversation.title}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {conversation.lastMessage}
                            </p>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {formatDate(conversation.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-5 sm:px-6 text-center">
                <p className="text-sm text-gray-500">Aucune conversation trouvée</p>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/user/conversations/new')}
                  className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Démarrer une conversation
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </UserLayout>
  );
};

export default ConversationsPage; 
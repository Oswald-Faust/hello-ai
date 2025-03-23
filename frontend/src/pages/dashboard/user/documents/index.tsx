import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import UserLayout from '@/components/layouts/UserLayout';
import { 
  FileText, 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Share2, 
  File, 
  Image, 
  File as FilePdf,
  FileSpreadsheet as FileExcel,
  FileText as FilePresentation
} from 'lucide-react';

const DocumentsPage: NextPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Données fictives pour les documents
  const documents = [
    { 
      id: '1',
      title: 'Résumé de réunion',
      type: 'pdf',
      size: '256 Ko',
      date: '2023-06-15T10:30:00',
      tags: ['réunion', 'compte-rendu']
    },
    { 
      id: '2',
      title: 'Présentation projet',
      type: 'pptx',
      size: '3.5 Mo',
      date: '2023-06-14T14:15:00',
      tags: ['présentation', 'projet']
    },
    { 
      id: '3',
      title: 'Budget prévisionnel',
      type: 'xlsx',
      size: '1.2 Mo',
      date: '2023-06-12T09:45:00',
      tags: ['budget', 'finance']
    },
    { 
      id: '4',
      title: 'Contrat client',
      type: 'docx',
      size: '420 Ko',
      date: '2023-06-10T16:20:00',
      tags: ['contrat', 'légal']
    },
    { 
      id: '5',
      title: 'Capture d\'écran',
      type: 'png',
      size: '1.8 Mo',
      date: '2023-06-08T11:05:00',
      tags: ['image', 'capture']
    }
  ];

  // Filtrer les documents en fonction du terme de recherche
  const filteredDocuments = documents.filter(
    (document) =>
      document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
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

  // Fonction pour déterminer l'icône du document en fonction de son type
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FilePdf className="h-6 w-6 text-red-500" />;
      case 'docx':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'xlsx':
        return <FileExcel className="h-6 w-6 text-green-500" />;
      case 'pptx':
        return <FilePresentation className="h-6 w-6 text-orange-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <Image className="h-6 w-6 text-purple-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <UserLayout>
      <div className="px-4 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Mes documents</h1>
          <button
            type="button"
            onClick={() => router.push('/dashboard/user/documents/upload')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau document
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
              placeholder="Rechercher un document..."
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

        {/* Liste des documents */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((document) => (
                <li key={document.id}>
                  <div 
                    className="block hover:bg-gray-50 cursor-pointer p-4"
                    onClick={() => router.push(`/dashboard/user/documents/${document.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                            {getDocumentIcon(document.type)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-indigo-600">
                            {document.title}
                          </div>
                          <div className="mt-1 flex items-center">
                            <span className="text-xs text-gray-500">
                              {document.type.toUpperCase()}
                            </span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-xs text-gray-500">
                              {document.size}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap">
                            {document.tags.map((tag, index) => (
                              <span 
                                key={index}
                                className="mr-1 mb-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-xs text-gray-500">
                          {formatDate(document.date)}
                        </p>
                        <div className="mt-2 flex space-x-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Logique pour télécharger le document
                              console.log(`Télécharger ${document.title}`);
                            }}
                            className="text-gray-400 hover:text-gray-500"
                            title="Télécharger"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Logique pour partager le document
                              console.log(`Partager ${document.title}`);
                            }}
                            className="text-gray-400 hover:text-gray-500"
                            title="Partager"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-5 sm:px-6 text-center">
                <p className="text-sm text-gray-500">Aucun document trouvé</p>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/user/documents/upload')}
                  className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Ajouter un document
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </UserLayout>
  );
};

export default DocumentsPage; 
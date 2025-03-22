import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/layout/AdminLayout';
import { FileText, Download, Filter, Calendar, ChevronDown, Search, PlusCircle } from 'lucide-react';

const ReportsAdminPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('month');

  // Vérifier si l'utilisateur est un admin
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Rapports factices
  const mockReports = [
    { id: 1, name: 'Rapport d\'activité mensuel', type: 'activity', format: 'PDF', createdAt: '2023-03-10T10:30:00', size: '2.4 MB', author: 'Système' },
    { id: 2, name: 'Rapport utilisateurs actifs', type: 'users', format: 'Excel', createdAt: '2023-03-05T14:45:00', size: '1.8 MB', author: 'Jean Dupont' },
    { id: 3, name: 'Statistiques de connexion', type: 'security', format: 'PDF', createdAt: '2023-02-28T09:15:00', size: '3.2 MB', author: 'Système' },
    { id: 4, name: 'Rapport d\'entreprises par secteur', type: 'companies', format: 'Excel', createdAt: '2023-02-22T11:20:00', size: '4.1 MB', author: 'Marie Martin' },
    { id: 5, name: 'Rapport financier mensuel', type: 'financial', format: 'PDF', createdAt: '2023-02-15T08:10:00', size: '5.3 MB', author: 'Pierre Leroy' },
    { id: 6, name: 'Audit de sécurité', type: 'security', format: 'PDF', createdAt: '2023-02-10T16:30:00', size: '2.7 MB', author: 'Système' },
    { id: 7, name: 'Rapport d\'incidents', type: 'activity', format: 'Excel', createdAt: '2023-02-05T09:45:00', size: '1.5 MB', author: 'Sophie Bernard' },
  ];

  // Filtrer les rapports
  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || report.type === filterType;
    
    const reportDate = new Date(report.createdAt);
    const today = new Date();
    const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    let matchesDate = true;
    if (dateRange === 'week') {
      matchesDate = reportDate >= lastWeek;
    } else if (dateRange === 'month') {
      matchesDate = reportDate >= lastMonth;
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

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
        {/* En-tête avec recherche et filtres */}
        <div className="pb-5 mb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold leading-6 text-gray-900">Rapports</h2>
          <div className="flex flex-col mt-3 sm:flex-row sm:mt-0 sm:ml-4">
            <div className="relative flex-grow mr-3">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un rapport..."
                className="block w-full py-2 pl-10 pr-3 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex mt-3 space-x-3 sm:mt-0">
              <div className="relative inline-block text-left">
                <select
                  className="block py-2 pl-3 pr-10 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Tous les types</option>
                  <option value="activity">Activité</option>
                  <option value="users">Utilisateurs</option>
                  <option value="companies">Entreprises</option>
                  <option value="security">Sécurité</option>
                  <option value="financial">Financier</option>
                </select>
              </div>
              
              <div className="relative inline-block text-left">
                <select
                  className="block py-2 pl-3 pr-10 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="all">Toutes les dates</option>
                  <option value="week">7 derniers jours</option>
                  <option value="month">30 derniers jours</option>
                </select>
              </div>
              
              <button
                type="button"
                onClick={() => router.push('/dashboard/admin/reports/create')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusCircle className="w-5 h-5 mr-2 -ml-1" />
                Nouveau
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 gap-5 mt-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="px-4 py-5 overflow-hidden bg-white rounded-lg shadow sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total des rapports</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{mockReports.length}</dd>
          </div>
          <div className="px-4 py-5 overflow-hidden bg-white rounded-lg shadow sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Rapports ce mois</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">5</dd>
          </div>
          <div className="px-4 py-5 overflow-hidden bg-white rounded-lg shadow sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Types de rapports</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">5</dd>
          </div>
          <div className="px-4 py-5 overflow-hidden bg-white rounded-lg shadow sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Espace utilisé</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">21 MB</dd>
          </div>
        </div>

        {/* Liste des rapports */}
        <div className="flex flex-col mt-8">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nom du rapport</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Format</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Taille</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Auteur</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReports.map((report) => (
                      <tr key={report.id}>
                        <td className="py-4 pl-4 pr-3 text-sm whitespace-nowrap sm:pl-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10">
                              <div className={`flex items-center justify-center w-10 h-10 text-white rounded-md ${
                                report.format === 'PDF' ? 'bg-red-600' : 'bg-green-600'
                              }`}>
                                <FileText className="w-6 h-6" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{report.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap">
                          <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                            report.type === 'activity' 
                              ? 'bg-blue-100 text-blue-800' 
                              : report.type === 'users'
                                ? 'bg-purple-100 text-purple-800'
                                : report.type === 'companies'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : report.type === 'security'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                          }`}>
                            {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">{report.format}</td>
                        <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">{report.size}</td>
                        <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">{report.author}</td>
                        <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(report.createdAt)}
                        </td>
                        <td className="relative py-4 pl-3 pr-4 text-sm font-medium text-right whitespace-nowrap sm:pr-6">
                          <a
                            href="#"
                            className="text-primary-600 hover:text-primary-900"
                            onClick={(e) => {
                              e.preventDefault();
                              // Logique de téléchargement
                            }}
                          >
                            <Download className="w-5 h-5" />
                            <span className="sr-only">Télécharger</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredReports.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rapport trouvé</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Essayez de modifier vos critères de recherche ou créez un nouveau rapport.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between py-3 mt-5 border-t border-gray-200">
          <div className="flex justify-between flex-1 sm:hidden">
            <a href="#" className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Précédent
            </a>
            <a href="#" className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Suivant
            </a>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredReports.length}</span> sur <span className="font-medium">{mockReports.length}</span> rapports
              </p>
            </div>
            <div>
              <nav className="inline-flex -space-x-px rounded-md shadow-sm isolate" aria-label="Pagination">
                <a href="#" className="relative inline-flex items-center px-2 py-2 text-gray-400 border border-gray-300 rounded-l-md hover:bg-gray-50 focus:z-20">
                  <span className="sr-only">Précédent</span>
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" aria-current="page" className="relative z-10 inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-primary-500 bg-primary-600 focus:z-20">
                  1
                </a>
                <a href="#" className="relative inline-flex items-center px-2 py-2 text-gray-400 border border-gray-300 rounded-r-md hover:bg-gray-50 focus:z-20">
                  <span className="sr-only">Suivant</span>
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReportsAdminPage; 
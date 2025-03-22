import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/layout/AdminLayout';
import { Search, PlusCircle, Filter, Building, Edit, Trash2, Check, X } from 'lucide-react';

const CompaniesAdminPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Vérifier si l'utilisateur est un admin
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Entreprises factices
  const mockCompanies = [
    { id: 1, name: 'Acme Corp', industry: 'Technologie', employees: 120, status: 'active', plan: 'Enterprise', createdAt: '2022-08-15T10:30:00' },
    { id: 2, name: 'Globex', industry: 'Santé', employees: 45, status: 'active', plan: 'Business', createdAt: '2022-10-22T14:45:00' },
    { id: 3, name: 'Initech', industry: 'Finance', employees: 78, status: 'inactive', plan: 'Business', createdAt: '2022-05-18T09:15:00' },
    { id: 4, name: 'Umbrella Corp', industry: 'Assurance', employees: 200, status: 'active', plan: 'Enterprise', createdAt: '2023-01-10T11:20:00' },
    { id: 5, name: 'Stark Industries', industry: 'Manufacturing', employees: 350, status: 'active', plan: 'Enterprise', createdAt: '2022-11-05T08:10:00' },
    { id: 6, name: 'Wayne Enterprises', industry: 'Immobilier', employees: 180, status: 'inactive', plan: 'Business', createdAt: '2022-12-20T16:30:00' },
    { id: 7, name: 'LexCorp', industry: 'Énergie', employees: 95, status: 'active', plan: 'Standard', createdAt: '2023-02-08T09:45:00' },
  ];

  // Filtrer les entreprises
  const filteredCompanies = mockCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || company.status === filterStatus;
    
    return matchesSearch && matchesStatus;
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
          <h2 className="text-2xl font-bold leading-6 text-gray-900">Gestion des entreprises</h2>
          <div className="flex mt-3 sm:mt-0 sm:ml-4">
            <div className="relative flex-grow mr-3">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher une entreprise..."
                className="block w-full py-2 pl-10 pr-3 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative inline-block text-left">
              <select
                className="block py-2 pl-3 pr-10 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <button
              type="button"
              onClick={() => router.push('/dashboard/admin/companies/create')}
              className="inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusCircle className="w-5 h-5 mr-2 -ml-1" />
              Ajouter
            </button>
          </div>
        </div>

        {/* Tableau des entreprises */}
        <div className="flex flex-col mt-8">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Entreprise</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Secteur</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Employés</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Formule</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date de création</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCompanies.map((company) => (
                      <tr key={company.id}>
                        <td className="py-4 pl-4 pr-3 text-sm whitespace-nowrap sm:pl-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10">
                              <div className="flex items-center justify-center w-10 h-10 text-white bg-gray-600 rounded-md">
                                <Building className="w-6 h-6" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{company.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">{company.industry}</td>
                        <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">{company.employees}</td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap">
                          <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                            company.plan === 'Enterprise' 
                              ? 'bg-purple-100 text-purple-800' 
                              : company.plan === 'Business'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {company.plan}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap">
                          <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                            company.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {company.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(company.createdAt)}
                        </td>
                        <td className="relative py-4 pl-3 pr-4 text-sm font-medium text-right whitespace-nowrap sm:pr-6">
                          <div className="flex justify-end space-x-3">
                            <button
                              type="button"
                              className="text-primary-600 hover:text-primary-900"
                              onClick={() => router.push(`/dashboard/admin/companies/${company.id}`)}
                            >
                              <Edit className="w-5 h-5" />
                              <span className="sr-only">Éditer</span>
                            </button>
                            {company.status === 'active' ? (
                              <button
                                type="button"
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                <X className="w-5 h-5" />
                                <span className="sr-only">Désactiver</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="text-green-600 hover:text-green-900"
                              >
                                <Check className="w-5 h-5" />
                                <span className="sr-only">Activer</span>
                              </button>
                            )}
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-5 h-5" />
                              <span className="sr-only">Supprimer</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredCompanies.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune entreprise trouvée</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Essayez de modifier vos critères de recherche ou ajoutez une nouvelle entreprise.
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
                Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredCompanies.length}</span> sur <span className="font-medium">{mockCompanies.length}</span> entreprises
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

export default CompaniesAdminPage;
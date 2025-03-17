import React, { useState } from 'react';
import { NextPage } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Edit, Trash, Building, Users, Phone } from 'lucide-react';

const CompaniesPage: NextPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Ces données seraient normalement chargées depuis l'API
  const companies = [
    {
      id: 1,
      name: 'Tech Solutions SAS',
      contactEmail: 'contact@techsolutions.fr',
      phone: '+33 1 23 45 67 89',
      address: '15 rue de la Paix, 75001 Paris',
      usersCount: 5,
      callsCount: 128
    },
    {
      id: 2,
      name: 'Innovate SARL',
      contactEmail: 'info@innovate.fr',
      phone: '+33 1 98 76 54 32',
      address: '42 avenue des Champs-Élysées, 75008 Paris',
      usersCount: 3,
      callsCount: 76
    },
    {
      id: 3,
      name: 'Digital Factory',
      contactEmail: 'contact@digitalfactory.fr',
      phone: '+33 1 45 67 89 10',
      address: '8 place de la Bourse, 33000 Bordeaux',
      usersCount: 8,
      callsCount: 215
    },
    {
      id: 4,
      name: 'Smart Services',
      contactEmail: 'info@smartservices.fr',
      phone: '+33 4 56 78 91 23',
      address: '25 rue de la République, 69002 Lyon',
      usersCount: 4,
      callsCount: 92
    },
    {
      id: 5,
      name: 'Future Tech',
      contactEmail: 'contact@futuretech.fr',
      phone: '+33 3 45 67 89 12',
      address: '18 rue du Faubourg, 67000 Strasbourg',
      usersCount: 6,
      callsCount: 154
    }
  ];

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.phone.includes(searchTerm) ||
    company.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddCompany = () => {
    alert('Fonctionnalité d\'ajout d\'entreprise sera implémentée ultérieurement');
  };

  const handleEditCompany = (id: number) => {
    alert(`Édition de l'entreprise avec l'ID: ${id}`);
  };

  const handleDeleteCompany = (id: number) => {
    alert(`Suppression de l'entreprise avec l'ID: ${id}`);
  };

  const handleViewUsers = (id: number) => {
    alert(`Affichage des utilisateurs de l'entreprise avec l'ID: ${id}`);
  };

  const handleViewCalls = (id: number) => {
    alert(`Affichage des appels de l'entreprise avec l'ID: ${id}`);
  };

  return (
    <MainLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des entreprises</h1>
          <Button 
            className="mt-4 sm:mt-0 flex items-center gap-1"
            onClick={handleAddCompany}
          >
            <Plus className="w-4 h-4" />
            Ajouter une entreprise
          </Button>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <CardTitle>Liste des entreprises</CardTitle>
                <div className="mt-4 md:mt-0">
                  <Input
                    placeholder="Rechercher une entreprise..."
                    value={searchTerm}
                    onChange={handleSearch}
                    leftIcon={<Search className="w-4 h-4" />}
                    className="w-full md:w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Adresse
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateurs
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Appels
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCompanies.length > 0 ? (
                      filteredCompanies.map((company) => (
                        <tr key={company.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-primary-100 rounded-full">
                                <Building className="h-5 w-5 text-primary-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{company.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{company.contactEmail}</div>
                            <div className="text-sm text-gray-500">{company.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{company.address}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1 text-gray-400" />
                              {company.usersCount}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1 text-gray-400" />
                              {company.callsCount}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => handleViewUsers(company.id)}
                              >
                                <Users className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => handleViewCalls(company.id)}
                              >
                                <Phone className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => handleEditCompany(company.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:border-red-300"
                                onClick={() => handleDeleteCompany(company.id)}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          Aucune entreprise trouvée
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default CompaniesPage; 
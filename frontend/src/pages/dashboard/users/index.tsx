import React, { useState } from 'react';
import { NextPage } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Edit, Trash, UserPlus, UserMinus, Mail, Building } from 'lucide-react';

const UsersPage: NextPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  
  // Ces données seraient normalement chargées depuis l'API
  const users = [
    {
      id: 1,
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@techsolutions.fr',
      role: 'admin',
      company: 'Tech Solutions SAS',
      status: 'active',
      lastLogin: '2023-03-17T10:30:00'
    },
    {
      id: 2,
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'marie.martin@techsolutions.fr',
      role: 'user',
      company: 'Tech Solutions SAS',
      status: 'active',
      lastLogin: '2023-03-16T14:45:00'
    },
    {
      id: 3,
      firstName: 'Pierre',
      lastName: 'Durand',
      email: 'pierre.durand@innovate.fr',
      role: 'admin',
      company: 'Innovate SARL',
      status: 'active',
      lastLogin: '2023-03-17T09:15:00'
    },
    {
      id: 4,
      firstName: 'Sophie',
      lastName: 'Leroy',
      email: 'sophie.leroy@digitalfactory.fr',
      role: 'admin',
      company: 'Digital Factory',
      status: 'inactive',
      lastLogin: '2023-03-10T11:20:00'
    },
    {
      id: 5,
      firstName: 'Thomas',
      lastName: 'Moreau',
      email: 'thomas.moreau@smartservices.fr',
      role: 'user',
      company: 'Smart Services',
      status: 'active',
      lastLogin: '2023-03-17T08:30:00'
    },
    {
      id: 6,
      firstName: 'Julie',
      lastName: 'Petit',
      email: 'julie.petit@futuretech.fr',
      role: 'user',
      company: 'Future Tech',
      status: 'pending',
      lastLogin: null
    }
  ];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Jamais';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole ? user.role === selectedRole : true;
    
    return matchesSearch && matchesRole;
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilter = (role: string | null) => {
    setSelectedRole(role);
  };

  const handleAddUser = () => {
    alert('Fonctionnalité d\'ajout d\'utilisateur sera implémentée ultérieurement');
  };

  const handleEditUser = (id: number) => {
    alert(`Édition de l'utilisateur avec l'ID: ${id}`);
  };

  const handleDeleteUser = (id: number) => {
    alert(`Suppression de l'utilisateur avec l'ID: ${id}`);
  };

  const handleActivateUser = (id: number) => {
    alert(`Activation de l'utilisateur avec l'ID: ${id}`);
  };

  const handleDeactivateUser = (id: number) => {
    alert(`Désactivation de l'utilisateur avec l'ID: ${id}`);
  };

  const handleSendInvitation = (id: number) => {
    alert(`Envoi d'invitation à l'utilisateur avec l'ID: ${id}`);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'inactive':
        return 'Inactif';
      case 'pending':
        return 'En attente';
      default:
        return status;
    }
  };

  return (
    <MainLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <Button 
            className="mt-4 sm:mt-0 flex items-center gap-1"
            onClick={handleAddUser}
          >
            <Plus className="w-4 h-4" />
            Ajouter un utilisateur
          </Button>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <CardTitle>Liste des utilisateurs</CardTitle>
                <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={handleSearch}
                    leftIcon={<Search className="w-4 h-4" />}
                    className="w-full sm:w-64"
                  />
                  <div className="flex gap-2">
                    <Button 
                      variant={selectedRole === null ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleRoleFilter(null)}
                    >
                      Tous
                    </Button>
                    <Button 
                      variant={selectedRole === 'admin' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleRoleFilter('admin')}
                    >
                      Admins
                    </Button>
                    <Button 
                      variant={selectedRole === 'user' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleRoleFilter('user')}
                    >
                      Utilisateurs
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entreprise
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rôle
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dernière connexion
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-primary-100 rounded-full">
                                <span className="text-primary-600 font-medium">
                                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-500">
                              <Building className="w-4 h-4 mr-1 text-gray-400" />
                              {user.company}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(user.status)}`}>
                              {getStatusText(user.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.lastLogin)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {user.status === 'pending' ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="flex items-center gap-1 text-yellow-500"
                                  onClick={() => handleSendInvitation(user.id)}
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>
                              ) : user.status === 'active' ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="flex items-center gap-1 text-red-500"
                                  onClick={() => handleDeactivateUser(user.id)}
                                >
                                  <UserMinus className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="flex items-center gap-1 text-green-500"
                                  onClick={() => handleActivateUser(user.id)}
                                >
                                  <UserPlus className="w-4 h-4" />
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => handleEditUser(user.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:border-red-300"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                          Aucun utilisateur trouvé
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

export default UsersPage; 
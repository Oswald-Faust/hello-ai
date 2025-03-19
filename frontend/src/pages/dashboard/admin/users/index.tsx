import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Users, Plus, Edit, Trash2, Search, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  company: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
}

const UsersList: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Vérifier si l'utilisateur est un administrateur
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
    
    fetchUsers();
  }, [user, router, currentPage, searchTerm]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Dans une implémentation réelle, vous feriez un appel API comme:
      // const response = await api.get('/users', {
      //   params: { page: currentPage, search: searchTerm }
      // });
      
      // Données fictives pour simulation
      const mockUsers: User[] = [
        {
          _id: '1',
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@example.com',
          role: 'admin',
          company: { _id: '1', name: 'Entreprise A' },
          isActive: true,
          createdAt: '2023-01-15T10:30:00Z'
        },
        {
          _id: '2',
          firstName: 'Marie',
          lastName: 'Martin',
          email: 'marie.martin@example.com',
          role: 'user',
          company: { _id: '1', name: 'Entreprise A' },
          isActive: true,
          createdAt: '2023-02-20T14:15:00Z'
        },
        {
          _id: '3',
          firstName: 'Pierre',
          lastName: 'Bernard',
          email: 'pierre.bernard@example.com',
          role: 'user',
          company: { _id: '2', name: 'Entreprise B' },
          isActive: false,
          createdAt: '2023-03-10T09:45:00Z'
        },
        {
          _id: '4',
          firstName: 'Sophie',
          lastName: 'Petit',
          email: 'sophie.petit@example.com',
          role: 'user',
          company: { _id: '3', name: 'Entreprise C' },
          isActive: true,
          createdAt: '2023-04-05T16:20:00Z'
        },
        {
          _id: '5',
          firstName: 'Thomas',
          lastName: 'Roux',
          email: 'thomas.roux@example.com',
          role: 'admin',
          company: { _id: '2', name: 'Entreprise B' },
          isActive: true,
          createdAt: '2023-05-12T11:10:00Z'
        },
      ];
      
      // Filtrer les utilisateurs selon le terme de recherche si nécessaire
      const filteredUsers = searchTerm
        ? mockUsers.filter(u => 
            u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.company.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : mockUsers;
      
      setUsers(filteredUsers);
      setTotalPages(Math.ceil(filteredUsers.length / 10)); // 10 utilisateurs par page
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Réinitialiser à la première page lors d'une nouvelle recherche
  };
  
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        // Dans une implémentation réelle, vous feriez un appel API comme:
        // await api.delete(`/users/${userId}`);
        console.log(`Supprimer l'utilisateur avec l'ID: ${userId}`);
        
        // Mise à jour locale de l'état
        setUsers(users.filter(user => user._id !== userId));
      } catch (error) {
        console.error(`Erreur lors de la suppression de l'utilisateur ${userId}:`, error);
      }
    }
  };
  
  const handleEditUser = (userId: string) => {
    router.push(`/dashboard/admin/users/edit/${userId}`);
  };
  
  const handleAddUser = () => {
    router.push('/dashboard/admin/users/create');
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <MainLayout>
      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col mb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            <p className="text-sm text-gray-600">Administrez les comptes utilisateurs du système</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              onClick={handleAddUser}
              className="flex items-center"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Ajouter un utilisateur
            </Button>
          </div>
        </div>

        {/* Filtres et recherche */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={handleSearch}
                  leftIcon={<Search className="w-5 h-5" />}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des utilisateurs */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <p>Chargement...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">Nom</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Entreprise</th>
                        <th className="px-6 py-3">Rôle</th>
                        <th className="px-6 py-3">Statut</th>
                        <th className="px-6 py-3">Date de création</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr 
                          key={user._id} 
                          className="bg-white border-b hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="px-6 py-4">{user.email}</td>
                          <td className="px-6 py-4">{user.company.name}</td>
                          <td className="px-6 py-4">
                            <span 
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                user.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span 
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                user.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {user.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-6 py-4">{formatDate(user.createdAt)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleEditUser(user._id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t">
                    <button
                      className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Précédent
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} sur {totalPages}
                    </span>
                    <button
                      className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default UsersList; 
import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Building, Plus, Edit, Trash2, Search, Phone, Mail, MapPin, Globe, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Company {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  website?: string;
  isActive: boolean;
  createdAt: string;
  userCount?: number;
}

const CompaniesList: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Vérifier si l'utilisateur est un administrateur
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
    
    fetchCompanies();
  }, [user, router, currentPage, searchTerm]);
  
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      // Dans une implémentation réelle, vous feriez un appel API comme:
      // const response = await api.get('/companies', {
      //   params: { page: currentPage, search: searchTerm }
      // });
      
      // Données fictives pour simulation
      const mockCompanies: Company[] = [
        {
          _id: '1',
          name: 'Entreprise A',
          email: 'contact@entreprise-a.com',
          phone: '+33 1 23 45 67 89',
          address: {
            street: '10 Rue de la Paix',
            city: 'Paris',
            postalCode: '75001',
            country: 'France'
          },
          website: 'www.entreprise-a.com',
          isActive: true,
          createdAt: '2023-01-10T09:30:00Z',
          userCount: 15
        },
        {
          _id: '2',
          name: 'Entreprise B',
          email: 'info@entreprise-b.com',
          phone: '+33 1 98 76 54 32',
          address: {
            street: '25 Avenue des Champs-Élysées',
            city: 'Paris',
            postalCode: '75008',
            country: 'France'
          },
          website: 'www.entreprise-b.com',
          isActive: true,
          createdAt: '2023-02-15T14:45:00Z',
          userCount: 8
        },
        {
          _id: '3',
          name: 'Entreprise C',
          email: 'support@entreprise-c.com',
          phone: '+33 4 56 78 90 12',
          address: {
            street: '5 Place Bellecour',
            city: 'Lyon',
            postalCode: '69002',
            country: 'France'
          },
          website: 'www.entreprise-c.com',
          isActive: false,
          createdAt: '2023-03-20T11:15:00Z',
          userCount: 3
        },
        {
          _id: '4',
          name: 'Entreprise D',
          email: 'hello@entreprise-d.com',
          phone: '+33 5 67 89 01 23',
          address: {
            street: '15 Rue du Vieux Port',
            city: 'Marseille',
            postalCode: '13001',
            country: 'France'
          },
          website: 'www.entreprise-d.com',
          isActive: true,
          createdAt: '2023-04-05T10:00:00Z',
          userCount: 7
        },
      ];
      
      // Filtrer les entreprises selon le terme de recherche si nécessaire
      const filteredCompanies = searchTerm
        ? mockCompanies.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (c.address?.city && c.address.city.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : mockCompanies;
      
      setCompanies(filteredCompanies);
      setTotalPages(Math.ceil(filteredCompanies.length / 10)); // 10 entreprises par page
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Réinitialiser à la première page lors d'une nouvelle recherche
  };
  
  const handleDeleteCompany = async (companyId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) {
      try {
        // Dans une implémentation réelle, vous feriez un appel API comme:
        // await api.delete(`/companies/${companyId}`);
        console.log(`Supprimer l'entreprise avec l'ID: ${companyId}`);
        
        // Mise à jour locale de l'état
        setCompanies(companies.filter(company => company._id !== companyId));
      } catch (error) {
        console.error(`Erreur lors de la suppression de l'entreprise ${companyId}:`, error);
      }
    }
  };
  
  const handleEditCompany = (companyId: string) => {
    router.push(`/dashboard/admin/companies/edit/${companyId}`);
  };
  
  const handleAddCompany = () => {
    router.push('/dashboard/admin/companies/create');
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Entreprises</h1>
            <p className="text-sm text-gray-600">Administrez les entreprises enregistrées dans le système</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              onClick={handleAddCompany}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une entreprise
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
                  placeholder="Rechercher une entreprise..."
                  value={searchTerm}
                  onChange={handleSearch}
                  leftIcon={<Search className="w-5 h-5" />}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des entreprises */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex items-center justify-center p-8">
              <p>Chargement...</p>
            </div>
          ) : (
            companies.map((company) => (
              <Card key={company._id} className="overflow-hidden">
                <CardHeader className="p-4 pb-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">{company.name}</CardTitle>
                    <span 
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        company.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {company.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {company.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm">{company.email}</span>
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm">{company.phone}</span>
                      </div>
                    )}
                    {company.address?.city && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm">
                          {company.address.city}
                          {company.address.country && `, ${company.address.country}`}
                        </span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-gray-400" />
                        <a 
                          href={`https://${company.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {company.website}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{company.userCount || 0} utilisateurs</span>
                    </div>
                    <div className="pt-2 mt-2 border-t">
                      <p className="text-xs text-gray-500">
                        Créée le {formatDate(company.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4 space-x-2">
                    <button 
                      onClick={() => handleEditCompany(company._id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCompany(company._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-6">
            <button
              className="px-3 py-1 mr-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Précédent
            </button>
            <span className="mx-4 text-sm text-gray-600">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              className="px-3 py-1 ml-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CompaniesList; 
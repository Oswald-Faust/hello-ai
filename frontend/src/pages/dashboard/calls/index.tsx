import React, { useState } from 'react';
import { NextPage } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Phone, Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const CallsPage: NextPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  // Ces données seraient normalement chargées depuis l'API
  const calls = [
    {
      id: 1,
      caller: '+33 6 12 34 56 78',
      duration: '4m 12s',
      timestamp: '2023-03-17T10:30:00',
      status: 'completed',
      notes: 'Client demandant des informations sur nos services'
    },
    {
      id: 2,
      caller: '+33 6 98 76 54 32',
      duration: '2m 45s',
      timestamp: '2023-03-17T11:15:00',
      status: 'completed',
      notes: 'Problème technique résolu'
    },
    {
      id: 3,
      caller: '+33 6 55 44 33 22',
      duration: '1m 30s',
      timestamp: '2023-03-17T13:20:00',
      status: 'missed',
      notes: 'Appel manqué'
    },
    {
      id: 4,
      caller: '+33 6 11 22 33 44',
      duration: '5m 18s',
      timestamp: '2023-03-17T14:05:00',
      status: 'completed',
      notes: 'Demande de devis'
    },
    {
      id: 5,
      caller: '+33 6 99 88 77 66',
      duration: '0m 45s',
      timestamp: '2023-03-17T15:30:00',
      status: 'missed',
      notes: 'Appel manqué'
    },
    {
      id: 6,
      caller: '+33 6 11 22 33 55',
      duration: '3m 22s',
      timestamp: '2023-03-16T09:15:00',
      status: 'completed',
      notes: 'Question sur la facturation'
    },
    {
      id: 7,
      caller: '+33 6 22 33 44 55',
      duration: '6m 05s',
      timestamp: '2023-03-16T10:45:00',
      status: 'completed',
      notes: 'Demande d\'assistance technique'
    },
    {
      id: 8,
      caller: '+33 6 33 44 55 66',
      duration: '1m 12s',
      timestamp: '2023-03-16T14:20:00',
      status: 'missed',
      notes: 'Appel manqué'
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const filteredCalls = calls
    .filter(call => {
      const matchesSearch = call.caller.includes(searchTerm) || 
                           call.notes.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus ? call.status === selectedStatus : true;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredCalls.length / itemsPerPage);
  const paginatedCalls = filteredCalls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilter = (status: string | null) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleExport = () => {
    alert('Fonctionnalité d\'export sera implémentée ultérieurement');
  };

  return (
    <MainLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des appels</h1>
          <p className="mt-2 text-sm text-gray-700 sm:mt-0">
            Historique et détails de tous les appels
          </p>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <CardTitle>Historique des appels</CardTitle>
                <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={handleSearch}
                      leftIcon={<Search className="w-4 h-4" />}
                      className="w-full sm:w-64"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-1"
                        onClick={() => handleStatusFilter(null)}
                      >
                        <Filter className="w-4 h-4" />
                        {selectedStatus ? `Filtre: ${selectedStatus}` : 'Tous les appels'}
                      </Button>
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                        <div className="py-1">
                          <button 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            onClick={() => handleStatusFilter('completed')}
                          >
                            Terminés
                          </button>
                          <button 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            onClick={() => handleStatusFilter('missed')}
                          >
                            Manqués
                          </button>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-1"
                      onClick={handleExport}
                    >
                      <Download className="w-4 h-4" />
                      Exporter
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedCalls.length > 0 ? (
                      paginatedCalls.map((call) => (
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
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {call.notes}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <Phone className="w-4 h-4" />
                              Détails
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          Aucun appel trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * itemsPerPage, filteredCalls.length)}
                        </span>{' '}
                        sur <span className="font-medium">{filteredCalls.length}</span> résultats
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <Button
                          variant="outline"
                          className="relative inline-flex items-center rounded-l-md px-2 py-2"
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={page === currentPage ? 'default' : 'outline'}
                            className="relative inline-flex items-center px-4 py-2"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          className="relative inline-flex items-center rounded-r-md px-2 py-2"
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default CallsPage; 
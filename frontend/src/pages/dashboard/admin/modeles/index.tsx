import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/layout/AdminLayout';
import { Database, Users, Building2, Phone, Settings, Plus, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ModelsAdminPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  // Vérifier si l'utilisateur est un admin
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Liste des modèles disponibles dans l'application
  const models = [
    {
      id: 'user',
      name: 'Utilisateurs',
      description: 'Gérer les propriétés et les champs du modèle utilisateur',
      icon: <Users className="w-12 h-12 text-blue-500" />,
      count: 8,
      path: '/dashboard/admin/modeles/user'
    },
    {
      id: 'company',
      name: 'Entreprises',
      description: 'Gérer les propriétés et les champs du modèle entreprise',
      icon: <Building2 className="w-12 h-12 text-green-500" />,
      count: 12,
      path: '/dashboard/admin/modeles/company'
    },
    {
      id: 'call',
      name: 'Appels',
      description: 'Gérer les propriétés et les champs du modèle d\'appel',
      icon: <Phone className="w-12 h-12 text-purple-500" />,
      count: 15,
      path: '/dashboard/admin/modeles/call'
    },
    {
      id: 'settings',
      name: 'Paramètres',
      description: 'Gérer les propriétés et les champs des paramètres système',
      icon: <Settings className="w-12 h-12 text-orange-500" />,
      count: 10,
      path: '/dashboard/admin/modeles/settings'
    }
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-t-primary-600 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des modèles</h1>
            <p className="text-sm text-gray-600">Configurez les modèles de données de l'application</p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/admin/modeles/create')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nouveau modèle
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
          {models.map((model) => (
            <Card key={model.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-0">
                <button
                  onClick={() => router.push(model.path)}
                  className="flex items-start w-full p-6 text-left"
                >
                  <div className="flex-shrink-0 p-3 rounded-lg bg-gray-50">
                    {model.icon}
                  </div>
                  <div className="flex-1 ml-5">
                    <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
                    <p className="text-sm text-gray-600">{model.description}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span className="font-medium">{model.count} champs configurés</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 mt-3" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Documentation des modèles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-600">
                  Les modèles constituent la structure de données de votre application. Chaque modèle représente une entité dans le système 
                  et contient différents champs et propriétés. Vous pouvez personnaliser les modèles existants ou en créer de nouveaux.
                </p>
                <h3 className="text-gray-900 font-medium mt-4">Bonnes pratiques</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>Définissez clairement les champs obligatoires pour chaque modèle</li>
                  <li>Utilisez des types de données appropriés pour optimiser les performances</li>
                  <li>Établissez des relations claires entre les différents modèles</li>
                  <li>Documentez les champs personnalisés pour les autres utilisateurs</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ModelsAdminPage; 
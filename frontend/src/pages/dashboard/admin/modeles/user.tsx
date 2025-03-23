import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/layout/AdminLayout';
import { ArrowLeft, Plus, Edit, Trash2, Users, Info, Lock, Mail, Phone, Building2, Settings, Eye, EyeOff, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';

type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'email' | 'password' | 'reference';

interface UserField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  defaultValue?: string | number | boolean;
  hidden: boolean;
  system: boolean;
  reference?: string;
  description?: string;
  validation?: string;
}

const UserModelPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Champs du modèle utilisateur
  const [fields, setFields] = useState<UserField[]>([
    {
      id: 'firstName',
      name: 'firstName',
      label: 'Prénom',
      type: 'string',
      required: true,
      defaultValue: '',
      hidden: false,
      system: true,
      description: 'Prénom de l\'utilisateur'
    },
    {
      id: 'lastName',
      name: 'lastName',
      label: 'Nom',
      type: 'string',
      required: true,
      defaultValue: '',
      hidden: false,
      system: true,
      description: 'Nom de famille de l\'utilisateur'
    },
    {
      id: 'email',
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      defaultValue: '',
      hidden: false,
      system: true,
      description: 'Adresse email (utilisée pour la connexion)',
      validation: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$'
    },
    {
      id: 'password',
      name: 'password',
      label: 'Mot de passe',
      type: 'password',
      required: true,
      hidden: true,
      system: true,
      description: 'Mot de passe (stocké de façon sécurisée)'
    },
    {
      id: 'role',
      name: 'role',
      label: 'Rôle',
      type: 'string',
      required: true,
      defaultValue: 'user',
      hidden: false,
      system: true,
      description: 'Rôle de l\'utilisateur (admin, user, etc.)'
    },
    {
      id: 'company',
      name: 'company',
      label: 'Entreprise',
      type: 'reference',
      required: false,
      hidden: false,
      system: true,
      reference: 'Company',
      description: 'Entreprise associée à l\'utilisateur'
    },
    {
      id: 'phoneNumber',
      name: 'phoneNumber',
      label: 'Téléphone',
      type: 'string',
      required: false,
      defaultValue: '',
      hidden: false,
      system: false,
      description: 'Numéro de téléphone'
    },
    {
      id: 'isActive',
      name: 'isActive',
      label: 'Actif',
      type: 'boolean',
      required: true,
      defaultValue: true,
      hidden: false,
      system: true,
      description: 'Indique si le compte est actif'
    }
  ]);

  // Nouveau champ en cours d'édition
  const [newField, setNewField] = useState<UserField>({
    id: '',
    name: '',
    label: '',
    type: 'string',
    required: false,
    defaultValue: '',
    hidden: false,
    system: false,
    description: ''
  });

  // Vérifier si l'utilisateur est un admin
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, fieldId: string) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFields(prevFields => 
      prevFields.map(field => 
        field.id === fieldId
          ? { 
              ...field, 
              [name]: type === 'checkbox' ? checked : value
            }
          : field
      )
    );
  };

  const handleNewFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setNewField(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Générer automatiquement l'ID à partir du nom
    if (name === 'name') {
      setNewField(prev => ({
        ...prev,
        id: value.trim().replace(/\s+/g, '').toLowerCase()
      }));
    }
  };

  const addField = () => {
    if (!newField.name || !newField.label) {
      setErrorMessage('Le nom et le libellé du champ sont requis');
      return;
    }

    // Vérifier si le nom existe déjà
    if (fields.some(field => field.name === newField.name)) {
      setErrorMessage('Un champ avec ce nom existe déjà');
      return;
    }

    setFields([...fields, newField]);
    setNewField({
      id: '',
      name: '',
      label: '',
      type: 'string',
      required: false,
      defaultValue: '',
      hidden: false,
      system: false,
      description: ''
    });
    
    setSuccessMessage('Champ ajouté avec succès');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const deleteField = (fieldId: string) => {
    // Ne pas supprimer les champs système
    const fieldToDelete = fields.find(field => field.id === fieldId);
    if (fieldToDelete && fieldToDelete.system) {
      setErrorMessage('Impossible de supprimer un champ système');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setFields(fields.filter(field => field.id !== fieldId));
    setSuccessMessage('Champ supprimé avec succès');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const saveModel = () => {
    // Simuler une sauvegarde
    console.log('Sauvegarde du modèle utilisateur:', fields);
    setSuccessMessage('Modèle sauvegardé avec succès');
    setTimeout(() => setSuccessMessage(''), 3000);
    setIsEditMode(false);
  };

  const getFieldIcon = (type: FieldType) => {
    switch (type) {
      case 'string':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'email':
        return <Mail className="w-5 h-5 text-purple-500" />;
      case 'password':
        return <Lock className="w-5 h-5 text-red-500" />;
      case 'number':
        return <Info className="w-5 h-5 text-green-500" />;
      case 'boolean':
        return <Info className="w-5 h-5 text-yellow-500" />;
      case 'date':
        return <Info className="w-5 h-5 text-orange-500" />;
      case 'reference':
        return <Building2 className="w-5 h-5 text-indigo-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
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
      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/dashboard/admin/modeles')}
              className="p-2 mr-4 text-gray-500 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Modèle Utilisateur</h1>
              <p className="text-sm text-gray-600">Configuration des champs et propriétés du modèle utilisateur</p>
            </div>
          </div>
          <div className="flex space-x-3">
            {isEditMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditMode(false)}
                >
                  Annuler
                </Button>
                <Button
                  variant="default"
                  leftIcon={<Save className="w-4 h-4" />}
                  onClick={saveModel}
                >
                  Enregistrer
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                leftIcon={<Edit className="w-4 h-4" />}
                onClick={() => setIsEditMode(true)}
              >
                Modifier
              </Button>
            )}
          </div>
        </div>

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border border-green-200">
            <AlertTitle>Succès</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary-600" />
              Champs du modèle utilisateur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Obligatoire
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valeur par défaut
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visibilité
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Système
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    {isEditMode && (
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fields.map(field => (
                    <tr key={field.id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {getFieldIcon(field.type)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{field.label}</div>
                            <div className="text-xs text-gray-500">{field.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {isEditMode && !field.system ? (
                          <select
                            name="type"
                            value={field.type}
                            onChange={(e) => handleFieldChange(e, field.id)}
                            className="block w-full px-3 py-2 text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="string">Texte</option>
                            <option value="number">Nombre</option>
                            <option value="boolean">Booléen</option>
                            <option value="date">Date</option>
                            <option value="email">Email</option>
                            <option value="password">Mot de passe</option>
                            <option value="reference">Référence</option>
                          </select>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {field.type === 'string' && 'Texte'}
                            {field.type === 'number' && 'Nombre'}
                            {field.type === 'boolean' && 'Booléen'}
                            {field.type === 'date' && 'Date'}
                            {field.type === 'email' && 'Email'}
                            {field.type === 'password' && 'Mot de passe'}
                            {field.type === 'reference' && 'Référence'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isEditMode && !field.system ? (
                          <input
                            type="checkbox"
                            name="required"
                            checked={field.required}
                            onChange={(e) => handleFieldChange(e, field.id)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                        ) : (
                          <span>{field.required ? 'Oui' : 'Non'}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isEditMode && !field.system ? (
                          <Input
                            name="defaultValue"
                            value={field.defaultValue?.toString() || ''}
                            onChange={(e) => handleFieldChange(e, field.id)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span>{field.defaultValue?.toString() || '-'}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isEditMode ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              name="hidden"
                              checked={field.hidden}
                              onChange={(e) => handleFieldChange(e, field.id)}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <span>{field.hidden ? 'Caché' : 'Visible'}</span>
                          </div>
                        ) : (
                          <span className="flex items-center">
                            {field.hidden ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-1 text-gray-400" />
                                Caché
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-1 text-gray-400" />
                                Visible
                              </>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          field.system 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {field.system ? 'Système' : 'Personnalisé'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isEditMode && !field.system ? (
                          <Input
                            name="description"
                            value={field.description || ''}
                            onChange={(e) => handleFieldChange(e, field.id)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span>{field.description || '-'}</span>
                        )}
                      </td>
                      {isEditMode && (
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {!field.system && (
                            <button
                              type="button"
                              onClick={() => deleteField(field.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-5 h-5" />
                              <span className="sr-only">Supprimer</span>
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {isEditMode && (
          <Card>
            <CardHeader>
              <CardTitle>Ajouter un nouveau champ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="name">Nom du champ</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newField.name}
                    onChange={handleNewFieldChange}
                    placeholder="nom_champ"
                  />
                  <p className="mt-1 text-xs text-gray-500">Identifiant unique du champ (sans espaces)</p>
                </div>
                <div>
                  <Label htmlFor="label">Libellé</Label>
                  <Input
                    id="label"
                    name="label"
                    value={newField.label}
                    onChange={handleNewFieldChange}
                    placeholder="Libellé affiché"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    name="type"
                    value={newField.type}
                    onChange={handleNewFieldChange}
                    className="block w-full px-3 py-2 border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="string">Texte</option>
                    <option value="number">Nombre</option>
                    <option value="boolean">Booléen</option>
                    <option value="date">Date</option>
                    <option value="email">Email</option>
                    <option value="password">Mot de passe</option>
                    <option value="reference">Référence</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="defaultValue">Valeur par défaut</Label>
                  <Input
                    id="defaultValue"
                    name="defaultValue"
                    value={newField.defaultValue?.toString() || ''}
                    onChange={handleNewFieldChange}
                    placeholder="Valeur par défaut"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={newField.description || ''}
                    onChange={handleNewFieldChange}
                    placeholder="Description du champ"
                  />
                </div>
                <div className="flex items-end space-x-4">
                  <div className="flex items-center h-10 space-x-2">
                    <input
                      type="checkbox"
                      id="required"
                      name="required"
                      checked={newField.required}
                      onChange={handleNewFieldChange}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <Label htmlFor="required" className="mb-0">Obligatoire</Label>
                  </div>
                  <div className="flex items-center h-10 space-x-2">
                    <input
                      type="checkbox"
                      id="hidden"
                      name="hidden"
                      checked={newField.hidden}
                      onChange={handleNewFieldChange}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <Label htmlFor="hidden" className="mb-0">Caché</Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button
                  variant="default"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={addField}
                >
                  Ajouter le champ
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserModelPage; 
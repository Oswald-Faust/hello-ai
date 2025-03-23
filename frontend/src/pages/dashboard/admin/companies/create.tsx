import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Building, Mail, Phone, Globe, ArrowLeft, Save, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/layout/AdminLayout';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { Textarea } from '@/components/ui/Textarea';

interface FormDataType {
  name: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  settings: {
    aiModel: string;
    language: string;
    voiceType: string;
  };
  [key: string]: any;
}

const CreateCompany: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'France'
    },
    settings: {
      aiModel: 'gpt-4',
      language: 'fr',
      voiceType: 'female'
    }
  });
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Vérifier si l'utilisateur est un administrateur
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent] as Record<string, any>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Effacer l'erreur du champ modifié
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Le nom de l\'entreprise est requis';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'L\'email n\'est pas valide';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setSubmitError('');
    
    try {
      // Dans une implémentation réelle, vous feriez un appel API comme:
      // const response = await api.post('/companies', formData);
      
      console.log('Soumission du formulaire:', formData);
      
      // Simuler un délai pour l'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push('/dashboard/admin/companies');
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'entreprise:', error);
      setSubmitError(error.response?.data?.message || 'Une erreur est survenue lors de la création de l\'entreprise');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 mr-4 text-gray-500 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ajouter une entreprise</h1>
            <p className="text-sm text-gray-600">Créer un nouveau compte entreprise</p>
          </div>
        </div>
        
        {submitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Nom de l'entreprise</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Acme Corp"
                    leftIcon={<Building className="w-5 h-5" />}
                    error={formErrors.name}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Description de l'entreprise..."
                    rows={3}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@acme.com"
                    leftIcon={<Mail className="w-5 h-5" />}
                    error={formErrors.email}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+33 1 23 45 67 89"
                    leftIcon={<Phone className="w-5 h-5" />}
                  />
                </div>
                
                <div>
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://www.acme.com"
                    leftIcon={<Globe className="w-5 h-5" />}
                  />
                </div>
                
                <div>
                  <Label htmlFor="address.street">Adresse</Label>
                  <Input
                    id="address.street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="123 rue de Paris"
                    leftIcon={<MapPin className="w-5 h-5" />}
                  />
                </div>
                
                <div>
                  <Label htmlFor="address.city">Ville</Label>
                  <Input
                    id="address.city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    placeholder="Paris"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address.postalCode">Code postal</Label>
                  <Input
                    id="address.postalCode"
                    name="address.postalCode"
                    value={formData.address.postalCode}
                    onChange={handleChange}
                    placeholder="75000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address.country">Pays</Label>
                  <Input
                    id="address.country"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    placeholder="France"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">Configuration de l'assistant vocal</h3>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="settings.aiModel">Modèle IA</Label>
                      <select
                        id="settings.aiModel"
                        name="settings.aiModel"
                        value={formData.settings.aiModel}
                        onChange={handleChange}
                        className="block w-full py-2 pl-3 pr-10 mt-1 border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="claude-3">Claude 3</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="settings.language">Langue</Label>
                      <select
                        id="settings.language"
                        name="settings.language"
                        value={formData.settings.language}
                        onChange={handleChange}
                        className="block w-full py-2 pl-3 pr-10 mt-1 border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="fr">Français</option>
                        <option value="en">Anglais</option>
                        <option value="es">Espagnol</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="settings.voiceType">Type de voix</Label>
                      <select
                        id="settings.voiceType"
                        name="settings.voiceType"
                        value={formData.settings.voiceType}
                        onChange={handleChange}
                        className="block w-full py-2 pl-3 pr-10 mt-1 border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="female">Féminine</option>
                        <option value="male">Masculine</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2 -ml-1" />
                      Créer l'entreprise
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CreateCompany; 
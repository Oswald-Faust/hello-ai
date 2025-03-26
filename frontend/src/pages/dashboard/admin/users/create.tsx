import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User, Mail, Lock, Building, Phone, ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface Company {
  _id: string;
  name: string;
}

const CreateUser: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    companyId: '',
    phoneNumber: ''
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Vérifier si l'utilisateur est un administrateur
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
    
    fetchCompanies();
  }, [user, router]);
  
  const fetchCompanies = async () => {
    try {
      // Dans une implémentation réelle, vous feriez un appel API comme:
      // const response = await api.get('/companies');
      
      // Données fictives pour simulation
      const mockCompanies: Company[] = [
        { _id: '1', name: 'Entreprise A' },
        { _id: '2', name: 'Entreprise B' },
        { _id: '3', name: 'Entreprise C' },
        { _id: '4', name: 'Entreprise D' }
      ];
      
      setCompanies(mockCompanies);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'Le prénom est requis';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Le nom est requis';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'L\'email n\'est pas valide';
    }
    
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    if (!formData.companyId) {
      errors.companyId = 'L\'entreprise est requise';
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
      // const response = await api.post('/users', {
      //   firstName: formData.firstName,
      //   lastName: formData.lastName,
      //   email: formData.email,
      //   password: formData.password,
      //   role: formData.role,
      //   company: formData.companyId,
      //   phoneNumber: formData.phoneNumber
      // });
      
      console.log('Soumission du formulaire:', {
        ...formData,
        password: '********',
        confirmPassword: '********'
      });
      
      // Simuler un délai pour l'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push('/dashboard/admin/users');
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      setSubmitError(error.response?.data?.message || 'Une erreur est survenue lors de la création de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 mr-4 text-gray-500 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ajouter un utilisateur</h1>
            <p className="text-sm text-gray-600">Créer un nouveau compte utilisateur</p>
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
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Jean"
                    leftIcon={<User className="w-5 h-5" />}
                    error={formErrors.firstName}
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Dupont"
                    leftIcon={<User className="w-5 h-5" />}
                    error={formErrors.lastName}
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
                    placeholder="jean.dupont@example.com"
                    leftIcon={<Mail className="w-5 h-5" />}
                    error={formErrors.email}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phoneNumber">Téléphone (optionnel)</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+33 6 12 34 56 78"
                    leftIcon={<Phone className="w-5 h-5" />}
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    leftIcon={<Lock className="w-5 h-5" />}
                    error={formErrors.password}
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    leftIcon={<Lock className="w-5 h-5" />}
                    error={formErrors.confirmPassword}
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Rôle</Label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="companyId">Entreprise</Label>
                  <select
                    id="companyId"
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${formErrors.companyId ? 'border-red-500' : ''}`}
                  >
                    <option value="">Sélectionner une entreprise</option>
                    {companies.map(company => (
                      <option key={company._id} value={company._id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.companyId && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.companyId}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/admin/users')}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  isLoading={loading}
                  className="flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CreateUser; 
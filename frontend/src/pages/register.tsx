import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, User, Building, AlertCircle } from 'lucide-react';

const Register: NextPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName) {
      newErrors.firstName = 'Le prénom est requis';
    }
    
    if (!formData.lastName) {
      newErrors.lastName = 'Le nom est requis';
    }
    
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    if (!formData.companyName) {
      newErrors.companyName = 'Le nom de l\'entreprise est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('[REGISTER] Début du processus d\'inscription');
    console.log('[REGISTER] Données du formulaire:', formData);
    
    if (!validateForm()) {
      console.log('[REGISTER] Validation du formulaire échouée');
      return;
    }
    
    console.log('[REGISTER] Validation du formulaire réussie');
    setIsSubmitting(true);
    
    try {
      const registerData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        companyName: formData.companyName.trim()
      };
      
      console.log('[REGISTER] Données préparées pour l\'envoi:', registerData);
      
      await register(registerData);
      console.log('[REGISTER] Inscription réussie, redirection vers dashboard utilisateur');
      router.push('/dashboard/user');
    } catch (err: any) {
      console.error('[REGISTER] Erreur d\'inscription:', err);
      console.error('[REGISTER] Détail de l\'erreur:', err.response?.data);
      setErrors({
        ...errors,
        general: err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription'
      });
    } finally {
      setIsSubmitting(false);
      console.log('[REGISTER] Fin du processus d\'inscription');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto lg:w-96">
          <div>
            <Link href="/" className="flex items-center">
              <Image src="/logo.svg" alt="Lydia" width={40} height={40} />
              <span className="ml-2 text-2xl font-bold text-gray-900">Lydia</span>
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Créer un compte</h2>
            <p className="mt-2 text-sm text-gray-600">
              Ou{' '}
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                connectez-vous à votre compte
              </Link>
            </p>
          </div>

          <div className="mt-8">
            {errors.general && (
              <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>{errors.general}</span>
                </div>
              </div>
            )}

            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      Prénom
                    </label>
                    <div className="mt-1">
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        error={errors.firstName}
                        leftIcon={<User className="w-5 h-5" />}
                        placeholder="Jean"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Nom
                    </label>
                    <div className="mt-1">
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        error={errors.lastName}
                        leftIcon={<User className="w-5 h-5" />}
                        placeholder="Dupont"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Adresse email
                  </label>
                  <div className="mt-1">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      leftIcon={<Mail className="w-5 h-5" />}
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Nom de l'entreprise
                  </label>
                  <div className="mt-1">
                    <Input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={handleChange}
                      error={errors.companyName}
                      leftIcon={<Building className="w-5 h-5" />}
                      placeholder="Votre Entreprise SAS"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mot de passe
                  </label>
                  <div className="mt-1">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      leftIcon={<Lock className="w-5 h-5" />}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirmer le mot de passe
                  </label>
                  <div className="mt-1">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                      leftIcon={<Lock className="w-5 h-5" />}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={isSubmitting}
                  >
                    S'inscrire
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="relative flex-1 hidden w-0 lg:block">
        <div className="absolute inset-0 object-cover w-full h-full bg-gradient-to-r from-primary-600 to-secondary-600">
          <div className="flex flex-col items-center justify-center h-full text-white">
            <h2 className="text-4xl font-bold">Rejoignez Lydia</h2>
            <p className="mt-4 text-xl">
              Transformez votre communication client avec notre assistant vocal intelligent
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 
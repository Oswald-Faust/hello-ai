import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const Login: NextPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const { login, user } = useAuth();

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (user) {
      console.log('[LOGIN] Utilisateur déjà connecté, rôle:', user.role);
      if (user.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }
    
    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      console.log('[LOGIN] Tentative de connexion avec:', email);
      // Utiliser le hook d'authentification simplifié
      const userRole = await login(email, password);
      console.log('[LOGIN] Connexion réussie, rôle détecté:', userRole);
      
      // Redirection en fonction du rôle
      if (userRole === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('[LOGIN] Erreur de connexion:', err);
      setErrors({
        ...errors,
        general: err.message || 'Email ou mot de passe incorrect'
      });
    } finally {
      setIsSubmitting(false);
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
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Connexion</h2>
            <p className="mt-2 text-sm text-gray-600">
              Connectez-vous pour accéder à votre espace
            </p>
            {/* Information de débogage */}
            <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded-md text-sm">
              <strong>Identifiants disponibles :</strong><br />
              Admin: admin@lydia.com / Admin123!<br />
              Utilisateur: user@lydia.com / User123!
            </div>
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={errors.email}
                      leftIcon={<Mail className="w-5 h-5" />}
                      placeholder="votre@email.com"
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
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      error={errors.password}
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
                    Se connecter
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
            <h2 className="text-4xl font-bold">Bienvenue sur Lydia</h2>
            <p className="mt-4 text-xl">
              L'assistant vocal intelligent pour votre entreprise
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert, AlertDescription } from '@/components/ui/Alert';

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, error } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (error) {
      setRegisterError(error);
      setIsLoading(false);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRegisterError('');
    
    try {
      await register(firstName, lastName, email, password, companyId);
      // Redirection est gérée par le premier useEffect
    } catch (err) {
      // L'erreur est gérée par le deuxième useEffect
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Créer un compte</h1>
          <p className="text-gray-600 mt-2">Rejoignez Lydia pour optimiser vos communications</p>
        </div>
        
        <Card className="p-8 bg-white shadow-xl rounded-xl border-0">
          {registerError && (
            <Alert className="mb-6 bg-red-50 text-red-800 border border-red-200">
              <AlertDescription>{registerError}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700 font-medium">Prénom</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Jean"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full h-11 px-4 transition-colors border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700 font-medium">Nom</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Dupont"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full h-11 px-4 transition-colors border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 px-4 transition-colors border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 px-4 transition-colors border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 8 caractères avec une lettre majuscule, une minuscule et un chiffre
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companyId" className="text-gray-700 font-medium">ID de l'entreprise (facultatif)</Label>
              <Input
                id="companyId"
                type="text"
                placeholder="ID de votre entreprise"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full h-11 px-4 transition-colors border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
              />
              <p className="text-xs text-gray-500 mt-1">
                Laissez vide si vous créez un compte personnel ou si vous ne connaissez pas l'ID de votre entreprise
              </p>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <input 
                type="checkbox" 
                id="terms" 
                required
                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                J'accepte les <Link href="/terms" className="text-primary hover:underline">conditions d'utilisation</Link> et la <Link href="/privacy" className="text-primary hover:underline">politique de confidentialité</Link>
              </label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11 bg-primary hover:bg-primary-dark transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Création en cours...' : 'Créer un compte'}
            </Button>
          </form>
          
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">ou</span>
              </div>
            </div>
            
            <div className="mt-6 grid gap-3">
              <Button
                variant="outline"
                className="h-11 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center justify-center"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                  </g>
                </svg>
                Continuer avec Google
              </Button>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte?{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
} 
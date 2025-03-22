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

// Définition des étapes d'inscription
type RegisterStep = 
  | 'userType' // Choix du type d'utilisateur
  | 'companyDetails' // Détails de l'entreprise (si applicable)
  | 'personalInfo' // Informations personnelles
  | 'credentials' // Identifiants de connexion
  | 'confirmation'; // Résumé et confirmation

// Types d'utilisateurs
type UserType = 'freelance' | 'company' | 'employee';

export default function RegisterFlowPage() {
  const router = useRouter();
  const { register, user, error } = useAuth();
  
  // État global
  const [currentStep, setCurrentStep] = useState<RegisterStep>('userType');
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  
  // Informations d'entreprise
  const [userType, setUserType] = useState<UserType | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [industry, setIndustry] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  
  // Informations personnelles
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyId, setCompanyId] = useState('');
  
  // Identifiants
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

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
      if (userType === 'company') {
        // En réalité, il faudrait d'abord créer l'entreprise, puis utiliser son ID
        // pour l'inscription de l'utilisateur. Pour l'instant, on simplifie
        await register({
          firstName,
          lastName,
          email,
          password,
          companyId: 'company_id_placeholder'
        });
      } else if (userType === 'employee' && companyId) {
        // Pour les employés, on utilise l'ID de l'entreprise fourni
        await register({
          firstName,
          lastName,
          email,
          password,
          companyId
        });
      } else {
        // Pour les freelances, pas d'entreprise associée
        await register({
          firstName,
          lastName,
          email,
          password
        });
      }
      // Redirection est gérée par le premier useEffect
    } catch (err) {
      // L'erreur est gérée par le deuxième useEffect
    }
  };

  // Vérification de la validité du mot de passe
  const isPasswordValid = password.length >= 8 && 
    /[A-Z]/.test(password) && 
    /[a-z]/.test(password) && 
    /[0-9]/.test(password);

  // Navigation vers l'étape suivante
  const goToNextStep = () => {
    switch (currentStep) {
      case 'userType':
        setCurrentStep(userType === 'company' ? 'companyDetails' : 'personalInfo');
        break;
      case 'companyDetails':
        setCurrentStep('personalInfo');
        break;
      case 'personalInfo':
        setCurrentStep('credentials');
        break;
      case 'credentials':
        setCurrentStep('confirmation');
        break;
    }
  };

  // Navigation vers l'étape précédente
  const goToPreviousStep = () => {
    switch (currentStep) {
      case 'companyDetails':
        setCurrentStep('userType');
        break;
      case 'personalInfo':
        setCurrentStep(userType === 'company' ? 'companyDetails' : 'userType');
        break;
      case 'credentials':
        setCurrentStep('personalInfo');
        break;
      case 'confirmation':
        setCurrentStep('credentials');
        break;
    }
  };

  // Vérifier si le formulaire est valide selon l'étape actuelle
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 'userType':
        return userType !== null;
      case 'companyDetails':
        if (userType !== 'company') return true;
        return companyName !== '' && industry !== '';
      case 'personalInfo':
        const isBasicInfoValid = firstName !== '' && lastName !== '';
        // Si employé, l'ID de l'entreprise est obligatoire
        if (userType === 'employee') {
          return isBasicInfoValid && companyId !== '';
        }
        return isBasicInfoValid;
      case 'credentials':
        return email !== '' && 
               isPasswordValid && 
               password === confirmPassword && 
               termsAccepted;
      case 'confirmation':
        return true;
      default:
        return false;
    }
  };

  // Calculer le pourcentage de progression
  const getProgressPercentage = () => {
    const steps: RegisterStep[] = ['userType', 'companyDetails', 'personalInfo', 'credentials', 'confirmation'];
    // Si pas une entreprise, on saute l'étape companyDetails
    const totalSteps = userType !== 'company' ? steps.length - 1 : steps.length;
    const currentIndex = steps.indexOf(currentStep);
    // Si pas une entreprise et qu'on est après l'étape userType, on ajuste l'index
    const adjustedIndex = userType !== 'company' && currentIndex > 1 ? currentIndex - 1 : currentIndex;
    return Math.round((adjustedIndex / (totalSteps - 1)) * 100);
  };

  // Rendre l'étape de choix du type d'utilisateur
  const renderUserTypeStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-center text-gray-800">Vous êtes :</h2>
      
      <div className="grid grid-cols-1 gap-4">
        <button
          type="button"
          onClick={() => setUserType('freelance')}
          className={userType === 'freelance' 
            ? 'p-4 border rounded-lg flex items-center transition-colors border-primary bg-primary bg-opacity-10 text-black' 
            : 'p-4 border rounded-lg flex items-center transition-colors border-gray-200 hover:border-primary hover:bg-primary hover:bg-opacity-5 text-black'
          }
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-black">Freelance / Indépendant</h3>
            <p className="text-sm text-gray-500">Vous travaillez seul et gérez vos propres clients</p>
          </div>
        </button>
        
        <button
          type="button"
          onClick={() => setUserType('company')}
          className={userType === 'company' 
            ? 'p-4 border rounded-lg flex items-center transition-colors border-primary bg-primary bg-opacity-10 text-black' 
            : 'p-4 border rounded-lg flex items-center transition-colors border-gray-200 hover:border-primary hover:bg-primary hover:bg-opacity-5 text-black'
          }
        >
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-black">Entreprise</h3>
            <p className="text-sm text-gray-500">Vous représentez une société avec des employés</p>
          </div>
        </button>
        
        <button
          type="button"
          onClick={() => setUserType('employee')}
          className={userType === 'employee' 
            ? 'p-4 border rounded-lg flex items-center transition-colors border-primary bg-primary bg-opacity-10 text-black' 
            : 'p-4 border rounded-lg flex items-center transition-colors border-gray-200 hover:border-primary hover:bg-primary hover:bg-opacity-5 text-black'
          }
        >
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-black">Employé</h3>
            <p className="text-sm text-gray-500">Vous rejoignez une entreprise existante</p>
          </div>
        </button>
      </div>
    </div>
  );

  // Rendre l'étape des détails de l'entreprise
  const renderCompanyDetailsStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-center text-gray-800">Informations de votre entreprise</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-gray-700 font-medium">Nom de l'entreprise</Label>
          <Input
            id="companyName"
            type="text"
            placeholder="Votre entreprise"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            className="w-full h-11 px-4 transition-colors border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="industry" className="text-gray-700 font-medium">Secteur d'activité</Label>
          <select
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            required
            className="w-full h-11 px-4 transition-colors border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
          >
            <option value="">Sélectionnez un secteur</option>
            <option value="tech">Technologie</option>
            <option value="finance">Finance</option>
            <option value="healthcare">Santé</option>
            <option value="retail">Commerce de détail</option>
            <option value="education">Éducation</option>
            <option value="other">Autre</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="companySize" className="text-gray-700 font-medium">Taille de l'entreprise</Label>
          <select
            id="companySize"
            value={companySize}
            onChange={(e) => setCompanySize(e.target.value)}
            className="w-full h-11 px-4 transition-colors border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
          >
            <option value="">Sélectionnez une taille</option>
            <option value="1-10">1-10 employés</option>
            <option value="11-50">11-50 employés</option>
            <option value="51-200">51-200 employés</option>
            <option value="201-500">201-500 employés</option>
            <option value="501+">501+ employés</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="companyEmail" className="text-gray-700 font-medium">Email de l'entreprise</Label>
          <Input
            id="companyEmail"
            type="email"
            placeholder="contact@votre-entreprise.com"
            value={companyEmail}
            onChange={(e) => setCompanyEmail(e.target.value)}
            className="w-full h-11 px-4 transition-colors border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="companyPhone" className="text-gray-700 font-medium">Téléphone de l'entreprise</Label>
          <Input
            id="companyPhone"
            type="tel"
            placeholder="+33 1 23 45 67 89"
            value={companyPhone}
            onChange={(e) => setCompanyPhone(e.target.value)}
            className="w-full h-11 px-4 transition-colors border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
          />
        </div>
      </div>
    </div>
  );

  // Rendre l'étape des informations personnelles
  const renderPersonalInfoStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-center text-gray-800">Vos informations personnelles</h2>
      
      <div className="space-y-4">
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

        {userType === 'employee' && (
          <div className="space-y-2">
            <Label htmlFor="companyId" className="text-gray-700 font-medium">ID de l'entreprise</Label>
            <Input
              id="companyId"
              type="text"
              placeholder="Entrez l'ID de votre entreprise"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              required
              className="w-full h-11 px-4 transition-colors border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
            />
            <p className="text-xs text-gray-500 mt-1">
              Votre administrateur ou responsable RH doit vous fournir cet ID.
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="jobTitle" className="text-gray-700 font-medium">Poste / Fonction</Label>
          <Input
            id="jobTitle"
            type="text"
            placeholder="Directeur, Chef de projet, etc."
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full h-11 px-4 transition-colors border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
          />
        </div>
      </div>
    </div>
  );

  // Rendre l'étape des identifiants
  const renderCredentialsStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-center text-gray-800">Créez vos identifiants</h2>
      
      <div className="space-y-4">
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
            className={`w-full h-11 px-4 transition-colors border rounded-lg focus:ring-2 focus:ring-opacity-20 ${
              password ? (isPasswordValid ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : 'border-red-300 focus:border-red-500 focus:ring-red-500') : 'border-gray-300 focus:border-primary focus:ring-primary'
            }`}
          />
          <div className="mt-2 flex flex-col space-y-1">
            <p className="text-xs text-gray-500">Votre mot de passe doit contenir :</p>
            <p className={`text-xs ${password.length >= 8 ? 'text-green-500' : 'text-gray-400'}`}>
              ✓ Au moins 8 caractères
            </p>
            <p className={`text-xs ${/[A-Z]/.test(password) ? 'text-green-500' : 'text-gray-400'}`}>
              ✓ Une lettre majuscule
            </p>
            <p className={`text-xs ${/[a-z]/.test(password) ? 'text-green-500' : 'text-gray-400'}`}>
              ✓ Une lettre minuscule
            </p>
            <p className={`text-xs ${/[0-9]/.test(password) ? 'text-green-500' : 'text-gray-400'}`}>
              ✓ Un chiffre
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirmez votre mot de passe</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={`w-full h-11 px-4 transition-colors border rounded-lg focus:ring-2 focus:ring-opacity-20 ${
              confirmPassword ? (confirmPassword === password ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : 'border-red-300 focus:border-red-500 focus:ring-red-500') : 'border-gray-300 focus:border-primary focus:ring-primary'
            }`}
          />
          {confirmPassword && confirmPassword !== password && (
            <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2 pt-2">
          <input 
            type="checkbox" 
            id="terms" 
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            required
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label htmlFor="terms" className="text-sm text-black">
            J'accepte les <Link href="/terms" className="text-primary hover:underline">conditions d'utilisation</Link> et la <Link href="/privacy" className="text-primary hover:underline">politique de confidentialité</Link>
          </label>
        </div>
      </div>
    </div>
  );

  // Rendre l'étape de confirmation
  const renderConfirmationStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-center text-gray-800">Confirmez vos informations</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <div>
          <h3 className="font-semibold text-gray-700">Type de compte</h3>
          <p className="text-black">
            {userType === 'freelance' ? 'Freelance / Indépendant' : 
             userType === 'company' ? 'Entreprise' : 
             'Employé'}
          </p>
        </div>
        
        {userType === 'company' && (
          <div>
            <h3 className="font-semibold text-gray-700">Informations de l'entreprise</h3>
            <p className="text-black">{companyName}</p>
            <p className="text-black">Secteur : {industry}</p>
            {companySize && <p className="text-black">Taille : {companySize}</p>}
            {companyEmail && <p className="text-black">Email : {companyEmail}</p>}
            {companyPhone && <p className="text-black">Téléphone : {companyPhone}</p>}
          </div>
        )}

        {userType === 'employee' && (
          <div>
            <h3 className="font-semibold text-gray-700">Entreprise</h3>
            <p className="text-black">ID de l'entreprise : {companyId}</p>
          </div>
        )}
        
        <div>
          <h3 className="font-semibold text-gray-700">Informations personnelles</h3>
          <p className="text-black">{firstName} {lastName}</p>
          {jobTitle && <p className="text-black">Poste : {jobTitle}</p>}
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-700">Contact</h3>
          <p className="text-black">{email}</p>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-black">
          En cliquant sur "Créer mon compte", vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
        </p>
      </div>
    </div>
  );

  // Rendre l'étape courante
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'userType':
        return renderUserTypeStep();
      case 'companyDetails':
        return renderCompanyDetailsStep();
      case 'personalInfo':
        return renderPersonalInfoStep();
      case 'credentials':
        return renderCredentialsStep();
      case 'confirmation':
        return renderConfirmationStep();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Créer un compte</h1>
          <p className="text-black mt-2">Rejoignez Lydia pour optimiser vos communications</p>
        </div>
        
        <Card className="p-8 bg-white shadow-xl rounded-xl border-0">
          {/* Barre de progression */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Début</span>
              <span>Fin</span>
            </div>
          </div>
          
          {registerError && (
            <Alert className="mb-6 bg-red-50 text-red-800 border border-red-200">
              <AlertDescription>{registerError}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderCurrentStep()}
            
            <div className="flex justify-between pt-4">
              {currentStep !== 'userType' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                  className="px-4 text-black"
                >
                  Précédent
                </Button>
              )}
              
              {currentStep !== 'confirmation' ? (
                <Button
                  type="button"
                  onClick={goToNextStep}
                  disabled={!isCurrentStepValid()}
                  className={`px-4 ml-auto text-black ${!isCurrentStepValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 ml-auto text-black"
                >
                  {isLoading ? 'Création en cours...' : 'Créer mon compte'}
                </Button>
              )}
            </div>
          </form>
          
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
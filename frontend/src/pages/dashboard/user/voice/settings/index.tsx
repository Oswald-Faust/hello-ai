import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '@/types/next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import UserLayout from '@/components/layouts/UserLayout';
import { useCompany } from '@/hooks/useCompany';
import { useToast } from '@/hooks/useToast'; // Assurez-vous d'avoir ce hook ou utilisez un système de notification
import { Company } from '@/services/companyService';
import voiceService, { Voice } from '@/services/voiceService';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, ControllerRenderProps } from 'react-hook-form';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

// Type pour le voiceAssistant, complétant celui du service
interface VoiceAssistantUpdate {
  voice?: {
    gender: 'male' | 'female';
    language: string;
    speed: number;
    provider: 'gtts' | 'twilio';
    format: 'mp3';
  };
  greetings?: {
    main: string;
    outOfHours?: string;
    waiting?: string;
  };
  scenarios?: {
    information?: string;
    transfer?: string;
    ending?: string;
  };
  companyInfo?: {
    products?: string[];
    services?: string[];
    faq?: Array<{ question: string; answer: string }>;
    team?: Array<{ name: string; role: string; expertise: string[] }>;
  };
  prompts?: any;
}

// Type étendu pour l'objet company.voiceAssistant 
interface ExtendedVoiceAssistant {
  voice?: {
    gender: 'male' | 'female';
    language: string;
    speed: number;
    provider: 'gtts' | 'twilio';
    format: 'mp3';
  };
  greetings?: {
    main: string;
    outOfHours?: string;
    waiting?: string;
  };
  scenarios?: {
    information?: string;
    transfer?: string;
    ending?: string;
  };
  companyInfo?: {
    products?: string[];
    services?: string[];
    faq?: Array<{ question: string; answer: string }>;
    team?: Array<{ name: string; role: string; expertise: string[] }>;
  };
  prompts?: any;
}

// Étendre le type Company pour inclure le type étendu de voiceAssistant
type ExtendedCompany = Omit<Company, 'voiceAssistant'> & {
  voiceAssistant?: ExtendedVoiceAssistant;
};

// Schéma de validation pour le formulaire
const voiceSettingsSchema = z.object({
  voice: z.object({
    gender: z.enum(['male', 'female']),
    language: z.string().min(1, { message: 'Veuillez sélectionner une langue' }),
    speed: z.number().min(0.5).max(2),
    provider: z.enum(['gtts', 'twilio']),
    format: z.literal('mp3'),
    voiceId: z.string().optional(),
  }),
  greetings: z.object({
    main: z.string().min(1, { message: 'Veuillez fournir un message d\'accueil' }),
    outOfHours: z.string().optional(),
    waiting: z.string().optional(),
  }),
  scenarios: z.object({
    information: z.string().optional(),
    transfer: z.string().optional(),
    ending: z.string().optional(),
  }),
  companyInfo: z.object({
    products: z.array(z.string()).default([]),
    services: z.array(z.string()).default([]),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string()
    })).default([]),
    team: z.array(z.object({
      name: z.string(),
      role: z.string(),
      expertise: z.array(z.string())
    })).default([]),
  }),
});

export type VoiceSettingsFormValues = z.infer<typeof voiceSettingsSchema>;

const VoiceSettingsPage: NextPageWithLayout = () => {
  // Utiliser un type plus spécifique pour updateVoiceAssistant qui accepte notre type VoiceAssistantUpdate
  const { company: originalCompany, loading, error, updateVoiceAssistant: updateVoiceAssistantOriginal } = useCompany();
  // Convertir le type vers notre type étendu
  const company = originalCompany as ExtendedCompany;
  // Créer une nouvelle fonction correctement typée
  const updateVoiceAssistant = (data: VoiceAssistantUpdate) => 
    updateVoiceAssistantOriginal(data as any);
    
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const { step } = router.query;
  const [activeTab, setActiveTab] = useState('voice');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState<boolean>(false);
  const [testAudioUrl, setTestAudioUrl] = useState<string | null>(null);
  const [isTestingVoice, setIsTestingVoice] = useState<boolean>(false);
  const [testText, setTestText] = useState<string>("Bonjour, je suis Lydia, l'assistant vocal intelligent de votre entreprise. Comment puis-je vous aider aujourd'hui?");
  
  // Mettre à jour l'onglet actif en fonction du paramètre d'URL
  useEffect(() => {
    if (step) {
      switch(String(step)) {
        case 'voice':
          setActiveTab('voice');
          break;
        case 'greeting':
          setActiveTab('greeting');
          break;
        case 'scenarios':
          setActiveTab('scenarios');
          break;
        case 'activation':
          setActiveTab('activation');
          break;
        default:
          setActiveTab('voice');
      }
    }
  }, [step]);

  // Valeurs par défaut basées sur l'entreprise
  const defaultValues: VoiceSettingsFormValues = {
    voice: {
      gender: company?.voiceAssistant?.voice?.gender || 'female',
      language: company?.voiceAssistant?.voice?.language || 'fr',
      speed: company?.voiceAssistant?.voice?.speed || 1.0,
      provider: company?.voiceAssistant?.voice?.provider || 'gtts',
      format: 'mp3',
    },
    greetings: {
      main: company?.voiceAssistant?.greetings?.main || '',
      outOfHours: company?.voiceAssistant?.greetings?.outOfHours || '',
      waiting: company?.voiceAssistant?.greetings?.waiting || '',
    },
    scenarios: {
      information: company?.voiceAssistant?.scenarios?.information || '',
      transfer: company?.voiceAssistant?.scenarios?.transfer || '',
      ending: company?.voiceAssistant?.scenarios?.ending || '',
    },
    companyInfo: {
      products: company?.voiceAssistant?.companyInfo?.products || [],
      services: company?.voiceAssistant?.companyInfo?.services || [],
      faq: company?.voiceAssistant?.companyInfo?.faq || [],
      team: company?.voiceAssistant?.companyInfo?.team || [],
    },
  };

  // Initialiser le formulaire
  const form = useForm<VoiceSettingsFormValues>({
    resolver: zodResolver(voiceSettingsSchema),
    defaultValues,
  });

  // Mettre à jour les valeurs par défaut lorsque les données de l'entreprise sont chargées
  useEffect(() => {
    if (company?.voiceAssistant) {
      form.reset({
        voice: {
          gender: company.voiceAssistant.voice?.gender || 'female',
          language: company.voiceAssistant.voice?.language || 'fr',
          speed: company.voiceAssistant.voice?.speed || 1.0,
          provider: company.voiceAssistant.voice?.provider || 'gtts',
          format: 'mp3',
        },
        greetings: {
          main: company.voiceAssistant.greetings?.main || '',
          outOfHours: company.voiceAssistant.greetings?.outOfHours || '',
          waiting: company.voiceAssistant.greetings?.waiting || '',
        },
        scenarios: {
          information: company.voiceAssistant.scenarios?.information || '',
          transfer: company.voiceAssistant.scenarios?.transfer || '',
          ending: company.voiceAssistant.scenarios?.ending || '',
        },
        companyInfo: {
          products: company.voiceAssistant.companyInfo?.products || [],
          services: company.voiceAssistant.companyInfo?.services || [],
          faq: company.voiceAssistant.companyInfo?.faq || [],
          team: company.voiceAssistant.companyInfo?.team || [],
        },
      });
    }
  }, [company, form]);

  // Détecter les changements dans le formulaire et gérer les actions spécifiques
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      setHasChanges(true);
      
      // Gérer le changement de fournisseur
      if (name === 'voice.provider' && value.voice?.provider) {
        // Si l'utilisateur change le fournisseur pour gTTS
        if (value.voice.provider === 'gtts') {
          form.setValue('voice.voiceId', 'fr');
        }
        // Préférence pour Twilio comme indiqué
        else if (value.voice.provider === 'twilio') {
          const gender = form.getValues().voice.gender;
          form.setValue('voice.voiceId', gender === 'female' ? 'Polly.Celine' : 'Polly.Mathieu');
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // Charger les voix disponibles en fonction du fournisseur sélectionné
  useEffect(() => {
    let isMounted = true;
    let controller = new AbortController();
    let isLoading = false;
    
    const providerValue = form.getValues().voice.provider;
    if (providerValue) {
      void (async () => {
        if (isLoading) return;
        
        try {
          isLoading = true;
          controller.abort();
          controller = new AbortController();
          
          if (isMounted) setLoadingVoices(true);
          
          if (providerValue === 'gtts') {
            const recommendedVoices = voiceService.getRecommendedVoices();
            if (isMounted) {
              setVoices(recommendedVoices);
              setLoadingVoices(false);
            }
            return;
          }
          
          try {
            const response = await Promise.race([
              voiceService.getAvailableVoices(),
              new Promise<Voice[]>((_, reject) => 
                setTimeout(() => reject(new Error('Délai dépassé')), 5000)
              )
            ]);
            
            if (isMounted) {
              setVoices(response || []);
              setLoadingVoices(false);
            }
          } catch (error) {
            if (isMounted) {
              const fallbackVoices = voiceService.getRecommendedVoices();
              setVoices(fallbackVoices);
              setLoadingVoices(false);
              
              toast({
                title: 'Note',
                description: 'Nous utilisons une sélection de voix recommandées suite à un problème de connexion.',
                variant: 'default',
              });
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement des voix:', error);
        } finally {
          isLoading = false;
        }
      })();
    }
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [form, toast]);
  
  // Observer les changements de provider séparément pour recharger les voix
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'voice.provider' && value.voice?.provider) {
        // Préférence pour Twilio comme indiqué
        if (value.voice.provider === 'twilio') {
          const gender = form.getValues().voice.gender;
          form.setValue('voice.voiceId', gender === 'female' ? 'Polly.Celine' : 'Polly.Mathieu');
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // Fonction pour obtenir les options de voix en fonction du fournisseur
  const getVoiceOptions = () => {
    const provider = form.getValues().voice.provider;
    
    // Cas spécial pour gTTS qui n'a qu'une seule voix par langue
    if (provider === 'gtts') {
      const gender = form.getValues().voice.gender;
      return [{
        value: 'fr',
        label: gender === 'female' ? 'Voix française (féminine)' : 'Voix française (masculine)'
      }];
    }
    
    // Pour les autres fournisseurs, filtrer par genre comme avant
    const gender = form.getValues().voice.gender;
    return voices
      .filter(voice => voice.provider === provider && voice.gender === gender)
      .map(voice => ({
        value: voice.id,
        label: voice.name
      }));
  };

  // Simuler un test audio
  const handleTestVoice = async () => {
    const values = form.getValues();
    setIsTestingVoice(true);
    setTestAudioUrl(null);
    
    try {
      // Utiliser la configuration actuelle pour tester la voix
      console.log("Test de voix avec configuration:", values.voice);
      
      const response = await voiceService.testVoice(
        testText,
        values.voice
      );
      
      console.log("Réponse du test de voix:", response);
      
      if (response && response.success && response.audioUrl) {
        // Utiliser le service voix pour construire l'URL
        const audioUrl = voiceService.getAudioUrl(response.audioUrl);
        console.log("URL audio finale:", audioUrl);
        setTestAudioUrl(audioUrl);
        
        toast({
          title: 'Test de voix',
          description: 'Lecture du test audio en cours...',
          variant: 'success',
        });
      } else {
        toast({
          title: 'Erreur',
          description: (response && response.message) || 'Le test audio a échoué. Veuillez réessayer.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erreur lors du test de la voix:', error);
      toast({
        title: 'Erreur',
        description: 'Le test audio a échoué. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsTestingVoice(false);
    }
  };

  // Soumettre le formulaire
  const onSubmit = async (values: VoiceSettingsFormValues) => {
    // Valider l'étape actuelle avant de sauvegarder
    if (!validateCurrentStep()) {
      return;
    }
    
    setIsSaving(true);
    try {
      if (!company) return;

      // Créer un objet compatible avec le type attendu par l'API
      const voiceAssistantData: VoiceAssistantUpdate = {
        voice: values.voice,
        companyInfo: values.companyInfo,
        prompts: {
          ...company?.voiceAssistant?.prompts,
        }
      };

      // Ajouter progressivement les données selon les étapes complétées
      if (activeTab === 'voice' || values.greetings.main) {
        voiceAssistantData.prompts = {
          ...voiceAssistantData.prompts,
          welcomePrompt: values.greetings.main,
        };
      }
      
      if (activeTab === 'greeting' || values.greetings.outOfHours) {
        voiceAssistantData.prompts = {
          ...voiceAssistantData.prompts,
          outOfHoursPrompt: values.greetings.outOfHours,
        };
      }
      
      if (activeTab === 'greeting' || values.greetings.waiting) {
        voiceAssistantData.prompts = {
          ...voiceAssistantData.prompts,
          waitingPrompt: values.greetings.waiting,
        };
      }
      
      if (activeTab === 'scenarios' || values.scenarios.information) {
        voiceAssistantData.prompts = {
          ...voiceAssistantData.prompts,
          informationPrompt: values.scenarios.information,
        };
      }
      
      if (activeTab === 'scenarios' || values.scenarios.transfer) {
        voiceAssistantData.prompts = {
          ...voiceAssistantData.prompts,
          transferPrompt: values.scenarios.transfer,
        };
      }
      
      if (activeTab === 'scenarios' || values.scenarios.ending) {
        voiceAssistantData.prompts = {
          ...voiceAssistantData.prompts,
          endingPrompt: values.scenarios.ending,
        };
      }

      // Utiliser le service companyService pour mettre à jour l'assistant vocal
      await updateVoiceAssistant(voiceAssistantData);
      
      // Mettre à jour également la configuration de la voix via le service de voix
      if (activeTab === 'voice' || activeTab === 'activation') {
        await voiceService.configureCompanyVoice(company._id, values.voice);
      }
      
      setHasChanges(false);
      toast({
        title: 'Paramètres enregistrés',
        description: 'Les paramètres ont été mis à jour avec succès.',
        variant: 'success',
      });

      // Passer à l'étape suivante si ce n'est pas la dernière étape
      if (activeTab !== 'activation') {
        goToNextStep();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour les paramètres. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Options pour les accents
  const accentOptions = [
    { value: 'french', label: 'Français' },
    { value: 'belgian', label: 'Belge' },
    { value: 'canadian', label: 'Canadien' },
    { value: 'swiss', label: 'Suisse' },
    { value: 'african', label: 'Africain' },
  ];

  // Options pour les voix Fish Audio
  const fishAudioVoices = [
    { value: 'fr_female_1', label: 'Française - Sophie' },
    { value: 'fr_female_2', label: 'Française - Claire' },
    { value: 'fr_male_1', label: 'Français - Pierre' },
    { value: 'fr_male_2', label: 'Français - Jean' },
  ];

  // Options pour les voix Fonoster
  const fonosterVoices = [
    { value: 'fr-FR-Standard-A', label: 'Français - Julie' },
    { value: 'fr-FR-Standard-B', label: 'Français - Thomas' },
    { value: 'fr-FR-Standard-C', label: 'Français - Emma' },
    { value: 'fr-FR-Standard-D', label: 'Français - Antoine' },
  ];

  // Options pour les voix Twilio
  const twilioVoices = [
    { value: 'Polly.Celine', label: 'Céline (Féminin)' },
    { value: 'Polly.Mathieu', label: 'Mathieu (Masculin)' },
  ];

  // Validation pour chaque étape
  const validateCurrentStep = (): boolean => {
    let isValid = false;
    const values = form.getValues();
    
    switch (activeTab) {
      case 'voice':
        // Vérifier que les paramètres de voix sont complets
        isValid = !!(values.voice.gender && 
                    values.voice.language && 
                    values.voice.speed && 
                    values.voice.provider && 
                    values.voice.voiceId);
        if (!isValid) {
          toast({
            title: 'Validation',
            description: 'Veuillez remplir tous les champs obligatoires de la voix.',
            variant: 'destructive',
          });
        }
        break;
      
      case 'greeting':
        // Vérifier que le message d'accueil principal est défini
        isValid = !!values.greetings.main;
        if (!isValid) {
          toast({
            title: 'Validation',
            description: 'Veuillez fournir au moins un message d\'accueil principal.',
            variant: 'destructive',
          });
        }
        break;
      
      case 'scenarios':
        // Les scénarios sont optionnels, mais au moins le transfert devrait être défini
        isValid = !!values.scenarios.transfer;
        if (!isValid) {
          toast({
            title: 'Validation',
            description: 'Veuillez définir au moins le message de transfert.',
            variant: 'destructive',
          });
        }
        break;
      
      case 'company':
        // Les informations d'entreprise sont toutes optionnelles
        isValid = true;
        break;
      
      case 'prompts':
        // Les prompts sont optionnels
        isValid = true;
        break;
      
      case 'activation':
        // Pas de validation spécifique pour l'activation
        isValid = true;
        break;
      
      default:
        isValid = true;
    }
    
    return isValid;
  };

  // Fonction modifiée pour passer à l'étape suivante après validation
  const goToNextStep = () => {
    if (!validateCurrentStep()) {
      return;
    }
    
    switch(activeTab) {
      case 'voice':
        setActiveTab('greeting');
        router.push({ query: { ...router.query, step: 'greeting' } });
        break;
      case 'greeting':
        setActiveTab('scenarios');
        router.push({ query: { ...router.query, step: 'scenarios' } });
        break;
      case 'scenarios':
        setActiveTab('company');
        router.push({ query: { ...router.query, step: 'company' } });
        break;
      case 'company':
        setActiveTab('prompts');
        router.push({ query: { ...router.query, step: 'prompts' } });
        break;
      case 'prompts':
        setActiveTab('activation');
        router.push({ query: { ...router.query, step: 'activation' } });
        break;
    }
  };

  // Fonction pour passer à l'étape précédente
  const goToPreviousStep = () => {
    switch(activeTab) {
      case 'greeting':
        setActiveTab('voice');
        router.push({ query: { ...router.query, step: 'voice' } });
        break;
      case 'scenarios':
        setActiveTab('greeting');
        router.push({ query: { ...router.query, step: 'greeting' } });
        break;
      case 'company':
        setActiveTab('scenarios');
        router.push({ query: { ...router.query, step: 'scenarios' } });
        break;
      case 'prompts':
        setActiveTab('company');
        router.push({ query: { ...router.query, step: 'company' } });
        break;
      case 'activation':
        setActiveTab('prompts');
        router.push({ query: { ...router.query, step: 'prompts' } });
        break;
    }
  };

  // Fonction pour rendre les boutons de navigation d'étape
  const renderStepNavigation = () => {
    return (
      <div className="flex justify-between mt-6">
        <Button 
          type="button" 
          variant="outline"
          onClick={goToPreviousStep}
          disabled={activeTab === 'voice' || isSaving}
        >
          Précédent
        </Button>
        
        <div className="flex space-x-2">
          {activeTab === 'voice' && (
            <Button 
              type="button" 
              variant="outline"
              onClick={handleTestVoice}
              disabled={isSaving || isTestingVoice}
            >
              {isTestingVoice ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Test en cours...
                </>
              ) : 'Tester la voix'}
            </Button>
          )}
          
          {activeTab === 'voice' && testAudioUrl && (
            <Button 
              type="button" 
              variant="default"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={async () => {
                try {
                  // Sauvegarder les paramètres actuels
                  await onSubmit(form.getValues());
                  
                  // Passer à l'étape suivante (Messages d'accueil)
                  setActiveTab('greeting');
                  router.push({ query: { ...router.query, step: 'greeting' } });
                  
                  toast({
                    title: 'Configuration sauvegardée',
                    description: 'Vos paramètres de voix ont été enregistrés. Vous pouvez maintenant configurer vos messages d\'accueil.',
                    variant: 'success',
                  });
                } catch (error) {
                  console.error('Erreur lors de la sauvegarde:', error);
                  toast({
                    title: 'Erreur',
                    description: 'Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.',
                    variant: 'destructive',
                  });
                }
              }}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                'Valider pour passer aux étapes suivantes'
              )}
            </Button>
          )}
          
          <Button 
            type="submit" 
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (activeTab === 'activation' ? 'Enregistrer' : 'Enregistrer et continuer')}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <UserLayout>
      <Head>
        <title>Paramètres vocaux | Lydia Voice AI</title>
      </Head>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Paramètres vocaux</h1>
          <p className="text-muted-foreground">
            Configurez la voix de votre assistant vocal pour qu'elle corresponde à l'identité de votre entreprise.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Erreur de chargement</CardTitle>
              <CardDescription>
                Impossible de charger les paramètres vocaux. Veuillez rafraîchir la page.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="voice">Voix</TabsTrigger>
                <TabsTrigger value="greeting">Messages d'accueil</TabsTrigger>
                <TabsTrigger value="scenarios">Scénarios</TabsTrigger>
                <TabsTrigger value="company">Info Entreprise</TabsTrigger>
                <TabsTrigger value="prompts">Prompts IA</TabsTrigger>
                <TabsTrigger value="activation">Activation</TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <TabsContent value="voice" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Caractéristiques de la voix</CardTitle>
                        <CardDescription>
                          Configurez les paramètres de base de votre voix d'assistant
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="voice.gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Genre de la voix</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez un genre" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="female">Féminin</SelectItem>
                                  <SelectItem value="male">Masculin</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Le genre détermine le type de voix utilisé par Lydia.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="voice.language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Langue</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez une langue" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {accentOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                La langue influence la prononciation des mots.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="voice.speed"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vitesse de parole: {field.value}x</FormLabel>
                              <FormControl>
                                <Slider
                                  value={[field.value]}
                                  min={0.5}
                                  max={2.0}
                                  step={0.1}
                                  onValueChange={(values) => field.onChange(values[0])}
                                />
                              </FormControl>
                              <FormDescription>
                                Ajustez la vitesse à laquelle Lydia parle (0.5x à 2.0x).
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="voice.provider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fournisseur de voix</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez un fournisseur" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="gtts">gTTS (Gratuit)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Le fournisseur détermine les voix disponibles et la qualité audio.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="voice.voiceId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Voix</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={loadingVoices}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={loadingVoices ? "Chargement des voix..." : "Sélectionnez une voix"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {getVoiceOptions().map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Sélectionnez la voix qui représente le mieux votre entreprise.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Test de la voix</CardTitle>
                        <CardDescription>
                          Testez la configuration de voix avec votre propre texte
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <FormLabel>Texte à tester</FormLabel>
                          <textarea 
                            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={testText}
                            onChange={(e) => setTestText(e.target.value)}
                            placeholder="Entrez le texte que vous souhaitez tester..."
                          />
                          <FormDescription>
                            Entrez le texte que vous souhaitez entendre avec la voix configurée.
                          </FormDescription>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleTestVoice}
                            disabled={isTestingVoice || !testText.trim()}
                          >
                            {isTestingVoice ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Test en cours...
                              </>
                            ) : (
                              'Tester la voix'
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {testAudioUrl && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Test audio</CardTitle>
                          <CardDescription>
                            Écoutez le résultat de la configuration de voix actuelle
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <audio 
                            controls 
                            className="w-full"
                            autoPlay
                            onError={(e) => {
                              console.error("Erreur de chargement audio:", e);
                              
                              // Si l'URL ne commence pas par http, essayons de reconstruire l'URL avec le bon préfixe
                              if (!testAudioUrl.startsWith('http')) {
                                const baseUrl = window.location.origin;
                                const newUrl = `${baseUrl}${testAudioUrl.startsWith('/') ? '' : '/'}${testAudioUrl}`;
                                console.log("Tentative avec URL corrigée:", newUrl);
                                
                                // Mettre à jour l'URL audio
                                setTestAudioUrl(newUrl);
                                
                                toast({
                                  title: 'Retentative',
                                  description: 'Tentative avec une URL corrigée...',
                                  variant: 'default',
                                });
                                return;
                              }
                              
                              toast({
                                title: 'Erreur',
                                description: 'Impossible de charger le fichier audio. Veuillez réessayer.',
                                variant: 'destructive',
                              });
                              setTestAudioUrl(null);
                            }}
                          >
                            <source src={testAudioUrl} type="audio/mpeg" />
                            <source src={testAudioUrl} type="audio/mp3" />
                            <p>Votre navigateur ne supporte pas l'élément audio. <a href={testAudioUrl} target="_blank" rel="noopener noreferrer">Télécharger l'audio</a></p>
                          </audio>
                          <div className="mt-2 text-xs text-gray-500">
                            Si l'audio ne se charge pas automatiquement, <a href={testAudioUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">cliquez ici pour l'écouter directement</a>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <Button
                              type="button"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={async () => {
                                try {
                                  // Sauvegarder les paramètres actuels
                                  await onSubmit(form.getValues());
                                  
                                  // Passer à l'étape suivante (Messages d'accueil)
                                  setActiveTab('greeting');
                                  router.push({ query: { ...router.query, step: 'greeting' } });
                                  
                                  toast({
                                    title: 'Configuration sauvegardée',
                                    description: 'Vos paramètres de voix ont été enregistrés. Vous pouvez maintenant configurer vos messages d\'accueil.',
                                    variant: 'success',
                                  });
                                } catch (error) {
                                  console.error('Erreur lors de la sauvegarde:', error);
                                  toast({
                                    title: 'Erreur',
                                    description: 'Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.',
                                    variant: 'destructive',
                                  });
                                }
                              }}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Sauvegarde...
                                </>
                              ) : (
                                'Valider pour passer aux étapes suivantes'
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="greeting" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Messages d'accueil</CardTitle>
                        <CardDescription>
                          Personnalisez les messages d'accueil que votre assistant utilisera
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="greetings.main"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message d'accueil principal</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Bonjour, bienvenue chez [nom de l'entreprise]. Comment puis-je vous aider ?" 
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Ce message sera utilisé au début de chaque appel.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="greetings.outOfHours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message en dehors des heures d'ouverture</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Merci de votre appel. Nous sommes actuellement fermés. Nos heures d'ouverture sont..." 
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Ce message sera utilisé lorsque quelqu'un appelle en dehors des heures d'ouverture.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="greetings.waiting"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message d'attente</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Un instant s'il vous plaît, je recherche l'information..." 
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Ce message sera utilisé pendant que l'assistant traite une demande.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="scenarios" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Scénarios de réponse</CardTitle>
                        <CardDescription>
                          Configurez comment votre assistant réagira dans différentes situations
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="scenarios.information"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Demande d'informations</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Comment puis-je vous renseigner aujourd'hui ?" 
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Message utilisé pour les demandes d'informations générales.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="scenarios.transfer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Transfert à un agent</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Je vais vous mettre en relation avec un de nos agents..." 
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Message utilisé avant de transférer l'appel à un agent humain.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="scenarios.ending"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fin d'appel</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Merci de votre appel. Au revoir et à bientôt !" 
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Message utilisé à la fin de l'appel.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="company" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Informations de l'entreprise</CardTitle>
                        <CardDescription>
                          Configurez les informations de votre entreprise
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="companyInfo.products"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Produits</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-500">
                                    Utilisez le format JSON pour définir vos produits
                                  </p>
                                  <textarea
                                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder='["Produit 1", "Produit 2"]'
                                    value={Array.isArray(field.value) ? JSON.stringify(field.value, null, 2) : '[]'}
                                    onChange={(e) => {
                                      try {
                                        const value = JSON.parse(e.target.value);
                                        field.onChange(value);
                                      } catch (error) {
                                        // Garder la valeur précédente en cas d'erreur de parsing
                                      }
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Liste des produits de l'entreprise
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="companyInfo.services"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Services</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-500">
                                    Utilisez le format JSON pour définir vos services
                                  </p>
                                  <textarea
                                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder='["Service 1", "Service 2"]'
                                    value={Array.isArray(field.value) ? JSON.stringify(field.value, null, 2) : '[]'}
                                    onChange={(e) => {
                                      try {
                                        const value = JSON.parse(e.target.value);
                                        field.onChange(value);
                                      } catch (error) {
                                        // Garder la valeur précédente en cas d'erreur de parsing
                                      }
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Liste des services de l'entreprise
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="companyInfo.faq"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>FAQ</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-500">
                                    Utilisez le format JSON pour définir votre FAQ
                                  </p>
                                  <textarea
                                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder='[{"question":"Question","answer":"Réponse"}]'
                                    value={Array.isArray(field.value) ? JSON.stringify(field.value, null, 2) : '[]'}
                                    onChange={(e) => {
                                      try {
                                        const value = JSON.parse(e.target.value);
                                        field.onChange(value);
                                      } catch (error) {
                                        // Garder la valeur précédente en cas d'erreur de parsing
                                      }
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Liste des questions fréquentes posées par les clients
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="companyInfo.team"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Équipe</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-500">
                                    Utilisez le format JSON pour définir votre équipe
                                  </p>
                                  <textarea
                                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder='[{"name":"Nom","role":"Rôle","expertise":["Expertise 1"]}]'
                                    value={Array.isArray(field.value) ? JSON.stringify(field.value, null, 2) : '[]'}
                                    onChange={(e) => {
                                      try {
                                        const value = JSON.parse(e.target.value);
                                        field.onChange(value);
                                      } catch (error) {
                                        // Garder la valeur précédente en cas d'erreur de parsing
                                      }
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Liste des membres de l'équipe
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Documents d'entreprise</CardTitle>
                        <CardDescription>
                          Téléchargez des documents pour entraîner l'IA avec les informations de votre entreprise
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                          <div className="mt-4 flex text-sm justify-center">
                            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                              <span>Télécharger un fichier</span>
                              <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf" />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">PDF jusqu'à 10MB</p>
                        </div>

                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900">Documents téléchargés</h4>
                          <ul className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
                            {/* Liste des documents téléchargés */}
                            <li className="flex items-center justify-between py-3">
                              <div className="flex items-center">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                                <span className="ml-2 text-sm text-gray-600">plaquette-commerciale.pdf</span>
                              </div>
                              <button type="button" className="text-sm font-medium text-red-600 hover:text-red-500">
                                Supprimer
                              </button>
                            </li>
                            <li className="flex items-center justify-between py-3">
                              <div className="flex items-center">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                                <span className="ml-2 text-sm text-gray-600">faq-clients.pdf</span>
                              </div>
                              <button type="button" className="text-sm font-medium text-red-600 hover:text-red-500">
                                Supprimer
                              </button>
                            </li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="prompts" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Configuration des prompts IA</CardTitle>
                        <CardDescription>
                          Personnalisez le comportement de votre assistant vocal intelligent
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium">Instructions principales</h3>
                            <p className="text-sm text-gray-500 mb-2">
                              Ces instructions définissent comment votre IA interagira avec les appelants.
                            </p>
                            <textarea 
                              className="w-full rounded-md border border-gray-300 p-3 text-sm"
                              rows={5}
                              placeholder="Vous êtes un assistant vocal pour [nom de l'entreprise]. Votre rôle est d'aider les clients avec professionnalisme et courtoisie..."
                            ></textarea>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium">Présentation de l'entreprise</h3>
                            <p className="text-sm text-gray-500 mb-2">
                              Comment l'IA devrait présenter votre entreprise.
                            </p>
                            <textarea 
                              className="w-full rounded-md border border-gray-300 p-3 text-sm"
                              rows={3}
                              placeholder="[Nom de l'entreprise] est spécialisée dans [domaine] et offre [services]..."
                            ></textarea>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium">Réponses aux questions fréquentes</h3>
                            <p className="text-sm text-gray-500 mb-2">
                              Comment l'IA devrait répondre aux questions les plus courantes.
                            </p>
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs font-medium text-gray-700 mb-1">Question</p>
                                  <Input placeholder="Quels sont vos horaires d'ouverture ?" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-700 mb-1">Réponse</p>
                                  <Input placeholder="Nous sommes ouverts du lundi au vendredi de 9h à 18h." />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs font-medium text-gray-700 mb-1">Question</p>
                                  <Input placeholder="Comment vous contacter ?" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-700 mb-1">Réponse</p>
                                  <Input placeholder="Vous pouvez nous contacter par téléphone au..." />
                                </div>
                              </div>
                              <Button type="button" variant="outline" className="w-full">
                                + Ajouter une paire question/réponse
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Configuration avancée de l'IA</CardTitle>
                        <CardDescription>
                          Paramètres avancés pour personnaliser davantage votre assistant
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium">Niveau de formalité</h3>
                            <p className="text-xs text-gray-500 mb-2">
                              Ajustez le niveau de formalité de votre assistant vocal.
                            </p>
                            <div className="flex items-center space-x-2 pt-2">
                              <span className="text-xs">Informel</span>
                              <Slider 
                                value={[3]}
                                min={1}
                                max={5}
                                step={1}
                                className="flex-grow mx-2"
                              />
                              <span className="text-xs">Formel</span>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium">Verbosité</h3>
                            <p className="text-xs text-gray-500 mb-2">
                              Ajustez la concision ou le détail des réponses.
                            </p>
                            <div className="flex items-center space-x-2 pt-2">
                              <span className="text-xs">Concis</span>
                              <Slider 
                                value={[3]}
                                min={1}
                                max={5}
                                step={1}
                                className="flex-grow mx-2"
                              />
                              <span className="text-xs">Détaillé</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <h3 className="text-sm font-medium">Mots à éviter</h3>
                          <p className="text-xs text-gray-500 mb-2">
                            Liste de mots ou phrases que votre assistant ne devrait pas utiliser.
                          </p>
                          <Input placeholder="Entrez des mots à éviter, séparés par des virgules" />
                        </div>
                        
                        <div className="pt-2">
                          <h3 className="text-sm font-medium">Termes préférés</h3>
                          <p className="text-xs text-gray-500 mb-2">
                            Mots ou phrases spécifiques que votre assistant devrait privilégier.
                          </p>
                          <Input placeholder="Entrez des termes préférés, séparés par des virgules" />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="activation" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Activation du service</CardTitle>
                        <CardDescription>
                          Activez votre numéro de téléphone virtuel pour commencer à recevoir des appels
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {company?.fonosterPhoneNumber ? (
                          <div className="space-y-4">
                            <div className="p-4 bg-green-50 rounded-md">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div className="ml-3">
                                  <h3 className="text-sm font-medium text-green-800">Numéro actif</h3>
                                  <div className="mt-2 text-sm text-green-700">
                                    <p>Votre numéro de téléphone virtuel est actif : <strong>{company.fonosterPhoneNumber}</strong></p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <FormItem>
                              <FormLabel>Statut du service</FormLabel>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                                >
                                  Désactiver le service
                                </Button>
                                <FormDescription>
                                  Désactiver temporairement les appels entrants.
                                </FormDescription>
                              </div>
                            </FormItem>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="p-4 bg-yellow-50 rounded-md">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div className="ml-3">
                                  <h3 className="text-sm font-medium text-yellow-800">Configuration incomplète</h3>
                                  <div className="mt-2 text-sm text-yellow-700">
                                    <p>Vous n'avez pas encore de numéro de téléphone virtuel actif.</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <FormItem>
                              <FormLabel>Activer votre numéro virtuel</FormLabel>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  type="button" 
                                  variant="default"
                                >
                                  Obtenir un numéro
                                </Button>
                                <FormDescription>
                                  Un numéro virtuel vous sera attribué pour recevoir des appels.
                                </FormDescription>
                              </div>
                            </FormItem>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </form>
              </Form>
            </Tabs>
            
            {/* Afficher les boutons de navigation uniquement ici, pas en dehors */}
            <div className="mt-4">
              {renderStepNavigation()}
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

VoiceSettingsPage.getLayout = (page: ReactElement) => (
  <UserLayout>{page}</UserLayout>
);

export default VoiceSettingsPage; 
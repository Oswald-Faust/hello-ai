import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, RefreshCw, Download, Upload, Mic } from 'lucide-react';
import Link from 'next/link';

const SpeechServicePage = () => {
  const [loading, setLoading] = useState(false);
  const [testingSTT, setTestingSTT] = useState(false);
  const [uploadingModel, setUploadingModel] = useState(false);
  const [config, setConfig] = useState({
    engine: 'vosk',
    modelDir: '/models/vosk-model-fr',
    customModelEnabled: false,
    downloadingModel: false,
    pythonPath: 'python3',
    defaultLanguage: 'fr',
  });

  const engines = [
    { value: 'vosk', label: 'Vosk (local, gratuit)' },
    { value: 'fallback', label: 'Mode basique (secours)' },
  ];

  const languages = [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'Anglais' },
    { value: 'es', label: 'Espagnol' },
    { value: 'de', label: 'Allemand' },
  ];

  const voskModels = [
    { 
      value: 'vosk-model-fr-0.22', 
      label: 'Français (1.8GB)',
      url: 'https://alphacephei.com/vosk/models/vosk-model-fr-0.22.zip',
      size: '1.8 GB'
    },
    { 
      value: 'vosk-model-small-fr-0.22', 
      label: 'Français (léger, 42MB)',
      url: 'https://alphacephei.com/vosk/models/vosk-model-small-fr-0.22.zip',
      size: '42 MB'
    },
    { 
      value: 'vosk-model-en-us-0.22', 
      label: 'Anglais (US, 1.8GB)',
      url: 'https://alphacephei.com/vosk/models/vosk-model-en-us-0.22.zip',
      size: '1.8 GB'
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Ici, appel API pour sauvegarder la configuration
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simuler un appel API
      alert('Configuration sauvegardée avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setConfig(prev => ({ ...prev, customModelEnabled: checked }));
  };

  const handleDownloadModel = async (modelInfo: any) => {
    if (confirm(`Voulez-vous vraiment télécharger le modèle "${modelInfo.label}" (${modelInfo.size}) ?`)) {
      setConfig(prev => ({ ...prev, downloadingModel: true }));
      
      try {
        // Ici, appel API pour télécharger le modèle
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simuler un long téléchargement
        alert(`Modèle ${modelInfo.label} téléchargé avec succès`);
        
        // Mettre à jour le chemin du modèle
        setConfig(prev => ({ 
          ...prev, 
          modelDir: `/models/${modelInfo.value}`,
          downloadingModel: false 
        }));
      } catch (error) {
        console.error('Erreur lors du téléchargement du modèle:', error);
        alert('Erreur lors du téléchargement du modèle');
        setConfig(prev => ({ ...prev, downloadingModel: false }));
      }
    }
  };

  const handleUploadModel = async () => {
    setUploadingModel(true);
    
    try {
      // Ici, simuler l'upload d'un modèle
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Modèle uploadé avec succès');
      setConfig(prev => ({ ...prev, customModelEnabled: true }));
    } catch (error) {
      console.error('Erreur lors de l\'upload du modèle:', error);
      alert('Erreur lors de l\'upload du modèle');
    } finally {
      setUploadingModel(false);
    }
  };

  const handleTestRecognition = async () => {
    setTestingSTT(true);
    
    try {
      // Simuler un test de reconnaissance vocale
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Test de reconnaissance vocale réussi');
    } catch (error) {
      console.error('Erreur lors du test de reconnaissance vocale:', error);
      alert('Erreur lors du test de reconnaissance vocale');
    } finally {
      setTestingSTT(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard/admin/system" className="mr-4">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configuration de Reconnaissance Vocale</h1>
              <p className="text-sm text-gray-500">
                Configurez les paramètres de reconnaissance vocale (STT)
              </p>
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Enregistrer
          </Button>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="mb-6">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="models">Modèles</TabsTrigger>
            <TabsTrigger value="advanced">Avancé</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres généraux</CardTitle>
                  <CardDescription>
                    Configuration de base du service de reconnaissance vocale
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="engine">Moteur de reconnaissance</Label>
                    <Select
                      value={config.engine}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, engine: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un moteur" />
                      </SelectTrigger>
                      <SelectContent>
                        {engines.map((engine) => (
                          <SelectItem key={engine.value} value={engine.value}>
                            {engine.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Vosk fonctionne localement et ne nécessite pas d'accès internet après installation
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultLanguage">Langue par défaut</Label>
                    <Select
                      value={config.defaultLanguage}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, defaultLanguage: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une langue" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem key={language.value} value={language.value}>
                            {language.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="button"
                      onClick={handleTestRecognition}
                      disabled={testingSTT}
                      variant="outline"
                    >
                      {testingSTT ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Mic className="h-4 w-4 mr-2" />
                      )}
                      Tester la reconnaissance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="models">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des modèles Vosk</CardTitle>
                <CardDescription>
                  Téléchargez et configurez les modèles de reconnaissance vocale
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="modelDir">Répertoire du modèle actuel</Label>
                  <Input
                    id="modelDir"
                    name="modelDir"
                    value={config.modelDir}
                    onChange={handleInputChange}
                    placeholder="/models/vosk-model-fr"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="customModelEnabled" className="flex items-center space-x-2">
                    <span>Utiliser un modèle personnalisé</span>
                  </Label>
                  <Switch 
                    id="customModelEnabled" 
                    checked={config.customModelEnabled} 
                    onCheckedChange={handleSwitchChange} 
                  />
                </div>

                <div className="pt-4">
                  <h3 className="text-sm font-medium mb-2">Modèles disponibles</h3>
                  <div className="space-y-3">
                    {voskModels.map((model) => (
                      <div key={model.value} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{model.label}</p>
                          <p className="text-xs text-gray-500">Taille: {model.size}</p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleDownloadModel(model)}
                          disabled={config.downloadingModel}
                          size="sm"
                          variant="outline"
                        >
                          {config.downloadingModel ? (
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Download className="h-3 w-3 mr-1" />
                          )}
                          Télécharger
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-sm font-medium mb-2">Uploader un modèle personnalisé</h3>
                  <Button
                    type="button"
                    onClick={handleUploadModel}
                    disabled={uploadingModel}
                    variant="outline"
                    className="w-full"
                  >
                    {uploadingModel ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Uploader un modèle (.zip)
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Vous pouvez uploader un modèle Vosk personnalisé au format .zip
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres avancés</CardTitle>
                <CardDescription>
                  Configuration technique du service de reconnaissance vocale
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pythonPath">Chemin Python</Label>
                  <Input
                    id="pythonPath"
                    name="pythonPath"
                    value={config.pythonPath}
                    onChange={handleInputChange}
                    placeholder="python3"
                  />
                  <p className="text-xs text-gray-500">
                    Chemin vers l'exécutable Python utilisé pour Vosk
                  </p>
                </div>

                <div className="pt-4">
                  <h3 className="text-sm font-medium mb-2">Dépendances requises</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm mb-1"><span className="font-medium">FFmpeg:</span> Requis pour la conversion audio</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                      >
                        Vérifier l'installation
                      </Button>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm mb-1"><span className="font-medium">Vosk Python:</span> Package Python pour la reconnaissance vocale</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                      >
                        Vérifier l'installation
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default SpeechServicePage; 
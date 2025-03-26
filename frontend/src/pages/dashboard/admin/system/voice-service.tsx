import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, RefreshCw, Volume2, Trash2 } from 'lucide-react';
import Link from 'next/link';

const VoiceServicePage = () => {
  const [loading, setLoading] = useState(false);
  const [audioTesting, setAudioTesting] = useState(false);
  const [config, setConfig] = useState({
    provider: 'gtts',
    defaultLanguage: 'fr',
    defaultSpeed: 1.0,
    fishAudioApiKey: '',
    playHTApiKey: '',
    playHTUserId: '',
    cacheDuration: 7, // jours
    cacheEnabled: true,
  });

  const providers = [
    { value: 'gtts', label: 'Google TTS (gratuit)' },
    { value: 'fishaudio', label: 'Fish Audio' },
    { value: 'playht', label: 'PlayHT' },
  ];

  const languages = [
    { value: 'fr', label: 'Français' },
    { value: 'fr-ca', label: 'Français (Canada)' },
    { value: 'fr-fr', label: 'Français (France)' },
    { value: 'en', label: 'Anglais' },
    { value: 'en-us', label: 'Anglais (US)' },
    { value: 'en-gb', label: 'Anglais (UK)' },
    { value: 'es', label: 'Espagnol' },
    { value: 'de', label: 'Allemand' },
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
    setConfig(prev => ({ ...prev, cacheEnabled: checked }));
  };

  const handleSpeedChange = (value: number[]) => {
    setConfig(prev => ({ ...prev, defaultSpeed: value[0] }));
  };

  const handleTestVoice = async () => {
    setAudioTesting(true);
    try {
      // Ici, appel API pour tester la voix
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simuler un appel API
      // Jouer un son test
      const audio = new Audio('/api/test-voice');
      audio.play();
    } catch (error) {
      console.error('Erreur lors du test vocal:', error);
      alert('Erreur lors du test vocal');
    } finally {
      setAudioTesting(false);
    }
  };

  const handleClearCache = async () => {
    if (confirm('Êtes-vous sûr de vouloir vider le cache audio ?')) {
      try {
        // Ici, appel API pour vider le cache
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simuler un appel API
        alert('Cache vidé avec succès');
      } catch (error) {
        console.error('Erreur lors du vidage du cache:', error);
        alert('Erreur lors du vidage du cache');
      }
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
              <h1 className="text-2xl font-bold text-gray-900">Configuration du Service Vocal</h1>
              <p className="text-sm text-gray-500">
                Configurez les paramètres de synthèse vocale (TTS)
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
            <TabsTrigger value="providers">Fournisseurs</TabsTrigger>
            <TabsTrigger value="cache">Cache</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres généraux</CardTitle>
                  <CardDescription>
                    Configuration de base du service vocal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider">Fournisseur de voix par défaut</Label>
                    <Select
                      value={config.provider}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, provider: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un fournisseur" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem key={provider.value} value={provider.value}>
                            {provider.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Vitesse de parole: {config.defaultSpeed}x</Label>
                    </div>
                    <Slider 
                      min={0.5} 
                      max={2} 
                      step={0.1}
                      value={[config.defaultSpeed]} 
                      onValueChange={handleSpeedChange}
                      className="mt-2"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="button"
                      onClick={handleTestVoice}
                      disabled={audioTesting}
                      variant="outline"
                    >
                      {audioTesting ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Volume2 className="h-4 w-4 mr-2" />
                      )}
                      Tester la voix
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="providers">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Google TTS (gratuit)</CardTitle>
                  <CardDescription>
                    Service gratuit de synthèse vocale, ne nécessite pas de clé API
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Ce service est disponible gratuitement et ne nécessite pas de configuration supplémentaire.
                    Il offre une qualité de base pour la synthèse vocale.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fish Audio</CardTitle>
                  <CardDescription>
                    Service premium de synthèse vocale
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fishAudioApiKey">Clé API Fish Audio</Label>
                    <Input
                      id="fishAudioApiKey"
                      name="fishAudioApiKey"
                      value={config.fishAudioApiKey}
                      onChange={handleInputChange}
                      placeholder="Entrez votre clé API Fish Audio"
                      type="password"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>PlayHT</CardTitle>
                  <CardDescription>
                    Service premium avec voix hyper-réalistes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="playHTApiKey">Clé API PlayHT</Label>
                    <Input
                      id="playHTApiKey"
                      name="playHTApiKey"
                      value={config.playHTApiKey}
                      onChange={handleInputChange}
                      placeholder="Entrez votre clé API PlayHT"
                      type="password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="playHTUserId">ID Utilisateur PlayHT</Label>
                    <Input
                      id="playHTUserId"
                      name="playHTUserId"
                      value={config.playHTUserId}
                      onChange={handleInputChange}
                      placeholder="Entrez votre ID utilisateur PlayHT"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cache">
            <Card>
              <CardHeader>
                <CardTitle>Gestion du cache audio</CardTitle>
                <CardDescription>
                  Configurez comment les fichiers audio sont mis en cache
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cacheEnabled" className="flex items-center space-x-2">
                    <span>Activer le cache audio</span>
                  </Label>
                  <Switch 
                    id="cacheEnabled" 
                    checked={config.cacheEnabled} 
                    onCheckedChange={handleSwitchChange} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cacheDuration">Durée de conservation du cache (jours)</Label>
                  <Input
                    id="cacheDuration"
                    name="cacheDuration"
                    type="number"
                    min="1"
                    max="30"
                    value={config.cacheDuration}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-gray-500">
                    Les fichiers audio plus anciens que cette durée seront automatiquement supprimés
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={handleClearCache}
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Vider le cache
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default VoiceServicePage; 
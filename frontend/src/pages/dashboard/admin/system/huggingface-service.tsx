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
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const HuggingFaceServicePage = () => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    apiKey: '',
    enabled: true,
    defaultModel: 'mistralai/Mistral-7B-Instruct-v0.2',
    temperature: 0.5,
    maxTokens: 150,
    systemPrompt: `Vous êtes Lydia, un assistant vocal intelligent. 
Répondez aux questions des clients de manière utile et précise.`,
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setConfig(prev => ({ ...prev, enabled: checked }));
  };

  const handleTemperatureChange = (value: number[]) => {
    setConfig(prev => ({ ...prev, temperature: value[0] }));
  };

  const handleMaxTokensChange = (value: number[]) => {
    setConfig(prev => ({ ...prev, maxTokens: value[0] }));
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
              <h1 className="text-2xl font-bold text-gray-900">Configuration Hugging Face</h1>
              <p className="text-sm text-gray-500">
                Configurez les paramètres du service d'intelligence artificielle
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
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="advanced">Avancé</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres généraux</CardTitle>
                  <CardDescription>
                    Configuration de base du service Hugging Face
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enabled" className="flex items-center space-x-2">
                      <span>Activer le service</span>
                    </Label>
                    <div 
                      role="checkbox" 
                      aria-checked={config.enabled} 
                      onClick={() => handleSwitchChange(!config.enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${config.enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${config.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiKey">Clé API Hugging Face</Label>
                    <Input
                      id="apiKey"
                      name="apiKey"
                      value={config.apiKey}
                      onChange={handleInputChange}
                      placeholder="hf_..."
                      type="password"
                    />
                    <p className="text-xs text-gray-500">
                      Obtenir une clé sur <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">huggingface.co</a>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultModel">Modèle par défaut</Label>
                    <Input
                      id="defaultModel"
                      name="defaultModel"
                      value={config.defaultModel}
                      onChange={handleInputChange}
                      placeholder="mistralai/Mistral-7B-Instruct-v0.2"
                    />
                  </div>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="prompts">
            <Card>
              <CardHeader>
                <CardTitle>Configuration des prompts</CardTitle>
                <CardDescription>
                  Définissez les instructions système par défaut pour l'IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">Prompt système par défaut</Label>
                  <Textarea
                    id="systemPrompt"
                    name="systemPrompt"
                    value={config.systemPrompt}
                    onChange={handleInputChange}
                    rows={6}
                  />
                  <p className="text-xs text-gray-500">
                    Ce prompt sera utilisé comme base pour toutes les entreprises. Il peut être personnalisé par entreprise.
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
                  Ajustez les paramètres de génération du modèle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between">
                      <Label>Température: {config.temperature}</Label>
                      <span className="text-sm text-gray-500">
                        {config.temperature < 0.4 ? "Plus précis" : 
                         config.temperature > 0.7 ? "Plus créatif" : "Équilibré"}
                      </span>
                    </div>
                    <div className="relative flex w-full h-5 mt-2">
                      <div className="w-full h-2 bg-gray-200 rounded-full my-auto">
                        <div 
                          className="h-2 bg-indigo-600 rounded-full"
                          style={{ width: `${config.temperature * 100}%` }}
                        />
                        <div 
                          className="absolute h-5 w-5 rounded-full bg-white border-2 border-indigo-600 -mt-1.5"
                          style={{ left: `calc(${config.temperature * 100}% - 10px)` }}
                        />
                      </div>
                      <input 
                        type="range" 
                        min={0} 
                        max={1} 
                        step={0.05}
                        value={config.temperature}
                        onChange={(e) => handleTemperatureChange([parseFloat(e.target.value)])}
                        className="absolute w-full h-2 opacity-0 cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Une température basse (0.2) donne des réponses plus cohérentes et déterministes.
                      Une température élevée (0.8) donne des réponses plus variées et créatives.
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <Label>Nombre max de tokens: {config.maxTokens}</Label>
                    </div>
                    <div className="relative flex w-full h-5 mt-2">
                      <div className="w-full h-2 bg-gray-200 rounded-full my-auto">
                        <div 
                          className="h-2 bg-indigo-600 rounded-full"
                          style={{ width: `${(config.maxTokens - 50) / 450 * 100}%` }}
                        />
                        <div 
                          className="absolute h-5 w-5 rounded-full bg-white border-2 border-indigo-600 -mt-1.5"
                          style={{ left: `calc(${(config.maxTokens - 50) / 450 * 100}% - 10px)` }}
                        />
                      </div>
                      <input 
                        type="range" 
                        min={50} 
                        max={500} 
                        step={10}
                        value={config.maxTokens}
                        onChange={(e) => handleMaxTokensChange([parseInt(e.target.value)])}
                        className="absolute w-full h-2 opacity-0 cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Limite la longueur des réponses générées. Une valeur plus élevée permet des réponses plus détaillées.
                    </p>
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

export default HuggingFaceServicePage; 
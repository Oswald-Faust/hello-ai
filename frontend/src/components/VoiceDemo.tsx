import React, { useState, useEffect, ChangeEvent } from 'react';
import { Button, Card, Select, Input, Space, Typography, message } from 'antd';
import voiceService from '@/services/voiceService';

const { TextArea } = Input;
const { Title, Text } = Typography;

// Types pour les configurations de voix
interface VoiceConfig {
  provider: 'playht' | 'fishaudio';
  voiceId?: string;
  speed?: number;
  format?: string;
}

interface Voice {
  id: string;
  name: string;
  gender?: string;
  description?: string;
  language?: string;
}

/**
 * Composant de démonstration pour les fonctionnalités de voix
 */
const VoiceDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [voiceProvider, setVoiceProvider] = useState<'playht' | 'fishaudio'>('playht');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [text, setText] = useState<string>("Bonjour, je suis une voix générée par l'IA. Merci d'utiliser notre service.");
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [loadingVoices, setLoadingVoices] = useState(false);

  // Charger les voix recommandées
  useEffect(() => {
    const recommendedVoices = voiceService.getRecommendedFrenchVoices(voiceProvider);
    setVoices(recommendedVoices);
    
    if (recommendedVoices.length > 0) {
      setSelectedVoice(recommendedVoices[0].id);
    }
  }, [voiceProvider]);

  // Charger la liste complète des voix disponibles
  const loadAllVoices = async () => {
    try {
      setLoadingVoices(true);
      const allVoices = await voiceService.getAvailableVoices(voiceProvider);
      
      // Filtrer pour les voix françaises uniquement
      const frenchVoices = allVoices.filter((voice: Voice) => 
        voice.language?.includes('fr') || 
        voice.name?.includes('fr') || 
        voice.description?.includes('français') ||
        voice.description?.includes('French')
      );
      
      setVoices(frenchVoices);
      message.success(`${frenchVoices.length} voix françaises trouvées`);
    } catch (error) {
      console.error('Erreur lors du chargement des voix:', error);
      message.error('Erreur lors du chargement des voix');
    } finally {
      setLoadingVoices(false);
    }
  };

  // Générer l'audio
  const generateAudio = async () => {
    if (!selectedVoice || !text) {
      message.warning('Veuillez sélectionner une voix et entrer du texte');
      return;
    }
    
    try {
      setLoading(true);
      const voiceConfig: VoiceConfig = {
        provider: voiceProvider,
        voiceId: selectedVoice,
        speed: 1.0,
        format: 'mp3'
      };
      
      const url = await voiceService.testVoice(text, voiceConfig);
      
      setAudioUrl(url);
      message.success('Audio généré avec succès');
    } catch (error) {
      console.error('Erreur lors de la génération audio:', error);
      message.error('Erreur lors de la génération audio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Démo - Synthèse Vocale" style={{ maxWidth: 800, margin: '0 auto' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Title level={5}>1. Choisissez un fournisseur</Title>
          <Select
            value={voiceProvider}
            onChange={(value: 'playht' | 'fishaudio') => setVoiceProvider(value)}
            style={{ width: '100%' }}
            options={[
              { label: 'PlayHT (Gratuit)', value: 'playht' },
              { label: 'Fish Audio (Payant)', value: 'fishaudio' }
            ]}
          />
        </div>

        <div>
          <Title level={5}>2. Sélectionnez une voix</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Select
              placeholder="Sélectionnez une voix"
              value={selectedVoice}
              onChange={setSelectedVoice}
              style={{ width: '100%' }}
              options={voices.map(voice => ({
                label: voice.name || voice.id,
                value: voice.id
              }))}
              loading={loadingVoices}
            />
            <Button 
              onClick={loadAllVoices} 
              loading={loadingVoices}
              type="link"
            >
              Charger toutes les voix disponibles
            </Button>
          </Space>
        </div>

        <div>
          <Title level={5}>3. Entrez votre texte</Title>
          <TextArea
            value={text}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
            placeholder="Entrez le texte à synthétiser"
            rows={4}
          />
        </div>

        <Button
          type="primary"
          onClick={generateAudio}
          loading={loading}
          block
        >
          Générer l'audio
        </Button>

        {audioUrl && (
          <div style={{ marginTop: 16 }}>
            <Title level={5}>Résultat</Title>
            <audio controls style={{ width: '100%' }} src={audioUrl} />
            <Text type="secondary">
              URL: {audioUrl}
            </Text>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default VoiceDemo; 
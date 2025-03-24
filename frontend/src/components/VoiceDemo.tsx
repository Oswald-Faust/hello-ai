import React, { useState, useEffect, ChangeEvent } from 'react';
import { Button, Card, Select, Input, Space, Typography, message } from 'antd';
import voiceService from '@/services/voiceService';

const { TextArea } = Input;
const { Title, Text } = Typography;

// Types pour les configurations de voix
interface VoiceConfig {
  provider: 'gtts';
  voiceId: string;
  gender: 'male' | 'female';
  language: string;
  speed?: number;
  format?: string;
}

interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  language: string;
  provider: string;
  description?: string;
}

/**
 * Composant de démonstration pour les fonctionnalités de voix
 */
const VoiceDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [text, setText] = useState<string>("Bonjour, je suis une voix générée par l'IA. Merci d'utiliser notre service.");
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [gender, setGender] = useState<'male' | 'female'>('female');

  // Charger les voix recommandées
  useEffect(() => {
    const recommendedVoices = voiceService.getRecommendedVoices();
    setVoices(recommendedVoices as Voice[]);
    
    if (recommendedVoices.length > 0) {
      const firstVoice = recommendedVoices[0];
      setSelectedVoice(firstVoice.id);
      if (firstVoice.gender === 'male' || firstVoice.gender === 'female') {
        setGender(firstVoice.gender);
      }
    }
  }, []);

  // Générer l'audio
  const generateAudio = async () => {
    if (!selectedVoice || !text) {
      message.warning('Veuillez sélectionner une voix et entrer du texte');
      return;
    }
    
    try {
      setLoading(true);
      const voiceConfig: VoiceConfig = {
        provider: 'gtts',
        voiceId: selectedVoice,
        gender: gender,
        language: 'fr',
        speed: 1.0,
        format: 'mp3'
      };
      
      const response = await voiceService.testVoice(text, voiceConfig);
      
      if (response.success && response.audioUrl) {
        setAudioUrl(response.audioUrl);
        message.success('Audio généré avec succès');
      } else {
        throw new Error(response.message || 'Erreur lors de la génération audio');
      }
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
          <Title level={5}>1. Choisissez le genre de la voix</Title>
          <Select
            value={gender}
            onChange={(value: 'male' | 'female') => setGender(value)}
            style={{ width: '100%' }}
            options={[
              { label: 'Voix féminine', value: 'female' },
              { label: 'Voix masculine', value: 'male' }
            ]}
          />
        </div>

        <div>
          <Title level={5}>2. Entrez votre texte</Title>
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
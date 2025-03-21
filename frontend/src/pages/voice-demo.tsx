import React from 'react';
import { Layout, Typography, Card, Divider } from 'antd';
import VoiceDemo from '@/components/VoiceDemo';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const VoiceDemoPage: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '50px 50px', maxWidth: 1200, margin: '0 auto' }}>
        <Typography>
          <Title>Démo de Synthèse Vocale</Title>
          <Paragraph>
            Cette page vous permet de tester les capacités de synthèse vocale intégrées à notre application.
            Nous utilisons désormais PlayHT comme fournisseur principal, qui offre un quota gratuit généreux
            de 100 000 caractères par mois.
          </Paragraph>
          
          <Divider />
          
          <Card style={{ marginBottom: 24 }}>
            <Title level={4}>Fonctionnalités disponibles</Title>
            <Paragraph>
              <ul>
                <li>Choix entre plusieurs fournisseurs de voix (PlayHT gratuit ou Fish Audio payant)</li>
                <li>Sélection parmi une variété de voix françaises de haute qualité</li>
                <li>Personnalisation de la vitesse et du ton</li>
                <li>Génération de fichiers audio MP3 à partir de texte</li>
                <li>Possibilité de cloner votre propre voix (via l'API admin)</li>
              </ul>
            </Paragraph>
          </Card>
          
          <VoiceDemo />
          
          <Divider />
          
          <Card style={{ marginTop: 24 }}>
            <Title level={4}>Comment ça marche ?</Title>
            <Paragraph>
              Notre système utilise des modèles d'IA avancés pour transformer le texte en parole naturelle.
              Le processus se déroule en plusieurs étapes :
            </Paragraph>
            <ol>
              <li>Le texte est analysé et prétraité pour identifier la structure et la prononciation</li>
              <li>Le modèle de synthèse vocale génère l'audio correspondant</li>
              <li>Des améliorations sont appliquées pour rendre la voix plus naturelle</li>
              <li>L'audio final est compressé et mis en cache pour une utilisation future</li>
            </ol>
          </Card>
        </Typography>
      </Content>
    </Layout>
  );
};

export default VoiceDemoPage; 
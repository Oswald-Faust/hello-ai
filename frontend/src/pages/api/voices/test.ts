import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Route API pour tester une voix avec un texte donné
 * Remarque: Dans un environnement de production, cette route appellerait directement le backend.
 * Pour le développement et les tests, nous allons simuler la réponse.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vérifier que la méthode est POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Méthode non autorisée' 
    });
  }

  try {
    // Récupérer les paramètres
    const { text, voiceConfig } = req.body;

    if (!text) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le texte est requis' 
      });
    }

    if (!voiceConfig) {
      return res.status(400).json({ 
        success: false, 
        message: 'La configuration de la voix est requise' 
      });
    }

    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Pour des tests, on utilise un fichier MP3 statique
    // Dans un environnement de production, cette URL proviendrait du backend
    const audioUrl = '/audio/exemple-voix.mp3';
    
    // Retourner une réponse de succès
    return res.status(200).json({ 
      success: true, 
      audioUrl,
      data: { 
        success: true, 
        audioUrl, 
        voiceConfig
      }
    });
  } catch (error) {
    console.error('Erreur lors du test de la voix:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Une erreur est survenue lors du test de la voix' 
    });
  }
} 
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Route API pour récupérer les voix disponibles
 * Remarque: Dans un environnement de production, cette route appellerait directement le backend.
 * Pour le développement et les tests, nous allons simuler les données.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vérifier que la méthode est GET
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Méthode non autorisée' 
    });
  }

  try {
    // Récupérer le fournisseur à partir des paramètres de requête
    const { provider = 'fishaudio' } = req.query;

    // Simuler un délai de traitement (réduit pour éviter les timeouts)
    await new Promise(resolve => setTimeout(resolve, 200));

    // Données simulées pour les différents fournisseurs
    let voices = [];

    switch (String(provider).toLowerCase()) {
      case 'fishaudio':
        voices = [
          { id: 'fr_female_1', name: 'Française - Sophie', gender: 'female', language: 'fr-FR', provider: 'fishaudio' },
          { id: 'fr_female_2', name: 'Française - Claire', gender: 'female', language: 'fr-FR', provider: 'fishaudio' },
          { id: 'fr_male_1', name: 'Français - Pierre', gender: 'male', language: 'fr-FR', provider: 'fishaudio' },
          { id: 'fr_male_2', name: 'Français - Jean', gender: 'male', language: 'fr-FR', provider: 'fishaudio' }
        ];
        break;
      
      case 'fonoster':
        voices = [
          { id: 'fr-FR-Standard-A', name: 'Français - Julie', gender: 'female', language: 'fr-FR', provider: 'fonoster' },
          { id: 'fr-FR-Standard-B', name: 'Français - Thomas', gender: 'male', language: 'fr-FR', provider: 'fonoster' },
          { id: 'fr-FR-Standard-C', name: 'Français - Emma', gender: 'female', language: 'fr-FR', provider: 'fonoster' },
          { id: 'fr-FR-Standard-D', name: 'Français - Antoine', gender: 'male', language: 'fr-FR', provider: 'fonoster' },
          { id: 'fr-FR-Standard-E', name: 'Français - Sophie', gender: 'female', language: 'fr-FR', provider: 'fonoster' }
        ];
        break;
      
      case 'twilio':
        voices = [
          { id: 'Polly.Celine', name: 'Céline (Féminin)', gender: 'female', language: 'fr-FR', provider: 'twilio' },
          { id: 'Polly.Mathieu', name: 'Mathieu (Masculin)', gender: 'male', language: 'fr-FR', provider: 'twilio' }
        ];
        break;
      
      case 'custom':
        voices = [
          { id: 'custom_1', name: 'Voix personnalisée 1', gender: 'female', language: 'fr-FR', provider: 'custom' },
          { id: 'custom_2', name: 'Voix personnalisée 2', gender: 'male', language: 'fr-FR', provider: 'custom' }
        ];
        break;
      
      case 'playht':
        voices = [
          { id: 's3://voice-cloning-zero-shot/7c38b588-14e8-42b9-bacd-e03d1d673c3c/pauline/manifest.json', name: 'Pauline', gender: 'female', language: 'fr-FR', provider: 'playht' },
          { id: 's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/f-fr-5/manifest.json', name: 'Émilie', gender: 'female', language: 'fr-FR', provider: 'playht' },
          { id: 's3://voice-cloning-zero-shot/2391d3f8-16cc-4c96-a7dc-e30e81881305/fr-male-2/manifest.json', name: 'François', gender: 'male', language: 'fr-FR', provider: 'playht' }
        ];
        break;
      
      case 'gtts':
        voices = [
          { id: 'fr', name: 'Français', gender: 'neutral', language: 'fr', provider: 'gtts' },
          { id: 'fr-ca', name: 'Français (Canada)', gender: 'neutral', language: 'fr-ca', provider: 'gtts' },
          { id: 'fr-fr', name: 'Français (France)', gender: 'neutral', language: 'fr-fr', provider: 'gtts' }
        ];
        break;
      
      default:
        voices = [
          { id: 'fr_female_1', name: 'Française - Sophie', gender: 'female', language: 'fr-FR', provider: 'fishaudio' },
          { id: 'fr_male_1', name: 'Français - Pierre', gender: 'male', language: 'fr-FR', provider: 'fishaudio' }
        ];
    }

    // Retourner une réponse de succès
    return res.status(200).json({ 
      success: true, 
      data: voices
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des voix disponibles:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Une erreur est survenue lors de la récupération des voix disponibles' 
    });
  }
} 
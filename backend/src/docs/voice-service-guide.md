# Guide du Service de Synthèse Vocale

Ce document explique comment utiliser le service de synthèse vocale dans l'application. Le service supporte deux fournisseurs différents : PlayHT (gratuit) et Fish Audio (payant).

## Configuration des clés API

Pour commencer à utiliser le service, vous devez configurer les clés API dans le fichier `.env` :

```
# PlayHT (Recommandé - Gratuit avec 100 000 caractères/mois)
PLAYHT_API_KEY=votre_clé_api
PLAYHT_USER_ID=votre_id_utilisateur

# Fish Audio (Alternative - Payant)
FISH_AUDIO_API_KEY=votre_clé_api
```

Pour obtenir des clés API PlayHT gratuites :

1. Créez un compte sur [PlayHT](https://play.ht/app/)
2. Allez dans "Settings" > "API Access"
3. Copiez votre clé API et votre ID utilisateur
4. Ajoutez-les au fichier `.env`

## Utilisation de base

Le service de voix expose plusieurs méthodes :

```javascript
const voiceService = require('../services/voiceService');

// Générer un fichier audio
const audioFilePath = await voiceService.generateAudio('Texte à synthétiser', {
  provider: 'playht',  // 'playht' (par défaut) ou 'fishaudio'
  voiceId: 'voix_id',  // Optionnel, utilise une voix française par défaut
  speed: 1.0,          // Optionnel, vitesse de parole (1.0 par défaut)
});

// Obtenir la liste des voix disponibles
const voices = await voiceService.getAvailableVoices('playht'); // ou 'fishaudio'

// Créer une voix personnalisée
const customVoice = await voiceService.uploadCustomVoice(
  audioFile,  // Buffer du fichier audio
  'Nom de la voix',
  {
    provider: 'playht',  // 'playht' (par défaut) ou 'fishaudio'
    description: 'Description de la voix'  // Optionnel
  }
);
```

## Voix françaises recommandées

### PlayHT (Gratuit)
- `s3://voice-cloning-zero-shot/7c38b588-14e8-42b9-bacd-e03d1d673c3c/pauline/manifest.json` - Pauline (Femme)
- `s3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/f-fr-5/manifest.json` - Femme française
- `s3://voice-cloning-zero-shot/2391d3f8-16cc-4c96-a7dc-e30e81881305/fr-male-2/manifest.json` - Homme français

### Fish Audio (Payant)
- `fr_female_1` - Voix féminine française
- `fr_male_1` - Voix masculine française

## Exemples d'utilisation

### Générer un audio avec PlayHT

```javascript
const audioFile = await voiceService.generateAudio(
  "Bonjour, comment puis-je vous aider aujourd'hui ?",
  {
    provider: 'playht',
    voiceId: 's3://voice-cloning-zero-shot/7c38b588-14e8-42b9-bacd-e03d1d673c3c/pauline/manifest.json'
  }
);
```

### Obtenir les voix disponibles sur PlayHT

```javascript
const voices = await voiceService.getAvailableVoices('playht');
console.log(`${voices.length} voix disponibles sur PlayHT`);
```

### Charger un fichier audio pour créer une voix personnalisée

```javascript
const fs = require('fs').promises;
const audioFile = await fs.readFile('chemin_vers_fichier_audio.mp3');

const customVoice = await voiceService.uploadCustomVoice(
  audioFile,
  'Ma Voix Personnalisée',
  {
    provider: 'playht',
    description: 'Voix personnalisée pour mon application'
  }
);
```

## Gestion du cache

Le service met automatiquement en cache les fichiers audio générés dans le répertoire `audio_cache` à la racine du projet. Les fichiers sont nommés avec un hash MD5 basé sur le texte et les paramètres utilisés, ce qui évite de régénérer le même audio plusieurs fois.

## Choix du fournisseur

Nous recommandons d'utiliser PlayHT comme fournisseur par défaut car:

1. **Quota gratuit généreux**: 100 000 caractères par mois gratuitement
2. **Qualité sonore élevée**: Les voix sont naturelles et fluides
3. **Nombreuses voix françaises**: Plusieurs options disponibles par défaut
4. **API stable**: Mise à jour régulièrement

Si vous avez des besoins spécifiques que PlayHT ne peut pas satisfaire, Fish Audio reste disponible comme alternative mais nécessite un abonnement payant.

## Résolution des problèmes

### Le fichier audio n'est pas généré

- Vérifiez que les clés API sont correctement configurées dans le fichier `.env`
- Assurez-vous que le répertoire `audio_cache` existe et est accessible en écriture
- Vérifiez les logs pour des messages d'erreur spécifiques

### Les voix ne sont pas disponibles

- Vérifiez la connexion Internet
- Vérifiez que les clés API n'ont pas expiré
- Essayez de régénérer de nouvelles clés API si nécessaire

## Plus d'informations

- [Documentation officielle de PlayHT](https://docs.play.ht/)
- [Politique d'utilisation de PlayHT](https://play.ht/terms-of-service/) 
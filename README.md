# Lydia - Assistant Vocal Intelligent pour Entreprises

Lydia est un service SaaS permettant aux entreprises d'automatiser la gestion des appels entrants grâce à un assistant vocal intelligent basé sur l'IA.

## Fonctionnalités principales

- **Numéro virtuel personnalisé** pour chaque entreprise
- **Réponse automatique aux appels** avec reconnaissance vocale
- **Personnalisation du modèle vocal** via une interface web intuitive
- **Analyse et compréhension des demandes** grâce à l'IA
- **Transfert intelligent vers un humain** lorsque nécessaire
- **Tableau de bord analytique** pour suivre les performances

## Alternatives Gratuites

Ce projet prend en charge plusieurs alternatives gratuites pour la génération de voix et de texte :

### Génération de Texte
- **Hugging Face** (gratuit) : Utilisez l'API Hugging Face avec des modèles comme Mistral-7B pour générer des réponses textuelles sans frais.
  - Créez un compte sur [Hugging Face](https://huggingface.co/)
  - Obtenez une clé API gratuite dans les paramètres de votre compte
  - Configurez `HUGGINGFACE_API_KEY` et `HUGGINGFACE_MODEL` dans votre fichier `.env`

### Synthèse Vocale (TTS)
- **Google TTS** (gratuit) : Utilisez la bibliothèque node-gtts qui fonctionne sans clé API.
  - Prend en charge plusieurs langues
  - Ne nécessite pas de configuration supplémentaire

### Routes API pour les alternatives gratuites

```
# Générer une conversation avec Hugging Face et audio avec gTTS
POST /api/voices/hf-conversation
Body: {
  "text": "Texte à traiter",
  "voice": {
    "language": "fr",
    "speed": 1.0
  },
  "company": {
    "name": "Nom de l'entreprise",
    "description": "Description de l'entreprise"
  }
}

# Télécharger un fichier audio généré
GET /api/voices/download/:fileName

# Analyser le sentiment d'un texte
POST /api/voices/sentiment
Body: {
  "text": "Texte à analyser"
}
```

## Architecture technique

- **Backend**: Node.js (Express), Twilio, OpenAI API, Google Speech-to-Text
- **Frontend**: React.js (Next.js), Tailwind CSS
- **Base de données**: PostgreSQL
- **Infrastructure**: Docker, AWS

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-organisation/lydia.git
cd lydia

# Installer les dépendances du backend
cd backend
npm install

# Installer les dépendances du frontend
cd ../frontend
npm install
```

## Configuration

Créez un fichier `.env` dans le dossier backend avec les variables suivantes:

```
PORT=3001
TWILIO_ACCOUNT_SID=votre_sid
TWILIO_AUTH_TOKEN=votre_token
OPENAI_API_KEY=votre_cle_api
GOOGLE_APPLICATION_CREDENTIALS=chemin/vers/credentials.json
DATABASE_URL=postgres://user:password@localhost:5432/lydia
```

## Démarrage

```bash
# Démarrer le backend
cd backend
npm run dev

# Démarrer le frontend
cd ../frontend
npm run dev
```

## Licence

Tous droits réservés © 2023
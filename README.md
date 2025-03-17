# Lydia - Assistant Vocal Intelligent pour Entreprises

Lydia est un service SaaS permettant aux entreprises d'automatiser la gestion des appels entrants grâce à un assistant vocal intelligent basé sur l'IA.

## Fonctionnalités principales

- **Numéro virtuel personnalisé** pour chaque entreprise
- **Réponse automatique aux appels** avec reconnaissance vocale
- **Personnalisation du modèle vocal** via une interface web intuitive
- **Analyse et compréhension des demandes** grâce à l'IA
- **Transfert intelligent vers un humain** lorsque nécessaire
- **Tableau de bord analytique** pour suivre les performances

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
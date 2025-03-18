# Documentation du Projet Lydia

Bienvenue dans la documentation du projet Lydia. Cette documentation est destinée aux développeurs travaillant sur le projet et couvre tous les aspects de l'architecture, du développement et du déploiement.

## Table des matières

### Présentation générale
- [Architecture](./architecture/README.md) - Vue d'ensemble de l'architecture du projet

### Frontend
- [Documentation Frontend](./frontend/README.md) - Structure et composants du frontend

### Backend
- [Documentation Backend](./backend/README.md) - Structure et services du backend
- [API](./api/README.md) - Documentation complète de l'API

### Guides
- [Déploiement](./deployment/README.md) - Instructions pour déployer le projet
- [Tests](./testing/README.md) - Comment tester l'application
- [Contribution](./CONTRIBUTING.md) - Guide pour contribuer au projet

## Démarrage rapide

### Prérequis
- Node.js 18+
- Git
- Docker et Docker Compose (recommandé)

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-organisation/lydia.git
cd lydia

# Installation des dépendances frontend
cd frontend
npm install
cp .env.example .env.local
# Configurer les variables d'environnement

# Installation des dépendances backend
cd ../backend
npm install
cp .env.example .env
# Configurer les variables d'environnement
```

### Démarrage en développement

```bash
# Terminal 1 : Backend
cd backend
npm run dev

# Terminal 2 : Frontend
cd frontend
npm run dev
```

L'application frontend sera accessible à l'adresse [http://localhost:3000](http://localhost:3000)  
L'API backend sera accessible à l'adresse [http://localhost:3001](http://localhost:3001)

## Fonctionnalités principales

- **Authentification** : Connexion, inscription et gestion des utilisateurs
- **Appels téléphoniques** : Intégration avec Twilio pour les appels
- **IA conversationnelle** : Intégration avec l'API OpenAI pour générer des réponses
- **Gestion d'entreprise** : Création et gestion des entreprises
- **Tableau de bord** : Visualisation des données et statistiques

## Support et contact

Pour toute question ou problème, veuillez créer une issue sur GitHub ou contacter l'équipe de développement à [support@lydia.ai](mailto:support@lydia.ai). 
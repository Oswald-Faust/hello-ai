# Guide de Développement

## Configuration de l'environnement

### Prérequis

- Node.js 18+
- npm 8+
- Git
- VS Code (recommandé)
- Docker et Docker Compose (optionnel)

### Extensions VS Code recommandées

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "mikestead.dotenv",
    "firsttris.vscode-jest-runner",
    "ms-azuretools.vscode-docker",
    "graphql.vscode-graphql"
  ]
}
```

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-organisation/lydia.git
cd lydia

# Installation des dépendances
npm install

# Mettre en place les variables d'environnement
cp .env.example .env
# Éditer .env avec vos propres valeurs
```

## Structure du projet

```
├── .github/              # Configuration GitHub Actions
├── backend/              # Code source backend
│   ├── src/
│   │   ├── config/       # Configuration
│   │   ├── controllers/  # Contrôleurs REST
│   │   ├── middleware/   # Middleware Express
│   │   ├── models/       # Modèles de données
│   │   ├── routes/       # Définition des routes
│   │   ├── services/     # Services métier
│   │   └── index.ts      # Point d'entrée
│   ├── tests/            # Tests
│   ├── .env.example      # Exemple de variables d'environnement
│   └── package.json      # Dépendances
├── frontend/             # Code source frontend
│   ├── public/           # Fichiers statiques
│   ├── src/
│   │   ├── app/          # Routes Next.js
│   │   ├── components/   # Composants React
│   │   ├── context/      # Contextes React
│   │   └── hooks/        # Hooks personnalisés
│   ├── .env.example      # Exemple de variables d'environnement
│   └── package.json      # Dépendances
└── docs/                 # Documentation
```

## Workflow de développement

### 1. Démarrer le projet

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Cycle de développement

1. Créer une branche depuis `develop`
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/nouvelle-fonctionnalite
   ```

2. Développer la fonctionnalité
3. Exécuter les tests
4. Soumettre une Pull Request

## Conventions de code

### Nommage

- **Fichiers et dossiers** : kebab-case, PascalCase pour les composants React
- **Variables** : camelCase
- **Classes** : PascalCase
- **Constantes** : UPPER_SNAKE_CASE
- **Interfaces & Types** : PascalCase avec préfixe I pour les interfaces

### Style de code

```typescript
// Imports groupés
import React, { useState } from 'react';
import { useRouter } from 'next/router';

// Interfaces/Types
interface IUserProps {
  id: string;
  name: string;
}

// Composant
export const UserCard: React.FC<IUserProps> = ({ id, name }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    router.push(`/users/${id}`);
  };

  return (
    <div className="p-4 border rounded" onClick={handleClick}>
      <h2>{name}</h2>
    </div>
  );
};
```

## Tests

### Commandes principales

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests avec couverture
npm run test:coverage

# Exécuter les tests en mode watch
npm run test:watch
```

## Debug

### Backend

```bash
# Ajouter NODE_OPTIONS dans le script
"dev:debug": "NODE_OPTIONS='--inspect' ts-node-dev --respawn src/index.ts"
```

### Frontend

- Utiliser React DevTools
- Console du navigateur
- Capture des erreurs dans un ErrorBoundary

## Performance

### Bonnes pratiques

- Optimiser les rendus avec useMemo et useCallback
- Lazy loading des composants et des routes
- Optimiser les images avec next/image
- Minimiser les requêtes réseau

## Documentation

### JSDoc

```typescript
/**
 * Génère un token JWT pour l'authentification
 * @param {User} user - L'utilisateur pour lequel générer le token
 * @param {number} expiresIn - Durée de validité en secondes
 * @returns {string} Le token JWT généré
 */
export function generateToken(user: User, expiresIn = 3600): string {
  // Implementation
}
```

### Storybook (optionnel)

```bash
# Lancer Storybook
npm run storybook
```

## Ressources

- [Documentation React](https://react.dev/)
- [Documentation Next.js](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) 
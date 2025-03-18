# Guide de Contribution

## Introduction

Merci de votre intérêt pour contribuer au projet Lydia ! Ce document décrit le processus de contribution et les bonnes pratiques à suivre.

## Prérequis

- Node.js 18+
- Git
- Compte GitHub
- Docker (recommandé)

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-organisation/lydia.git
cd lydia

# Installation des dépendances
npm install

# Configuration des variables d'environnement
cp .env.example .env
# Éditer le fichier .env avec vos variables

# Démarrer le projet en mode développement
npm run dev
```

## Structure des branches

- `main` : code de production
- `develop` : branche principale de développement
- `feature/*` : nouvelles fonctionnalités
- `bugfix/*` : corrections de bugs
- `hotfix/*` : corrections urgentes pour la production
- `release/*` : préparation des versions

## Workflow de contribution

1. **Créer une issue** : Créez une issue décrivant le bug ou la fonctionnalité
2. **Créer une branche** : `git checkout -b feature/nom-de-la-fonctionnalité`
3. **Effectuer les modifications** : Développer la fonctionnalité ou corriger le bug
4. **Tests** : S'assurer que tous les tests passent
5. **Pull Request** : Créer une pull request vers `develop`
6. **Review** : Attendre la review des mainteneurs
7. **Merge** : Une fois approuvée, la PR sera fusionnée

## Conventions de code

### JavaScript/TypeScript

- Utilisez TypeScript pour tout nouveau code
- Suivez les règles ESLint configurées dans le projet
- Formatez avec Prettier avant de soumettre du code

```bash
# Vérifier le formatage
npm run lint

# Formatter le code
npm run format
```

### Commit Messages

Nous suivons les conventions de [Conventional Commits](https://www.conventionalcommits.org/) :

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types :
- `feat` : nouvelle fonctionnalité
- `fix` : correction de bug
- `docs` : documentation
- `style` : formatage, sans changement de code
- `refactor` : restructuration du code
- `test` : ajout ou modification de tests
- `chore` : tâches de maintenance

Exemple :
```
feat(auth): ajouter la validation du token JWT

Ajouter la validation du token JWT dans le middleware d'authentification.
Ce changement permet de vérifier la signature et l'expiration du token.

Closes #123
```

## Tests

Tous les changements doivent inclure des tests appropriés :

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests avec couverture
npm run test:coverage

# Exécuter les tests en mode watch
npm run test:watch
```

## Documentation

La documentation est aussi importante que le code :

- Documentez toutes les fonctions, classes et méthodes publiques
- Mettez à jour le README et la documentation si nécessaire
- Ajoutez des commentaires pour le code complexe
- Utilisez JSDoc pour documenter les interfaces et types

## Pull Requests

Toutes les Pull Requests doivent :

1. Avoir un titre clair et descriptif
2. Inclure une description des changements
3. Référencer l'issue associée
4. Passer tous les tests automatisés
5. Suivre les conventions de code
6. Être revues par au moins un mainteneur

## Code Review

Lors de la revue de code, soyez :

- Respectueux et constructif
- Précis dans vos commentaires
- Ouvert aux suggestions et alternatives
- Attentif aux détails

## Rapporter des bugs

Lors de la création d'une issue pour un bug :

1. Vérifiez que le bug n'a pas déjà été signalé
2. Utilisez le template de bug report
3. Incluez les étapes pour reproduire
4. Décrivez le comportement attendu et réel
5. Ajoutez des screenshots si pertinent
6. Mentionnez votre environnement (OS, navigateur, version)

## Proposer des fonctionnalités

Pour proposer une nouvelle fonctionnalité :

1. Utilisez le template de feature request
2. Décrivez clairement le problème résolu
3. Expliquez le comportement souhaité
4. Considérez les alternatives
5. Discutez avec l'équipe avant de commencer l'implémentation

## Licence

En soumettant une contribution, vous acceptez que celle-ci soit sous la même licence que le projet (voir LICENSE). 
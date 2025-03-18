# Documentation de l'API

## Introduction

L'API de Lydia suit les principes REST et utilise JSON pour les échanges de données. Toutes les requêtes doivent être authentifiées via JWT, sauf mention contraire.

## Base URL

```
Development: http://localhost:3001/api/v1
Production: https://api.lydia.ai/v1
```

## Authentication

### Obtenir un token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Réponse :
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Enregistrement

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "companyId": "456"
}
```

## Endpoints

### Utilisateurs

#### Obtenir le profil

```http
GET /users/me
Authorization: Bearer <token>
```

#### Mettre à jour le profil

```http
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com"
}
```

### Appels

#### Initier un appel

```http
POST /calls/initiate
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": "+33612345678",
  "from": "+33687654321",
  "companyId": "456"
}
```

#### Webhook Twilio

```http
POST /calls/webhook
Content-Type: application/xml

<Response>
  <Gather input="speech" language="fr-FR">
    <Say voice="Polly.Léa">Comment puis-je vous aider ?</Say>
  </Gather>
</Response>
```

### IA

#### Générer une réponse

```http
POST /ai/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "input": "Comment puis-je vous aider ?",
  "context": {
    "previousMessages": [],
    "userInfo": {}
  }
}
```

#### Analyser le sentiment

```http
POST /ai/sentiment
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Je suis très satisfait du service"
}
```

### Entreprises

#### Créer une entreprise

```http
POST /companies
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Ma Société",
  "description": "Description de la société",
  "settings": {
    "aiModel": "gpt-4",
    "language": "fr",
    "voiceType": "female"
  }
}
```

#### Obtenir les configurations

```http
GET /companies/{id}/config
Authorization: Bearer <token>
```

## Modèles de données

### User
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyId?: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}
```

### Company
```typescript
interface Company {
  id: string;
  name: string;
  description?: string;
  settings: {
    aiModel: string;
    language: string;
    voiceType: string;
    welcomeMessage?: string;
    transferThreshold?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Call
```typescript
interface Call {
  id: string;
  userId: string;
  companyId: string;
  from: string;
  to: string;
  status: 'initiated' | 'in-progress' | 'completed' | 'failed';
  duration?: number;
  recording?: string;
  transcript?: string;
  sentiment?: {
    score: number;
    label: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## Gestion des erreurs

L'API utilise les codes HTTP standards et retourne des erreurs au format suivant :

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email invalide",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
```

### Codes d'erreur communs

- `400` : Requête invalide
- `401` : Non authentifié
- `403` : Non autorisé
- `404` : Ressource non trouvée
- `422` : Erreur de validation
- `429` : Trop de requêtes
- `500` : Erreur serveur

## Rate Limiting

- API publique : 100 requêtes/heure
- API authentifiée : 1000 requêtes/heure
- Endpoints IA : 50 requêtes/minute

## Webhooks

### Configuration

Les webhooks doivent être configurés dans le panneau d'administration avec :
- URL de callback
- Secret pour la signature
- Événements à recevoir

### Format des événements

```json
{
  "id": "evt_123",
  "type": "call.completed",
  "created": "2024-03-17T12:00:00Z",
  "data": {
    "callId": "call_123",
    "duration": 120,
    "transcript": "..."
  }
}
```

### Vérification de signature

```javascript
const signature = req.headers['x-lydia-signature'];
const isValid = verifySignature(payload, signature, webhookSecret);
```

## Environnements

- **Development** : `http://localhost:3001/api/v1`
- **Staging** : `https://staging-api.lydia.ai/v1`
- **Production** : `https://api.lydia.ai/v1`

## Versions

L'API est versionnée via l'URL. La version actuelle est `v1`. Les changements majeurs seront introduits dans de nouvelles versions. 
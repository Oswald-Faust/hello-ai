# Documentation des Routes API - Administration

## Authentification

### Connexion
- **URL**: `/api/auth/login`
- **Méthode**: `POST`
- **Corps**:
  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```
- **Réponse réussie**:
  ```json
  {
    "success": true,
    "message": "Connexion réussie",
    "data": {
      "token": "jwt_token_here",
      "user": {
        "id": "user_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "admin@example.com",
        "role": "admin"
      }
    }
  }
  ```

## Routes pour le Tableau de Bord Administrateur

### Obtenir les statistiques du tableau de bord
- **URL**: `/api/admin/dashboard/stats`
- **Méthode**: `GET`
- **Authentification**: Requise (Admin)
- **Réponse réussie**:
  ```json
  {
    "success": true,
    "message": "Statistiques du tableau de bord administrateur récupérées avec succès",
    "data": {
      "userStats": {
        "total": 100,
        "active": 85,
        "admin": 5
      },
      "companyStats": {
        "total": 25,
        "active": 20
      },
      "callStats": {
        "total": 5000,
        "last30Days": 1200
      },
      "recentActivities": [
        {
          "type": "user_created",
          "date": "2023-11-20T14:56:29.942Z",
          "data": {
            "id": "user_id",
            "name": "John Doe",
            "email": "john@example.com",
            "company": "Acme Inc."
          }
        }
      ]
    }
  }
  ```

### Obtenir les statistiques système
- **URL**: `/api/admin/system/stats`
- **Méthode**: `GET`
- **Authentification**: Requise (Admin)
- **Réponse réussie**:
  ```json
  {
    "success": true,
    "message": "Statistiques système récupérées avec succès",
    "data": {
      "uptime": 12345.67,
      "memoryUsage": {
        "rss": 150,
        "heapTotal": 70,
        "heapUsed": 65,
        "external": 10
      },
      "nodeVersion": "v16.14.0",
      "environment": {
        "nodeEnv": "production",
        "platform": "linux",
        "arch": "x64"
      }
    }
  }
  ```

### Obtenir les logs système
- **URL**: `/api/admin/system/logs`
- **Méthode**: `GET`
- **Authentification**: Requise (Admin)
- **Paramètres de requête**:
  - `page`: Numéro de page (défaut: 1)
  - `limit`: Nombre de logs par page (défaut: 10)
- **Réponse réussie**:
  ```json
  {
    "success": true,
    "message": "Logs système récupérés avec succès",
    "data": {
      "logs": [
        {
          "level": "info",
          "timestamp": "2023-11-20T14:56:29.942Z",
          "message": "Démarrage du serveur",
          "service": "server"
        }
      ],
      "pagination": {
        "total": 100,
        "page": 1,
        "limit": 10,
        "pages": 10
      }
    }
  }
  ```

## Routes pour la Gestion des Utilisateurs

### Obtenir tous les utilisateurs
- **URL**: `/api/users`
- **Méthode**: `GET`
- **Authentification**: Requise (Admin)
- **Paramètres de requête**:
  - `page`: Numéro de page (défaut: 1)
  - `limit`: Nombre d'utilisateurs par page (défaut: 10)
  - `search`: Recherche par nom ou email
  - `companyId`: Filtrer par entreprise
- **Réponse réussie**:
  ```json
  {
    "success": true,
    "message": "Utilisateurs récupérés avec succès",
    "data": {
      "users": [],
      "totalPages": 5,
      "currentPage": 1,
      "totalUsers": 50
    }
  }
  ```

### Créer un utilisateur
- **URL**: `/api/users`
- **Méthode**: `POST`
- **Authentification**: Requise (Admin)
- **Corps**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user",
    "companyId": "company_id"
  }
  ```
- **Réponse réussie**:
  ```json
  {
    "success": true,
    "message": "Utilisateur créé avec succès",
    "data": {
      "user": {
        "id": "user_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "role": "user"
      }
    }
  }
  ```

### Mettre à jour le statut d'un utilisateur
- **URL**: `/api/users/:userId/status`
- **Méthode**: `PATCH`
- **Authentification**: Requise (Admin)
- **Corps**:
  ```json
  {
    "isActive": true
  }
  ```
- **Réponse réussie**:
  ```json
  {
    "success": true,
    "message": "Statut de l'utilisateur mis à jour avec succès",
    "data": {
      "user": {
        "id": "user_id",
        "isActive": true
      }
    }
  }
  ```

### Mettre à jour le rôle d'un utilisateur
- **URL**: `/api/users/:userId/role`
- **Méthode**: `PATCH`
- **Authentification**: Requise (Admin)
- **Corps**:
  ```json
  {
    "role": "admin"
  }
  ```
- **Réponse réussie**:
  ```json
  {
    "success": true,
    "message": "Rôle de l'utilisateur mis à jour avec succès",
    "data": {
      "user": {
        "id": "user_id",
        "role": "admin"
      }
    }
  }
  ```

### Obtenir les statistiques utilisateurs
- **URL**: `/api/users/stats`
- **Méthode**: `GET`
- **Authentification**: Requise (Admin)
- **Réponse réussie**:
  ```json
  {
    "success": true,
    "message": "Statistiques utilisateurs récupérées avec succès",
    "data": {
      "total": 100,
      "active": 85,
      "inactive": 15,
      "admin": 5,
      "growthByMonth": [
        {
          "period": "2023-06",
          "count": 10
        }
      ]
    }
  }
  ```

## Routes pour la Gestion des Entreprises

### Obtenir toutes les entreprises
- **URL**: `/api/companies`
- **Méthode**: `GET`
- **Authentification**: Requise (Admin)
- **Paramètres de requête**:
  - `page`: Numéro de page (défaut: 1)
  - `limit`: Nombre d'entreprises par page (défaut: 10)
  - `search`: Recherche par nom
- **Réponse réussie**:
  ```json
  {
    "success": true,
    "message": "Entreprises récupérées avec succès",
    "data": {
      "companies": [],
      "totalPages": 3,
      "currentPage": 1,
      "totalCompanies": 25
    }
  }
  ```

### Créer une entreprise
- **URL**: `/api/companies`
- **Méthode**: `POST`
- **Authentification**: Requise (Admin)
- **Corps**:
  ```json
  {
    "name": "Acme Inc.",
    "email": "contact@acme.com",
    "phone": "+33123456789",
    "address": {
      "street": "123 Main St",
      "city": "Paris",
      "postalCode": "75001",
      "country": "France"
    }
  }
  ```
- **Réponse réussie**:
  ```json
  {
    "success": true,
    "message": "Entreprise créée avec succès",
    "data": {
      "company": {
        "id": "company_id",
        "name": "Acme Inc.",
        "email": "contact@acme.com"
      }
    }
  }
  ```

### Obtenir les statistiques des entreprises
- **URL**: `/api/companies/stats`
- **Méthode**: `GET`
- **Authentification**: Requise (Admin)
- **Réponse réussie**:
  ```json
  {
    "success": true,
    "message": "Statistiques des entreprises récupérées avec succès",
    "data": {
      "totalCompanies": 25,
      "activeCompanies": 20,
      "companiesGrowth": [
        {
          "period": "2023-06",
          "count": 3
        }
      ],
      "topCompaniesByUsers": [
        {
          "_id": "company_id",
          "name": "Acme Inc.",
          "userCount": 15
        }
      ]
    }
  }
  ```

### Mettre à jour les paramètres d'une entreprise
- **URL**: `/api/companies/:companyId/settings`
- **Méthode**: `PATCH`
- **Authentification**: Requise (Admin)
- **Corps**:
  ```json
  {
    "settings": {
      "theme": "dark",
      "notifications": {
        "email": true,
        "sms": false
      }
    }
  }
  ```
- **Réponse réussie**:
  ```json
  {
    "success": true,
    "message": "Paramètres de l'entreprise mis à jour avec succès",
    "data": {
      "company": {
        "id": "company_id",
        "name": "Acme Inc.",
        "settings": {
          "theme": "dark",
          "notifications": {
            "email": true,
            "sms": false
          }
        }
      }
    }
  }
  ``` 
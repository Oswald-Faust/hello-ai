# Guide de configuration de Twilio pour Lydia

Ce guide vous explique comment configurer Twilio pour votre assistant vocal Lydia.

## Prérequis

1. Un compte Twilio (vous pouvez créer un compte d'essai sur [twilio.com](https://www.twilio.com))
2. Votre serveur Lydia opérationnel
3. Une URL publique accessible par Internet pour votre serveur (en utilisant par exemple Ngrok)

## Configuration de l'environnement

### 1. Obtenir vos identifiants Twilio

1. Connectez-vous à votre compte Twilio
2. Accédez à la [console Twilio](https://www.twilio.com/console)
3. Copiez votre **Account SID** et votre **Auth Token**

### 2. Configurer les variables d'environnement

Dans le fichier `.env` de votre backend, ajoutez ou modifiez les variables suivantes:

```
TWILIO_ACCOUNT_SID=votre_account_sid
TWILIO_AUTH_TOKEN=votre_auth_token
API_BASE_URL=https://votre-url-publique.ngrok.io
```

### 3. Exposer votre serveur avec Ngrok

Pour les tests locaux, vous pouvez utiliser Ngrok pour exposer votre serveur:

```bash
cd backend
./scripts/start-with-ngrok.sh
```

## Achat et configuration d'un numéro de téléphone

### Utilisation de l'API

Pour acheter un numéro via l'API, envoyez une requête POST:

```
POST /api/companies/{companyId}/phone-number
```

Avec le corps de la requête:

```json
{
  "provider": "twilio",
  "country": "FR",
  "areaCode": "1",
  "enableRecording": true
}
```

### Vérification de la configuration

Une fois le numéro acheté, vous pouvez vérifier sa configuration sur la [console Twilio](https://www.twilio.com/console/phone-numbers/incoming). Pour chaque numéro, vous devriez voir:

1. **Voice & Fax** configuré avec l'URL webhook: `https://votre-url.ngrok.io/api/calls/incoming/{companyId}?provider=twilio`
2. **Status Callback URL** configuré avec l'URL: `https://votre-url.ngrok.io/api/calls/twilio-status`
3. **Call Recording** activé avec l'URL de callback: `https://votre-url.ngrok.io/api/calls/recording-status/{companyId}`

## Test du système

### 1. Appel entrant

Appelez le numéro de téléphone que vous avez acheté. Vous devriez entendre le message d'accueil de Lydia.

### 2. Vérification des logs

Vérifiez les logs du serveur pour vous assurer que:
- Les webhooks sont correctement appelés
- Les notifications de statut sont reçues
- Les enregistrements sont correctement traités

## Résolution des problèmes

### Le webhook n'est pas appelé

1. Vérifiez que votre URL est accessible publiquement
2. Vérifiez que les paramètres du webhook sont correctement configurés dans Twilio
3. Consultez les logs de débogage Twilio dans la console

### Erreur lors de l'achat du numéro

1. Vérifiez que votre compte Twilio est actif et dispose de fonds suffisants
2. Vérifiez que le pays et le code régional spécifiés sont disponibles

## Ressources supplémentaires

- [Documentation Twilio TwiML](https://www.twilio.com/docs/voice/twiml)
- [Documentation Twilio Voice API](https://www.twilio.com/docs/voice/api)
- [Guide Ngrok](https://ngrok.com/docs) 
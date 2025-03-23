#!/bin/bash

# Vérifier si ngrok est installé
if ! command -v ngrok &> /dev/null; then
    echo "ngrok n'est pas installé. Installation..."
    npm install -g ngrok
fi

# Démarrer le serveur backend en arrière-plan
echo "Démarrage du serveur backend..."
npm start &
SERVER_PID=$!

# Attendre que le serveur soit prêt
echo "Attente du démarrage du serveur..."
sleep 5

# Démarrer ngrok pour exposer le port 3001
echo "Démarrage de ngrok..."
NGROK_URL=$(ngrok http 3001 --log=stdout | grep -o 'https://.*\.ngrok\.io' | head -n 1)

# Mettre à jour le fichier .env avec l'URL ngrok
if [ ! -z "$NGROK_URL" ]; then
    echo "URL Ngrok générée: $NGROK_URL"
    sed -i '' "s|API_BASE_URL=.*|API_BASE_URL=$NGROK_URL|g" .env
    echo "Fichier .env mis à jour avec l'URL Ngrok"
else
    echo "Impossible d'obtenir l'URL Ngrok. Veuillez vérifier manuellement."
fi

# Attendre que l'utilisateur arrête le processus
echo "Serveur en cours d'exécution. Appuyez sur Ctrl+C pour arrêter..."
wait $SERVER_PID 
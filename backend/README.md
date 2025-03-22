# Backend API

## Installation de Vosk pour la reconnaissance vocale

Cette application utilise Vosk pour la reconnaissance vocale en français. Voici comment l'installer :

### Prérequis

1. Python 3.6 ou supérieur
2. pip (gestionnaire de paquets Python)
3. FFmpeg (pour la conversion audio)

### Installation des dépendances Python

```bash
# Installer vosk via pip
pip install vosk

# Ou, si vous utilisez pip3
pip3 install vosk
```

### Installation de FFmpeg

#### macOS
```bash
brew install ffmpeg
```

#### Linux (Debian/Ubuntu)
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

#### Windows
Téléchargez FFmpeg depuis le site officiel https://ffmpeg.org/download.html et ajoutez-le à votre PATH.

### Téléchargement automatique du modèle Vosk

Le modèle français sera téléchargé automatiquement lors de l'installation des dépendances Node.js :

```bash
npm install
```

Ou vous pouvez le télécharger manuellement :

```bash
npm run setup-vosk
```

Le modèle sera téléchargé et installé dans le répertoire `models/vosk-model-fr`.

## Configuration

Assurez-vous que votre fichier `.env` contient les bonnes variables d'environnement :

```
VOSK_MODEL_DIR=models/vosk-model-fr
``` 
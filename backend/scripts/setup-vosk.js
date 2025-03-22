#!/usr/bin/env node

/**
 * Script pour télécharger et installer le modèle Vosk en français
 * Ce script permet d'installer le modèle de reconnaissance vocale Vosk pour le français
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');
const readline = require('readline');

const MODEL_URL = 'https://alphacephei.com/vosk/models/vosk-model-small-fr-0.22.zip';
const MODEL_DIR = path.join(__dirname, '../models');
const MODEL_PATH = path.join(MODEL_DIR, 'vosk-model-fr');
const ZIP_PATH = path.join(MODEL_DIR, 'vosk-model-fr.zip');

// Créer le répertoire models s'il n'existe pas
if (!fs.existsSync(MODEL_DIR)) {
  console.log('Création du répertoire models...');
  fs.mkdirSync(MODEL_DIR, { recursive: true });
}

// Vérifier si le modèle est déjà installé
if (fs.existsSync(MODEL_PATH)) {
  console.log('Le modèle Vosk français est déjà installé.');
  process.exit(0);
}

console.log('Installation du modèle Vosk français...');
console.log('Cette opération peut prendre plusieurs minutes selon votre connexion internet.');

// Fonction pour télécharger le fichier
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    console.log(`Téléchargement du modèle depuis ${url}...`);
    
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Échec du téléchargement, code de statut: ${response.statusCode}`));
        return;
      }
      
      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;
      
      // Afficher la progression
      const interval = setInterval(() => {
        const percentage = (downloadedSize / totalSize * 100).toFixed(2);
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`Progression: ${percentage}% (${(downloadedSize / 1024 / 1024).toFixed(2)} Mo / ${(totalSize / 1024 / 1024).toFixed(2)} Mo)`);
      }, 1000);
      
      response.on('data', chunk => {
        downloadedSize += chunk.length;
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        clearInterval(interval);
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        console.log(`Téléchargement terminé: ${(totalSize / 1024 / 1024).toFixed(2)} Mo`);
        file.close(resolve);
      });
      
      file.on('error', err => {
        clearInterval(interval);
        fs.unlink(dest, () => {});
        reject(err);
      });
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Fonction pour extraire le fichier ZIP
function extractZip(zipPath, destDir) {
  return new Promise((resolve, reject) => {
    console.log('Extraction du modèle...');
    
    // Vérifier si unzip est disponible
    exec('unzip -v', (error) => {
      if (error) {
        console.log('La commande unzip n\'est pas disponible, tentative avec l\'API Node.js...');
        
        // Si unzip n'est pas disponible, essayer une autre méthode (par exemple avec AdmZip)
        try {
          const AdmZip = require('adm-zip');
          const zip = new AdmZip(zipPath);
          zip.extractAllTo(destDir, true);
          resolve();
        } catch (zipError) {
          reject(new Error(`Impossible d'extraire le fichier ZIP: ${zipError.message}. Veuillez installer unzip ou adm-zip.`));
        }
      } else {
        // Utiliser unzip
        exec(`unzip -o "${zipPath}" -d "${destDir}"`, (err, stdout, stderr) => {
          if (err) {
            reject(new Error(`Échec de l'extraction: ${err.message}`));
          } else {
            console.log('Extraction terminée.');
            
            // Renommer le dossier extrait si nécessaire
            const extractedDir = path.join(destDir, 'vosk-model-small-fr-0.22');
            if (fs.existsSync(extractedDir)) {
              fs.renameSync(extractedDir, MODEL_PATH);
            }
            
            resolve();
          }
        });
      }
    });
  });
}

// Fonction principale
async function setup() {
  try {
    // Télécharger le modèle
    await downloadFile(MODEL_URL, ZIP_PATH);
    
    // Extraire le modèle
    await extractZip(ZIP_PATH, MODEL_DIR);
    
    // Nettoyer (supprimer le fichier ZIP)
    fs.unlinkSync(ZIP_PATH);
    
    console.log('Installation du modèle Vosk français terminée avec succès !');
    console.log(`Le modèle est installé dans: ${MODEL_PATH}`);
    
  } catch (error) {
    console.error(`Erreur lors de l'installation: ${error.message}`);
    process.exit(1);
  }
}

// Exécuter le script
setup(); 
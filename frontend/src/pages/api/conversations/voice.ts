import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false, // Désactiver le parsing du corps car nous utilisons formidable
  },
};

/**
 * API pour gérer les conversations vocales avec l'assistant
 * 
 * POST /api/conversations/voice - Envoie un fichier audio pour le traitement
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  try {
    console.log('[API VOICE] Démarrage du traitement de la requête');
    
    // Configurer formidable avec des options
    const formOptions = {
      maxFileSize: 50 * 1024 * 1024, // 50 MB
      keepExtensions: true,
    };
    
    const form = formidable(formOptions);
    
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('[API VOICE] Erreur lors du parsing du formulaire:', err);
        return res.status(500).json({ success: false, message: 'Erreur lors du traitement du fichier' });
      }
      
      try {
        console.log('[API VOICE] Formulaire parsé avec succès');
        
        // Récupérer le fichier audio (formidable peut retourner un tableau)
        const audioFiles = files.audio;
        if (!audioFiles) {
          console.error('[API VOICE] Aucun fichier audio trouvé dans la requête');
          return res.status(400).json({ success: false, message: 'Aucun fichier audio fourni' });
        }
        
        // Vérifier si audioFiles est un tableau ou un objet simple
        const audioFile = Array.isArray(audioFiles) ? audioFiles[0] : audioFiles;
        
        console.log('[API VOICE] Fichier audio reçu:', audioFile.filepath, 'Taille:', audioFile.size, 'bytes');
        
        if (audioFile.size === 0) {
          console.error('[API VOICE] Le fichier audio est vide');
          return res.status(400).json({ success: false, message: 'Le fichier audio est vide' });
        }
        
        // Vérifier que le fichier existe
        if (!fs.existsSync(audioFile.filepath)) {
          console.error('[API VOICE] Le fichier audio n\'existe pas sur le disque');
          return res.status(400).json({ success: false, message: 'Le fichier audio n\'existe pas' });
        }
        
        // Construire l'URL API backend
        let apiUrl;
        
        // Vérifier si on utilise un serveur backend séparé
        if (process.env.NEXT_PUBLIC_API_URL) {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL.endsWith('/') 
            ? process.env.NEXT_PUBLIC_API_URL.slice(0, -1) 
            : process.env.NEXT_PUBLIC_API_URL;
          
          apiUrl = `${baseUrl}/speech/conversation`;
        } else {
          // Pour le développement local, utiliser le proxy API de Next.js
          apiUrl = `/api/speech/conversation`;
        }
        
        console.log('[API VOICE] Envoi de l\'audio au backend:', apiUrl);
        
        // Créer un nouveau FormData pour l'envoi au backend
        const formData = new FormData();
        
        try {
          // Ajouter le fichier audio au FormData
          formData.append('audio', fs.createReadStream(audioFile.filepath), {
            filename: path.basename(audioFile.filepath),
            contentType: audioFile.mimetype || 'audio/webm'
          });
          
          console.log('[API VOICE] Fichier audio ajouté au FormData');
          
          // Ajouter les autres champs (company, history, etc.)
          if (fields.company) {
            const companyValue = Array.isArray(fields.company) ? fields.company[0] : fields.company;
            formData.append('company', companyValue);
          }
          
          if (fields.history) {
            const historyValue = Array.isArray(fields.history) ? fields.history[0] : fields.history;
            formData.append('history', historyValue);
          }
          
          if (fields.conversationId) {
            const conversationIdValue = Array.isArray(fields.conversationId) ? fields.conversationId[0] : fields.conversationId;
            formData.append('conversationId', conversationIdValue);
          }
          
          console.log('[API VOICE] Envoi de la requête au backend...');
          
          // Envoyer la requête au backend avec le FormData
          const response = await axios.post(apiUrl, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 60000 // 60 secondes de timeout
          });
          
          console.log('[API VOICE] Réponse du backend reçue:', response.status);
          
          // Nettoyer le fichier temporaire
          fs.unlink(audioFile.filepath, (unlinkErr) => {
            if (unlinkErr) {
              console.warn('[API VOICE] Erreur lors de la suppression du fichier temporaire:', unlinkErr);
            }
          });
          
          return res.status(200).json(response.data);
        } catch (uploadError: any) {
          console.error('[API VOICE] Erreur lors de l\'envoi au backend:', uploadError.message);
          console.error('[API VOICE] Détails:', uploadError.response?.data || 'Pas de détails disponibles');
          
          // Nettoyer le fichier temporaire en cas d'erreur
          fs.unlink(audioFile.filepath, (unlinkErr) => {
            if (unlinkErr) {
              console.warn('[API VOICE] Erreur lors de la suppression du fichier temporaire:', unlinkErr);
            }
          });
          
          return res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi au backend',
            error: uploadError.message,
            details: uploadError.response?.data
          });
        }
      } catch (processingError: any) {
        console.error('[API VOICE] Erreur lors du traitement du fichier:', processingError);
        
        // Tenter de nettoyer les fichiers temporaires si possible
        if (files.audio) {
          const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;
          if (audioFile?.filepath && fs.existsSync(audioFile.filepath)) {
            fs.unlink(audioFile.filepath, () => {});
          }
        }
        
        return res.status(500).json({
          success: false,
          message: 'Erreur lors du traitement de l\'audio',
          error: processingError.message
        });
      }
    });
  } catch (globalError: any) {
    console.error('[API VOICE] Erreur globale:', globalError);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: globalError.message
    });
  }
} 
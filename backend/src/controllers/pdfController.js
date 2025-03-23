const logger = require('../utils/logger');
const pdfService = require('../services/pdfService');
const ConversationConfig = require('../models/ConversationConfig');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration de Multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = process.env.PDF_UPLOAD_DIR || path.join(__dirname, '../../uploads/temp');
    
    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Générer un nom temporaire unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'temp-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtre pour autoriser uniquement les PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
  }
};

// Initialiser le middleware Multer
const upload = multer({ 
  storage, 
  fileFilter,
  limits: { 
    fileSize: (parseInt(process.env.MAX_PDF_SIZE_MB || '10', 10)) * 1024 * 1024 // 10MB par défaut
  }
}).single('pdf');

/**
 * Middleware pour gérer les erreurs d'upload
 */
const handleUploadErrors = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Erreur Multer lors de l'upload
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: `La taille du fichier dépasse la limite autorisée de ${process.env.MAX_PDF_SIZE_MB || '10'}MB`
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      // Erreur inconnue
      return res.status(400).json({ success: false, message: err.message });
    }
    // Si pas d'erreur, passer au contrôleur suivant
    next();
  });
};

/**
 * Télécharger un PDF et l'associer à une configuration de conversation
 */
const uploadPdf = async (req, res) => {
  try {
    // Vérifier si un fichier a été téléchargé
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier PDF n\'a été fourni' });
    }
    
    // Récupérer l'ID de la configuration de conversation
    const { configId } = req.params;
    
    if (!configId) {
      return res.status(400).json({ success: false, message: 'ID de configuration manquant' });
    }
    
    // Sauvegarder le PDF
    const savedPdf = await pdfService.savePdfFile(req.file);
    
    // Récupérer la configuration de conversation
    const config = await ConversationConfig.findById(configId);
    
    if (!config) {
      // Supprimer le fichier PDF si la configuration n'existe pas
      await pdfService.deletePdfFile(savedPdf.fileName);
      return res.status(404).json({ success: false, message: 'Configuration de conversation non trouvée' });
    }
    
    // Extraire le contenu du PDF pour obtenir un résumé
    const pdfSummary = await pdfService.generatePdfSummary(savedPdf.fileName);
    
    // Préparer la référence PDF
    const pdfReference = {
      fileName: savedPdf.fileName,
      originalName: savedPdf.originalName,
      title: req.body.title || savedPdf.originalName,
      description: req.body.description || '',
      uploadDate: new Date(),
      fileSize: savedPdf.fileSize,
      metadata: savedPdf.metadata,
      summary: pdfSummary.substring(0, 500)
    };
    
    // Ajouter la référence PDF à la configuration
    if (!config.documents) {
      config.documents = [];
    }
    
    config.documents.push(pdfReference);
    
    // Sauvegarder la configuration mise à jour
    await config.save();
    
    logger.info(`PDF ${savedPdf.originalName} téléchargé et associé à la configuration ${config.name}`);
    
    // Renvoyer les informations du PDF sauvegardé
    return res.status(200).json({
      success: true,
      message: 'PDF téléchargé avec succès',
      pdf: {
        id: config.documents[config.documents.length - 1]._id,
        fileName: savedPdf.fileName,
        title: pdfReference.title,
        description: pdfReference.description,
        fileSize: savedPdf.fileSize,
        uploadDate: pdfReference.uploadDate,
        pageCount: savedPdf.metadata.pageCount
      }
    });
  } catch (error) {
    logger.error(`Erreur lors de l'upload du PDF: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Récupérer un PDF spécifique
 */
const getPdf = async (req, res) => {
  try {
    const { configId, pdfId } = req.params;
    
    if (!configId || !pdfId) {
      return res.status(400).json({ success: false, message: 'Paramètres manquants' });
    }
    
    // Récupérer la configuration
    const config = await ConversationConfig.findById(configId);
    
    if (!config) {
      return res.status(404).json({ success: false, message: 'Configuration non trouvée' });
    }
    
    // Trouver le PDF dans la configuration
    const pdf = config.documents.id(pdfId);
    
    if (!pdf) {
      return res.status(404).json({ success: false, message: 'PDF non trouvé' });
    }
    
    // Récupérer le contenu du PDF
    const pdfBuffer = await pdfService.getPdfFile(pdf.fileName);
    
    // Définir les en-têtes de réponse
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdf.originalName}"`);
    
    // Envoyer le fichier
    return res.send(pdfBuffer);
  } catch (error) {
    logger.error(`Erreur lors de la récupération du PDF: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Supprimer un PDF d'une configuration
 */
const deletePdf = async (req, res) => {
  try {
    const { configId, pdfId } = req.params;
    
    if (!configId || !pdfId) {
      return res.status(400).json({ success: false, message: 'Paramètres manquants' });
    }
    
    // Récupérer la configuration
    const config = await ConversationConfig.findById(configId);
    
    if (!config) {
      return res.status(404).json({ success: false, message: 'Configuration non trouvée' });
    }
    
    // Trouver le PDF dans la configuration
    const pdf = config.documents.id(pdfId);
    
    if (!pdf) {
      return res.status(404).json({ success: false, message: 'PDF non trouvé' });
    }
    
    // Sauvegarder le nom du fichier pour la suppression
    const fileName = pdf.fileName;
    
    // Supprimer la référence du PDF de la configuration
    pdf.remove();
    
    // Sauvegarder la configuration
    await config.save();
    
    // Supprimer le fichier physique
    const fileDeleted = await pdfService.deletePdfFile(fileName);
    
    logger.info(`PDF ${fileName} supprimé de la configuration ${config.name}`);
    
    return res.status(200).json({
      success: true,
      message: 'PDF supprimé avec succès',
      fileDeleted
    });
  } catch (error) {
    logger.error(`Erreur lors de la suppression du PDF: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Obtenir le contenu textuel d'un PDF
 */
const getPdfContent = async (req, res) => {
  try {
    const { configId, pdfId } = req.params;
    
    if (!configId || !pdfId) {
      return res.status(400).json({ success: false, message: 'Paramètres manquants' });
    }
    
    // Récupérer la configuration
    const config = await ConversationConfig.findById(configId);
    
    if (!config) {
      return res.status(404).json({ success: false, message: 'Configuration non trouvée' });
    }
    
    // Trouver le PDF dans la configuration
    const pdf = config.documents.id(pdfId);
    
    if (!pdf) {
      return res.status(404).json({ success: false, message: 'PDF non trouvé' });
    }
    
    // Extraire le contenu du PDF
    const pdfContent = await pdfService.extractPdfContent(pdf.fileName);
    
    return res.status(200).json({
      success: true,
      content: pdfContent
    });
  } catch (error) {
    logger.error(`Erreur lors de l'extraction du contenu du PDF: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Lister tous les PDFs d'une configuration
 */
const listPdfs = async (req, res) => {
  try {
    const { configId } = req.params;
    
    if (!configId) {
      return res.status(400).json({ success: false, message: 'ID de configuration manquant' });
    }
    
    // Récupérer la configuration
    const config = await ConversationConfig.findById(configId);
    
    if (!config) {
      return res.status(404).json({ success: false, message: 'Configuration non trouvée' });
    }
    
    // Extraire et formater les informations des PDFs
    const pdfs = config.documents.map(doc => ({
      id: doc._id,
      fileName: doc.fileName,
      title: doc.title,
      description: doc.description,
      originalName: doc.originalName,
      uploadDate: doc.uploadDate,
      fileSize: doc.fileSize,
      pageCount: doc.metadata?.pageCount
    }));
    
    return res.status(200).json({
      success: true,
      pdfs
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération des PDFs: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  handleUploadErrors,
  uploadPdf,
  getPdf,
  deletePdf,
  getPdfContent,
  listPdfs
}; 
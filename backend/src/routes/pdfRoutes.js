const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { authenticate } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Route pour lister tous les PDFs d'une configuration
router.get('/config/:configId', pdfController.listPdfs);

// Route pour télécharger un PDF et l'associer à une configuration
router.post('/upload/:configId', pdfController.handleUploadErrors, pdfController.uploadPdf);

// Route pour récupérer un PDF spécifique
router.get('/config/:configId/pdf/:pdfId', pdfController.getPdf);

// Route pour supprimer un PDF
router.delete('/config/:configId/pdf/:pdfId', pdfController.deletePdf);

// Route pour obtenir le contenu textuel d'un PDF
router.get('/content/:configId/pdf/:pdfId', pdfController.getPdfContent);

module.exports = router; 
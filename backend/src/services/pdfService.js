const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const pdf = require('pdf-parse');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Configuration
const UPLOAD_DIR = process.env.PDF_UPLOAD_DIR || path.join(__dirname, '../../uploads/pdfs');
const MAX_PDF_SIZE_MB = parseInt(process.env.MAX_PDF_SIZE_MB || '10', 10);
const MAX_PDF_SIZE = MAX_PDF_SIZE_MB * 1024 * 1024; // convertir en octets
const CHUNK_SIZE = parseInt(process.env.PDF_CHUNK_SIZE || '1000', 10); // taille des chunks en caractères

/**
 * Assurer que le répertoire d'upload existe
 */
const ensureUploadDirExists = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    logger.info(`Répertoire d'upload pour les PDFs créé: ${UPLOAD_DIR}`);
  }
};

// Créer le répertoire d'upload s'il n'existe pas
ensureUploadDirExists();

/**
 * Sauvegarder un fichier PDF téléchargé
 * @param {Object} file - Fichier téléchargé (req.file de multer)
 * @returns {Promise<Object>} - Informations sur le fichier sauvegardé
 */
const savePdfFile = async (file) => {
  try {
    // Vérifier si le fichier existe
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }
    
    // Vérifier le type de fichier
    if (file.mimetype !== 'application/pdf') {
      throw new Error('Le fichier doit être un PDF');
    }
    
    // Vérifier la taille du fichier
    if (file.size > MAX_PDF_SIZE) {
      throw new Error(`La taille du fichier dépasse la limite de ${MAX_PDF_SIZE_MB}MB`);
    }
    
    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const uniqueId = uuidv4();
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const baseFileName = path.basename(originalName, extension);
    const sanitizedName = baseFileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${sanitizedName}_${timestamp}_${uniqueId}.pdf`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    // Créer une copie du fichier dans le répertoire d'upload
    await fs.promises.copyFile(file.path, filePath);
    
    // Extraire les métadonnées du PDF
    const pdfMeta = await extractPdfMetadata(filePath);
    
    // Renvoyer les informations sur le fichier sauvegardé
    return {
      originalName,
      fileName,
      fileSize: file.size,
      filePath,
      uploadTimestamp: timestamp,
      metadata: pdfMeta
    };
  } catch (error) {
    logger.error(`Erreur lors de la sauvegarde du fichier PDF: ${error.message}`);
    throw error;
  }
};

/**
 * Extraire les métadonnées d'un fichier PDF
 * @param {string} filePath - Chemin du fichier PDF
 * @returns {Promise<Object>} - Métadonnées du PDF
 */
const extractPdfMetadata = async (filePath) => {
  try {
    // Lire le fichier PDF
    const dataBuffer = await fs.promises.readFile(filePath);
    
    // Extraire les métadonnées
    const pdfData = await pdf(dataBuffer);
    
    // Charger le document avec pdf-lib pour extraire plus d'informations
    const pdfDoc = await PDFDocument.load(dataBuffer);
    
    return {
      pageCount: pdfData.numpages,
      title: pdfDoc.getTitle() || path.basename(filePath),
      author: pdfDoc.getAuthor() || 'Non spécifié',
      creationDate: pdfDoc.getCreationDate() || new Date(),
      modificationDate: pdfDoc.getModificationDate() || new Date(),
      textLength: pdfData.text.length
    };
  } catch (error) {
    logger.error(`Erreur lors de l'extraction des métadonnées du PDF: ${error.message}`);
    return {
      pageCount: 0,
      title: path.basename(filePath),
      author: 'Erreur',
      creationDate: new Date(),
      modificationDate: new Date(),
      error: error.message
    };
  }
};

/**
 * Récupérer un fichier PDF par son nom de fichier
 * @param {string} fileName - Nom du fichier PDF
 * @returns {Promise<Buffer>} - Contenu du fichier PDF
 */
const getPdfFile = async (fileName) => {
  try {
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fichier non trouvé: ${fileName}`);
    }
    
    // Lire et renvoyer le contenu du fichier
    return await fs.promises.readFile(filePath);
  } catch (error) {
    logger.error(`Erreur lors de la récupération du fichier PDF: ${error.message}`);
    throw error;
  }
};

/**
 * Supprimer un fichier PDF
 * @param {string} fileName - Nom du fichier PDF
 * @returns {Promise<boolean>} - true si la suppression a réussi
 */
const deletePdfFile = async (fileName) => {
  try {
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      logger.warn(`Tentative de suppression d'un fichier inexistant: ${fileName}`);
      return false;
    }
    
    // Supprimer le fichier
    await fs.promises.unlink(filePath);
    logger.info(`Fichier PDF supprimé: ${fileName}`);
    
    return true;
  } catch (error) {
    logger.error(`Erreur lors de la suppression du fichier PDF: ${error.message}`);
    throw error;
  }
};

/**
 * Extraire le contenu textuel d'un fichier PDF
 * @param {string} fileName - Nom du fichier PDF
 * @returns {Promise<Object>} - Contenu textuel du PDF
 */
const extractPdfContent = async (fileName) => {
  try {
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fichier non trouvé: ${fileName}`);
    }
    
    // Lire le fichier PDF
    const dataBuffer = await fs.promises.readFile(filePath);
    const pdfData = await pdf(dataBuffer);
    
    // Extraire le texte et diviser en chunks pour une meilleure utilisation avec l'IA
    const rawText = pdfData.text;
    
    // Diviser le texte en paragraphes significatifs
    const paragraphs = rawText
      .split(/\n\s*\n/) // Diviser par lignes vides
      .map(p => p.replace(/\s+/g, ' ').trim()) // Normaliser les espaces
      .filter(p => p.length > 0); // Supprimer les paragraphes vides
    
    // Créer des chunks avec un chevauchement pour assurer la continuité
    const chunks = [];
    let currentChunk = "";
    
    for (const paragraph of paragraphs) {
      // Si le paragraphe est trop long, le diviser
      if (paragraph.length > CHUNK_SIZE) {
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
        
        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length + 1 <= CHUNK_SIZE) {
            currentChunk += (currentChunk ? " " : "") + sentence;
          } else {
            if (currentChunk) {
              chunks.push(currentChunk.trim());
            }
            currentChunk = sentence;
          }
        }
      } else if (currentChunk.length + paragraph.length + 1 <= CHUNK_SIZE) {
        // Ajouter le paragraphe au chunk actuel
        currentChunk += (currentChunk ? "\n" : "") + paragraph;
      } else {
        // Sauvegarder le chunk actuel et commencer un nouveau
        chunks.push(currentChunk.trim());
        currentChunk = paragraph;
      }
    }
    
    // Ajouter le dernier chunk s'il n'est pas vide
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    // Préparer les métadonnées du document
    const documentInfo = await extractPdfMetadata(filePath);
    
    // Renvoyer le contenu structuré
    return {
      documentName: path.basename(filePath, '.pdf'),
      metadata: documentInfo,
      textLength: rawText.length,
      chunkCount: chunks.length,
      data: {
        chunks,
        summary: paragraphs.slice(0, 2).join(' ').substring(0, 500) + (paragraphs.length > 2 ? '...' : '')
      }
    };
  } catch (error) {
    logger.error(`Erreur lors de l'extraction du contenu PDF: ${error.message}`);
    throw error;
  }
};

/**
 * Générer un résumé du contenu PDF
 * @param {string} fileName - Nom du fichier PDF
 * @returns {Promise<string>} - Résumé du contenu
 */
const generatePdfSummary = async (fileName) => {
  try {
    // Extraire d'abord le contenu textuel
    const content = await extractPdfContent(fileName);
    
    // Si le contenu est petit, renvoyer les premiers paragraphes
    if (content.textLength < 5000) {
      return content.data.summary;
    }
    
    // Pour les documents plus longs, sélectionner des extraits représentatifs
    // Prendre le début, quelques segments du milieu et la fin
    const chunks = content.data.chunks;
    
    const beginning = chunks.slice(0, 1).join('\n');
    
    // Extraire quelques segments du milieu
    const middleStartIndex = Math.floor(chunks.length / 3);
    const middleEndIndex = Math.floor(2 * chunks.length / 3);
    const middle = chunks.slice(middleStartIndex, middleStartIndex + 1)
      .concat(chunks.slice(middleEndIndex, middleEndIndex + 1))
      .join('\n');
    
    // Extraire la fin
    const end = chunks.slice(chunks.length - 1).join('\n');
    
    // Assembler le résumé
    return `Début du document:\n${beginning}\n\nExtraits du milieu:\n${middle}\n\nFin du document:\n${end}`;
  } catch (error) {
    logger.error(`Erreur lors de la génération du résumé: ${error.message}`);
    return `Impossible de générer un résumé pour ce document: ${error.message}`;
  }
};

/**
 * Traiter tous les PDF pour une configuration de conversation
 * @param {Array<Object>} pdfReferences - Références aux fichiers PDF
 * @returns {Promise<Array>} - Données structurées des PDFs
 */
const processPdfDocuments = async (pdfReferences) => {
  if (!pdfReferences || !Array.isArray(pdfReferences) || pdfReferences.length === 0) {
    return [];
  }
  
  try {
    const processedDocs = [];
    
    // Traiter chaque document PDF
    for (const docRef of pdfReferences) {
      try {
        if (!docRef.fileName) {
          logger.warn('Référence PDF incorrecte, fileName manquant:', docRef);
          continue;
        }
        
        // Extraire le contenu du PDF
        const pdfContent = await extractPdfContent(docRef.fileName);
        
        // Ajouter des métadonnées supplémentaires
        pdfContent.reference = {
          id: docRef._id || docRef.id,
          title: docRef.title || pdfContent.documentName
        };
        
        // Ajouter le document traité à la liste
        processedDocs.push(pdfContent);
      } catch (docError) {
        logger.error(`Erreur lors du traitement du document ${docRef.fileName}: ${docError.message}`);
        
        // Ajouter une entrée avec l'erreur pour information
        processedDocs.push({
          documentName: docRef.fileName || 'Document inconnu',
          error: docError.message,
          reference: { id: docRef._id || docRef.id }
        });
      }
    }
    
    return processedDocs;
  } catch (error) {
    logger.error(`Erreur lors du traitement des documents PDF: ${error.message}`);
    throw error;
  }
};

module.exports = {
  savePdfFile,
  getPdfFile,
  deletePdfFile,
  extractPdfContent,
  generatePdfSummary,
  processPdfDocuments
}; 
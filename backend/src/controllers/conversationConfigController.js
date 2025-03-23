const ConversationConfig = require('../models/ConversationConfig');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const mongoose = require('mongoose');

// Configuration pour l'upload de fichiers PDF
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/pdfs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function(req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite à 10MB
  }
});

// Créer une nouvelle configuration
exports.createConfig = async (req, res) => {
  try {
    const newConfig = new ConversationConfig({
      ...req.body,
      companyId: req.user.id
    });
    
    const savedConfig = await newConfig.save();
    res.status(201).json(savedConfig);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Récupérer toutes les configurations d'une entreprise
exports.getAllConfigs = async (req, res) => {
  try {
    const configs = await ConversationConfig.find({ companyId: req.user.id });
    res.status(200).json(configs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les configurations par type de conversation
exports.getConfigsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const configs = await ConversationConfig.find({ 
      companyId: req.user.id,
      conversationType: type
    });
    
    res.status(200).json(configs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les configurations par secteur d'activité
exports.getConfigsByIndustry = async (req, res) => {
  try {
    const { industry } = req.params;
    const configs = await ConversationConfig.find({ 
      companyId: req.user.id,
      industryType: industry
    });
    
    res.status(200).json(configs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer une configuration par ID
exports.getConfigById = async (req, res) => {
  try {
    const config = await ConversationConfig.findOne({ 
      _id: req.params.id,
      companyId: req.user.id
    });
    
    if (!config) {
      return res.status(404).json({ message: 'Configuration non trouvée' });
    }
    
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une configuration
exports.updateConfig = async (req, res) => {
  try {
    const updatedConfig = await ConversationConfig.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!updatedConfig) {
      return res.status(404).json({ message: 'Configuration non trouvée' });
    }
    
    res.status(200).json(updatedConfig);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer une configuration
exports.deleteConfig = async (req, res) => {
  try {
    const config = await ConversationConfig.findOneAndDelete({ 
      _id: req.params.id,
      companyId: req.user.id
    });
    
    if (!config) {
      return res.status(404).json({ message: 'Configuration non trouvée' });
    }
    
    // Supprimer les fichiers PDF associés
    if (config.pdfDocuments && config.pdfDocuments.length > 0) {
      config.pdfDocuments.forEach(doc => {
        const filePath = path.join(__dirname, '../../uploads/pdfs', doc.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    res.status(200).json({ message: 'Configuration supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload un PDF et l'associer à une configuration
exports.uploadPdf = [
  upload.single('pdf'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier PDF fourni' });
      }
      
      const config = await ConversationConfig.findOne({ 
        _id: req.params.id,
        companyId: req.user.id
      });
      
      if (!config) {
        return res.status(404).json({ message: 'Configuration non trouvée' });
      }
      
      const pdfDocument = {
        name: req.file.originalname,
        path: req.file.filename,
        uploadDate: new Date()
      };
      
      config.pdfDocuments.push(pdfDocument);
      await config.save();
      
      res.status(200).json(config);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
];

// Supprimer un document PDF d'une configuration
exports.deletePdf = async (req, res) => {
  try {
    const { configId, pdfId } = req.params;
    
    const config = await ConversationConfig.findOne({ 
      _id: configId,
      companyId: req.user.id
    });
    
    if (!config) {
      return res.status(404).json({ message: 'Configuration non trouvée' });
    }
    
    const pdfDocument = config.pdfDocuments.id(pdfId);
    if (!pdfDocument) {
      return res.status(404).json({ message: 'Document PDF non trouvé' });
    }
    
    // Supprimer le fichier
    const filePath = path.join(__dirname, '../../uploads/pdfs', pdfDocument.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Retirer le document de la configuration
    config.pdfDocuments.pull(pdfId);
    await config.save();
    
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Générer un prompt système basé sur la configuration
exports.generateSystemPrompt = async (req, res) => {
  try {
    const config = await ConversationConfig.findOne({ 
      _id: req.params.id,
      companyId: req.user.id
    });
    
    if (!config) {
      return res.status(404).json({ message: 'Configuration non trouvée' });
    }
    
    const systemPrompt = config.generateSystemPrompt();
    
    res.status(200).json({ systemPrompt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer tous les types de conversations disponibles
exports.getConversationTypes = async (req, res) => {
  try {
    // Récupérer le schéma mongoose pour ConversationConfig
    const ConversationConfigModel = mongoose.model('ConversationConfig');
    const schema = ConversationConfigModel.schema;
    
    // Extraire les enum du champ conversationType
    const conversationTypes = schema.path('conversationType').enumValues;
    
    // Organiser les types par catégorie
    const categorizedTypes = {
      base: conversationTypes.filter(type => ['sales', 'support', 'information', 'custom'].includes(type)),
      commercial: conversationTypes.filter(type => ['lead_generation', 'product_demo', 'pricing_inquiry', 'upsell', 'cross_sell', 'retention', 'win_back'].includes(type)),
      support: conversationTypes.filter(type => ['technical_support', 'billing_support', 'product_issue', 'returns', 'complaint_handling', 'feature_request'].includes(type)),
      rh: conversationTypes.filter(type => ['recruitment', 'onboarding', 'training', 'employee_feedback', 'performance_review', 'exit_interview'].includes(type)),
      marketing: conversationTypes.filter(type => ['market_research', 'campaign_feedback', 'product_feedback', 'survey', 'newsletter_subscription'].includes(type)),
      legal: conversationTypes.filter(type => ['legal_assistance', 'compliance_check', 'data_request', 'privacy_concern'].includes(type)),
      education: conversationTypes.filter(type => ['course_information', 'enrollment_assistance', 'mentoring', 'tutoring', 'assignment_help'].includes(type)),
      finance: conversationTypes.filter(type => ['financial_advice', 'loan_inquiry', 'investment_guidance', 'insurance_assistance', 'tax_help'].includes(type)),
      health: conversationTypes.filter(type => ['medical_assistance', 'appointment_scheduling', 'prescription_renewal', 'health_guidance'].includes(type)),
      general: conversationTypes.filter(type => ['faq', 'general_inquiry', 'feedback', 'event_registration', 'partnership_inquiry'].includes(type))
    };
    
    res.status(200).json({
      allTypes: conversationTypes,
      categorizedTypes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer tous les secteurs d'activité disponibles
exports.getIndustryTypes = async (req, res) => {
  try {
    // Récupérer le schéma mongoose pour ConversationConfig
    const ConversationConfigModel = mongoose.model('ConversationConfig');
    const schema = ConversationConfigModel.schema;
    
    // Extraire les enum du champ industryType
    const industryTypes = schema.path('industryType').enumValues;
    
    res.status(200).json(industryTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Configurer l'intégration avec un système externe
exports.configureIntegration = async (req, res) => {
  try {
    const { configId } = req.params;
    const { systemType, systemName, apiEndpoint, apiKey } = req.body;
    
    const config = await ConversationConfig.findOne({ 
      _id: configId,
      companyId: req.user.id
    });
    
    if (!config) {
      return res.status(404).json({ message: 'Configuration non trouvée' });
    }
    
    // Vérifier si cette intégration existe déjà
    const existingIntegrationIndex = config.integrations.externalSystems.findIndex(
      system => system.systemType === systemType && system.systemName === systemName
    );
    
    if (existingIntegrationIndex >= 0) {
      // Mettre à jour l'intégration existante
      config.integrations.externalSystems[existingIntegrationIndex] = {
        systemType,
        systemName,
        apiEndpoint,
        apiKey,
        active: true
      };
    } else {
      // Ajouter une nouvelle intégration
      config.integrations.externalSystems.push({
        systemType,
        systemName,
        apiEndpoint,
        apiKey,
        active: true
      });
    }
    
    await config.save();
    
    res.status(200).json({
      message: 'Intégration configurée avec succès',
      config
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
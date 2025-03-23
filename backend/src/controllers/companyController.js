const Company = require('../models/Company');
const User = require('../models/User');
const fonosterService = require('../services/fonosterService');
const logger = require('../utils/logger');
const { errorResponse, successResponse } = require('../utils/responseHandler');
const mongoose = require('mongoose');
const openaiService = require('../services/openaiService');

/**
 * Créer une nouvelle entreprise
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.createCompany = async (req, res, next) => {
  try {
    const companyData = req.body;
    
    // Créer l'entreprise dans la base de données
    const company = new Company(companyData);
    await company.save();
    
    logger.info(`Nouvelle entreprise créée: ${company.name}`);
    
    return successResponse(res, 201, 'Entreprise créée avec succès', { company });
  } catch (error) {
    logger.error('Erreur lors de la création de l\'entreprise:', error);
    next(error);
  }
};

/**
 * Récupérer toutes les entreprises
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.getAllCompanies = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', active } = req.query;
    
    const query = {};
    if (active !== undefined) {
      query.active = active === 'true';
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort
    };
    
    const companies = await Company.find(query)
      .sort(sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);
    
    const total = await Company.countDocuments(query);
    
    return successResponse(res, 200, 'Entreprises récupérées avec succès', {
      companies,
      pagination: {
        total,
        page: options.page,
        limit: options.limit,
        pages: Math.ceil(total / options.limit)
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des entreprises:', error);
    next(error);
  }
};

/**
 * Récupérer une entreprise par son ID
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.getCompanyById = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    
    const company = await Company.findById(companyId);
    
    if (!company) {
      return errorResponse(res, 404, 'Entreprise non trouvée');
    }
    
    return successResponse(res, 200, 'Entreprise récupérée avec succès', { company });
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'entreprise:', error);
    next(error);
  }
};

/**
 * Mettre à jour une entreprise
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.updateCompany = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const updateData = req.body;
    
    const company = await Company.findByIdAndUpdate(
      companyId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!company) {
      return errorResponse(res, 404, 'Entreprise non trouvée');
    }
    
    logger.info(`Entreprise mise à jour: ${company.name}`);
    
    return successResponse(res, 200, 'Entreprise mise à jour avec succès', { company });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de l\'entreprise:', error);
    next(error);
  }
};

/**
 * Supprimer une entreprise
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.deleteCompany = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    
    const company = await Company.findByIdAndDelete(companyId);
    
    if (!company) {
      return errorResponse(res, 404, 'Entreprise non trouvée');
    }
    
    logger.info(`Entreprise supprimée: ${company.name}`);
    
    return successResponse(res, 200, 'Entreprise supprimée avec succès');
  } catch (error) {
    logger.error('Erreur lors de la suppression de l\'entreprise:', error);
    next(error);
  }
};

/**
 * Activer/désactiver une entreprise
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.toggleCompanyStatus = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    
    const company = await Company.findById(companyId);
    
    if (!company) {
      return errorResponse(res, 404, 'Entreprise non trouvée');
    }
    
    company.active = !company.active;
    await company.save();
    
    const status = company.active ? 'activée' : 'désactivée';
    return successResponse(res, 200, `Entreprise ${status} avec succès`, { company });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour l'abonnement d'une entreprise
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.updateSubscription = async (req, res, next) => {
  try {
    const { plan, endDate, status } = req.body;
    
    const { companyId } = req.params;
    
    const company = await Company.findById(companyId);
    
    if (!company) {
      return errorResponse(res, 404, 'Entreprise non trouvée');
    }
    
    if (plan) company.subscription.plan = plan;
    if (endDate) company.subscription.endDate = new Date(endDate);
    if (status) company.subscription.status = status;
    
    await company.save();
    
    return successResponse(res, 200, 'Abonnement mis à jour avec succès', { company });
  } catch (error) {
    next(error);
  }
};

/**
 * Acheter un numéro de téléphone pour une entreprise
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.purchasePhoneNumber = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { 
      phoneNumber, 
      appName, 
      provider = 'twilio',  // Définir Twilio comme fournisseur par défaut
      country = 'FR', 
      areaCode, 
      replace = false,
      enableRecording = true  // Activer l'enregistrement des appels par défaut
    } = req.body;
    
    const company = await Company.findById(companyId);
    
    if (!company) {
      return res.status(404).json({
        message: 'Entreprise non trouvée'
      });
    }
    
    // Vérifier si l'entreprise a déjà un numéro actif
    const hasExistingFonosterNumber = company.fonosterPhoneNumber;
    const hasExistingTwilioNumber = company.twilioPhoneNumber;
    
    if ((provider === 'fonoster' && hasExistingFonosterNumber) || 
        (provider === 'twilio' && hasExistingTwilioNumber)) {
      if (!replace) {
        return res.status(400).json({
          message: `L'entreprise possède déjà un numéro de téléphone ${provider}. Définissez replace=true pour le remplacer.`
        });
      }
    }
    
    let phoneNumberInfo;
    let webhookBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    
    // Traitement en fonction du fournisseur choisi
    if (provider === 'fonoster') {
      // Créer une application vocale avec Fonoster
      const voiceApp = await fonosterService.createVoiceApp({
        name: appName || `Lydia - ${company.name}`,
        webhookUrl: `${webhookBaseUrl}/api/calls/incoming/${companyId}`,
        voiceUrl: `${webhookBaseUrl}/api/calls/voice/${companyId}`
      });
      
      // Obtenir un numéro pour l'application
      phoneNumberInfo = await fonosterService.getPhoneNumber({
        phoneNumber: phoneNumber, // Fonoster utilise souvent un numéro SIP défini par l'utilisateur
        appId: voiceApp.getRef(),
        friendlyName: `Lydia - ${company.name}`
      });
      
      // Mettre à jour l'entreprise avec le nouveau numéro
      company.fonosterPhoneNumber = phoneNumberInfo.phoneNumber;
      company.fonosterAppId = voiceApp.getRef();
      
      logger.info(`Application vocale créée pour ${company.name}: ${voiceApp.getName()}`);
      
    } else if (provider === 'twilio') {
      // Import du service Twilio
      const twilioService = require('../services/twilioService');
      
      // Acheter un numéro via Twilio
      const twilioNumber = await twilioService.purchasePhoneNumber({
        country: country,
        areaCode: areaCode,
        friendlyName: `Lydia - ${company.name}`
      });
      
      // URL de base pour tous les webhooks
      const baseWebhookUrl = webhookBaseUrl;
      
      // URL spécifique pour les appels entrants
      const incomingCallWebhookUrl = `${baseWebhookUrl}/api/calls/incoming/${companyId}?provider=twilio`;
      
      // Configurer le webhook pour ce numéro
      await twilioService.configureWebhook(
        twilioNumber.sid,
        incomingCallWebhookUrl
      );
      
      // Activer l'enregistrement des appels si demandé
      if (enableRecording) {
        const recordingWebhookUrl = `${baseWebhookUrl}/api/calls/recording-status/${companyId}`;
        await twilioService.enableCallRecording(twilioNumber.sid, recordingWebhookUrl);
      }
      
      phoneNumberInfo = {
        phoneNumber: twilioNumber.phoneNumber,
        sid: twilioNumber.sid,
        capabilities: twilioNumber.capabilities,
        recordingEnabled: enableRecording
      };
      
      // Mettre à jour l'entreprise avec le nouveau numéro
      company.twilioPhoneNumber = twilioNumber.phoneNumber;
      company.twilioPhoneNumberSid = twilioNumber.sid;
      company.twilioPhoneNumberConfig = {
        recordingEnabled: enableRecording,
        purchaseDate: new Date(),
        country: country
      };
      
      logger.info(`Numéro Twilio acheté pour ${company.name}: ${twilioNumber.phoneNumber}`);
      
    } else {
      return res.status(400).json({
        message: 'Fournisseur non supporté. Utilisez "fonoster" ou "twilio".'
      });
    }
    
    await company.save();
    
    logger.info(`Numéro de téléphone configuré pour ${company.name}: ${phoneNumberInfo.phoneNumber}`);
    
    return res.status(200).json({
      message: 'Numéro de téléphone configuré avec succès',
      provider: provider,
      phoneNumber: phoneNumberInfo.phoneNumber,
      details: phoneNumberInfo
    });
  } catch (error) {
    logger.error('Erreur lors de la configuration du numéro de téléphone:', error);
    return res.status(500).json({
      message: 'Erreur lors de la configuration du numéro de téléphone',
      error: error.message
    });
  }
};

/**
 * Mettre à jour la configuration vocale d'une entreprise
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.updateVoiceConfig = async (req, res) => {
  try {
    const { companyId } = req.params;
    const voiceConfig = req.body;
    
    const company = await Company.findById(companyId);
    
    if (!company) {
      return res.status(404).json({
        message: 'Entreprise non trouvée'
      });
    }
    
    // Mettre à jour la configuration vocale
    company.voiceConfig = {
      ...company.voiceConfig,
      ...voiceConfig
    };
    
    await company.save();
    
    logger.info(`Configuration vocale mise à jour pour ${company.name}`);
    
    return res.status(200).json({
      message: 'Configuration vocale mise à jour avec succès',
      voiceConfig: company.voiceConfig
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de la configuration vocale:', error);
    return res.status(500).json({
      message: 'Erreur lors de la mise à jour de la configuration vocale',
      error: error.message
    });
  }
};

/**
 * Ajouter une réponse personnalisée
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.addCustomResponse = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { keyword, response } = req.body;
    
    if (!keyword || !response) {
      return res.status(400).json({
        message: 'Le mot-clé et la réponse sont requis'
      });
    }
    
    const company = await Company.findById(companyId);
    
    if (!company) {
      return res.status(404).json({
        message: 'Entreprise non trouvée'
      });
    }
    
    // Vérifier si le mot-clé existe déjà
    const existingIndex = company.customResponses.findIndex(
      cr => cr.keyword.toLowerCase() === keyword.toLowerCase()
    );
    
    if (existingIndex !== -1) {
      // Mettre à jour la réponse existante
      company.customResponses[existingIndex].response = response;
    } else {
      // Ajouter une nouvelle réponse
      company.customResponses.push({ keyword, response });
    }
    
    await company.save();
    
    logger.info(`Réponse personnalisée ajoutée pour ${company.name}: ${keyword}`);
    
    return res.status(200).json({
      message: 'Réponse personnalisée ajoutée avec succès',
      customResponses: company.customResponses
    });
  } catch (error) {
    logger.error('Erreur lors de l\'ajout de la réponse personnalisée:', error);
    return res.status(500).json({
      message: 'Erreur lors de l\'ajout de la réponse personnalisée',
      error: error.message
    });
  }
};

/**
 * Supprimer une réponse personnalisée
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.deleteCustomResponse = async (req, res) => {
  try {
    const { companyId, responseId } = req.params;
    
    const company = await Company.findById(companyId);
    
    if (!company) {
      return res.status(404).json({
        message: 'Entreprise non trouvée'
      });
    }
    
    // Filtrer les réponses pour supprimer celle avec l'ID spécifié
    company.customResponses = company.customResponses.filter(
      cr => cr._id.toString() !== responseId
    );
    
    await company.save();
    
    logger.info(`Réponse personnalisée supprimée pour ${company.name}`);
    
    return res.status(200).json({
      message: 'Réponse personnalisée supprimée avec succès',
      customResponses: company.customResponses
    });
  } catch (error) {
    logger.error('Erreur lors de la suppression de la réponse personnalisée:', error);
    return res.status(500).json({
      message: 'Erreur lors de la suppression de la réponse personnalisée',
      error: error.message
    });
  }
};

/**
 * Mettre à jour les paramètres de transfert
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.updateTransferSettings = async (req, res) => {
  try {
    const { companyId } = req.params;
    const transferSettings = req.body;
    
    const company = await Company.findById(companyId);
    
    if (!company) {
      return res.status(404).json({
        message: 'Entreprise non trouvée'
      });
    }
    
    // Mettre à jour les paramètres de transfert
    company.transferSettings = {
      ...company.transferSettings,
      ...transferSettings
    };
    
    await company.save();
    
    logger.info(`Paramètres de transfert mis à jour pour ${company.name}`);
    
    return res.status(200).json({
      message: 'Paramètres de transfert mis à jour avec succès',
      transferSettings: company.transferSettings
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour des paramètres de transfert:', error);
    return res.status(500).json({
      message: 'Erreur lors de la mise à jour des paramètres de transfert',
      error: error.message
    });
  }
};

/**
 * Mettre à jour les heures d'ouverture
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.updateBusinessHours = async (req, res) => {
  try {
    const { companyId } = req.params;
    const businessHours = req.body;
    
    const company = await Company.findById(companyId);
    
    if (!company) {
      return res.status(404).json({
        message: 'Entreprise non trouvée'
      });
    }
    
    // Mettre à jour les heures d'ouverture
    company.businessHours = {
      ...company.businessHours,
      ...businessHours
    };
    
    await company.save();
    
    logger.info(`Heures d'ouverture mises à jour pour ${company.name}`);
    
    return res.status(200).json({
      message: 'Heures d\'ouverture mises à jour avec succès',
      businessHours: company.businessHours
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour des heures d\'ouverture:', error);
    return res.status(500).json({
      message: 'Erreur lors de la mise à jour des heures d\'ouverture',
      error: error.message
    });
  }
};

/**
 * Obtenir des statistiques sur les entreprises
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.getCompaniesStats = async (req, res, next) => {
  try {
    logger.info('[COMPANY CONTROLLER] Récupération des statistiques d\'entreprises');
    
    // Nombre total d'entreprises
    const totalCompanies = await Company.countDocuments();
    
    // Nombre d'entreprises actives
    const activeCompanies = await Company.countDocuments({ isActive: true });
    
    // Entreprises créées par mois (6 derniers mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const companiesByMonth = await Company.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sixMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Transformer le résultat en format plus lisible
    const companiesGrowth = companiesByMonth.map(item => ({
      period: `${item._id.year}-${item._id.month < 10 ? '0' + item._id.month : item._id.month}`,
      count: item.count
    }));
    
    // Récupérer les entreprises avec le plus grand nombre d'utilisateurs
    const User = require('../models/User');
    const usersByCompany = await User.aggregate([
      {
        $group: {
          _id: "$company",
          userCount: { $sum: 1 }
        }
      },
      { $sort: { userCount: -1 } },
      { $limit: 5 }
    ]);
    
    // Récupérer les détails des entreprises
    const companyIds = usersByCompany.map(item => item._id);
    const topCompanies = await Company.find({ _id: { $in: companyIds } }, 'name');
    
    const topCompaniesByUsers = usersByCompany.map(item => {
      const company = topCompanies.find(c => c._id.toString() === item._id.toString());
      return {
        _id: item._id,
        name: company ? company.name : 'Entreprise inconnue',
        userCount: item.userCount
      };
    });
    
    logger.info('[COMPANY CONTROLLER] Statistiques d\'entreprises récupérées avec succès');
    
    return successResponse(res, 200, 'Statistiques des entreprises récupérées avec succès', {
      totalCompanies,
      activeCompanies,
      companiesGrowth,
      topCompaniesByUsers
    });
  } catch (error) {
    logger.error('[COMPANY CONTROLLER] Erreur lors de la récupération des statistiques:', error);
    next(error);
  }
};

/**
 * Obtenir le nombre total d'entreprises et d'entreprises actives
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.getCompaniesCount = async (req, res, next) => {
  try {
    logger.info('[COMPANY CONTROLLER] Récupération du nombre d\'entreprises');
    
    const totalCount = await Company.countDocuments();
    const activeCount = await Company.countDocuments({ isActive: true });
    
    logger.info('[COMPANY CONTROLLER] Nombre d\'entreprises récupéré avec succès');
    
    return successResponse(res, 200, 'Nombre d\'entreprises récupéré avec succès', {
      total: totalCount,
      active: activeCount
    });
  } catch (error) {
    logger.error('[COMPANY CONTROLLER] Erreur lors de la récupération du nombre d\'entreprises:', error);
    next(error);
  }
};

/**
 * Mettre à jour les paramètres d'une entreprise
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.updateCompanySettings = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { settings } = req.body;
    
    logger.info(`[COMPANY CONTROLLER] Mise à jour des paramètres de l'entreprise ${companyId}`);
    
    if (!settings || typeof settings !== 'object') {
      return errorResponse(res, 400, 'Les paramètres de l\'entreprise sont requis et doivent être un objet');
    }
    
    const company = await Company.findByIdAndUpdate(
      companyId,
      { $set: { settings } },
      { new: true, runValidators: true }
    );
    
    if (!company) {
      return errorResponse(res, 404, 'Entreprise non trouvée');
    }
    
    logger.info(`[COMPANY CONTROLLER] Paramètres de l'entreprise ${companyId} mis à jour avec succès`);
    
    return successResponse(res, 200, 'Paramètres de l\'entreprise mis à jour avec succès', { company });
  } catch (error) {
    logger.error('[COMPANY CONTROLLER] Erreur lors de la mise à jour des paramètres de l\'entreprise:', error);
    next(error);
  }
};

/**
 * Mettre à jour les prompts de l'assistant vocal d'une entreprise
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.updateVoiceAssistantPrompts = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Vérifier que l'ID d'entreprise est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(errorResponse('ID d\'entreprise invalide'));
    }
    
    // Trouver l'entreprise
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json(errorResponse('Entreprise non trouvée'));
    }
    
    // Vérifier que l'utilisateur a les droits d'accès à cette entreprise
    if (!req.user.isAdmin && req.user.company.toString() !== id) {
      return res.status(403).json(errorResponse('Vous n\'avez pas les droits pour modifier cette entreprise'));
    }
    
    // Si voiceAssistant n'existe pas, l'initialiser
    if (!company.voiceAssistant) {
      company.voiceAssistant = {
        prompts: {},
        companyInfo: {},
        voice: {}
      };
    }
    
    // Mettre à jour les prompts
    if (updates.prompts) {
      company.voiceAssistant.prompts = {
        ...company.voiceAssistant.prompts,
        ...updates.prompts
      };
    }
    
    // Mettre à jour les informations de l'entreprise
    if (updates.companyInfo) {
      company.voiceAssistant.companyInfo = {
        ...company.voiceAssistant.companyInfo,
        ...updates.companyInfo
      };
    }
    
    // Mettre à jour la configuration de la voix
    if (updates.voice) {
      company.voiceAssistant.voice = {
        ...company.voiceAssistant.voice,
        ...updates.voice
      };
    }
    
    // Sauvegarder les modifications
    await company.save();
    
    res.status(200).json(successResponse('Prompts de l\'assistant vocal mis à jour avec succès', company.voiceAssistant));
  } catch (error) {
    logger.error('Erreur lors de la mise à jour des prompts de l\'assistant vocal:', error);
    res.status(500).json(errorResponse('Erreur lors de la mise à jour des prompts de l\'assistant vocal'));
  }
};

/**
 * Obtenir les prompts de l'assistant vocal d'une entreprise
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getVoiceAssistantPrompts = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier que l'ID d'entreprise est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(errorResponse('ID d\'entreprise invalide'));
    }
    
    // Trouver l'entreprise
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json(errorResponse('Entreprise non trouvée'));
    }
    
    // Vérifier que l'utilisateur a les droits d'accès à cette entreprise
    if (!req.user.isAdmin && req.user.company.toString() !== id) {
      return res.status(403).json(errorResponse('Vous n\'avez pas les droits pour accéder à cette entreprise'));
    }
    
    res.status(200).json(successResponse('Prompts de l\'assistant vocal récupérés avec succès', company.voiceAssistant || {}));
  } catch (error) {
    logger.error('Erreur lors de la récupération des prompts de l\'assistant vocal:', error);
    res.status(500).json(errorResponse('Erreur lors de la récupération des prompts de l\'assistant vocal'));
  }
};

/**
 * Créer un nouveau scénario pour l'assistant vocal
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.createVoiceAssistantScenario = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, prompt, requiredVariables = [], triggers = [], actions = [] } = req.body;
    
    // Vérifier que l'ID d'entreprise est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(errorResponse('ID d\'entreprise invalide'));
    }
    
    // Vérifier que les champs obligatoires sont présents
    if (!name || !prompt) {
      return res.status(400).json(errorResponse('Le nom et le prompt sont obligatoires'));
    }
    
    // Trouver l'entreprise
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json(errorResponse('Entreprise non trouvée'));
    }
    
    // Vérifier que l'utilisateur a les droits d'accès à cette entreprise
    if (!req.user.isAdmin && req.user.company.toString() !== id) {
      return res.status(403).json(errorResponse('Vous n\'avez pas les droits pour modifier cette entreprise'));
    }
    
    // Initialiser la structure voiceAssistant si elle n'existe pas
    if (!company.voiceAssistant) {
      company.voiceAssistant = {
        prompts: {
          scenarios: []
        },
        companyInfo: {},
        voice: {}
      };
    } else if (!company.voiceAssistant.prompts) {
      company.voiceAssistant.prompts = {
        scenarios: []
      };
    } else if (!company.voiceAssistant.prompts.scenarios) {
      company.voiceAssistant.prompts.scenarios = [];
    }
    
    // Vérifier si un scénario avec le même nom existe déjà
    const existingScenarioIndex = company.voiceAssistant.prompts.scenarios.findIndex(
      scenario => scenario.name === name
    );
    
    if (existingScenarioIndex !== -1) {
      return res.status(400).json(errorResponse('Un scénario avec ce nom existe déjà'));
    }
    
    // Créer le nouveau scénario
    const newScenario = {
      name,
      description,
      prompt,
      requiredVariables,
      triggers,
      actions
    };
    
    // Ajouter le scénario
    company.voiceAssistant.prompts.scenarios.push(newScenario);
    
    // Sauvegarder les modifications
    await company.save();
    
    res.status(201).json(successResponse('Scénario créé avec succès', newScenario));
  } catch (error) {
    logger.error('Erreur lors de la création du scénario:', error);
    res.status(500).json(errorResponse('Erreur lors de la création du scénario'));
  }
};

/**
 * Mettre à jour un scénario existant
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.updateVoiceAssistantScenario = async (req, res) => {
  try {
    const { id, scenarioName } = req.params;
    const updates = req.body;
    
    // Vérifier que l'ID d'entreprise est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(errorResponse('ID d\'entreprise invalide'));
    }
    
    // Trouver l'entreprise
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json(errorResponse('Entreprise non trouvée'));
    }
    
    // Vérifier que l'utilisateur a les droits d'accès à cette entreprise
    if (!req.user.isAdmin && req.user.company.toString() !== id) {
      return res.status(403).json(errorResponse('Vous n\'avez pas les droits pour modifier cette entreprise'));
    }
    
    // Vérifier que voiceAssistant et les scénarios existent
    if (!company.voiceAssistant || !company.voiceAssistant.prompts || !company.voiceAssistant.prompts.scenarios) {
      return res.status(404).json(errorResponse('Configuration de l\'assistant vocal non trouvée'));
    }
    
    // Trouver l'index du scénario à mettre à jour
    const scenarioIndex = company.voiceAssistant.prompts.scenarios.findIndex(
      scenario => scenario.name === scenarioName
    );
    
    if (scenarioIndex === -1) {
      return res.status(404).json(errorResponse('Scénario non trouvé'));
    }
    
    // Mettre à jour le scénario
    company.voiceAssistant.prompts.scenarios[scenarioIndex] = {
      ...company.voiceAssistant.prompts.scenarios[scenarioIndex],
      ...updates
    };
    
    // Sauvegarder les modifications
    await company.save();
    
    res.status(200).json(successResponse('Scénario mis à jour avec succès', company.voiceAssistant.prompts.scenarios[scenarioIndex]));
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du scénario:', error);
    res.status(500).json(errorResponse('Erreur lors de la mise à jour du scénario'));
  }
};

/**
 * Supprimer un scénario
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.deleteVoiceAssistantScenario = async (req, res) => {
  try {
    const { id, scenarioName } = req.params;
    
    // Vérifier que l'ID d'entreprise est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(errorResponse('ID d\'entreprise invalide'));
    }
    
    // Trouver l'entreprise
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json(errorResponse('Entreprise non trouvée'));
    }
    
    // Vérifier que l'utilisateur a les droits d'accès à cette entreprise
    if (!req.user.isAdmin && req.user.company.toString() !== id) {
      return res.status(403).json(errorResponse('Vous n\'avez pas les droits pour modifier cette entreprise'));
    }
    
    // Vérifier que voiceAssistant et les scénarios existent
    if (!company.voiceAssistant || !company.voiceAssistant.prompts || !company.voiceAssistant.prompts.scenarios) {
      return res.status(404).json(errorResponse('Configuration de l\'assistant vocal non trouvée'));
    }
    
    // Trouver l'index du scénario à supprimer
    const scenarioIndex = company.voiceAssistant.prompts.scenarios.findIndex(
      scenario => scenario.name === scenarioName
    );
    
    if (scenarioIndex === -1) {
      return res.status(404).json(errorResponse('Scénario non trouvé'));
    }
    
    // Supprimer le scénario
    company.voiceAssistant.prompts.scenarios.splice(scenarioIndex, 1);
    
    // Sauvegarder les modifications
    await company.save();
    
    res.status(200).json(successResponse('Scénario supprimé avec succès'));
  } catch (error) {
    logger.error('Erreur lors de la suppression du scénario:', error);
    res.status(500).json(errorResponse('Erreur lors de la suppression du scénario'));
  }
};

/**
 * Tester un prompt avec des variables spécifiques
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.testVoiceAssistantPrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt, variables, userInput } = req.body;
    
    // Vérifier que l'ID d'entreprise est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(errorResponse('ID d\'entreprise invalide'));
    }
    
    // Vérifier que les champs obligatoires sont présents
    if (!prompt) {
      return res.status(400).json(errorResponse('Le prompt est obligatoire'));
    }
    
    // Trouver l'entreprise
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json(errorResponse('Entreprise non trouvée'));
    }
    
    // Vérifier que l'utilisateur a les droits d'accès à cette entreprise
    if (!req.user.isAdmin && req.user.company.toString() !== id) {
      return res.status(403).json(errorResponse('Vous n\'avez pas les droits pour accéder à cette entreprise'));
    }
    
    // Fusion des variables avec les variables de base
    const allVariables = {
      companyName: company.name,
      ...variables
    };
    
    // Traiter le prompt
    const processedPrompt = openaiService.processPrompt(prompt, allVariables);
    
    // Si userInput est fourni, générer une réponse avec OpenAI
    let aiResponse = null;
    if (userInput) {
      try {
        // Créer un objet company temporaire avec le prompt de test
        const tempCompany = {
          ...company.toObject(),
          voiceAssistant: {
            ...company.voiceAssistant?.toObject(),
            prompts: {
              baseSystemPrompt: processedPrompt
            }
          }
        };
        
        const response = await openaiService.generateResponse(userInput, tempCompany);
        aiResponse = response.response;
      } catch (error) {
        logger.error('Erreur lors du test avec OpenAI:', error);
        aiResponse = "Erreur lors de la génération de la réponse.";
      }
    }
    
    res.status(200).json(successResponse('Test du prompt effectué avec succès', { 
      processedPrompt,
      aiResponse
    }));
  } catch (error) {
    logger.error('Erreur lors du test du prompt:', error);
    res.status(500).json(errorResponse('Erreur lors du test du prompt'));
  }
};

/**
 * Récupérer les paramètres d'une entreprise
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.getCompanySettings = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const company = await Company.findById(id);
    
    if (!company) {
      return errorResponse(res, 404, 'Entreprise non trouvée');
    }
    
    return successResponse(res, 200, 'Paramètres récupérés avec succès', { 
      settings: company.settings || {},
      voiceAssistant: company.voiceAssistant || {}
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des paramètres de l\'entreprise:', error);
    next(error);
  }
};

module.exports = exports; 
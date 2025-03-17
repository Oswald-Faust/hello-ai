const Call = require('../models/Call');
const Company = require('../models/Company');
const twilioService = require('../services/twilioService');
const openaiService = require('../services/openaiService');
const logger = require('../utils/logger');
const { io } = require('../index');
const { errorResponse, successResponse } = require('../utils/responseHandler');

/**
 * Gérer un appel entrant
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.handleIncomingCall = async (req, res) => {
  try {
    const { To, From, CallSid } = req.body;
    
    // Trouver l'entreprise associée au numéro appelé
    const company = await Company.findOne({ twilioPhoneNumber: To });
    
    if (!company) {
      logger.error(`Aucune entreprise trouvée pour le numéro ${To}`);
      return res.status(404).send(
        twilioService.generateTwiMLResponse(
          "Désolé, ce numéro n'est pas configuré correctement. Veuillez réessayer plus tard."
        )
      );
    }
    
    // Vérifier si l'entreprise est ouverte
    if (!company.isOpenNow()) {
      logger.info(`Appel reçu en dehors des heures d'ouverture pour ${company.name}`);
      return res.status(200).send(
        twilioService.generateTwiMLResponse(
          `Merci d'avoir appelé ${company.name}. Nous sommes actuellement fermés. Veuillez nous rappeler pendant nos heures d'ouverture.`
        )
      );
    }
    
    // Créer un nouvel enregistrement d'appel
    const call = new Call({
      callSid: CallSid,
      company: company._id,
      from: From,
      to: To,
      direction: 'entrant',
      status: 'en-cours'
    });
    
    await call.save();
    
    // Notifier les utilisateurs connectés via Socket.io
    io.to(`company-${company._id}`).emit('new-call', {
      callId: call._id,
      from: From,
      startTime: call.startTime
    });
    
    // Générer la réponse TwiML avec le message d'accueil
    const twimlResponse = twilioService.generateTwiMLResponse(
      company.voiceConfig.welcomeMessage,
      {
        voice: company.voiceConfig.voice,
        language: company.voiceConfig.language,
        gather: {
          input: 'speech',
          language: company.voiceConfig.language,
          action: `/api/calls/${call._id}/process-speech`,
          method: 'POST',
          prompt: "Comment puis-je vous aider aujourd'hui?"
        }
      }
    );
    
    // Ajouter le message d'accueil au transcript
    call.addToTranscript('lydia', company.voiceConfig.welcomeMessage);
    await call.save();
    
    return res.status(200).send(twimlResponse);
  } catch (error) {
    logger.error('Erreur lors du traitement de l\'appel entrant:', error);
    return res.status(500).send(
      twilioService.generateTwiMLResponse(
        "Désolé, une erreur s'est produite. Veuillez réessayer plus tard."
      )
    );
  }
};

/**
 * Traiter la parole de l'utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.processSpeech = async (req, res) => {
  try {
    const { callId } = req.params;
    const { SpeechResult } = req.body;
    
    // Si aucun résultat de parole n'est disponible
    if (!SpeechResult) {
      return res.status(200).send(
        twilioService.generateTwiMLResponse(
          "Je n'ai pas pu comprendre ce que vous avez dit. Pourriez-vous répéter s'il vous plaît?",
          {
            gather: {
              input: 'speech',
              action: `/api/calls/${callId}/process-speech`,
              method: 'POST',
              prompt: "Pourriez-vous répéter s'il vous plaît?"
            }
          }
        )
      );
    }
    
    // Récupérer l'appel et l'entreprise associée
    const call = await Call.findById(callId);
    if (!call) {
      logger.error(`Appel non trouvé: ${callId}`);
      return res.status(404).send(
        twilioService.generateTwiMLResponse(
          "Désolé, une erreur s'est produite. Veuillez réessayer plus tard."
        )
      );
    }
    
    const company = await Company.findById(call.company);
    if (!company) {
      logger.error(`Entreprise non trouvée pour l'appel: ${callId}`);
      return res.status(404).send(
        twilioService.generateTwiMLResponse(
          "Désolé, une erreur s'est produite. Veuillez réessayer plus tard."
        )
      );
    }
    
    // Ajouter la transcription au transcript de l'appel
    call.addToTranscript('client', SpeechResult);
    await call.save();
    
    // Notifier les utilisateurs connectés de la mise à jour du transcript
    io.to(`company-${company._id}`).emit('call-transcript-update', {
      callId: call._id,
      transcript: call.transcript
    });
    
    // Vérifier si l'utilisateur demande explicitement un transfert
    const needsTransfer = await openaiService.needsHumanTransfer(SpeechResult);
    
    if (needsTransfer) {
      // Mettre à jour l'appel
      call.transferredToHuman = true;
      call.transferReason = 'demande-client';
      call.status = 'transféré';
      await call.save();
      
      // Notifier les utilisateurs connectés du transfert
      io.to(`company-${company._id}`).emit('call-transferred', {
        callId: call._id,
        reason: 'demande-client'
      });
      
      // Générer la réponse TwiML pour le transfert
      return res.status(200).send(
        twilioService.generateTwiMLResponse(
          company.voiceConfig.transferMessage,
          {
            voice: company.voiceConfig.voice,
            language: company.voiceConfig.language,
            redirect: company.transferSettings.humanPhoneNumber
          }
        )
      );
    }
    
    // Vérifier s'il existe une réponse personnalisée
    const customResponse = company.findCustomResponse(SpeechResult);
    
    if (customResponse) {
      // Ajouter la réponse au transcript
      call.addToTranscript('lydia', customResponse);
      await call.save();
      
      // Notifier les utilisateurs connectés de la mise à jour du transcript
      io.to(`company-${company._id}`).emit('call-transcript-update', {
        callId: call._id,
        transcript: call.transcript
      });
      
      // Générer la réponse TwiML avec la réponse personnalisée
      return res.status(200).send(
        twilioService.generateTwiMLResponse(
          customResponse,
          {
            voice: company.voiceConfig.voice,
            language: company.voiceConfig.language,
            gather: {
              input: 'speech',
              action: `/api/calls/${callId}/process-speech`,
              method: 'POST',
              prompt: "Y a-t-il autre chose que je puisse faire pour vous?"
            }
          }
        )
      );
    }
    
    // Générer une réponse avec OpenAI
    const companyConfig = {
      companyName: company.name,
      description: `Vous êtes l'assistant vocal de ${company.name}.`,
      tone: company.voiceConfig.tone,
      style: company.voiceConfig.style
    };
    
    // Récupérer l'historique des conversations pour le contexte
    const history = call.transcript.map(entry => ({
      role: entry.speaker === 'client' ? 'user' : 'assistant',
      content: entry.text
    }));
    
    const aiResponse = await openaiService.generateResponse(
      SpeechResult,
      companyConfig,
      { history }
    );
    
    // Ajouter la réponse au transcript
    call.addToTranscript('lydia', aiResponse);
    await call.save();
    
    // Notifier les utilisateurs connectés de la mise à jour du transcript
    io.to(`company-${company._id}`).emit('call-transcript-update', {
      callId: call._id,
      transcript: call.transcript
    });
    
    // Générer la réponse TwiML avec la réponse de l'IA
    return res.status(200).send(
      twilioService.generateTwiMLResponse(
        aiResponse,
        {
          voice: company.voiceConfig.voice,
          language: company.voiceConfig.language,
          gather: {
            input: 'speech',
            action: `/api/calls/${callId}/process-speech`,
            method: 'POST',
            prompt: "Y a-t-il autre chose que je puisse faire pour vous?"
          }
        }
      )
    );
  } catch (error) {
    logger.error('Erreur lors du traitement de la parole:', error);
    return res.status(500).send(
      twilioService.generateTwiMLResponse(
        "Désolé, une erreur s'est produite. Veuillez réessayer plus tard."
      )
    );
  }
};

/**
 * Terminer un appel
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.endCall = async (req, res) => {
  try {
    const { CallSid, CallStatus } = req.body;
    
    const call = await Call.findOne({ callSid: CallSid });
    
    if (!call) {
      logger.error(`Appel non trouvé pour la terminaison: ${CallSid}`);
      return res.status(404).json({ message: 'Appel non trouvé' });
    }
    
    // Mettre à jour le statut de l'appel
    let status = 'terminé';
    if (CallStatus === 'busy' || CallStatus === 'no-answer' || CallStatus === 'failed') {
      status = 'manqué';
    } else if (call.transferredToHuman) {
      status = 'transféré';
    }
    
    call.endCall(status);
    await call.save();
    
    // Notifier les utilisateurs connectés de la fin de l'appel
    io.to(`company-${call.company}`).emit('call-ended', {
      callId: call._id,
      status,
      duration: call.duration
    });
    
    // Analyser le sentiment de la conversation
    const allClientMessages = call.transcript
      .filter(entry => entry.speaker === 'client')
      .map(entry => entry.text)
      .join(' ');
    
    if (allClientMessages) {
      const sentiment = await openaiService.analyzeSentiment(allClientMessages);
      
      call.sentiment = {
        overall: sentiment.sentiment,
        score: sentiment.score
      };
      
      await call.save();
    }
    
    return res.status(200).json({ message: 'Appel terminé avec succès' });
  } catch (error) {
    logger.error('Erreur lors de la terminaison de l\'appel:', error);
    return res.status(500).json({ message: 'Erreur lors de la terminaison de l\'appel' });
  }
};

/**
 * Obtenir la liste des appels pour une entreprise
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getCallsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;
    
    const query = { company: companyId };
    
    // Filtrer par statut si spécifié
    if (status) {
      query.status = status;
    }
    
    // Filtrer par date si spécifié
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startTime.$lte = new Date(endDate);
      }
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { startTime: -1 },
      populate: 'company'
    };
    
    const calls = await Call.find(query)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort(options.sort)
      .populate('company', 'name')
      .exec();
    
    const total = await Call.countDocuments(query);
    
    return res.status(200).json({
      calls,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      totalCalls: total
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des appels:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des appels' });
  }
};

/**
 * Obtenir les détails d'un appel
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getCallDetails = async (req, res) => {
  try {
    const { callId } = req.params;
    
    const call = await Call.findById(callId).populate('company', 'name');
    
    if (!call) {
      return res.status(404).json({ message: 'Appel non trouvé' });
    }
    
    return res.status(200).json(call);
  } catch (error) {
    logger.error('Erreur lors de la récupération des détails de l\'appel:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des détails de l\'appel' });
  }
};

/**
 * Obtenir des statistiques sur les appels
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getCallStats = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { startDate, endDate } = req.query;
    
    const query = { company: companyId };
    
    // Filtrer par date si spécifié
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startTime.$lte = new Date(endDate);
      }
    }
    
    // Statistiques générales
    const totalCalls = await Call.countDocuments(query);
    const completedCalls = await Call.countDocuments({ ...query, status: 'terminé' });
    const transferredCalls = await Call.countDocuments({ ...query, status: 'transféré' });
    const missedCalls = await Call.countDocuments({ ...query, status: 'manqué' });
    
    // Durée moyenne des appels
    const durationStats = await Call.aggregate([
      { $match: { ...query, duration: { $gt: 0 } } },
      { $group: { _id: null, avgDuration: { $avg: '$duration' } } }
    ]);
    
    const avgDuration = durationStats.length > 0 ? Math.round(durationStats[0].avgDuration) : 0;
    
    // Répartition des sentiments
    const sentimentStats = await Call.aggregate([
      { $match: { ...query, 'sentiment.overall': { $exists: true } } },
      { $group: { _id: '$sentiment.overall', count: { $sum: 1 } } }
    ]);
    
    const sentiments = {
      positif: 0,
      négatif: 0,
      neutre: 0
    };
    
    sentimentStats.forEach(stat => {
      sentiments[stat._id] = stat.count;
    });
    
    return res.status(200).json({
      totalCalls,
      completedCalls,
      transferredCalls,
      missedCalls,
      avgDuration,
      sentiments
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des statistiques d\'appels:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des statistiques d\'appels' });
  }
};

/**
 * Créer un nouvel appel
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.createCall = async (req, res, next) => {
  try {
    const { companyId, ...callData } = req.body;
    
    // Vérifier si l'entreprise existe
    const company = await Company.findById(companyId);
    if (!company) {
      return errorResponse(res, 404, 'Entreprise non trouvée');
    }
    
    const call = new Call({
      ...callData,
      company: companyId
    });
    
    await call.save();
    
    return successResponse(res, 201, 'Appel créé avec succès', { call });
  } catch (error) {
    logger.error('Erreur lors de la création de l\'appel:', error);
    next(error);
  }
};

/**
 * Récupérer tous les appels
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.getAllCalls = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-createdAt', 
      status,
      direction,
      companyId,
      startDate,
      endDate
    } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (direction) query.direction = direction;
    if (companyId) query.company = companyId;
    
    // Filtrer par date
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort
    };
    
    const calls = await Call.find(query)
      .sort(sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .populate('company', 'name')
      .populate('user', 'firstName lastName');
    
    const total = await Call.countDocuments(query);
    
    return successResponse(res, 200, 'Appels récupérés avec succès', {
      calls,
      pagination: {
        total,
        page: options.page,
        limit: options.limit,
        pages: Math.ceil(total / options.limit)
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des appels:', error);
    next(error);
  }
};

/**
 * Récupérer un appel par son ID
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.getCallById = async (req, res, next) => {
  try {
    const call = await Call.findById(req.params.id)
      .populate('company', 'name')
      .populate('user', 'firstName lastName');
    
    if (!call) {
      return errorResponse(res, 404, 'Appel non trouvé');
    }
    
    return successResponse(res, 200, 'Appel récupéré avec succès', { call });
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'appel:', error);
    next(error);
  }
};

/**
 * Mettre à jour un appel
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.updateCall = async (req, res, next) => {
  try {
    const call = await Call.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!call) {
      return errorResponse(res, 404, 'Appel non trouvé');
    }
    
    return successResponse(res, 200, 'Appel mis à jour avec succès', { call });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de l\'appel:', error);
    next(error);
  }
};

/**
 * Supprimer un appel
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.deleteCall = async (req, res, next) => {
  try {
    const call = await Call.findByIdAndDelete(req.params.id);
    
    if (!call) {
      return errorResponse(res, 404, 'Appel non trouvé');
    }
    
    return successResponse(res, 200, 'Appel supprimé avec succès');
  } catch (error) {
    logger.error('Erreur lors de la suppression de l\'appel:', error);
    next(error);
  }
};

module.exports = exports; 
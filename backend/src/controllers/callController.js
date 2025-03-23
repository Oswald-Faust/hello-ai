const Call = require('../models/Call');
const Company = require('../models/Company');
const fonosterService = require('../services/fonosterService');
const openaiService = require('../services/openaiService');
const logger = require('../utils/logger');
const { io } = require('../index');
const { errorResponse, successResponse } = require('../utils/responseHandler');

/**
 * Gérer un appel entrant pour une entreprise spécifique
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.handleIncomingCall = async (req, res) => {
  try {
    const { To, From, CallSid } = req.body;
    const { companyId } = req.params;
    const provider = req.query.provider || 'fonoster';
    
    // Trouver l'entreprise associée au numéro appelé
    const company = await Company.findById(companyId);
    
    if (!company) {
      logger.error(`Aucune entreprise trouvée pour l'ID ${companyId}`);
      
      if (provider === 'twilio') {
        const twilioService = require('../services/twilioService');
        return res.status(404).send(
          twilioService.generateTwiMLResponse("Désolé, ce numéro n'est pas configuré correctement. Veuillez réessayer plus tard.")
        );
      } else {
        return res.status(404).json(
          await fonosterService.generateVoiceResponse(
            "Désolé, ce numéro n'est pas configuré correctement. Veuillez réessayer plus tard."
          )
        );
      }
    }
    
    // Vérifier si l'entreprise est ouverte
    if (!company.isOpenNow()) {
      logger.info(`Appel reçu en dehors des heures d'ouverture pour ${company.name}`);
      
      let message = `Merci d'avoir appelé ${company.name}. Nous sommes actuellement fermés. Veuillez nous rappeler pendant nos heures d'ouverture.`;
      
      if (provider === 'twilio') {
        const twilioService = require('../services/twilioService');
        return res.status(200).send(
          twilioService.generateTwiMLResponse(message)
        );
      } else {
        return res.status(200).json(
          await fonosterService.generateVoiceResponse(message, {}, company)
        );
      }
    }
    
    // Créer un nouvel enregistrement d'appel
    const call = new Call({
      callSid: CallSid,
      company: company._id,
      from: From,
      to: To,
      direction: 'inbound',
      status: 'in-progress',
      provider: provider
    });
    
    await call.save();
    
    // Notifier les utilisateurs connectés via Socket.io
    io.to(`company-${company._id}`).emit('new-call', {
      callId: call._id,
      from: From,
      startTime: call.startTime
    });
    
    // Récupérer le message d'accueil personnalisé
    let welcomeMessage = "Bonjour et bienvenue. Comment puis-je vous aider?";
    
    if (company.voiceAssistant && company.voiceAssistant.prompts && company.voiceAssistant.prompts.welcomePrompt) {
      welcomeMessage = company.voiceAssistant.prompts.welcomePrompt;
      
      // Remplacer les variables
      welcomeMessage = welcomeMessage.replace(/{{companyName}}/g, company.name);
    }
    
    // Générer la réponse vocale selon le fournisseur
    if (provider === 'twilio') {
      const twilioService = require('../services/twilioService');
      const voice = company.voiceAssistant?.voice?.gender === 'male' ? 'Polly.Mathieu' : 'Polly.Léa';
      
      return res.status(200).send(
        twilioService.generateTwiMLResponse(
          welcomeMessage,
          {
            voice: voice,
            language: 'fr-FR',
            gather: {
              input: 'speech',
              action: `/api/calls/${call._id}/process-speech?provider=twilio`,
              prompt: "Comment puis-je vous aider aujourd'hui?"
            }
          }
        )
      );
    } else {
      // Réponse Fonoster par défaut
      const voiceResponse = await fonosterService.generateVoiceResponse(
        welcomeMessage,
        {
          voice: company.voiceAssistant?.voice?.gender || 'female',
          language: 'fr-FR',
          gather: {
            action: `/api/calls/${call._id}/process-speech`,
            prompt: "Comment puis-je vous aider aujourd'hui?"
          }
        },
        company
      );
      
      // Ajouter le message d'accueil au transcript
      call.addToTranscript('lydia', welcomeMessage);
      await call.save();
      
      return res.status(200).json(voiceResponse);
    }
  } catch (error) {
    logger.error('Erreur lors du traitement de l\'appel entrant:', error);
    return res.status(500).json(
      await fonosterService.generateVoiceResponse(
        "Désolé, une erreur s'est produite. Veuillez réessayer plus tard."
      )
    );
  }
};

/**
 * Gérer un appel entrant (route legacy)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.handleLegacyIncomingCall = async (req, res) => {
  try {
    const { To } = req.body;
    
    // Trouver l'entreprise associée au numéro appelé
    let company;
    
    if (To) {
      // Chercher par numéro de téléphone
      company = await Company.findOne({ 
        $or: [
          { fonosterPhoneNumber: To },
          { twilioPhoneNumber: To }
        ]
      });
    }
    
    if (!company) {
      logger.error(`Aucune entreprise trouvée pour le numéro ${To}`);
      return res.status(404).json(
        await fonosterService.generateVoiceResponse(
          "Désolé, ce numéro n'est pas configuré correctement. Veuillez réessayer plus tard."
        )
      );
    }
    
    // Rediriger vers la nouvelle route avec l'ID de l'entreprise
    req.params = { companyId: company._id.toString() };
    return this.handleIncomingCall(req, res);
  } catch (error) {
    logger.error('Erreur lors du traitement de l\'appel entrant (legacy):', error);
    return res.status(500).json(
      await fonosterService.generateVoiceResponse(
        "Désolé, une erreur s'est produite. Veuillez réessayer plus tard."
      )
    );
  }
};

/**
 * Gérer une requête vocale pour une entreprise spécifique
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.handleVoiceRequest = async (req, res) => {
  try {
    const { companyId } = req.params;
    const provider = req.query.provider || 'fonoster';
    
    // Récupérer l'entreprise
    const company = await Company.findById(companyId);
    
    if (!company) {
      logger.error(`Aucune entreprise trouvée pour l'ID ${companyId}`);
      
      if (provider === 'twilio') {
        const twilioService = require('../services/twilioService');
        return res.status(404).send(
          twilioService.generateTwiMLResponse("Désolé, ce numéro n'est pas configuré correctement.")
        );
      } else {
        return res.status(404).json(
          await fonosterService.generateVoiceResponse(
            "Désolé, ce numéro n'est pas configuré correctement."
          )
        );
      }
    }
    
    // Récupérer le message d'accueil personnalisé
    let welcomeMessage = "Bonjour et bienvenue. Comment puis-je vous aider?";
    
    if (company.voiceAssistant && company.voiceAssistant.prompts && company.voiceAssistant.prompts.welcomePrompt) {
      welcomeMessage = company.voiceAssistant.prompts.welcomePrompt;
      welcomeMessage = welcomeMessage.replace(/{{companyName}}/g, company.name);
    }
    
    // Répondre selon le fournisseur
    if (provider === 'twilio') {
      const twilioService = require('../services/twilioService');
      const voice = company.voiceAssistant?.voice?.gender === 'male' ? 'Polly.Mathieu' : 'Polly.Léa';
      
      return res.status(200).send(
        twilioService.generateTwiMLResponse(welcomeMessage, { voice })
      );
    } else {
      return res.status(200).json(
        await fonosterService.generateVoiceResponse(welcomeMessage, {}, company)
      );
    }
  } catch (error) {
    logger.error('Erreur lors du traitement de la requête vocale:', error);
    return res.status(500).json(
      await fonosterService.generateVoiceResponse(
        "Désolé, une erreur s'est produite. Veuillez réessayer plus tard."
      )
    );
  }
};

/**
 * Gérer une requête vocale (route legacy)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.handleLegacyVoiceRequest = async (req, res) => {
  try {
    const { To } = req.body;
    
    // Trouver l'entreprise associée au numéro appelé
    let company;
    
    if (To) {
      // Chercher par numéro de téléphone
      company = await Company.findOne({ 
        $or: [
          { fonosterPhoneNumber: To },
          { twilioPhoneNumber: To }
        ]
      });
    }
    
    if (!company) {
      logger.error(`Aucune entreprise trouvée pour le numéro ${To}`);
      return res.status(404).json(
        await fonosterService.generateVoiceResponse(
          "Désolé, ce numéro n'est pas configuré correctement. Veuillez réessayer plus tard."
        )
      );
    }
    
    // Rediriger vers la nouvelle route avec l'ID de l'entreprise
    req.params = { companyId: company._id.toString() };
    return this.handleVoiceRequest(req, res);
  } catch (error) {
    logger.error('Erreur lors du traitement de la requête vocale (legacy):', error);
    return res.status(500).json(
      await fonosterService.generateVoiceResponse(
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
    const provider = req.query.provider || 'fonoster';
    
    // Le résultat de la reconnaissance vocale varie selon le fournisseur
    let speechResult;
    
    if (provider === 'twilio') {
      speechResult = req.body.SpeechResult;
    } else {
      speechResult = req.body.SpeechResult || req.body.speech;
    }
    
    // Si aucun résultat de parole n'est disponible
    if (!speechResult) {
      const noInputMessage = "Je n'ai pas pu comprendre ce que vous avez dit. Pourriez-vous répéter s'il vous plaît?";
      
      if (provider === 'twilio') {
        const twilioService = require('../services/twilioService');
        return res.status(200).send(
          twilioService.generateTwiMLResponse(
            noInputMessage,
            {
              gather: {
                input: 'speech',
                action: `/api/calls/${callId}/process-speech?provider=twilio`,
                prompt: "Pourriez-vous répéter s'il vous plaît?"
              }
            }
          )
        );
      } else {
        return res.status(200).json(
          await fonosterService.generateVoiceResponse(
            noInputMessage,
            {
              gather: {
                action: `/api/calls/${callId}/process-speech`,
                prompt: "Pourriez-vous répéter s'il vous plaît?"
              }
            }
          )
        );
      }
    }
    
    // Récupérer l'appel et l'entreprise associée
    const call = await Call.findById(callId);
    if (!call) {
      logger.error(`Appel non trouvé: ${callId}`);
      
      const errorMessage = "Désolé, une erreur s'est produite. Veuillez réessayer plus tard.";
      
      if (provider === 'twilio') {
        const twilioService = require('../services/twilioService');
        return res.status(404).send(
          twilioService.generateTwiMLResponse(errorMessage)
        );
      } else {
        return res.status(404).json(
          await fonosterService.generateVoiceResponse(errorMessage)
        );
      }
    }
    
    const company = await Company.findById(call.company);
    if (!company) {
      logger.error(`Entreprise non trouvée pour l'appel: ${callId}`);
      
      const errorMessage = "Désolé, une erreur s'est produite. Veuillez réessayer plus tard.";
      
      if (provider === 'twilio') {
        const twilioService = require('../services/twilioService');
        return res.status(404).send(
          twilioService.generateTwiMLResponse(errorMessage)
        );
      } else {
        return res.status(404).json(
          await fonosterService.generateVoiceResponse(errorMessage)
        );
      }
    }
    
    // Ajouter la transcription au transcript de l'appel
    call.addToTranscript('client', speechResult);
    await call.save();
    
    // Notifier les utilisateurs connectés de la mise à jour du transcript
    io.to(`company-${company._id}`).emit('call-transcript-update', {
      callId: call._id,
      transcript: call.transcript
    });
    
    // Vérifier d'abord si une réponse personnalisée existe
    const customResponse = company.findCustomResponse(speechResult);
    
    if (customResponse) {
      logger.info(`Réponse personnalisée trouvée pour la requête: ${speechResult}`);
      
      // Ajouter la réponse au transcript
      call.addToTranscript('lydia', customResponse);
      await call.save();
      
      // Notifier de la mise à jour
      io.to(`company-${company._id}`).emit('call-transcript-update', {
        callId: call._id,
        transcript: call.transcript
      });
      
      // Envoyer la réponse personnalisée selon le fournisseur
      if (provider === 'twilio') {
        const twilioService = require('../services/twilioService');
        const voice = company.voiceAssistant?.voice?.gender === 'male' ? 'Polly.Mathieu' : 'Polly.Léa';
        
        return res.status(200).send(
          twilioService.generateTwiMLResponse(
            customResponse,
            {
              voice: voice,
              gather: {
                input: 'speech',
                action: `/api/calls/${callId}/process-speech?provider=twilio`,
                prompt: "Puis-je vous aider avec autre chose?"
              }
            }
          )
        );
      } else {
        const voiceResponse = await fonosterService.generateVoiceResponse(
          customResponse,
          {
            gather: {
              action: `/api/calls/${callId}/process-speech`,
              prompt: "Puis-je vous aider avec autre chose?"
            }
          },
          company
        );
        
        return res.status(200).json(voiceResponse);
      }
    }
    
    // Si pas de réponse personnalisée, utiliser l'IA pour générer une réponse
    
    // Construire le prompt pour l'IA
    let systemPrompt = "Vous êtes un assistant vocal pour une entreprise. Soyez concis et précis dans vos réponses.";
    
    if (company.voiceAssistant && company.voiceAssistant.prompts && company.voiceAssistant.prompts.baseSystemPrompt) {
      systemPrompt = company.voiceAssistant.prompts.baseSystemPrompt;
      systemPrompt = systemPrompt.replace(/{{companyName}}/g, company.name);
    }
    
    // Récupérer les derniers échanges pour le contexte (maximum 5)
    const conversationHistory = call.transcript && call.transcript.length > 0 
      ? call.transcript.slice(-10).map(entry => ({
          role: entry.speaker === 'client' ? 'user' : 'assistant',
          content: entry.text
        }))
      : [];
    
    // Ajouter d'autres informations du contexte de l'entreprise si disponibles
    let companyContext = "";
    
    if (company.voiceAssistant && company.voiceAssistant.companyInfo) {
      if (company.voiceAssistant.companyInfo.products && company.voiceAssistant.companyInfo.products.length > 0) {
        companyContext += "Produits: " + company.voiceAssistant.companyInfo.products.join(", ") + ". ";
      }
      
      if (company.voiceAssistant.companyInfo.services && company.voiceAssistant.companyInfo.services.length > 0) {
        companyContext += "Services: " + company.voiceAssistant.companyInfo.services.join(", ") + ". ";
      }
      
      if (company.voiceAssistant.companyInfo.faq && company.voiceAssistant.companyInfo.faq.length > 0) {
        companyContext += "FAQ: ";
        company.voiceAssistant.companyInfo.faq.forEach(faqItem => {
          companyContext += `Q: ${faqItem.question} R: ${faqItem.answer}. `;
        });
      }
    }
    
    if (companyContext) {
      systemPrompt += `\n\nInformations sur l'entreprise: ${companyContext}`;
    }
    
    // Générer la réponse avec l'IA
    try {
      const aiResponse = await openaiService.generateChatCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: speechResult }
        ],
        max_tokens: 150
      });
      
      // Ajouter la réponse de l'IA au transcript
      call.addToTranscript('lydia', aiResponse);
      await call.save();
      
      // Notifier de la mise à jour
      io.to(`company-${company._id}`).emit('call-transcript-update', {
        callId: call._id,
        transcript: call.transcript
      });
      
      // Envoyer la réponse générée selon le fournisseur
      if (provider === 'twilio') {
        const twilioService = require('../services/twilioService');
        const voice = company.voiceAssistant?.voice?.gender === 'male' ? 'Polly.Mathieu' : 'Polly.Léa';
        
        return res.status(200).send(
          twilioService.generateTwiMLResponse(
            aiResponse,
            {
              voice: voice,
              gather: {
                input: 'speech',
                action: `/api/calls/${callId}/process-speech?provider=twilio`,
                prompt: "Puis-je vous aider avec autre chose?"
              }
            }
          )
        );
      } else {
        const voiceResponse = await fonosterService.generateVoiceResponse(
          aiResponse,
          {
            gather: {
              action: `/api/calls/${callId}/process-speech`,
              prompt: "Puis-je vous aider avec autre chose?"
            }
          },
          company
        );
        
        return res.status(200).json(voiceResponse);
      }
      
    } catch (aiError) {
      logger.error('Erreur lors de la génération de la réponse IA:', aiError);
      
      const fallbackResponse = "Je suis désolé, je ne peux pas répondre à cette question pour le moment. Puis-je vous aider avec autre chose?";
      
      // Ajouter la réponse de secours au transcript
      call.addToTranscript('lydia', fallbackResponse);
      await call.save();
      
      if (provider === 'twilio') {
        const twilioService = require('../services/twilioService');
        return res.status(200).send(
          twilioService.generateTwiMLResponse(
            fallbackResponse,
            {
              gather: {
                input: 'speech',
                action: `/api/calls/${callId}/process-speech?provider=twilio`
              }
            }
          )
        );
      } else {
        return res.status(200).json(
          await fonosterService.generateVoiceResponse(
            fallbackResponse,
            {
              gather: {
                action: `/api/calls/${callId}/process-speech`
              }
            },
            company
          )
        );
      }
    }
    
  } catch (error) {
    logger.error('Erreur lors du traitement de la parole:', error);
    
    const errorMessage = "Désolé, une erreur s'est produite. Veuillez réessayer plus tard.";
    
    if (req.query.provider === 'twilio') {
      const twilioService = require('../services/twilioService');
      return res.status(500).send(
        twilioService.generateTwiMLResponse(errorMessage)
      );
    } else {
      return res.status(500).json(
        await fonosterService.generateVoiceResponse(errorMessage)
      );
    }
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

/**
 * Ajouter une entrée à la conversation d'un appel
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.addConversationEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, message } = req.body;
    
    if (!role || !message) {
      return errorResponse(res, 400, 'Le rôle et le message sont requis');
    }
    
    const call = await Call.findById(id);
    
    if (!call) {
      return errorResponse(res, 404, 'Appel non trouvé');
    }
    
    // Ajouter l'entrée à la conversation
    call.addToTranscript(role, message);
    await call.save();
    
    // Notifier via Socket.io si disponible
    if (io) {
      io.to(`call-${id}`).emit('conversation-update', {
        callId: id,
        transcript: call.transcript
      });
    }
    
    return successResponse(res, 200, 'Entrée ajoutée avec succès', { call });
  } catch (error) {
    logger.error('Erreur lors de l\'ajout d\'une entrée à la conversation:', error);
    next(error);
  }
};

/**
 * Mettre à jour le statut d'un appel
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.updateCallStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return errorResponse(res, 400, 'Le statut est requis');
    }
    
    const validStatuses = ['en-attente', 'en-cours', 'terminé', 'manqué', 'transféré'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 400, 'Statut invalide');
    }
    
    const call = await Call.findById(id);
    
    if (!call) {
      return errorResponse(res, 404, 'Appel non trouvé');
    }
    
    call.status = status;
    
    // Si l'appel est terminé, définir endTime
    if (status === 'terminé') {
      call.endTime = Date.now();
      // Calculer la durée
      if (call.startTime) {
        call.duration = Math.round((call.endTime - call.startTime) / 1000); // en secondes
      }
    }
    
    await call.save();
    
    // Notifier via Socket.io si disponible
    if (io) {
      io.to(`company-${call.company}`).emit('call-status-update', {
        callId: id,
        status
      });
    }
    
    return successResponse(res, 200, 'Statut mis à jour avec succès', { call });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du statut de l\'appel:', error);
    next(error);
  }
};

/**
 * Obtenir des statistiques pour le tableau de bord des appels
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getCallDashboardStats = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { period = 'week' } = req.query;
    
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Entreprise non trouvée' });
    }
    
    // Déterminer les dates de début et de fin en fonction de la période
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }
    
    // Tendance des appels par jour
    const callsPerDayPipeline = [
      {
        $match: {
          company: company._id,
          startTime: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$startTime' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1
        }
      }
    ];
    
    const callsPerDay = await Call.aggregate(callsPerDayPipeline);
    
    // Appels par statut
    const callsByStatusPipeline = [
      {
        $match: {
          company: company._id,
          startTime: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ];
    
    const callsByStatus = await Call.aggregate(callsByStatusPipeline);
    
    // Formater les résultats
    const statusMap = {
      'en-attente': 'En attente',
      'en-cours': 'En cours',
      'terminé': 'Terminé',
      'manqué': 'Manqué',
      'transféré': 'Transféré'
    };
    
    const formattedCallsByStatus = callsByStatus.map(item => ({
      status: statusMap[item._id] || item._id,
      count: item.count
    }));
    
    // Appels par direction (entrant/sortant)
    const callsByDirectionPipeline = [
      {
        $match: {
          company: company._id,
          startTime: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$direction',
          count: { $sum: 1 }
        }
      }
    ];
    
    const callsByDirection = await Call.aggregate(callsByDirectionPipeline);
    
    const directionMap = {
      'inbound': 'Entrant',
      'outbound': 'Sortant'
    };
    
    const formattedCallsByDirection = callsByDirection.map(item => ({
      direction: directionMap[item._id] || item._id,
      count: item.count
    }));
    
    // Durée moyenne des appels par jour
    const avgDurationPerDayPipeline = [
      {
        $match: {
          company: company._id,
          startTime: { $gte: startDate, $lte: endDate },
          duration: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$startTime' }
          },
          avgDuration: { $avg: '$duration' }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          avgDuration: { $round: ['$avgDuration', 0] }
        }
      }
    ];
    
    const avgDurationPerDay = await Call.aggregate(avgDurationPerDayPipeline);
    
    return res.status(200).json({
      callsPerDay,
      callsByStatus: formattedCallsByStatus,
      callsByDirection: formattedCallsByDirection,
      avgDurationPerDay
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des statistiques du tableau de bord:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des statistiques du tableau de bord' });
  }
};

/**
 * Traiter les notifications d'état des appels Twilio
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.handleTwilioStatusCallback = async (req, res) => {
  try {
    const { CallSid, CallStatus, From, To } = req.body;
    logger.info(`Notification de statut Twilio reçue: ${CallStatus} pour ${CallSid}`);
    
    // Rechercher l'appel correspondant
    const call = await Call.findOne({ callSid: CallSid });
    
    if (!call) {
      logger.warn(`Aucun appel trouvé pour le CallSid: ${CallSid}`);
      return res.status(200).send(); // Twilio attend une réponse 200 même en cas d'erreur
    }
    
    // Mettre à jour le statut de l'appel
    const previousStatus = call.status;
    call.status = mapTwilioStatusToInternalStatus(CallStatus);
    
    // Si l'appel est terminé, définir l'heure de fin
    if (['completed', 'busy', 'failed', 'no-answer', 'canceled'].includes(CallStatus)) {
      call.endTime = new Date();
      call.duration = Math.round((call.endTime - call.startTime) / 1000); // en secondes
    }
    
    await call.save();
    
    // Notifier les utilisateurs connectés via Socket.io du changement de statut
    io.to(`company-${call.company}`).emit('call-status-update', {
      callId: call._id,
      previousStatus,
      newStatus: call.status,
      updatedAt: new Date()
    });
    
    return res.status(200).send();
  } catch (error) {
    logger.error('Erreur lors du traitement de la notification de statut Twilio:', error);
    return res.status(200).send(); // Toujours renvoyer 200 pour Twilio
  }
};

/**
 * Mapper les statuts Twilio aux statuts internes
 * @param {string} twilioStatus - Statut Twilio
 * @returns {string} - Statut interne
 */
function mapTwilioStatusToInternalStatus(twilioStatus) {
  const statusMap = {
    'queued': 'queued',
    'ringing': 'ringing',
    'in-progress': 'in-progress',
    'completed': 'completed',
    'busy': 'failed',
    'failed': 'failed',
    'no-answer': 'no-answer',
    'canceled': 'canceled'
  };
  
  return statusMap[twilioStatus] || 'unknown';
}

/**
 * Gérer les notifications d'enregistrement Twilio
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.handleRecordingStatus = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { RecordingSid, RecordingUrl, RecordingStatus, CallSid } = req.body;
    
    logger.info(`Notification d'enregistrement reçue: ${RecordingStatus} pour ${CallSid}`);
    
    // Rechercher l'appel correspondant
    const call = await Call.findOne({ callSid: CallSid });
    
    if (!call) {
      logger.warn(`Aucun appel trouvé pour le CallSid: ${CallSid}`);
      return res.status(200).send(); // Twilio attend une réponse 200 même en cas d'erreur
    }
    
    // Si l'enregistrement est terminé
    if (RecordingStatus === 'completed' && RecordingUrl) {
      call.recordingUrl = RecordingUrl;
      call.recordingSid = RecordingSid;
      await call.save();
      
      // Notifier les utilisateurs connectés
      io.to(`company-${companyId}`).emit('recording-available', {
        callId: call._id,
        recordingUrl: RecordingUrl
      });
      
      logger.info(`Enregistrement disponible pour l'appel ${call._id}: ${RecordingUrl}`);
    }
    
    return res.status(200).send();
  } catch (error) {
    logger.error('Erreur lors du traitement de la notification d\'enregistrement:', error);
    return res.status(200).send(); // Toujours renvoyer 200 pour Twilio
  }
};

module.exports = exports; 
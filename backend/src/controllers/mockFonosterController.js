const logger = require('../utils/logger');

/**
 * Contrôleur pour simuler les réponses de l'API Fonoster en développement local
 */
exports.handleRequest = async (req, res) => {
  const { path, method, body } = req;
  
  logger.info(`Mock Fonoster: ${method} ${path}`);
  logger.debug('Body:', body);
  
  // Simuler différentes réponses selon le chemin
  if (path.includes('/voice-apps')) {
    return handleVoiceAppsRequest(req, res);
  } else if (path.includes('/numbers')) {
    return handleNumbersRequest(req, res);
  } else if (path.includes('/calls')) {
    return handleCallsRequest(req, res);
  }
  
  // Réponse générique
  return res.status(200).json({
    status: 'success',
    message: 'Fonoster mock response',
    data: { 
      mock: true,
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Gérer les requêtes liées aux applications vocales
 */
const handleVoiceAppsRequest = (req, res) => {
  const { method } = req;
  
  if (method === 'POST') {
    // Création d'une application vocale
    return res.status(200).json({
      ref: process.env.FONOSTER_APP_ID,
      name: req.body.name || 'Lydia Test App',
      webhookUrl: req.body.webhookUrl || 'http://localhost:3001/api/calls/incoming',
      voiceUrl: req.body.voiceUrl || 'http://localhost:3001/api/calls/voice',
      createdAt: new Date().toISOString(),
      updateAt: new Date().toISOString(),
      getName: () => req.body.name || 'Lydia Test App',
      getRef: () => process.env.FONOSTER_APP_ID
    });
  } else if (method === 'GET') {
    // Récupération d'une application vocale
    return res.status(200).json({
      ref: process.env.FONOSTER_APP_ID,
      name: 'Lydia Test App',
      webhookUrl: 'http://localhost:3001/api/calls/incoming',
      voiceUrl: 'http://localhost:3001/api/calls/voice',
      createdAt: new Date().toISOString(),
      updateAt: new Date().toISOString(),
      getName: () => 'Lydia Test App',
      getRef: () => process.env.FONOSTER_APP_ID
    });
  }
  
  return res.status(404).json({ error: 'Not implemented in mock' });
};

/**
 * Gérer les requêtes liées aux numéros de téléphone
 */
const handleNumbersRequest = (req, res) => {
  const { method } = req;
  
  // Simulation de l'obtention d'un numéro
  return res.status(200).json({
    phoneNumber: process.env.FONOSTER_PHONE_NUMBER,
    applicationId: process.env.FONOSTER_APP_ID,
    friendlyName: req.body.friendlyName || 'Lydia Assistant Vocal'
  });
};

/**
 * Gérer les requêtes liées aux appels
 */
const handleCallsRequest = (req, res) => {
  const { method, body } = req;
  
  // Simulation d'un appel sortant
  if (method === 'POST') {
    return res.status(200).json({
      callId: `CF${Date.now()}`,
      from: body.from || '+33123456789',
      to: body.to || '+33987654321',
      status: 'initiated',
      createdAt: new Date().toISOString()
    });
  }
  
  return res.status(404).json({ error: 'Not implemented in mock' });
};

module.exports = exports;

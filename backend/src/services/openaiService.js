const { OpenAI } = require('openai');
const logger = require('../utils/logger');

// Initialisation du client OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Analyser une requête vocale et générer une réponse
 * @param {string} transcription - Transcription du message vocal de l'utilisateur
 * @param {Object} companyConfig - Configuration de l'entreprise (ton, style, etc.)
 * @param {Object} context - Contexte de la conversation (historique, etc.)
 * @returns {Promise<string>} - Réponse générée
 */
const generateResponse = async (transcription, companyConfig, context = {}) => {
  try {
    // Construire le système de messages pour l'API
    const messages = [
      {
        role: 'system',
        content: `Vous êtes Lydia, un assistant vocal intelligent pour ${companyConfig.companyName}. 
                 ${companyConfig.description || ''}
                 Ton de voix: ${companyConfig.tone || 'professionnel et amical'}
                 Style de communication: ${companyConfig.style || 'clair et concis'}
                 Répondez aux questions des clients de manière utile et précise.
                 Si vous ne connaissez pas la réponse, proposez de transférer l'appel à un conseiller humain.
                 N'inventez pas d'informations.`
      }
    ];

    // Ajouter l'historique de conversation si disponible
    if (context.history && Array.isArray(context.history)) {
      messages.push(...context.history);
    }

    // Ajouter la requête actuelle de l'utilisateur
    messages.push({
      role: 'user',
      content: transcription
    });

    // Appeler l'API OpenAI
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
      messages: messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    logger.info(`Réponse générée pour ${companyConfig.companyName}: ${response.substring(0, 100)}...`);
    
    return response;
  } catch (error) {
    logger.error('Erreur lors de la génération de réponse OpenAI:', error);
    throw error;
  }
};

/**
 * Détecter si une requête nécessite un transfert vers un humain
 * @param {string} transcription - Transcription du message vocal
 * @returns {Promise<boolean>} - True si un transfert est nécessaire
 */
const needsHumanTransfer = async (transcription) => {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: `Vous êtes un système d'analyse qui détermine si une demande client nécessite l'intervention d'un humain.
                   Répondez uniquement par "true" si la demande nécessite clairement un humain, ou "false" si l'IA peut gérer.
                   Considérez comme nécessitant un humain: demandes explicites de parler à un conseiller, plaintes complexes,
                   problèmes techniques spécifiques, demandes de remboursement, ou situations émotionnellement chargées.`
        },
        {
          role: 'user',
          content: transcription
        }
      ],
      max_tokens: 10,
      temperature: 0.1,
    });

    const response = completion.choices[0].message.content.trim().toLowerCase();
    const needsTransfer = response === 'true';
    
    logger.info(`Analyse de transfert pour: "${transcription.substring(0, 50)}..." - Résultat: ${needsTransfer}`);
    return needsTransfer;
  } catch (error) {
    logger.error('Erreur lors de l\'analyse de transfert:', error);
    // En cas d'erreur, on préfère transférer à un humain par précaution
    return true;
  }
};

/**
 * Analyser le sentiment d'un message
 * @param {string} text - Texte à analyser
 * @returns {Promise<Object>} - Analyse du sentiment (positif, négatif, neutre)
 */
const analyzeSentiment = async (text) => {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: `Analysez le sentiment du texte suivant et répondez au format JSON avec la structure:
                   { "sentiment": "positif|négatif|neutre", "score": 0-1, "explanation": "brève explication" }`
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: 150,
      temperature: 0.2,
    });

    const response = completion.choices[0].message.content;
    try {
      const sentiment = JSON.parse(response);
      logger.info(`Analyse de sentiment effectuée: ${sentiment.sentiment}`);
      return sentiment;
    } catch (parseError) {
      logger.error('Erreur lors du parsing de l\'analyse de sentiment:', parseError);
      return { sentiment: 'neutre', score: 0.5, explanation: 'Erreur d\'analyse' };
    }
  } catch (error) {
    logger.error('Erreur lors de l\'analyse de sentiment:', error);
    return { sentiment: 'neutre', score: 0.5, explanation: 'Erreur d\'analyse' };
  }
};

module.exports = {
  generateResponse,
  needsHumanTransfer,
  analyzeSentiment
}; 
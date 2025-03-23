const conversationService = require('../services/conversationService');
const huggingfaceService = require('../services/huggingfaceService');
const openaiService = require('../services/openaiService');
const ConversationConfig = require('../models/ConversationConfig');

/**
 * Initialise une nouvelle conversation avec la configuration spécifiée
 */
exports.initializeConversation = async (req, res) => {
  try {
    const { configId, context } = req.body;
    
    if (!configId) {
      return res.status(400).json({ message: 'ID de configuration requis' });
    }
    
    const conversationContext = await conversationService.initializeConversation(configId, context || {});
    
    res.status(200).json({ 
      success: true, 
      conversationContext
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la conversation:', error);
    res.status(500).json({ message: error.message || 'Erreur serveur' });
  }
};

/**
 * Génère une réponse IA basée sur le message utilisateur et le contexte
 */
exports.generateResponse = async (req, res) => {
  try {
    const { conversationContext, message, modelOverride } = req.body;
    
    if (!conversationContext || !message) {
      return res.status(400).json({ message: 'Contexte de conversation et message requis' });
    }
    
    // Préparer le contexte pour l'IA
    const aiContext = conversationService.prepareAIContext(conversationContext);
    
    // Déterminer le modèle à utiliser
    const modelId = modelOverride || conversationContext.aiSettings.modelId;
    
    // Choisir le service d'IA approprié selon le modelId
    let response;
    if (modelId.includes('openai') || modelId.startsWith('gpt')) {
      // Utiliser OpenAI
      response = await openaiService.generateCompletion({
        model: modelId,
        systemMessage: aiContext.systemPrompt,
        userMessage: message,
        temperature: conversationContext.aiSettings.temperature,
        contextData: aiContext.contextData
      });
    } else {
      // Utiliser Hugging Face par défaut
      response = await huggingfaceService.generateCompletion({
        model: modelId,
        systemMessage: aiContext.systemPrompt,
        userMessage: message,
        temperature: conversationContext.aiSettings.temperature,
        contextData: aiContext.contextData
      });
    }
    
    res.status(200).json({
      success: true,
      response,
      model: modelId
    });
  } catch (error) {
    console.error('Erreur lors de la génération de réponse:', error);
    res.status(500).json({ message: error.message || 'Erreur serveur' });
  }
};

/**
 * Liste les configurations de conversation par catégorie
 */
exports.listConfigurationsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { userId } = req.user;
    
    let query = { companyId: userId };
    
    // Filtrer par catégorie si spécifiée
    if (category) {
      switch (category) {
        case 'commercial':
          query.conversationType = { $in: [
            'sales', 'lead_generation', 'product_demo', 'pricing_inquiry', 
            'upsell', 'cross_sell', 'retention', 'win_back'
          ]};
          break;
        case 'support':
          query.conversationType = { $in: [
            'support', 'technical_support', 'billing_support', 'product_issue', 
            'returns', 'complaint_handling', 'feature_request'
          ]};
          break;
        case 'hr':
          query.conversationType = { $in: [
            'recruitment', 'onboarding', 'training', 'employee_feedback', 
            'performance_review', 'exit_interview'
          ]};
          break;
        case 'marketing':
          query.conversationType = { $in: [
            'market_research', 'campaign_feedback', 'product_feedback', 
            'survey', 'newsletter_subscription'
          ]};
          break;
        case 'legal':
          query.conversationType = { $in: [
            'legal_assistance', 'compliance_check', 'data_request', 'privacy_concern'
          ]};
          break;
        // Ajouter d'autres catégories au besoin
      }
    }
    
    const configurations = await ConversationConfig.find(query);
    
    res.status(200).json({
      success: true,
      configurations
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des configurations:', error);
    res.status(500).json({ message: error.message || 'Erreur serveur' });
  }
};

/**
 * Suggère des configurations de conversation adaptées à un cas d'usage spécifique
 */
exports.suggestConfigurations = async (req, res) => {
  try {
    const { useCase, industry } = req.body;
    const { userId } = req.user;
    
    let query = { companyId: userId };
    
    // Filtrer par cas d'usage
    if (useCase) {
      // Mapper le cas d'usage à des types de conversation appropriés
      const useCaseMap = {
        'customer_acquisition': ['lead_generation', 'sales', 'product_demo'],
        'customer_support': ['support', 'technical_support', 'product_issue'],
        'employee_management': ['recruitment', 'onboarding', 'training'],
        'marketing': ['market_research', 'campaign_feedback', 'product_feedback'],
        'finance': ['financial_advice', 'loan_inquiry', 'investment_guidance'],
        'healthcare': ['medical_assistance', 'appointment_scheduling', 'health_guidance']
      };
      
      if (useCaseMap[useCase]) {
        query.conversationType = { $in: useCaseMap[useCase] };
      }
    }
    
    // Filtrer par industrie si spécifiée
    if (industry) {
      query.industryType = industry;
    }
    
    const configurations = await ConversationConfig.find(query);
    
    res.status(200).json({
      success: true,
      configurations
    });
  } catch (error) {
    console.error('Erreur lors de la suggestion de configurations:', error);
    res.status(500).json({ message: error.message || 'Erreur serveur' });
  }
}; 
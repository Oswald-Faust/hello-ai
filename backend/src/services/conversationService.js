const ConversationConfig = require('../models/ConversationConfig');
const pdfService = require('./pdfService');
const mongoose = require('mongoose');

/**
 * Service pour gérer les différents types de conversations
 */
class ConversationService {
  
  /**
   * Initialise une conversation selon sa configuration
   * @param {ObjectId} configId - ID de la configuration de conversation
   * @param {Object} initialContext - Contexte initial (variables, etc.)
   * @returns {Object} Contexte enrichi pour l'IA
   */
  async initializeConversation(configId, initialContext = {}) {
    try {
      // Récupérer la configuration
      const config = await ConversationConfig.findById(configId);
      if (!config) {
        throw new Error('Configuration de conversation non trouvée');
      }
      
      // Valider les variables requises
      const validationResult = config.validateVariables(initialContext);
      if (validationResult !== true) {
        throw new Error(`Variables manquantes: ${validationResult.missing.join(', ')}`);
      }
      
      // Récupérer l'entreprise associée pour les messages d'accueil
      const company = await config.getCompany();
      const greetings = company?.voiceAssistant?.prompts?.greetings || {
        main: "Bonjour, comment puis-je vous aider ?",
        outOfHours: "Nous sommes actuellement fermés. Merci de rappeler pendant nos heures d'ouverture.",
        waiting: "Un instant s'il vous plaît, je traite votre demande."
      };
      
      // Préparer le contexte enrichi
      const enrichedContext = {
        conversationType: config.conversationType,
        industryType: config.industryType,
        formalityLevel: config.formalityLevel,
        aiSettings: { ...config.aiSettings },
        systemPrompt: config.generateSystemPrompt(),
        variables: { ...initialContext },
        greetings, // Ajouter les messages d'accueil au contexte
        pdfContent: [],
        contextParameters: { ...config.contextParameters }
      };
      
      // Extraire le contenu des PDFs si présents
      if (config.pdfDocuments && config.pdfDocuments.length > 0) {
        for (const doc of config.pdfDocuments) {
          try {
            const content = await pdfService.extractContentFromPdf(doc.path);
            if (content) {
              enrichedContext.pdfContent.push({
                documentName: doc.name,
                content: content
              });
            }
          } catch (error) {
            console.error(`Erreur lors de l'extraction du contenu du PDF ${doc.name}:`, error);
          }
        }
      }
      
      // Ajouter des instructions spécifiques pour l'utilisation des messages d'accueil
      enrichedContext.systemPrompt += `\n\nMessages d'accueil à utiliser:
- Message principal: "${greetings.main}"
- Message hors heures: "${greetings.outOfHours}"
- Message d'attente: "${greetings.waiting}"

Instructions pour l'utilisation des messages:
1. Utilisez le message principal pour commencer la conversation
2. Utilisez le message hors heures si l'appel est en dehors des heures d'ouverture
3. Utilisez le message d'attente lors du traitement d'une demande complexe`;
      
      return enrichedContext;
    } catch (error) {
      console.error('Erreur dans initializeConversation:', error);
      throw error;
    }
  }
  
  /**
   * Méthode de compatibilité avec le code existant
   * Récupère le contexte d'une conversation à partir de son ID de configuration
   * @param {ObjectId} configId - ID de la configuration de conversation
   * @param {Object} variables - Variables pour la conversation
   * @returns {Promise<Object>} Contexte de conversation
   */
  async getConversationContext(configId, variables = {}) {
    try {
      // Utiliser la nouvelle méthode initializeConversation
      return await this.initializeConversation(configId, variables);
    } catch (error) {
      console.error('Erreur dans getConversationContext:', error);
      return {
        pdfContent: [],
        variables: {},
        systemPrompt: "Vous êtes un assistant IA professionnel qui aide les utilisateurs."
      };
    }
  }
  
  /**
   * Prépare le contexte de l'IA en fonction du type de conversation
   * @param {Object} conversationContext - Contexte de la conversation
   * @returns {Object} Prompt enrichi pour l'IA
   */
  prepareAIContext(conversationContext) {
    try {
      const { conversationType, systemPrompt, pdfContent, variables } = conversationContext;
      
      // Base du contexte à envoyer à l'IA
      const aiContext = {
        systemPrompt,
        contextData: {}
      };
      
      // Ajouter le contenu PDF si présent
      if (pdfContent && pdfContent.length > 0) {
        aiContext.contextData.documents = pdfContent;
      }
      
      // Ajouter des instructions spécifiques selon le type de conversation
      switch (conversationType) {
        case 'sales':
        case 'lead_generation':
        case 'product_demo':
        case 'upsell':
        case 'cross_sell':
          this._addSalesContext(aiContext, conversationContext);
          break;
          
        case 'support':
        case 'technical_support':
        case 'product_issue':
          this._addSupportContext(aiContext, conversationContext);
          break;
          
        case 'recruitment':
        case 'onboarding':
        case 'training':
          this._addHRContext(aiContext, conversationContext);
          break;
          
        case 'financial_advice':
        case 'investment_guidance':
          this._addFinancialContext(aiContext, conversationContext);
          break;
          
        case 'medical_assistance':
        case 'health_guidance':
          this._addHealthContext(aiContext, conversationContext);
          break;
      }
      
      return aiContext;
    } catch (error) {
      console.error('Erreur dans prepareAIContext:', error);
      throw error;
    }
  }
  
  /**
   * Ajoute des instructions spécifiques au contexte commercial
   * @private
   */
  _addSalesContext(aiContext, conversationContext) {
    const { industryType, variables } = conversationContext;
    
    aiContext.contextData.salesApproach = {
      objectives: "Comprendre les besoins du client, présenter les solutions appropriées, répondre aux objections",
      techniques: [
        "Poser des questions ouvertes pour découvrir les besoins",
        "Présenter les avantages plutôt que les caractéristiques",
        "Aborder proactivement les objections courantes"
      ],
      tonality: "Confiant et persuasif mais jamais agressif"
    };
    
    // Ajouter des éléments spécifiques à l'industrie si disponible
    if (industryType) {
      switch (industryType) {
        case 'technology':
          aiContext.contextData.industryInsights = "Mettre l'accent sur l'innovation, la sécurité et le retour sur investissement";
          break;
        case 'healthcare':
          aiContext.contextData.industryInsights = "Souligner la conformité réglementaire, la sécurité des patients et l'efficacité des soins";
          break;
        case 'finance':
          aiContext.contextData.industryInsights = "Insister sur la sécurité, la conformité et la performance des solutions";
          break;
      }
    }
  }
  
  /**
   * Ajoute des instructions spécifiques au contexte de support
   * @private
   */
  _addSupportContext(aiContext, conversationContext) {
    aiContext.contextData.supportApproach = {
      priorities: "Comprendre rapidement le problème, proposer des solutions efficaces, assurer un suivi",
      techniques: [
        "Reformuler le problème pour confirmer la compréhension",
        "Proposer des solutions pas à pas",
        "Vérifier que le problème est résolu"
      ],
      tonality: "Patient et empathique, même face à des utilisateurs frustrés"
    };
  }
  
  /**
   * Ajoute des instructions spécifiques au contexte RH
   * @private
   */
  _addHRContext(aiContext, conversationContext) {
    aiContext.contextData.hrApproach = {
      priorities: "Créer un environnement accueillant, communiquer clairement les informations importantes",
      techniques: [
        "Utiliser un langage inclusif",
        "Structurer les informations de manière claire",
        "Répondre avec empathie aux préoccupations"
      ],
      tonality: "Professionnel et bienveillant"
    };
  }
  
  /**
   * Ajoute des instructions spécifiques au contexte financier
   * @private
   */
  _addFinancialContext(aiContext, conversationContext) {
    aiContext.contextData.financialApproach = {
      priorities: "Fournir des informations précises, rester neutre, ne pas faire de recommandations spécifiques",
      disclaimer: "Toujours rappeler que ces informations sont générales et ne constituent pas un conseil financier personnalisé",
      tonality: "Objectif et informatif"
    };
  }
  
  /**
   * Ajoute des instructions spécifiques au contexte médical
   * @private
   */
  _addHealthContext(aiContext, conversationContext) {
    aiContext.contextData.healthApproach = {
      priorities: "Fournir des informations générales, orienter vers des professionnels de santé",
      disclaimer: "Toujours préciser que ces informations ne remplacent pas l'avis d'un professionnel de santé",
      tonality: "Rassurant et informatif, sans être alarmiste"
    };
  }
}

module.exports = new ConversationService(); 
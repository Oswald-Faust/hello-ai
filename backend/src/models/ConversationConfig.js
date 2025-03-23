const mongoose = require('mongoose');

const ConversationConfigSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  conversationType: {
    type: String,
    required: true,
    enum: [
      // Types de base
      'sales', 'support', 'information', 'custom',
      // Types commerciaux
      'lead_generation', 'product_demo', 'pricing_inquiry', 'upsell', 'cross_sell', 'retention', 'win_back',
      // Types support client
      'technical_support', 'billing_support', 'product_issue', 'returns', 'complaint_handling', 'feature_request',
      // Types RH
      'recruitment', 'onboarding', 'training', 'employee_feedback', 'performance_review', 'exit_interview',
      // Types marketing
      'market_research', 'campaign_feedback', 'product_feedback', 'survey', 'newsletter_subscription',
      // Types légaux et conformité
      'legal_assistance', 'compliance_check', 'data_request', 'privacy_concern',
      // Types éducatifs
      'course_information', 'enrollment_assistance', 'mentoring', 'tutoring', 'assignment_help',
      // Types financiers
      'financial_advice', 'loan_inquiry', 'investment_guidance', 'insurance_assistance', 'tax_help',
      // Types santé
      'medical_assistance', 'appointment_scheduling', 'prescription_renewal', 'health_guidance',
      // Types généraux
      'faq', 'general_inquiry', 'feedback', 'event_registration', 'partnership_inquiry'
    ],
    default: 'custom'
  },
  // Définit le secteur d'activité pour contextualiser davantage les conversations
  industryType: {
    type: String,
    enum: [
      'general', 'technology', 'healthcare', 'finance', 'education', 'retail', 
      'manufacturing', 'hospitality', 'real_estate', 'legal', 'nonprofit', 
      'government', 'media', 'entertainment', 'automotive', 'agriculture', 
      'telecommunications', 'energy', 'transportation', 'construction', 'other'
    ],
    default: 'general'
  },
  // Niveau de formalité pour adapter le ton des réponses
  formalityLevel: {
    type: String,
    enum: ['casual', 'professional', 'formal', 'technical', 'educational', 'friendly'],
    default: 'professional'
  },
  contextParameters: {
    type: Object,
    default: {}
  },
  variables: [{
    name: String,
    description: String,
    defaultValue: String,
    required: Boolean
  }],
  pdfDocuments: [{
    name: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  active: {
    type: Boolean,
    default: true
  },
  // Paramètres pour l'intégration avec l'IA
  aiSettings: {
    // Modèle à utiliser pour cette configuration
    modelId: {
      type: String,
      default: 'mistralai/Mistral-7B-Instruct-v0.2'  // Valeur par défaut du huggingfaceService
    },
    // Format du système de prompt pour cette configuration
    systemPromptTemplate: {
      type: String,
      default: "Vous êtes un assistant IA professionnel qui aide les utilisateurs."
    },
    // Personnalité de l'IA pour cette conversation
    personalityTrait: {
      type: String,
      enum: [
        'neutral', 'friendly', 'empathetic', 'professional', 'technical', 
        'enthusiastic', 'patient', 'authoritative', 'humorous', 'creative'
      ],
      default: 'professional'
    },
    // Style de communication pour cette conversation
    communicationStyle: {
      type: String,
      enum: [
        'concise', 'detailed', 'simplified', 'technical', 'educational',
        'conversational', 'structured', 'narrative', 'analytical'
      ],
      default: 'conversational'
    },
    // Température pour la génération (0.0 - 1.0)
    temperature: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    // Paramètres supplémentaires pour la génération
    additionalParams: {
      type: Object,
      default: {}
    },
    // Instructions spécifiques pour traiter les données PDF
    pdfInstructions: {
      type: String,
      default: "Utilisez ces informations pour répondre aux questions de l'utilisateur. Si les informations ne sont pas suffisantes ou pertinentes, vous pouvez répondre en fonction de vos connaissances générales, mais privilégiez toujours les informations fournies dans le contexte."
    }
  },
  // Paramètres de routage et escalade
  routingSettings: {
    // Détermine si la conversation peut être escaladée à un humain
    allowHumanEscalation: {
      type: Boolean,
      default: true
    },
    // Mots-clés qui déclenchent une escalade automatique
    escalationTriggers: {
      type: [String],
      default: []
    },
    // Département vers lequel transférer en cas d'escalade
    escalationDepartment: {
      type: String,
      default: ''
    }
  },
  // Paramètres d'intégration avec des systèmes externes
  integrations: {
    // CRM, ERP, etc.
    externalSystems: [{
      systemType: {
        type: String,
        enum: ['crm', 'erp', 'helpdesk', 'ecommerce', 'payment', 'other'],
      },
      systemName: String,
      apiEndpoint: String,
      apiKey: String,
      active: {
        type: Boolean,
        default: false
      }
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Méthode pour enrichir un prompt avec les variables disponibles
ConversationConfigSchema.methods.enrichPromptWithVariables = function(prompt, providedVariables = {}) {
  if (!prompt) return '';
  
  // Combiner les variables avec leurs valeurs par défaut
  const variables = {};
  
  // D'abord, ajouter les valeurs par défaut
  if (this.variables && this.variables.length > 0) {
    this.variables.forEach(variable => {
      if (variable.defaultValue) {
        variables[variable.name] = variable.defaultValue;
      }
    });
  }
  
  // Ensuite, remplacer par les valeurs fournies
  Object.assign(variables, providedVariables);
  
  // Remplacer les variables dans le prompt
  let enrichedPrompt = prompt;
  for (const [key, value] of Object.entries(variables)) {
    enrichedPrompt = enrichedPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  
  return enrichedPrompt;
};

// Méthode pour vérifier que toutes les variables requises sont présentes
ConversationConfigSchema.methods.validateVariables = function(providedVariables = {}) {
  if (!this.variables || this.variables.length === 0) return true;
  
  const requiredVariables = this.variables.filter(v => v.required).map(v => v.name);
  const missingVariables = requiredVariables.filter(name => !providedVariables[name]);
  
  return missingVariables.length === 0 ? true : { valid: false, missing: missingVariables };
};

// Méthode pour récupérer l'entreprise associée
ConversationConfigSchema.methods.getCompany = async function() {
  try {
    const Company = mongoose.model('Company');
    const company = await Company.findOne({ 
      $or: [
        { conversationConfigs: this._id },
        { defaultConversationConfig: this._id }
      ]
    });
    
    return company;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'entreprise:', error);
    return null;
  }
};

// Méthode pour générer un prompt système basé sur le type de conversation et les paramètres
ConversationConfigSchema.methods.generateSystemPrompt = function() {
  const { conversationType, industryType, formalityLevel } = this;
  const { personalityTrait, communicationStyle, systemPromptTemplate } = this.aiSettings;

  // Si un template personnalisé est défini, l'utiliser comme base
  if (systemPromptTemplate && systemPromptTemplate.trim() !== "Vous êtes un assistant IA professionnel qui aide les utilisateurs.") {
    return this.enrichPromptWithVariables(systemPromptTemplate);
  }

  // Sinon, générer un prompt en fonction des paramètres
  let roleBasedPrompt = "Vous êtes un assistant IA professionnel";
  
  // Personnaliser en fonction du type de conversation
  switch (conversationType) {
    case 'sales':
      roleBasedPrompt = "Vous êtes un agent commercial expérimenté";
      break;
    case 'lead_generation':
      roleBasedPrompt = "Vous êtes un spécialiste de la génération de leads";
      break;
    case 'support':
    case 'technical_support':
      roleBasedPrompt = "Vous êtes un agent de support technique";
      break;
    case 'recruitment':
      roleBasedPrompt = "Vous êtes un recruteur professionnel";
      break;
    case 'training':
      roleBasedPrompt = "Vous êtes un formateur pédagogique";
      break;
    case 'financial_advice':
      roleBasedPrompt = "Vous êtes un conseiller financier";
      break;
    case 'medical_assistance':
      roleBasedPrompt = "Vous êtes un assistant médical formé pour donner des informations générales";
      break;
    // Ajouter d'autres types selon nécessité
  }

  // Ajouter des informations sur l'industrie
  if (industryType && industryType !== 'general') {
    roleBasedPrompt += ` spécialisé dans le secteur ${industryType.replace('_', ' ')}`;
  }

  // Ajouter la personnalité
  switch (personalityTrait) {
    case 'friendly':
      roleBasedPrompt += ", chaleureux et accueillant";
      break;
    case 'empathetic':
      roleBasedPrompt += ", faisant preuve d'empathie et de compréhension";
      break;
    case 'technical':
      roleBasedPrompt += ", privilégiant la précision technique";
      break;
    case 'humorous':
      roleBasedPrompt += ", avec un bon sens de l'humour";
      break;
    // Autres personnalités...
  }

  // Ajouter le style de communication
  roleBasedPrompt += ". ";
  switch (communicationStyle) {
    case 'concise':
      roleBasedPrompt += "Vos réponses sont concises et vont droit au but.";
      break;
    case 'detailed':
      roleBasedPrompt += "Vos réponses sont détaillées et complètes.";
      break;
    case 'simplified':
      roleBasedPrompt += "Vous expliquez les concepts de manière simple et accessible.";
      break;
    case 'educational':
      roleBasedPrompt += "Vous adoptez une approche pédagogique dans vos explications.";
      break;
    // Autres styles...
  }

  // Ajouter le niveau de formalité
  switch (formalityLevel) {
    case 'casual':
      roleBasedPrompt += " Votre ton est décontracté et conversationnel.";
      break;
    case 'professional':
      roleBasedPrompt += " Votre ton est professionnel mais accessible.";
      break;
    case 'formal':
      roleBasedPrompt += " Votre ton est formel et soutenu.";
      break;
    case 'technical':
      roleBasedPrompt += " Vous utilisez un vocabulaire technique approprié.";
      break;
    // Autres niveaux...
  }

  return roleBasedPrompt;
};

module.exports = mongoose.model('ConversationConfig', ConversationConfigSchema); 
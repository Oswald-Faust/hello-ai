const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schéma pour les entreprises utilisant Lydia
 */
const CompanySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Le nom de l\'entreprise est requis'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  phone: {
    type: String,
    trim: true
  },
  fonosterPhoneNumber: {
    type: String,
    trim: true
  },
  fonosterAppId: {
    type: String,
    trim: true
  },
  twilioPhoneNumber: {
    type: String,
    trim: true
  },
  twilioPhoneNumberSid: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir un email valide']
  },
  website: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  businessHours: {
    monday: { open: String, close: String, closed: Boolean },
    tuesday: { open: String, close: String, closed: Boolean },
    wednesday: { open: String, close: String, closed: Boolean },
    thursday: { open: String, close: String, closed: Boolean },
    friday: { open: String, close: String, closed: Boolean },
    saturday: { open: String, close: String, closed: Boolean },
    sunday: { open: String, close: String, closed: Boolean }
  },
  // Configuration des prompts pour l'assistant vocal
  voiceAssistant: {
    // Données de l'entreprise à intégrer dans les prompts
    companyInfo: {
      products: [String],
      services: [String],
      faq: [{
        question: String,
        answer: String
      }],
      team: [{
        name: String,
        role: String,
        expertise: [String]
      }]
    },
    // Prompts configurables pour différents contextes
    prompts: {
      // Prompt système de base pour définir la personnalité de l'assistant
      baseSystemPrompt: {
        type: String,
        default: `Vous êtes Lydia, l'assistant vocal intelligent de {{companyName}}. 
                 Votre mission est d'aider les clients avec professionnalisme et efficacité.
                 Adaptez votre ton à l'identité de l'entreprise et aux besoins du client.`
      },
      // Prompts pour des scénarios spécifiques
      welcomePrompt: {
        type: String,
        default: `Bonjour et bienvenue chez {{companyName}}. Je suis Lydia, votre assistant virtuel. Comment puis-je vous aider aujourd'hui?`
      },
      transferPrompt: {
        type: String,
        default: `Je vais vous transférer à un conseiller {{companyName}} qui pourra mieux vous aider avec cette demande. Merci de patienter un instant.`
      },
      // Scénarios personnalisables
      scenarios: [{
        name: {
          type: String,
          required: true
        },
        description: String,
        prompt: {
          type: String,
          required: true
        },
        // Variables requises pour ce scénario
        requiredVariables: [String],
        // Déclencheurs pour activer ce scénario
        triggers: [String],
        // Actions possibles que l'assistant peut prendre
        actions: [{
          name: String,
          description: String,
          // Instructions pour l'IA sur comment exécuter cette action
          implementation: String
        }]
      }]
    },
    // Configuration de la voix
    voice: {
      gender: {
        type: String,
        enum: ['male', 'female'],
        default: 'female'
      },
      accent: {
        type: String,
        default: 'french'
      },
      speed: {
        type: Number,
        min: 0.5,
        max: 2.0,
        default: 1.0
      },
      pitch: {
        type: Number,
        min: 0.5,
        max: 2.0,
        default: 1.0
      },
      // Ajout des configurations Fish Audio
      provider: {
        type: String,
        enum: ['fishaudio', 'fonoster', 'twilio', 'custom'],
        default: 'fonoster'
      },
      voiceId: {
        type: String,
        default: 'fr_female_1' // ID par défaut pour Fish Audio
      },
      customVoiceId: String, // ID d'une voix personnalisée
      customVoiceName: String, // Nom d'une voix personnalisée
      // Format audio préféré
      format: {
        type: String,
        enum: ['mp3', 'wav', 'ogg'],
        default: 'mp3'
      }
    }
  },
  customResponses: [{
    keyword: String,
    response: String
  }]
}, {
  timestamps: true
});

// Créer des index pour améliorer les performances des recherches
CompanySchema.index({ 'address.city': 1, 'address.country': 1 });

// Méthode pour vérifier si l'entreprise est ouverte à un moment donné
CompanySchema.methods.isOpenNow = function() {
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[now.getDay()];
  
  const dayConfig = this.businessHours[currentDay];
  
  if (dayConfig.closed) return false;
  
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  return currentTime >= dayConfig.open && currentTime <= dayConfig.close;
};

// Méthode pour trouver une réponse personnalisée
CompanySchema.methods.findCustomResponse = function(query) {
  if (!this.customResponses || this.customResponses.length === 0) return null;
  
  const normalizedQuery = query.toLowerCase();
  
  for (const customResponse of this.customResponses) {
    if (normalizedQuery.includes(customResponse.keyword.toLowerCase())) {
      return customResponse.response;
    }
  }
  
  return null;
};

// Méthode pour générer un prompt adapté à un scénario spécifique
CompanySchema.methods.generatePromptForScenario = function(scenarioName, variables = {}) {
  if (!this.voiceAssistant || !this.voiceAssistant.prompts || !this.voiceAssistant.prompts.scenarios) {
    return null;
  }
  
  const scenario = this.voiceAssistant.prompts.scenarios.find(s => s.name === scenarioName);
  if (!scenario) {
    return null;
  }
  
  // Ajouter les variables de base
  const allVariables = {
    companyName: this.name,
    ...variables
  };
  
  // Vérifier que toutes les variables requises sont présentes
  const missingVars = scenario.requiredVariables.filter(varName => !allVariables[varName]);
  if (missingVars.length > 0) {
    throw new Error(`Variables manquantes pour le scénario ${scenarioName}: ${missingVars.join(', ')}`);
  }
  
  // Remplacer les variables dans le prompt
  let prompt = scenario.prompt;
  for (const [key, value] of Object.entries(allVariables)) {
    prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  
  return prompt;
};

const Company = mongoose.model('Company', CompanySchema);

module.exports = Company; 
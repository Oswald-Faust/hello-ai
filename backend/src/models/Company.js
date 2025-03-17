const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schéma pour les entreprises utilisant Lydia
 */
const CompanySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Le nom de l\'entreprise est requis'],
    trim: true
  },
  address: {
    street: String,
    city: String,
    zipCode: String,
    country: String
  },
  phoneNumber: {
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
  industry: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    default: '1-10'
  },
  logo: {
    type: String,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active'
    }
  },
  settings: {
    callHandling: {
      welcomeMessage: {
        type: String,
        default: 'Bienvenue chez notre entreprise. Comment puis-je vous aider aujourd\'hui?'
      },
      transferMessage: {
        type: String,
        default: 'Je vais vous transférer à un de nos agents. Veuillez patienter un instant.'
      },
      voicemail: {
        enabled: {
          type: Boolean,
          default: true
        },
        message: {
          type: String,
          default: 'Nous ne sommes pas disponibles pour le moment. Veuillez laisser un message après le bip.'
        }
      }
    },
    businessHours: {
      monday: { start: String, end: String },
      tuesday: { start: String, end: String },
      wednesday: { start: String, end: String },
      thursday: { start: String, end: String },
      friday: { start: String, end: String },
      saturday: { start: String, end: String },
      sunday: { start: String, end: String }
    },
    notifications: {
      email: {
        enabled: {
          type: Boolean,
          default: true
        },
        recipients: [String]
      },
      sms: {
        enabled: {
          type: Boolean,
          default: false
        },
        recipients: [String]
      }
    }
  }
}, {
  timestamps: true
});

// Créer des index pour améliorer les performances des recherches
CompanySchema.index({ name: 1 });
CompanySchema.index({ 'subscription.status': 1 });

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

const Company = mongoose.model('Company', CompanySchema);

module.exports = Company; 
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
  }
}, {
  timestamps: true
});

// Créer des index pour améliorer les performances des recherches
CompanySchema.index({ name: 1 });
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

const Company = mongoose.model('Company', CompanySchema);

module.exports = Company; 
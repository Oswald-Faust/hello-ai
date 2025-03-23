const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schéma pour les appels traités par Lydia
 */
const CallSchema = new Schema({
  // Informations de base sur l'appel
  callSid: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  from: {
    type: String,
    required: true,
    trim: true
  },
  to: {
    type: String,
    required: true,
    trim: true
  },
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    default: 'inbound'
  },
  
  // Statut et durée
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'in-progress', 'completed', 'failed', 'busy', 'no-answer', 'canceled'],
    default: 'initiated'
  },
  duration: {
    type: Number,
    default: 0
  },
  
  // Informations sur la conversation
  recordingUrl: {
    type: String,
    trim: true
  },
  recordingSid: {
    type: String,
    trim: true
  },
  recordingDuration: {
    type: Number
  },
  recordingStatus: {
    type: String,
    enum: ['in-progress', 'completed', 'failed'],
  },
  transcription: {
    type: String,
    trim: true
  },
  transcriptionSid: {
    type: String,
    trim: true
  },
  transcriptionStatus: {
    type: String,
    enum: ['in-progress', 'completed', 'failed'],
  },
  notes: {
    type: String,
    trim: true
  },
  
  // Analyse et traitement
  sentiment: {
    score: {
      type: Number,
      min: -1,
      max: 1
    },
    label: {
      type: String,
      enum: ['negative', 'neutral', 'positive']
    }
  },
  transferredTo: {
    type: String,
    trim: true
  },
  transferredAt: {
    type: Date
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  conversation: [{
    speaker: {
      type: String,
      enum: ['system', 'caller', 'agent'],
      required: true
    },
    text: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Métadonnées
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Créer des index pour améliorer les performances des recherches
CallSchema.index({ company: 1 });
CallSchema.index({ from: 1 });
CallSchema.index({ status: 1 });
CallSchema.index({ createdAt: 1 });

// Méthode pour calculer la durée de l'appel
CallSchema.methods.calculateDuration = function() {
  if (this.endTime && this.startTime) {
    this.duration = Math.round((this.endTime - this.startTime) / 1000);
  }
  return this.duration;
};

// Méthode pour ajouter une entrée au transcript
CallSchema.methods.addToTranscript = function(speaker, text) {
  this.transcript.push({
    speaker,
    text,
    timestamp: new Date()
  });
  return this;
};

// Méthode pour terminer l'appel
CallSchema.methods.endCall = function(status = 'terminé') {
  this.status = status;
  this.endTime = new Date();
  this.calculateDuration();
  return this;
};

const Call = mongoose.model('Call', CallSchema);

module.exports = Call; 
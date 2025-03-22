'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

interface PlanFeature {
  name: string;
  included: boolean | string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    annually: number;
  };
  currency: string;
  featured?: boolean;
  cta: string;
  features: PlanFeature[];
  gradient?: string;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Démarrage',
    description: 'Idéal pour les petites entreprises qui commencent',
    price: {
      monthly: 29,
      annually: 19,
    },
    currency: '€',
    cta: 'Commencer gratuitement',
    features: [
      { name: 'Jusqu\'à 1 000 requêtes/mois', included: true },
      { name: 'Assistance vocale de base', included: true },
      { name: 'Intégration site web', included: true },
      { name: '1 canal de communication', included: true },
      { name: 'Analyses basiques', included: true },
      { name: 'Support par email', included: true },
      { name: 'Personnalisation avancée', included: false },
      { name: 'API avancée', included: false },
      { name: 'Fonctions multi-langues', included: false },
      { name: 'Support 24/7', included: false },
    ],
    gradient: 'from-blue-600 to-cyan-600',
  },
  {
    id: 'pro',
    name: 'Professionnel',
    description: 'Pour les entreprises en croissance avec des besoins plus importants',
    price: {
      monthly: 79,
      annually: 59,
    },
    currency: '€',
    featured: true,
    cta: 'Essai gratuit de 14 jours',
    features: [
      { name: 'Jusqu\'à 10 000 requêtes/mois', included: true },
      { name: 'Assistance vocale avancée', included: true },
      { name: 'Intégration multi-plateforme', included: true },
      { name: '5 canaux de communication', included: true },
      { name: 'Analyses détaillées', included: true },
      { name: 'Support prioritaire', included: true },
      { name: 'Personnalisation avancée', included: true },
      { name: 'API avancée', included: true },
      { name: 'Fonctions multi-langues', included: '15 langues' },
      { name: 'Support 24/7', included: false },
    ],
    gradient: 'from-violet-600 to-indigo-600',
  },
  {
    id: 'enterprise',
    name: 'Entreprise',
    description: 'Solutions personnalisées pour les grandes organisations',
    price: {
      monthly: 199,
      annually: 149,
    },
    currency: '€',
    cta: 'Contacter l\'équipe commerciale',
    features: [
      { name: 'Requêtes illimitées', included: true },
      { name: 'Suite complète d\'assistance vocale', included: true },
      { name: 'Intégration sur mesure', included: true },
      { name: 'Canaux illimités', included: true },
      { name: 'Analyses avancées & IA', included: true },
      { name: 'Gestionnaire de compte dédié', included: true },
      { name: 'Personnalisation totale', included: true },
      { name: 'API complète & webhooks', included: true },
      { name: 'Fonctions multi-langues', included: '40+ langues' },
      { name: 'Support 24/7 prioritaire', included: true },
    ],
    gradient: 'from-amber-600 to-orange-600',
  },
];

const PricingTable = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.6, 1, 1, 0.6]);
  
  return (
    <motion.section 
      ref={containerRef}
      id="pricing" 
      className="relative py-24 overflow-hidden bg-slate-950"
      style={{ opacity }}
    >
      {/* Arrière-plan décoratif */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div 
            className="inline-block mb-3 px-4 py-1 rounded-full bg-violet-500/10 text-violet-400 text-sm font-medium backdrop-blur-sm border border-violet-500/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Tarification
          </motion.div>
          
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Des tarifs adaptés à vos besoins
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-300 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Choisissez l'offre qui correspond le mieux à votre entreprise, avec possibilité d'évoluer à tout moment
          </motion.p>
          
          {/* Switch Mensuel/Annuel */}
          <motion.div 
            className="flex items-center justify-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className={`mr-3 text-sm font-medium ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>Mensuel</span>
            
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${isAnnual ? 'bg-gradient-to-r from-violet-600 to-indigo-600' : 'bg-slate-700'}`}
            >
              <span className="sr-only">Toggle billing frequency</span>
              <motion.span 
                layout
                transition={{type: "spring", stiffness: 500, damping: 30}}
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ${isAnnual ? 'translate-x-7' : 'translate-x-1'}`} 
              />
            </button>
            
            <div className="ml-3 flex items-center">
              <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-gray-400'}`}>Annuel</span>
              <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                -25%
              </span>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`relative rounded-2xl backdrop-blur-sm overflow-hidden transition-all duration-300 ${
                plan.featured ? 'md:-translate-y-4 md:scale-105 z-10' : ''
              }`}
              whileHover={{ 
                y: -5,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)"
              }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              {/* Effet de bordure */}
              <div className="absolute inset-0 rounded-2xl p-0.5 bg-gradient-to-b from-white/20 to-white/5"></div>
              
              {/* Badge populaire */}
              {plan.featured && (
                <div className="absolute top-0 right-6 transform -translate-y-1/2">
                  <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${plan.gradient} text-white text-xs font-bold shadow-lg`}>
                    Le plus populaire
                  </div>
                </div>
              )}
              
              {/* Contenu de la carte */}
              <div className={`h-full rounded-2xl bg-slate-900/90 backdrop-blur-sm p-8 ${plan.featured ? 'bg-slate-900/80 border-violet-500/20' : 'border-gray-800/50'}`}>
                <div className="flex flex-col h-full">
                  {/* Entête de la carte */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-gray-400 text-sm">{plan.description}</p>
                  </div>
                  
                  {/* Prix */}
                  <div className="mb-6">
                    <div className="flex items-end">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={isAnnual ? 'annual' : 'monthly'}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-baseline"
                        >
                          <span className="text-4xl font-bold text-white">
                            {plan.currency}
                            {isAnnual ? plan.price.annually : plan.price.monthly}
                          </span>
                          <span className="text-gray-400 text-lg ml-1">/mois</span>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    
                    {isAnnual && (
                      <div className="text-sm text-indigo-400 mt-1">
                        Facturé annuellement ({plan.currency}{plan.price.annually * 12}/an)
                      </div>
                    )}
                  </div>
                  
                  {/* Liste des fonctionnalités */}
                  <div className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          {feature.included ? (
                            <svg className={`h-5 w-5 ${plan.featured ? 'text-violet-400' : 'text-green-500'}`} viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-3 text-sm text-gray-300">
                          {typeof feature.included === 'string' ? (
                            <>
                              <span className="text-white font-medium">{feature.name}</span>
                              <span className="ml-1">({feature.included})</span>
                            </>
                          ) : (
                            <span className={feature.included ? 'text-white' : 'text-gray-500'}>
                              {feature.name}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Bouton d'action */}
                  <div className="mt-auto">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`w-full py-3 px-4 rounded-xl font-medium text-white ${
                        plan.featured
                          ? `bg-gradient-to-r ${plan.gradient} shadow-lg hover:shadow-${plan.id}-lg/50`
                          : 'bg-slate-800 hover:bg-slate-700 border border-gray-700'
                      } transition-all duration-300`}
                    >
                      {plan.cta}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Section FAQ rapide */}
        <div className="mt-24 max-w-3xl mx-auto">
          <motion.h3 
            className="text-2xl font-bold text-white mb-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Questions fréquentes sur la tarification
          </motion.h3>
          
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {[
              {
                question: "Puis-je changer d'offre à tout moment ?",
                answer: "Oui, vous pouvez passer à une offre supérieure à tout moment. Le changement prend effet immédiatement et la facturation est ajustée au prorata."
              },
              {
                question: "Y a-t-il des frais cachés ?",
                answer: "Non, nos tarifs sont transparents. Vous ne payez que ce qui est indiqué, sans surprise."
              },
              {
                question: "Comment fonctionne l'essai gratuit ?",
                answer: "L'essai gratuit de 14 jours vous donne accès à toutes les fonctionnalités de l'offre Professionnelle. Aucune carte bancaire n'est requise pour démarrer."
              }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                className="p-6 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-gray-800/50"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 + (i * 0.1) }}
              >
                <h4 className="text-white font-medium mb-2">{item.question}</h4>
                <p className="text-gray-400 text-sm">{item.answer}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default PricingTable; 
'use client';

import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const features = [
  {
    id: 'multi-platform',
    title: 'Multi-plateforme',
    description: 'Gérez votre assistant vocal depuis n\'importe quel appareil avec notre application mobile et web synchronisée.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    id: 'voice-recognition',
    title: 'Reconnaissance vocale',
    description: 'Notre technologie IA avancée comprend plus de 40 langues et dialectes avec une précision inégalée.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    )
  },
  {
    id: 'analytics',
    title: 'Analyses détaillées',
    description: 'Suivez les performances en temps réel et obtenez des insights précieux sur les interactions client.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    id: 'customization',
    title: 'Personnalisation totale',
    description: 'Adaptez votre assistant à votre image de marque et créez des scénarios de conversation sur mesure.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    id: 'integrations',
    title: 'Intégrations avancées',
    description: 'Connectez-vous facilement à plus de 30 plateformes comme Salesforce, Slack, et vos systèmes CRM.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    id: 'security',
    title: 'Sécurité renforcée',
    description: 'Protégez les données sensibles avec un chiffrement de niveau bancaire et conformité RGPD.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )
  }
];

const screenMockups = {
  'multi-platform': '/images/dashboard.webp',
  'voice-recognition': '/images/voice.webp',
  'analytics': '/images/analytics.webp',
  'customization': '/images/custom.webp',
  'integrations': '/images/integration.webp',
  'security': '/images/security.webp'
};

const AppShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFeature, setActiveFeature] = useState('multi-platform');
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1
  });

  return (
    <motion.section
      ref={containerRef}
      id="app-showcase"
      className="relative py-24 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950/95 to-violet-950/10"
      style={{ opacity }}
    >
      {/* Arrière-plan décoratif */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_70%_30%,theme(colors.violet.900/20),transparent)]"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div 
            className="inline-block mb-3 px-4 py-1 rounded-full bg-violet-500/10 text-violet-400 text-sm font-medium backdrop-blur-sm border border-violet-500/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Application mobile
          </motion.div>
          
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Votre assistant vocal,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
              partout avec vous
            </span>
          </motion.h2>
          
          <motion.p
            className="max-w-2xl mx-auto text-xl text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Contrôlez Lydia où que vous soyez grâce à notre application intuitive
          </motion.p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Phone Mockup avec écrans dynamiques */}
          <motion.div 
            ref={ref}
            className="w-full lg:w-1/2 flex justify-center"
            style={{ y }}
          >
            <div className="relative w-[280px] h-[580px]">
              {/* Téléphone mockup */}
              <div className="absolute inset-0 rounded-[40px] border-8 border-gray-800 bg-gray-800 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-6 bg-gray-800 flex justify-center items-end pb-1">
                  <div className="w-20 h-4 bg-gray-900 rounded-b-xl"></div>
                </div>
                
                {/* Écran */}
                <div className="absolute top-6 left-0 right-0 bottom-0 overflow-hidden bg-slate-900">
                  {/* Contenu d'écran dynamique */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeFeature}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ duration: 0.5 }}
                      className="w-full h-full bg-gradient-to-br from-slate-900 via-violet-950/30 to-slate-900 flex items-center justify-center"
                    >
                      {/* Contenu d'écran simulé */}
                      <div className="w-full h-full p-4 flex flex-col">
                        {/* Header de l'app */}
                        <div className="flex justify-between items-center mb-5">
                          <div className="text-white font-bold">Lydia</div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                          </div>
                        </div>
                        
                        {/* Contenu principal */}
                        <div className="flex-1 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center text-white">
                            {features.find(f => f.id === activeFeature)?.icon}
                          </div>
                        </div>
                        
                        {/* Footer de l'app */}
                        <div className="pt-4 border-t border-gray-800">
                          <div className="text-center text-sm text-violet-300 font-medium">
                            {features.find(f => f.id === activeFeature)?.title}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                {/* Bouton Home */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-gray-700 rounded-full"></div>
              </div>
              
              {/* Effet de surbrillance */}
              <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 rounded-[60px] blur-xl opacity-50 -z-10"></div>
              
              {/* Effet de flottement */}
              <motion.div 
                className="absolute -inset-0.5 rounded-[40px] bg-gradient-to-r from-violet-500/30 to-indigo-500/30 -z-10"
                animate={{ 
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              ></motion.div>
            </div>
          </motion.div>
          
          {/* Liste des fonctionnalités */}
          <div className="w-full lg:w-1/2">
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${activeFeature === feature.id ? 'bg-violet-900/30 border border-violet-500/30' : 'bg-slate-900/50 hover:bg-slate-900/70 border border-gray-800/50'}`}
                  onClick={() => setActiveFeature(feature.id)}
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${activeFeature === feature.id ? 'bg-gradient-to-r from-violet-600 to-indigo-600' : 'bg-violet-900/30'} text-white`}>
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                  
                  {activeFeature === feature.id && (
                    <motion.div 
                      className="mt-4 flex items-center gap-2 text-violet-400 text-sm font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span>Voir l'aperçu</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* Téléchargement */}
            <motion.div 
              className="mt-12 flex flex-wrap justify-center lg:justify-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <button className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl transition-all duration-300 border border-gray-700/50">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.46-3.19-.1-1.19-.59-2.3-.6-3.57 0-1.65.78-2.5.55-3.33-.11-5.05-4.09-5.32-11.97 1.13-12.07 1.5.05 2.54.95 3.33.95.74 0 2.16-1.17 3.84-.99.66.03 2.5.26 3.67 1.98-9.32 3.72-2.33 13.57 1.12 9.34zm-4.25-18.28c-3.18.14-5.8 3.33-5.31 5.95 2.71.22 5.62-2.91 5.31-5.95z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs text-gray-400">Télécharger sur</div>
                  <div className="text-sm font-bold">App Store</div>
                </div>
              </button>
              
              <button className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl transition-all duration-300 border border-gray-700/50">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814 13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92ZM14.816 13l2.65 2.65c.173.173.454.425.815.613.95.496 1.735.125 1.735-.902v-5.724c0-1.026-.785-1.398-1.735-.902-.36.188-.642.44-.814.613l-2.651 2.65Zm-3.932 3.932 1.767 1.767c.14.14.345.238.584.32a1 1 0 0 1-.435.848l-7.143 4.286a1 1 0 0 1-1.54-.737v-7.044c0-.182.049-.359.142-.514l.044-.066 6.58 1.14Zm-.803-9.864L3.5 8.029l-.072-.046a1 1 0 0 1-.143-.514V.426a1 1 0 0 1 1.54-.737l7.143 4.286a1 1 0 0 1 .435.848c-.239.081-.443.18-.582.319l-1.769 1.767Z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs text-gray-400">Télécharger sur</div>
                  <div className="text-sm font-bold">Google Play</div>
                </div>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default AppShowcase; 
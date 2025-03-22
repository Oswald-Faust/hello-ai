'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';

const steps = [
  {
    number: '01',
    title: 'Créez votre compte',
    description: 'Inscrivez-vous en quelques secondes et configurez votre profil Lydia selon vos besoins spécifiques.',
    image: '/images/setup.webp',
    gradient: 'from-violet-600 to-indigo-600'
  },
  {
    number: '02',
    title: 'Intégrez à vos canaux',
    description: 'Connectez Lydia à vos plateformes existantes: site web, applications, téléphonie, médias sociaux.',
    image: '/images/integration.webp',
    gradient: 'from-fuchsia-600 to-violet-600'
  },
  {
    number: '03',
    title: 'Personnalisez votre IA',
    description: 'Adaptez les réponses, le ton et les connaissances spécifiques à votre secteur et votre marque.',
    image: '/images/customize.webp',
    gradient: 'from-sky-600 to-blue-600'
  },
  {
    number: '04',
    title: 'Analysez et optimisez',
    description: 'Suivez les performances en temps réel et améliorez continuellement grâce aux insights intelligents.',
    image: '/images/analyze.webp',
    gradient: 'from-emerald-600 to-teal-600'
  }
];

const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.6, 1, 1, 0.6]);
  
  return (
    <motion.section 
      ref={containerRef}
      id="how-it-works"
      className="relative py-24 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950"
      style={{ opacity }}
    >
      {/* Arrière-plan décoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_farthest-side_at_80%_80%,theme(colors.violet.900/20),transparent)] animate-[spin_60s_linear_infinite]"></div>
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"></div>
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
            Comment ça marche
          </motion.div>
          
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Simple, rapide, efficace
          </motion.h2>
          
          <motion.p
            className="max-w-2xl mx-auto text-xl text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Découvrez comment Lydia transforme votre service client en 4 étapes simples
          </motion.p>
        </div>
        
        <div className="relative">
          {/* Ligne de progression verticale */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-600/50 via-indigo-600/50 to-purple-600/50 hidden md:block"></div>
          
          {steps.map((step, index) => {
            const [ref, inView] = useInView({
              triggerOnce: true,
              threshold: 0.2
            });
            
            const isEven = index % 2 === 0;
            
            return (
              <motion.div
                key={index}
                ref={ref}
                className={`relative mb-20 md:mb-32 last:mb-0 flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.7, delay: 0.1 * index }}
              >
                {/* Point sur la ligne de progression */}
                <div className="absolute left-1/2 md:left-1/2 top-0 w-8 h-8 -ml-4 rounded-full bg-slate-800 border-2 border-violet-500 hidden md:flex items-center justify-center z-10">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${step.gradient}`}></div>
                </div>
                
                {/* Contenu informatif */}
                <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-16 text-right' : 'md:pl-16 text-left'} flex flex-col ${isEven ? 'md:items-end' : 'md:items-start'}`}>
                  <div className={`px-3 py-1 mb-4 rounded-lg bg-gradient-to-r ${step.gradient} text-white font-mono font-bold inline-flex items-center gap-2`}>
                    <span>{step.number}</span>
                    <div className="w-1 h-4 bg-white/30 rounded-full"></div>
                    <span>ÉTAPE</span>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-300 max-w-md">
                    {step.description}
                  </p>
                </div>
                
                {/* Image/Illustration */}
                <div className="w-full md:w-1/2 relative h-64 md:h-80">
                  <div className="absolute inset-0 rounded-xl overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-20`}></div>
                    
                    <div className="relative w-full h-full flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                      <div className="relative w-full h-full p-6">
                        <div className="absolute inset-0 flex items-center justify-center">
                          {/* Remplacer par de vraies images */}
                          <div className={`w-24 h-24 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white`}>
                            {index === 0 && (
                              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            )}
                            {index === 1 && (
                              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                            {index === 2 && (
                              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            )}
                            {index === 3 && (
                              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            )}
                          </div>
                        </div>
                        
                        {/* Éléments décoratifs */}
                        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 backdrop-blur-sm"></div>
                        <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/10 to-indigo-500/10 backdrop-blur-sm"></div>
                        
                        {/* Grille décorative */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.violet.900/5)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.violet.900/5)_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Call-to-action */}
        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <a 
            href="#pricing" 
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full font-medium hover:shadow-lg hover:shadow-violet-600/20 transition-all duration-300"
          >
            Commencer votre parcours
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HowItWorks; 
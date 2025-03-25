'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const FinalCTA = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 50, 
        damping: 15 
      } 
    }
  };

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-slate-950 to-indigo-950">
      {/* Cercles décoratifs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl"></div>
        <div className="absolute -left-40 top-1/3 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl"></div>
        <div className="absolute right-20 bottom-20 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl"></div>
      </div>
      
      {/* Motif en grille */}
      <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10"></div>
      
      <div className="container max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ 
            duration: 0.8, 
            ease: [0.22, 1, 0.36, 1] 
          }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Transformez votre <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">expérience client</span> <br className="hidden md:block" />
            avec l'IA vocale de demain
          </h2>
          <p className="text-xl text-indigo-100/80 mx-auto max-w-3xl">
            Rejoignez les entreprises visionnaires qui ont déjà adopté Lydia et redéfinissez l'expérience client à l'ère de l'intelligence artificielle.
          </p>
        </motion.div>
        
        {/* Stats impressionnantes */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 mb-20"
        >
          {[
            { number: '+98%', label: 'de satisfaction client', gradient: 'from-blue-500 to-cyan-400' },
            { number: '-45%', label: 'de temps d\'attente', gradient: 'from-violet-600 to-indigo-400' },
            { number: '+250%', label: 'de conversion', gradient: 'from-pink-500 to-rose-400' },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              className="flex flex-col items-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <span className={`text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${stat.gradient}`}>
                {stat.number}
              </span>
              <span className="mt-2 text-white/80 text-lg">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Section finale CTA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 to-violet-800/90"></div>
          <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5 mix-blend-overlay"></div>
          
          <div className="relative flex flex-col md:flex-row items-center px-8 py-16 md:p-16">
            <div className="w-full md:w-3/5 mb-10 md:mb-0 md:pr-10">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Prêt à offrir une expérience vocale exceptionnelle ?
              </h3>
              <p className="text-white/80 text-lg mb-8">
                Démarrez dès aujourd'hui et voyez comment Lydia peut transformer votre service client. Configuration en quelques minutes, résultats immédiats.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/signup">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-white text-indigo-900 font-medium rounded-xl hover:shadow-lg hover:shadow-white/20 transition-all duration-300"
                  >
                    Commencer gratuitement
                  </motion.button>
                </Link>
                <Link href="/demo">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-indigo-900/50 text-white font-medium rounded-xl border border-white/20 hover:bg-indigo-900/80 transition-all duration-300"
                  >
                    Demander une démo
                  </motion.button>
                </Link>
              </div>
              
              <div className="mt-8 flex items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(num => (
                    <div key={num} className="w-10 h-10 rounded-full border-2 border-indigo-600 overflow-hidden">
                      <div className={`w-full h-full bg-gradient-to-br from-indigo-${num*100} to-violet-${num*100} flex items-center justify-center text-white font-medium`}>
                        {['A', 'M', 'S', 'K'][num-1]}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="ml-4">
                  <div className="flex gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-white text-sm">Plus de 1200+ avis positifs</p>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-2/5">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-3xl blur-md"></div>
                <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-indigo-500/20 shadow-2xl">
                  <div className="p-1 bg-gradient-to-r from-indigo-500/20 to-violet-500/20">
                    <div className="h-3 w-3 rounded-full bg-rose-500 inline-block mr-2"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500 inline-block mr-2"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500 inline-block"></div>
                  </div>
                  <div className="p-6">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                      className="w-full h-full"
                    >
                      <div className="bg-slate-800 rounded-lg p-3 mb-3">
                        <p className="text-green-400 text-sm font-mono">$ node -v</p>
                        <p className="text-white text-sm font-mono">v18.16.0</p>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3 mb-3">
                        <p className="text-green-400 text-sm font-mono">$ npm install lydia-voice-ai</p>
                        <p className="text-white text-sm font-mono">Installing...</p>
                        <p className="text-white text-sm font-mono">✓ Package installed successfully</p>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3">
                        <p className="text-green-400 text-sm font-mono">$ lydia init</p>
                        <p className="text-white text-sm font-mono">🎙️ Initializing Lydia Voice AI...</p>
                        <p className="text-white text-sm font-mono">🚀 Configuration completed!</p>
                        <p className="text-white text-sm font-mono">🌐 Votre assistant vocal est prêt!</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Logo clients */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-24 text-center"
        >
          <p className="text-white/60 uppercase tracking-widest text-sm mb-8">Ils nous font confiance</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {['Microsoft', 'Orange', 'Total', 'Canal+', 'AirFrance', 'BNP'].map((company, i) => (
              <div key={i} className="text-white/40 hover:text-white/70 transition-all duration-300 text-xl md:text-2xl font-bold">
                {company}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA; 
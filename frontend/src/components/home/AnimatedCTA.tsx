'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import useMouseParallax from '@/hooks/useMouseParallax';

const AnimatedCTA = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [activeAnimation, setActiveAnimation] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  // Effets de parallaxe basés sur le scroll
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8], [0, 1, 1]);
  const y = useTransform(scrollYProgress, [0, 0.4], [80, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [0.9, 1]);

  // Effet de parallaxe basé sur la position de la souris
  const { x: shapeX1, y: shapeY1 } = useMouseParallax({ 
    strength: 0.02, 
    maxMovement: 40 
  });
  
  const { x: shapeX2, y: shapeY2 } = useMouseParallax({ 
    strength: 0.04, 
    maxMovement: 50,
    reverse: true
  });
  
  const { x: shapeX3, y: shapeY3 } = useMouseParallax({ 
    strength: 0.03, 
    maxMovement: 30,
  });
  
  const handleHover = (index: number | null) => {
    setActiveAnimation(index);
    setHovered(index !== null);
  };
  
  const buttonVariants = {
    hover: { 
      scale: 1.05,
      boxShadow: "0 10px 25px -5px rgba(109, 40, 217, 0.4)",
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { 
      scale: 0.98,
      boxShadow: "0 5px 15px -5px rgba(109, 40, 217, 0.4)",
    }
  };
  
  // Animation des particules
  const particleVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (i: number) => ({
      opacity: [0.3, 0.8, 0.3],
      scale: [1, 1.2, 1],
      y: [0, -20, 0],
      transition: {
        delay: i * 0.1,
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    })
  };

  return (
    <motion.div 
      ref={containerRef}
      className="relative py-32 overflow-hidden bg-gradient-to-br from-slate-950 via-violet-950/60 to-slate-950"
      style={{ opacity }}
    >
      {/* Arrière-plan avec gradient animé */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent animate-pulse-slow" />
      </div>
      
      {/* Grille futuriste */}
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm">
        <div className="h-full w-full bg-[linear-gradient(to_right,theme(colors.slate.900/10)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.slate.900/10)_1px,transparent_1px)] bg-[size:4rem_4rem]">
          <div className="h-full w-full bg-[radial-gradient(circle_300px_at_center,theme(colors.violet.900/20),transparent)]" />
        </div>
      </div>
      
      {/* Cercles lumineux interactifs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[20%] left-[15%] w-[25rem] h-[25rem] rounded-full bg-gradient-to-r from-violet-600/20 to-indigo-600/5 blur-[6rem]"
          style={{ x: shapeX1, y: shapeY1 }}
          animate={{ 
            opacity: hovered ? [0.2, 0.5, 0.2] : 0.2,
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        />
        <motion.div
          className="absolute bottom-[10%] right-[5%] w-[20rem] h-[20rem] rounded-full bg-gradient-to-r from-fuchsia-600/10 to-violet-600/10 blur-[5rem]"
          style={{ x: shapeX2, y: shapeY2 }}
          animate={{ 
            opacity: hovered ? [0.15, 0.3, 0.15] : 0.15,
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        />
        <motion.div
          className="absolute bottom-[30%] left-[50%] w-[15rem] h-[15rem] rounded-full bg-gradient-to-r from-sky-600/10 to-blue-600/5 blur-[4rem]"
          style={{ x: shapeX3, y: shapeY3 }}
          animate={{ 
            opacity: hovered ? [0.1, 0.25, 0.1] : 0.1,
          }}
          transition={{ 
            duration: 3.5, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        />
      </div>
      
      {/* Particules flottantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 25 }).map((_, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={particleVariants}
            initial="hidden"
            animate="visible"
            className="absolute w-1 h-1 rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.3,
            }}
          />
        ))}
      </div>
      
      {/* Contenu principal */}
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          style={{ y, scale }}
        >
          <motion.div 
            className="inline-block mb-5 px-4 py-1 rounded-full bg-violet-500/10 text-violet-300 text-sm font-medium backdrop-blur-sm border border-violet-500/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Commencez dès aujourd'hui
          </motion.div>
          
          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Transformez vos{' '}
            <span className="relative inline-block">
              communications
              <motion.span 
                className="absolute bottom-2 left-0 w-full h-2 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full -z-10 opacity-70"
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
              />
            </span>{' '}
            vocales
          </motion.h2>
          
          <motion.p
            className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Rejoignez des milliers d'entreprises qui ont révolutionné leur service client grâce à Lydia. 
            Une IA qui comprend, apprend et s'adapte à vos besoins.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row justify-center items-center gap-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <motion.div
              onMouseEnter={() => handleHover(0)}
              onMouseLeave={() => handleHover(null)}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="relative group"
            >
              <AnimatePresence>
                {activeAnimation === 0 && (
                  <motion.div 
                    className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 opacity-75 blur-sm group-hover:opacity-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>
              
              <Link href="/auth/register" className="relative block">
                <Button
                  size="lg"
                  variant="secondary"
                  className="relative px-8 py-3.5 text-base rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-glow-lg transition-all duration-300 border-0"
                >
                  <span className="mr-2">Commencer gratuitement</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              onMouseEnter={() => handleHover(1)}
              onMouseLeave={() => handleHover(null)}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="relative"
            >
              <Link href="#demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-3.5 text-base rounded-full border-violet-500/40 text-white hover:bg-violet-800/20 transition-all duration-300 backdrop-blur-sm"
                >
                  <span className="mr-2">Voir la démo</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          
          <motion.div
            className="mt-12 text-violet-200/70 flex flex-wrap items-center justify-center gap-4 sm:gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Aucune carte requise</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Installation en 5 min</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Support 24/7</span>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Statistiques */}
        <motion.div
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          {[
            { value: "98%", label: "Taux de satisfaction client" },
            { value: "40%", label: "Réduction des coûts de service" },
            { value: "+450", label: "Entreprises utilisatrices" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              className="card-gradient p-6 rounded-xl backdrop-blur-sm border border-violet-500/10 hover-lift"
              whileHover={{ 
                y: -5, 
                boxShadow: "0 25px 50px -12px rgba(67, 56, 202, 0.25)" 
              }}
            >
              <motion.h3 
                className="text-4xl font-bold text-violet-300 mb-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                viewport={{ once: true }}
              >
                {stat.value}
              </motion.h3>
              <motion.p 
                className="text-gray-400"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 + (0.1 * i) }}
                viewport={{ once: true }}
              >
                {stat.label}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Vagues animées en bas */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-[80px] text-slate-950">
          <motion.path 
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
            className="fill-current"
            initial={{ pathLength: 0, pathOffset: 1 }}
            animate={{ pathLength: 1, pathOffset: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>
      </div>
    </motion.div>
  );
};

export default AnimatedCTA; 
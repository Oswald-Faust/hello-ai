'use client';

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface AnimatedFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient?: string;
  delay?: number;
  index?: number;
}

const AnimatedFeatureCard: React.FC<AnimatedFeatureCardProps> = ({
  icon,
  title,
  description,
  gradient = 'from-violet-600 to-indigo-600',
  delay = 0,
  index = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Valeurs pour l'effet 3D
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Effet de ressort pour des mouvements plus fluides
  const springConfig = { damping: 25, stiffness: 300 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);
  
  // Transformations pour les effets 3D
  const rotateX = useTransform(ySpring, [-100, 100], [10, -10]);
  const rotateY = useTransform(xSpring, [-100, 100], [-10, 10]);
  const glowX = useTransform(xSpring, [-100, 100], [-50, 50]);
  const glowY = useTransform(ySpring, [-100, 100], [-50, 50]);
  
  // Gestion du mouvement de la souris pour l'effet 3D
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };
  
  // Variantes pour les animations
  const cardVariants = {
    initial: { y: 50, opacity: 0, scale: 0.95 },
    animate: { 
      y: 0, 
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay: delay + (index * 0.1),
      }
    },
    hover: { 
      scale: 1.02,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 15
      }
    }
  };

  const iconVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.2,
      rotate: isHovered ? [0, -5, 5, 0] : 0,
      transition: {
        rotate: {
          repeat: Infinity,
          repeatType: "reverse",
          duration: 1
        },
        scale: {
          type: 'spring',
          stiffness: 400,
          damping: 10
        }
      }
    }
  };
  
  const shimmerVariants = {
    initial: {
      backgroundPosition: '0% 0%',
    },
    animate: {
      backgroundPosition: ['0% 0%', '100% 100%'],
      transition: {
        repeat: Infinity,
        repeatType: "mirror" as const,
        duration: 3,
        ease: "linear",
      }
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative overflow-hidden rounded-xl group perspective"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        boxShadow: isHovered 
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1), 0 0 30px 5px rgba(139, 92, 246, 0.15)'
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Effet de lueur de fond */}
      <motion.div 
        className={`absolute inset-0 opacity-0 bg-gradient-to-r ${gradient} blur-xl`}
        style={{ 
          opacity: useTransform(xSpring, [-100, 0, 100], [0.3, 0, 0.3]),
          transform: `translate(${glowX}px, ${glowY}px)` 
        }}
      />
      
      {/* Effet de bordure lumineuse */}
      <motion.div 
        className="absolute inset-0 rounded-xl overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-30`}
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
          style={{
            backgroundSize: '200% 200%',
          }}
        />
      </motion.div>
      
      {/* Contenu principal */}
      <div className="card-gradient p-8 z-10 relative h-full backdrop-blur-sm transform-style-3d">
        {/* Fond avec effet de gradient */}
        <motion.div
          className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient}`}
          animate={{ 
            height: isHovered ? '100%' : '3px', 
            opacity: isHovered ? 0.12 : 1 
          }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Icône avec effet avancé */}
        <motion.div
          className="relative w-14 h-14 rounded-xl flex items-center justify-center mb-6 transform-style-3d"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'translateZ(20px)',
          }}
          variants={iconVariants}
        >
          {/* Halo derrière l'icône */}
          <motion.div 
            className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} opacity-80 blur-md`}
            animate={{ 
              scale: isHovered ? [1, 1.2, 1] : 1,
              opacity: isHovered ? [0.5, 0.8, 0.5] : 0.5
            }}
            transition={{ 
              repeat: isHovered ? Infinity : 0,
              duration: 2
            }}
          />
          
          {/* Conteneur de l'icône */}
          <div className={`w-full h-full rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white p-3 shadow-lg`}>
            {icon}
          </div>
          
          {/* Effet de lumière */}
          <motion.div 
            className="absolute inset-0 rounded-xl bg-white opacity-0"
            animate={{ 
              opacity: isHovered ? [0, 0.3, 0] : 0
            }}
            transition={{ 
              repeat: isHovered ? Infinity : 0,
              duration: 1.5
            }}
          />
        </motion.div>
        
        {/* Contenu texte avec animation */}
        <motion.h3 
          className="text-xl font-bold mb-3 relative text-white"
          style={{
            transform: 'translateZ(10px)',
            textShadow: isHovered ? '0 0 10px rgba(139, 92, 246, 0.5)' : 'none'
          }}
        >
          {title}
          <motion.div
            className={`absolute -bottom-1 left-0 h-[2px] bg-gradient-to-r ${gradient}`}
            initial={{ width: 0 }}
            animate={{ width: isHovered ? '100%' : '30%' }}
            transition={{ duration: 0.3 }}
          />
        </motion.h3>
        
        <motion.p 
          className="text-gray-300 relative"
          style={{
            transform: 'translateZ(5px)',
          }}
        >
          {description}
        </motion.p>
        
        {/* Bouton Découvrir */}
        <motion.button
          className={`mt-6 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r ${gradient} bg-opacity-10 text-white border border-transparent hover:border-violet-500/30 flex items-center gap-1`}
          style={{
            transform: 'translateZ(15px)',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          transition={{ duration: 0.2 }}
        >
          En savoir plus
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </motion.button>
        
        {/* Points décoratifs */}
        <div className="absolute right-4 bottom-4 opacity-40">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className={`w-1 h-1 rounded-full bg-gradient-to-r ${gradient} inline-block ml-1`}
              animate={{ 
                scale: isHovered ? [1, 1.5, 1] : 1,
                opacity: isHovered ? [0.5, 1, 0.5] : 0.5
              }}
              transition={{ 
                repeat: isHovered ? Infinity : 0,
                duration: 1,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AnimatedFeatureCard; 
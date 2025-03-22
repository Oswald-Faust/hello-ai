'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sophie Martin',
    role: 'Directrice Marketing',
    company: 'InnovTech',
    quote: 'Lydia a complètement transformé notre service client. Notre taux de satisfaction a augmenté de 35% en seulement deux mois.',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5
  },
  {
    id: 2,
    name: 'Thomas Dubois',
    role: 'PDG',
    company: 'TechSolutions',
    quote: 'Nous avons réduit nos coûts de service client de 40% tout en améliorant la qualité des interactions. Un vrai game-changer pour notre entreprise.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5
  },
  {
    id: 3,
    name: 'Émilie Leclerc',
    role: 'Responsable Service Client',
    company: 'E-Commerce Plus',
    quote: 'Nos clients adorent l\'expérience avec Lydia. L\'IA comprend les intentions avec une précision remarquable et résout les problèmes rapidement.',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 4
  },
  {
    id: 4,
    name: 'Jean Moreau',
    role: 'Directeur Commercial',
    company: 'GlobalServe',
    quote: 'La facilité d\'intégration et la qualité des interactions ont dépassé nos attentes. Nous avons désormais plus de temps pour les cas complexes.',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    rating: 5
  }
];

const AnimatedTestimonials = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Effet de parallaxe au scroll
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const opacity = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);

  // Variantes pour l'animation du slider
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '60%' : '-60%',
      opacity: 0,
      scale: 0.9,
      filter: 'blur(4px)',
      rotateY: direction > 0 ? '-5deg' : '5deg'
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      rotateY: '0deg',
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-60%' : '60%',
      opacity: 0,
      scale: 0.9,
      filter: 'blur(4px)',
      rotateY: direction > 0 ? '5deg' : '-5deg',
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };
  
  // Animation pour les éléments décoratifs
  const decorationVariants = {
    animate: {
      y: [0, -10, 0],
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Animation pour le titre
  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };

  // Navigation vers la slide suivante/précédente
  const handleNext = () => {
    setDirection(1);
    setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  // Aller à une slide spécifique
  const handleDotClick = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  // Autoplay
  useEffect(() => {
    const startAutoplay = () => {
      autoplayRef.current = setInterval(() => {
        if (!isHovered) {
          handleNext();
        }
      }, 6000);
    };

    startAutoplay();

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [current, isHovered]);

  // Rendu des étoiles pour le rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <motion.svg
        key={i}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          transition: { delay: 0.3 + (i * 0.1), duration: 0.4 }
        }}
        className={`w-5 h-5 ${i < rating ? 'text-amber-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </motion.svg>
    ));
  };

  return (
    <motion.div 
      ref={sectionRef}
      className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8"
      style={{ opacity, background: "radial-gradient(circle at center, #0f172a, #020617)" }}
    >
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-violet-600/5"
            style={{
              width: `${Math.random() * 200 + 50}px`,
              height: `${Math.random() * 200 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(40px)',
            }}
            variants={decorationVariants}
            animate="animate"
            custom={i}
          />
        ))}
      </div>
      
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.div 
            className="inline-block mb-3 px-4 py-1 rounded-full bg-violet-500/10 text-violet-400 text-sm font-medium backdrop-blur-sm border border-violet-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Témoignages
          </motion.div>
          
          <motion.h2
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl mb-4"
          >
            Ce que nos clients disent
          </motion.h2>
          
          <motion.div
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            custom={2}
            className="max-w-2xl mx-auto text-xl text-gray-300"
          >
            Découvrez pourquoi les entreprises choisissent Lydia pour leurs communications vocales
          </motion.div>
        </div>

        <div className="relative px-4 sm:px-6 lg:px-8">
          <div 
            className="relative h-auto overflow-hidden rounded-3xl"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="relative w-full card-gradient p-8 sm:p-12 lg:p-16 backdrop-blur-sm"
                style={{ perspective: 1000 }}
              >
                <div className="grid md:grid-cols-12 gap-10 items-center">
                  {/* Avatar et rating */}
                  <div className="md:col-span-4 flex flex-col items-center md:items-start">
                    <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden shadow-2xl mb-5">
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 backdrop-blur-sm" />
                      <Image
                        src={testimonials[current].avatar}
                        alt={testimonials[current].name}
                        fill
                        sizes="(max-width: 640px) 7rem, 9rem"
                        className="object-cover z-10"
                      />
                      
                      {/* Gradient border */}
                      <div className="absolute inset-0 rounded-xl p-[2px] bg-gradient-to-r from-violet-500 to-indigo-500 -z-10" />
                      
                      {/* Glow effect */}
                      <div className="absolute -inset-3 bg-gradient-to-r from-violet-500/30 to-indigo-500/30 rounded-xl blur-xl -z-10" />
                    </div>
                    
                    <div className="flex space-x-1 mb-4">
                      {renderStars(testimonials[current].rating)}
                    </div>
                    
                    <motion.div
                      className="text-center md:text-left"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      <div className="font-bold text-xl text-white">
                        {testimonials[current].name}
                      </div>
                      <div className="text-violet-300 text-sm mt-1">
                        {testimonials[current].role}, {testimonials[current].company}
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Citation */}
                  <div className="md:col-span-8 relative">
                    <svg className="absolute top-0 left-0 transform -translate-x-6 -translate-y-6 h-12 w-12 text-violet-400/40" fill="currentColor" viewBox="0 0 32 32">
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                    </svg>
                    
                    <motion.div
                      className="relative z-10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                    >
                      <p className="text-gray-100 md:text-xl leading-relaxed ml-4 md:ml-6 italic">
                        {testimonials[current].quote}
                      </p>
                    </motion.div>
                  </div>
                </div>
                
                {/* Éléments décoratifs */}
                <div className="absolute bottom-0 right-0 opacity-10 w-40 h-40 transform translate-x-10 translate-y-10">
                  <svg className="w-full h-full text-violet-400" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M128 0C57.308 0 0 57.309 0 128C0 198.691 57.308 256 128 256C198.692 256 256 198.691 256 128C256 57.309 198.692 0 128 0ZM128 233.607C69.812 233.607 22.393 186.187 22.393 128C22.393 69.813 69.812 22.394 128 22.394C186.187 22.394 233.607 69.813 233.607 128C233.607 186.187 186.187 233.607 128 233.607Z" fill="currentColor"/>
                    <path d="M168.326 94.193H150.525V55.914H112.156V94.193H94.266L131.386 131.124L168.326 94.193Z" fill="currentColor"/>
                    <path d="M84.4233 161.698L121.354 124.767L84.4233 87.8357V161.698Z" fill="currentColor"/>
                    <path d="M138.47 124.767L175.4 161.698V87.8357L138.47 124.767Z" fill="currentColor"/>
                    <path d="M112.156 166.521H150.525V204.8H112.156V166.521Z" fill="currentColor"/>
                  </svg>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Indicateurs de slide et contrôles */}
          <div className="mt-10 flex items-center justify-center space-x-3">
            <button
              onClick={handlePrev}
              className="bg-violet-900/30 text-violet-300 p-2.5 rounded-full hover:bg-violet-800/40 focus:outline-none transition-all duration-300 hover:scale-110 border border-violet-500/20 backdrop-blur-sm"
              aria-label="Précédent"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`transition-all duration-300 px-3 py-1 rounded-full ${
                    index === current 
                      ? 'bg-violet-600 text-white scale-105' 
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'
                  }`}
                  aria-label={`Témoignage ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleNext}
              className="bg-violet-900/30 text-violet-300 p-2.5 rounded-full hover:bg-violet-800/40 focus:outline-none transition-all duration-300 hover:scale-110 border border-violet-500/20 backdrop-blur-sm"
              aria-label="Suivant"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnimatedTestimonials; 
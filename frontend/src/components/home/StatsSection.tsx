'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';

const stats = [
  {
    value: 98,
    symbol: '%',
    label: 'Satisfaction client',
    description: 'De nos utilisateurs sont satisfaits'
  },
  {
    value: 40,
    symbol: '%',
    label: 'Réduction des coûts',
    description: 'En moyenne pour nos clients'
  },
  {
    value: 5,
    symbol: 'min',
    label: 'D\'intégration',
    description: 'Pour commencer à utiliser Lydia'
  },
  {
    value: 24,
    symbol: '/7',
    label: 'Support client',
    description: 'À votre service en permanence'
  }
];

const StatsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0.8]);

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <motion.section
      ref={containerRef}
      className="relative py-16 overflow-hidden"
      style={{ opacity }}
    >
      {/* Élément décoratif */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-violet-950/20 to-slate-950"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.violet.900/10)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.violet.900/10)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          ref={ref}
          style={{ y }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4"
        >
          {stats.map((stat, index) => (
            <div key={index} className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <motion.div 
                className="relative p-6 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-violet-500/10 h-full flex flex-col items-center justify-center text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-end justify-center mb-2">
                  <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 text-transparent bg-clip-text">
                    {inView ? (
                      <CountUp
                        end={stat.value}
                        duration={2.5}
                        separator=" "
                        decimals={0}
                        decimal=","
                        delay={0.5}
                      />
                    ) : '0'}
                  </span>
                  <span className="text-2xl md:text-3xl font-bold text-indigo-400 ml-1">{stat.symbol}</span>
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-white mb-1">
                  {stat.label}
                </h3>
                <p className="text-sm text-gray-400">
                  {stat.description}
                </p>
                
                {/* Élément décoratif */}
                <div className="absolute bottom-2 right-2">
                  <motion.div 
                    className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-500/20 to-indigo-500/20 flex items-center justify-center"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          ))}
        </motion.div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <span className="text-lg md:text-xl text-gray-400">
            Rejoignez les milliers d'entreprises qui font confiance à Lydia
          </span>
          
          <div className="flex flex-wrap justify-center items-center gap-8 mt-10 opacity-70">
            {['Microsoft', 'Google', 'Amazon', 'Uber', 'Netflix'].map((brand, index) => (
              <motion.div 
                key={index}
                className="text-xl md:text-2xl font-bold text-gray-500"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + (index * 0.1) }}
              >
                {brand}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default StatsSection; 
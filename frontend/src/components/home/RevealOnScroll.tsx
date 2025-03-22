'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface RevealOnScrollProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  className?: string;
  triggerOnce?: boolean;
}

const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.7,
  className = '',
  triggerOnce = true
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: triggerOnce, amount: 0.2 });

  // Directions initiales pour les animations
  const getInitialDirection = () => {
    switch (direction) {
      case 'down': return { y: -40 };
      case 'left': return { x: 40 };
      case 'right': return { x: -40 };
      case 'up':
      default: return { y: 40 };
    }
  };

  const variants = {
    hidden: {
      opacity: 0,
      ...getInitialDirection(),
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Ease quart-out pour un effet plus élégant
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default RevealOnScroll; 
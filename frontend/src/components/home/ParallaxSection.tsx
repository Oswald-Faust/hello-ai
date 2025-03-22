'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxSectionProps {
  children: React.ReactNode;
  bgColor?: string;
  speed?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  id?: string;
}

const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  bgColor = 'transparent',
  speed = 0.5,
  className = '',
  direction = 'up',
  id
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  // Directions de translation basées sur la propriété direction
  const getTransformValues = () => {
    const multiplier = speed * 100;
    
    switch (direction) {
      case 'down':
        return useTransform(scrollYProgress, [0, 1], [0, multiplier]);
      case 'left':
        return useTransform(scrollYProgress, [0, 1], [0, -multiplier]);
      case 'right':
        return useTransform(scrollYProgress, [0, 1], [0, multiplier]);
      case 'up':
      default:
        return useTransform(scrollYProgress, [0, 1], [0, -multiplier]);
    }
  };

  const transformValue = getTransformValues();
  
  const getTransformStyle = () => {
    if (direction === 'left' || direction === 'right') {
      return { x: transformValue };
    }
    return { y: transformValue };
  };

  return (
    <section
      ref={ref}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
      id={id}
    >
      <motion.div
        style={getTransformStyle()}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </section>
  );
};

export default ParallaxSection; 
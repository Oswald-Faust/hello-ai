'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface GradientDividerProps {
  direction?: 'top' | 'bottom' | 'both';
  height?: string;
  className?: string;
  colors?: {
    from: string;
    via?: string;
    to: string;
  };
}

const GradientDivider: React.FC<GradientDividerProps> = ({
  direction = 'both',
  height = 'h-16',
  className = '',
  colors = {
    from: 'from-violet-600/20',
    via: 'via-slate-950',
    to: 'to-slate-950',
  }
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.5]);
  const y = useTransform(scrollYProgress, [0, 1], [-5, 5]);

  return (
    <motion.div 
      ref={ref}
      className={`w-full ${height} relative overflow-hidden ${className}`}
      style={{ opacity, y }}
    >
      {/* Séparateur avec gradient */}
      <div className={`w-full h-full bg-gradient-to-${direction === 'top' ? 'b' : direction === 'bottom' ? 't' : 'r'} ${colors.from} ${colors.via ? colors.via : ''} ${colors.to}`}></div>
      
      {/* Motif en pointillé pour plus de texture */}
      <div className="absolute inset-0 opacity-50">
        <div className="w-full h-full bg-[radial-gradient(circle_0.5px_at_center,theme(colors.violet.600/30),transparent)] bg-[size:12px_12px]"></div>
      </div>
      
      {/* Ligne subtile */}
      {direction !== 'bottom' && (
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"></div>
      )}
      
      {direction !== 'top' && (
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"></div>
      )}
    </motion.div>
  );
};

export default GradientDivider; 
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimationControls, useScroll, useTransform } from 'framer-motion';

/**
 * HeroScene avancée avec Canvas 2D et animations Framer Motion
 * Ne dépend pas de Three.js pour éviter les problèmes de compatibilité
 */
const HeroScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const controls = useAnimationControls();
  
  // Animations scroll-based
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 400], [1, 0.9]);

  // Effet de particules optimisé
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;
    
    let animationId: number;
    let particlesArray: Particle[] = [];
    let lastTime = 0;
    const FPS = 60;
    const frameTime = 1000 / FPS;
    
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
      spin: number;
      direction: number;
      type: number;
      canvasWidth: number;
      canvasHeight: number;
      
      constructor(canvasWidth: number, canvasHeight: number) {
        this.size = Math.random() * 2.5 + 0.5;
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.speedX = Math.random() * 0.8 - 0.4;
        this.speedY = Math.random() * 0.8 - 0.4;
        this.spin = Math.random() * 0.04 - 0.02;
        this.direction = Math.random() * Math.PI * 2;
        this.alpha = Math.random() * 0.6 + 0.2;
        this.type = Math.floor(Math.random() * 3);
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        // Palette moderne
        const colorPalette = [
          '#8b5cf6', // Violet primaire
          '#6d28d9', // Violet foncé
          '#4f46e5', // Indigo
          '#3b82f6', // Bleu
          '#a855f7', // Violet-rose
        ];
        
        this.color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      }
      
      update(mouseX: number, mouseY: number, mouseActive: boolean) {
        this.direction += this.spin;
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Effet de répulsion de la souris
        if (mouseActive) {
          const dx = this.x - mouseX;
          const dy = this.y - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const force = (100 - distance) / 100;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force * 1.5;
            this.y += Math.sin(angle) * force * 1.5;
          }
        }
        
        // Rebondir sur les bords avec amortissement
        if (this.x < 0 || this.x > this.canvasWidth) {
          this.speedX *= -0.95;
          this.x = this.x < 0 ? 0 : this.canvasWidth;
        }
        
        if (this.y < 0 || this.y > this.canvasHeight) {
          this.speedY *= -0.95;
          this.y = this.y < 0 ? 0 : this.canvasHeight;
        }
      }
      
      draw(ctx: CanvasRenderingContext2D) {
        const pulse = Math.sin(Date.now() * 0.002) * 0.1 + 0.9;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.direction);
        ctx.globalAlpha = this.alpha * pulse;
        
        // Types de particules variés
        switch (this.type) {
          case 0: // Cercle
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            break;
          case 1: // Carré arrondi
            ctx.beginPath();
            ctx.roundRect(-this.size, -this.size, this.size * 2, this.size * 2, this.size / 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            break;
          case 2: // Anneau
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            break;
        }
        
        ctx.restore();
      }
    }
    
    // Adapter le canvas à la taille de son conteneur avec optimisation
    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      
      // Utiliser devicePixelRatio pour meilleure netteté sur écrans haute résolution
      const dpr = window.devicePixelRatio || 1;
      const rect = containerRef.current.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      ctx.scale(dpr, dpr);
      
      // Recréer les particules avec la bonne densité
      createParticles();
    };
    
    // Création de particules avec densité adaptative
    const createParticles = () => {
      if (!canvas || !containerRef.current) return;
      
      particlesArray = [];
      const area = canvas.width * canvas.height / (window.devicePixelRatio || 1);
      const particleDensity = 1 / 10000; // Ajustable
      const numberOfParticles = Math.min(Math.floor(area * particleDensity), 150);
      
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle(canvas.width, canvas.height));
      }
    };
    
    // Animation optimisée pour limiter le FPS
    const animate = (timeStamp: number) => {
      // Gestion FPS pour économiser les ressources
      const deltaTime = timeStamp - lastTime;
      
      if (deltaTime >= frameTime) {
        lastTime = timeStamp - (deltaTime % frameTime);
        
        if (!canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Arrière-plan avec gradient optimisé
        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);
        
        // Gradient de fond premium
        const gradient = ctx.createRadialGradient(
          width / 2, height / 2, 0,
          width / 2, height / 2, Math.max(width, height) * 0.8
        );
        
        gradient.addColorStop(0, '#151b3b'); 
        gradient.addColorStop(0.5, '#0f172a');
        gradient.addColorStop(1, '#09101f');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Effet de grille subtil (façon Tron)
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.05)';
        ctx.lineWidth = 0.5;
        
        const gridSize = 50;
        const gridOffsetX = (mousePosition.x - width/2) * 0.02;
        const gridOffsetY = (mousePosition.y - height/2) * 0.02;
        
        // Lignes horizontales
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y + gridOffsetY % gridSize);
          ctx.lineTo(width, y + gridOffsetY % gridSize);
          ctx.stroke();
        }
        
        // Lignes verticales
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x + gridOffsetX % gridSize, 0);
          ctx.lineTo(x + gridOffsetX % gridSize, height);
          ctx.stroke();
        }
        
        // Orbe central premium
        const cx = width / 2 + (mousePosition.x - width/2) * 0.05;
        const cy = height / 2 + (mousePosition.y - height/2) * 0.05;
        const radius = isHovered ? 70 : 60;
        
        // Lueur externe
        const glowGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 3);
        glowGradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
        glowGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.05)');
        glowGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Orbe principal
        const orbeGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        orbeGradient.addColorStop(0, '#a78bfa'); 
        orbeGradient.addColorStop(0.7, '#8b5cf6');
        orbeGradient.addColorStop(1, '#7c3aed');
        
        ctx.fillStyle = orbeGradient;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.shadowColor = '#8b5cf6';
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Anneaux autour de l'orbe
        for (let i = 0; i < 2; i++) {
          ctx.beginPath();
          ctx.arc(cx, cy, radius * (1.2 + i * 0.2), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.3 - i * 0.1})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        
        // Détails sur l'orbe
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Date.now() * 0.0005);
        
        for (let i = 0; i < 4; i++) {
          const angle = (Math.PI * 2 / 4) * i;
          const x = Math.cos(angle) * radius * 0.6;
          const y = Math.sin(angle) * radius * 0.6;
          
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fill();
          
          // Lignes de connexion
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(x, y);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.stroke();
        }
        
        // Texte "LYDIA" avec typographie premium
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = "700 22px 'Inter', system-ui, sans-serif";
        
        // Effet de profondeur du texte
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillText('LYDIA', 1, 1);
        
        ctx.fillStyle = 'white';
        ctx.fillText('LYDIA', 0, 0);
        
        ctx.restore();
        
        // Mise à jour et rendu des particules
        for (const particle of particlesArray) {
          particle.update(mousePosition.x, mousePosition.y, isHovered);
          particle.draw(ctx);
        }
        
        // Lignes de connexion entre particules proches
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.15)';
        ctx.lineWidth = 0.3;
        
        for (let i = 0; i < particlesArray.length; i++) {
          for (let j = i + 1; j < particlesArray.length; j++) {
            const dx = particlesArray[i].x - particlesArray[j].x;
            const dy = particlesArray[i].y - particlesArray[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 100;
            
            if (distance < maxDistance) {
              ctx.globalAlpha = 1 - distance / maxDistance;
              ctx.beginPath();
              ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
              ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
              ctx.stroke();
            }
          }
        }
        
        ctx.globalAlpha = 1;
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    // Gérer les mouvements de la souris
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };
    
    // Initialisation optimisée
    window.addEventListener('resize', handleResize);
    containerRef.current?.addEventListener('mousemove', handleMouseMove);
    
    // Démarrage initial
    handleResize();
    requestAnimationFrame(animate);
    
    // Animation de démarrage avec Framer Motion
    controls.start({
      opacity: 1,
      transition: { duration: 1 }
    });
    
    // Nettoyage
    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [isHovered, mousePosition]);
  
  // Gestion des interactions tactiles pour appareils mobiles
  const handleTouchStart = () => setIsHovered(true);
  const handleTouchEnd = () => setIsHovered(false);
  
  return (
    <motion.div 
      ref={containerRef}
      className="w-full h-[80vh] relative overflow-hidden bg-slate-950"
      style={{ opacity, scale }}
      initial={{ opacity: 0 }}
      animate={controls}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full" 
      />
      
      {/* Éléments décoratifs avec Framer Motion */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Cercles lumineux */}
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={`glow-${i}`}
            className="absolute rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-700/10"
            style={{
              width: `${80 + i * 40}px`,
              height: `${80 + i * 40}px`,
              left: `${15 + Math.random() * 70}%`,
              top: `${15 + Math.random() * 70}%`,
              filter: 'blur(25px)',
              zIndex: 0
            }}
            animate={{
              x: [0, 20 * Math.sin(i), 0],
              y: [0, 20 * Math.cos(i), 0],
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      {/* Rayons lumineux */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={`ray-${i}`}
            className="absolute h-[2px] bg-gradient-to-r from-transparent via-violet-500/10 to-transparent"
            style={{
              width: '200%',
              left: '-50%',
              top: `${30 + i * 20}%`,
              transform: `rotate(${i * 5}deg)`,
              transformOrigin: 'center',
            }}
            animate={{
              translateX: ['-10%', '10%', '-10%'],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      {/* Points d'étoiles brillants */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1 h-1 rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.1, 0.8, 0.1],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 1.5 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default HeroScene;
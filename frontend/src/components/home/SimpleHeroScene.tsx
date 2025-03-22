'use client';

import React from 'react';

/**
 * Composant HeroScene simplifié qui utilise des animations CSS et HTML5 Canvas 
 * au lieu de Three.js pour éviter les problèmes de compatibilité
 */
const SimpleHeroScene: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  
  // Animation avec Canvas API standard
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    let particlesArray: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
    }> = [];
    
    // Créer des particules
    const createParticles = () => {
      particlesArray = [];
      const numberOfParticles = 100;
      
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 5 + 1;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const speedX = Math.random() * 2 - 1;
        const speedY = Math.random() * 2 - 1;
        
        // Nuances de bleu et de violet
        const hue = Math.floor(Math.random() * 60) + 220; // 220-280: bleu à violet
        const color = `hsl(${hue}, 70%, 60%)`;
        
        particlesArray.push({ x, y, size, speedX, speedY, color });
      }
    };
    
    // Dessiner et animer les particules
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Gradient de fond
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1e1b4b');
      gradient.addColorStop(1, '#312e81');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Dessiner un cercle au centre
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = isHovered ? 100 : 80;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#4f46e5';
      ctx.fill();
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 15;
      ctx.closePath();
      
      // Dessiner des anneaux autour du cercle
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 30 + i * 20, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${230 + i * 10}, 70%, 60%, ${0.7 - i * 0.1})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
      }
      
      // Animer les particules
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].x += particlesArray[i].speedX;
        particlesArray[i].y += particlesArray[i].speedY;
        
        // Rebondir sur les bords
        if (particlesArray[i].x > canvas.width || particlesArray[i].x < 0) {
          particlesArray[i].speedX = -particlesArray[i].speedX;
        }
        if (particlesArray[i].y > canvas.height || particlesArray[i].y < 0) {
          particlesArray[i].speedY = -particlesArray[i].speedY;
        }
        
        // Dessiner la particule
        ctx.beginPath();
        ctx.arc(particlesArray[i].x, particlesArray[i].y, particlesArray[i].size, 0, Math.PI * 2);
        ctx.fillStyle = particlesArray[i].color;
        ctx.fill();
        ctx.closePath();
      }
      
      // Ajouter du texte
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.fillText('LYDIA', centerX, centerY + 8);
      
      animationId = requestAnimationFrame(animate);
    };
    
    // Redimensionner le canvas
    const handleResize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      createParticles(); // Recréer les particules après redimensionnement
    };
    
    // Initialiser
    handleResize();
    window.addEventListener('resize', handleResize);
    animate();
    
    // Nettoyage
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [isHovered]);
  
  return (
    <div 
      className="w-full h-[60vh] relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full cursor-pointer" 
      />
    </div>
  );
};

export default SimpleHeroScene; 
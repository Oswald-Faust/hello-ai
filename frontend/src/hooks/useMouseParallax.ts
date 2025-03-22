import { useState, useEffect, useRef, MutableRefObject } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

interface UseMouseParallaxOptions {
  strength?: number;
  maxMovement?: number;
  ease?: number;
  containerRef?: MutableRefObject<HTMLElement | null>;
  reverse?: boolean;
}

interface UseMouseParallaxReturn {
  x: number;
  y: number;
  elementRef: MutableRefObject<HTMLElement | null>;
}

/**
 * Hook pour créer des effets de parallaxe basés sur la position de la souris
 * @param options - Options de configuration pour l'effet de parallaxe
 * @returns Coordonnées de translation et référence de l'élément
 */
const useMouseParallax = ({
  strength = 0.1,
  maxMovement = 50,
  ease = 0.1,
  containerRef,
  reverse = false
}: UseMouseParallaxOptions = {}): UseMouseParallaxReturn => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLElement | null>(null);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  // Gestion du mouvement de la souris
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (containerRef && containerRef.current) {
        // Position relative au conteneur
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Normaliser à [-1, 1]
        const normalizedX = (x / rect.width) * 2 - 1;
        const normalizedY = (y / rect.height) * 2 - 1;
        
        setMousePosition({ 
          x: normalizedX, 
          y: normalizedY 
        });
      } else {
        // Position relative à la fenêtre
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = (event.clientY / window.innerHeight) * 2 - 1;
        
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [containerRef]);

  // Animation fluide avec requestAnimationFrame
  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      // Calcul du mouvement basé sur la force et direction
      const factor = reverse ? -1 : 1;
      const targetX = mousePosition.x * strength * maxMovement * factor;
      const targetY = mousePosition.y * strength * maxMovement * factor;
      
      // Animation fluide avec easing
      const newX = position.x + (targetX - position.x) * ease;
      const newY = position.y + (targetY - position.y) * ease;
      
      setPosition({ x: newX, y: newY });
    }
    
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [mousePosition, strength, maxMovement, ease, reverse]);

  return { x: position.x, y: position.y, elementRef };
};

export default useMouseParallax; 
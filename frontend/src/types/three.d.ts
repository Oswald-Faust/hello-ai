declare module 'three';

// Déclarations supplémentaires pour les composants @react-three/drei
declare module '@react-three/drei' {
  export interface TextProps {
    fontSize?: number;
    color?: string;
    anchorX?: 'left' | 'center' | 'right';
    anchorY?: 'top' | 'middle' | 'bottom';
    position?: [number, number, number];
    lineHeight?: number;
    maxWidth?: number;
    fontWeight?: string;
    outlineWidth?: number;
    outlineColor?: string;
    children?: React.ReactNode;
  }

  export interface SphereProps {
    args?: [number, number, number];
    children?: React.ReactNode;
    ref?: React.RefObject<any>;
    castShadow?: boolean;
    receiveShadow?: boolean;
  }

  export interface ContactShadowsProps {
    position?: [number, number, number];
    opacity?: number;
    scale?: number | [number, number, number];
    blur?: number;
    far?: number;
  }
} 
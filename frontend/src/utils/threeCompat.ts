/**
 * Ce fichier fournit des compatibilités pour les changements d'API entre différentes versions de Three.js
 * Il permet d'utiliser des packages qui dépendent d'anciennes versions de Three.js
 */

import * as THREE from 'three';

// Exportations de geometries renommées dans les nouvelles versions de Three.js
// BufferGeometry est maintenant la classe de base, les anciens noms sont supprimés
export const PlaneBufferGeometry = THREE.PlaneGeometry;
export const CylinderBufferGeometry = THREE.CylinderGeometry;
export const BoxBufferGeometry = THREE.BoxGeometry;
export const SphereBufferGeometry = THREE.SphereGeometry;

// Constantes renommées
export const LinearEncoding = THREE.LinearSRGBColorSpace;
export const sRGBEncoding = THREE.SRGBColorSpace;

// Classes principales
export const Mesh = THREE.Mesh;
export const Points = THREE.Points;
export const Group = THREE.Group;
export const Object3D = THREE.Object3D;
export const BufferGeometry = THREE.BufferGeometry;
export const BufferAttribute = THREE.BufferAttribute;
export const Vector3 = THREE.Vector3;
export const Matrix4 = THREE.Matrix4;
export const Color = THREE.Color;
export const Box3 = THREE.Box3;
export const FrontSide = THREE.FrontSide;

// Exporter tout depuis Three.js
export * from 'three';

// Réexporter tout THREE
export default THREE; 
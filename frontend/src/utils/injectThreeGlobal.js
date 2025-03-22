// Injecter Box3 et autres classes nécessaires dans l'objet global
const THREE = require('three');

// S'assurer que Box3 est disponible globalement
global.Box3 = THREE.Box3;
global.Vector3 = THREE.Vector3;
global.BufferAttribute = THREE.BufferAttribute;
global.FrontSide = THREE.FrontSide;
global.Matrix4 = THREE.Matrix4;

console.log('THREE.Box3 injecté dans l\'objet global'); 
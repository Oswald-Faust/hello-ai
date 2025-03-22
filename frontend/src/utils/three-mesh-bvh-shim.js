// Shim pour three-mesh-bvh
const THREE = require('three');

// Exporter les classes nécessaires pour three-mesh-bvh
module.exports = {
  Box3: THREE.Box3,
  Vector3: THREE.Vector3,
  BufferAttribute: THREE.BufferAttribute,
  FrontSide: THREE.FrontSide,
  Matrix4: THREE.Matrix4,
  ...THREE
}; 
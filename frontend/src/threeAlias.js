// Configurer trois pour utiliser notre version compatible
const moduleAlias = require('module-alias');
const path = require('path');

moduleAlias.addAlias('three', path.join(__dirname, 'utils/threeCompat.ts'));

console.log('Module alias configuré pour three -> threeCompat'); 
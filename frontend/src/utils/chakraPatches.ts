import { forwardRef } from 'react';

// Réexporter forwardRef pour qu'il puisse être importé par d'autres modules
export { forwardRef };

// Patch pour Chakra UI Icons
export const chakraPatches = {
  forwardRef
};

export default chakraPatches; 
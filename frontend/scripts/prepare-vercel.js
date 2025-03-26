// Script pour créer des composants manquants pour le déploiement Vercel
const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'src', 'components', 'ui');

// Fonction pour créer un composant redirecteur
function createRedirectorComponent(name, targetName) {
  let content = '';
  
  // Cas spéciaux pour les composants qui ont des sous-composants
  if (name === 'alert') {
    content = `// Redirecteur vers ${targetName} pour la compatibilité des imports
import { ${targetName}, AlertTitle, AlertDescription } from './${targetName}';
export { ${targetName}, AlertTitle, AlertDescription };
export default ${targetName};
`;
  } else if (name === 'card') {
    content = `// Redirecteur vers ${targetName} pour la compatibilité des imports
import { ${targetName}, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './${targetName}';
export { ${targetName}, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default ${targetName};
`;
  } else {
    content = `// Redirecteur vers ${targetName} pour la compatibilité des imports
import { ${targetName} } from './${targetName}';
export { ${targetName} };
export default ${targetName};
`;
  }
  
  fs.writeFileSync(path.join(componentsDir, `${name}.tsx`), content);
  console.log(`Créé: ${name}.tsx -> ${targetName}.tsx`);
}

// Liste des composants à vérifier et leurs contreparties
const components = [
  { name: 'textarea', target: 'Textarea' },
  { name: 'button', target: 'Button' },
  { name: 'card', target: 'Card' },
  { name: 'input', target: 'Input' },
  { name: 'label', target: 'Label', create: true },
  { name: 'alert', target: 'Alert', create: true },
  // Composants manquants à créer
  { name: 'table', target: 'Table', create: true },
  { name: 'dialog', target: 'Dialog', create: true },
  { name: 'badge', target: 'Badge', create: true },
  { name: 'use-toast', target: 'Toast', create: true },
];

// Créer les composants manquants
for (const component of components) {
  const sourcePath = path.join(componentsDir, `${component.target}.tsx`);
  const targetPath = path.join(componentsDir, `${component.name}.tsx`);
  
  // Vérifier si le fichier cible existe déjà
  if (fs.existsSync(targetPath)) {
    console.log(`${component.name}.tsx existe déjà, ignoré`);
    continue;
  }
  
  // Vérifier si le fichier source existe
  if (fs.existsSync(sourcePath)) {
    createRedirectorComponent(component.name, component.target);
  } else if (component.create) {
    // Créer un composant minimal si nécessaire
    console.log(`Création d'un stub pour: ${component.target}.tsx`);
    
    let content = '';
    
    // Contenu par défaut selon le type de composant
    if (component.name === 'use-toast') {
      content = `// Stub pour use-toast.tsx 
export const toast = {
  success: (message) => console.log('Toast success:', message),
  error: (message) => console.log('Toast error:', message),
  warning: (message) => console.log('Toast warning:', message),
  info: (message) => console.log('Toast info:', message),
};

export default toast;`;
    } else {
      content = `// Stub composant pour ${component.target}
import React from 'react';
import { cn } from '@/lib/utils';

export interface ${component.target}Props {
  children?: React.ReactNode;
  className?: string;
}

export const ${component.target}: React.FC<${component.target}Props> = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <div 
      className={cn('${component.name}-component', className)} 
      {...props}
    >
      {children}
    </div>
  );
};

export default ${component.target};`;
    }
    
    fs.writeFileSync(path.join(componentsDir, `${component.target}.tsx`), content);
    console.log(`Créé: ${component.target}.tsx (stub)`);
    
    // Créer aussi le redirecteur si nécessaire
    if (component.name !== component.target.toLowerCase()) {
      createRedirectorComponent(component.name, component.target);
    }
  }
}

// Vérifier et créer le module next-auth
const nextAuthDir = path.join(__dirname, '..', 'src', 'app', 'api', 'auth');
if (!fs.existsSync(nextAuthDir)) {
  fs.mkdirSync(nextAuthDir, { recursive: true });
  console.log(`Créé: dossier next-auth`);
  
  // Créer un fichier minimal pour next-auth
  const nextAuthPath = path.join(nextAuthDir, 'next.ts');
  const nextAuthContent = `// Stub pour next-auth/next
export const getServerSession = async () => {
  return { user: null };
};
`;
  fs.writeFileSync(nextAuthPath, nextAuthContent);
  console.log(`Créé: next.ts (stub)`);
}

console.log('Préparation terminée!'); 
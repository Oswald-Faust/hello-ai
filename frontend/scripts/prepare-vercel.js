// Script pour créer des composants manquants pour le déploiement Vercel
const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'src', 'components', 'ui');

// Supprimer les fichiers en majuscules potentiellement en double
function cleanupCapitalizedFiles() {
  const files = ['Alert.tsx', 'Button.tsx', 'Card.tsx', 'Label.tsx', 'Input.tsx', 'Textarea.tsx'];
  
  files.forEach(file => {
    const filePath = path.join(componentsDir, file);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Supprimé: ${file} pour éviter les conflits de casse`);
      } catch (error) {
        console.error(`Erreur lors de la suppression de ${file}:`, error);
      }
    }
  });
}

// Fonction pour créer un stub de composant
function createComponentStub(name, isAdvanced = false) {
  const targetPath = path.join(componentsDir, name);
  
  if (fs.existsSync(targetPath)) {
    console.log(`${name} existe déjà, ignoré`);
    return;
  }
  
  let content = '';
  
  if (name === 'alert.tsx') {
    content = `import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };`;
  } else if (name === 'card.tsx') {
    content = `import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border bg-card shadow-sm',
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 p-6', className)}
        {...props}
      />
    );
  }
);
CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn('text-2xl font-semibold leading-none tracking-tight text-black', className)}
        {...props}
      />
    );
  }
);
CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-black/70', className)}
        {...props}
      />
    );
  }
);
CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-6 pt-0 text-black', className)} {...props} />
    );
  }
);
CardContent.displayName = 'CardContent';

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center p-6 pt-0 text-black', className)}
        {...props}
      />
    );
  }
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };`;
  } else if (name === 'use-toast.tsx') {
    content = `// Stub pour use-toast.tsx 
export const toast = {
  success: (message) => console.log('Toast success:', message),
  error: (message) => console.log('Toast error:', message),
  warning: (message) => console.log('Toast warning:', message),
  info: (message) => console.log('Toast info:', message),
};

export default toast;`;
  } else if (name === 'label.tsx') {
    // Création spécifique pour le composant Label avec htmlFor
    content = `import React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ 
  children, 
  className,
  htmlFor,
  ...props 
}, ref) => {
  return (
    <label 
      ref={ref}
      htmlFor={htmlFor}
      className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)} 
      {...props}
    >
      {children}
    </label>
  );
});

Label.displayName = 'Label';

export { Label };`;
  } else if (name === 'input.tsx') {
    // Création spécifique pour le composant Input
    content = `import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  type?: string;
  id?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className,
  type = 'text',
  id,
  placeholder,
  value,
  onChange,
  required,
  disabled,
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      type={type}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };`;
  } else {
    // Extraire le nom du composant sans l'extension
    const componentName = path.basename(name, '.tsx');
    // Première lettre en majuscule pour le nom du composant
    const capitalizedName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
    
    content = `// Stub composant pour ${capitalizedName}
import React from 'react';
import { cn } from '@/lib/utils';

export interface ${capitalizedName}Props {
  children?: React.ReactNode;
  className?: string;
}

const ${capitalizedName}: React.FC<${capitalizedName}Props> = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <div 
      className={cn('${componentName}-component', className)} 
      {...props}
    >
      {children}
    </div>
  );
};

export { ${capitalizedName} };`;
  }
  
  fs.writeFileSync(targetPath, content);
  console.log(`Créé: ${name} (stub)`);
}

// Nettoyer les fichiers en majuscules d'abord
cleanupCapitalizedFiles();

// Liste des composants à générer
const components = [
  'textarea.tsx', 
  'button.tsx', 
  'card.tsx', 
  'input.tsx', 
  'label.tsx', 
  'alert.tsx', 
  'table.tsx', 
  'dialog.tsx', 
  'badge.tsx', 
  'use-toast.tsx'
];

// Créer tous les composants
components.forEach(component => createComponentStub(component));

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
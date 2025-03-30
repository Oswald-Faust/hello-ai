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

// Définition des composants
const componentDefinitions = {
  'button.tsx': `import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | string;
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs' | string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className,
  type = 'button',
  disabled,
  variant = 'default',
  size = 'default',
  onClick,
  asChild,
  isLoading,
  ...props
}, ref) => {
  // Définir des classes basées sur la variante
  const getVariantClasses = (variant: string): string => {
    switch(variant) {
      case 'outline':
        return 'border border-input bg-background hover:bg-accent hover:text-accent-foreground';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
      case 'ghost':
        return 'hover:bg-accent hover:text-accent-foreground';
      case 'link':
        return 'text-primary underline-offset-4 hover:underline';
      case 'destructive':
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
      default:
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
    }
  };
  
  // Définir des classes basées sur la taille
  const getSizeClasses = (size: string): string => {
    switch(size) {
      case 'sm':
        return 'h-9 px-3 rounded-md text-xs';
      case 'xs':
        return 'h-7 px-2 rounded-md text-xs';
      case 'lg':
        return 'h-11 px-8 rounded-md text-base';
      case 'icon':
        return 'h-10 w-10 rounded-full p-0';
      default:
        return 'h-10 px-4 py-2 rounded-md text-sm';
    }
  };
  
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        getVariantClasses(variant),
        getSizeClasses(size),
        isLoading && 'opacity-70 cursor-wait',
        className
      )}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };`,

  'input.tsx': `import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  type?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  fullWidth?: boolean;
  readOnly?: boolean;
  sizeVariant?: 'default' | 'sm' | 'lg';
  prefixElement?: React.ReactNode;
  suffixElement?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className,
  type = 'text',
  id,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  required,
  disabled,
  error,
  fullWidth,
  readOnly,
  sizeVariant = 'default',
  prefixElement,
  suffixElement,
  ...props
}, ref) => {
  const getSizeClasses = (size: string): string => {
    switch(size) {
      case 'sm': return 'h-8 text-xs px-2.5';
      case 'lg': return 'h-12 text-base px-4';
      default: return 'h-10 text-sm px-3';
    }
  };

  return (
    <input
      ref={ref}
      className={cn(
        'flex w-full rounded-md border border-input bg-background py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-destructive',
        fullWidth && 'w-full',
        getSizeClasses(sizeVariant),
        className
      )}
      type={type}
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };`,

  'textarea.tsx': `import React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  fullWidth?: boolean;
  rows?: number;
  maxLength?: number;
  minLength?: number;
  readOnly?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className,
  id,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  required,
  disabled,
  error,
  fullWidth,
  rows = 4,
  maxLength,
  minLength,
  readOnly,
  resize = 'vertical',
  ...props
}, ref) => {
  const getResizeClass = (resize: string): string => {
    switch(resize) {
      case 'none': return 'resize-none';
      case 'horizontal': return 'resize-x';
      case 'both': return 'resize';
      default: return 'resize-y';
    }
  };

  return (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-destructive',
        fullWidth && 'w-full',
        getResizeClass(resize),
        className
      )}
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      required={required}
      disabled={disabled}
      rows={rows}
      maxLength={maxLength}
      minLength={minLength}
      readOnly={readOnly}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };`,

  'badge.tsx': `import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info';
  size?: 'default' | 'sm' | 'lg';
  rounded?: boolean;
  isClosable?: boolean;
  onClose?: () => void;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({
  className,
  variant = 'default',
  size = 'default',
  rounded = false,
  isClosable = false,
  onClose,
  children,
  ...props
}, ref) => {
  const getVariantClasses = (variant: string): string => {
    switch(variant) {
      case 'secondary':
        return 'bg-secondary text-secondary-foreground';
      case 'destructive':
        return 'bg-destructive text-destructive-foreground';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'outline':
        return 'bg-transparent border border-input text-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const getSizeClasses = (size: string): string => {
    switch(size) {
      case 'sm': return 'text-xs px-2 py-0.5';
      case 'lg': return 'text-sm px-3 py-1';
      default: return 'text-xs px-2.5 py-0.5';
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center font-medium border',
        rounded ? 'rounded-full' : 'rounded-md',
        getVariantClasses(variant),
        getSizeClasses(size),
        className
      )}
      {...props}
    >
      {children}
      {isClosable && (
        <button
          type="button"
          className="ml-1 -mr-1 h-3.5 w-3.5 rounded-full inline-flex items-center justify-center hover:bg-white/20"
          onClick={onClose}
        >
          <span className="sr-only">Close</span>
          <svg className="h-3 w-3" viewBox="0 0 24 24">
            <path fill="currentColor" d="M18.3 5.71a.996.996 0 00-1.41 0L12 10.59 7.11 5.7a.996.996 0 00-1.41 0 .996.996 0 000 1.41L10.59 12 5.7 16.89a.996.996 0 101.41 1.41L12 13.41l4.89 4.89a.996.996 0 101.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
          </svg>
        </button>
      )}
    </div>
  );
});

Badge.displayName = 'Badge';

export { Badge };`,

  'alert.tsx': `import * as React from "react";
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
        success: "border-success/50 text-success dark:border-success [&>svg]:text-success",
        warning: "border-warning/50 text-warning dark:border-warning [&>svg]:text-warning",
        info: "border-info/50 text-info dark:border-info [&>svg]:text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  onClose?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, title, description, icon, action, onClose, ...props }, ref) => (
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

export { Alert, AlertTitle, AlertDescription };`,

  'card.tsx': `import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'ghost';
  isHoverable?: boolean;
  isCompact?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', isHoverable, isCompact, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg bg-card shadow-sm',
          variant === 'bordered' && 'border',
          variant === 'ghost' && 'border-none shadow-none',
          isHoverable && 'transition-shadow hover:shadow-md',
          isCompact && 'p-4',
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

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

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}

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

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

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

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-6 pt-0 text-black', className)} {...props} />
    );
  }
);
CardContent.displayName = 'CardContent';

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

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

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };`,

  'table.tsx': `import React from 'react';
import { cn } from '@/lib/utils';

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};`,

  'dialog.tsx': `import React from 'react';
import { cn } from '@/lib/utils';

interface DialogProps extends React.DialogHTMLAttributes<HTMLDialogElement> {
  open?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onClose, children, className, ...props }) => {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        'max-w-lg rounded-lg shadow-lg backdrop:bg-black backdrop:bg-opacity-50 p-0',
        className
      )}
      onClose={handleClose}
      {...props}
    >
      {children}
    </dialog>
  );
};

const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn('p-6', className)} {...props}>
    {children}
  </div>
);

const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn('flex items-center justify-between p-4 border-b', className)} {...props}>
    {children}
  </div>
);

const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
  <h2 className={cn('text-lg font-semibold', className)} {...props}>
    {children}
  </h2>
);

const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn('flex justify-end gap-2 p-4 border-t', className)} {...props}>
    {children}
  </div>
);

const DialogClose: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, onClick, children, ...props }) => {
  return (
    <button
      className={cn('text-gray-500 hover:text-gray-700', className)}
      onClick={onClick}
      {...props}
    >
      {children || '×'}
    </button>
  );
};

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose };`,

  'use-toast.tsx': `// Stub complet pour use-toast.tsx
import { ReactNode } from 'react';

type ToastProps = {
  id?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
};

type ToastActionElement = {
  altText: string;
  onClick: () => void;
  children: ReactNode;
};

const toast = {
  success: (props: string | ToastProps) => {
    console.log('Toast success:', typeof props === 'string' ? props : props.title);
    return { id: '1', dismiss: () => {} };
  },
  error: (props: string | ToastProps) => {
    console.log('Toast error:', typeof props === 'string' ? props : props.title);
    return { id: '2', dismiss: () => {} };
  },
  warning: (props: string | ToastProps) => {
    console.log('Toast warning:', typeof props === 'string' ? props : props.title);
    return { id: '3', dismiss: () => {} };
  },
  info: (props: string | ToastProps) => {
    console.log('Toast info:', typeof props === 'string' ? props : props.title);
    return { id: '4', dismiss: () => {} };
  },
  destructive: (props: string | ToastProps) => {
    console.log('Toast destructive:', typeof props === 'string' ? props : props.title);
    return { id: '5', dismiss: () => {} };
  },
  default: (props: string | ToastProps) => {
    console.log('Toast default:', typeof props === 'string' ? props : props.title);
    return { id: '6', dismiss: () => {} };
  },
  custom: (props: ToastProps) => {
    console.log('Toast custom:', props.title);
    return { id: '7', dismiss: () => {} };
  },
  dismiss: (toastId?: string) => {
    console.log('Toast dismiss:', toastId);
  },
  update: (toastId: string, props: ToastProps) => {
    console.log('Toast update:', toastId, props);
  },
};

function useToast() {
  return { toast };
}

export { toast, useToast };
export default useToast;`,

  'label.tsx': `import React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: React.ReactNode;
  className?: string;
  htmlFor?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ 
  children, 
  className,
  htmlFor,
  required,
  disabled,
  error,
  ...props 
}, ref) => {
  return (
    <label 
      ref={ref}
      htmlFor={htmlFor}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        disabled && 'opacity-70 cursor-not-allowed',
        error && 'text-destructive',
        className
      )} 
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-destructive">*</span>}
    </label>
  );
});

Label.displayName = 'Label';

export { Label };`,

  'date-picker.tsx': `import React from 'react';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
  children?: React.ReactNode;
  className?: string;
  value?: Date;
  onDateChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  placeholder?: string;
  format?: string;
  showTimeSelect?: boolean;
  timeFormat?: string;
  timeIntervals?: number;
}

const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps & React.HTMLAttributes<HTMLDivElement>>(({
  children,
  className,
  value,
  onDateChange,
  minDate,
  maxDate,
  disabled,
  placeholder = 'Select date...',
  format = 'dd/MM/yyyy',
  showTimeSelect,
  timeFormat = 'HH:mm',
  timeIntervals = 15,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'relative inline-block w-full',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export { DatePicker };`,
};

// Fonction pour créer un stub de composant
function createComponentStub(name) {
  const targetPath = path.join(componentsDir, name);
  
  if (fs.existsSync(targetPath)) {
    console.log(`${name} existe déjà, ignoré`);
    return;
  }
  
  let content = componentDefinitions[name];
  
  if (!content) {
    // Stub générique pour les composants non prédéfinis
    const componentName = path.basename(name, '.tsx');
    const capitalizedName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
    
    content = `// Stub générique pour ${capitalizedName}
import React from 'react';
import { cn } from '@/lib/utils';

export interface ${capitalizedName}Props extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: string;
  size?: string;
  disabled?: boolean;
}

const ${capitalizedName} = React.forwardRef<HTMLDivElement, ${capitalizedName}Props>(({
  children, 
  className, 
  variant,
  size,
  disabled,
  ...props 
}, ref) => {
  return (
    <div 
      ref={ref}
      className={cn('${componentName}-component', className)} 
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </div>
  );
});

${capitalizedName}.displayName = '${capitalizedName}';

export { ${capitalizedName} };`;
  }
  
  fs.writeFileSync(targetPath, content);
  console.log(`Créé: ${name} (stub)`);
}

// Nettoyer les fichiers en majuscules d'abord
cleanupCapitalizedFiles();

// Liste des composants à générer
const components = Object.keys(componentDefinitions).concat([
  'select.tsx',
  'checkbox.tsx',
  'radio.tsx',
  'switch.tsx',
  'avatar.tsx',
  'progress.tsx',
  'slider.tsx',
  'toast.tsx',
  'popover.tsx',
  'dropdown.tsx',
  'tabs.tsx',
  'accordion.tsx',
  'tooltip.tsx',
  'calendar.tsx',
  'date-picker.tsx'
]);

// S'assurer que le répertoire existe
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
  console.log(`Créé: répertoire des composants UI`);
}

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

export const auth = () => {
  return { user: null };
};
`;
  fs.writeFileSync(nextAuthPath, nextAuthContent);
  console.log(`Créé: next.ts (stub)`);

  // Créer également un fichier minimal pour [...nextauth]/route.ts
  const nextAuthRouteDir = path.join(nextAuthDir, '[...nextauth]');
  if (!fs.existsSync(nextAuthRouteDir)) {
    fs.mkdirSync(nextAuthRouteDir, { recursive: true });
  }
  
  const nextAuthRoutePath = path.join(nextAuthRouteDir, 'route.ts');
  const nextAuthRouteContent = `// Stub pour next-auth API route
import { NextRequest } from 'next/server';

export async function GET() {
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'content-type': 'application/json' },
  });
}

export async function POST() {
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'content-type': 'application/json' },
  });
}
`;
  fs.writeFileSync(nextAuthRoutePath, nextAuthRouteContent);
  console.log(`Créé: [...nextauth]/route.ts (stub)`);
}

console.log('Préparation terminée!'); 
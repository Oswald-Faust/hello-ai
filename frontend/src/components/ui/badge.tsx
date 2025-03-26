import { Badge as ChakraBadge, BadgeProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface CustomBadgeProps extends BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export function Badge({ children, variant = 'default', ...props }: CustomBadgeProps) {
  const colorScheme = {
    default: 'blue',
    secondary: 'purple',
    destructive: 'red',
    outline: 'gray',
  }[variant];

  return (
    <ChakraBadge colorScheme={colorScheme} {...props}>
      {children}
    </ChakraBadge>
  );
}

export default Badge; 
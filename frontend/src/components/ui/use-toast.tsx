import { useToast as useChakraToast } from '@chakra-ui/react';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

const useToast = () => {
  const chakraToast = useChakraToast();

  return (options: ToastOptions) => {
    return chakraToast({
      title: options.title,
      description: options.description,
      status: options.variant === 'destructive' ? 'error' : 'success',
      duration: options.duration || 5000,
      isClosable: true,
    });
  };
};

export const toast = useChakraToast();
export { useToast }; 
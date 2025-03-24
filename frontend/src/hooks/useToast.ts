import { useToast as useToastUI } from '@/components/ui/Toast';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'info' | 'warning';
  duration?: number;
}

export const useToast = () => {
  const { toast } = useToastUI();

  return (options: ToastOptions) => {
    toast({
      title: options.title,
      description: options.description,
      variant: options.variant || 'default',
      duration: options.duration || 3000,
    });
  };
};

export default useToast; 
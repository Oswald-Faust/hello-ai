import '@/styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '@/context/AuthContext';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';

// Créer un client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  // Check if the Component has a getLayout function
  const getLayout = (Component as any).getLayout || ((page: React.ReactNode) => page);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChakraProvider>
          {getLayout(<Component {...pageProps} />)}
          <Toaster position="top-right" />
        </ChakraProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
} 
'use client';

import { AuthProvider } from '@/hooks/useAuth';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              {children}
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
} 
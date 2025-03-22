import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware simplifié qui laisse passer toutes les requêtes
export function middleware(request: NextRequest) {
  // Permettre l'accès à toutes les routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 
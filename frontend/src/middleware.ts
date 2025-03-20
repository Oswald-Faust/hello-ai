import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Les routes qui ne nécessitent pas d'authentification
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password'
  ];
  
  // Les routes d'API et ressources statiques
  const isApiOrStatic = request.nextUrl.pathname.match(
    /^\/(api|_next|favicon\.ico|public|static)/
  );
  
  // Si c'est une ressource statique ou API, laisser passer
  if (isApiOrStatic) {
    return NextResponse.next();
  }
  
  // Vérifier si c'est une route publique
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith('/auth/')
  );
  
  // Si c'est une route publique, laisser passer
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Vérifier si l'utilisateur est authentifié
  const token = request.cookies.get('token');
  
  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!token) {
    console.log('[MIDDLEWARE] Redirection vers login:', request.nextUrl.pathname);
    
    // Créer l'URL de redirection
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    
    return NextResponse.redirect(loginUrl);
  }
  
  // Utilisateur authentifié, laisser passer
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 
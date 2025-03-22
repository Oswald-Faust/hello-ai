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
  
  // Routes admin
  const isAdminRoute = request.nextUrl.pathname.startsWith('/dashboard/admin');
  
  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!token) {
    console.log('[MIDDLEWARE] Redirection vers login:', request.nextUrl.pathname);
    
    // Stocker l'URL de redirection dans un cookie plutôt qu'en paramètre
    // pour éviter des problèmes potentiels avec les URL trop longues
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.set('redirectUrl', request.nextUrl.pathname, { 
      path: '/',
      maxAge: 60 * 10, // 10 minutes
      httpOnly: true,
      sameSite: 'lax'
    });
    
    return response;
  }
  
  // Utilisateur authentifié, laisser passer
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 
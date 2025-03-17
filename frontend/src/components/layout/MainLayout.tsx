import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuth from '@/hooks/useAuth';
import Image from 'next/image';

// Icônes (à remplacer par des imports réels de bibliothèques d'icônes)
const DashboardIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const CallsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const CompanyIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const UsersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const SettingsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const MenuIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const LogoutIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: DashboardIcon },
    { name: 'Appels', href: '/calls', icon: CallsIcon },
    { name: 'Entreprises', href: '/companies', icon: CompanyIcon },
    { name: 'Utilisateurs', href: '/users', icon: UsersIcon },
    { name: 'Paramètres', href: '/settings', icon: SettingsIcon },
  ];

  // Filtrer les éléments de navigation en fonction du rôle de l'utilisateur
  const filteredNavigation = navigation.filter(item => {
    if (user?.role !== 'admin' && (item.href === '/companies' || item.href === '/users')) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar pour mobile */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
        
        <div className="relative flex flex-col flex-1 w-full max-w-xs pt-5 pb-4 bg-white">
          <div className="absolute top-0 right-0 pt-2 -mr-12">
            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Fermer le menu</span>
              <CloseIcon />
            </button>
          </div>
          
          <div className="flex items-center flex-shrink-0 px-4">
            <img className="w-auto h-8" src="/logo.svg" alt="Lydia" />
          </div>
          
          <div className="flex-1 h-0 mt-5 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <item.icon />
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex flex-shrink-0 p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="flex items-center w-full text-sm font-medium text-gray-500 rounded-md hover:text-gray-700"
            >
              <LogoutIcon />
              <span className="ml-3">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar pour desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4">
            <img className="w-auto h-8" src="/logo.svg" alt="Lydia" />
          </div>
          
          <div className="flex flex-col flex-1 mt-5">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <item.icon />
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
            </nav>
            
            <div className="flex flex-shrink-0 p-4 mt-auto border-t border-gray-200">
              {user && (
                <div className="flex items-center w-full">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 text-white bg-indigo-600 rounded-full">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">{user.firstName} {user.lastName}</p>
                    <p className="text-xs font-medium text-gray-500">{user.role}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-shrink-0 p-4 border-t border-gray-200">
              <button
                onClick={logout}
                className="flex items-center w-full text-sm font-medium text-gray-500 rounded-md hover:text-gray-700"
              >
                <LogoutIcon />
                <span className="ml-3">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="lg:pl-64 flex flex-col">
        <div className="sticky top-0 z-10 flex flex-shrink-0 h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 text-gray-500 border-r border-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Ouvrir le menu</span>
            <MenuIcon />
          </button>
          
          <div className="flex justify-between flex-1 px-4">
            <div className="flex flex-1">
              <h1 className="text-xl font-semibold text-gray-900 my-auto">
                {router.pathname === '/dashboard' && 'Tableau de bord'}
                {router.pathname === '/calls' && 'Appels'}
                {router.pathname === '/companies' && 'Entreprises'}
                {router.pathname === '/users' && 'Utilisateurs'}
                {router.pathname === '/settings' && 'Paramètres'}
              </h1>
            </div>
            
            <div className="flex items-center ml-4 md:ml-6">
              {/* Notifications, profil, etc. peuvent être ajoutés ici */}
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 
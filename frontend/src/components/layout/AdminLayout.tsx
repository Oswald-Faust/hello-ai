import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import {
  Users,
  Building2,
  LayoutDashboard,
  Settings,
  FileText,
  BarChart2,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  HelpCircle,
  Shield,
  Search
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };

  // Définition des éléments de navigation
  const navigation = [
    { 
      name: 'Tableau de bord', 
      href: '/dashboard/admin', 
      icon: LayoutDashboard 
    },
    { 
      name: 'Utilisateurs', 
      href: '/dashboard/admin/users', 
      icon: Users 
    },
    { 
      name: 'Entreprises', 
      href: '/dashboard/admin/companies', 
      icon: Building2 
    },
    { 
      name: 'Rapports', 
      href: '/dashboard/admin/reports', 
      icon: FileText 
    },
    { 
      name: 'Statistiques', 
      href: '/dashboard/admin/stats', 
      icon: BarChart2 
    },
    { 
      name: 'Paramètres', 
      href: '/dashboard/admin/settings', 
      icon: Settings 
    },
    { 
      name: 'Sécurité', 
      href: '/dashboard/admin/security', 
      icon: Shield 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75" 
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        ></div>
        
        <div className="fixed inset-y-0 left-0 flex flex-col w-full max-w-xs pt-5 pb-4 bg-primary-700">
          <div className="absolute top-0 right-0 p-1 -mr-14">
            <button
              className="flex items-center justify-center w-12 h-12 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
              <span className="sr-only">Fermer la sidebar</span>
            </button>
          </div>
          
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center justify-center w-8 h-8 text-white bg-primary-500 rounded-full">
              A
            </div>
            <span className="ml-2 text-xl font-semibold text-white">Admin Lydia</span>
          </div>
          
          <div className="px-2 mt-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="search"
                className="block w-full py-2 pl-10 pr-3 text-sm bg-primary-600 border border-transparent rounded-md placeholder-gray-400 focus:outline-none focus:ring-white focus:border-white"
                placeholder="Rechercher..."
              />
            </div>
          </div>
          
          <div className="flex-1 h-0 mt-5 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'bg-primary-800 text-white'
                      : 'text-primary-100 hover:bg-primary-600'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <item.icon className="w-6 h-6 mr-3 text-primary-300" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="pt-4 mt-6 border-t border-primary-800">
            <div className="px-2 space-y-1">
              <button
                onClick={logout}
                className="flex items-center w-full px-2 py-2 text-base font-medium text-primary-100 rounded-md group hover:bg-primary-600"
              >
                <LogOut className="w-6 h-6 mr-3 text-primary-300" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-primary-700">
          <div className="flex items-center flex-shrink-0 h-16 px-4 bg-primary-800">
            <div className="flex items-center justify-center w-8 h-8 text-white bg-primary-500 rounded-full">
              A
            </div>
            <span className="ml-2 text-xl font-semibold text-white">Admin Lydia</span>
          </div>
          
          <div className="px-3 mt-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="search"
                className="block w-full py-2 pl-10 pr-3 text-sm bg-primary-600 border border-transparent rounded-md placeholder-gray-400 focus:outline-none focus:ring-white focus:border-white"
                placeholder="Rechercher..."
              />
            </div>
          </div>
          
          <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'bg-primary-800 text-white'
                      : 'text-primary-100 hover:bg-primary-600'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <item.icon className="w-5 h-5 mr-3 text-primary-300" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {user && (
            <div className="flex flex-shrink-0 p-4 bg-primary-800">
              <div className="flex items-center w-full">
                <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 text-primary-800 bg-primary-100 rounded-full">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                  <p className="text-xs font-medium text-primary-200">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="ml-auto flex-shrink-0 p-1 text-primary-200 rounded-full hover:text-white"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex flex-col lg:pl-64">
        {/* Navbar */}
        <div className="sticky top-0 z-10 flex flex-shrink-0 h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 text-gray-500 border-r border-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Ouvrir la sidebar</span>
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex justify-between flex-1 px-4">
            <div className="flex flex-1">
              <h1 className="my-auto text-2xl font-semibold text-gray-900">
                {router.pathname === '/dashboard/admin' && 'Tableau de bord'}
                {router.pathname === '/dashboard/admin/users' && 'Gestion des utilisateurs'}
                {router.pathname === '/dashboard/admin/companies' && 'Gestion des entreprises'}
                {router.pathname === '/dashboard/admin/reports' && 'Rapports'}
                {router.pathname === '/dashboard/admin/stats' && 'Statistiques'}
                {router.pathname === '/dashboard/admin/settings' && 'Paramètres'}
                {router.pathname === '/dashboard/admin/security' && 'Sécurité'}
              </h1>
            </div>
            
            <div className="flex items-center ml-4 space-x-4">
              {/* Notifications */}
              <button className="p-1 text-gray-400 bg-white rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <span className="sr-only">Voir les notifications</span>
                <Bell className="w-6 h-6" />
              </button>
              
              {/* Aide */}
              <button className="p-1 text-gray-400 bg-white rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <span className="sr-only">Aide</span>
                <HelpCircle className="w-6 h-6" />
              </button>
              
              {/* Menu utilisateur */}
              <div className="relative">
                <div>
                  <button
                    type="button"
                    className="flex items-center max-w-xs text-sm bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                    id="user-menu-button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <span className="sr-only">Ouvrir le menu utilisateur</span>
                    <div className="flex items-center justify-center w-8 h-8 text-white bg-primary-600 rounded-full">
                      {user?.firstName?.charAt(0) || 'A'}
                    </div>
                    <ChevronDown className="w-4 h-4 ml-1 text-gray-400" />
                  </button>
                </div>
                
                {userMenuOpen && (
                  <div
                    className="absolute right-0 z-10 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <div className="py-1 border-b border-gray-100">
                      <span className="block px-4 py-2 text-xs text-gray-500">
                        Connecté en tant que
                      </span>
                      <span className="block px-4 py-2 text-sm font-medium text-gray-900">
                        {user?.email || 'admin@lydia.com'}
                      </span>
                    </div>
                    <Link
                      href="/dashboard/admin/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Mon profil
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contenu de la page */}
        <main className="flex-1">
          <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 
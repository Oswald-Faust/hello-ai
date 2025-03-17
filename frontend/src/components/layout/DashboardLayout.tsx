import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
  Phone,
  Building2,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  User
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: Home },
    { name: 'Appels', href: '/dashboard/calls', icon: Phone },
    { name: 'Entreprises', href: '/dashboard/companies', icon: Building2, role: 'admin' },
    { name: 'Utilisateurs', href: '/dashboard/users', icon: Users, role: 'admin' },
    { name: 'Paramètres', href: '/dashboard/settings', icon: Settings }
  ];

  // Filtrer les éléments de navigation en fonction du rôle de l'utilisateur
  const filteredNavigation = navigation.filter(
    item => !item.role || (user && item.role === user.role)
  );

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar pour mobile */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white border-r border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center">
              <Image src="/logo.svg" alt="Lydia" width={32} height={32} />
              <span className="ml-2 text-xl font-semibold text-gray-900">Lydia</span>
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 text-gray-500 rounded-md hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 px-2 py-4 overflow-y-auto">
            <nav className="flex-1 space-y-1">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    router.pathname === item.href
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3 text-gray-400" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5 mr-3 text-gray-400" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar pour desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white">
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center">
            <Image src="/logo.svg" alt="Lydia" width={32} height={32} />
            <span className="ml-2 text-xl font-semibold text-gray-900">Lydia</span>
          </Link>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  router.pathname === item.href
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3 text-gray-400" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5 mr-3 text-gray-400" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex items-center h-16 px-4 bg-white border-b border-gray-200 lg:px-6">
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 text-gray-500 rounded-md lg:hidden hover:text-gray-900 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center justify-end flex-1 ml-4">
            <div className="flex items-center">
              <button className="p-1 text-gray-400 rounded-full hover:text-gray-500">
                <Bell className="w-6 h-6" />
              </button>
              <div className="relative ml-3">
                <div className="flex items-center">
                  <div className="flex items-center p-2 text-sm bg-gray-100 rounded-full">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 
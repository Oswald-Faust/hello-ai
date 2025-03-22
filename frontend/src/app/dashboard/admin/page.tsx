'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Importer le composant d'admin dashboard existant
const AdminDashboardComponent = dynamic(
  () => import('@/pages/dashboard/admin'),
  { ssr: false, loading: () => <AdminDashboardLoading /> }
);

// Composant de chargement pendant l'import dynamique
function AdminDashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminDashboardLoading />}>
      <AdminDashboardComponent />
    </Suspense>
  );
} 
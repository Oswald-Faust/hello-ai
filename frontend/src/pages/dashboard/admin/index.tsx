import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Building2, PhoneCall, ArrowUpRight, ActivitySquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/layouts/AdminLayout';
import adminService, { DashboardStats } from '@/services/adminService';

const AdminDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est un admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }

    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const data = await adminService.getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des statistiques:', err);
        setError('Impossible de charger les statistiques du tableau de bord');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchDashboardStats();
    }
  }, [user, router]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push('/dashboard/admin/system')}>
            État du système
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Carte statistiques utilisateurs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" /> Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{stats?.userStats.total || 0}</div>
            <div className="grid grid-cols-2 gap-2 text-sm mt-4">
              <div className="flex flex-col">
                <span className="text-muted-foreground">Actifs</span>
                <span className="font-medium">{stats?.userStats.active || 0}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Admins</span>
                <span className="font-medium">{stats?.userStats.admin || 0}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.push('/dashboard/admin/users')}>
              Gérer les utilisateurs <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Carte statistiques entreprises */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5" /> Entreprises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{stats?.companyStats.total || 0}</div>
            <div className="grid grid-cols-2 gap-2 text-sm mt-4">
              <div className="flex flex-col">
                <span className="text-muted-foreground">Actives</span>
                <span className="font-medium">{stats?.companyStats.active || 0}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Taux d'activité</span>
                <span className="font-medium">
                  {stats ? Math.round((stats.companyStats.active / stats.companyStats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.push('/dashboard/admin/companies')}>
              Gérer les entreprises <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Carte statistiques appels */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <PhoneCall className="mr-2 h-5 w-5" /> Appels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{stats?.callStats.total || 0}</div>
            <div className="grid grid-cols-2 gap-2 text-sm mt-4">
              <div className="flex flex-col">
                <span className="text-muted-foreground">30 derniers jours</span>
                <span className="font-medium">{stats?.callStats.last30Days || 0}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Moyenne / jour</span>
                <span className="font-medium">
                  {stats ? Math.round(stats.callStats.last30Days / 30) : 0}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.push('/dashboard/admin/calls')}>
              Voir les appels <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Activités récentes</CardTitle>
            <CardDescription>Les dernières actions dans le système</CardDescription>
          </CardHeader>
          <CardContent>
            {stats && stats.recentActivities.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 pb-4 border-b last:border-0">
                    <div className="bg-muted p-2 rounded-full">
                      <ActivitySquare className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {activity.type === 'user_created'
                          ? `Nouvel utilisateur : ${activity.data.name}`
                          : `Nouvelle entreprise : ${activity.data.name}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.data.email}
                        {activity.data.company && ` - ${activity.data.company}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                Aucune activité récente à afficher
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Accès rapide</CardTitle>
            <CardDescription>Actions fréquentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline" onClick={() => router.push('/dashboard/admin/users/create')}>
              <Users className="mr-2 h-4 w-4" /> Ajouter un utilisateur
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => router.push('/dashboard/admin/companies/create')}>
              <Building2 className="mr-2 h-4 w-4" /> Ajouter une entreprise
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => router.push('/dashboard/admin/system/logs')}>
              <ActivitySquare className="mr-2 h-4 w-4" /> Consulter les logs système
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 
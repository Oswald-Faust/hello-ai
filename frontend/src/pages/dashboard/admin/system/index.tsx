import React from 'react';
import { Wrench, Languages, Mic, Bot } from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

const SystemDashboard = () => {
  const services = [
    {
      name: 'Service vocal (TTS)',
      description: 'Configuration du service de synthèse vocale pour la génération audio',
      icon: Wrench,
      href: '/dashboard/admin/system/voice-service',
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      name: 'Service de parole (STT)',
      description: 'Configuration du service de reconnaissance vocale',
      icon: Mic,
      href: '/dashboard/admin/system/speech-service',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      name: 'Service Hugging Face',
      description: 'Configuration des modèles d\'IA et des paramètres LLM',
      icon: Bot,
      href: '/dashboard/admin/system/huggingface-service',
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuration Système</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les services backend et leurs configurations
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link key={service.name} href={service.href}>
              <Card className="hover:shadow-md transition-shadow">
                <div className="p-6 space-y-4">
                  <div className={`p-3 rounded-lg inline-flex ${service.color}`}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-500">{service.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SystemDashboard; 
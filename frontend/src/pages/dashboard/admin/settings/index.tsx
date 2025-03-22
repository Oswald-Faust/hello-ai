import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/layout/AdminLayout';
import { Save, Settings, Globe, Mail, Bell, Lock, Database, User, Server } from 'lucide-react';

const SettingsAdminPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');

  // Vérifier si l'utilisateur est un admin
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // États pour les formulaires
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Mon Application',
    siteDescription: 'Une application de gestion moderne',
    contactEmail: 'contact@example.com',
    supportEmail: 'support@example.com',
    maxUploadSize: '10',
    defaultLanguage: 'fr',
    maintenanceMode: false
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.example.com',
    smtpPort: '587',
    smtpUser: 'smtp-user',
    smtpPassword: '••••••••',
    fromEmail: 'no-reply@example.com',
    fromName: 'Mon Application',
    enableSsl: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    enableEmailNotifications: true,
    enableAdminAlerts: true,
    notifyOnNewUser: true,
    notifyOnNewCompany: true,
    digestFrequency: 'daily'
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-t-primary-600 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Gérer les changements de formulaire général
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setGeneralSettings({
      ...generalSettings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  // Gérer les changements de formulaire email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setEmailSettings({
      ...emailSettings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  // Gérer les changements de formulaire notifications
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setNotificationSettings({
      ...notificationSettings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  return (
    <AdminLayout>
      <div className="px-4 sm:px-0">
        <div className="pb-5 mb-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold leading-6 text-gray-900">Paramètres système</h2>
          <p className="mt-2 text-sm text-gray-500">
            Configurez les paramètres globaux de l'application.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Navigation des onglets */}
          <div className="w-full mb-5 lg:w-64 lg:mb-0 lg:mr-8">
            <nav className="space-y-1" aria-label="Onglets">
              <button
                onClick={() => setActiveTab('general')}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'general'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-5 h-5 mr-3" />
                <span>Général</span>
              </button>
              
              <button
                onClick={() => setActiveTab('email')}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'email'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Mail className="w-5 h-5 mr-3" />
                <span>Email</span>
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'notifications'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Bell className="w-5 h-5 mr-3" />
                <span>Notifications</span>
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'security'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Lock className="w-5 h-5 mr-3" />
                <span>Sécurité</span>
              </button>
              
              <button
                onClick={() => setActiveTab('database')}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'database'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Database className="w-5 h-5 mr-3" />
                <span>Base de données</span>
              </button>
              
              <button
                onClick={() => setActiveTab('system')}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'system'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Server className="w-5 h-5 mr-3" />
                <span>Système</span>
              </button>
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="flex-1 mt-5 lg:mt-0">
            <div className="p-6 bg-white rounded-lg shadow">
              {/* Paramètres généraux */}
              {activeTab === 'general' && (
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Paramètres généraux</h3>
                  <div className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                          Nom du site
                        </label>
                        <input
                          type="text"
                          name="siteName"
                          id="siteName"
                          value={generalSettings.siteName}
                          onChange={handleGeneralChange}
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="defaultLanguage" className="block text-sm font-medium text-gray-700">
                          Langue par défaut
                        </label>
                        <select
                          id="defaultLanguage"
                          name="defaultLanguage"
                          value={generalSettings.defaultLanguage}
                          onChange={handleGeneralChange}
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          <option value="fr">Français</option>
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="de">Deutsch</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                        Description du site
                      </label>
                      <textarea
                        id="siteDescription"
                        name="siteDescription"
                        rows={3}
                        value={generalSettings.siteDescription}
                        onChange={handleGeneralChange}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                          Email de contact
                        </label>
                        <input
                          type="email"
                          name="contactEmail"
                          id="contactEmail"
                          value={generalSettings.contactEmail}
                          onChange={handleGeneralChange}
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="supportEmail" className="block text-sm font-medium text-gray-700">
                          Email de support
                        </label>
                        <input
                          type="email"
                          name="supportEmail"
                          id="supportEmail"
                          value={generalSettings.supportEmail}
                          onChange={handleGeneralChange}
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="maxUploadSize" className="block text-sm font-medium text-gray-700">
                          Taille max. upload (MB)
                        </label>
                        <input
                          type="number"
                          name="maxUploadSize"
                          id="maxUploadSize"
                          value={generalSettings.maxUploadSize}
                          onChange={handleGeneralChange}
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="maintenanceMode"
                          name="maintenanceMode"
                          type="checkbox"
                          checked={generalSettings.maintenanceMode}
                          onChange={handleGeneralChange}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="maintenanceMode" className="font-medium text-gray-700">
                          Mode maintenance
                        </label>
                        <p className="text-gray-500">Activer le mode maintenance (seuls les administrateurs pourront se connecter)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Paramètres email */}
              {activeTab === 'email' && (
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Configuration des emails</h3>
                  <div className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700">
                          Serveur SMTP
                        </label>
                        <input
                          type="text"
                          name="smtpHost"
                          id="smtpHost"
                          value={emailSettings.smtpHost}
                          onChange={handleEmailChange}
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700">
                          Port SMTP
                        </label>
                        <input
                          type="text"
                          name="smtpPort"
                          id="smtpPort"
                          value={emailSettings.smtpPort}
                          onChange={handleEmailChange}
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="smtpUser" className="block text-sm font-medium text-gray-700">
                          Utilisateur SMTP
                        </label>
                        <input
                          type="text"
                          name="smtpUser"
                          id="smtpUser"
                          value={emailSettings.smtpUser}
                          onChange={handleEmailChange}
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700">
                          Mot de passe SMTP
                        </label>
                        <input
                          type="password"
                          name="smtpPassword"
                          id="smtpPassword"
                          value={emailSettings.smtpPassword}
                          onChange={handleEmailChange}
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700">
                          Email expéditeur
                        </label>
                        <input
                          type="email"
                          name="fromEmail"
                          id="fromEmail"
                          value={emailSettings.fromEmail}
                          onChange={handleEmailChange}
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="fromName" className="block text-sm font-medium text-gray-700">
                          Nom de l'expéditeur
                        </label>
                        <input
                          type="text"
                          name="fromName"
                          id="fromName"
                          value={emailSettings.fromName}
                          onChange={handleEmailChange}
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="enableSsl"
                          name="enableSsl"
                          type="checkbox"
                          checked={emailSettings.enableSsl}
                          onChange={handleEmailChange}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="enableSsl" className="font-medium text-gray-700">
                          Activer SSL/TLS
                        </label>
                        <p className="text-gray-500">Utiliser une connexion sécurisée pour l'envoi d'emails</p>
                      </div>
                    </div>
                    
                    <div>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Tester la configuration
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Paramètres notifications */}
              {activeTab === 'notifications' && (
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Paramètres de notifications</h3>
                  <div className="mt-6 space-y-6">
                    <div className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="enableEmailNotifications"
                          name="enableEmailNotifications"
                          type="checkbox"
                          checked={notificationSettings.enableEmailNotifications}
                          onChange={handleNotificationChange}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="enableEmailNotifications" className="font-medium text-gray-700">
                          Activer les notifications par email
                        </label>
                        <p className="text-gray-500">Les utilisateurs recevront des notifications par email</p>
                      </div>
                    </div>
                    
                    <div className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="enableAdminAlerts"
                          name="enableAdminAlerts"
                          type="checkbox"
                          checked={notificationSettings.enableAdminAlerts}
                          onChange={handleNotificationChange}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="enableAdminAlerts" className="font-medium text-gray-700">
                          Activer les alertes administrateur
                        </label>
                        <p className="text-gray-500">Les administrateurs recevront des alertes pour les événements importants</p>
                      </div>
                    </div>
                    
                    <div className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="notifyOnNewUser"
                          name="notifyOnNewUser"
                          type="checkbox"
                          checked={notificationSettings.notifyOnNewUser}
                          onChange={handleNotificationChange}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="notifyOnNewUser" className="font-medium text-gray-700">
                          Notifier à l'inscription d'un utilisateur
                        </label>
                        <p className="text-gray-500">Les administrateurs seront notifiés lors de l'inscription d'un nouvel utilisateur</p>
                      </div>
                    </div>
                    
                    <div className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="notifyOnNewCompany"
                          name="notifyOnNewCompany"
                          type="checkbox"
                          checked={notificationSettings.notifyOnNewCompany}
                          onChange={handleNotificationChange}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="notifyOnNewCompany" className="font-medium text-gray-700">
                          Notifier à la création d'une entreprise
                        </label>
                        <p className="text-gray-500">Les administrateurs seront notifiés lors de la création d'une nouvelle entreprise</p>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="digestFrequency" className="block text-sm font-medium text-gray-700">
                        Fréquence des rapports récapitulatifs
                      </label>
                      <select
                        id="digestFrequency"
                        name="digestFrequency"
                        value={notificationSettings.digestFrequency}
                        onChange={handleNotificationChange}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="daily">Quotidien</option>
                        <option value="weekly">Hebdomadaire</option>
                        <option value="monthly">Mensuel</option>
                        <option value="never">Jamais</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglets supplémentaires (pour simplifier, nous n'affichons que des espaces réservés) */}
              {activeTab === 'security' && (
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Paramètres de sécurité</h3>
                  <p className="mt-2 text-sm text-gray-500">Configurez les options de sécurité de l'application.</p>
                  <div className="p-4 mt-4 text-sm border border-gray-200 rounded bg-gray-50">
                    Cette section sera implémentée dans une prochaine mise à jour.
                  </div>
                </div>
              )}

              {activeTab === 'database' && (
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Paramètres de la base de données</h3>
                  <p className="mt-2 text-sm text-gray-500">Configurez les options de connexion à la base de données.</p>
                  <div className="p-4 mt-4 text-sm border border-gray-200 rounded bg-gray-50">
                    Cette section sera implémentée dans une prochaine mise à jour.
                  </div>
                </div>
              )}

              {activeTab === 'system' && (
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Informations système</h3>
                  <p className="mt-2 text-sm text-gray-500">Visualisez les informations sur le système.</p>
                  
                  <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Informations système</h3>
                      <p className="max-w-2xl mt-1 text-sm text-gray-500">Détails techniques et statut du système.</p>
                    </div>
                    <div className="border-t border-gray-200">
                      <dl>
                        <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Version de l'application</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">v1.0.0</dd>
                        </div>
                        <div className="px-4 py-5 bg-white sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Environnement</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">Production</dd>
                        </div>
                        <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Version PHP</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">8.1.0</dd>
                        </div>
                        <div className="px-4 py-5 bg-white sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Version de la base de données</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">MySQL 8.0.28</dd>
                        </div>
                        <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Espace disque</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            <div className="relative w-full h-4 overflow-hidden rounded-full bg-gray-200">
                              <div className="absolute top-0 left-0 h-4 bg-primary-600" style={{ width: '25%' }}></div>
                            </div>
                            <p className="mt-1">5.2 GB utilisés sur 20 GB (25%)</p>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 mr-3 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Vider le cache
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Télécharger les logs
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Boutons d'action */}
            {(activeTab === 'general' || activeTab === 'email' || activeTab === 'notifications') && (
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Save className="w-5 h-5 mr-2 -ml-1" />
                  Enregistrer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsAdminPage; 
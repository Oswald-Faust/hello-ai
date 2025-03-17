import React, { useState } from 'react';
import { NextPage } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, User, Building, Lock, Bell, Phone, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const SettingsPage: NextPage = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '+33 6 12 34 56 78' // Exemple
  });
  
  const [companyForm, setCompanyForm] = useState({
    name: 'Tech Solutions SAS', // Exemple
    address: '15 rue de la Paix, 75001 Paris', // Exemple
    phone: '+33 1 23 45 67 89', // Exemple
    website: 'https://techsolutions.fr' // Exemple
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    callNotifications: true,
    weeklyReports: true,
    marketingEmails: false
  });
  
  const [twilioSettings, setTwilioSettings] = useState({
    accountSid: '************',
    authToken: '************',
    phoneNumber: '+33 9 87 65 43 21' // Exemple
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTwilioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTwilioSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Profil mis à jour');
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Informations de l\'entreprise mises à jour');
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    alert('Mot de passe mis à jour');
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Préférences de notification mises à jour');
  };

  const handleSaveTwilio = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Paramètres Twilio mis à jour');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <form onSubmit={handleSaveProfile}>
            <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={profileForm.firstName}
                  onChange={handleProfileChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={profileForm.lastName}
                  onChange={handleProfileChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Téléphone
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button type="submit" className="flex items-center gap-1">
                <Save className="w-4 h-4" />
                Enregistrer
              </Button>
            </div>
          </form>
        );
      case 'company':
        return (
          <form onSubmit={handleSaveCompany}>
            <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nom de l'entreprise
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={companyForm.name}
                  onChange={handleCompanyChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Téléphone
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={companyForm.phone}
                  onChange={handleCompanyChange}
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Adresse
                </label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  value={companyForm.address}
                  onChange={handleCompanyChange}
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Site web
                </label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={companyForm.website}
                  onChange={handleCompanyChange}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button type="submit" className="flex items-center gap-1">
                <Save className="w-4 h-4" />
                Enregistrer
              </Button>
            </div>
          </form>
        );
      case 'password':
        return (
          <form onSubmit={handleSavePassword}>
            <div className="grid grid-cols-1 gap-6 mt-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Mot de passe actuel
                </label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  Nouveau mot de passe
                </label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="mt-1"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Le mot de passe doit contenir au moins 8 caractères.
                </p>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmer le mot de passe
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="mt-1"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button type="submit" className="flex items-center gap-1">
                <Save className="w-4 h-4" />
                Mettre à jour le mot de passe
              </Button>
            </div>
          </form>
        );
      case 'notifications':
        return (
          <form onSubmit={handleSaveNotifications}>
            <div className="mt-4 space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="emailNotifications"
                    name="emailNotifications"
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={handleNotificationChange}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                    Notifications par email
                  </label>
                  <p className="text-gray-500">
                    Recevez des notifications par email pour les nouveaux appels.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="callNotifications"
                    name="callNotifications"
                    type="checkbox"
                    checked={notificationSettings.callNotifications}
                    onChange={handleNotificationChange}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="callNotifications" className="font-medium text-gray-700">
                    Notifications d'appels manqués
                  </label>
                  <p className="text-gray-500">
                    Recevez des notifications pour les appels manqués.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="weeklyReports"
                    name="weeklyReports"
                    type="checkbox"
                    checked={notificationSettings.weeklyReports}
                    onChange={handleNotificationChange}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="weeklyReports" className="font-medium text-gray-700">
                    Rapports hebdomadaires
                  </label>
                  <p className="text-gray-500">
                    Recevez un rapport hebdomadaire sur l'activité des appels.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="marketingEmails"
                    name="marketingEmails"
                    type="checkbox"
                    checked={notificationSettings.marketingEmails}
                    onChange={handleNotificationChange}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="marketingEmails" className="font-medium text-gray-700">
                    Emails marketing
                  </label>
                  <p className="text-gray-500">
                    Recevez des emails sur les nouvelles fonctionnalités et offres.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button type="submit" className="flex items-center gap-1">
                <Save className="w-4 h-4" />
                Enregistrer les préférences
              </Button>
            </div>
          </form>
        );
      case 'twilio':
        return (
          <form onSubmit={handleSaveTwilio}>
            <div className="grid grid-cols-1 gap-6 mt-4">
              <div>
                <label htmlFor="accountSid" className="block text-sm font-medium text-gray-700">
                  Twilio Account SID
                </label>
                <Input
                  id="accountSid"
                  name="accountSid"
                  type="text"
                  value={twilioSettings.accountSid}
                  onChange={handleTwilioChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label htmlFor="authToken" className="block text-sm font-medium text-gray-700">
                  Twilio Auth Token
                </label>
                <Input
                  id="authToken"
                  name="authToken"
                  type="password"
                  value={twilioSettings.authToken}
                  onChange={handleTwilioChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Numéro de téléphone Twilio
                </label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={twilioSettings.phoneNumber}
                  onChange={handleTwilioChange}
                  className="mt-1"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button type="submit" className="flex items-center gap-1">
                <Save className="w-4 h-4" />
                Enregistrer les paramètres
              </Button>
            </div>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center px-4 py-3 text-sm font-medium ${
                      activeTab === 'profile'
                        ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <User className="w-5 h-5 mr-3" />
                    Profil
                  </button>
                  <button
                    onClick={() => setActiveTab('company')}
                    className={`flex items-center px-4 py-3 text-sm font-medium ${
                      activeTab === 'company'
                        ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Building className="w-5 h-5 mr-3" />
                    Entreprise
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`flex items-center px-4 py-3 text-sm font-medium ${
                      activeTab === 'password'
                        ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Lock className="w-5 h-5 mr-3" />
                    Mot de passe
                  </button>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`flex items-center px-4 py-3 text-sm font-medium ${
                      activeTab === 'notifications'
                        ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Bell className="w-5 h-5 mr-3" />
                    Notifications
                  </button>
                  <button
                    onClick={() => setActiveTab('twilio')}
                    className={`flex items-center px-4 py-3 text-sm font-medium ${
                      activeTab === 'twilio'
                        ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Phone className="w-5 h-5 mr-3" />
                    Twilio
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === 'profile' && 'Informations du profil'}
                  {activeTab === 'company' && 'Informations de l\'entreprise'}
                  {activeTab === 'password' && 'Changer le mot de passe'}
                  {activeTab === 'notifications' && 'Préférences de notification'}
                  {activeTab === 'twilio' && 'Configuration Twilio'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderTabContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage; 
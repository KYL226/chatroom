'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, Settings, Shield, Users, Bell, Globe } from 'lucide-react';

interface Settings {
  general: {
    siteName: string;
    siteDescription: string;
    maxUsersPerRoom: number;
    maxMessageLength: number;
    allowFileUploads: boolean;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  security: {
    requireEmailVerification: boolean;
    allowRegistration: boolean;
    minPasswordLength: number;
    requireStrongPassword: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    enableTwoFactor: boolean;
  };
  moderation: {
    enableAutoModeration: boolean;
    autoDeleteProfanity: boolean;
    requireApprovalForRooms: boolean;
    maxReportsBeforeBan: number;
    banDuration: number;
    enableWordFilter: boolean;
    filteredWords: string[];
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    notifyOnReport: boolean;
    notifyOnNewUser: boolean;
    notifyOnRoomCreation: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    enableEmojis: boolean;
    enableMarkdown: boolean;
    showOnlineStatus: boolean;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    general: {
      siteName: 'ChatRoom',
      siteDescription: 'Plateforme de chat en temps réel',
      maxUsersPerRoom: 100,
      maxMessageLength: 1000,
      allowFileUploads: true,
      maxFileSize: 10,
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
    },
    security: {
      requireEmailVerification: true,
      allowRegistration: true,
      minPasswordLength: 8,
      requireStrongPassword: true,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      enableTwoFactor: false
    },
    moderation: {
      enableAutoModeration: true,
      autoDeleteProfanity: false,
      requireApprovalForRooms: false,
      maxReportsBeforeBan: 3,
      banDuration: 7,
      enableWordFilter: true,
      filteredWords: ['spam', 'insulte', 'racisme']
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      notifyOnReport: true,
      notifyOnNewUser: false,
      notifyOnRoomCreation: true
    },
    appearance: {
      theme: 'auto',
      primaryColor: '#3B82F6',
      enableEmojis: true,
      enableMarkdown: true,
      showOnlineStatus: true
    }
  });

  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'moderation' | 'notifications' | 'appearance'>('general');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);


  const fetchSettings = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || settings);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
  }, [settings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ settings })
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        console.error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }, [settings]);

  const updateSetting = (section: keyof Settings, key: string, value: string | number | boolean | string[]) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const addFilteredWord = (word: string) => {
    if (word && !settings.moderation.filteredWords.includes(word)) {
      updateSetting('moderation', 'filteredWords', [...settings.moderation.filteredWords, word]);
    }
  };

  const removeFilteredWord = (word: string) => {
    updateSetting('moderation', 'filteredWords', 
      settings.moderation.filteredWords.filter(w => w !== word)
    );
  };

  const addFileType = (type: string) => {
    if (type && !settings.general.allowedFileTypes.includes(type)) {
      updateSetting('general', 'allowedFileTypes', [...settings.general.allowedFileTypes, type]);
    }
  };

  const removeFileType = (type: string) => {
    updateSetting('general', 'allowedFileTypes', 
      settings.general.allowedFileTypes.filter(t => t !== type)
    );
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'moderation', label: 'Modération', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Apparence', icon: Globe }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Paramètres d&apos;Administration</h1>
        <p className="text-gray-600">Configurez les paramètres de la plateforme</p>
      </div>

      {/* Onglets */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'general' | 'security' | 'notifications' | 'appearance')}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-6">
          {/* Onglet Général */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Paramètres Généraux</h3>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Nom du site
                  </label>
                  <input
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Description du site
                  </label>
                  <input
                    type="text"
                    value={settings.general.siteDescription}
                    onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Utilisateurs max par salle
                  </label>
                  <input
                    type="number"
                    value={settings.general.maxUsersPerRoom}
                    onChange={(e) => updateSetting('general', 'maxUsersPerRoom', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Longueur max des messages
                  </label>
                  <input
                    type="number"
                    value={settings.general.maxMessageLength}
                    onChange={(e) => updateSetting('general', 'maxMessageLength', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Taille max des fichiers (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.general.maxFileSize}
                    onChange={(e) => updateSetting('general', 'maxFileSize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowFileUploads"
                    checked={settings.general.allowFileUploads}
                    onChange={(e) => updateSetting('general', 'allowFileUploads', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="allowFileUploads" className="ml-2 text-sm text-gray-700">
                    Autoriser l&apos;upload de fichiers
                  </label>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Types de fichiers autorisés
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {settings.general.allowedFileTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full"
                    >
                      {type}
                      <button
                        onClick={() => removeFileType(type)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Ajouter un type (ex: mp4)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addFileType((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      addFileType(input.value);
                      input.value = '';
                    }}
                    className="px-4 py-2 text-white bg-blue-600 rounded-r-md hover:bg-blue-700"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Sécurité */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Paramètres de Sécurité</h3>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireEmailVerification"
                    checked={settings.security.requireEmailVerification}
                    onChange={(e) => updateSetting('security', 'requireEmailVerification', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="requireEmailVerification" className="ml-2 text-sm text-gray-700">
                    Vérification email obligatoire
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowRegistration"
                    checked={settings.security.allowRegistration}
                    onChange={(e) => updateSetting('security', 'allowRegistration', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="allowRegistration" className="ml-2 text-sm text-gray-700">
                    Autoriser les inscriptions
                  </label>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Longueur min du mot de passe
                  </label>
                  <input
                    type="number"
                    value={settings.security.minPasswordLength}
                    onChange={(e) => updateSetting('security', 'minPasswordLength', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Timeout de session (heures)
                  </label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Tentatives de connexion max
                  </label>
                  <input
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireStrongPassword"
                    checked={settings.security.requireStrongPassword}
                    onChange={(e) => updateSetting('security', 'requireStrongPassword', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="requireStrongPassword" className="ml-2 text-sm text-gray-700">
                    Mot de passe fort obligatoire
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableTwoFactor"
                    checked={settings.security.enableTwoFactor}
                    onChange={(e) => updateSetting('security', 'enableTwoFactor', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="enableTwoFactor" className="ml-2 text-sm text-gray-700">
                    Activer l&apos;authentification à deux facteurs
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Modération */}
          {activeTab === 'moderation' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Paramètres de Modération</h3>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableAutoModeration"
                    checked={settings.moderation.enableAutoModeration}
                    onChange={(e) => updateSetting('moderation', 'enableAutoModeration', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="enableAutoModeration" className="ml-2 text-sm text-gray-700">
                    Modération automatique
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoDeleteProfanity"
                    checked={settings.moderation.autoDeleteProfanity}
                    onChange={(e) => updateSetting('moderation', 'autoDeleteProfanity', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="autoDeleteProfanity" className="ml-2 text-sm text-gray-700">
                    Suppression automatique des gros mots
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireApprovalForRooms"
                    checked={settings.moderation.requireApprovalForRooms}
                    onChange={(e) => updateSetting('moderation', 'requireApprovalForRooms', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="requireApprovalForRooms" className="ml-2 text-sm text-gray-700">
                    Approbation requise pour les nouvelles salles
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableWordFilter"
                    checked={settings.moderation.enableWordFilter}
                    onChange={(e) => updateSetting('moderation', 'enableWordFilter', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="enableWordFilter" className="ml-2 text-sm text-gray-700">
                    Filtre de mots
                  </label>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Signalements avant bannissement
                  </label>
                  <input
                    type="number"
                    value={settings.moderation.maxReportsBeforeBan}
                    onChange={(e) => updateSetting('moderation', 'maxReportsBeforeBan', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Durée de bannissement (jours)
                  </label>
                  <input
                    type="number"
                    value={settings.moderation.banDuration}
                    onChange={(e) => updateSetting('moderation', 'banDuration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {settings.moderation.enableWordFilter && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Mots filtrés
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {settings.moderation.filteredWords.map((word) => (
                      <span
                        key={word}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full"
                      >
                        {word}
                        <button
                          onClick={() => removeFilteredWord(word)}
                          className="ml-1 text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Ajouter un mot à filtrer"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addFilteredWord((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addFilteredWord(input.value);
                        input.value = '';
                      }}
                      className="px-4 py-2 text-white bg-red-600 rounded-r-md hover:bg-red-700"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Onglet Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Paramètres de Notifications</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="emailNotifications" className="ml-2 text-sm text-gray-700">
                    Notifications par email
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pushNotifications"
                    checked={settings.notifications.pushNotifications}
                    onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="pushNotifications" className="ml-2 text-sm text-gray-700">
                    Notifications push
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifyOnReport"
                    checked={settings.notifications.notifyOnReport}
                    onChange={(e) => updateSetting('notifications', 'notifyOnReport', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="notifyOnReport" className="ml-2 text-sm text-gray-700">
                    Notifier lors d&apos;un signalement
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifyOnNewUser"
                    checked={settings.notifications.notifyOnNewUser}
                    onChange={(e) => updateSetting('notifications', 'notifyOnNewUser', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="notifyOnNewUser" className="ml-2 text-sm text-gray-700">
                    Notifier lors d&apos;une nouvelle inscription
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifyOnRoomCreation"
                    checked={settings.notifications.notifyOnRoomCreation}
                    onChange={(e) => updateSetting('notifications', 'notifyOnRoomCreation', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="notifyOnRoomCreation" className="ml-2 text-sm text-gray-700">
                    Notifier lors de la création d&apos;une salle
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Apparence */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Paramètres d&apos;Apparence</h3>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Thème
                  </label>
                  <select
                    value={settings.appearance.theme}
                    onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="light">Clair</option>
                    <option value="dark">Sombre</option>
                    <option value="auto">Automatique</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Couleur principale
                  </label>
                  <input
                    type="color"
                    value={settings.appearance.primaryColor}
                    onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableEmojis"
                    checked={settings.appearance.enableEmojis}
                    onChange={(e) => updateSetting('appearance', 'enableEmojis', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="enableEmojis" className="ml-2 text-sm text-gray-700">
                    Activer les emojis
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableMarkdown"
                    checked={settings.appearance.enableMarkdown}
                    onChange={(e) => updateSetting('appearance', 'enableMarkdown', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="enableMarkdown" className="ml-2 text-sm text-gray-700">
                    Activer le Markdown
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showOnlineStatus"
                    checked={settings.appearance.showOnlineStatus}
                    onChange={(e) => updateSetting('appearance', 'showOnlineStatus', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="showOnlineStatus" className="ml-2 text-sm text-gray-700">
                    Afficher le statut en ligne
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {saved && (
              <span className="text-green-600">✓ Paramètres sauvegardés</span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={saveSettings}
              disabled={loading}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


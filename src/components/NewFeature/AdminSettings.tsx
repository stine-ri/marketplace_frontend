import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '../../utilis/auth';
import { showToast } from '../../utilis/toast';
import { toast } from 'react-hot-toast';
import {
  FiSettings,
  FiDatabase,
  FiMail,
  FiShield,
  FiUsers,
  FiServer,
  FiGlobe,
  FiSave,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiInfo,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiLock,
  FiUnlock,
  FiBell,
  FiToggleLeft,
  FiToggleRight
} from 'react-icons/fi';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

interface SystemStats {
  totalUsers: number;
  totalServices: number;
  totalColleges: number;
  totalCategories: number;
  totalBids: number;
  totalRequests: number;
  totalProducts: number;
  activeUsers: number;
  systemUptime: string;
  lastBackup: string;
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  enableEmailNotifications: boolean;
  enableWelcomeEmails: boolean;
  enableOrderEmails: boolean;
}

interface SecuritySettings {
  maxLoginAttempts: number;
  sessionTimeout: number;
  requireEmailVerification: boolean;
  enableTwoFactor: boolean;
  passwordMinLength: number;
  requireSpecialChars: boolean;
  enableRecaptcha: boolean;
  recaptchaSiteKey: string;
  recaptchaSecretKey: string;
}

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  enableRegistration: boolean;
  enableGuestCheckout: boolean;
  defaultCurrency: string;
  defaultLanguage: string;
  timezone: string;
  enableAnalytics: boolean;
  googleAnalyticsId: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  adminAlerts: boolean;
  userActivityAlerts: boolean;
  systemAlerts: boolean;
  marketingEmails: boolean;
  newsletterEnabled: boolean;
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<'general' | 'database' | 'email' | 'security' | 'notifications' | 'system'>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Settings states
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
    enableEmailNotifications: true,
    enableWelcomeEmails: true,
    enableOrderEmails: true,
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    requireEmailVerification: true,
    enableTwoFactor: false,
    passwordMinLength: 8,
    requireSpecialChars: true,
    enableRecaptcha: false,
    recaptchaSiteKey: '',
    recaptchaSecretKey: '',
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: 'Marketplace',
    siteDescription: 'A modern marketplace platform',
    siteUrl: '',
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing maintenance. Please check back soon.',
    enableRegistration: true,
    enableGuestCheckout: true,
    defaultCurrency: 'USD',
    defaultLanguage: 'en',
    timezone: 'UTC',
    enableAnalytics: false,
    googleAnalyticsId: '',
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    adminAlerts: true,
    userActivityAlerts: true,
    systemAlerts: true,
    marketingEmails: false,
    newsletterEnabled: true,
  });

  // Load settings on component mount
  useEffect(() => {
    loadAllSettings();
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/admin/product/stats/overview`, {
        headers: getAuthHeaders()
      });
      setSystemStats(response.data);
    } catch (error) {
      console.error('Failed to load system stats:', error);
    }
  };

  const loadAllSettings = async () => {
    setIsLoading(true);
    try {
      const [emailRes, securityRes, systemRes, notificationRes] = await Promise.all([
        axios.get(`${baseURL}/api/admin/settings/email`, { headers: getAuthHeaders() }).catch(() => ({ data: emailSettings })),
        axios.get(`${baseURL}/api/admin/settings/security`, { headers: getAuthHeaders() }).catch(() => ({ data: securitySettings })),
        axios.get(`${baseURL}/api/admin/settings/system`, { headers: getAuthHeaders() }).catch(() => ({ data: systemSettings })),
        axios.get(`${baseURL}/api/admin/settings/notifications`, { headers: getAuthHeaders() }).catch(() => ({ data: notificationSettings })),
      ]);

      setEmailSettings(emailRes.data);
      setSecuritySettings(securityRes.data);
      setSystemSettings(systemRes.data);
      setNotificationSettings(notificationRes.data);
    } catch (error) {
      console.error('Failed to load settings:', error);
      showToast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (settingsType: string, settings: any) => {
    setIsSaving(true);
    try {
      await axios.put(`${baseURL}/api/admin/settings/${settingsType}`, settings, {
        headers: getAuthHeaders()
      });
      showToast.success(`${settingsType} settings saved successfully`);
      setUnsavedChanges(false);
    } catch (error: any) {
      console.error(`Failed to save ${settingsType} settings:`, error);
      showToast.error(error.response?.data?.message || `Failed to save ${settingsType} settings`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      const loadingToast = toast.loading('Sending test email...');
      await axios.post(`${baseURL}/api/admin/settings/email/test`, emailSettings, {
        headers: getAuthHeaders()
      });
      toast.dismiss(loadingToast);
      showToast.success('Test email sent successfully');
    } catch (error: any) {
      toast.dismiss();
      showToast.error(error.response?.data?.message || 'Failed to send test email');
    }
  };

  const handleBackupDatabase = async () => {
    try {
      const loadingToast = toast.loading('Creating database backup...');
      const response = await axios.post(`${baseURL}/api/admin/settings/backup`, {}, {
        headers: getAuthHeaders(),
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${new Date().toISOString().slice(0, 10)}.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.dismiss(loadingToast);
      showToast.success('Database backup created successfully');
      loadSystemStats(); // Refresh stats
    } catch (error: any) {
      toast.dismiss();
      showToast.error(error.response?.data?.message || 'Failed to create backup');
    }
  };

  const handleClearCache = async () => {
    try {
      const loadingToast = toast.loading('Clearing system cache...');
      await axios.post(`${baseURL}/api/admin/settings/cache/clear`, {}, {
        headers: getAuthHeaders()
      });
      toast.dismiss(loadingToast);
      showToast.success('System cache cleared successfully');
    } catch (error: any) {
      toast.dismiss();
      showToast.error(error.response?.data?.message || 'Failed to clear cache');
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: FiSettings },
    { id: 'database', label: 'Database', icon: FiDatabase },
    { id: 'email', label: 'Email', icon: FiMail },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'system', label: 'System', icon: FiServer },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure and manage your application settings</p>
        </div>
        
        {unsavedChanges && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
            <FiAlertTriangle size={16} />
            <span className="text-sm">You have unsaved changes</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* System Overview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiInfo className="text-blue-500" />
                System Overview
              </h3>
              
              {systemStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FiUsers className="text-blue-600" size={24} />
                      <div>
                        <p className="text-sm text-blue-600">Total Users</p>
                        <p className="text-2xl font-bold text-blue-700">{systemStats.totalUsers}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FiSettings className="text-green-600" size={24} />
                      <div>
                        <p className="text-sm text-green-600">Services</p>
                        <p className="text-2xl font-bold text-green-700">{systemStats.totalServices}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FiGlobe className="text-purple-600" size={24} />
                      <div>
                        <p className="text-sm text-purple-600">Active Users</p>
                        <p className="text-2xl font-bold text-purple-700">{systemStats.activeUsers}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FiServer className="text-yellow-600" size={24} />
                      <div>
                        <p className="text-sm text-yellow-600">System Status</p>
                        <p className="text-sm font-bold text-yellow-700">Online</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={handleBackupDatabase}
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition text-left"
                >
                  <FiDownload className="text-blue-600" size={20} />
                  <div>
                    <p className="font-medium">Backup Database</p>
                    <p className="text-sm text-gray-600">Create a backup of your data</p>
                  </div>
                </button>
                
                <button
                  onClick={handleClearCache}
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition text-left"
                >
                  <FiRefreshCw className="text-green-600" size={20} />
                  <div>
                    <p className="font-medium">Clear Cache</p>
                    <p className="text-sm text-gray-600">Clear system cache</p>
                  </div>
                </button>
                
                <button
                  onClick={loadSystemStats}
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition text-left"
                >
                  <FiRefreshCw className="text-purple-600" size={20} />
                  <div>
                    <p className="font-medium">Refresh Stats</p>
                    <p className="text-sm text-gray-600">Update system statistics</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiDatabase className="text-blue-500" />
              Database Management
            </h3>
            
            <div className="space-y-6">
              {/* Database Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Database Status</h4>
                  <div className="flex items-center gap-2 text-green-600">
                    <FiCheck size={16} />
                    <span>Connected</span>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Last Backup</h4>
                  <p className="text-gray-600">{systemStats?.lastBackup || 'Never'}</p>
                </div>
              </div>

              {/* Database Actions */}
              <div className="space-y-4">
                <h4 className="font-medium">Database Operations</h4>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleBackupDatabase}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    <FiDownload size={16} />
                    Create Backup
                  </button>
                  
                  <button className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition">
                    <FiUpload size={16} />
                    Restore Backup
                  </button>
                  
                  <button
                    onClick={handleClearCache}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    <FiRefreshCw size={16} />
                    Clear Cache
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FiAlertTriangle className="text-red-600 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-medium text-red-800">Important Notice</h4>
                    <p className="text-red-700 mt-1">
                      Database operations can affect system performance. It's recommended to perform these actions during maintenance windows.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FiMail className="text-blue-500" />
                Email Settings
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleTestEmail}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition text-sm"
                >
                  <FiMail size={14} />
                  Test Email
                </button>
                <button
                  onClick={() => saveSettings('email', emailSettings)}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm disabled:opacity-50"
                >
                  <FiSave size={14} />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* SMTP Configuration */}
              <div>
                <h4 className="font-medium mb-4">SMTP Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                    <input
                      type="text"
                      value={emailSettings.smtpHost}
                      onChange={(e) => {
                        setEmailSettings({...emailSettings, smtpHost: e.target.value});
                        setUnsavedChanges(true);
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                    <input
                      type="number"
                      value={emailSettings.smtpPort}
                      onChange={(e) => {
                        setEmailSettings({...emailSettings, smtpPort: parseInt(e.target.value)});
                        setUnsavedChanges(true);
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Username</label>
                    <input
                      type="text"
                      value={emailSettings.smtpUser}
                      onChange={(e) => {
                        setEmailSettings({...emailSettings, smtpUser: e.target.value});
                        setUnsavedChanges(true);
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords ? "text" : "password"}
                        value={emailSettings.smtpPassword}
                        onChange={(e) => {
                          setEmailSettings({...emailSettings, smtpPassword: e.target.value});
                          setUnsavedChanges(true);
                        }}
                        className="w-full p-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                    <input
                      type="email"
                      value={emailSettings.fromEmail}
                      onChange={(e) => {
                        setEmailSettings({...emailSettings, fromEmail: e.target.value});
                        setUnsavedChanges(true);
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
                    <input
                      type="text"
                      value={emailSettings.fromName}
                      onChange={(e) => {
                        setEmailSettings({...emailSettings, fromName: e.target.value});
                        setUnsavedChanges(true);
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Email Options */}
              <div>
                <h4 className="font-medium mb-4">Email Options</h4>
                <div className="space-y-4">
                  {[
                    { key: 'enableEmailNotifications', label: 'Enable Email Notifications', description: 'Send email notifications to users' },
                    { key: 'enableWelcomeEmails', label: 'Enable Welcome Emails', description: 'Send welcome emails to new users' },
                    { key: 'enableOrderEmails', label: 'Enable Order Emails', description: 'Send order confirmation emails' },
                  ].map((option) => (
                    <div key={option.key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          setEmailSettings({
                            ...emailSettings,
                            [option.key]: !emailSettings[option.key as keyof EmailSettings]
                          });
                          setUnsavedChanges(true);
                        }}
                        className={`flex items-center ${
                          emailSettings[option.key as keyof EmailSettings] ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {emailSettings[option.key as keyof EmailSettings] ? <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FiShield className="text-blue-500" />
                Security Settings
              </h3>
              <button
                onClick={() => saveSettings('security', securitySettings)}
                disabled={isSaving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm disabled:opacity-50"
              >
                <FiSave size={14} />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>

            <div className="space-y-6">
              {/* Login Security */}
              <div>
                <h4 className="font-medium mb-4">Login Security</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label>
                    <input
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => {
                        setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value)});
                        setUnsavedChanges(true);
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      max="10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => {
                        setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)});
                        setUnsavedChanges(true);
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="5"
                      max="1440"
                    />
                  </div>
                </div>
              </div>

              {/* Password Security */}
              <div>
                <h4 className="font-medium mb-4">Password Security</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Password Length</label>
                    <input
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => {
                        setSecuritySettings({...securitySettings, passwordMinLength: parseInt(e.target.value)});
                        setUnsavedChanges(true);
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="6"
                      max="32"
                    />
                  </div>
                </div>
              </div>

              {/* Security Options */}
               <div>
                <h4 className="font-medium mb-4">Security Options</h4>
                <div className="space-y-4">
                  {[
                    { 
                      key: 'requireEmailVerification', 
                      label: 'Require Email Verification', 
                      description: 'Users must verify their email before accessing the platform' 
                    },
                    { 
                      key: 'enableTwoFactor', 
                      label: 'Enable Two-Factor Authentication', 
                      description: 'Allow users to enable 2FA for additional security' 
                    },
                    { 
                      key: 'requireSpecialChars', 
                      label: 'Require Special Characters in Passwords', 
                      description: 'Passwords must contain special characters' 
                    },
                    { 
                      key: 'enableRecaptcha', 
                      label: 'Enable reCAPTCHA', 
                      description: 'Use Google reCAPTCHA for bot protection' 
                    },
                  ].map((option) => (
                    <div key={option.key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSecuritySettings({
                            ...securitySettings,
                            [option.key]: !securitySettings[option.key as keyof SecuritySettings]
                          });
                          setUnsavedChanges(true);
                        }}
                        className={`flex items-center transition ${
                          securitySettings[option.key as keyof SecuritySettings] ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {securitySettings[option.key as keyof SecuritySettings] ? 
                          <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* reCAPTCHA Settings */}
              {securitySettings.enableRecaptcha && (
                <div>
                  <h4 className="font-medium mb-4">reCAPTCHA Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Site Key</label>
                      <input
                        type="text"
                        value={securitySettings.recaptchaSiteKey}
                        onChange={(e) => {
                          setSecuritySettings({...securitySettings, recaptchaSiteKey: e.target.value});
                          setUnsavedChanges(true);
                        }}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter reCAPTCHA site key"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                      <div className="relative">
                        <input
                          type={showPasswords ? "text" : "password"}
                          value={securitySettings.recaptchaSecretKey}
                          onChange={(e) => {
                            setSecuritySettings({...securitySettings, recaptchaSecretKey: e.target.value});
                            setUnsavedChanges(true);
                          }}
                          className="w-full p-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter reCAPTCHA secret key"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(!showPasswords)}
                          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                        >
                          {showPasswords ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Alerts */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FiShield className="text-blue-600 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-medium text-blue-800">Security Best Practices</h4>
                    <div className="text-blue-700 mt-2 text-sm space-y-1">
                      <p>• Regular password changes should be enforced for admin accounts</p>
                      <p>• Monitor failed login attempts and implement IP blocking</p>
                      <p>• Keep session timeout reasonable for your use case</p>
                      <p>• Enable two-factor authentication for all admin users</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FiBell className="text-blue-500" />
                Notification Settings
              </h3>
              <button
                onClick={() => saveSettings('notifications', notificationSettings)}
                disabled={isSaving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm disabled:opacity-50"
              >
                <FiSave size={14} />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>

            <div className="space-y-6">
              {/* User Notifications */}
              <div>
                <h4 className="font-medium mb-4">User Notifications</h4>
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Send notifications via email to users' },
                    { key: 'pushNotifications', label: 'Push Notifications', description: 'Send browser push notifications' },
                    { key: 'smsNotifications', label: 'SMS Notifications', description: 'Send SMS notifications for critical updates' },
                  ].map((option) => (
                    <div key={option.key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          setNotificationSettings({
                            ...notificationSettings,
                            [option.key]: !notificationSettings[option.key as keyof NotificationSettings]
                          });
                          setUnsavedChanges(true);
                        }}
                        className={`flex items-center transition ${
                          notificationSettings[option.key as keyof NotificationSettings] ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {notificationSettings[option.key as keyof NotificationSettings] ? 
                          <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Alerts */}
              <div>
                <h4 className="font-medium mb-4">Admin Alerts</h4>
                <div className="space-y-4">
                  {[
                    { key: 'adminAlerts', label: 'Admin System Alerts', description: 'Receive alerts for system issues' },
                    { key: 'userActivityAlerts', label: 'User Activity Alerts', description: 'Get notified about suspicious user activity' },
                    { key: 'systemAlerts', label: 'System Health Alerts', description: 'Alerts for system performance and errors' },
                  ].map((option) => (
                    <div key={option.key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          setNotificationSettings({
                            ...notificationSettings,
                            [option.key]: !notificationSettings[option.key as keyof NotificationSettings]
                          });
                          setUnsavedChanges(true);
                        }}
                        className={`flex items-center transition ${
                          notificationSettings[option.key as keyof NotificationSettings] ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {notificationSettings[option.key as keyof NotificationSettings] ? 
                          <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Marketing */}
              <div>
                <h4 className="font-medium mb-4">Marketing & Communications</h4>
                <div className="space-y-4">
                  {[
                    { key: 'marketingEmails', label: 'Marketing Emails', description: 'Send promotional and marketing emails' },
                    { key: 'newsletterEnabled', label: 'Newsletter', description: 'Enable newsletter subscriptions' },
                  ].map((option) => (
                    <div key={option.key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          setNotificationSettings({
                            ...notificationSettings,
                            [option.key]: !notificationSettings[option.key as keyof NotificationSettings]
                          });
                          setUnsavedChanges(true);
                        }}
                        className={`flex items-center transition ${
                          notificationSettings[option.key as keyof NotificationSettings] ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {notificationSettings[option.key as keyof NotificationSettings] ? 
                          <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FiServer className="text-blue-500" />
                System Settings
              </h3>
              <button
                onClick={() => saveSettings('system', systemSettings)}
                disabled={isSaving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm disabled:opacity-50"
              >
                <FiSave size={14} />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Settings */}
              <div>
                <h4 className="font-medium mb-4">Basic Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                    <input
                      type="text"
                      value={systemSettings.siteName}
                      onChange={(e) => {
                        setSystemSettings({...systemSettings, siteName: e.target.value});
                        setUnsavedChanges(true);
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site URL</label>
                    <input
                      type="url"
                      value={systemSettings.siteUrl}
                      onChange={(e) => {
                        setSystemSettings({...systemSettings, siteUrl: e.target.value});
                        setUnsavedChanges(true);
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://your-domain.com"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
                    <textarea
                      value={systemSettings.siteDescription}
                      onChange={(e) => {
                        setSystemSettings({...systemSettings, siteDescription: e.target.value});
                        setUnsavedChanges(true);
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* System Options */}
              <div>
                <h4 className="font-medium mb-4">System Options</h4>
                <div className="space-y-4">
                  {[
                    { key: 'enableRegistration', label: 'Enable User Registration', description: 'Allow new users to register' },
                    { key: 'enableGuestCheckout', label: 'Enable Guest Checkout', description: 'Allow purchases without registration' },
                    { key: 'enableAnalytics', label: 'Enable Analytics', description: 'Track user behavior and site performance' },
                  ].map((option) => (
                    <div key={option.key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSystemSettings({
                            ...systemSettings,
                            [option.key]: !systemSettings[option.key as keyof SystemSettings]
                          });
                          setUnsavedChanges(true);
                        }}
                        className={`flex items-center transition ${
                          systemSettings[option.key as keyof SystemSettings] ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {systemSettings[option.key as keyof SystemSettings] ? 
                          <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance Mode */}
              <div>
                <h4 className="font-medium mb-4">Maintenance Mode</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-gray-600">Put the site in maintenance mode</p>
                    </div>
                    <button
                      onClick={() => {
                        setSystemSettings({
                          ...systemSettings,
                          maintenanceMode: !systemSettings.maintenanceMode
                        });
                        setUnsavedChanges(true);
                      }}
                      className={`flex items-center transition ${
                        systemSettings.maintenanceMode ? 'text-red-600' : 'text-gray-400'
                      }`}
                    >
                      {systemSettings.maintenanceMode ? <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
                    </button>
                  </div>
                  
                  {systemSettings.maintenanceMode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Message</label>
                      <textarea
                        value={systemSettings.maintenanceMessage}
                        onChange={(e) => {
                          setSystemSettings({...systemSettings, maintenanceMessage: e.target.value});
                          setUnsavedChanges(true);
                        }}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Enter message to display during maintenance"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Localization */}
              <div>
                <h4 className="font-medium mb-4">Localization</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                    <select
                      value={systemSettings.defaultCurrency}
                      onChange={(e) => {
                        setSystemSettings({...systemSettings, defaultCurrency: e.target.value});
                        setUnsavedChanges(true);
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="KES">KES (KSh)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
                    <select
                      value={systemSettings.defaultLanguage}
                      onChange={(e) => {
                        setSystemSettings({...systemSettings, defaultLanguage: e.target.value});
                        setUnsavedChanges(true);
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="sw">Swahili</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select
                      value={systemSettings.timezone}
                      onChange={(e) => {
                        setSystemSettings({...systemSettings, timezone: e.target.value});
                        setUnsavedChanges(true);
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Africa/Nairobi">Nairobi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Analytics */}
              {systemSettings.enableAnalytics && (
                <div>
                  <h4 className="font-medium mb-4">Analytics Configuration</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics ID</label>
                    <input
                      type="text"
                      value={systemSettings.googleAnalyticsId}
                      onChange={(e) => {
                        setSystemSettings({...systemSettings, googleAnalyticsId: e.target.value});
                        setUnsavedChanges(true);
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="GA-XXXXXXXXX-X"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
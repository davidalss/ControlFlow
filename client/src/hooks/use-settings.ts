import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  qualityAlerts: boolean;
  supplierUpdates: boolean;
  systemMaintenance: boolean;
  trainingReminders: boolean;
  frequency: 'immediate' | 'hourly' | 'daily';
}

export interface SystemSettings {
  language: 'pt-BR' | 'en-US' | 'es-ES';
  theme: 'light' | 'dark' | 'auto';
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  autoLogout: number;
  dataRetention: number;
}

export interface QualitySettings {
  autoApprovalThreshold: number;
  criticalDefectThreshold: number;
  supplierPerformanceThreshold: number;
  notificationDelay: number;
  requirePhotoEvidence: boolean;
  enableAutoAnalysis: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordExpiryDays: number;
}

const defaultNotificationSettings: NotificationSettings = {
  email: true,
  push: false,
  inApp: true,
  qualityAlerts: true,
  supplierUpdates: true,
  systemMaintenance: false,
  trainingReminders: true,
  frequency: 'immediate'
};

const defaultSystemSettings: SystemSettings = {
  language: 'pt-BR',
  theme: 'auto',
  timezone: 'America/Sao_Paulo',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  autoLogout: 30,
  dataRetention: 365
};

const defaultQualitySettings: QualitySettings = {
  autoApprovalThreshold: 95,
  criticalDefectThreshold: 5,
  supplierPerformanceThreshold: 85,
  notificationDelay: 15,
  requirePhotoEvidence: true,
  enableAutoAnalysis: false
};

const defaultSecuritySettings: SecuritySettings = {
  twoFactorAuth: false,
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  passwordExpiryDays: 90
};

export function useSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotificationSettings);
  const [system, setSystem] = useState<SystemSettings>(defaultSystemSettings);
  const [quality, setQuality] = useState<QualitySettings>(defaultQualitySettings);
  const [security, setSecurity] = useState<SecuritySettings>(defaultSecuritySettings);

  // Carregar configurações do localStorage
  const loadSettings = useCallback(() => {
    try {
      const savedNotifications = localStorage.getItem('settings.notifications');
      const savedSystem = localStorage.getItem('settings.system');
      const savedQuality = localStorage.getItem('settings.quality');
      const savedSecurity = localStorage.getItem('settings.security');

      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
      if (savedSystem) {
        const systemSettings = JSON.parse(savedSystem);
        setSystem(systemSettings);
        // Aplicar tema imediatamente
        if (systemSettings.theme && systemSettings.theme !== 'auto') {
          document.documentElement.setAttribute('data-theme', systemSettings.theme);
        }
      }
      if (savedQuality) {
        setQuality(JSON.parse(savedQuality));
      }
      if (savedSecurity) {
        setSecurity(JSON.parse(savedSecurity));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  }, []);

  // Salvar configurações
  const saveSettings = useCallback(async (type: 'notifications' | 'system' | 'quality' | 'security' | 'all') => {
    setIsLoading(true);
    try {
      switch (type) {
        case 'notifications':
          localStorage.setItem('settings.notifications', JSON.stringify(notifications));
          break;
        case 'system':
          localStorage.setItem('settings.system', JSON.stringify(system));
          // Aplicar tema imediatamente
          if (system.theme !== 'auto') {
            document.documentElement.setAttribute('data-theme', system.theme);
          }
          break;
        case 'quality':
          localStorage.setItem('settings.quality', JSON.stringify(quality));
          break;
        case 'security':
          localStorage.setItem('settings.security', JSON.stringify(security));
          break;
        case 'all':
          localStorage.setItem('settings.notifications', JSON.stringify(notifications));
          localStorage.setItem('settings.system', JSON.stringify(system));
          localStorage.setItem('settings.quality', JSON.stringify(quality));
          localStorage.setItem('settings.security', JSON.stringify(security));
          break;
      }
      toast({ title: 'Sucesso', description: 'Configurações salvas com sucesso.' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível salvar as configurações.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [notifications, system, quality, security, toast]);

  // Resetar configurações para padrão
  const resetSettings = useCallback(async (type: 'notifications' | 'system' | 'quality' | 'security' | 'all') => {
    setIsLoading(true);
    try {
      switch (type) {
        case 'notifications':
          setNotifications(defaultNotificationSettings);
          localStorage.removeItem('settings.notifications');
          break;
        case 'system':
          setSystem(defaultSystemSettings);
          localStorage.removeItem('settings.system');
          break;
        case 'quality':
          setQuality(defaultQualitySettings);
          localStorage.removeItem('settings.quality');
          break;
        case 'security':
          setSecurity(defaultSecuritySettings);
          localStorage.removeItem('settings.security');
          break;
        case 'all':
          setNotifications(defaultNotificationSettings);
          setSystem(defaultSystemSettings);
          setQuality(defaultQualitySettings);
          setSecurity(defaultSecuritySettings);
          localStorage.removeItem('settings.notifications');
          localStorage.removeItem('settings.system');
          localStorage.removeItem('settings.quality');
          localStorage.removeItem('settings.security');
          break;
      }
      toast({ title: 'Sucesso', description: 'Configurações resetadas para padrão.' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível resetar as configurações.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Exportar configurações
  const exportSettings = useCallback(() => {
    try {
      const settingsData = {
        notifications,
        system,
        quality,
        security,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `controlflow-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: 'Sucesso', description: 'Configurações exportadas com sucesso.' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível exportar as configurações.', variant: 'destructive' });
    }
  }, [notifications, system, quality, security, toast]);

  // Importar configurações
  const importSettings = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const text = await file.text();
      const settingsData = JSON.parse(text);

      if (settingsData.notifications) {
        setNotifications(settingsData.notifications);
        localStorage.setItem('settings.notifications', JSON.stringify(settingsData.notifications));
      }
      if (settingsData.system) {
        setSystem(settingsData.system);
        localStorage.setItem('settings.system', JSON.stringify(settingsData.system));
      }
      if (settingsData.quality) {
        setQuality(settingsData.quality);
        localStorage.setItem('settings.quality', JSON.stringify(settingsData.quality));
      }
      if (settingsData.security) {
        setSecurity(settingsData.security);
        localStorage.setItem('settings.security', JSON.stringify(settingsData.security));
      }

      toast({ title: 'Sucesso', description: 'Configurações importadas com sucesso.' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível importar as configurações.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Carregar configurações na inicialização
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    // Estados
    notifications,
    system,
    quality,
    security,
    isLoading,
    
    // Setters
    setNotifications,
    setSystem,
    setQuality,
    setSecurity,
    
    // Ações
    saveSettings,
    resetSettings,
    exportSettings,
    importSettings,
    loadSettings
  };
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Sistema de Notificações
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'urgent';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
  category: 'training' | 'system' | 'reminder' | 'achievement';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: Date;
  userId: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  categories: {
    training: boolean;
    system: boolean;
    reminder: boolean;
    achievement: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily';
}

class NotificationService {
  private notifications: Notification[] = [];
  private settings: NotificationSettings = {
    email: true,
    push: true,
    inApp: true,
    categories: {
      training: true,
      system: true,
      reminder: true,
      achievement: true,
    },
    frequency: 'immediate',
  };

  constructor() {
    this.loadFromStorage();
    this.requestNotificationPermission();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        this.notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
          expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined,
        }));
      }

      const storedSettings = localStorage.getItem('notificationSettings');
      if (storedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(storedSettings) };
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
      localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Erro ao salvar notificações:', error);
    }
  }

  private async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  async createNotification(
    type: Notification['type'],
    title: string,
    message: string,
    category: Notification['category'] = 'system',
    priority: Notification['priority'] = 'medium',
    action?: Notification['action'],
    expiresAt?: Date
  ): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      action,
      category,
      priority,
      expiresAt,
      userId: this.getCurrentUserId(),
    };

    this.notifications.unshift(notification);
    this.saveToStorage();

    // Enviar notificação baseada nas configurações
    await this.sendNotification(notification);

    return notification;
  }

  private async sendNotification(notification: Notification) {
    // Verificar se a categoria está habilitada
    if (!this.settings.categories[notification.category]) {
      return;
    }

    // Notificação in-app
    if (this.settings.inApp) {
      this.showInAppNotification(notification);
    }

    // Notificação push do navegador
    if (this.settings.push && 'Notification' in window && Notification.permission === 'granted') {
      this.showPushNotification(notification);
    }

    // Notificação por email (implementar integração)
    if (this.settings.email) {
      await this.sendEmailNotification(notification);
    }
  }

  private showInAppNotification(notification: Notification) {
    // Implementar toast ou modal de notificação
    const event = new CustomEvent('showNotification', { detail: notification });
    window.dispatchEvent(event);
  }

  private showPushNotification(notification: Notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
      });
    }
  }

  private async sendEmailNotification(notification: Notification) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';
      await fetch(`${apiUrl}/api/notifications/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
    }
  }

  // Notificações específicas para treinamentos
  async createTrainingNotification(
    trainingId: string,
    trainingTitle: string,
    type: 'urgent' | 'reminder' | 'completed' | 'new'
  ) {
    const notifications = {
      urgent: {
        title: 'Treinamento Urgente',
        message: `O treinamento "${trainingTitle}" é urgente e deve ser concluído o quanto antes.`,
        priority: 'urgent' as const,
      },
      reminder: {
        title: 'Lembrete de Treinamento',
        message: `Você tem um treinamento pendente: "${trainingTitle}".`,
        priority: 'high' as const,
      },
      completed: {
        title: 'Treinamento Concluído',
        message: `Parabéns! Você concluiu o treinamento "${trainingTitle}".`,
        priority: 'medium' as const,
      },
      new: {
        title: 'Novo Treinamento Disponível',
        message: `Um novo treinamento está disponível: "${trainingTitle}".`,
        priority: 'medium' as const,
      },
    };

    const config = notifications[type];
    return this.createNotification(
      type === 'urgent' ? 'urgent' : 'info',
      config.title,
      config.message,
      'training',
      config.priority,
      {
        label: 'Ver Treinamento',
        url: `/training/${trainingId}`,
      }
    );
  }

  // Notificações de sistema
  async createSystemNotification(
    title: string,
    message: string,
    type: Notification['type'] = 'info'
  ) {
    return this.createNotification(type, title, message, 'system');
  }

  // Notificações de lembretes
  async createReminderNotification(
    title: string,
    message: string,
    expiresAt: Date
  ) {
    return this.createNotification(
      'warning',
      title,
      message,
      'reminder',
      'medium',
      undefined,
      expiresAt
    );
  }

  // Notificações de conquistas
  async createAchievementNotification(
    title: string,
    message: string,
    action?: Notification['action']
  ) {
    return this.createNotification(
      'success',
      title,
      message,
      'achievement',
      'medium',
      action
    );
  }

  // Métodos de gerenciamento
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveToStorage();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveToStorage();
  }

  deleteNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveToStorage();
  }

  getNotifications(limit?: number): Notification[] {
    let notifications = this.notifications;
    
    // Filtrar notificações expiradas
    notifications = notifications.filter(n => 
      !n.expiresAt || n.expiresAt > new Date()
    );

    return limit ? notifications.slice(0, limit) : notifications;
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getUrgentCount(): number {
    return this.notifications.filter(n => 
      n.priority === 'urgent' && !n.read
    ).length;
  }

  updateSettings(settings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...settings };
    this.saveToStorage();
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getCurrentUserId(): string {
    return localStorage.getItem('userId') || 'anonymous';
  }

  // Limpar notificações antigas
  cleanup() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    this.notifications = this.notifications.filter(n => 
      n.timestamp > oneWeekAgo && (!n.expiresAt || n.expiresAt > new Date())
    );
    this.saveToStorage();
  }
}

export const notificationService = new NotificationService();

// Hook para usar notificações em componentes React (versão antiga - removida)
// export const useNotifications = () => {
//   return {
//     createNotification: notificationService.createNotification.bind(notificationService),
//     createTrainingNotification: notificationService.createTrainingNotification.bind(notificationService),
//     createSystemNotification: notificationService.createSystemNotification.bind(notificationService),
//     createReminderNotification: notificationService.createReminderNotification.bind(notificationService),
//     createAchievementNotification: notificationService.createAchievementNotification.bind(notificationService),
//     markAsRead: notificationService.markAsRead.bind(notificationService),
//     markAllAsRead: notificationService.markAllAsRead.bind(notificationService),
//     deleteNotification: notificationService.deleteNotification.bind(notificationService),
//     getNotifications: notificationService.getNotifications.bind(notificationService),
//     getUnreadCount: notificationService.getUnreadCount.bind(notificationService),
//     getUrgentCount: notificationService.getUrgentCount.bind(notificationService),
//     updateSettings: notificationService.updateSettings.bind(notificationService),
//     getSettings: notificationService.getSettings.bind(notificationService),
//   };
// };

// Serviço de Notificações para Produtos
import { toast } from '@/hooks/use-toast';

export interface ProductNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  productId?: string;
  productCode?: string;
  action: 'create' | 'update' | 'delete';
  userId?: string;
  userName?: string;
  timestamp: Date;
  read: boolean;
}

class ProductNotificationService {
  private notifications: ProductNotification[] = [];
  private listeners: ((notifications: ProductNotification[]) => void)[] = [];

  // Criar notificação
  createNotification(notification: Omit<ProductNotification, 'id' | 'timestamp' | 'read'>): ProductNotification {
    const newNotification: ProductNotification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification);
    this.notifyListeners();
    this.showToast(newNotification);
    this.saveToLocalStorage();

    return newNotification;
  }

  // Notificação de criação de produto
  notifyProductCreated(productCode: string, productDescription: string, userName?: string) {
    return this.createNotification({
      type: 'success',
      title: 'Produto Criado',
      message: `Produto "${productCode}" (${productDescription}) foi criado com sucesso.`,
      productCode,
      action: 'create',
      userName,
      timestamp: new Date()
    });
  }

  // Notificação de atualização de produto
  notifyProductUpdated(productCode: string, productDescription: string, userName?: string) {
    return this.createNotification({
      type: 'info',
      title: 'Produto Atualizado',
      message: `Produto "${productCode}" (${productDescription}) foi atualizado.`,
      productCode,
      action: 'update',
      userName,
      timestamp: new Date()
    });
  }

  // Notificação de exclusão de produto
  notifyProductDeleted(productCode: string, productDescription: string, userName?: string) {
    return this.createNotification({
      type: 'warning',
      title: 'Produto Excluído',
      message: `Produto "${productCode}" (${productDescription}) foi excluído.`,
      productCode,
      action: 'delete',
      userName,
      timestamp: new Date()
    });
  }

  // Notificação de erro
  notifyError(action: string, error: string, productCode?: string, userName?: string) {
    return this.createNotification({
      type: 'error',
      title: 'Erro na Operação',
      message: `Erro ao ${action} produto${productCode ? ` "${productCode}"` : ''}: ${error}`,
      productCode,
      action: action as any,
      userName,
      timestamp: new Date()
    });
  }

  // Marcar como lida
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
      this.saveToLocalStorage();
    }
  }

  // Marcar todas como lidas
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.notifyListeners();
    this.saveToLocalStorage();
  }

  // Obter notificações
  getNotifications(): ProductNotification[] {
    return this.notifications;
  }

  // Obter notificações não lidas
  getUnreadNotifications(): ProductNotification[] {
    return this.notifications.filter(n => !n.read);
  }

  // Contar notificações não lidas
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Filtrar notificações por produto
  getNotificationsByProduct(productCode: string): ProductNotification[] {
    return this.notifications.filter(n => n.productCode === productCode);
  }

  // Limpar notificações antigas (mais de 30 dias)
  clearOldNotifications() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    this.notifications = this.notifications.filter(n => n.timestamp > thirtyDaysAgo);
    this.notifyListeners();
    this.saveToLocalStorage();
  }

  // Limpar todas as notificações
  clearAllNotifications() {
    this.notifications = [];
    this.notifyListeners();
    this.saveToLocalStorage();
  }

  // Adicionar listener
  addListener(listener: (notifications: ProductNotification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notificar listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Mostrar toast
  private showToast(notification: ProductNotification) {
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.type === 'error' ? 'destructive' : 'default',
    });
  }

  // Salvar no localStorage
  private saveToLocalStorage() {
    try {
      localStorage.setItem('product_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Erro ao salvar notificações no localStorage:', error);
    }
  }

  // Carregar do localStorage
  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('product_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.notifications = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Erro ao carregar notificações do localStorage:', error);
    }
  }

  // Inicializar serviço
  init() {
    this.loadFromLocalStorage();
    this.clearOldNotifications();
    
    // Limpar notificações antigas a cada hora
    setInterval(() => {
      this.clearOldNotifications();
    }, 60 * 60 * 1000);
  }
}

// Instância singleton
export const productNotificationService = new ProductNotificationService();

// Inicializar automaticamente
if (typeof window !== 'undefined') {
  productNotificationService.init();
}

export default productNotificationService;

// Contexto React para notificações
interface NotificationsContextType {
  notifications: Notification[];
  createNotification: (type: Notification['type'], title: string, message: string, category?: Notification['category'], priority?: Notification['priority'], action?: Notification['action'], expiresAt?: Date) => Promise<Notification>;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  getUnreadCount: () => number;
  clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [service] = useState(() => new NotificationService());

  useEffect(() => {
    // Carregar notificações iniciais
    setNotifications(service.getNotifications());

    // Adicionar listener para atualizações
    const unsubscribe = service.addListener((updatedNotifications) => {
      setNotifications(updatedNotifications);
    });

    return unsubscribe;
  }, [service]);

  const createNotification = async (
    type: Notification['type'],
    title: string,
    message: string,
    category: Notification['category'] = 'system',
    priority: Notification['priority'] = 'medium',
    action?: Notification['action'],
    expiresAt?: Date
  ) => {
    return await service.createNotification(type, title, message, category, priority, action, expiresAt);
  };

  const markAsRead = (id: string) => {
    service.markAsRead(id);
  };

  const deleteNotification = (id: string) => {
    service.deleteNotification(id);
  };

  const getUnreadCount = () => {
    return service.getUnreadCount();
  };

  const clearAll = () => {
    service.clearAllNotifications();
  };

  return React.createElement(NotificationsContext.Provider, {
    value: {
      notifications,
      createNotification,
      markAsRead,
      deleteNotification,
      getUnreadCount,
      clearAll
    }
  }, children);
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}

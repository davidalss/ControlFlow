// Sistema de Integração com Calendário
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  attendees?: string[];
  reminder?: number; // minutos antes
  trainingId?: string;
  type: 'training' | 'test' | 'deadline' | 'reminder';
  calendarType: 'teams' | 'google' | 'apple' | 'outlook';
}

export interface CalendarIntegration {
  type: 'teams' | 'google' | 'apple' | 'outlook';
  name: string;
  icon: string;
  color: string;
  isConnected: boolean;
  lastSync?: Date;
  settings: {
    autoSync: boolean;
    syncInterval: number; // minutos
    defaultReminder: number; // minutos
    includeDescription: boolean;
    includeLocation: boolean;
  };
}

export interface CalendarSettings {
  defaultCalendar: 'teams' | 'google' | 'apple' | 'outlook';
  integrations: CalendarIntegration[];
  globalSettings: {
    autoCreateEvents: boolean;
    syncCompletedTrainings: boolean;
    includeTestDeadlines: boolean;
    defaultReminder: number;
  };
}

class CalendarService {
  private events: CalendarEvent[] = [];
  private integrations: CalendarIntegration[] = [
    {
      type: 'teams',
      name: 'Microsoft Teams',
      icon: '🏢',
      color: '#6264A7',
      isConnected: false,
      settings: {
        autoSync: true,
        syncInterval: 15,
        defaultReminder: 15,
        includeDescription: true,
        includeLocation: false,
      },
    },
    {
      type: 'google',
      name: 'Google Calendar',
      icon: '📅',
      color: '#4285F4',
      isConnected: false,
      settings: {
        autoSync: true,
        syncInterval: 10,
        defaultReminder: 10,
        includeDescription: true,
        includeLocation: true,
      },
    },
    {
      type: 'apple',
      name: 'Apple Calendar',
      icon: '🍎',
      color: '#007AFF',
      isConnected: false,
      settings: {
        autoSync: true,
        syncInterval: 20,
        defaultReminder: 20,
        includeDescription: true,
        includeLocation: true,
      },
    },
    {
      type: 'outlook',
      name: 'Outlook Calendar',
      icon: '📧',
      color: '#0078D4',
      isConnected: false,
      settings: {
        autoSync: true,
        syncInterval: 15,
        defaultReminder: 15,
        includeDescription: true,
        includeLocation: false,
      },
    },
  ];

  private settings: CalendarSettings = {
    defaultCalendar: 'google',
    integrations: this.integrations,
    globalSettings: {
      autoCreateEvents: true,
      syncCompletedTrainings: false,
      includeTestDeadlines: true,
      defaultReminder: 15,
    },
  };

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedEvents = localStorage.getItem('calendarEvents');
      if (storedEvents) {
        this.events = JSON.parse(storedEvents).map((e: any) => ({
          ...e,
          startDate: new Date(e.startDate),
          endDate: new Date(e.endDate),
        }));
      }

      const storedSettings = localStorage.getItem('calendarSettings');
      if (storedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(storedSettings) };
      }

      const storedIntegrations = localStorage.getItem('calendarIntegrations');
      if (storedIntegrations) {
        this.integrations = JSON.parse(storedIntegrations);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do calendário:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('calendarEvents', JSON.stringify(this.events));
      localStorage.setItem('calendarSettings', JSON.stringify(this.settings));
      localStorage.setItem('calendarIntegrations', JSON.stringify(this.integrations));
    } catch (error) {
      console.error('Erro ao salvar dados do calendário:', error);
    }
  }

  // Conectar com calendário
  async connectCalendar(calendarType: CalendarIntegration['type']): Promise<boolean> {
    try {
      const integration = this.integrations.find(i => i.type === calendarType);
      if (!integration) return false;

      switch (calendarType) {
        case 'teams':
          return await this.connectTeams();
        case 'google':
          return await this.connectGoogle();
        case 'apple':
          return await this.connectApple();
        case 'outlook':
          return await this.connectOutlook();
        default:
          return false;
      }
    } catch (error) {
      console.error(`Erro ao conectar com ${calendarType}:`, error);
      return false;
    }
  }

  private async connectTeams(): Promise<boolean> {
    // Implementar autenticação OAuth2 com Microsoft Graph API
    const clientId = process.env.REACT_APP_TEAMS_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/teams/callback`;
    
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent('Calendars.ReadWrite')}`;

    window.location.href = authUrl;
    return true;
  }

  private async connectGoogle(): Promise<boolean> {
    // Implementar autenticação OAuth2 com Google Calendar API
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar')}`;

    window.location.href = authUrl;
    return true;
  }

  private async connectApple(): Promise<boolean> {
    // Implementar autenticação com Apple Calendar
    // Apple Calendar usa CalDAV, então precisamos de uma implementação diferente
    const integration = this.integrations.find(i => i.type === 'apple');
    if (integration) {
      integration.isConnected = true;
      integration.lastSync = new Date();
      this.saveToStorage();
    }
    return true;
  }

  private async connectOutlook(): Promise<boolean> {
    // Outlook usa a mesma API que Teams (Microsoft Graph)
    return await this.connectTeams();
  }

  // Criar evento de treinamento
  async createTrainingEvent(
    trainingId: string,
    trainingTitle: string,
    startDate: Date,
    duration: number, // em minutos
    description?: string,
    location?: string,
    attendees?: string[]
  ): Promise<CalendarEvent | null> {
    if (!this.settings.globalSettings.autoCreateEvents) {
      return null;
    }

    const endDate = new Date(startDate.getTime() + duration * 60000);
    const integration = this.integrations.find(i => i.type === this.settings.defaultCalendar);
    
    if (!integration || !integration.isConnected) {
      return null;
    }

    const event: CalendarEvent = {
      id: this.generateId(),
      title: `Treinamento: ${trainingTitle}`,
      description: description || `Treinamento sobre ${trainingTitle}`,
      startDate,
      endDate,
      location,
      attendees,
      reminder: integration.settings.defaultReminder,
      trainingId,
      type: 'training',
      calendarType: integration.type,
    };

    this.events.push(event);
    this.saveToStorage();

    // Sincronizar com calendário externo
    await this.syncEventToCalendar(event);

    return event;
  }

  // Criar evento de teste
  async createTestEvent(
    trainingId: string,
    trainingTitle: string,
    testDate: Date,
    duration: number,
    description?: string
  ): Promise<CalendarEvent | null> {
    if (!this.settings.globalSettings.includeTestDeadlines) {
      return null;
    }

    const endDate = new Date(testDate.getTime() + duration * 60000);
    const integration = this.integrations.find(i => i.type === this.settings.defaultCalendar);
    
    if (!integration || !integration.isConnected) {
      return null;
    }

    const event: CalendarEvent = {
      id: this.generateId(),
      title: `Teste: ${trainingTitle}`,
      description: description || `Teste do treinamento ${trainingTitle}`,
      startDate: testDate,
      endDate,
      reminder: integration.settings.defaultReminder,
      trainingId,
      type: 'test',
      calendarType: integration.type,
    };

    this.events.push(event);
    this.saveToStorage();

    await this.syncEventToCalendar(event);
    return event;
  }

  // Criar evento de prazo
  async createDeadlineEvent(
    trainingId: string,
    trainingTitle: string,
    deadline: Date,
    description?: string
  ): Promise<CalendarEvent | null> {
    const integration = this.integrations.find(i => i.type === this.settings.defaultCalendar);
    
    if (!integration || !integration.isConnected) {
      return null;
    }

    const event: CalendarEvent = {
      id: this.generateId(),
      title: `Prazo: ${trainingTitle}`,
      description: description || `Prazo para conclusão do treinamento ${trainingTitle}`,
      startDate: deadline,
      endDate: new Date(deadline.getTime() + 60 * 60000), // 1 hora
      reminder: integration.settings.defaultReminder,
      trainingId,
      type: 'deadline',
      calendarType: integration.type,
    };

    this.events.push(event);
    this.saveToStorage();

    await this.syncEventToCalendar(event);
    return event;
  }

  // Criar evento de lembrete
  async createReminderEvent(
    title: string,
    reminderDate: Date,
    description?: string,
    reminderMinutes: number = 15
  ): Promise<CalendarEvent | null> {
    const integration = this.integrations.find(i => i.type === this.settings.defaultCalendar);
    
    if (!integration || !integration.isConnected) {
      return null;
    }

    const event: CalendarEvent = {
      id: this.generateId(),
      title: `Lembrete: ${title}`,
      description: description || title,
      startDate: reminderDate,
      endDate: new Date(reminderDate.getTime() + 30 * 60000), // 30 minutos
      reminder: reminderMinutes,
      type: 'reminder',
      calendarType: integration.type,
    };

    this.events.push(event);
    this.saveToStorage();

    await this.syncEventToCalendar(event);
    return event;
  }

  // Sincronizar evento com calendário externo
  private async syncEventToCalendar(event: CalendarEvent): Promise<boolean> {
    try {
      switch (event.calendarType) {
        case 'teams':
          return await this.syncToTeams(event);
        case 'google':
          return await this.syncToGoogle(event);
        case 'apple':
          return await this.syncToApple(event);
        case 'outlook':
          return await this.syncToOutlook(event);
        default:
          return false;
      }
    } catch (error) {
      console.error(`Erro ao sincronizar com ${event.calendarType}:`, error);
      return false;
    }
  }

  private async syncToTeams(event: CalendarEvent): Promise<boolean> {
    // Implementar sincronização com Microsoft Graph API
    const accessToken = localStorage.getItem('teams_access_token');
    if (!accessToken) return false;

    const eventData = {
      subject: event.title,
      body: {
        contentType: 'HTML',
        content: event.description,
      },
      start: {
        dateTime: event.startDate.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: event.endDate.toISOString(),
        timeZone: 'UTC',
      },
      location: event.location ? {
        displayName: event.location,
      } : undefined,
      attendees: event.attendees?.map(email => ({
        emailAddress: { address: email },
        type: 'required',
      })),
      reminderMinutesBeforeStart: event.reminder,
    };

    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao sincronizar com Teams:', error);
      return false;
    }
  }

  private async syncToGoogle(event: CalendarEvent): Promise<boolean> {
    // Implementar sincronização com Google Calendar API
    const accessToken = localStorage.getItem('google_access_token');
    if (!accessToken) return false;

    const eventData = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.startDate.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: event.endDate.toISOString(),
        timeZone: 'UTC',
      },
      location: event.location,
      attendees: event.attendees?.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          {
            method: 'popup',
            minutes: event.reminder || 15,
          },
        ],
      },
    };

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Erro ao sincronizar com Google:', error);
      return false;
    }
  }

  private async syncToApple(event: CalendarEvent): Promise<boolean> {
    // Implementar sincronização com Apple Calendar via CalDAV
    // Esta é uma implementação mais complexa que requer servidor CalDAV
    console.log('Sincronização com Apple Calendar não implementada');
    return true; // Simular sucesso
  }

  private async syncToOutlook(event: CalendarEvent): Promise<boolean> {
    // Outlook usa a mesma API que Teams
    return await this.syncToTeams(event);
  }

  // Obter eventos
  getEvents(
    options: {
      startDate?: Date;
      endDate?: Date;
      type?: CalendarEvent['type'];
      trainingId?: string;
      calendarType?: CalendarEvent['calendarType'];
    } = {}
  ): CalendarEvent[] {
    let events = this.events;

    if (options.startDate) {
      events = events.filter(e => e.startDate >= options.startDate!);
    }

    if (options.endDate) {
      events = events.filter(e => e.endDate <= options.endDate!);
    }

    if (options.type) {
      events = events.filter(e => e.type === options.type);
    }

    if (options.trainingId) {
      events = events.filter(e => e.trainingId === options.trainingId);
    }

    if (options.calendarType) {
      events = events.filter(e => e.calendarType === options.calendarType);
    }

    return events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  // Obter eventos próximos
  getUpcomingEvents(days: number = 7): CalendarEvent[] {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return this.getEvents({
      startDate: now,
      endDate: future,
    });
  }

  // Obter eventos de hoje
  getTodayEvents(): CalendarEvent[] {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    return this.getEvents({
      startDate: today,
      endDate: tomorrow,
    });
  }

  // Atualizar evento
  updateEvent(eventId: string, updates: Partial<CalendarEvent>): CalendarEvent | null {
    const eventIndex = this.events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return null;

    this.events[eventIndex] = { ...this.events[eventIndex], ...updates };
    this.saveToStorage();

    // Sincronizar com calendário externo
    this.syncEventToCalendar(this.events[eventIndex]);
    
    return this.events[eventIndex];
  }

  // Deletar evento
  deleteEvent(eventId: string): boolean {
    const eventIndex = this.events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return false;

    const event = this.events[eventIndex];
    this.events.splice(eventIndex, 1);
    this.saveToStorage();

    // Remover do calendário externo
    this.deleteFromCalendar(event);
    
    return true;
  }

  private async deleteFromCalendar(event: CalendarEvent): Promise<boolean> {
    try {
      switch (event.calendarType) {
        case 'teams':
          return await this.deleteFromTeams(event);
        case 'google':
          return await this.deleteFromGoogle(event);
        case 'apple':
          return await this.deleteFromApple(event);
        case 'outlook':
          return await this.deleteFromOutlook(event);
        default:
          return false;
      }
    } catch (error) {
      console.error(`Erro ao deletar de ${event.calendarType}:`, error);
      return false;
    }
  }

  private async deleteFromTeams(event: CalendarEvent): Promise<boolean> {
    const accessToken = localStorage.getItem('teams_access_token');
    if (!accessToken || !event.id) return false;

    try {
      const response = await fetch(`https://graph.microsoft.com/v1.0/me/events/${event.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao deletar do Teams:', error);
      return false;
    }
  }

  private async deleteFromGoogle(event: CalendarEvent): Promise<boolean> {
    const accessToken = localStorage.getItem('google_access_token');
    if (!accessToken || !event.id) return false;

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Erro ao deletar do Google:', error);
      return false;
    }
  }

  private async deleteFromApple(event: CalendarEvent): Promise<boolean> {
    // Implementar deleção via CalDAV
    console.log('Deleção do Apple Calendar não implementada');
    return true;
  }

  private async deleteFromOutlook(event: CalendarEvent): Promise<boolean> {
    return await this.deleteFromTeams(event);
  }

  // Configurações
  getSettings(): CalendarSettings {
    return { ...this.settings };
  }

  updateSettings(settings: Partial<CalendarSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.saveToStorage();
  }

  getIntegrations(): CalendarIntegration[] {
    return [...this.integrations];
  }

  updateIntegration(calendarType: CalendarIntegration['type'], updates: Partial<CalendarIntegration>): void {
    const integration = this.integrations.find(i => i.type === calendarType);
    if (integration) {
      Object.assign(integration, updates);
      this.saveToStorage();
    }
  }

  // Sincronização automática
  async syncAllEvents(): Promise<void> {
    const connectedIntegrations = this.integrations.filter(i => i.isConnected);
    
    for (const integration of connectedIntegrations) {
      if (integration.settings.autoSync) {
        await this.syncIntegration(integration.type);
      }
    }
  }

  private async syncIntegration(calendarType: CalendarIntegration['type']): Promise<void> {
    try {
      switch (calendarType) {
        case 'teams':
          await this.syncFromTeams();
          break;
        case 'google':
          await this.syncFromGoogle();
          break;
        case 'apple':
          await this.syncFromApple();
          break;
        case 'outlook':
          await this.syncFromOutlook();
          break;
      }

      const integration = this.integrations.find(i => i.type === calendarType);
      if (integration) {
        integration.lastSync = new Date();
        this.saveToStorage();
      }
    } catch (error) {
      console.error(`Erro ao sincronizar ${calendarType}:`, error);
    }
  }

  private async syncFromTeams(): Promise<void> {
    const accessToken = localStorage.getItem('teams_access_token');
    if (!accessToken) return;

    try {
      const response = await fetch(
        'https://graph.microsoft.com/v1.0/me/events?$select=id,subject,body,start,end,location,attendees',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Processar eventos do Teams e sincronizar com eventos locais
        console.log('Eventos do Teams:', data.value);
      }
    } catch (error) {
      console.error('Erro ao sincronizar do Teams:', error);
    }
  }

  private async syncFromGoogle(): Promise<void> {
    const accessToken = localStorage.getItem('google_access_token');
    if (!accessToken) return;

    try {
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Processar eventos do Google e sincronizar com eventos locais
        console.log('Eventos do Google:', data.items);
      }
    } catch (error) {
      console.error('Erro ao sincronizar do Google:', error);
    }
  }

  private async syncFromApple(): Promise<void> {
    // Implementar sincronização via CalDAV
    console.log('Sincronização do Apple Calendar não implementada');
  }

  private async syncFromOutlook(): Promise<void> {
    await this.syncFromTeams();
  }

  // Utilitários
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Exportar dados
  exportData(): string {
    return JSON.stringify({
      events: this.events,
      settings: this.settings,
      integrations: this.integrations,
    }, null, 2);
  }

  // Limpar dados antigos
  cleanup() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    this.events = this.events.filter(e => e.startDate > oneYearAgo);
    this.saveToStorage();
  }
}

export const calendarService = new CalendarService();

// Hook para usar calendário em componentes React
export const useCalendar = () => {
  return {
    connectCalendar: calendarService.connectCalendar.bind(calendarService),
    createTrainingEvent: calendarService.createTrainingEvent.bind(calendarService),
    createTestEvent: calendarService.createTestEvent.bind(calendarService),
    createDeadlineEvent: calendarService.createDeadlineEvent.bind(calendarService),
    createReminderEvent: calendarService.createReminderEvent.bind(calendarService),
    getEvents: calendarService.getEvents.bind(calendarService),
    getUpcomingEvents: calendarService.getUpcomingEvents.bind(calendarService),
    getTodayEvents: calendarService.getTodayEvents.bind(calendarService),
    updateEvent: calendarService.updateEvent.bind(calendarService),
    deleteEvent: calendarService.deleteEvent.bind(calendarService),
    getSettings: calendarService.getSettings.bind(calendarService),
    updateSettings: calendarService.updateSettings.bind(calendarService),
    getIntegrations: calendarService.getIntegrations.bind(calendarService),
    updateIntegration: calendarService.updateIntegration.bind(calendarService),
    syncAllEvents: calendarService.syncAllEvents.bind(calendarService),
  };
};

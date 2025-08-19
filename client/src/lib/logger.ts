// Sistema de Logs para Verificação e Debugging
export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  component: string;
  action: string;
  message: string;
  data?: any;
  userId?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private isDevelopment = process.env.NODE_ENV === 'development';

  private addLog(level: LogEntry['level'], component: string, action: string, message: string, data?: any) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      action,
      message,
      data,
      userId: this.getCurrentUserId()
    };

    this.logs.push(logEntry);

    // Manter apenas os últimos maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log no console em desenvolvimento
    if (this.isDevelopment) {
      const color = this.getColorForLevel(level);
      console.log(
        `%c[${logEntry.timestamp}] ${level.toUpperCase()} - ${component}: ${action}`,
        `color: ${color}`,
        message,
        data || ''
      );
    }

    // Enviar para servidor em produção
    // Temporariamente desabilitado até a API estar funcionando
    // if (!this.isDevelopment && level === 'error') {
    //   this.sendToServer(logEntry);
    // }
  }

  private getColorForLevel(level: LogEntry['level']): string {
    switch (level) {
      case 'info': return '#0066cc';
      case 'warn': return '#ff9900';
      case 'error': return '#cc0000';
      case 'debug': return '#666666';
      default: return '#000000';
    }
  }

  private getCurrentUserId(): string | undefined {
    // Implementar lógica para obter ID do usuário atual
    return localStorage.getItem('userId') || undefined;
  }

  private async sendToServer(logEntry: LogEntry) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      console.error('Erro ao enviar log para servidor:', error);
    }
  }

  info(component: string, action: string, message: string, data?: any) {
    this.addLog('info', component, action, message, data);
  }

  warn(component: string, action: string, message: string, data?: any) {
    this.addLog('warn', component, action, message, data);
  }

  error(component: string, action: string, message: string, data?: any) {
    this.addLog('error', component, action, message, data);
  }

  debug(component: string, action: string, message: string, data?: any) {
    if (this.isDevelopment) {
      this.addLog('debug', component, action, message, data);
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new Logger();

// Hook para usar logger em componentes React
export const useLogger = (componentName: string) => {
  return {
    info: (action: string, message: string, data?: any) => 
      logger.info(componentName, action, message, data),
    warn: (action: string, message: string, data?: any) => 
      logger.warn(componentName, action, message, data),
    error: (action: string, message: string, data?: any) => 
      logger.error(componentName, action, message, data),
    debug: (action: string, message: string, data?: any) => 
      logger.debug(componentName, action, message, data),
  };
};

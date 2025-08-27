// Sistema de Logs Centralizado para ControlFlow
// Captura e reporta todos os tipos de erro identificados

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'api' | 'auth' | 'ui' | 'websocket' | 'css' | 'import';
  message: string;
  data?: any;
  url?: string;
  userId?: string;
}

interface ApiLogData {
  url: string;
  method: string;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  body?: any;
  error?: any;
  duration?: number;
}

interface AuthLogData {
  action: 'login' | 'logout' | 'token_check' | 'session_check';
  success: boolean;
  userId?: string;
  tokenPresent?: boolean;
  tokenExpiry?: string;
  error?: any;
}

interface WebSocketLogData {
  action: 'connect' | 'disconnect' | 'message' | 'error' | 'heartbeat';
  readyState?: number;
  url?: string;
  message?: any;
  error?: any;
  reconnectAttempt?: number;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private isEnabled = true;

  // Log de API
  logApi(data: ApiLogData) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: data.status && data.status >= 400 ? 'error' : 'info',
      category: 'api',
      message: `${data.method} ${data.url} - ${data.status || 'ERROR'}`,
      data,
      url: data.url
    };

    this.addLog(entry);

    // Log detalhado para debug
    console.group(`🌐 API ${data.method} ${data.url}`);
    console.log('Status:', data.status, data.statusText);
    console.log('Headers:', data.headers);
    console.log('Duration:', data.duration + 'ms');
    if (data.error) {
      console.error('Error:', data.error);
    }
    console.groupEnd();
  }

  // Log de Autenticação
  logAuth(data: AuthLogData) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: data.success ? 'info' : 'error',
      category: 'auth',
      message: `Auth ${data.action} - ${data.success ? 'SUCCESS' : 'FAILED'}`,
      data,
      userId: data.userId
    };

    this.addLog(entry);

    // Log detalhado para debug
    console.group(`🔐 AUTH ${data.action.toUpperCase()}`);
    console.log('Success:', data.success);
    console.log('User ID:', data.userId);
    console.log('Token Present:', data.tokenPresent);
    console.log('Token Expiry:', data.tokenExpiry);
    if (data.error) {
      console.error('Error:', data.error);
    }
    console.groupEnd();
  }

  // Log de WebSocket
  logWebSocket(data: WebSocketLogData) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: data.error ? 'error' : 'info',
      category: 'websocket',
      message: `WebSocket ${data.action} - ${data.error ? 'ERROR' : 'OK'}`,
      data
    };

    this.addLog(entry);

    // Log detalhado para debug
    console.group(`🔌 WEBSOCKET ${data.action.toUpperCase()}`);
    console.log('Ready State:', data.readyState);
    console.log('URL:', data.url);
    if (data.message) {
      console.log('Message:', data.message);
    }
    if (data.error) {
      console.error('Error:', data.error);
    }
    if (data.reconnectAttempt !== undefined) {
      console.log('Reconnect Attempt:', data.reconnectAttempt);
    }
    console.groupEnd();
  }

  // Log de UI/Componentes
  logUI(message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      category: 'ui',
      message,
      data
    };

    this.addLog(entry);
    console.log(`🎨 UI: ${message}`, data);
  }

  // Log de CSS
  logCSS(message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      category: 'css',
      message,
      data
    };

    this.addLog(entry);
    console.warn(`🎨 CSS: ${message}`, data);
  }

  // Log de Imports
  logImport(message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      category: 'import',
      message,
      data
    };

    this.addLog(entry);
    console.warn(`📦 IMPORT: ${message}`, data);
  }

  // Log de erro geral
  logError(message: string, error?: any, category: LogEntry['category'] = 'ui') {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      category,
      message,
      data: error
    };

    this.addLog(entry);
    // Usar console.warn para evitar loop infinito
    console.warn(`❌ ERROR (${category}): ${message}`, error);
  }

  // Adicionar log à lista
  private addLog(entry: LogEntry) {
    if (!this.isEnabled) return;

    this.logs.push(entry);

    // Manter apenas os últimos logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Enviar para sistema de monitoramento se disponível
    this.sendToMonitoring(entry);
  }

  // Enviar para sistema de monitoramento
  private sendToMonitoring(entry: LogEntry) {
    // Aqui você pode integrar com serviços como Sentry, LogRocket, etc.
    if (entry.level === 'error') {
      // Exemplo: enviar para Sentry
      // Sentry.captureException(entry.data);
    }
  }

  // Obter logs por categoria
  getLogsByCategory(category: LogEntry['category']): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  // Obter logs por nível
  getLogsByLevel(level: LogEntry['level']): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  // Obter todos os logs
  getAllLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Limpar logs
  clearLogs(): void {
    this.logs = [];
  }

  // Exportar logs para JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Habilitar/desabilitar logs
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Relatório de erros
  getErrorReport(): {
    totalErrors: number;
    errorsByCategory: Record<string, number>;
    recentErrors: LogEntry[];
  } {
    const errors = this.getLogsByLevel('error');
    const errorsByCategory: Record<string, number> = {};
    
    errors.forEach(error => {
      errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
    });

    return {
      totalErrors: errors.length,
      errorsByCategory,
      recentErrors: errors.slice(-10) // Últimos 10 erros
    };
  }
}

// Instância global
export const logger = new Logger();

// Helpers para facilitar uso
export const logApi = (data: ApiLogData) => logger.logApi(data);
export const logAuth = (data: AuthLogData) => logger.logAuth(data);
export const logWebSocket = (data: WebSocketLogData) => logger.logWebSocket(data);
export const logUI = (message: string, data?: any) => logger.logUI(message, data);
export const logCSS = (message: string, data?: any) => logger.logCSS(message, data);
export const logImport = (message: string, data?: any) => logger.logImport(message, data);
export const logError = (message: string, error?: any, category?: LogEntry['category']) => 
  logger.logError(message, error, category);

// Interceptar console.error para capturar erros automáticos
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  
  // Evitar loop infinito - não logar se já estamos dentro do logger
  if (message.includes('❌ ERROR') || message.includes('📦 IMPORT') || message.includes('🔐 AUTH') || message.includes('🌐 API')) {
    originalConsoleError.apply(console, args);
    return;
  }
  
  // Detectar tipo de erro baseado na mensagem
  if (message.includes('is not defined')) {
    logger.logImport('Componente não definido', { message, stack: new Error().stack });
  } else if (message.includes('401') || message.includes('Unauthorized')) {
    logger.logAuth({ action: 'token_check', success: false, error: message });
  } else if (message.includes('404') || message.includes('Failed to load resource')) {
    logger.logApi({ url: 'unknown', method: 'GET', error: message });
  } else if (message.includes('WebSocket')) {
    logger.logWebSocket({ action: 'error', error: message });
  } else {
    logger.logError('Console Error', { message, args });
  }
  
  originalConsoleError.apply(console, args);
};

// Interceptar fetch para capturar requisições API
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const startTime = Date.now();
  const url = typeof input === 'string' ? input : input.toString();
  const method = init?.method || 'GET';
  
  try {
    const response = await originalFetch(input, init);
    const duration = Date.now() - startTime;
    
    logApi({
      url,
      method,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      duration
    });
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logApi({
      url,
      method,
      error,
      duration
    });
    
    throw error;
  }
};

// Interceptar WebSocket para capturar eventos
const originalWebSocket = window.WebSocket;
window.WebSocket = function(url: string, protocols?: string | string[]) {
  const ws = new originalWebSocket(url, protocols);
  
  logWebSocket({ action: 'connect', url, readyState: ws.readyState });
  
  ws.addEventListener('open', () => {
    logWebSocket({ action: 'connect', url, readyState: ws.readyState });
  });
  
  ws.addEventListener('message', (event) => {
    logWebSocket({ action: 'message', url, message: event.data });
  });
  
  ws.addEventListener('error', (event) => {
    logWebSocket({ action: 'error', url, error: event });
  });
  
  ws.addEventListener('close', (event) => {
    logWebSocket({ action: 'disconnect', url, readyState: ws.readyState });
  });
  
  return ws;
} as any;

// Expor logger globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).logger = logger;
}
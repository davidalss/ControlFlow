import { Request } from 'express';

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  operation: string;
  module: string;
  userId?: string;
  details: any;
  error?: any;
  requestId?: string;
  ip?: string;
  userAgent?: string;
}

export interface CrudLogData {
  operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LIST' | 'SEARCH';
  entity: string;
  entityId?: string;
  changes?: any;
  filters?: any;
  result?: any;
  success: boolean;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Manter apenas os últimos 1000 logs em memória

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLog(entry: LogEntry): string {
    const color = this.getColorForLevel(entry.level);
    const reset = '\x1b[0m';
    
    let logMessage = `${color}[${entry.timestamp}] [${entry.level}] [${entry.module}] ${entry.operation}${reset}`;
    
    if (entry.userId) {
      logMessage += ` | User: ${entry.userId}`;
    }
    
    if (entry.requestId) {
      logMessage += ` | Request: ${entry.requestId}`;
    }
    
    if (entry.ip) {
      logMessage += ` | IP: ${entry.ip}`;
    }
    
    return logMessage;
  }

  private getColorForLevel(level: string): string {
    switch (level) {
      case 'ERROR': return '\x1b[31m'; // Vermelho
      case 'WARN': return '\x1b[33m';  // Amarelo
      case 'SUCCESS': return '\x1b[32m'; // Verde
      case 'INFO': return '\x1b[36m';   // Ciano
      default: return '\x1b[0m';        // Reset
    }
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    
    // Manter apenas os últimos maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    
    // Log no console
    console.log(this.formatLog(entry));
    
    // Log detalhado se houver erro
    if (entry.error) {
      console.error('Error details:', {
        message: entry.error.message,
        stack: entry.error.stack,
        details: entry.details
      });
    }
  }

  info(module: string, operation: string, details: any, req?: Request) {
    this.addLog({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      operation,
      module,
      userId: req?.user?.id || 'anonymous',
      details,
      requestId: req?.headers['x-request-id'] as string,
      ip: req?.ip,
      userAgent: req?.headers['user-agent']
    });
  }

  success(module: string, operation: string, details: any, req?: Request) {
    this.addLog({
      timestamp: new Date().toISOString(),
      level: 'SUCCESS',
      operation,
      module,
      userId: req?.user?.id || 'anonymous',
      details,
      requestId: req?.headers['x-request-id'] as string,
      ip: req?.ip,
      userAgent: req?.headers['user-agent']
    });
  }

  warn(module: string, operation: string, details: any, req?: Request) {
    this.addLog({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      operation,
      module,
      userId: req?.user?.id || 'anonymous',
      details,
      requestId: req?.headers['x-request-id'] as string,
      ip: req?.ip,
      userAgent: req?.headers['user-agent']
    });
  }

  error(module: string, operation: string, error: any, details?: any, req?: Request) {
    this.addLog({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      operation,
      module,
      userId: req?.user?.id || 'anonymous',
      details: details || {},
      error,
      requestId: req?.headers['x-request-id'] as string,
      ip: req?.ip,
      userAgent: req?.headers['user-agent']
    });
  }

  // Método específico para operações CRUD
  crud(module: string, data: CrudLogData, req?: Request) {
    const operation = `${data.operation}_${data.entity.toUpperCase()}`;
    const details = {
      entity: data.entity,
      entityId: data.entityId,
      changes: data.changes,
      filters: data.filters,
      result: data.result,
      success: data.success
    };

    if (data.success) {
      this.success(module, operation, details, req);
    } else {
      this.error(module, operation, new Error(`CRUD operation failed: ${data.operation} ${data.entity}`), details, req);
    }
  }

  // Método para auditoria de segurança
  security(module: string, operation: string, details: any, req?: Request) {
    this.warn(module, `SECURITY_${operation}`, {
      ...details,
      securityEvent: true,
      timestamp: new Date().toISOString()
    }, req);
  }

  // Método para logs de performance
  performance(module: string, operation: string, duration: number, details?: any, req?: Request) {
    const level = duration > 1000 ? 'WARN' : 'INFO';
    const perfDetails = {
      ...details,
      duration: `${duration}ms`,
      performance: true
    };

    if (level === 'WARN') {
      this.warn(module, `PERF_${operation}`, perfDetails, req);
    } else {
      this.info(module, `PERF_${operation}`, perfDetails, req);
    }
  }

  // Obter logs para análise
  getLogs(limit: number = 100): LogEntry[] {
    return this.logs.slice(-limit);
  }

  // Obter logs por filtro
  getLogsByFilter(filter: Partial<LogEntry>): LogEntry[] {
    return this.logs.filter(log => {
      return Object.keys(filter).every(key => {
        return log[key as keyof LogEntry] === filter[key as keyof LogEntry];
      });
    });
  }

  // Limpar logs antigos
  clearLogs() {
    this.logs = [];
  }
}

export const logger = Logger.getInstance();

// Middleware para adicionar request ID
export function addRequestId(req: Request, res: any, next: any) {
  req.headers['x-request-id'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  next();
}

// Middleware para logging de requests
export function requestLogger(req: Request, res: any, next: any) {
  const startTime = Date.now();
  
  // Log do início da request
  logger.info('HTTP', `${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined,
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type']
    }
  }, req);

  // Interceptar o final da response
  const originalSend = res.send;
  res.send = function(data: any) {
    const duration = Date.now() - startTime;
    
    logger.performance('HTTP', `${req.method} ${req.path}`, duration, {
      statusCode: res.statusCode,
      responseSize: JSON.stringify(data).length,
      method: req.method,
      path: req.path
    }, req);

    return originalSend.call(this, data);
  };

  next();
}

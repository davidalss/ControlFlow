// src/lib/logger.ts
type Level = "info" | "warn" | "error" | "debug";

type LogArgs = {
  feature: string;
  action: string;
  correlationId?: string;
  details?: unknown;
};

type LogEntry = {
  ts: string;
  level: Level;
  feature: string;
  action: string;
  correlationId?: string;
  details?: unknown;
};

const enabled = import.meta.env.VITE_APP_DEBUG_LOGS === "true";

function stamp(level: Level, args: LogArgs): LogEntry {
  return {
    ts: new Date().toISOString(),
    level,
    ...args,
  };
}

function print(level: Level, title: string, payload: LogEntry) {
  if (!enabled) return;
  
  // Use appropriate console method based on level
  const consoleMethod = level === "debug" ? "log" : level;
  
  // eslint-disable-next-line no-console
  (console as any)[consoleMethod](title, payload);
}

function formatGroupTitle(feature: string, action: string, emoji: string = "📋"): string {
  return `${emoji} ${feature}/${action}`;
}

export const log = {
  /**
   * Inicia um grupo de logs colapsado
   */
  group(title: string) {
    if (enabled) {
      console.groupCollapsed(title);
    }
  },

  /**
   * Finaliza o grupo de logs atual
   */
  groupEnd() {
    if (enabled) {
      console.groupEnd();
    }
  },

  /**
   * Log de informação geral
   */
  info(args: LogArgs) {
    print("info", "ℹ️", stamp("info", args));
  },

  /**
   * Log de warning/aviso
   */
  warn(args: LogArgs) {
    print("warn", "⚠️", stamp("warn", args));
  },

  /**
   * Log de erro
   */
  error(args: LogArgs) {
    print("error", "🛑", stamp("error", args));
  },

  /**
   * Log de debug (desenvolvimento)
   */
  debug(args: LogArgs) {
    print("debug", "🐛", stamp("debug", args));
  },

  /**
   * Helper para criar grupos com títulos padronizados
   */
  startGroup(feature: string, action: string, emoji?: string) {
    this.group(formatGroupTitle(feature, action, emoji));
  },

  /**
   * Helper para logs de requisições HTTP
   */
  httpRequest(args: Omit<LogArgs, 'action'> & { method: string; url: string }) {
    this.info({
      ...args,
      action: `${args.action || 'request'}:start`,
      details: {
        ...args.details,
        method: args.method,
        url: args.url,
      }
    });
  },

  /**
   * Helper para logs de respostas HTTP
   */
  httpResponse(args: Omit<LogArgs, 'action'> & { status: number; duration: number }) {
    const level = args.status >= 400 ? 'error' : args.status >= 300 ? 'warn' : 'info';
    this[level]({
      ...args,
      action: `${args.action || 'request'}:response`,
      details: {
        ...args.details,
        status: args.status,
        duration: `${args.duration}ms`,
      }
    });
  },

  /**
   * Helper para logs de CRUD operations
   */
  crud(operation: 'create' | 'read' | 'update' | 'delete' | 'list', args: LogArgs) {
    this.info({
      ...args,
      action: `${operation}:${args.action}`,
    });
  },

  /**
   * Helper para logs de diff/mudanças
   */
  diff(args: LogArgs & { before?: unknown; after?: unknown }) {
    const diffDetails = args.before && args.after 
      ? calculateDiff(args.before, args.after)
      : { before: args.before, after: args.after };
    
    this.info({
      ...args,
      action: `${args.action}:diff`,
      details: {
        ...args.details,
        diff: diffDetails,
      }
    });
  },

  /**
   * Helper para logs de WebSocket
   */
  websocket(event: 'open' | 'close' | 'message' | 'error', args: LogArgs) {
    const level = event === 'error' ? 'error' : event === 'close' ? 'warn' : 'debug';
    this[level]({
      ...args,
      action: `websocket:${event}`,
    });
  },
};

/**
 * Calcula diferenças entre dois objetos
 */
function calculateDiff(before: unknown, after: unknown): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  
  if (typeof before !== 'object' || typeof after !== 'object' || !before || !after) {
    return { root: { from: before, to: after } };
  }

  const beforeObj = before as Record<string, unknown>;
  const afterObj = after as Record<string, unknown>;
  
  // Check all keys from both objects
  const allKeys = new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]);
  
  for (const key of allKeys) {
    const fromValue = beforeObj[key];
    const toValue = afterObj[key];
    
    if (JSON.stringify(fromValue) !== JSON.stringify(toValue)) {
      diff[key] = { from: fromValue, to: toValue };
    }
  }
  
  return diff;
}

/**
 * Gera um novo correlation ID único
 */
export function generateCorrelationId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

/**
 * Hook para usar logging com correlation ID automático
 */
export function useLogging(feature: string) {
  const correlationId = generateCorrelationId();
  
  return {
    correlationId,
    log: {
      info: (action: string, details?: unknown) => 
        log.info({ feature, action, correlationId, details }),
      warn: (action: string, details?: unknown) => 
        log.warn({ feature, action, correlationId, details }),
      error: (action: string, details?: unknown) => 
        log.error({ feature, action, correlationId, details }),
      debug: (action: string, details?: unknown) => 
        log.debug({ feature, action, correlationId, details }),
      group: (action: string, emoji?: string) => 
        log.startGroup(feature, action, emoji),
      groupEnd: () => log.groupEnd(),
    }
  };
}

/**
 * Utilitário para sanitizar dados sensíveis
 */
export function sanitizeData(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = ['password', 'token', 'authorization', 'secret', 'key', 'auth'];
  
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitized = { ...data as Record<string, unknown> };
  
  for (const field of sensitiveFields) {
    for (const key of Object.keys(sanitized)) {
      if (key.toLowerCase().includes(field)) {
        sanitized[key] = '***REDACTED***';
      }
    }
  }
  
  return sanitized;
}

export default log;
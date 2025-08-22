// src/lib/wsLogger.ts
import { logger } from "./logger";

export interface WebSocketLoggerConfig {
  feature: string;
  action: string;
  correlationId?: string;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  enablePingPong?: boolean;
}

export interface WebSocketMetrics {
  connectionCount: number;
  messagesSent: number;
  messagesReceived: number;
  bytesReceived: number;
  bytesSent: number;
  reconnectAttempts: number;
  uptime: number;
  lastConnectedAt?: Date;
  lastDisconnectedAt?: Date;
  averageLatency: number;
  errors: number;
}

export interface WebSocketLoggerOptions {
  logLevel: 'all' | 'errors-only' | 'connections-only';
  maxMessagePreviewLength: number;
  sanitizeMessages: boolean;
  trackMetrics: boolean;
  enableHeartbeat: boolean;
}

/**
 * Logger avançado para WebSocket com métricas e reconnection
 */
export class WebSocketLogger {
  private ws: WebSocket | null = null;
  private config: WebSocketLoggerConfig;
  private options: WebSocketLoggerOptions;
  private metrics: WebSocketMetrics;
  private connectionStartTime: number = 0;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;
  private heartbeatIntervalId: NodeJS.Timeout | null = null;
  private lastPingTime: number = 0;
  private latencySum: number = 0;
  private latencyCount: number = 0;

  constructor(config: WebSocketLoggerConfig, options: Partial<WebSocketLoggerOptions> = {}) {
    this.config = {
      correlationId: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      autoReconnect: true,
      maxReconnectAttempts: 5,
      reconnectDelay: 2000,
      heartbeatInterval: 30000,
      enablePingPong: true,
      ...config
    };

    this.options = {
      logLevel: 'all',
      maxMessagePreviewLength: 200,
      sanitizeMessages: true,
      trackMetrics: true,
      enableHeartbeat: false,
      ...options
    };

    this.metrics = {
      connectionCount: 0,
      messagesSent: 0,
      messagesReceived: 0,
      bytesReceived: 0,
      bytesSent: 0,
      reconnectAttempts: 0,
      uptime: 0,
      averageLatency: 0,
      errors: 0
    };
  }

  /**
   * Conecta e instrumenta um WebSocket existente
   */
  instrumentWebSocket(ws: WebSocket): WebSocket {
    this.ws = ws;
    this.connectionStartTime = Date.now();
    
    this.setupEventListeners();
    this.startHeartbeat();
    this.logConnection('instrument');
    
    return ws;
  }

  /**
   * Cria uma nova conexão WebSocket instrumentada
   */
  createConnection(url: string, protocols?: string | string[]): WebSocket {
    try {
      const ws = new WebSocket(url, protocols);
      return this.instrumentWebSocket(ws);
    } catch (error) {
      this.logError('connection-creation-failed', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    // Connection opened
    this.ws.addEventListener('open', (event) => {
      this.metrics.connectionCount++;
      this.metrics.lastConnectedAt = new Date();
      this.connectionStartTime = Date.now();
      
      if (this.shouldLog('connections-only')) {
        this.logConnection('open', { event });
      }
    });

    // Message received
    this.ws.addEventListener('message', (event) => {
      this.metrics.messagesReceived++;
      this.metrics.bytesReceived += this.calculateMessageSize(event.data);
      
      // Handle pong responses for latency calculation
      if (this.isPongMessage(event.data)) {
        this.calculateLatency();
      }
      
      if (this.shouldLog('all')) {
        this.logMessage('receive', event);
      }
    });

    // Connection closed
    this.ws.addEventListener('close', (event) => {
      this.metrics.lastDisconnectedAt = new Date();
      this.updateUptime();
      this.stopHeartbeat();
      
      if (this.shouldLog('connections-only')) {
        this.logConnection('close', { event });
      }

      // Auto-reconnect if enabled
      if (this.config.autoReconnect && this.shouldAttemptReconnect(event)) {
        this.scheduleReconnect();
      }
    });

    // Connection error
    this.ws.addEventListener('error', (event) => {
      this.metrics.errors++;
      
      if (this.shouldLog('errors-only')) {
        this.logError('websocket-error', event);
      }
    });
  }

  private logConnection(eventType: 'instrument' | 'open' | 'close', data?: any): void {
    const action = `websocket-${eventType}`;
    
    console.group(`🔌 WebSocket ${eventType.toUpperCase()} - ${this.config.feature}`);
    
    if (eventType === 'close' && data?.event) {
      const closeEvent = data.event as CloseEvent;
      console.warn({
        feature: this.config.feature,
        action,
        correlationId: this.config.correlationId,
        details: {
          code: closeEvent.code,
          reason: closeEvent.reason || this.getCloseReasonText(closeEvent.code),
          wasClean: closeEvent.wasClean,
          metrics: this.getMetricsSnapshot(),
          timestamp: new Date().toISOString()
        }
      });
    } else {
      console.log({
        feature: this.config.feature,
        action,
        correlationId: this.config.correlationId,
        details: {
          url: this.ws?.url,
          readyState: this.ws?.readyState,
          readyStateText: this.getReadyStateText(),
          protocols: this.ws?.protocol,
          metrics: this.getMetricsSnapshot(),
          timestamp: new Date().toISOString()
        }
      });
    }
    
    console.groupEnd();
  }

  private logMessage(direction: 'send' | 'receive', data: MessageEvent | any): void {
    const action = `websocket-${direction}`;
    const messageData = direction === 'receive' ? (data as MessageEvent).data : data;
    
    console.debug({
      feature: this.config.feature,
      action,
      correlationId: this.config.correlationId,
      details: {
        direction,
        dataType: typeof messageData,
        messageSize: this.calculateMessageSize(messageData),
        messagePreview: this.createMessagePreview(messageData),
        timestamp: new Date().toISOString(),
        metrics: {
          sent: this.metrics.messagesSent,
          received: this.metrics.messagesReceived,
          avgLatency: this.metrics.averageLatency
        }
      }
    });
  }

  private logError(action: string, error: any): void {
    console.group(`🚨 WebSocket Error - ${this.config.feature}`);
    console.error({
      feature: this.config.feature,
      action,
      correlationId: this.config.correlationId,
      details: {
        message: error?.message || String(error),
        type: error?.type,
        target: error?.target?.readyState,
        readyStateText: this.getReadyStateText(),
        metrics: this.getMetricsSnapshot(),
        timestamp: new Date().toISOString()
      }
    });
    console.groupEnd();
  }

  private shouldLog(level: WebSocketLoggerOptions['logLevel']): boolean {
    return this.options.logLevel === 'all' || this.options.logLevel === level;
  }

  private shouldAttemptReconnect(closeEvent: CloseEvent): boolean {
    // Não reconectar em códigos específicos
    const noReconnectCodes = [1000, 1001, 1005]; // Normal, going away, no status
    return !noReconnectCodes.includes(closeEvent.code) && 
           this.metrics.reconnectAttempts < (this.config.maxReconnectAttempts || 5);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
    }

    this.metrics.reconnectAttempts++;
    const delay = (this.config.reconnectDelay || 2000) * Math.pow(2, this.metrics.reconnectAttempts - 1);
    
    console.info({
      feature: this.config.feature,
      action: 'websocket-reconnect-scheduled',
      correlationId: this.config.correlationId,
      details: {
        attempt: this.metrics.reconnectAttempts,
        maxAttempts: this.config.maxReconnectAttempts,
        delayMs: delay,
        timestamp: new Date().toISOString()
      }
    });

    this.reconnectTimeoutId = setTimeout(() => {
      this.attemptReconnect();
    }, delay);
  }

  private attemptReconnect(): void {
    if (!this.ws) return;

    try {
      const url = this.ws.url;
      const ws = new WebSocket(url);
      this.instrumentWebSocket(ws);
    } catch (error) {
      this.logError('reconnect-failed', error);
      
      if (this.metrics.reconnectAttempts < (this.config.maxReconnectAttempts || 5)) {
        this.scheduleReconnect();
      }
    }
  }

  private startHeartbeat(): void {
    if (!this.options.enableHeartbeat || !this.config.enablePingPong) return;

    this.heartbeatIntervalId = setInterval(() => {
      this.sendPing();
    }, this.config.heartbeatInterval || 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
  }

  private sendPing(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.lastPingTime = Date.now();
      this.send('ping');
    }
  }

  private isPongMessage(data: any): boolean {
    return typeof data === 'string' && data === 'pong';
  }

  private calculateLatency(): void {
    if (this.lastPingTime) {
      const latency = Date.now() - this.lastPingTime;
      this.latencySum += latency;
      this.latencyCount++;
      this.metrics.averageLatency = this.latencySum / this.latencyCount;
      this.lastPingTime = 0;
    }
  }

  private calculateMessageSize(data: any): number {
    if (typeof data === 'string') {
      return new Blob([data]).size;
    }
    if (data instanceof ArrayBuffer) {
      return data.byteLength;
    }
    if (data instanceof Blob) {
      return data.size;
    }
    return 0;
  }

  private createMessagePreview(data: any): any {
    if (this.options.sanitizeMessages) {
      data = this.sanitizeMessage(data);
    }

    if (typeof data === 'string') {
      return data.length > this.options.maxMessagePreviewLength
        ? `${data.slice(0, this.options.maxMessagePreviewLength)}...`
        : data;
    }

    if (data instanceof ArrayBuffer) {
      return `ArrayBuffer(${data.byteLength} bytes)`;
    }

    if (data instanceof Blob) {
      return `Blob(${data.size} bytes, ${data.type})`;
    }

    return String(data).slice(0, this.options.maxMessagePreviewLength);
  }

  private sanitizeMessage(data: any): any {
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return this.sanitizeObject(parsed);
      } catch {
        return data;
      }
    }
    return data;
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || !obj) return obj;

    const sensitiveFields = ['password', 'token', 'authorization', 'secret', 'key', 'auth'];
    const sanitized = { ...obj };

    for (const field of sensitiveFields) {
      for (const key of Object.keys(sanitized)) {
        if (key.toLowerCase().includes(field)) {
          sanitized[key] = '***REDACTED***';
        }
      }
    }

    return sanitized;
  }

  private updateUptime(): void {
    if (this.connectionStartTime) {
      this.metrics.uptime += Date.now() - this.connectionStartTime;
    }
  }

  private getReadyStateText(): string {
    if (!this.ws) return 'NO_WEBSOCKET';
    
    const states = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
    return states[this.ws.readyState] || 'UNKNOWN';
  }

  private getCloseReasonText(code: number): string {
    const reasons: Record<number, string> = {
      1000: 'Normal Closure',
      1001: 'Going Away',
      1002: 'Protocol Error',
      1003: 'Unsupported Data',
      1005: 'No Status Received',
      1006: 'Abnormal Closure',
      1007: 'Invalid frame payload data',
      1008: 'Policy Violation',
      1009: 'Message Too Big',
      1010: 'Mandatory Extension',
      1011: 'Internal Server Error',
      1015: 'TLS Handshake'
    };
    
    return reasons[code] || `Unknown (${code})`;
  }

  private getMetricsSnapshot(): WebSocketMetrics {
    this.updateUptime();
    return { ...this.metrics };
  }

  /**
   * Envia uma mensagem através do WebSocket instrumentado
   */
  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.logError('send-failed-not-open', { readyState: this.ws?.readyState });
      return;
    }

    try {
      this.ws.send(data);
      this.metrics.messagesSent++;
      this.metrics.bytesSent += this.calculateMessageSize(data);
      
      if (this.shouldLog('all')) {
        this.logMessage('send', data);
      }
    } catch (error) {
      this.logError('send-failed', error);
      throw error;
    }
  }

  /**
   * Fecha a conexão WebSocket
   */
  close(code?: number, reason?: string): void {
    if (this.ws) {
      this.ws.close(code, reason);
    }
    this.cleanup();
  }

  /**
   * Obtém métricas atuais da conexão
   */
  getMetrics(): WebSocketMetrics {
    return this.getMetricsSnapshot();
  }

  /**
   * Limpa recursos e timers
   */
  cleanup(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    
    this.stopHeartbeat();
    this.updateUptime();
  }
}

/**
 * Função helper para instrumentar um WebSocket simples
 */
export function logWebSocket(
  ws: WebSocket, 
  config: WebSocketLoggerConfig,
  options?: Partial<WebSocketLoggerOptions>
): WebSocketLogger {
  const logger = new WebSocketLogger(config, options);
  logger.instrumentWebSocket(ws);
  return logger;
}

/**
 * Hook React para WebSocket com logging
 */
export function useWebSocketLogger(
  url: string,
  config: Omit<WebSocketLoggerConfig, 'correlationId'>,
  options?: Partial<WebSocketLoggerOptions>
) {
  const [logger, setLogger] = React.useState<WebSocketLogger | null>(null);
  const [connectionState, setConnectionState] = React.useState<'connecting' | 'open' | 'closing' | 'closed'>('closed');
  const [metrics, setMetrics] = React.useState<WebSocketMetrics | null>(null);

  React.useEffect(() => {
    const wsLogger = new WebSocketLogger({
      ...config,
      correlationId: generateCorrelationId()
    }, options);

    try {
      const ws = wsLogger.createConnection(url);
      
      ws.addEventListener('open', () => setConnectionState('open'));
      ws.addEventListener('close', () => setConnectionState('closed'));
      ws.addEventListener('error', () => setConnectionState('closed'));

      setLogger(wsLogger);
    } catch (error) {
      console.error({
        feature: config.feature,
        action: 'websocket-hook-error',
        correlationId: `ws-hook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        details: { error: String(error) }
      });
    }

    return () => {
      wsLogger.cleanup();
    };
  }, [url]);

  // Atualizar métricas periodicamente
  React.useEffect(() => {
    if (!logger) return;

    const interval = setInterval(() => {
      setMetrics(logger.getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, [logger]);

  return {
    logger,
    connectionState,
    metrics,
    send: (data: any) => logger?.send(data),
    close: (code?: number, reason?: string) => logger?.close(code, reason)
  };
}

export default WebSocketLogger;

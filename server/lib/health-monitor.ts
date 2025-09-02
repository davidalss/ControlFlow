import { logger } from './logger';
import { EventEmitter } from 'events';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    load: number;
  };
  database: {
    status: 'connected' | 'disconnected' | 'error';
    responseTime: number;
    lastCheck: string;
  };
  storage: {
    status: 'available' | 'warning' | 'error';
    freeSpace: number;
    totalSpace: number;
    percentage: number;
  };
  api: {
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
    activeConnections: number;
  };
  websocket: {
    status: 'connected' | 'disconnected' | 'error';
    activeConnections: number;
    lastHeartbeat: string;
  };
}

export interface Alert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  tags: Record<string, string>;
}

class HealthMonitor extends EventEmitter {
  private static instance: HealthMonitor;
  private healthStatus: HealthStatus;
  private alerts: Alert[] = [];
  private metrics: Metric[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private requestCount = 0;
  private responseTimes: number[] = [];
  private errorCount = 0;
  private lastMinute = Date.now();

  private constructor() {
    super();
    this.healthStatus = this.getInitialHealthStatus();
    this.startMonitoring();
  }

  static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
    }
    return HealthMonitor.instance;
  }

  private getInitialHealthStatus(): HealthStatus {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: 0,
        total: 0,
        percentage: 0
      },
      cpu: {
        usage: 0,
        load: 0
      },
      database: {
        status: 'disconnected',
        responseTime: 0,
        lastCheck: new Date().toISOString()
      },
      storage: {
        status: 'available',
        freeSpace: 0,
        totalSpace: 0,
        percentage: 0
      },
      api: {
        requestsPerMinute: 0,
        averageResponseTime: 0,
        errorRate: 0,
        activeConnections: 0
      },
      websocket: {
        status: 'disconnected',
        activeConnections: 0,
        lastHeartbeat: new Date().toISOString()
      }
    };
  }

  private async startMonitoring(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    logger.info('HealthMonitor', 'Iniciando monitoramento de saúde do sistema');
    
    // Health check a cada 30 segundos
    this.checkInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 30000);

    // Limpeza de métricas antigas a cada hora
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 3600000);

    // Log de status a cada 5 minutos
    setInterval(() => {
      this.logStatus();
    }, 300000);
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Verificar memória
      const memUsage = process.memoryUsage();
      const totalMem = require('os').totalmem();
      const freeMem = require('os').freemem();
      
      this.healthStatus.memory = {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(totalMem / 1024 / 1024),
        percentage: Math.round((memUsage.heapUsed / totalMem) * 100)
      };

      // Verificar CPU
      const cpuUsage = process.cpuUsage();
      const loadAvg = require('os').loadavg();
      
      this.healthStatus.cpu = {
        usage: Math.round((cpuUsage.user + cpuUsage.system) / 1000),
        load: Math.round(loadAvg[0] * 100) / 100
      };

      // Verificar uptime
      this.healthStatus.uptime = process.uptime();
      this.healthStatus.timestamp = new Date().toISOString();

      // Verificar storage (simulado para ambiente de produção)
      await this.checkStorage();

      // Verificar database
      await this.checkDatabase();

      // Verificar websocket
      await this.checkWebSocket();

      // Calcular métricas da API
      this.calculateAPIMetrics();

      // Determinar status geral
      this.determineOverallStatus();

      // Emitir evento de mudança de status
      this.emit('healthStatusChanged', this.healthStatus);

      const checkDuration = Date.now() - startTime;
      logger.performance('HealthMonitor', 'HealthCheck', checkDuration, {
        status: this.healthStatus.status,
        memoryUsage: this.healthStatus.memory.percentage + '%',
        cpuUsage: this.healthStatus.cpu.usage + 'ms'
      });

    } catch (error) {
      logger.error('HealthMonitor', 'Erro durante health check', error);
      this.healthStatus.status = 'unhealthy';
      this.createAlert('critical', 'Falha no health check do sistema', { error: error.message });
    }
  }

  private async checkStorage(): Promise<void> {
    try {
      // Em produção, verificar espaço em disco real
      // Por enquanto, simular verificação
      const totalSpace = 100 * 1024 * 1024 * 1024; // 100GB
      const freeSpace = 80 * 1024 * 1024 * 1024;   // 80GB
      const percentage = Math.round((freeSpace / totalSpace) * 100);

      this.healthStatus.storage = {
        status: percentage > 20 ? 'available' : percentage > 10 ? 'warning' : 'error',
        freeSpace: Math.round(freeSpace / 1024 / 1024 / 1024),
        totalSpace: Math.round(totalSpace / 1024 / 1024 / 1024),
        percentage
      };

      if (percentage <= 10) {
        this.createAlert('critical', 'Espaço em disco crítico', { 
          freeSpace: this.healthStatus.storage.freeSpace + 'GB',
          percentage 
        });
      } else if (percentage <= 20) {
        this.createAlert('warning', 'Espaço em disco baixo', { 
          freeSpace: this.healthStatus.storage.freeSpace + 'GB',
          percentage 
        });
      }
    } catch (error) {
      logger.error('HealthMonitor', 'Erro ao verificar storage', error);
      this.healthStatus.storage.status = 'error';
    }
  }

  private async checkDatabase(): Promise<void> {
    try {
      // Verificar conexão com banco (implementar conforme sua configuração)
      const startTime = Date.now();
      
      // Simular verificação de banco
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const responseTime = Date.now() - startTime;
      
      this.healthStatus.database = {
        status: responseTime < 1000 ? 'connected' : 'degraded',
        responseTime,
        lastCheck: new Date().toISOString()
      };

      if (responseTime > 1000) {
        this.createAlert('warning', 'Banco de dados lento', { responseTime });
      }
    } catch (error) {
      logger.error('HealthMonitor', 'Erro ao verificar banco de dados', error);
      this.healthStatus.database.status = 'error';
      this.createAlert('critical', 'Falha na conexão com banco de dados', { error: error.message });
    }
  }

  private async checkWebSocket(): Promise<void> {
    try {
      // Verificar status do WebSocket
      const wsStatus = (global as any).severinoWebSocket?.getStatus?.() || 'disconnected';
      const activeConnections = (global as any).severinoWebSocket?.getActiveConnections?.() || 0;
      
      this.healthStatus.websocket = {
        status: wsStatus,
        activeConnections,
        lastHeartbeat: new Date().toISOString()
      };

      if (wsStatus === 'error') {
        this.createAlert('critical', 'WebSocket com erro', { activeConnections });
      }
    } catch (error) {
      logger.error('HealthMonitor', 'Erro ao verificar WebSocket', error);
      this.healthStatus.websocket.status = 'error';
    }
  }

  private calculateAPIMetrics(): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Filtrar métricas da última hora
    const recentMetrics = this.metrics.filter(m => 
      new Date(m.timestamp).getTime() > oneMinuteAgo
    );

    // Calcular métricas da API
    const apiMetrics = recentMetrics.filter(m => m.tags.type === 'api');
    
    this.healthStatus.api = {
      requestsPerMinute: this.requestCount,
      averageResponseTime: this.responseTimes.length > 0 
        ? Math.round(this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length)
        : 0,
      errorRate: this.requestCount > 0 ? Math.round((this.errorCount / this.requestCount) * 100) : 0,
      activeConnections: this.healthStatus.websocket.activeConnections
    };

    // Reset contadores a cada minuto
    if (now - this.lastMinute > 60000) {
      this.requestCount = 0;
      this.errorCount = 0;
      this.responseTimes = [];
      this.lastMinute = now;
    }
  }

  private determineOverallStatus(): void {
    const { memory, cpu, database, storage, api, websocket } = this.healthStatus;
    
    let criticalIssues = 0;
    let warnings = 0;

    // Verificar problemas críticos
    if (storage.status === 'error') criticalIssues++;
    if (database.status === 'error') criticalIssues++;
    if (websocket.status === 'error') criticalIssues++;
    if (memory.percentage > 90) criticalIssues++;
    if (cpu.load > 5) criticalIssues++;

    // Verificar warnings
    if (storage.status === 'warning') warnings++;
    if (database.status === 'degraded') warnings++;
    if (memory.percentage > 80) warnings++;
    if (cpu.load > 3) warnings++;
    if (api.errorRate > 10) warnings++;

    // Determinar status geral
    if (criticalIssues > 0) {
      this.healthStatus.status = 'unhealthy';
    } else if (warnings > 0 || criticalIssues > 0) {
      this.healthStatus.status = 'degraded';
    } else {
      this.healthStatus.status = 'healthy';
    }
  }

  private createAlert(level: Alert['level'], message: string, details?: any): void {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level,
      message,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };

    this.alerts.push(alert);
    
    // Manter apenas os últimos 100 alertas
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    logger.warn('HealthMonitor', `Alerta criado: ${message}`, details);
    this.emit('alertCreated', alert);

    // Emitir alerta crítico imediatamente
    if (level === 'critical') {
      this.emit('criticalAlert', alert);
    }
  }

  private cleanupOldMetrics(): void {
    const oneHourAgo = Date.now() - 3600000;
    this.metrics = this.metrics.filter(m => 
      new Date(m.timestamp).getTime() > oneHourAgo
    );
  }

  private logStatus(): void {
    logger.info('HealthMonitor', 'Status do sistema', {
      status: this.healthStatus.status,
      uptime: `${Math.round(this.healthStatus.uptime / 3600)}h`,
      memory: `${this.healthStatus.memory.percentage}%`,
      cpu: `${this.healthStatus.cpu.load}`,
      database: this.healthStatus.database.status,
      storage: `${this.healthStatus.storage.percentage}%`,
      api: {
        requestsPerMinute: this.healthStatus.api.requestsPerMinute,
        errorRate: `${this.healthStatus.api.errorRate}%`
      }
    });
  }

  // Métodos públicos para uso externo
  public getHealthStatus(): HealthStatus {
    return { ...this.healthStatus };
  }

  public getAlerts(): Alert[] {
    return [...this.alerts];
  }

  public getMetrics(): Metric[] {
    return [...this.metrics];
  }

  public recordRequest(duration: number, success: boolean): void {
    this.requestCount++;
    this.responseTimes.push(duration);
    
    if (!success) {
      this.errorCount++;
    }

    // Adicionar métrica
    this.metrics.push({
      name: 'api_request',
      value: duration,
      unit: 'ms',
      timestamp: new Date().toISOString(),
      tags: {
        type: 'api',
        success: success.toString(),
        duration: duration < 100 ? 'fast' : duration < 1000 ? 'normal' : 'slow'
      }
    });
  }

  public recordMetric(name: string, value: number, unit: string, tags: Record<string, string>): void {
    this.metrics.push({
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      tags
    });
  }

  public acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date().toISOString();
      this.emit('alertAcknowledged', alert);
      return true;
    }
    return false;
  }

  public stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    logger.info('HealthMonitor', 'Monitoramento parado');
  }

  public async forceHealthCheck(): Promise<HealthStatus> {
    await this.performHealthCheck();
    return this.getHealthStatus();
  }
}

export const healthMonitor = HealthMonitor.getInstance();

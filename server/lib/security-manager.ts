import { logger } from './logger';
import { Request, Response, NextFunction } from 'express';
import { EventEmitter } from 'events';
import crypto from 'crypto';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'AUTH_FAILURE' | 'RATE_LIMIT' | 'SUSPICIOUS_ACTIVITY' | 'SQL_INJECTION' | 'XSS_ATTEMPT' | 'CSRF_ATTEMPT' | 'BRUTE_FORCE' | 'UNAUTHORIZED_ACCESS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ip: string;
  userId?: string;
  userAgent?: string;
  path: string;
  method: string;
  details: any;
  blocked: boolean;
  action: 'BLOCKED' | 'WARNED' | 'LOGGED' | 'CAPTCHA';
}

export interface RateLimitRule {
  windowMs: number;
  maxRequests: number;
  blockDuration: number;
  keyGenerator: (req: Request) => string;
}

export interface SecurityConfig {
  enableRateLimit: boolean;
  enableInputValidation: boolean;
  enableXSSProtection: boolean;
  enableCSRFProtection: boolean;
  enableSQLInjectionProtection: boolean;
  enableBruteForceProtection: boolean;
  maxLoginAttempts: number;
  blockDuration: number;
  suspiciousPatterns: RegExp[];
  allowedOrigins: string[];
  enableAuditLog: boolean;
}

class SecurityManager extends EventEmitter {
  private static instance: SecurityManager;
  private events: SecurityEvent[] = [];
  private blockedIPs: Map<string, { until: number; reason: string }> = new Map();
  private loginAttempts: Map<string, { count: number; lastAttempt: number; blockedUntil: number }> = new Map();
  private rateLimitCounters: Map<string, { count: number; resetTime: number }> = new Map();
  private config: SecurityConfig;
  private suspiciousPatterns: RegExp[];

  private constructor() {
    super();
    this.config = {
      enableRateLimit: true,
      enableInputValidation: true,
      enableXSSProtection: true,
      enableCSRFProtection: true,
      enableSQLInjectionProtection: true,
      enableBruteForceProtection: true,
      maxLoginAttempts: 5,
      blockDuration: 900000, // 15 minutos
      suspiciousPatterns: [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /union\s+select/gi,
        /drop\s+table/gi,
        /insert\s+into/gi,
        /delete\s+from/gi,
        /update\s+set/gi,
        /exec\s*\(/gi,
        /eval\s*\(/gi,
        /document\.cookie/gi,
        /window\.location/gi
      ],
      allowedOrigins: [
        'https://enso-frontend-pp6s.onrender.com',
        'https://controlflow.onrender.com',
        'https://enso-frontend.onrender.com',
        'https://ensoapp.netlify.app',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5000',
        'http://localhost:5002'
      ],
      enableAuditLog: true
    };

    this.suspiciousPatterns = this.config.suspiciousPatterns;
    
    // Limpeza automática de dados antigos
    setInterval(() => this.cleanupOldData(), 3600000); // 1 hora
    
    logger.info('SecurityManager', 'Sistema de segurança inicializado', this.config);
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Middleware principal de segurança
   */
  public securityMiddleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const startTime = Date.now();
        const ip = this.getClientIP(req);
        const userAgent = req.headers['user-agent'] || 'unknown';

        // Verificar se IP está bloqueado
        if (this.isIPBlocked(ip)) {
          const event = this.createSecurityEvent('UNAUTHORIZED_ACCESS', 'HIGH', ip, req, {
            reason: 'IP bloqueado',
            blockedUntil: this.blockedIPs.get(ip)?.until
          }, true, 'BLOCKED');
          
          logger.security('SecurityManager', 'Acesso bloqueado - IP bloqueado', { ip, path: req.path });
          return res.status(403).json({ 
            error: 'Acesso bloqueado', 
            reason: 'IP temporariamente bloqueado por atividades suspeitas' 
          });
        }

        // Validação de entrada
        if (this.config.enableInputValidation) {
          const validationResult = this.validateInput(req);
          if (!validationResult.valid) {
            const event = this.createSecurityEvent('SUSPICIOUS_ACTIVITY', 'MEDIUM', ip, req, {
              reason: 'Entrada suspeita detectada',
              patterns: validationResult.patterns,
              field: validationResult.field
            }, false, 'WARNED');
            
            logger.security('SecurityManager', 'Entrada suspeita detectada', { 
              ip, 
              path: req.path, 
              patterns: validationResult.patterns 
            });
          }
        }

        // Rate limiting
        if (this.config.enableRateLimit) {
          const rateLimitResult = this.checkRateLimit(ip, req.path);
          if (!rateLimitResult.allowed) {
            const event = this.createSecurityEvent('RATE_LIMIT', 'MEDIUM', ip, req, {
              reason: 'Rate limit excedido',
              limit: rateLimitResult.limit,
              window: rateLimitResult.window
            }, true, 'BLOCKED');
            
            logger.security('SecurityManager', 'Rate limit excedido', { ip, path: req.path });
            return res.status(429).json({ 
              error: 'Muitas requisições', 
              retryAfter: rateLimitResult.retryAfter 
            });
          }
        }

        // Proteção XSS
        if (this.config.enableXSSProtection) {
          const xssResult = this.checkXSS(req);
          if (xssResult.detected) {
            const event = this.createSecurityEvent('XSS_ATTEMPT', 'HIGH', ip, req, {
              reason: 'Tentativa de XSS detectada',
              payload: xssResult.payload,
              field: xssResult.field
            }, true, 'BLOCKED');
            
            logger.security('SecurityManager', 'Tentativa de XSS bloqueada', { 
              ip, 
              path: req.path, 
              payload: xssResult.payload 
            });
            return res.status(400).json({ error: 'Entrada inválida detectada' });
          }
        }

        // Proteção CSRF
        if (this.config.enableCSRFProtection) {
          const csrfResult = this.checkCSRF(req);
          if (!csrfResult.valid) {
            const event = this.createSecurityEvent('CSRF_ATTEMPT', 'HIGH', ip, req, {
              reason: 'Tentativa de CSRF detectada',
              origin: req.headers.origin,
              referer: req.headers.referer
            }, true, 'BLOCKED');
            
            logger.security('SecurityManager', 'Tentativa de CSRF bloqueada', { 
              ip, 
              path: req.path, 
              origin: req.headers.origin 
            });
            return res.status(403).json({ error: 'Token CSRF inválido' });
          }
        }

        // Proteção SQL Injection
        if (this.config.enableSQLInjectionProtection) {
          const sqlResult = this.checkSQLInjection(req);
          if (sqlResult.detected) {
            const event = this.createSecurityEvent('SQL_INJECTION', 'CRITICAL', ip, req, {
              reason: 'Tentativa de SQL Injection detectada',
              payload: sqlResult.payload,
              field: sqlResult.field
            }, true, 'BLOCKED');
            
            logger.security('SecurityManager', 'Tentativa de SQL Injection bloqueada', { 
              ip, 
              path: req.path, 
              payload: sqlResult.payload 
            });
            return res.status(400).json({ error: 'Entrada inválida detectada' });
          }
        }

        // Log de auditoria
        if (this.config.enableAuditLog) {
          this.auditRequest(req, res, startTime);
        }

        next();

      } catch (error) {
        logger.error('SecurityManager', 'Erro no middleware de segurança', error);
        next(error);
      }
    };
  }

  /**
   * Middleware de autenticação com proteção contra brute force
   */
  public authProtectionMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const ip = this.getClientIP(req);
      
      if (this.isLoginAttempt(req.path)) {
        const attemptResult = this.checkLoginAttempt(ip);
        
        if (!attemptResult.allowed) {
          const event = this.createSecurityEvent('BRUTE_FORCE', 'HIGH', ip, req, {
            reason: 'Muitas tentativas de login',
            attempts: attemptResult.attempts,
            blockedUntil: attemptResult.blockedUntil
          }, true, 'BLOCKED');
          
          logger.security('SecurityManager', 'Tentativa de brute force bloqueada', { 
            ip, 
            attempts: attemptResult.attempts 
          });
          
          return res.status(429).json({ 
            error: 'Muitas tentativas de login', 
            retryAfter: attemptResult.retryAfter 
          });
        }
      }
      
      next();
    };
  }

  /**
   * Registrar tentativa de login
   */
  public recordLoginAttempt(ip: string, success: boolean, userId?: string): void {
    if (!this.config.enableBruteForceProtection) return;

    const now = Date.now();
    const current = this.loginAttempts.get(ip) || { count: 0, lastAttempt: 0, blockedUntil: 0 };

    if (success) {
      // Reset contadores em caso de sucesso
      this.loginAttempts.delete(ip);
      logger.info('SecurityManager', 'Login bem-sucedido, contadores resetados', { ip, userId });
    } else {
      // Incrementar contador de falhas
      current.count++;
      current.lastAttempt = now;
      
      if (current.count >= this.config.maxLoginAttempts) {
        current.blockedUntil = now + this.config.blockDuration;
        this.blockedIPs.set(ip, { 
          until: current.blockedUntil, 
          reason: 'Brute force detectado' 
        });
        
        logger.warn('SecurityManager', 'IP bloqueado por brute force', { 
          ip, 
          attempts: current.count,
          blockedUntil: new Date(current.blockedUntil)
        });
      }
      
      this.loginAttempts.set(ip, current);
    }
  }

  /**
   * Verificar se IP está bloqueado
   */
  private isIPBlocked(ip: string): boolean {
    const blocked = this.blockedIPs.get(ip);
    if (!blocked) return false;
    
    if (Date.now() > blocked.until) {
      this.blockedIPs.delete(ip);
      return false;
    }
    
    return true;
  }

  /**
   * Verificar rate limit
   */
  private checkRateLimit(ip: string, path: string): { allowed: boolean; limit: number; window: number; retryAfter: number } {
    const key = `${ip}:${path}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minuto
    const maxRequests = 100; // 100 requests por minuto
    
    const current = this.rateLimitCounters.get(key) || { count: 0, resetTime: now + windowMs };
    
    if (now > current.resetTime) {
      current.count = 1;
      current.resetTime = now + windowMs;
    } else {
      current.count++;
    }
    
    this.rateLimitCounters.set(key, current);
    
    if (current.count > maxRequests) {
      return {
        allowed: false,
        limit: maxRequests,
        window: windowMs,
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      };
    }
    
    return { allowed: true, limit: maxRequests, window: windowMs, retryAfter: 0 };
  }

  /**
   * Verificar tentativas de login
   */
  private checkLoginAttempt(ip: string): { allowed: boolean; attempts: number; blockedUntil: number; retryAfter: number } {
    const current = this.loginAttempts.get(ip);
    if (!current) return { allowed: true, attempts: 0, blockedUntil: 0, retryAfter: 0 };
    
    const now = Date.now();
    
    if (current.blockedUntil > now) {
      return {
        allowed: false,
        attempts: current.count,
        blockedUntil: current.blockedUntil,
        retryAfter: Math.ceil((current.blockedUntil - now) / 1000)
      };
    }
    
    return { allowed: true, attempts: current.count, blockedUntil: 0, retryAfter: 0 };
  }

  /**
   * Verificar se é tentativa de login
   */
  private isLoginAttempt(path: string): boolean {
    return path.includes('/login') || path.includes('/auth') || path.includes('/signin');
  }

  /**
   * Validar entrada do usuário
   */
  private validateInput(req: Request): { valid: boolean; patterns: string[]; field?: string } {
    const patterns: string[] = [];
    let field: string | undefined;
    
    // Verificar body
    if (req.body) {
      for (const [key, value] of Object.entries(req.body)) {
        if (typeof value === 'string') {
          for (const pattern of this.suspiciousPatterns) {
            if (pattern.test(value)) {
              patterns.push(pattern.source);
              field = key;
              break;
            }
          }
        }
      }
    }
    
    // Verificar query params
    if (req.query) {
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string') {
          for (const pattern of this.suspiciousPatterns) {
            if (pattern.test(value)) {
              patterns.push(pattern.source);
              field = key;
              break;
            }
          }
        }
      }
    }
    
    return { valid: patterns.length === 0, patterns, field };
  }

  /**
   * Verificar XSS
   */
  private checkXSS(req: Request): { detected: boolean; payload?: string; field?: string } {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /document\.cookie/gi,
      /window\.location/gi
    ];
    
    if (req.body) {
      for (const [key, value] of Object.entries(req.body)) {
        if (typeof value === 'string') {
          for (const pattern of xssPatterns) {
            if (pattern.test(value)) {
              return { detected: true, payload: value, field: key };
            }
          }
        }
      }
    }
    
    return { detected: false };
  }

  /**
   * Verificar CSRF
   */
  private checkCSRF(req: Request): { valid: boolean } {
    // Implementar verificação de token CSRF
    // Por enquanto, retornar true para não bloquear
    return { valid: true };
  }

  /**
   * Verificar SQL Injection
   */
  private checkSQLInjection(req: Request): { detected: boolean; payload?: string; field?: string } {
    const sqlPatterns = [
      /union\s+select/gi,
      /drop\s+table/gi,
      /insert\s+into/gi,
      /delete\s+from/gi,
      /update\s+set/gi,
      /exec\s*\(/gi,
      /eval\s*\(/gi
    ];
    
    if (req.body) {
      for (const [key, value] of Object.entries(req.body)) {
        if (typeof value === 'string') {
          for (const pattern of sqlPatterns) {
            if (pattern.test(value)) {
              return { detected: true, payload: value, field: key };
            }
          }
        }
      }
    }
    
    return { detected: false };
  }

  /**
   * Obter IP do cliente
   */
  private getClientIP(req: Request): string {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           (req as any).connection.socket?.remoteAddress || 
           'unknown';
  }

  /**
   * Criar evento de segurança
   */
  private createSecurityEvent(
    type: SecurityEvent['type'],
    severity: SecurityEvent['severity'],
    ip: string,
    req: Request,
    details: any,
    blocked: boolean,
    action: SecurityEvent['action']
  ): SecurityEvent {
    const event: SecurityEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type,
      severity,
      ip,
      userId: (req as any).user?.id,
      userAgent: req.headers['user-agent'],
      path: req.path,
      method: req.method,
      details,
      blocked,
      action
    };
    
    this.events.push(event);
    
    // Manter apenas os últimos 1000 eventos
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
    
    this.emit('securityEvent', event);
    
    if (severity === 'CRITICAL') {
      this.emit('criticalSecurityEvent', event);
    }
    
    return event;
  }

  /**
   * Log de auditoria
   */
  private auditRequest(req: Request, res: Response, startTime: number): void {
    const duration = Date.now() - startTime;
    const ip = this.getClientIP(req);
    
    logger.info('SecurityManager', 'Request auditada', {
      ip,
      method: req.method,
      path: req.path,
      userAgent: req.headers['user-agent'],
      duration: `${duration}ms`,
      statusCode: res.statusCode,
      userId: (req as any).user?.id
    });
  }

  /**
   * Limpeza de dados antigos
   */
  private cleanupOldData(): void {
    const now = Date.now();
    const oneDayAgo = now - 86400000; // 24 horas
    
    // Limpar eventos antigos
    this.events = this.events.filter(event => 
      new Date(event.timestamp).getTime() > oneDayAgo
    );
    
    // Limpar IPs bloqueados expirados
    for (const [ip, data] of this.blockedIPs.entries()) {
      if (data.until < now) {
        this.blockedIPs.delete(ip);
      }
    }
    
    // Limpar tentativas de login antigas
    for (const [ip, data] of this.loginAttempts.entries()) {
      if (data.lastAttempt < oneDayAgo && data.blockedUntil < now) {
        this.loginAttempts.delete(ip);
      }
    }
    
    // Limpar contadores de rate limit antigos
    for (const [key, data] of this.rateLimitCounters.entries()) {
      if (data.resetTime < now) {
        this.rateLimitCounters.delete(key);
      }
    }
  }

  /**
   * Obter eventos de segurança
   */
  public getSecurityEvents(limit: number = 100): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Obter estatísticas de segurança
   */
  public getSecurityStats(): any {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;
    
    const recentEvents = this.events.filter(event => 
      new Date(event.timestamp).getTime() > oneHourAgo
    );
    
    const dailyEvents = this.events.filter(event => 
      new Date(event.timestamp).getTime() > oneDayAgo
    );
    
    return {
      totalEvents: this.events.length,
      recentEvents: recentEvents.length,
      dailyEvents: dailyEvents.length,
      blockedIPs: this.blockedIPs.size,
      loginAttempts: this.loginAttempts.size,
      rateLimitCounters: this.rateLimitCounters.size,
      eventsByType: this.countEventsByType(this.events),
      eventsBySeverity: this.countEventsBySeverity(this.events)
    };
  }

  /**
   * Contar eventos por tipo
   */
  private countEventsByType(events: SecurityEvent[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Contar eventos por severidade
   */
  private countEventsBySeverity(events: SecurityEvent[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Desbloquear IP
   */
  public unblockIP(ip: string): boolean {
    const wasBlocked = this.blockedIPs.has(ip);
    this.blockedIPs.delete(ip);
    
    if (wasBlocked) {
      logger.info('SecurityManager', 'IP desbloqueado manualmente', { ip });
    }
    
    return wasBlocked;
  }

  /**
   * Atualizar configuração
   */
  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('SecurityManager', 'Configuração de segurança atualizada', newConfig);
  }
}

export const securityManager = SecurityManager.getInstance();

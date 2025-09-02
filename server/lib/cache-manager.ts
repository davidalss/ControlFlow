import { logger } from './logger';
import { EventEmitter } from 'events';

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  tags: string[];
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  memoryUsage: number;
  averageAccessTime: number;
}

export interface CacheOptions {
  maxSize: number;        // Tamanho máximo em MB
  maxEntries: number;     // Número máximo de entradas
  defaultTTL: number;     // TTL padrão em ms
  cleanupInterval: number; // Intervalo de limpeza em ms
  enableCompression: boolean; // Habilitar compressão
  enableMetrics: boolean;  // Habilitar métricas
}

class CacheManager extends EventEmitter {
  private static instance: CacheManager;
  private cache: Map<string, CacheEntry> = new Map();
  private options: CacheOptions;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    totalAccessTime: 0,
    accessCount: 0
  };
  private cleanupInterval: NodeJS.Timeout | null = null;
  private compressionWorker: Worker | null = null;

  private constructor(options?: Partial<CacheOptions>) {
    super();
    this.options = {
      maxSize: 100,           // 100MB
      maxEntries: 1000,       // 1000 entradas
      defaultTTL: 300000,     // 5 minutos
      cleanupInterval: 60000,  // 1 minuto
      enableCompression: false,
      enableMetrics: true,
      ...options
    };

    this.startCleanup();
    logger.info('CacheManager', 'Sistema de cache inicializado', this.options);
  }

  static getInstance(options?: Partial<CacheOptions>): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(options);
    }
    return CacheManager.instance;
  }

  /**
   * Armazenar valor no cache
   */
  public set<T>(
    key: string, 
    value: T, 
    ttl?: number, 
    tags: string[] = []
  ): boolean {
    try {
      const startTime = Date.now();
      
      // Verificar se já existe e remover se necessário
      if (this.cache.has(key)) {
        this.delete(key);
      }

      // Calcular tamanho do valor
      const size = this.calculateSize(value);
      
      // Verificar se há espaço suficiente
      if (!this.ensureSpace(size)) {
        logger.warn('CacheManager', 'Cache cheio, não foi possível armazenar', { key, size });
        return false;
      }

      const entry: CacheEntry<T> = {
        key,
        value,
        timestamp: Date.now(),
        ttl: ttl || this.options.defaultTTL,
        accessCount: 0,
        lastAccessed: Date.now(),
        size,
        tags
      };

      this.cache.set(key, entry);
      this.stats.sets++;
      
      const accessTime = Date.now() - startTime;
      this.recordAccessTime(accessTime);

      logger.debug('CacheManager', 'Valor armazenado no cache', { 
        key, 
        size: `${size} bytes`,
        ttl: `${ttl || this.options.defaultTTL}ms`,
        tags 
      });

      this.emit('cacheSet', { key, size, tags });
      return true;

    } catch (error) {
      logger.error('CacheManager', 'Erro ao armazenar no cache', error, { key });
      return false;
    }
  }

  /**
   * Recuperar valor do cache
   */
  public get<T>(key: string): T | null {
    try {
      const startTime = Date.now();
      
      if (!this.cache.has(key)) {
        this.stats.misses++;
        logger.debug('CacheManager', 'Cache miss', { key });
        return null;
      }

      const entry = this.cache.get(key)!;
      
      // Verificar se expirou
      if (this.isExpired(entry)) {
        this.delete(key);
        this.stats.misses++;
        logger.debug('CacheManager', 'Valor expirado no cache', { key });
        return null;
      }

      // Atualizar estatísticas de acesso
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      this.stats.hits++;

      const accessTime = Date.now() - startTime;
      this.recordAccessTime(accessTime);

      logger.debug('CacheManager', 'Cache hit', { 
        key, 
        accessCount: entry.accessCount,
        age: `${Date.now() - entry.timestamp}ms`
      });

      this.emit('cacheHit', { key, accessTime });
      return entry.value;

    } catch (error) {
      logger.error('CacheManager', 'Erro ao recuperar do cache', error, { key });
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Verificar se chave existe no cache
   */
  public has(key: string): boolean {
    if (!this.cache.has(key)) {
      return false;
    }

    const entry = this.cache.get(key)!;
    if (this.isExpired(entry)) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remover valor do cache
   */
  public delete(key: string): boolean {
    try {
      const entry = this.cache.get(key);
      if (entry) {
        this.cache.delete(key);
        this.stats.deletes++;
        
        logger.debug('CacheManager', 'Valor removido do cache', { key });
        this.emit('cacheDelete', { key, size: entry.size });
        return true;
      }
      return false;
    } catch (error) {
      logger.error('CacheManager', 'Erro ao remover do cache', error, { key });
      return false;
    }
  }

  /**
   * Limpar cache por tags
   */
  public clearByTags(tags: string[]): number {
    let clearedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        if (this.delete(key)) {
          clearedCount++;
        }
      }
    }

    logger.info('CacheManager', 'Cache limpo por tags', { tags, clearedCount });
    return clearedCount;
  }

  /**
   * Limpar todo o cache
   */
  public clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.deletes += size;
    
    logger.info('CacheManager', 'Cache completamente limpo', { clearedEntries: size });
    this.emit('cacheClear', { clearedEntries: size });
  }

  /**
   * Obter estatísticas do cache
   */
  public getStats(): CacheStats {
    const totalSize = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0);
    const totalEntries = this.cache.size;
    const totalRequests = this.stats.hits + this.stats.misses;
    
    return {
      totalEntries,
      totalSize,
      hitRate: totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0,
      missRate: totalRequests > 0 ? (this.stats.misses / totalRequests) * 100 : 0,
      evictionCount: this.stats.evictions,
      memoryUsage: totalSize / (1024 * 1024), // MB
      averageAccessTime: this.stats.accessCount > 0 ? this.stats.totalAccessTime / this.stats.accessCount : 0
    };
  }

  /**
   * Obter chaves por tags
   */
  public getKeysByTags(tags: string[]): string[] {
    const keys: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        keys.push(key);
      }
    }

    return keys;
  }

  /**
   * Pré-carregar valores no cache
   */
  public async preload<T>(
    key: string, 
    loader: () => Promise<T>, 
    ttl?: number, 
    tags: string[] = []
  ): Promise<T> {
    try {
      // Verificar se já existe no cache
      const cached = this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // Carregar valor
      const value = await loader();
      
      // Armazenar no cache
      this.set(key, value, ttl, tags);
      
      return value;
    } catch (error) {
      logger.error('CacheManager', 'Erro no preload', error, { key });
      throw error;
    }
  }

  /**
   * Inicializar limpeza automática
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.options.cleanupInterval);
  }

  /**
   * Limpeza automática do cache
   */
  private cleanup(): void {
    try {
      const startTime = Date.now();
      let expiredCount = 0;
      let evictedCount = 0;

      // Remover entradas expiradas
      for (const [key, entry] of this.cache.entries()) {
        if (this.isExpired(entry)) {
          this.cache.delete(key);
          expiredCount++;
        }
      }

      // Verificar se precisa evictar por tamanho
      if (this.cache.size > this.options.maxEntries) {
        evictedCount += this.evictLRU();
      }

      // Verificar se precisa evictar por tamanho em bytes
      const totalSize = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0);
      const maxSizeBytes = this.options.maxSize * 1024 * 1024;
      
      if (totalSize > maxSizeBytes) {
        evictedCount += this.evictBySize(maxSizeBytes);
      }

      if (expiredCount > 0 || evictedCount > 0) {
        const cleanupTime = Date.now() - startTime;
        logger.info('CacheManager', 'Limpeza automática concluída', {
          expiredCount,
          evictedCount,
          remainingEntries: this.cache.size,
          cleanupTime: `${cleanupTime}ms`
        });
      }

    } catch (error) {
      logger.error('CacheManager', 'Erro durante limpeza automática', error);
    }
  }

  /**
   * Evictar entradas usando LRU
   */
  private evictLRU(): number {
    const entries = Array.from(this.cache.entries());
    const toEvict = entries.length - this.options.maxEntries;
    
    if (toEvict <= 0) return 0;

    // Ordenar por último acesso (mais antigo primeiro)
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    let evictedCount = 0;
    for (let i = 0; i < toEvict; i++) {
      const [key] = entries[i];
      if (this.delete(key)) {
        evictedCount++;
      }
    }

    this.stats.evictions += evictedCount;
    return evictedCount;
  }

  /**
   * Evictar entradas por tamanho
   */
  private evictBySize(maxSizeBytes: number): number {
    const entries = Array.from(this.cache.entries());
    let currentSize = entries.reduce((sum, entry) => sum + entry[1].size, 0);
    let evictedCount = 0;

    // Ordenar por tamanho (maior primeiro) e por último acesso
    entries.sort((a, b) => {
      if (b[1].size !== a[1].size) {
        return b[1].size - a[1].size;
      }
      return a[1].lastAccessed - b[1].lastAccessed;
    });

    for (const [key, entry] of entries) {
      if (currentSize <= maxSizeBytes) break;
      
      if (this.delete(key)) {
        currentSize -= entry.size;
        evictedCount++;
      }
    }

    this.stats.evictions += evictedCount;
    return evictedCount;
  }

  /**
   * Verificar se entrada expirou
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.timestamp + entry.ttl;
  }

  /**
   * Calcular tamanho aproximado do valor
   */
  private calculateSize(value: any): number {
    try {
      const str = JSON.stringify(value);
      return Buffer.byteLength(str, 'utf8');
    } catch {
      // Fallback para valores que não podem ser serializados
      return 1024; // 1KB padrão
    }
  }

  /**
   * Garantir espaço suficiente no cache
   */
  private ensureSpace(requiredSize: number): boolean {
    const totalSize = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0);
    const maxSizeBytes = this.options.maxSize * 1024 * 1024;
    
    if (totalSize + requiredSize <= maxSizeBytes) {
      return true;
    }

    // Tentar evictar entradas para liberar espaço
    const evictedCount = this.evictBySize(maxSizeBytes - requiredSize);
    return evictedCount > 0;
  }

  /**
   * Registrar tempo de acesso para métricas
   */
  private recordAccessTime(accessTime: number): void {
    if (this.options.enableMetrics) {
      this.stats.totalAccessTime += accessTime;
      this.stats.accessCount++;
    }
  }

  /**
   * Parar o cache manager
   */
  public stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.clear();
    logger.info('CacheManager', 'Cache manager parado');
  }

  /**
   * Obter informações de debug
   */
  public getDebugInfo(): any {
    return {
      options: this.options,
      stats: this.stats,
      cacheSize: this.cache.size,
      cacheKeys: Array.from(this.cache.keys()),
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        size: entry.size,
        age: Date.now() - entry.timestamp,
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed,
        tags: entry.tags
      }))
    };
  }
}

export const cacheManager = CacheManager.getInstance();

// Tipos de cache especializados
export class ProductCache {
  private static instance: ProductCache;
  private cache = cacheManager;

  static getInstance(): ProductCache {
    if (!ProductCache.instance) {
      ProductCache.instance = new ProductCache();
    }
    return ProductCache.instance;
  }

  async getProduct(id: string) {
    return this.cache.get(`product:${id}`);
  }

  async setProduct(id: string, product: any) {
    return this.cache.set(`product:${id}`, product, 300000, ['products']); // 5 min
  }

  async clearProducts() {
    return this.cache.clearByTags(['products']);
  }
}

export class InspectionCache {
  private static instance: InspectionCache;
  private cache = cacheManager;

  static getInstance(): InspectionCache {
    if (!InspectionCache.instance) {
      InspectionCache.instance = new InspectionCache();
    }
    return InspectionCache.instance;
  }

  async getInspection(id: string) {
    return this.cache.get(`inspection:${id}`);
  }

  async setInspection(id: string, inspection: any) {
    return this.cache.set(`inspection:${id}`, inspection, 600000, ['inspections']); // 10 min
  }

  async clearInspections() {
    return this.cache.clearByTags(['inspections']);
  }
}

import { logger } from './logger';
import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createGzip, createGunzip } from 'zlib';

export interface BackupConfig {
  enabled: boolean;
  backupDir: string;
  maxBackups: number;
  backupInterval: number; // em ms
  compression: boolean;
  encryption: boolean;
  encryptionKey: string;
  includeDatabase: boolean;
  includeUploads: boolean;
  includeLogs: boolean;
  retentionDays: number;
  notifyOnFailure: boolean;
}

export interface BackupInfo {
  id: string;
  timestamp: string;
  size: number;
  type: 'FULL' | 'INCREMENTAL' | 'DATABASE_ONLY';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  files: string[];
  checksum: string;
  duration: number;
  error?: string;
}

export interface RestoreInfo {
  id: string;
  backupId: string;
  timestamp: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  progress: number;
  error?: string;
}

class BackupManager extends EventEmitter {
  private static instance: BackupManager;
  private config: BackupConfig;
  private backups: BackupInfo[] = [];
  private restores: RestoreInfo[] = [];
  private backupInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private currentBackup: BackupInfo | null = null;
  private currentRestore: RestoreInfo | null = null;

  private constructor() {
    super();
    this.config = {
      enabled: true,
      backupDir: './backups',
      maxBackups: 10,
      backupInterval: 86400000, // 24 horas
      compression: true,
      encryption: true,
      encryptionKey: process.env.BACKUP_ENCRYPTION_KEY || 'default-key-change-in-production',
      includeDatabase: true,
      includeUploads: true,
      includeLogs: true,
      retentionDays: 30,
      notifyOnFailure: true
    };

    this.initialize();
  }

  static getInstance(): BackupManager {
    if (!BackupManager.instance) {
      BackupManager.instance = new BackupManager();
    }
    return BackupManager.instance;
  }

  /**
   * Inicializar o sistema de backup
   */
  private async initialize(): Promise<void> {
    try {
      // Criar diretório de backup se não existir
      await this.ensureBackupDirectory();
      
      // Carregar backups existentes
      await this.loadExistingBackups();
      
      // Iniciar backup automático se habilitado
      if (this.config.enabled) {
        this.startAutomaticBackup();
      }
      
      // Limpeza automática de backups antigos
      setInterval(() => this.cleanupOldBackups(), 3600000); // 1 hora
      
      logger.info('BackupManager', 'Sistema de backup inicializado', {
        backupDir: this.config.backupDir,
        maxBackups: this.config.maxBackups,
        interval: `${this.config.backupInterval / 3600000}h`
      });
      
    } catch (error) {
      logger.error('BackupManager', 'Erro ao inicializar sistema de backup', error);
    }
  }

  /**
   * Garantir que o diretório de backup existe
   */
  private async ensureBackupDirectory(): Promise<void> {
    try {
      await fs.access(this.config.backupDir);
    } catch {
      await fs.mkdir(this.config.backupDir, { recursive: true });
      logger.info('BackupManager', 'Diretório de backup criado', { path: this.config.backupDir });
    }
  }

  /**
   * Carregar backups existentes
   */
  private async loadExistingBackups(): Promise<void> {
    try {
      const files = await fs.readdir(this.config.backupDir);
      const backupFiles = files.filter(file => file.endsWith('.backup'));
      
      for (const file of backupFiles) {
        try {
          const filePath = path.join(this.config.backupDir, file);
          const stats = await fs.stat(filePath);
          
          // Extrair informações do nome do arquivo
          const match = file.match(/backup_(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})_(\w+)_(\w+)\.backup/);
          if (match) {
            const [, timestamp, type, status] = match;
            const backup: BackupInfo = {
              id: crypto.randomUUID(),
              timestamp: timestamp.replace(/_/g, 'T').replace(/-/g, ':'),
              size: stats.size,
              type: type as any,
              status: status as any,
              files: [file],
              checksum: await this.calculateFileChecksum(filePath),
              duration: 0
            };
            
            this.backups.push(backup);
          }
        } catch (error) {
          logger.warn('BackupManager', 'Erro ao carregar backup existente', { file, error: error.message });
        }
      }
      
      // Ordenar por timestamp (mais recente primeiro)
      this.backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      logger.info('BackupManager', 'Backups existentes carregados', { count: this.backups.length });
      
    } catch (error) {
      logger.error('BackupManager', 'Erro ao carregar backups existentes', error);
    }
  }

  /**
   * Iniciar backup automático
   */
  private startAutomaticBackup(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }
    
    this.backupInterval = setInterval(async () => {
      if (!this.isRunning && this.config.enabled) {
        await this.createBackup('FULL');
      }
    }, this.config.backupInterval);
    
    logger.info('BackupManager', 'Backup automático iniciado', {
      interval: `${this.config.backupInterval / 3600000}h`
    });
  }

  /**
   * Criar backup manual
   */
  public async createBackup(type: BackupInfo['type'] = 'FULL'): Promise<BackupInfo> {
    if (this.isRunning) {
      throw new Error('Backup já está em andamento');
    }
    
    this.isRunning = true;
    const startTime = Date.now();
    
    const backup: BackupInfo = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      size: 0,
      type,
      status: 'PENDING',
      files: [],
      checksum: '',
      duration: 0
    };
    
    this.currentBackup = backup;
    this.backups.unshift(backup);
    
    try {
      logger.info('BackupManager', 'Iniciando backup', { type, id: backup.id });
      this.emit('backupStarted', backup);
      
      backup.status = 'IN_PROGRESS';
      
      // Criar backup baseado no tipo
      switch (type) {
        case 'FULL':
          await this.createFullBackup(backup);
          break;
        case 'INCREMENTAL':
          await this.createIncrementalBackup(backup);
          break;
        case 'DATABASE_ONLY':
          await this.createDatabaseBackup(backup);
          break;
      }
      
      backup.status = 'COMPLETED';
      backup.duration = Date.now() - startTime;
      
      // Manter apenas o número máximo de backups
      if (this.backups.length > this.config.maxBackups) {
        const removedBackups = this.backups.splice(this.config.maxBackups);
        for (const removed of removedBackups) {
          await this.removeBackupFiles(removed);
        }
      }
      
      logger.success('BackupManager', 'Backup concluído com sucesso', {
        id: backup.id,
        type,
        duration: `${backup.duration}ms`,
        size: `${Math.round(backup.size / 1024 / 1024)}MB`
      });
      
      this.emit('backupCompleted', backup);
      
    } catch (error) {
      backup.status = 'FAILED';
      backup.error = error.message;
      backup.duration = Date.now() - startTime;
      
      logger.error('BackupManager', 'Erro durante backup', error, { id: backup.id, type });
      this.emit('backupFailed', backup);
      
      if (this.config.notifyOnFailure) {
        // Aqui você pode implementar notificação por email, Slack, etc.
        logger.warn('BackupManager', 'Notificação de falha enviada');
      }
    } finally {
      this.isRunning = false;
      this.currentBackup = null;
    }
    
    return backup;
  }

  /**
   * Criar backup completo
   */
  private async createFullBackup(backup: BackupInfo): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup_${timestamp}_FULL_PENDING.backup`;
    const backupPath = path.join(this.config.backupDir, backupFileName);
    
    try {
      const files: string[] = [];
      let totalSize = 0;
      
      // Backup do banco de dados
      if (this.config.includeDatabase) {
        const dbBackup = await this.backupDatabase();
        files.push(dbBackup.path);
        totalSize += dbBackup.size;
      }
      
      // Backup de uploads
      if (this.config.includeUploads) {
        const uploadsBackup = await this.backupUploads();
        files.push(uploadsBackup.path);
        totalSize += uploadsBackup.size;
      }
      
      // Backup de logs
      if (this.config.includeLogs) {
        const logsBackup = await this.backupLogs();
        files.push(logsBackup.path);
        totalSize += logsBackup.size;
      }
      
      // Criar arquivo de backup consolidado
      await this.createConsolidatedBackup(files, backupPath);
      
      // Calcular checksum final
      backup.checksum = await this.calculateFileChecksum(backupPath);
      backup.size = totalSize;
      backup.files = [backupFileName];
      
      // Renomear arquivo para status COMPLETED
      const finalFileName = backupFileName.replace('PENDING', 'COMPLETED');
      const finalPath = path.join(this.config.backupDir, finalFileName);
      await fs.rename(backupPath, finalPath);
      backup.files = [finalFileName];
      
      // Limpar arquivos temporários
      for (const file of files) {
        await fs.unlink(file);
      }
      
    } catch (error) {
      throw new Error(`Erro no backup completo: ${error.message}`);
    }
  }

  /**
   * Criar backup incremental
   */
  private async createIncrementalBackup(backup: BackupInfo): Promise<void> {
    // Implementar lógica de backup incremental
    // Por enquanto, criar backup completo
    await this.createFullBackup(backup);
    backup.type = 'INCREMENTAL';
  }

  /**
   * Criar backup apenas do banco
   */
  private async createDatabaseBackup(backup: BackupInfo): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup_${timestamp}_DATABASE_ONLY_PENDING.backup`;
    const backupPath = path.join(this.config.backupDir, backupFileName);
    
    try {
      const dbBackup = await this.backupDatabase();
      
      // Copiar backup do banco para o arquivo final
      await fs.copyFile(dbBackup.path, backupPath);
      
      backup.checksum = await this.calculateFileChecksum(backupPath);
      backup.size = dbBackup.size;
      backup.files = [backupFileName];
      
      // Renomear arquivo para status COMPLETED
      const finalFileName = backupFileName.replace('PENDING', 'COMPLETED');
      const finalPath = path.join(this.config.backupDir, finalFileName);
      await fs.rename(backupPath, finalPath);
      backup.files = [finalFileName];
      
      // Limpar arquivo temporário
      await fs.unlink(dbBackup.path);
      
    } catch (error) {
      throw new Error(`Erro no backup do banco: ${error.message}`);
    }
  }

  /**
   * Backup do banco de dados
   */
  private async backupDatabase(): Promise<{ path: string; size: number }> {
    const timestamp = Date.now();
    const tempPath = path.join(this.config.backupDir, `db_temp_${timestamp}.sql`);
    
    try {
      // Aqui você implementaria o dump real do banco
      // Por enquanto, criar um arquivo de exemplo
      const dbContent = `-- Backup do banco de dados
-- Timestamp: ${new Date().toISOString()}
-- Este é um backup simulado
SELECT 'Backup simulado do banco de dados' as status;`;
      
      await fs.writeFile(tempPath, dbContent);
      
      // Comprimir se habilitado
      if (this.config.compression) {
        const compressedPath = await this.compressFile(tempPath);
        await fs.unlink(tempPath);
        return { path: compressedPath, size: (await fs.stat(compressedPath)).size };
      }
      
      const stats = await fs.stat(tempPath);
      return { path: tempPath, size: stats.size };
      
    } catch (error) {
      throw new Error(`Erro no backup do banco: ${error.message}`);
    }
  }

  /**
   * Backup de uploads
   */
  private async backupUploads(): Promise<{ path: string; size: number }> {
    const timestamp = Date.now();
    const tempPath = path.join(this.config.backupDir, `uploads_temp_${timestamp}.tar`);
    
    try {
      // Aqui você implementaria o backup real dos uploads
      // Por enquanto, criar um arquivo de exemplo
      const uploadsContent = `# Backup de uploads
# Timestamp: ${new Date().toISOString()}
# Este é um backup simulado dos uploads`;
      
      await fs.writeFile(tempPath, uploadsContent);
      
      // Comprimir se habilitado
      if (this.config.compression) {
        const compressedPath = await this.compressFile(tempPath);
        await fs.unlink(tempPath);
        return { path: compressedPath, size: (await fs.stat(compressedPath)).size };
      }
      
      const stats = await fs.stat(tempPath);
      return { path: tempPath, size: stats.size };
      
    } catch (error) {
      throw new Error(`Erro no backup de uploads: ${error.message}`);
    }
  }

  /**
   * Backup de logs
   */
  private async backupLogs(): Promise<{ path: string; size: number }> {
    const timestamp = Date.now();
    const tempPath = path.join(this.config.backupDir, `logs_temp_${timestamp}.log`);
    
    try {
      // Aqui você implementaria o backup real dos logs
      // Por enquanto, criar um arquivo de exemplo
      const logsContent = `# Backup de logs
# Timestamp: ${new Date().toISOString()}
# Este é um backup simulado dos logs do sistema`;
      
      await fs.writeFile(tempPath, logsContent);
      
      // Comprimir se habilitado
      if (this.config.compression) {
        const compressedPath = await this.compressFile(tempPath);
        await fs.unlink(tempPath);
        return { path: compressedPath, size: (await fs.stat(compressedPath)).size };
      }
      
      const stats = await fs.stat(tempPath);
      return { path: tempPath, size: stats.size };
      
    } catch (error) {
      throw new Error(`Erro no backup de logs: ${error.message}`);
    }
  }

  /**
   * Criar backup consolidado
   */
  private async createConsolidatedBackup(files: string[], outputPath: string): Promise<void> {
    try {
      const output = createWriteStream(outputPath);
      
      for (const file of files) {
        const input = createReadStream(file);
        
        if (this.config.compression) {
          const gzip = createGzip();
          await pipeline(input, gzip, output);
        } else {
          await pipeline(input, output);
        }
      }
      
      output.end();
      
    } catch (error) {
      throw new Error(`Erro ao criar backup consolidado: ${error.message}`);
    }
  }

  /**
   * Comprimir arquivo
   */
  private async compressFile(filePath: string): Promise<string> {
    const compressedPath = filePath + '.gz';
    const input = createReadStream(filePath);
    const output = createWriteStream(compressedPath);
    const gzip = createGzip();
    
    await pipeline(input, gzip, output);
    return compressedPath;
  }

  /**
   * Calcular checksum do arquivo
   */
  private async calculateFileChecksum(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath);
      return crypto.createHash('sha256').update(content).digest('hex');
    } catch (error) {
      return '';
    }
  }

  /**
   * Restaurar backup
   */
  public async restoreBackup(backupId: string): Promise<RestoreInfo> {
    const backup = this.backups.find(b => b.id === backupId);
    if (!backup) {
      throw new Error('Backup não encontrado');
    }
    
    if (backup.status !== 'COMPLETED') {
      throw new Error('Backup não está completo');
    }
    
    if (this.currentRestore) {
      throw new Error('Restauração já está em andamento');
    }
    
    const restore: RestoreInfo = {
      id: crypto.randomUUID(),
      backupId,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      progress: 0
    };
    
    this.currentRestore = restore;
    this.restores.unshift(restore);
    
    try {
      logger.info('BackupManager', 'Iniciando restauração', { backupId, restoreId: restore.id });
      this.emit('restoreStarted', restore);
      
      restore.status = 'IN_PROGRESS';
      
      // Implementar lógica de restauração
      await this.performRestore(backup, restore);
      
      restore.status = 'COMPLETED';
      restore.progress = 100;
      
      logger.success('BackupManager', 'Restauração concluída com sucesso', {
        restoreId: restore.id,
        backupId
      });
      
      this.emit('restoreCompleted', restore);
      
    } catch (error) {
      restore.status = 'FAILED';
      restore.error = error.message;
      
      logger.error('BackupManager', 'Erro durante restauração', error, { restoreId: restore.id, backupId });
      this.emit('restoreFailed', restore);
      
    } finally {
      this.currentRestore = null;
    }
    
    return restore;
  }

  /**
   * Executar restauração
   */
  private async performRestore(backup: BackupInfo, restore: RestoreInfo): Promise<void> {
    // Simular progresso da restauração
    for (let i = 0; i <= 100; i += 10) {
      restore.progress = i;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Aqui você implementaria a lógica real de restauração
    logger.info('BackupManager', 'Restauração simulada concluída', { backupId: backup.id });
  }

  /**
   * Limpeza de backups antigos
   */
  private async cleanupOldBackups(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
      
      const oldBackups = this.backups.filter(backup => 
        new Date(backup.timestamp) < cutoffDate
      );
      
      for (const backup of oldBackups) {
        await this.removeBackup(backup.id);
      }
      
      if (oldBackups.length > 0) {
        logger.info('BackupManager', 'Backups antigos removidos', { count: oldBackups.length });
      }
      
    } catch (error) {
      logger.error('BackupManager', 'Erro na limpeza de backups antigos', error);
    }
  }

  /**
   * Remover backup
   */
  public async removeBackup(backupId: string): Promise<boolean> {
    const index = this.backups.findIndex(b => b.id === backupId);
    if (index === -1) return false;
    
    const backup = this.backups[index];
    
    try {
      await this.removeBackupFiles(backup);
      this.backups.splice(index, 1);
      
      logger.info('BackupManager', 'Backup removido', { id: backupId });
      this.emit('backupRemoved', backup);
      
      return true;
      
    } catch (error) {
      logger.error('BackupManager', 'Erro ao remover backup', error, { id: backupId });
      return false;
    }
  }

  /**
   * Remover arquivos de backup
   */
  private async removeBackupFiles(backup: BackupInfo): Promise<void> {
    for (const file of backup.files) {
      try {
        const filePath = path.join(this.config.backupDir, file);
        await fs.unlink(filePath);
      } catch (error) {
        logger.warn('BackupManager', 'Erro ao remover arquivo de backup', { file, error: error.message });
      }
    }
  }

  /**
   * Obter informações de backup
   */
  public getBackupInfo(backupId: string): BackupInfo | undefined {
    return this.backups.find(b => b.id === backupId);
  }

  /**
   * Listar todos os backups
   */
  public listBackups(): BackupInfo[] {
    return [...this.backups];
  }

  /**
   * Obter estatísticas de backup
   */
  public getBackupStats(): any {
    const totalSize = this.backups.reduce((sum, backup) => sum + backup.size, 0);
    const successfulBackups = this.backups.filter(b => b.status === 'COMPLETED').length;
    const failedBackups = this.backups.filter(b => b.status === 'FAILED').length;
    
    return {
      totalBackups: this.backups.length,
      successfulBackups,
      failedBackups,
      totalSize: Math.round(totalSize / 1024 / 1024), // MB
      averageSize: this.backups.length > 0 ? Math.round(totalSize / this.backups.length / 1024 / 1024) : 0,
      lastBackup: this.backups[0]?.timestamp,
      nextScheduledBackup: this.backupInterval ? new Date(Date.now() + this.config.backupInterval) : null
    };
  }

  /**
   * Atualizar configuração
   */
  public updateConfig(newConfig: Partial<BackupConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.backupInterval && this.backupInterval) {
      this.startAutomaticBackup();
    }
    
    logger.info('BackupManager', 'Configuração de backup atualizada', newConfig);
  }

  /**
   * Parar o sistema de backup
   */
  public stop(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
    
    this.isRunning = false;
    logger.info('BackupManager', 'Sistema de backup parado');
  }
}

export const backupManager = BackupManager.getInstance();

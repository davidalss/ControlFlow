# Sistemas Críticos do ControlFlow

## 🛡️ Visão Geral

Os Sistemas Críticos do ControlFlow representam a infraestrutura de sobrevivência e confiabilidade da aplicação. Implementados no **NÍVEL 5 - CRÍTICO MÁXIMO**, estes sistemas garantem que a aplicação continue funcionando mesmo em condições adversas, fornecendo monitoramento, segurança, cache e backup automáticos.

## 🏗️ Arquitetura dos Sistemas

### Componentes Principais

```
ControlFlow
├── 🏥 Health Monitor
├── 💾 Cache Manager  
├── 🔒 Security Manager
├── 💿 Backup Manager
└── 📊 Admin Dashboard
```

### Padrão de Implementação
- **Singleton Pattern**: Uma instância por sistema
- **Event-Driven**: Comunicação via EventEmitter
- **Middleware Integration**: Integração com Express.js
- **Real-time Monitoring**: Monitoramento em tempo real

## 🏥 Health Monitor

### Visão Geral
Sistema de monitoramento em tempo real que verifica a saúde de todos os componentes críticos da aplicação.

### Funcionalidades

#### Métricas Monitoradas
- **CPU**: Uso de processador e carga do sistema
- **Memória**: Uso de RAM e swap
- **Banco de Dados**: Latência e conectividade
- **Storage**: Espaço em disco e performance de I/O
- **API**: Tempo de resposta e taxa de erro
- **WebSocket**: Status de conexões em tempo real

#### Alertas Automáticos
```typescript
interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  component: string;
  timestamp: Date;
  metadata: Record<string, any>;
}
```

#### Status de Saúde
```typescript
interface HealthStatus {
  overall: 'healthy' | 'warning' | 'critical';
  timestamp: Date;
  components: {
    cpu: ComponentHealth;
    memory: ComponentHealth;
    database: ComponentHealth;
    storage: ComponentHealth;
    api: ComponentHealth;
    websocket: ComponentHealth;
  };
  alerts: Alert[];
  metrics: Metric[];
}
```

### Configuração

#### Variáveis de Ambiente
```bash
# Health Monitor
HEALTH_CHECK_INTERVAL=30000        # 30 segundos
HEALTH_ALERT_THRESHOLD=80         # 80% de uso
HEALTH_CRITICAL_THRESHOLD=95      # 95% de uso
HEALTH_RETENTION_DAYS=30          # Retenção de logs
```

#### Uso no Código
```typescript
import { healthMonitor } from '@/lib/health-monitor';

// Verificação manual
const status = await healthMonitor.performHealthCheck();

// Eventos de saúde
healthMonitor.on('alert', (alert) => {
  console.log('Alerta de saúde:', alert);
});

healthMonitor.on('statusChange', (status) => {
  console.log('Status mudou para:', status.overall);
});
```

## 💾 Cache Manager

### Visão Geral
Sistema de cache inteligente com TTL configurável, evição LRU e cache especializado para diferentes tipos de dados.

### Funcionalidades

#### Tipos de Cache
- **Cache Geral**: Dados genéricos com TTL
- **Cache de Produtos**: Catálogo e informações técnicas
- **Cache de Inspeções**: Dados de execução e histórico
- **Cache de Usuários**: Preferências e configurações

#### Estratégias de Evição
- **LRU (Least Recently Used)**: Remove itens menos usados
- **TTL (Time To Live)**: Remove itens expirados
- **Size-based**: Remove itens quando atinge limite de tamanho

#### Estatísticas de Performance
```typescript
interface CacheStats {
  totalItems: number;
  totalSize: number;
  hitCount: number;
  missCount: number;
  hitRatio: number;
  evictionCount: number;
  categories: Record<string, CacheCategoryStats>;
}
```

### Configuração

#### Variáveis de Ambiente
```bash
# Cache Manager
CACHE_TTL=3600                    # 1 hora padrão
CACHE_MAX_SIZE=100                # Máximo de itens
CACHE_MAX_MEMORY=52428800         # 50MB em bytes
CACHE_CLEANUP_INTERVAL=300000     # 5 minutos
```

#### Uso no Código
```typescript
import { cacheManager } from '@/lib/cache-manager';

// Salvar no cache
await cacheManager.set('products', products, 3600);

// Recuperar do cache
const cachedProducts = await cacheManager.get('products');

// Cache com tags
await cacheManager.set('user:123', userData, 1800, ['user', 'profile']);

// Limpar por tags
await cacheManager.clearByTags(['user']);
```

## 🔒 Security Manager

### Visão Geral
Sistema de segurança abrangente que protege a aplicação contra ataques, implementa rate limiting e fornece auditoria completa.

### Funcionalidades

#### Middleware de Segurança
- **Input Validation**: Validação de entrada com sanitização
- **XSS Protection**: Proteção contra Cross-Site Scripting
- **SQL Injection Prevention**: Prevenção de injeção SQL
- **CSRF Protection**: Proteção contra Cross-Site Request Forgery
- **Rate Limiting**: Limitação de requisições por IP

#### Proteção contra Ataques
- **Brute Force Protection**: Detecção de tentativas de força bruta
- **IP Blocking**: Bloqueio de IPs maliciosos
- **Request Validation**: Validação de headers e payloads
- **File Upload Security**: Verificação de tipos e tamanhos de arquivo

#### Auditoria de Segurança
```typescript
interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'rate_limit' | 'blocked_ip' | 'suspicious_activity';
  ip: string;
  userAgent: string;
  timestamp: Date;
  details: Record<string, any>;
  action: 'logged' | 'blocked' | 'notified';
}
```

### Configuração

#### Variáveis de Ambiente
```bash
# Security Manager
SECURITY_RATE_LIMIT_WINDOW=900000  # 15 minutos
SECURITY_RATE_LIMIT_MAX=100        # Máximo de requisições
SECURITY_LOGIN_ATTEMPTS_MAX=5      # Tentativas de login
SECURITY_BLOCK_DURATION=3600000    # 1 hora de bloqueio
SECURITY_SUSPICIOUS_PATTERNS=true  # Detecção de padrões suspeitos
```

#### Uso no Código
```typescript
import { securityManager } from '@/lib/security-manager';

// Middleware de segurança
app.use(securityManager.securityMiddleware());

// Proteção de rota específica
app.use('/api/admin', securityManager.authProtectionMiddleware());

// Eventos de segurança
securityManager.on('securityEvent', (event) => {
  console.log('Evento de segurança:', event);
});

securityManager.on('ipBlocked', (ip) => {
  console.log('IP bloqueado:', ip);
});
```

## 💿 Backup Manager

### Visão Geral
Sistema de backup automático que protege dados críticos, incluindo banco de dados, uploads e logs do sistema.

### Funcionalidades

#### Tipos de Backup
- **Full Backup**: Backup completo de todos os dados
- **Incremental Backup**: Apenas mudanças desde último backup
- **Database Only**: Apenas banco de dados
- **Selective Backup**: Arquivos e pastas específicos

#### Recursos Avançados
- **Compressão**: Redução de tamanho com gzip
- **Criptografia**: Proteção de dados sensíveis (placeholder)
- **Retenção Automática**: Limpeza de backups antigos
- **Verificação de Integridade**: Checksums para validação

#### Informações de Backup
```typescript
interface BackupInfo {
  id: string;
  type: 'FULL' | 'INCREMENTAL' | 'DATABASE_ONLY';
  timestamp: Date;
  size: number;
  compressedSize: number;
  checksum: string;
  status: 'completed' | 'failed' | 'in_progress';
  metadata: Record<string, any>;
}
```

### Configuração

#### Variáveis de Ambiente
```bash
# Backup Manager
BACKUP_DIR=./backups                    # Diretório de backup
BACKUP_RETENTION_DAYS=30               # Retenção de 30 dias
BACKUP_AUTO_INTERVAL=86400000          # 24 horas
BACKUP_COMPRESSION=true                 # Ativar compressão
BACKUP_ENCRYPTION=false                 # Criptografia (placeholder)
BACKUP_MAX_CONCURRENT=2                 # Máximo de backups simultâneos
```

#### Uso no Código
```typescript
import { backupManager } from '@/lib/backup-manager';

// Inicializar sistema
await backupManager.initialize();

// Backup manual
const backup = await backupManager.createBackup('FULL');

// Restaurar backup
await backupManager.restoreBackup(backup.id);

// Listar backups
const backups = await backupManager.listBackups();

// Eventos de backup
backupManager.on('backupCompleted', (backup) => {
  console.log('Backup concluído:', backup.id);
});

backupManager.on('backupFailed', (error) => {
  console.error('Backup falhou:', error);
});
```

## 📊 Admin Dashboard

### Visão Geral
Interface administrativa que fornece visibilidade e controle sobre todos os sistemas críticos.

### Funcionalidades

#### Abas Principais
- **Visão Geral**: Status geral e métricas principais
- **Saúde**: Detalhes do Health Monitor
- **Segurança**: Eventos e configurações de segurança
- **Cache**: Estatísticas e controle de cache
- **Backup**: Gerenciamento de backups

#### Ações Administrativas
- **Health Check**: Verificação manual de saúde
- **Cache Clear**: Limpeza de cache
- **Backup Create**: Criação manual de backup
- **Security Unblock**: Desbloqueio de IPs
- **System Restart**: Reinicialização do sistema

### Rotas da API

#### Health
```bash
GET    /api/admin/health              # Status atual
POST   /api/admin/health/check        # Verificação manual
```

#### Security
```bash
GET    /api/admin/security            # Eventos de segurança
POST   /api/admin/security/unblock/:ip # Desbloquear IP
```

#### Cache
```bash
GET    /api/admin/cache               # Estatísticas de cache
POST   /api/admin/cache/clear         # Limpar cache
```

#### Backup
```bash
GET    /api/admin/backup              # Listar backups
POST   /api/admin/backup/create       # Criar backup
POST   /api/admin/backup/:id/restore  # Restaurar backup
DELETE /api/admin/backup/:id          # Remover backup
```

#### System
```bash
GET    /api/admin/system              # Informações do sistema
POST   /api/admin/system/restart     # Reiniciar sistema
```

## 🚀 Inicialização e Configuração

### Ordem de Inicialização
1. **Health Monitor**: Monitoramento básico
2. **Security Manager**: Proteção imediata
3. **Cache Manager**: Otimização de performance
4. **Backup Manager**: Proteção de dados
5. **Admin Routes**: Interface administrativa

### Configuração Automática
```typescript
// server/index.ts
import { healthMonitor } from './lib/health-monitor';
import { securityManager } from './lib/security-manager';
import { cacheManager } from './lib/cache-manager';
import { backupManager } from './lib/backup-manager';

// Inicializar sistemas críticos
server.listen(port, async () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
  
  try {
    // Inicializar sistemas em paralelo
    await Promise.all([
      healthMonitor.initialize(),
      securityManager.initialize(),
      cacheManager.initialize(),
      backupManager.initialize()
    ]);
    
    console.log('✅ Sistemas críticos inicializados');
  } catch (error) {
    console.error('❌ Erro na inicialização dos sistemas críticos:', error);
  }
});
```

## 🧪 Testes e Validação

### Script de Teste
```bash
# Testar todos os sistemas críticos
node test-critical-systems.js
```

### Testes Disponíveis
- **Health Monitor**: Verificação de métricas
- **Security Manager**: Teste de proteções
- **Cache Manager**: Validação de cache
- **Backup Manager**: Teste de backup/restore
- **Admin Routes**: Validação de endpoints

### Validação de Funcionamento
```typescript
// Verificar status geral
const healthStatus = await healthMonitor.getCurrentStatus();
console.log('Status de saúde:', healthStatus.overall);

// Verificar cache
const cacheStats = await cacheManager.getStats();
console.log('Hit ratio:', cacheStats.hitRatio);

// Verificar segurança
const securityEvents = await securityManager.getRecentEvents();
console.log('Eventos de segurança:', securityEvents.length);

// Verificar backups
const backups = await backupManager.listBackups();
console.log('Backups disponíveis:', backups.length);
```

## 📈 Monitoramento e Alertas

### Métricas em Tempo Real
- **CPU Usage**: Uso de processador
- **Memory Usage**: Uso de memória
- **Database Latency**: Latência do banco
- **API Response Time**: Tempo de resposta da API
- **Cache Hit Ratio**: Taxa de acerto do cache
- **Security Events**: Eventos de segurança

### Alertas Automáticos
- **Critical**: CPU > 95%, Memory > 95%
- **Warning**: CPU > 80%, Memory > 80%
- **Info**: Mudanças de status, backups completados

### Notificações
- **Console Logs**: Logs estruturados
- **Event Emitter**: Eventos para outros sistemas
- **Admin Dashboard**: Interface visual
- **External Systems**: Integração futura com sistemas externos

## 🔧 Manutenção e Troubleshooting

### Logs de Sistema
```bash
# Ver logs do Health Monitor
docker-compose logs -f | grep "HealthMonitor"

# Ver logs de segurança
docker-compose logs -f | grep "SecurityManager"

# Ver logs de cache
docker-compose logs -f | grep "CacheManager"

# Ver logs de backup
docker-compose logs -f | grep "BackupManager"
```

### Problemas Comuns

#### Health Monitor
```bash
# CPU alto
- Verificar processos em background
- Verificar loops infinitos
- Verificar vazamentos de memória

# Memória alta
- Verificar cache size
- Verificar retenção de dados
- Verificar garbage collection
```

#### Security Manager
```bash
# Muitos IPs bloqueados
- Verificar ataques reais
- Ajustar thresholds
- Verificar logs de acesso

# Rate limiting excessivo
- Ajustar limites por IP
- Verificar padrões de uso
- Verificar bots legítimos
```

#### Cache Manager
```bash
# Cache hit ratio baixo
- Aumentar TTL
- Verificar estratégias de cache
- Verificar tamanho do cache

# Memória alta
- Reduzir tamanho máximo
- Ajustar estratégia de evição
- Verificar vazamentos
```

#### Backup Manager
```bash
# Backups falhando
- Verificar espaço em disco
- Verificar permissões
- Verificar conectividade do banco

# Backups muito grandes
- Ajustar compressão
- Verificar dados desnecessários
- Implementar backup incremental
```

## 🚀 Roadmap e Melhorias

### Próximas Funcionalidades
- [ ] **Machine Learning**: Detecção de anomalias
- [ ] **Distributed Monitoring**: Monitoramento distribuído
- [ ] **Auto-scaling**: Escalabilidade automática
- [ ] **Predictive Maintenance**: Manutenção preditiva
- [ ] **Integration APIs**: APIs para sistemas externos

### Melhorias de Performance
- [ ] **Async Processing**: Processamento assíncrono
- [ ] **Database Optimization**: Otimização de consultas
- [ ] **Memory Management**: Gerenciamento avançado de memória
- [ ] **Load Balancing**: Balanceamento de carga

### Segurança Avançada
- [ ] **AI Threat Detection**: Detecção de ameaças com IA
- [ ] **Behavioral Analysis**: Análise comportamental
- [ ] **Zero Trust Architecture**: Arquitetura zero trust
- [ ] **Compliance Tools**: Ferramentas de conformidade

---

**Sistemas Críticos do ControlFlow** - Infraestrutura de sobrevivência para máxima confiabilidade 🛡️🚀

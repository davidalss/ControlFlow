# 🗄️ Configuração do Banco de Dados - Enso

Este documento explica como configurar e gerenciar o banco de dados PostgreSQL do Enso.

## 📋 Visão Geral

O Enso usa **PostgreSQL 15** como banco de dados principal, gerenciado através do **Drizzle ORM** com TypeScript.

## 🏗️ Estrutura do Banco

### Tabelas Principais

#### 1. **users** - Usuários do Sistema
```sql
- id (UUID, Primary Key)
- email (Text, Unique)
- password (Text, Hashed)
- name (Text)
- role (Enum: admin, inspector, engineering, etc.)
- businessUnit (Enum: DIY, TECH, KITCHEN_BEAUTY, etc.)
- photo (Text, URL)
- createdAt (Timestamp)
- expiresAt (Timestamp, para usuários temporários)
```

#### 2. **products** - Catálogo de Produtos
```sql
- id (UUID, Primary Key)
- code (Text, Unique)
- ean (Text)
- description (Text)
- category (Text)
- businessUnit (Enum)
- technicalParameters (Text, JSON)
- createdAt (Timestamp)
```

#### 3. **inspection_plans** - Planos de Inspeção
```sql
- id (UUID, Primary Key)
- planCode (Text, Unique, ex: PCG02.049)
- planName (Text)
- planType (Enum: product, parts)
- version (Text)
- status (Enum: active, inactive, draft)
- productId (Text, Foreign Key)
- inspectionType (Enum: functional, graphic, dimensional, etc.)
- aqlCritical, aqlMajor, aqlMinor (Real)
- inspectionSteps (Text, JSON)
- checklists (Text, JSON)
- requiredParameters (Text, JSON)
- createdAt, updatedAt (Timestamp)
```

#### 4. **inspections** - Inspeções Realizadas
```sql
- id (Text, Primary Key)
- inspectionCode (Text, Unique)
- fresNf (Text)
- supplier (Text)
- productId, productCode, productName (Text)
- lotSize (Integer)
- inspectionDate (Timestamp)
- inspectorId, inspectorName (Text)
- status (Enum: in_progress, completed, approved, rejected)
- minorDefects, majorDefects, criticalDefects (Integer)
- photos (JSONB)
- notes (Text)
- createdAt, updatedAt (Timestamp)
```

#### 5. **rnc_records** - Registros de Não Conformidade
```sql
- id (Text, Primary Key)
- rncCode (Text, Unique)
- inspectionId (Text, Foreign Key)
- date (Timestamp)
- inspectorId, inspectorName (Text)
- supplier, fresNf, productCode, productName (Text)
- lotSize, inspectedQuantity, totalNonConformities (Integer)
- isRecurring (Boolean)
- defectDetails (JSONB)
- evidencePhotos (JSONB)
- status (Enum: pending, in_treatment, closed, blocked)
- type (Enum: registration, corrective_action)
- sgqStatus (Enum: pending_evaluation, pending_treatment, closed)
- createdAt, updatedAt (Timestamp)
```

#### 6. **notifications** - Sistema de Notificações
```sql
- id (Text, Primary Key)
- userId (Text, Foreign Key)
- title, message (Text)
- type (Enum: inspection, rnc, sgq, system)
- priority (Enum: low, normal, high, urgent)
- read (Boolean)
- actionUrl, relatedId (Text)
- createdAt (Timestamp)
```

#### 7. **logs** - Logs de Auditoria
```sql
- id (UUID, Primary Key)
- timestamp (Timestamp)
- userId (Text, Foreign Key)
- userName (Text)
- actionType (Text)
- description (Text)
- details (Text, JSON)
```

### Tabelas de Suporte

#### **approval_decisions** - Decisões de Aprovação
#### **blocks** - Bloqueios de Produtos
#### **solicitations** - Solicitações
#### **groups** - Grupos de Usuários
#### **permissions** - Permissões
#### **chat_sessions** - Sessões de Chat
#### **chat_messages** - Mensagens do Chat

## 🔧 Configuração Inicial

### 1. Variáveis de Ambiente

Configure no arquivo `.env`:

```env
# Database
DATABASE_URL=postgresql://enso_db:123@localhost:5432/enso_db

# Para desenvolvimento local
DATABASE_URL=postgresql://postgres:password@localhost:5432/enso_db
```

### 2. Docker Compose

O `docker-compose.yml` já está configurado:

```yaml
postgres:
  image: postgres:15-alpine
  environment:
    POSTGRES_DB: enso_db
POSTGRES_USER: enso_db
    POSTGRES_PASSWORD: 123
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
```

### 3. Migrações

As migrações estão na pasta `migrations/` e são executadas automaticamente.

## 🚀 Comandos de Banco

### Executar Migrações
```bash
# Via Docker
docker-compose exec enso_app npm run db:push

# Local
npm run db:push

# Via Drizzle Kit
npx drizzle-kit push
```

### Gerar Nova Migração
```bash
npx drizzle-kit generate
```

### Aplicar Migrações
```bash
npx drizzle-kit migrate
```

### Verificar Status
```bash
npx drizzle-kit studio
```

## 📊 Dados Iniciais

### Usuário Admin Padrão
O sistema cria automaticamente um usuário administrador:

```sql
INSERT INTO users (id, email, password, name, role, businessUnit) 
VALUES (
  'admin-id',
  'admin@enso.com',
  'hashed-password',
  'Administrador',
  'admin',
  'N/A'
);
```

### Configurações do Sistema
- Tabelas criadas automaticamente
- Índices otimizados
- Constraints de integridade

## 🔍 Consultas Úteis

### Verificar Status do Banco
```sql
-- Verificar conexões ativas
SELECT * FROM pg_stat_activity WHERE datname = 'enso_db';

-- Verificar tamanho do banco
SELECT pg_size_pretty(pg_database_size('enso_db'));

-- Verificar tabelas
SELECT table_name, table_rows 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Backup e Restore

#### Backup
```bash
# Backup completo
docker-compose exec enso_postgres pg_dump -U enso_db enso_db > backup.sql

# Backup apenas dados
docker-compose exec enso_postgres pg_dump -U enso_db --data-only enso_db > data_backup.sql

# Backup apenas estrutura
docker-compose exec enso_postgres pg_dump -U enso_db --schema-only enso_db > schema_backup.sql
```

#### Restore
```bash
# Restore completo
docker-compose exec -T enso_postgres psql -U enso_db enso_db < backup.sql

# Restore apenas dados
docker-compose exec -T enso_postgres psql -U enso_db enso_db < data_backup.sql
```

## 🛠️ Manutenção

### Limpeza de Logs Antigos
```sql
-- Remover logs com mais de 90 dias
DELETE FROM logs 
WHERE timestamp < NOW() - INTERVAL '90 days';

-- Limpar notificações lidas antigas
DELETE FROM notifications 
WHERE read = true AND createdAt < NOW() - INTERVAL '30 days';
```

### Otimização
```sql
-- Analisar tabelas
ANALYZE users;
ANALYZE products;
ANALYZE inspections;
ANALYZE rnc_records;

-- Reindexar
REINDEX TABLE users;
REINDEX TABLE products;
REINDEX TABLE inspections;
```

### Monitoramento
```sql
-- Verificar crescimento de tabelas
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- Verificar fragmentação
SELECT 
  schemaname,
  tablename,
  n_tup_ins,
  n_tup_upd,
  n_tup_del,
  n_live_tup,
  n_dead_tup
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
```

## 🔐 Segurança

### Configurações Recomendadas

#### 1. Senhas Fortes
```env
POSTGRES_PASSWORD=sua-senha-super-forte-aqui
```

#### 2. Conexões SSL (Produção)
```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

#### 3. Limitar Conexões
```sql
-- No postgresql.conf
max_connections = 100
```

#### 4. Backup Automático
```bash
# Script de backup diário
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec enso_postgres pg_dump -U enso_db enso_db > backup_$DATE.sql
```

## 🐛 Solução de Problemas

### Erro de Conexão
```bash
# Verificar se o PostgreSQL está rodando
docker-compose ps enso_postgres

# Verificar logs
docker-compose logs enso_postgres

# Testar conexão
docker-compose exec enso_postgres psql -U enso_db -d enso_db
```

### Erro de Migração
```bash
# Verificar status das migrações
npx drizzle-kit migrate

# Resetar migrações (CUIDADO!)
npx drizzle-kit drop
npx drizzle-kit push
```

### Performance Lenta
```sql
-- Verificar queries lentas
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Verificar locks
SELECT * FROM pg_locks WHERE NOT granted;
```

## 📈 Monitoramento

### Métricas Importantes
- **Conexões ativas**: `pg_stat_activity`
- **Performance**: `pg_stat_statements`
- **Crescimento**: `pg_database_size`
- **Fragmentação**: `pg_stat_user_tables`

### Alertas Recomendados
- Conexões > 80% do limite
- Tamanho do banco > 80% do disco
- Queries lentas > 5 segundos
- Locks não concedidos > 10 segundos

---

**Nota**: Sempre faça backup antes de executar comandos de manutenção em produção.

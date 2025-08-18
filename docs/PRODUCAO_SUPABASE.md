# 🚀 Configuração de Produção - Enso com Supabase

Este documento descreve como configurar o Enso para produção usando o Supabase como banco de dados.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (https://supabase.com)
- Projeto Supabase criado

## 🔧 Configuração Inicial

### 1. Configuração do Supabase

O projeto já está configurado com as seguintes credenciais do Supabase:

- **URL do Projeto**: `https://smvohmdytczfouslcaju.supabase.co`
- **API Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U`
- **Database Password**: `Dexter300819@`

### 2. Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes configurações:

```env
# Configurações do Banco de Dados (Supabase)
DATABASE_URL="postgresql://postgres.smvohmdytczfouslcaju:Dexter300819@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Configurações de Autenticação
JWT_SECRET="enso-jwt-secret-key-2024-production"
SESSION_SECRET="enso-session-secret-2024-production"

# Configurações do Servidor
PORT=5001
NODE_ENV=production

# Configurações do Gemini AI (Severino)
GEMINI_API_KEY="your-gemini-api-key-here"

# Configurações de Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760

# Configurações de Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Configurações de Log
LOG_LEVEL="info"

# Configurações do Supabase
SUPABASE_URL="https://smvohmdytczfouslcaju.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U"
```

## 🚀 Deploy para Produção

### 1. Testar Conexão com Supabase

```bash
npm run test:supabase
```

Este comando irá:
- Testar a conexão com o banco de dados
- Listar as tabelas existentes
- Verificar a versão do PostgreSQL

### 2. Executar Migrações

```bash
npm run migrate:supabase
```

Este comando irá:
- Criar o arquivo `.env` se não existir
- Executar todas as migrações do Drizzle
- Abrir o Drizzle Studio para verificação

### 3. Build e Deploy Completo

```bash
npm run setup:production
```

Este comando irá:
- Fazer o build da aplicação
- Executar as migrações
- Preparar tudo para produção

### 4. Iniciar Servidor de Produção

```bash
npm run start:prod
```

## 📊 Monitoramento

### Acessar Supabase Studio

1. Acesse: https://smvohmdytczfouslcaju.supabase.co
2. Faça login com suas credenciais
3. Vá para a seção "Table Editor" para ver as tabelas
4. Use "SQL Editor" para consultas personalizadas

### Logs da Aplicação

Os logs são configurados com nível `info` por padrão. Para debug, altere para `debug`:

```env
LOG_LEVEL="debug"
```

## 🔒 Segurança

### Variáveis Sensíveis

- **JWT_SECRET**: Deve ser uma string aleatória e segura
- **SESSION_SECRET**: Deve ser uma string aleatória e segura
- **DATABASE_URL**: Contém credenciais do banco - mantenha segura

### Recomendações

1. Use variáveis de ambiente diferentes para cada ambiente
2. Nunca commite o arquivo `.env` no repositório
3. Use secrets management em produção
4. Configure HTTPS em produção

## 🐛 Troubleshooting

### Erro de Conexão com Banco

```bash
# Verificar se as credenciais estão corretas
npm run test:supabase

# Verificar se o projeto Supabase está ativo
# Acesse o dashboard do Supabase
```

### Erro de Migração

```bash
# Gerar nova migração
npm run db:generate

# Executar migração
npm run db:migrate

# Verificar status
npm run db:studio
```

### Erro de Build

```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install

# Verificar TypeScript
npm run check

# Build novamente
npm run build
```

## 📈 Escalabilidade

### Supabase

O Supabase oferece:
- **Free Tier**: 500MB de banco, 2GB de transferência
- **Pro Plan**: $25/mês - 8GB de banco, 250GB de transferência
- **Team Plan**: $599/mês - 100GB de banco, 2TB de transferência

### Monitoramento

Configure alertas para:
- Uso de banco de dados
- Latência de consultas
- Erros de aplicação
- Uso de storage

## 🔄 Backup e Recuperação

### Backup Automático

O Supabase faz backup automático:
- **Free Tier**: Backup diário
- **Pro/Team**: Backup a cada 5 minutos

### Backup Manual

```sql
-- No SQL Editor do Supabase
-- Exportar dados específicos
SELECT * FROM users;
SELECT * FROM products;
SELECT * FROM inspection_plans;
```

## 📞 Suporte

Para suporte técnico:
- **Documentação**: https://supabase.com/docs
- **Discord**: https://discord.supabase.com
- **GitHub**: https://github.com/supabase/supabase

---

**Equipe Enso** - Perfeição e Melhoria Contínua

# 🐳 Setup Docker para Desenvolvimento ENSO

Este documento explica como configurar e usar o ambiente de desenvolvimento Docker para o projeto ENSO.

## 🚀 Configuração Inicial

### Pré-requisitos
- **Docker Desktop** - [Download aqui](https://www.docker.com/products/docker-desktop)
- **Node.js 18+** - [Download aqui](https://nodejs.org/)
- **Git** - [Download aqui](https://git-scm.com/download/win)

### Setup Automático (Recomendado)

1. **Execute o script de setup:**
   ```powershell
   .\setup-dev.ps1
   ```

2. **Inicie o ambiente:**
   ```powershell
   .\start-dev.ps1
   ```

3. **Acesse a aplicação:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5002

## 📋 Scripts Disponíveis

| Script | Descrição | Uso |
|--------|-----------|-----|
| `setup-dev.ps1` | Configuração inicial completa | `.\setup-dev.ps1` |
| `start-dev.ps1` | Inicia o ambiente (com cache busting) | `.\start-dev.ps1` |
| `stop-dev.ps1` | Para o ambiente | `.\stop-dev.ps1` |
| `update-dev.ps1` | Atualização rápida (sem rebuild completo) | `.\update-dev.ps1` |
| `rebuild-dev.ps1` | Rebuild completo (limpa tudo) | `.\rebuild-dev.ps1` |
| `clear-cache.ps1` | Limpeza específica de cache | `.\clear-cache.ps1` |
| `logs-dev.ps1` | Visualiza logs | `.\logs-dev.ps1` ou `.\logs-dev.ps1 backend` |

## 🌐 Serviços Disponíveis

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:3000 | Aplicação React (Vite) |
| **Backend** | http://localhost:5002 | API Node.js/Express |
| **Adminer** | http://localhost:8080 | Interface PostgreSQL |
| **Redis Commander** | http://localhost:8081 | Interface Redis |
| **PostgreSQL** | localhost:5432 | Banco de dados principal |
| **Supabase Local** | localhost:5433 | Banco Supabase local |

## 👤 Usuários de Teste

| Email | Senha | Role |
|-------|-------|------|
| `admin@enso.com` | `admin123` | Administrador |
| `test@enso.com` | `test123` | Usuário |

## 🔧 Configuração Manual (Opcional)

### 1. Variáveis de Ambiente

**Backend (.env):**
```env
DATABASE_URL=postgresql://enso_user:enso_password_123@localhost:5432/enso_db_dev
JWT_SECRET=enso-jwt-secret-key-2024-development-local
SESSION_SECRET=enso-session-secret-2024-local
PORT=5002
NODE_ENV=development
HOST=0.0.0.0
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
LOG_LEVEL=debug
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:3000
```

**Frontend (client/.env):**
```env
VITE_API_URL=http://localhost:5002
VITE_SUPABASE_URL=http://localhost:5433
VITE_SUPABASE_ANON_KEY=your-anon-key
NODE_ENV=development
```

### 2. Estrutura do Docker Compose

O `docker-compose.dev.yml` inclui:

- **PostgreSQL**: Banco principal com dados de exemplo
- **Redis**: Cache e sessões
- **Supabase Local**: Para desenvolvimento
- **Backend**: API Node.js com hot reload
- **Frontend**: React com Vite e hot reload
- **Adminer**: Interface web para PostgreSQL
- **Redis Commander**: Interface web para Redis

## 📊 Banco de Dados

### Schema Inicial
- **Schema**: `enso_schema`
- **Tabelas**: users, products, inspections, inspection_plans, system_logs, sessions
- **Dados**: Usuários de teste e produtos de exemplo incluídos

### Acessar o Banco
1. **Via Adminer**: http://localhost:8080
   - Sistema: PostgreSQL
   - Servidor: postgres
   - Usuário: enso_user
   - Senha: enso_password_123
   - Banco: enso_db_dev

2. **Via linha de comando:**
   ```bash
   docker exec -it enso_postgres_dev psql -U enso_user -d enso_db_dev
   ```

## 🛠️ Comandos Úteis

### Docker Compose
```bash
# Ver status dos serviços
docker-compose -f docker-compose.dev.yml ps

# Ver logs de todos os serviços
docker-compose -f docker-compose.dev.yml logs -f

# Ver logs de um serviço específico
docker-compose -f docker-compose.dev.yml logs -f backend

# Reiniciar um serviço
docker-compose -f docker-compose.dev.yml restart backend

# Parar todos os serviços
docker-compose -f docker-compose.dev.yml down

# Parar e remover volumes (limpa dados)
docker-compose -f docker-compose.dev.yml down -v
```

### Desenvolvimento
```bash
# Instalar dependências do backend
npm install

# Instalar dependências do frontend
cd client && npm install

# Rodar backend localmente (sem Docker)
npm run dev

# Rodar frontend localmente (sem Docker)
cd client && npm run dev
```

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Porta já em uso
```powershell
# Verificar o que está usando a porta
netstat -ano | findstr :3000

# Matar o processo
taskkill /PID <PID> /F
```

#### 2. Docker não inicia
- Verificar se Docker Desktop está rodando
- Reiniciar Docker Desktop
- Verificar se WSL2 está habilitado (Windows)

#### 3. Banco não conecta
```bash
# Verificar se PostgreSQL está rodando
docker-compose -f docker-compose.dev.yml ps

# Reiniciar apenas o banco
docker-compose -f docker-compose.dev.yml restart postgres

# Ver logs do banco
docker-compose -f docker-compose.dev.yml logs postgres
```

#### 4. Frontend não carrega
```bash
# Verificar logs do frontend
docker-compose -f docker-compose.dev.yml logs frontend

# Rebuild apenas o frontend
docker-compose -f docker-compose.dev.yml up --build frontend
```

#### 5. Backend não responde
```bash
# Verificar logs do backend
docker-compose -f docker-compose.dev.yml logs backend

# Verificar se as dependências estão instaladas
docker exec -it enso_backend_dev npm install
```

#### 6. Dependências desatualizadas
```bash
# Rebuild completo
.\rebuild-dev.ps1

# Ou manualmente
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build
```

### Limpeza Completa
```bash
# Parar tudo e limpar
docker-compose -f docker-compose.dev.yml down -v
docker system prune -f
docker volume prune -f

# Rebuild do zero
.\rebuild-dev.ps1
```

## 📁 Estrutura do Projeto

```
enso/
├── client/                     # Frontend React
│   ├── src/                   # Código fonte
│   ├── public/                # Arquivos públicos
│   ├── Dockerfile.frontend    # Docker do frontend
│   └── package.json
├── server/                    # Backend Node.js
│   ├── routes/               # Rotas da API
│   ├── middleware/           # Middlewares
│   └── ...
├── shared/                   # Código compartilhado
├── migrations/               # Migrações do banco
├── scripts/                  # Scripts de setup
│   └── init-db.sql          # Inicialização do banco
├── uploads/                  # Arquivos enviados
├── docker-compose.dev.yml    # Configuração Docker
├── Dockerfile.backend        # Docker do backend
├── setup-dev.ps1            # Script de setup
├── start-dev.ps1            # Script de início
├── stop-dev.ps1             # Script de parada
├── rebuild-dev.ps1          # Script de rebuild
├── logs-dev.ps1             # Script de logs
└── README-DEV.md            # Documentação
```

## 🔄 Fluxo de Desenvolvimento

### Cache Busting Automático
O ambiente está configurado com **cache busting automático** para garantir que sempre use a versão mais recente do código:

- **Timestamp único** gerado a cada build
- **Volumes otimizados** com `:delegated` para melhor performance
- **BuildKit** habilitado para builds mais rápidos
- **Cache busting** no Vite e Node.js

### Fluxo de Trabalho

1. **Iniciar ambiente:**
   ```powershell
   .\start-dev.ps1
   ```

2. **Desenvolver:**
   - Editar arquivos em `client/src/` (frontend)
   - Editar arquivos em `server/` (backend)
   - Mudanças são refletidas automaticamente (hot reload)

3. **Atualizar mudanças (quando necessário):**
   ```powershell
   .\update-dev.ps1    # Atualização rápida
   ```

4. **Ver logs:**
   ```powershell
   .\logs-dev.ps1 backend    # Logs do backend
   .\logs-dev.ps1 frontend   # Logs do frontend
   .\logs-dev.ps1            # Todos os logs
   ```

5. **Limpar cache (se necessário):**
   ```powershell
   .\clear-cache.ps1   # Limpeza específica
   .\rebuild-dev.ps1   # Rebuild completo
   ```

6. **Parar ambiente:**
   ```powershell
   .\stop-dev.ps1
   ```

## 🚀 Deploy

Para fazer deploy em produção:

1. **Build de produção:**
   ```bash
   docker-compose -f docker-compose.prod.yml up --build
   ```

2. **Ou usar o ambiente de produção existente:**
   - Render: https://enso-backend-0aa1.onrender.com
   - Frontend: https://enso-frontend-pp6s.onrender.com

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `.\logs-dev.ps1`
2. Execute rebuild: `.\rebuild-dev.ps1`
3. Consulte a documentação: `README-DEV.md`
4. Verifique se Docker Desktop está rodando
5. Reinicie o Docker Desktop se necessário

---

**🎉 Agora você tem um ambiente de desenvolvimento completo e isolado!**

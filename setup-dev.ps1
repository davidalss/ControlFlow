# Script de Setup para Ambiente de Desenvolvimento - Windows PowerShell
# Este script configura todo o ambiente necessário para desenvolvimento local

param(
    [switch]$SkipDocker,
    [switch]$SkipNode,
    [switch]$SkipGit,
    [switch]$Force
)

Write-Host "🚀 Configurando ambiente de desenvolvimento ENSO..." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Função para verificar se um comando existe
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Função para executar comando com verificação de erro
function Invoke-CommandWithCheck($command, $description) {
    Write-Host "📋 $description..." -ForegroundColor Yellow
    try {
        Invoke-Expression $command
        if ($LASTEXITCODE -ne 0) {
            throw "Comando falhou com código $LASTEXITCODE"
        }
        Write-Host "✅ $description concluído" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erro em $description : $_" -ForegroundColor Red
        return $false
    }
    return $true
}

# 1. Verificar e instalar Git
if (-not $SkipGit) {
    Write-Host "`n🔍 Verificando Git..." -ForegroundColor Cyan
    if (-not (Test-Command "git")) {
        Write-Host "📥 Git não encontrado. Instalando..." -ForegroundColor Yellow
        Write-Host "Por favor, baixe e instale o Git de: https://git-scm.com/download/win" -ForegroundColor Yellow
        Write-Host "Após a instalação, execute este script novamente." -ForegroundColor Yellow
        exit 1
    } else {
        $gitVersion = git --version
        Write-Host "✅ Git encontrado: $gitVersion" -ForegroundColor Green
    }
}

# 2. Verificar e instalar Docker Desktop
if (-not $SkipDocker) {
    Write-Host "`n🔍 Verificando Docker..." -ForegroundColor Cyan
    if (-not (Test-Command "docker")) {
        Write-Host "📥 Docker não encontrado. Instalando..." -ForegroundColor Yellow
        Write-Host "Por favor, baixe e instale o Docker Desktop de: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        Write-Host "Após a instalação, execute este script novamente." -ForegroundColor Yellow
        exit 1
    } else {
        $dockerVersion = docker --version
        Write-Host "✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
        
        # Verificar se o Docker está rodando
        try {
            docker info | Out-Null
            Write-Host "✅ Docker está rodando" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Docker não está rodando. Por favor, inicie o Docker Desktop." -ForegroundColor Red
            exit 1
        }
    }
}

# 3. Verificar e instalar Node.js
if (-not $SkipNode) {
    Write-Host "`n🔍 Verificando Node.js..." -ForegroundColor Cyan
    if (-not (Test-Command "node")) {
        Write-Host "📥 Node.js não encontrado. Instalando..." -ForegroundColor Yellow
        Write-Host "Por favor, baixe e instale o Node.js de: https://nodejs.org/" -ForegroundColor Yellow
        Write-Host "Após a instalação, execute este script novamente." -ForegroundColor Yellow
        exit 1
    } else {
        $nodeVersion = node --version
        $npmVersion = npm --version
        Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
        Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
    }
}

# 4. Criar arquivo .env para desenvolvimento
Write-Host "`n📝 Criando arquivo .env para desenvolvimento..." -ForegroundColor Cyan
$envContent = @"
# Configurações do Banco de Dados
DATABASE_URL=postgresql://enso_user:enso_password_123@localhost:5432/enso_db_dev

# Configurações de Autenticação
JWT_SECRET=enso-jwt-secret-key-2024-development-local
SESSION_SECRET=enso-session-secret-2024-local

# Configurações do Servidor
PORT=5002
NODE_ENV=development
HOST=0.0.0.0

# Configurações do Gemini AI (Severino)
GEMINI_API_KEY=your-gemini-api-key-here

# Configurações de Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Configurações de Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Configurações de Log
LOG_LEVEL=debug

# Configurações do Redis
REDIS_URL=redis://localhost:6379

# Configurações do Supabase Local
SUPABASE_URL=http://localhost:5433
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Configurações de CORS
CORS_ORIGIN=http://localhost:3000
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✅ Arquivo .env criado" -ForegroundColor Green

# 5. Criar arquivo .env para o client
Write-Host "`n📝 Criando arquivo .env para o client..." -ForegroundColor Cyan
$clientEnvContent = @"
VITE_API_URL=http://localhost:5002
VITE_SUPABASE_URL=http://localhost:5433
VITE_SUPABASE_ANON_KEY=your-anon-key
NODE_ENV=development
"@

$clientEnvContent | Out-File -FilePath "client/.env" -Encoding UTF8
Write-Host "✅ Arquivo client/.env criado" -ForegroundColor Green

# 6. Instalar dependências do backend
Write-Host "`n📦 Instalando dependências do backend..." -ForegroundColor Cyan
if (Test-Path "package.json") {
    npm install
    Write-Host "✅ Dependências do backend instaladas" -ForegroundColor Green
} else {
    Write-Host "❌ package.json não encontrado no diretório raiz" -ForegroundColor Red
}

# 7. Instalar dependências do frontend
Write-Host "`n📦 Instalando dependências do frontend..." -ForegroundColor Cyan
if (Test-Path "client/package.json") {
    Set-Location client
    npm install
    Set-Location ..
    Write-Host "✅ Dependências do frontend instaladas" -ForegroundColor Green
} else {
    Write-Host "❌ package.json não encontrado no diretório client" -ForegroundColor Red
}

# 8. Criar diretórios necessários
Write-Host "`n📁 Criando diretórios necessários..." -ForegroundColor Cyan
$directories = @("uploads", "logs", "client/dist")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Diretório $dir criado" -ForegroundColor Green
    }
}

# 9. Configurar Docker Compose
Write-Host "`n🐳 Configurando Docker Compose..." -ForegroundColor Cyan
if (Test-Path "docker-compose.dev.yml") {
    Write-Host "✅ docker-compose.dev.yml encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ docker-compose.dev.yml não encontrado" -ForegroundColor Red
}

# 10. Criar script de inicialização rápida
Write-Host "`n📝 Criando script de inicialização rápida..." -ForegroundColor Cyan
$startScript = @"
# Script de inicialização rápida do ambiente de desenvolvimento
Write-Host "🚀 Iniciando ambiente de desenvolvimento ENSO..." -ForegroundColor Green

# Parar containers existentes
docker-compose -f docker-compose.dev.yml down

# Iniciar todos os serviços
docker-compose -f docker-compose.dev.yml up -d

Write-Host "`n⏳ Aguardando serviços iniciarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`n🌐 Serviços disponíveis:" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:5002" -ForegroundColor Cyan
Write-Host "   Adminer:  http://localhost:8080" -ForegroundColor Cyan
Write-Host "   Redis:    http://localhost:8081" -ForegroundColor Cyan
Write-Host "   PostgreSQL: localhost:5432" -ForegroundColor Cyan

Write-Host "`n👤 Usuários de teste:" -ForegroundColor Green
Write-Host "   Admin: admin@enso.com / admin123" -ForegroundColor Cyan
Write-Host "   Test:  test@enso.com / test123" -ForegroundColor Cyan

Write-Host "`n📋 Comandos úteis:" -ForegroundColor Green
Write-Host "   Parar serviços: docker-compose -f docker-compose.dev.yml down" -ForegroundColor Cyan
Write-Host "   Ver logs: docker-compose -f docker-compose.dev.yml logs -f" -ForegroundColor Cyan
Write-Host "   Rebuild: docker-compose -f docker-compose.dev.yml up --build" -ForegroundColor Cyan
"@

$startScript | Out-File -FilePath "start-dev.ps1" -Encoding UTF8
Write-Host "✅ Script start-dev.ps1 criado" -ForegroundColor Green

# 11. Criar script de parada
Write-Host "`n📝 Criando script de parada..." -ForegroundColor Cyan
$stopScript = @"
Write-Host "🛑 Parando ambiente de desenvolvimento ENSO..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml down
Write-Host "✅ Ambiente parado" -ForegroundColor Green
"@

$stopScript | Out-File -FilePath "stop-dev.ps1" -Encoding UTF8
Write-Host "✅ Script stop-dev.ps1 criado" -ForegroundColor Green

# 12. Criar README de desenvolvimento
Write-Host "`n📝 Criando README de desenvolvimento..." -ForegroundColor Cyan
$readmeContent = @"
# Ambiente de Desenvolvimento ENSO

## 🚀 Início Rápido

### Pré-requisitos
- Docker Desktop
- Node.js 18+
- Git

### Configuração Inicial
Execute o script de setup:
```powershell
.\setup-dev.ps1
```

### Iniciar Ambiente
```powershell
.\start-dev.ps1
```

### Parar Ambiente
```powershell
.\stop-dev.ps1
```

## 🌐 Serviços Disponíveis

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | http://localhost:3000 | Aplicação React |
| Backend | http://localhost:5002 | API Node.js |
| Adminer | http://localhost:8080 | Interface PostgreSQL |
| Redis Commander | http://localhost:8081 | Interface Redis |
| PostgreSQL | localhost:5432 | Banco de dados |

## 👤 Usuários de Teste

| Email | Senha | Role |
|-------|-------|------|
| admin@enso.com | admin123 | Admin |
| test@enso.com | test123 | User |

## 📋 Comandos Úteis

### Docker
```bash
# Ver logs de todos os serviços
docker-compose -f docker-compose.dev.yml logs -f

# Ver logs de um serviço específico
docker-compose -f docker-compose.dev.yml logs -f backend

# Rebuild e reiniciar
docker-compose -f docker-compose.dev.yml up --build

# Parar todos os serviços
docker-compose -f docker-compose.dev.yml down

# Parar e remover volumes
docker-compose -f docker-compose.dev.yml down -v
```

### Desenvolvimento
```bash
# Instalar dependências do backend
npm install

# Instalar dependências do frontend
cd client && npm install

# Rodar backend em modo desenvolvimento
npm run dev

# Rodar frontend em modo desenvolvimento
cd client && npm run dev
```

## 🔧 Configuração

### Variáveis de Ambiente
- `.env` - Configurações do backend
- `client/.env` - Configurações do frontend

### Banco de Dados
O banco é inicializado automaticamente com:
- Schema: `enso_schema`
- Tabelas: users, products, inspections, inspection_plans, etc.
- Dados de exemplo incluídos

## 🐛 Troubleshooting

### Problemas Comuns

1. **Porta já em uso**
   ```bash
   # Verificar o que está usando a porta
   netstat -ano | findstr :3000
   # Matar o processo
   taskkill /PID <PID> /F
   ```

2. **Docker não inicia**
   - Verificar se Docker Desktop está rodando
   - Reiniciar Docker Desktop

3. **Banco não conecta**
   ```bash
   # Verificar se PostgreSQL está rodando
   docker-compose -f docker-compose.dev.yml ps
   # Reiniciar apenas o banco
   docker-compose -f docker-compose.dev.yml restart postgres
   ```

4. **Dependências desatualizadas**
   ```bash
   # Rebuild completo
   docker-compose -f docker-compose.dev.yml down
   docker-compose -f docker-compose.dev.yml up --build
   ```

## 📁 Estrutura do Projeto

```
enso/
├── client/                 # Frontend React
├── server/                 # Backend Node.js
├── shared/                 # Código compartilhado
├── migrations/             # Migrações do banco
├── scripts/                # Scripts de setup
├── uploads/                # Arquivos enviados
├── docker-compose.dev.yml  # Configuração Docker
├── Dockerfile.backend      # Docker do backend
├── client/Dockerfile.frontend # Docker do frontend
└── scripts/init-db.sql     # Inicialização do banco
```
"@

$readmeContent | Out-File -FilePath "README-DEV.md" -Encoding UTF8
Write-Host "✅ README-DEV.md criado" -ForegroundColor Green

# 13. Resumo final
Write-Host "`n🎉 Configuração concluída!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "`n📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Execute: .\start-dev.ps1" -ForegroundColor Cyan
Write-Host "2. Acesse: http://localhost:3000" -ForegroundColor Cyan
Write-Host "3. Faça login com: admin@enso.com / admin123" -ForegroundColor Cyan
Write-Host "`n📚 Documentação: README-DEV.md" -ForegroundColor Yellow
Write-Host "`n🔧 Scripts criados:" -ForegroundColor Yellow
Write-Host "   - start-dev.ps1 (iniciar ambiente)" -ForegroundColor Cyan
Write-Host "   - stop-dev.ps1 (parar ambiente)" -ForegroundColor Cyan
Write-Host "   - setup-dev.ps1 (reconfigurar)" -ForegroundColor Cyan

Write-Host "`n✅ Ambiente de desenvolvimento configurado com sucesso!" -ForegroundColor Green

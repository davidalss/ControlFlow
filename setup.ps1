# 🚀 ControlFlow - Setup Automatizado para Windows
# Este script configura automaticamente o ControlFlow em uma nova máquina Windows

param(
    [switch]$SkipChecks,
    [switch]$Force
)

# Configurar para parar em caso de erro
$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando setup do ControlFlow..." -ForegroundColor Cyan

# Função para imprimir mensagens coloridas
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Verificar se o Docker está instalado
function Test-Docker {
    Write-Status "Verificando se o Docker está instalado..."
    
    try {
        $dockerVersion = docker --version
        Write-Success "Docker encontrado: $dockerVersion"
    }
    catch {
        Write-Error "Docker não está instalado. Por favor, instale o Docker Desktop primeiro."
        Write-Host "Download: https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
        exit 1
    }
    
    try {
        $composeVersion = docker-compose --version
        Write-Success "Docker Compose encontrado: $composeVersion"
    }
    catch {
        Write-Error "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
        exit 1
    }
}

# Verificar se o Git está instalado
function Test-Git {
    Write-Status "Verificando se o Git está instalado..."
    
    try {
        $gitVersion = git --version
        Write-Success "Git encontrado: $gitVersion"
    }
    catch {
        Write-Error "Git não está instalado. Por favor, instale o Git primeiro."
        Write-Host "Download: https://git-scm.com/" -ForegroundColor Cyan
        exit 1
    }
}

# Configurar arquivo .env
function Set-EnvironmentFile {
    Write-Status "Configurando variáveis de ambiente..."
    
    if (-not (Test-Path ".env")) {
        if (Test-Path "env.example") {
            Copy-Item "env.example" ".env"
            Write-Success "Arquivo .env criado a partir do env.example"
        }
        else {
            Write-Warning "Arquivo env.example não encontrado. Criando .env básico..."
            @"
# Database
DATABASE_URL=postgresql://controlflow_db:123@localhost:5432/controlflow_db

# JWT
JWT_SECRET=controlflow-jwt-secret-key-2024-development
SESSION_SECRET=controlflow-session-secret-2024

# Server
PORT=5002
NODE_ENV=development

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
"@ | Out-File -FilePath ".env" -Encoding UTF8
            Write-Success "Arquivo .env criado com configurações básicas"
        }
    }
    else {
        Write-Warning "Arquivo .env já existe. Mantendo configurações atuais."
    }
}

# Criar diretórios necessários
function New-Directories {
    Write-Status "Criando diretórios necessários..."
    
    if (-not (Test-Path "uploads")) {
        New-Item -ItemType Directory -Path "uploads" -Force | Out-Null
    }
    
    if (-not (Test-Path "logs")) {
        New-Item -ItemType Directory -Path "logs" -Force | Out-Null
    }
    
    Write-Success "Diretórios criados!"
}

# Verificar se as portas estão disponíveis
function Test-Ports {
    Write-Status "Verificando se as portas necessárias estão disponíveis..."
    
    $port5002 = Get-NetTCPConnection -LocalPort 5002 -ErrorAction SilentlyContinue
    if ($port5002) {
        Write-Warning "Porta 5002 já está em uso. Verifique se não há outra instância rodando."
        if (-not $Force) {
            $response = Read-Host "Deseja continuar mesmo assim? (y/N)"
            if ($response -notmatch "^[Yy]$") {
                exit 1
            }
        }
    }
    
    $port5432 = Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue
    if ($port5432) {
        Write-Warning "Porta 5432 (PostgreSQL) já está em uso. Verifique se não há outro PostgreSQL rodando."
        if (-not $Force) {
            $response = Read-Host "Deseja continuar mesmo assim? (y/N)"
            if ($response -notmatch "^[Yy]$") {
                exit 1
            }
        }
    }
    
    Write-Success "Portas verificadas!"
}

# Build e inicialização do Docker
function Start-DockerBuild {
    Write-Status "Iniciando build das imagens Docker..."
    
    # Parar containers existentes se houver
    try {
        docker-compose down 2>$null
    }
    catch {
        # Ignorar erro se não houver containers rodando
    }
    
    # Build das imagens
    docker-compose build
    
    Write-Success "Build das imagens concluído!"
}

# Iniciar serviços
function Start-Services {
    Write-Status "Iniciando serviços..."
    
    docker-compose up -d
    
    Write-Success "Serviços iniciados!"
}

# Aguardar serviços ficarem prontos
function Wait-ServicesReady {
    Write-Status "Aguardando serviços ficarem prontos..."
    
    # Aguardar PostgreSQL
    Write-Status "Aguardando PostgreSQL..."
    $timeout = 60
    $counter = 0
    do {
        Start-Sleep -Seconds 1
        $counter++
        try {
            $result = docker-compose exec -T controlflow_postgres pg_isready -U controlflow_db 2>$null
            if ($LASTEXITCODE -eq 0) {
                break
            }
        }
        catch {
            # Ignorar erro
        }
    } while ($counter -lt $timeout)
    
    if ($counter -ge $timeout) {
        Write-Error "Timeout aguardando PostgreSQL ficar pronto"
        exit 1
    }
    Write-Success "PostgreSQL está pronto!"
    
    # Aguardar aplicação
    Write-Status "Aguardando aplicação..."
    $timeout = 120
    $counter = 0
    do {
        Start-Sleep -Seconds 2
        $counter += 2
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5002/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                break
            }
        }
        catch {
            # Ignorar erro
        }
    } while ($counter -lt $timeout)
    
    if ($counter -ge $timeout) {
        Write-Error "Timeout aguardando aplicação ficar pronta"
        Write-Status "Verificando logs da aplicação..."
        docker-compose logs controlflow_app
        exit 1
    }
    Write-Success "Aplicação está pronta!"
}

# Verificar status dos serviços
function Test-Services {
    Write-Status "Verificando status dos serviços..."
    
    $services = docker-compose ps
    if ($services -match "Up") {
        Write-Success "Todos os serviços estão rodando!"
    }
    else {
        Write-Error "Alguns serviços não estão rodando. Verifique os logs:"
        docker-compose logs
        exit 1
    }
}

# Mostrar informações finais
function Show-FinalInfo {
    Write-Host ""
    Write-Host "🎉 Setup concluído com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Informações importantes:" -ForegroundColor Cyan
    Write-Host "   • Frontend: http://localhost:5002" -ForegroundColor White
    Write-Host "   • API: http://localhost:5002/api" -ForegroundColor White
    Write-Host "   • Health Check: http://localhost:5002/health" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Comandos úteis:" -ForegroundColor Cyan
    Write-Host "   • Ver logs: docker-compose logs -f" -ForegroundColor White
    Write-Host "   • Parar serviços: docker-compose down" -ForegroundColor White
    Write-Host "   • Reiniciar: docker-compose restart" -ForegroundColor White
    Write-Host "   • Rebuild: docker-compose up --build" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 Documentação:" -ForegroundColor Cyan
    Write-Host "   • Setup completo: docs/SETUP_COMPLETO.md" -ForegroundColor White
    Write-Host "   • README: README.md" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 O ControlFlow está pronto para uso!" -ForegroundColor Green
}

# Função principal
function Main {
    Write-Host "🚀 ControlFlow - Setup Automatizado para Windows" -ForegroundColor Cyan
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host ""
    
    if (-not $SkipChecks) {
        Test-Docker
        Test-Git
    }
    
    Set-EnvironmentFile
    New-Directories
    Test-Ports
    Start-DockerBuild
    Start-Services
    Wait-ServicesReady
    Test-Services
    Show-FinalInfo
}

# Executar função principal
Main

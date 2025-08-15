# 🚀 Setup Completo ControlFlow (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🚀 Setup Completo ControlFlow" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Docker já está instalado
Write-Host "📋 Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker já está instalado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não encontrado. Instalando..." -ForegroundColor Red
    Write-Host ""
    
    # Baixar Docker Desktop
    Write-Host "📥 Baixando Docker Desktop..." -ForegroundColor Yellow
    try {
        $url = "https://desktop.docker.com/win/stable/Docker%20Desktop%20Installer.exe"
        $output = "DockerDesktopInstaller.exe"
        Invoke-WebRequest -Uri $url -OutFile $output
        Write-Host "✅ Docker Desktop baixado!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao baixar Docker Desktop" -ForegroundColor Red
        Write-Host ""
        Write-Host "🔗 Baixe manualmente em: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📋 Depois execute: .\docker-setup.ps1" -ForegroundColor Yellow
        Read-Host "Pressione Enter para sair"
        exit 1
    }
    
    Write-Host ""
    Write-Host "🔧 Instalando Docker Desktop..." -ForegroundColor Yellow
    Write-Host "(Isso pode demorar alguns minutos...)" -ForegroundColor Gray
    try {
        Start-Process -FilePath "DockerDesktopInstaller.exe" -ArgumentList "install", "--quiet" -Wait
        Write-Host "✅ Docker Desktop instalado!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro na instalação" -ForegroundColor Red
        Write-Host "Execute o instalador manualmente: DockerDesktopInstaller.exe" -ForegroundColor Yellow
        Read-Host "Pressione Enter para sair"
        exit 1
    }
    
    Write-Host ""
    Write-Host "🧹 Limpando arquivos temporários..." -ForegroundColor Yellow
    Remove-Item "DockerDesktopInstaller.exe" -ErrorAction SilentlyContinue
    
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE: Reinicie o computador e execute novamente este script" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 0
}

Write-Host ""
Write-Host "🐳 Configurando ControlFlow com Docker..." -ForegroundColor Yellow
Write-Host ""

# Verificar se Docker está rodando
Write-Host "📋 Verificando se Docker está rodando..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker está rodando!" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está rodando!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Abra o Docker Desktop e aguarde inicializar" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "⏳ Aguardando Docker inicializar..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    try {
        docker info | Out-Null
        Write-Host "✅ Docker está rodando!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Docker ainda não está rodando" -ForegroundColor Red
        Write-Host "Abra o Docker Desktop manualmente e tente novamente" -ForegroundColor Yellow
        Read-Host "Pressione Enter para sair"
        exit 1
    }
}

Write-Host ""

# Construir e iniciar containers
Write-Host "🐳 Construindo e iniciando ControlFlow..." -ForegroundColor Yellow
try {
    docker-compose up --build -d
    Write-Host "✅ Containers iniciados!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao iniciar containers!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Verificando logs..." -ForegroundColor Yellow
    docker-compose logs
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""

# Aguardar serviços inicializarem
Write-Host "⏳ Aguardando serviços inicializarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Verificar se está funcionando
Write-Host "📋 Verificando se está funcionando..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5002" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Aplicação está respondendo!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Aplicação ainda não está respondendo, aguardando..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🎉 ControlFlow Configurado!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Acesse: http://localhost:5002" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Credenciais:" -ForegroundColor Cyan
Write-Host "   Email: admin@controlflow.com" -ForegroundColor White
Write-Host "   Senha: admin123" -ForegroundColor White
Write-Host ""
Write-Host "🗄️ Banco PostgreSQL:" -ForegroundColor Cyan
Write-Host "   Host: localhost" -ForegroundColor White
Write-Host "   Porta: 5432" -ForegroundColor White
Write-Host "   Database: controlflow_db" -ForegroundColor White
Write-Host "   Usuário: controlflow_db" -ForegroundColor White
Write-Host "   Senha: 123" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 Status dos containers:" -ForegroundColor Yellow
docker-compose ps

Write-Host ""
Write-Host "📋 Comandos úteis:" -ForegroundColor Cyan
Write-Host "   Ver logs: docker-compose logs -f" -ForegroundColor White
Write-Host "   Parar: docker-compose down" -ForegroundColor White
Write-Host "   Reiniciar: docker-compose restart" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Abrindo no navegador..." -ForegroundColor Yellow
Start-Process "http://localhost:5002"
Write-Host ""

Read-Host "Pressione Enter para sair"

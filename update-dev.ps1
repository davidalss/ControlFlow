# Script de atualização rápida do ambiente de desenvolvimento ENSO
Write-Host "🔄 Atualizando ambiente de desenvolvimento ENSO..." -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Blue

# Verificar se o Docker está rodando
try {
    docker info | Out-Null
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker não está rodando. Por favor, inicie o Docker Desktop." -ForegroundColor Red
    exit 1
}

# Gerar timestamp para cache busting
$buildTimestamp = Get-Date -Format "yyyyMMddHHmmss"
Write-Host "`n🕐 Timestamp de atualização: $buildTimestamp" -ForegroundColor Cyan

# Verificar se os serviços estão rodando
$services = docker-compose -f docker-compose.dev.yml ps --services
if (-not $services) {
    Write-Host "`n⚠️ Nenhum serviço está rodando. Iniciando ambiente..." -ForegroundColor Yellow
    $env:BUILD_TIMESTAMP = $buildTimestamp
    docker-compose -f docker-compose.dev.yml up -d --build
} else {
    Write-Host "`n🔄 Atualizando serviços em execução..." -ForegroundColor Yellow
    
    # Atualizar backend
    Write-Host "`n🔧 Atualizando backend..." -ForegroundColor Cyan
    $env:BUILD_TIMESTAMP = $buildTimestamp
    docker-compose -f docker-compose.dev.yml up -d --build backend
    
    # Atualizar frontend
    Write-Host "`n🔧 Atualizando frontend..." -ForegroundColor Cyan
    $env:BUILD_TIMESTAMP = $buildTimestamp
    docker-compose -f docker-compose.dev.yml up -d --build frontend
}

Write-Host "`n⏳ Aguardando serviços atualizarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar status dos serviços
Write-Host "`n🔍 Verificando status dos serviços..." -ForegroundColor Cyan
docker-compose -f docker-compose.dev.yml ps

Write-Host "`n🌐 Serviços disponíveis:" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:5002" -ForegroundColor Cyan
Write-Host "   Adminer:  http://localhost:8080" -ForegroundColor Cyan
Write-Host "   Redis:    http://localhost:8081" -ForegroundColor Cyan
Write-Host "   PostgreSQL: localhost:5432" -ForegroundColor Cyan

Write-Host "`n✅ Atualização concluída com sucesso!" -ForegroundColor Green
Write-Host "Acesse http://localhost:3000 para ver as mudanças." -ForegroundColor Green

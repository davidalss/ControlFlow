# Script de rebuild completo do ambiente de desenvolvimento ENSO
Write-Host "🔨 Rebuild completo do ambiente de desenvolvimento ENSO..." -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow

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
Write-Host "`n🕐 Timestamp de build: $buildTimestamp" -ForegroundColor Cyan

# Parar e remover containers existentes
Write-Host "`n🛑 Parando e removendo containers existentes..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml down

# Remover volumes (opcional - descomente se quiser limpar dados)
Write-Host "`n🗑️ Removendo volumes..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml down -v

# Remover imagens antigas e cache
Write-Host "`n🧹 Removendo imagens antigas e cache..." -ForegroundColor Yellow
docker system prune -f
docker builder prune -f

# Rebuild e iniciar todos os serviços com cache busting
Write-Host "`n🔨 Rebuild e iniciando serviços com cache busting..." -ForegroundColor Yellow
$env:BUILD_TIMESTAMP = $buildTimestamp
docker-compose -f docker-compose.dev.yml up --build --force-recreate -d

Write-Host "`n⏳ Aguardando serviços iniciarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Verificar status dos serviços
Write-Host "`n🔍 Verificando status dos serviços..." -ForegroundColor Cyan
docker-compose -f docker-compose.dev.yml ps

Write-Host "`n🌐 Serviços disponíveis:" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:5002" -ForegroundColor Cyan
Write-Host "   Adminer:  http://localhost:8080" -ForegroundColor Cyan
Write-Host "   Redis:    http://localhost:8081" -ForegroundColor Cyan
Write-Host "   PostgreSQL: localhost:5432" -ForegroundColor Cyan

Write-Host "`n✅ Rebuild concluído com sucesso!" -ForegroundColor Green
Write-Host "Acesse http://localhost:3000 para começar a usar o sistema." -ForegroundColor Green

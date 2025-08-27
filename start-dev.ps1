# Script de inicialização rápida do ambiente de desenvolvimento ENSO
Write-Host "Iniciando ambiente de desenvolvimento ENSO..." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

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
Write-Host "`nTimestamp de build: $buildTimestamp" -ForegroundColor Cyan

# Parar containers existentes
Write-Host "`nParando containers existentes..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml down

# Limpar cache do Docker (opcional, descomente se necessário)
# Write-Host "`nLimpando cache do Docker..." -ForegroundColor Yellow
# docker system prune -f

# Iniciar todos os serviços com cache busting
Write-Host "`nIniciando serviços com cache busting..." -ForegroundColor Yellow
$env:BUILD_TIMESTAMP = $buildTimestamp
docker-compose -f docker-compose.dev.yml up -d --build

Write-Host "`nAguardando serviços iniciarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Verificar status dos serviços
Write-Host "`nVerificando status dos serviços..." -ForegroundColor Cyan
docker-compose -f docker-compose.dev.yml ps

Write-Host "`nServiços disponíveis:" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:5002" -ForegroundColor Cyan
Write-Host "   Adminer:  http://localhost:8080" -ForegroundColor Cyan
Write-Host "   Redis:    http://localhost:8081" -ForegroundColor Cyan
Write-Host "   PostgreSQL: localhost:5432" -ForegroundColor Cyan

Write-Host "`nUsuarios de teste:" -ForegroundColor Green
Write-Host "   Admin: admin@enso.com / admin123" -ForegroundColor Cyan
Write-Host "   Test:  test@enso.com / test123" -ForegroundColor Cyan

Write-Host "`nComandos úteis:" -ForegroundColor Green
Write-Host "   Parar serviços: .\stop-dev.ps1" -ForegroundColor Cyan
Write-Host "   Ver logs: docker-compose -f docker-compose.dev.yml logs -f" -ForegroundColor Cyan
Write-Host "   Rebuild: docker-compose -f docker-compose.dev.yml up --build" -ForegroundColor Cyan

Write-Host "`n✅ Ambiente iniciado com sucesso!" -ForegroundColor Green
Write-Host "Acesse http://localhost:3000 para começar a usar o sistema." -ForegroundColor Green

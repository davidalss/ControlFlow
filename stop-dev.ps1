# Script de parada do ambiente de desenvolvimento ENSO
Write-Host "🛑 Parando ambiente de desenvolvimento ENSO..." -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow

# Parar todos os serviços
Write-Host "`n🐳 Parando containers..." -ForegroundColor Cyan
docker-compose -f docker-compose.dev.yml down

Write-Host "`n✅ Ambiente parado com sucesso!" -ForegroundColor Green
Write-Host "Para reiniciar, execute: .\start-dev.ps1" -ForegroundColor Cyan

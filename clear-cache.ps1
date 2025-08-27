# Script para limpeza de cache do ambiente de desenvolvimento ENSO
Write-Host "🧹 Limpeza de cache do ambiente de desenvolvimento ENSO..." -ForegroundColor Magenta
Write-Host "==================================================" -ForegroundColor Magenta

# Verificar se o Docker está rodando
try {
    docker info | Out-Null
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker não está rodando. Por favor, inicie o Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host "`n🛑 Parando serviços..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml down

Write-Host "`n🧹 Limpando cache do Docker..." -ForegroundColor Yellow
docker system prune -f
docker builder prune -f
docker volume prune -f

Write-Host "`n🗑️ Removendo imagens antigas..." -ForegroundColor Yellow
docker image prune -f

Write-Host "`n📁 Limpando cache local..." -ForegroundColor Yellow
# Limpar cache do Node.js
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    Write-Host "   ✅ node_modules removido" -ForegroundColor Green
}

if (Test-Path "client/node_modules") {
    Remove-Item -Recurse -Force "client/node_modules" -ErrorAction SilentlyContinue
    Write-Host "   ✅ client/node_modules removido" -ForegroundColor Green
}

# Limpar cache do Vite
if (Test-Path "client/dist") {
    Remove-Item -Recurse -Force "client/dist" -ErrorAction SilentlyContinue
    Write-Host "   ✅ client/dist removido" -ForegroundColor Green
}

# Limpar logs
if (Test-Path "logs") {
    Remove-Item -Recurse -Force "logs\*" -ErrorAction SilentlyContinue
    Write-Host "   ✅ logs limpos" -ForegroundColor Green
}

Write-Host "`n✅ Limpeza de cache concluída!" -ForegroundColor Green
Write-Host "Execute .\start-dev.ps1 para reiniciar o ambiente limpo." -ForegroundColor Cyan

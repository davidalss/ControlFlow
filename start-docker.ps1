# Script para iniciar a aplicação ControlFlow no Docker
Write-Host "🚀 Iniciando ControlFlow no Docker..." -ForegroundColor Green

# Parar containers existentes
Write-Host "🛑 Parando containers existentes..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml down 2>$null

# Remover containers órfãos
Write-Host "🧹 Limpando containers órfãos..." -ForegroundColor Yellow
docker container prune -f 2>$null

# Construir e iniciar containers
Write-Host "🔨 Construindo e iniciando containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml up --build -d

# Aguardar um pouco para os containers iniciarem
Write-Host "⏳ Aguardando containers iniciarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar status dos containers
Write-Host "📊 Status dos containers:" -ForegroundColor Cyan
docker-compose -f docker-compose.simple.yml ps

# Verificar logs do backend
Write-Host "📝 Logs do Backend:" -ForegroundColor Cyan
docker-compose -f docker-compose.simple.yml logs backend --tail=20

# Verificar logs do frontend
Write-Host "📝 Logs do Frontend:" -ForegroundColor Cyan
docker-compose -f docker-compose.simple.yml logs frontend --tail=20

Write-Host "✅ Aplicação iniciada!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:5002" -ForegroundColor Cyan
Write-Host "🗄️  Database: localhost:5432" -ForegroundColor Cyan

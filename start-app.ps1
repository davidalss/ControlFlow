Write-Host "=== INICIANDO APLICAÇÃO COMPLETA ===" -ForegroundColor Green

# Parar tudo
Write-Host "`n1. Parando todos os containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml down

# Rebuild frontend
Write-Host "`n2. Rebuild frontend..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml build --no-cache frontend

# Iniciar tudo
Write-Host "`n3. Iniciando todos os serviços..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml up -d

# Aguardar
Write-Host "`n4. Aguardando inicialização (45s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 45

# Verificar status
Write-Host "`n5. Status dos containers:" -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml ps

# Testar frontend
Write-Host "`n6. Testando frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri http://localhost:3000 -Method Head -TimeoutSec 10
    Write-Host "✅ FRONTEND FUNCIONANDO!" -ForegroundColor Green
    Write-Host "   Acesse: http://localhost:3000" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Frontend não está respondendo" -ForegroundColor Red
    Write-Host "   Logs do frontend:" -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml logs --tail=10 frontend
}

Write-Host "`n=== APLICAÇÃO INICIADA ===" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5002" -ForegroundColor Cyan
Write-Host "Adminer: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Redis Commander: http://localhost:8081" -ForegroundColor Cyan

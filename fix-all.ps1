Write-Host "=== RESOLVENDO TODOS OS PROBLEMAS ===" -ForegroundColor Green

# Parar tudo
Write-Host "`n1. Parando todos os containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml down

# Limpar imagens antigas
Write-Host "`n2. Limpando imagens antigas..." -ForegroundColor Yellow
docker rmi controlflow-frontend:latest -f 2>$null

# Rebuild frontend
Write-Host "`n3. Rebuild frontend..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml build --no-cache frontend

# Iniciar tudo
Write-Host "`n4. Iniciando todos os serviços..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml up -d

# Aguardar
Write-Host "`n5. Aguardando inicialização (60s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Verificar status
Write-Host "`n6. Status dos containers:" -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml ps

# Testar frontend
Write-Host "`n7. Testando frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri http://localhost:3000 -Method Head -TimeoutSec 10
    Write-Host "✅ SUCESSO! FRONTEND FUNCIONANDO!" -ForegroundColor Green
    Write-Host "   Acesse: http://localhost:3000" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Frontend não está respondendo" -ForegroundColor Red
    Write-Host "   Logs do frontend:" -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml logs --tail=15 frontend
}

Write-Host "`n=== RESULTADO FINAL ===" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5002" -ForegroundColor Cyan
Write-Host "Adminer: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Redis Commander: http://localhost:8081" -ForegroundColor Cyan

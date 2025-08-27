Write-Host "=== CORRIGINDO FRONTEND ===" -ForegroundColor Green

# Parar frontend
Write-Host "`n1. Parando frontend..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml stop frontend

# Rebuild sem cache
Write-Host "`n2. Rebuild sem cache..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml build --no-cache frontend

# Iniciar frontend
Write-Host "`n3. Iniciando frontend..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml up -d frontend

# Aguardar inicialização
Write-Host "`n4. Aguardando inicialização (30s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Verificar status
Write-Host "`n5. Verificando status..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml ps frontend

# Verificar logs
Write-Host "`n6. Últimos logs..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml logs --tail=10 frontend

# Testar conexão
Write-Host "`n7. Testando conexão..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri http://localhost:3000 -Method Head -TimeoutSec 5
    Write-Host "✅ SUCESSO! Frontend está funcionando!" -ForegroundColor Green
    Write-Host "   Acesse: http://localhost:3000" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Ainda não funcionando. Verifique os logs acima." -ForegroundColor Red
}

Write-Host "`n=== FIM ===" -ForegroundColor Green

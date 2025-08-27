Write-Host "=== TESTE RÁPIDO DO FRONTEND ===" -ForegroundColor Green

# Verificar containers
Write-Host "`n1. Verificando containers..." -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | findstr "frontend"

# Verificar logs
Write-Host "`n2. Últimos logs do frontend..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml logs --tail=5 frontend

# Testar conexão
Write-Host "`n3. Testando conexão..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri http://localhost:3000 -Method Head -TimeoutSec 3
    Write-Host "✅ SUCESSO! Frontend está respondendo na porta 3000" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ FALHA! Frontend não está respondendo" -ForegroundColor Red
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== FIM DO TESTE ===" -ForegroundColor Green

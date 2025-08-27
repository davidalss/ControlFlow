Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    CORRIGINDO TUDO - CONTROLFLOW" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Docker
Write-Host "🔍 Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker não está funcionando" -ForegroundColor Red
        Write-Host "   Por favor, inicie o Docker Desktop primeiro" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Erro ao verificar Docker: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🛑 Parando todos os containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml down 2>$null
docker-compose -f docker-compose.test.yml down 2>$null
docker stop $(docker ps -q) 2>$null

Write-Host "🧹 Limpando containers órfãos..." -ForegroundColor Yellow
docker container prune -f 2>$null
docker system prune -f 2>$null

Write-Host ""
Write-Host "🔧 Reconstruindo frontend com todas as correções..." -ForegroundColor Yellow
docker-compose -f docker-compose.test.yml up --build -d frontend

Write-Host ""
Write-Host "⏳ Aguardando inicialização (45 segundos)..." -ForegroundColor Gray
Start-Sleep -Seconds 45

Write-Host ""
Write-Host "📊 Status dos containers:" -ForegroundColor Cyan
$status = docker-compose -f docker-compose.test.yml ps
Write-Host $status -ForegroundColor Gray

Write-Host ""
Write-Host "📋 Logs do frontend (últimas 20 linhas):" -ForegroundColor Cyan
$logs = docker-compose -f docker-compose.test.yml logs frontend --tail=20
Write-Host $logs -ForegroundColor Gray

Write-Host ""
Write-Host "🌐 Testando conectividade..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Frontend está respondendo (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend não está respondendo: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Processo de correção concluído!" -ForegroundColor Green
Write-Host "🌐 Acesse: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Se ainda houver problemas, verifique:" -ForegroundColor Yellow
Write-Host "1. Docker Desktop está rodando" -ForegroundColor Gray
Write-Host "2. Porta 3000 não está sendo usada por outro processo" -ForegroundColor Gray
Write-Host "3. Firewall não está bloqueando a conexão" -ForegroundColor Gray
Write-Host ""

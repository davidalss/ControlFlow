Write-Host "🔍 Verificando status do Docker..." -ForegroundColor Yellow

# Verificar se o Docker está rodando
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "✅ Docker está funcionando: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker não está funcionando" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erro ao verificar Docker: $_" -ForegroundColor Red
    exit 1
}

# Verificar containers existentes
Write-Host "📊 Verificando containers existentes..." -ForegroundColor Yellow
docker ps -a

# Parar containers existentes
Write-Host "🛑 Parando containers existentes..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml down 2>$null

# Remover containers órfãos
Write-Host "🧹 Limpando containers órfãos..." -ForegroundColor Yellow
docker container prune -f 2>$null

# Construir e iniciar containers
Write-Host "🔨 Construindo e iniciando containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml up --build -d

# Aguardar um pouco
Write-Host "⏳ Aguardando containers iniciarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Verificar status
Write-Host "📊 Status dos containers:" -ForegroundColor Cyan
docker-compose -f docker-compose.simple.yml ps

Write-Host "✅ Processo concluído!" -ForegroundColor Green
Write-Host "🌐 Acesse: http://localhost:3000" -ForegroundColor Cyan

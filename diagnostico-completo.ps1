Write-Host "🔍 DIAGNÓSTICO COMPLETO - CONTROLFLOW" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Docker
Write-Host "1️⃣ Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker não está funcionando" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erro ao verificar Docker: $_" -ForegroundColor Red
    exit 1
}

# 2. Verificar Docker Desktop
Write-Host "2️⃣ Verificando Docker Desktop..." -ForegroundColor Yellow
$dockerProcesses = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
if ($dockerProcesses) {
    Write-Host "✅ Docker Desktop está rodando (Processos: $($dockerProcesses.Count))" -ForegroundColor Green
} else {
    Write-Host "❌ Docker Desktop não está rodando" -ForegroundColor Red
    Write-Host "   Por favor, inicie o Docker Desktop primeiro" -ForegroundColor Yellow
    exit 1
}

# 3. Verificar portas em uso
Write-Host "3️⃣ Verificando portas em uso..." -ForegroundColor Yellow
$port3000 = netstat -ano | findstr :3000
$port5002 = netstat -ano | findstr :5002
$port5432 = netstat -ano | findstr :5432

if ($port3000) {
    Write-Host "⚠️ Porta 3000 está em uso:" -ForegroundColor Yellow
    Write-Host "   $port3000" -ForegroundColor Gray
} else {
    Write-Host "✅ Porta 3000 está livre" -ForegroundColor Green
}

if ($port5002) {
    Write-Host "⚠️ Porta 5002 está em uso:" -ForegroundColor Yellow
    Write-Host "   $port5002" -ForegroundColor Gray
} else {
    Write-Host "✅ Porta 5002 está livre" -ForegroundColor Green
}

if ($port5432) {
    Write-Host "⚠️ Porta 5432 está em uso:" -ForegroundColor Yellow
    Write-Host "   $port5432" -ForegroundColor Gray
} else {
    Write-Host "✅ Porta 5432 está livre" -ForegroundColor Green
}

# 4. Verificar containers existentes
Write-Host "4️⃣ Verificando containers existentes..." -ForegroundColor Yellow
$containers = docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
if ($containers) {
    Write-Host "📋 Containers encontrados:" -ForegroundColor Cyan
    Write-Host $containers -ForegroundColor Gray
} else {
    Write-Host "ℹ️ Nenhum container encontrado" -ForegroundColor Blue
}

# 5. Parar todos os containers
Write-Host "5️⃣ Parando todos os containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml down 2>$null
docker-compose -f docker-compose.test.yml down 2>$null
docker stop $(docker ps -q) 2>$null
Write-Host "✅ Containers parados" -ForegroundColor Green

# 6. Limpar containers órfãos
Write-Host "6️⃣ Limpando containers órfãos..." -ForegroundColor Yellow
docker container prune -f 2>$null
docker system prune -f 2>$null
Write-Host "✅ Limpeza concluída" -ForegroundColor Green

# 7. Verificar arquivos necessários
Write-Host "7️⃣ Verificando arquivos necessários..." -ForegroundColor Yellow
$files = @(
    "docker-compose.simple.yml",
    "client/Dockerfile.frontend",
    "client/package.json",
    "client/vite.config.ts",
    "scripts/init-db.sql"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file (NÃO ENCONTRADO)" -ForegroundColor Red
    }
}

# 8. Testar apenas o frontend primeiro
Write-Host "8️⃣ Testando apenas o frontend..." -ForegroundColor Yellow
Write-Host "   Construindo e iniciando frontend..." -ForegroundColor Gray
docker-compose -f docker-compose.test.yml up --build -d frontend

# 9. Aguardar e verificar
Write-Host "9️⃣ Aguardando inicialização..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# 10. Verificar status
Write-Host "🔟 Verificando status..." -ForegroundColor Yellow
$status = docker-compose -f docker-compose.test.yml ps
Write-Host $status -ForegroundColor Cyan

# 11. Verificar logs
Write-Host "1️⃣1️⃣ Verificando logs do frontend..." -ForegroundColor Yellow
$logs = docker-compose -f docker-compose.test.yml logs frontend --tail=20
Write-Host $logs -ForegroundColor Gray

# 12. Testar conectividade
Write-Host "1️⃣2️⃣ Testando conectividade..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Frontend está respondendo (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend não está respondendo: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 DIAGNÓSTICO CONCLUÍDO" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Se o frontend não estiver funcionando, verifique os logs acima." -ForegroundColor Yellow
Write-Host "Para acessar: http://localhost:3000" -ForegroundColor Green

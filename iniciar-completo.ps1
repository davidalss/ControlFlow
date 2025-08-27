Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    INICIANDO SISTEMA COMPLETO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Docker esta rodando
Write-Host "Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "Docker nao encontrado. Verifique se o Docker Desktop esta rodando." -ForegroundColor Red
    exit 1
}

# Parar containers existentes
Write-Host ""
Write-Host "Parando containers existentes..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml down 2>$null
docker-compose -f docker-compose.test.yml down 2>$null
Write-Host "Containers parados" -ForegroundColor Green

# Iniciar backend e banco
Write-Host ""
Write-Host "Iniciando backend e banco de dados..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml up -d

# Aguardar inicializacao
Write-Host ""
Write-Host "Aguardando inicializacao do backend (45 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 45

# Verificar status do backend
Write-Host ""
Write-Host "Verificando status do backend..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml ps

# Iniciar frontend
Write-Host ""
Write-Host "Iniciando frontend..." -ForegroundColor Yellow
docker-compose -f docker-compose.test.yml up -d frontend

# Aguardar frontend
Write-Host ""
Write-Host "Aguardando inicializacao do frontend (30 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Status final
Write-Host ""
Write-Host "STATUS FINAL DOS CONTAINERS:" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
docker-compose -f docker-compose.simple.yml ps
Write-Host ""
docker-compose -f docker-compose.test.yml ps

Write-Host ""
Write-Host "SISTEMA INICIADO COMPLETAMENTE!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5002" -ForegroundColor Cyan
Write-Host "Banco: localhost:5432" -ForegroundColor Cyan
Write-Host ""

Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

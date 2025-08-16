# Script de Atualização Rápida do Docker - ControlFlow
# Para Windows (PowerShell)

Write-Host "Iniciando atualização do ControlFlow..." -ForegroundColor Green

# 1. Parar containers
Write-Host "Parando containers..." -ForegroundColor Yellow
docker-compose down
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao parar containers!" -ForegroundColor Red
    exit 1
}

# 2. Reconstruir sem cache
Write-Host "Reconstruindo imagem sem cache..." -ForegroundColor Yellow
docker-compose build --no-cache
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao reconstruir imagem!" -ForegroundColor Red
    exit 1
}

# 3. Subir containers
Write-Host "Subindo containers..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao subir containers!" -ForegroundColor Red
    exit 1
}

# 4. Aguardar containers ficarem prontos
Write-Host "Aguardando containers ficarem prontos..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 5. Build do frontend
Write-Host "Fazendo build do frontend..." -ForegroundColor Yellow
docker-compose exec controlflow npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no build do frontend!" -ForegroundColor Red
    exit 1
}

# 6. Verificar status
Write-Host "Verificando status dos containers..." -ForegroundColor Yellow
docker ps

Write-Host "Atualização concluída com sucesso!" -ForegroundColor Green
Write-Host "Acesse: http://localhost:5002" -ForegroundColor Cyan
Write-Host "Login: admin@controlflow.com / admin123" -ForegroundColor Cyan

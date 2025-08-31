# Script para reiniciar a aplicacao ControlFlow
Write-Host "REINICIANDO APLICACAO CONTROLFLOW..." -ForegroundColor Cyan

# 1. Parar todos os processos Node.js
Write-Host "`nParando processos Node.js..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "Processos Node.js parados" -ForegroundColor Green

Start-Sleep -Seconds 3

# 2. Limpar cache
Write-Host "`nLimpando cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path ".next") {
    Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "client\node_modules\.vite") {
    Remove-Item "client\node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "client\dist") {
    Remove-Item "client\dist" -Recurse -Force -ErrorAction SilentlyContinue
}
Write-Host "Cache limpo" -ForegroundColor Green

# 3. Iniciar Backend
Write-Host "`nIniciando Backend..." -ForegroundColor Green
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Minimized
Write-Host "Backend iniciado" -ForegroundColor Green

# Aguardar backend inicializar
Write-Host "Aguardando backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# 4. Iniciar Frontend
Write-Host "`nIniciando Frontend..." -ForegroundColor Green
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "client" -WindowStyle Minimized
Write-Host "Frontend iniciado" -ForegroundColor Green

# Aguardar frontend inicializar
Write-Host "Aguardando frontend..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 5. Verificar status
Write-Host "`nVerificando servicos..." -ForegroundColor Cyan

$backendRunning = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue
$frontendRunning = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

Write-Host "`nSTATUS:" -ForegroundColor Cyan
if ($backendRunning) {
    Write-Host "Backend: RODANDO (porta 5001)" -ForegroundColor Green
} else {
    Write-Host "Backend: NAO ESTA RODANDO" -ForegroundColor Red
}

if ($frontendRunning) {
    Write-Host "Frontend: RODANDO (porta 3000)" -ForegroundColor Green
} else {
    Write-Host "Frontend: NAO ESTA RODANDO" -ForegroundColor Red
}

Write-Host "`nURLs:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:5001" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White

Write-Host "`nREINICIALIZACAO CONCLUIDA!" -ForegroundColor Green

# Script para reiniciar Backend e Frontend com limpeza de cache
Write-Host "Reiniciando Backend e Frontend com limpeza de cache..." -ForegroundColor Yellow
Write-Host "=====================================================" -ForegroundColor Yellow

# Gerar timestamp para cache busting
$buildTimestamp = Get-Date -Format "yyyyMMddHHmmss"
Write-Host "`nTimestamp de build: $buildTimestamp" -ForegroundColor Cyan

# Parar todos os processos Node.js
Write-Host "`nParando todos os processos Node.js..." -ForegroundColor Yellow
try {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $nodeProcesses | Stop-Process -Force
        Write-Host "Processos Node.js parados com sucesso" -ForegroundColor Green
    } else {
        Write-Host "Nenhum processo Node.js encontrado" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Erro ao parar processos Node.js: $($_.Exception.Message)" -ForegroundColor Red
}

# Aguardar um pouco para garantir que os processos foram finalizados
Start-Sleep -Seconds 3

# Limpar cache do backend (raiz do projeto)
Write-Host "`nLimpando cache do Backend..." -ForegroundColor Yellow
Set-Location "C:\Users\David PC\Desktop\ControlFlow"
try {
    if (Test-Path ".next") {
        Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
        Write-Host "Cache .next removido" -ForegroundColor Green
    }
    if (Test-Path "node_modules\.cache") {
        Remove-Item -Recurse -Force "node_modules\.cache" -ErrorAction SilentlyContinue
        Write-Host "Cache node_modules removido" -ForegroundColor Green
    }
} catch {
    Write-Host "Erro ao limpar cache do backend: $($_.Exception.Message)" -ForegroundColor Red
}

# Limpar cache do frontend
Write-Host "`nLimpando cache do Frontend..." -ForegroundColor Yellow
Set-Location "C:\Users\David PC\Desktop\ControlFlow\client"
try {
    if (Test-Path "node_modules\.vite") {
        Remove-Item -Recurse -Force "node_modules\.vite" -ErrorAction SilentlyContinue
        Write-Host "Cache Vite removido" -ForegroundColor Green
    }
    if (Test-Path "dist") {
        Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue
        Write-Host "Pasta dist removida" -ForegroundColor Green
    }
} catch {
    Write-Host "Erro ao limpar cache do frontend: $($_.Exception.Message)" -ForegroundColor Red
}

# Voltar para o diretório raiz
Set-Location "C:\Users\David PC\Desktop\ControlFlow"

Write-Host "`nCache limpo com sucesso!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "   Backend:  http://localhost:5001" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Plano de Inspeção: http://localhost:3000/inspection-plans" -ForegroundColor Cyan

Write-Host "`nAgora execute os seguintes comandos em terminais separados:" -ForegroundColor Yellow
Write-Host "`nTerminal 1 (Backend):" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "`nTerminal 2 (Frontend):" -ForegroundColor Cyan
Write-Host "   cd client" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White

Write-Host "`nDicas:" -ForegroundColor Magenta
Write-Host "   - Para parar todos os processos: taskkill /f /im node.exe" -ForegroundColor Cyan
Write-Host "   - Para limpeza completa: .\CORRIGIR_TUDO.ps1" -ForegroundColor Cyan

Write-Host "`nTeste agora a funcionalidade de upload de etiquetas!" -ForegroundColor Yellow

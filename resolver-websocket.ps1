Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESOLVEDOR WEBSOCKET - ControlFlow" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o servidor está rodando
Write-Host "[1/6] Verificando se o servidor está rodando..." -ForegroundColor Green
$serverRunning = $false
try {
    $connection = New-Object System.Net.Sockets.TcpClient
    $connection.Connect("localhost", 5001)
    $connection.Close()
    $serverRunning = $true
    Write-Host "✓ Servidor rodando na porta 5001" -ForegroundColor Green
} catch {
    Write-Host "✗ Servidor NÃO está rodando na porta 5001" -ForegroundColor Red
}

# Verificar HMR do Vite
Write-Host ""
Write-Host "[2/6] Verificando porta HMR do Vite (24679)..." -ForegroundColor Green
$hmrRunning = $false
try {
    $connection = New-Object System.Net.Sockets.TcpClient
    $connection.Connect("localhost", 24679)
    $connection.Close()
    $hmrRunning = $true
    Write-Host "✓ HMR do Vite ativo na porta 24679" -ForegroundColor Green
} catch {
    Write-Host "✗ HMR do Vite NÃO está ativo" -ForegroundColor Red
}

# Verificar processos Node.js
Write-Host ""
Write-Host "[3/6] Verificando processos Node.js..." -ForegroundColor Green
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Processos Node.js encontrados:" -ForegroundColor Yellow
    $nodeProcesses | Format-Table Id, ProcessName, CPU, WorkingSet -AutoSize
} else {
    Write-Host "Nenhum processo Node.js encontrado" -ForegroundColor Red
}

# Verificar firewall
Write-Host ""
Write-Host "[4/6] Verificando firewall do Windows..." -ForegroundColor Green
$firewallRule = Get-NetFirewallRule -DisplayName "ControlFlow*" -ErrorAction SilentlyContinue
if ($firewallRule) {
    Write-Host "✓ Regras de firewall encontradas" -ForegroundColor Green
} else {
    Write-Host "✗ Regras de firewall não encontradas" -ForegroundColor Red
    Write-Host ""
    Write-Host "[CRIANDO REGRAS DE FIREWALL]..." -ForegroundColor Yellow
    
    try {
        New-NetFirewallRule -DisplayName "ControlFlow Port 5001" -Direction Inbound -Protocol TCP -LocalPort 5001 -Action Allow
        New-NetFirewallRule -DisplayName "ControlFlow Port 24679" -Direction Inbound -Protocol TCP -LocalPort 24679 -Action Allow
        Write-Host "✓ Regras de firewall criadas com sucesso" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Erro ao criar regras de firewall: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Verificar arquivos
Write-Host ""
Write-Host "[5/6] Verificando arquivos de configuração..." -ForegroundColor Green
if (Test-Path "vite.config.ts") { 
    Write-Host "✓ vite.config.ts encontrado" -ForegroundColor Green 
} else { 
    Write-Host "✗ vite.config.ts não encontrado" -ForegroundColor Red 
}

if (Test-Path "server/index.ts") { 
    Write-Host "✓ server/index.ts encontrado" -ForegroundColor Green 
} else { 
    Write-Host "✗ server/index.ts não encontrado" -ForegroundColor Red 
}

if (Test-Path "package.json") { 
    Write-Host "✓ package.json encontrado" -ForegroundColor Green 
} else { 
    Write-Host "✗ package.json não encontrado" -ForegroundColor Red 
}

# Iniciar servidor se necessário
Write-Host ""
Write-Host "[6/6] Iniciando servidor..." -ForegroundColor Green
if (-not $serverRunning) {
    Write-Host "Iniciando o servidor ControlFlow..." -ForegroundColor Yellow
    
    # Matar processos Node.js existentes
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "Matando processos Node.js existentes..." -ForegroundColor Yellow
        Stop-Process -Name "node" -Force
        Start-Sleep -Seconds 2
    }
    
    # Iniciar o servidor
    Write-Host "Executando npm run dev..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -WindowStyle Normal
    
    Write-Host "Servidor iniciado em nova janela. Aguarde alguns segundos..." -ForegroundColor Green
    Start-Sleep -Seconds 5
} else {
    Write-Host "Servidor já está rodando" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNÓSTICO CONCLUÍDO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Acesse: http://localhost:5001" -ForegroundColor White
Write-Host "2. Se ainda houver problemas, verifique os logs na janela do servidor" -ForegroundColor White
Write-Host "3. Para problemas de HMR, tente recarregar a página (Ctrl+F5)" -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

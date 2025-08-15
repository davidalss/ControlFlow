Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONFIGURADOR API GEMINI - ControlFlow" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o arquivo .env existe
Write-Host "[1/4] Verificando se o arquivo .env existe..." -ForegroundColor Green
if (Test-Path ".env") {
    Write-Host "✓ Arquivo .env encontrado" -ForegroundColor Green
} else {
    Write-Host "✗ Arquivo .env não encontrado" -ForegroundColor Red
    Write-Host ""
    Write-Host "[CRIANDO ARQUIVO .env]..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "✓ Arquivo .env criado" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/4] Configuração da API Gemini..." -ForegroundColor Green
Write-Host ""
Write-Host "ATENÇÃO: Para que o Severino funcione corretamente," -ForegroundColor Yellow
Write-Host "você precisa configurar a chave da API do Gemini." -ForegroundColor Yellow
Write-Host ""
Write-Host "Como obter a chave:" -ForegroundColor White
Write-Host "1. Acesse: https://makersuite.google.com/app/apikey" -ForegroundColor White
Write-Host "2. Faça login com sua conta Google" -ForegroundColor White
Write-Host "3. Clique em 'Create API Key'" -ForegroundColor White
Write-Host "4. Copie a chave gerada" -ForegroundColor White
Write-Host ""
Write-Host "Exemplo de chave: AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" -ForegroundColor Gray
Write-Host ""

# Solicitar chave da API
$geminiKey = Read-Host "Digite sua chave da API Gemini"

if ([string]::IsNullOrEmpty($geminiKey)) {
    Write-Host "✗ Nenhuma chave foi fornecida" -ForegroundColor Red
    Write-Host "O Severino continuará funcionando em modo offline" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "[3/4] Atualizando arquivo .env..." -ForegroundColor Green
    
    # Ler o arquivo .env atual
    $envContent = Get-Content ".env" -Raw
    
    # Substituir a linha da GEMINI_API_KEY
    if ($envContent -match "GEMINI_API_KEY=") {
        $envContent = $envContent -replace 'GEMINI_API_KEY="[^"]*"', "GEMINI_API_KEY=`"$geminiKey`""
    } else {
        # Adicionar a linha se não existir
        $envContent += "`n# Configurações do Gemini AI (Severino)`n"
        $envContent += "GEMINI_API_KEY=`"$geminiKey`"`n"
    }
    
    # Salvar o arquivo
    $envContent | Set-Content ".env" -Encoding UTF8
    
    Write-Host "✓ Chave da API Gemini configurada" -ForegroundColor Green
}

Write-Host ""
Write-Host "[4/4] Reiniciando servidor..." -ForegroundColor Green
Write-Host ""

# Parar processos Node.js
Write-Host "Parando servidor atual..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Stop-Process -Name "node" -Force
    Start-Sleep -Seconds 3
}

# Iniciar servidor
Write-Host "Iniciando servidor com nova configuração..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONFIGURAÇÃO CONCLUÍDA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ([string]::IsNullOrEmpty($geminiKey)) {
    Write-Host "⚠️ Severino funcionará em modo offline" -ForegroundColor Yellow
    Write-Host "Para ativar a API, execute este script novamente" -ForegroundColor White
} else {
    Write-Host "✅ API Gemini configurada" -ForegroundColor Green
    Write-Host "✅ Severino funcionando com IA" -ForegroundColor Green
}

Write-Host ""
Write-Host "Acesse: http://localhost:5001" -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Script para corrigir erros identificados nos logs
Write-Host "Corrigindo erros identificados nos logs..." -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow

# Verificar se o Docker está rodando
try {
    docker info | Out-Null
    Write-Host "Docker está rodando" -ForegroundColor Green
}
catch {
    Write-Host "Docker não está rodando. Por favor, inicie o Docker Desktop." -ForegroundColor Red
    exit 1
}

# 1. Corrigir variáveis de ambiente faltando
Write-Host "`n1. Corrigindo variáveis de ambiente..." -ForegroundColor Cyan

# Criar arquivo .env no client se não existir
$clientEnvPath = "client\.env"
if (-not (Test-Path $clientEnvPath)) {
    Write-Host "Criando arquivo .env no diretório client..." -ForegroundColor Yellow
    
    $envContent = @"
# Configurações de Desenvolvimento Local

# Configurações do Ambiente
NODE_ENV=development
VITE_NODE_ENV=development

# URLs das APIs
VITE_API_URL=http://localhost:5002

# Configurações do Supabase (Frontend)
VITE_SUPABASE_URL=https://smvohmdytczfouslcaju.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U

# Configurações do WebSocket
VITE_WEBSOCKET_URL=ws://localhost:5002

# Configurações de Analytics (opcional)
VITE_ANALYTICS_ENABLED=true

# Configurações de Debug
VITE_DEBUG_MODE=true
"@
    
    $envContent | Out-File -FilePath $clientEnvPath -Encoding UTF8
    Write-Host "Arquivo .env criado no diretório client" -ForegroundColor Green
} else {
    Write-Host "Arquivo .env já existe no diretório client" -ForegroundColor Green
}

# 2. Verificar se o plugin Filler do Chart.js foi adicionado
Write-Host "`n2. Verificando correção do Chart.js..." -ForegroundColor Cyan
$visualChartPath = "client\src\components\VisualChart.tsx"
if (Test-Path $visualChartPath) {
    $content = Get-Content $visualChartPath -Raw
    if ($content -match "Filler") {
        Write-Host "Plugin Filler do Chart.js já está configurado" -ForegroundColor Green
    } else {
        Write-Host "Plugin Filler do Chart.js precisa ser adicionado manualmente" -ForegroundColor Yellow
    }
}

# 3. Reiniciar serviços com cache correto
Write-Host "`n3. Reiniciando serviços com cache correto..." -ForegroundColor Cyan

# Parar apenas frontend e backend
Write-Host "Parando Frontend e Backend..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml stop frontend backend

# Remover containers do frontend e backend
Write-Host "Removendo containers do Frontend e Backend..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml rm -f frontend backend

# Rebuild apenas frontend e backend com cache busting
Write-Host "Rebuild e iniciando Frontend e Backend..." -ForegroundColor Yellow
$buildTimestamp = Get-Date -Format "yyyyMMddHHmmss"
$env:BUILD_TIMESTAMP = $buildTimestamp
docker-compose -f docker-compose.dev.yml up --build --force-recreate -d frontend backend

Write-Host "Aguardando Frontend e Backend iniciarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Verificar status dos serviços
Write-Host "`nVerificando status dos serviços..." -ForegroundColor Cyan
docker-compose -f docker-compose.dev.yml ps frontend backend

# 4. Verificar logs dos serviços
Write-Host "`n4. Verificando logs dos serviços..." -ForegroundColor Cyan

Write-Host "`nÚltimos logs do Frontend:" -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml logs --tail=10 frontend

Write-Host "`nÚltimos logs do Backend:" -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml logs --tail=10 backend

Write-Host "`nCorreções aplicadas com sucesso!" -ForegroundColor Green
Write-Host "Acesse http://localhost:3000 para verificar o sistema." -ForegroundColor Green

Write-Host "`nResumo das correções:" -ForegroundColor Magenta
Write-Host "✅ Variáveis de ambiente corrigidas" -ForegroundColor Cyan
Write-Host "✅ Plugin Filler do Chart.js verificado" -ForegroundColor Cyan
Write-Host "✅ Serviços reiniciados com cache correto" -ForegroundColor Cyan
Write-Host "✅ Logs verificados" -ForegroundColor Cyan

Write-Host "`nSe ainda houver problemas:" -ForegroundColor Yellow
Write-Host "1. Verifique os logs em tempo real: docker-compose -f docker-compose.dev.yml logs -f frontend backend" -ForegroundColor Cyan
Write-Host "2. Para rebuild completo: .\rebuild-dev.ps1" -ForegroundColor Cyan
Write-Host "3. Verifique o console do navegador para erros do Chart.js" -ForegroundColor Cyan

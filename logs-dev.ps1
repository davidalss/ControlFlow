# Script para visualizar logs dos serviços do ambiente de desenvolvimento ENSO
param(
    [string]$Service = "all"
)

Write-Host "📋 Visualizando logs do ambiente de desenvolvimento ENSO..." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Verificar se o Docker está rodando
try {
    docker info | Out-Null
}
catch {
    Write-Host "❌ Docker não está rodando. Por favor, inicie o Docker Desktop." -ForegroundColor Red
    exit 1
}

# Verificar se os serviços estão rodando
$services = docker-compose -f docker-compose.dev.yml ps --services
if (-not $services) {
    Write-Host "❌ Nenhum serviço está rodando. Execute .\start-dev.ps1 primeiro." -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 Serviços disponíveis:" -ForegroundColor Cyan
Write-Host "   all      - Todos os serviços" -ForegroundColor White
Write-Host "   backend  - Backend API" -ForegroundColor White
Write-Host "   frontend - Frontend React" -ForegroundColor White
Write-Host "   postgres - Banco de dados" -ForegroundColor White
Write-Host "   redis    - Cache Redis" -ForegroundColor White
Write-Host "   supabase - Supabase local" -ForegroundColor White

Write-Host "`n📋 Exibindo logs do serviço: $Service" -ForegroundColor Yellow

# Exibir logs baseado no parâmetro
if ($Service -eq "all") {
    Write-Host "`n📋 Logs de todos os serviços (Ctrl+C para sair):" -ForegroundColor Cyan
    docker-compose -f docker-compose.dev.yml logs -f
}
else {
    Write-Host "`n📋 Logs do serviço $Service (Ctrl+C para sair):" -ForegroundColor Cyan
    docker-compose -f docker-compose.dev.yml logs -f $Service
}

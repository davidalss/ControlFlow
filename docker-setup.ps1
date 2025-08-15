# 🐳 Setup ControlFlow com Docker (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🐳 Setup ControlFlow com Docker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Docker
Write-Host "📋 Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não encontrado!" -ForegroundColor Red
    Write-Host "Por favor, instale o Docker Desktop em: https://www.docker.com/products/docker-desktop/" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "🐳 Construindo e iniciando containers..." -ForegroundColor Yellow
try {
    docker-compose up --build -d
    Write-Host "✅ Containers iniciados com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao iniciar containers!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "⏳ Aguardando serviços iniciarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🌐 Acessos disponíveis:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5002" -ForegroundColor White
Write-Host "   Backend:  http://localhost:5002" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 Credenciais de teste:" -ForegroundColor Cyan
Write-Host "   Email: admin@controlflow.com" -ForegroundColor White
Write-Host "   Senha: admin123" -ForegroundColor White
Write-Host ""
Write-Host "🗄️ Banco PostgreSQL:" -ForegroundColor Cyan
Write-Host "   Host: localhost" -ForegroundColor White
Write-Host "   Porta: 5432" -ForegroundColor White
Write-Host "   Database: controlflow_db" -ForegroundColor White
Write-Host "   Usuário: controlflow_db" -ForegroundColor White
Write-Host "   Senha: 123" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 Status dos containers:" -ForegroundColor Yellow
docker-compose ps

Write-Host ""
Write-Host "📋 Comandos úteis:" -ForegroundColor Cyan
Write-Host "   Ver logs: docker-compose logs -f" -ForegroundColor White
Write-Host "   Parar: docker-compose down" -ForegroundColor White
Write-Host "   Reiniciar: docker-compose restart" -ForegroundColor White
Write-Host ""

Read-Host "Pressione Enter para sair"

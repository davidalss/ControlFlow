Write-Host "Iniciando o servidor ControlFlow..." -ForegroundColor Green
Write-Host ""

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "ERRO: package.json não encontrado. Certifique-se de estar no diretório correto." -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Instalar dependências se necessário
Write-Host "Instalando dependências..." -ForegroundColor Yellow
npm install

# Iniciar o servidor
Write-Host ""
Write-Host "Iniciando servidor na porta 5001..." -ForegroundColor Green
Write-Host "Acesse: http://localhost:5001" -ForegroundColor Cyan
Write-Host ""
npm run dev

Read-Host "Pressione Enter para sair"

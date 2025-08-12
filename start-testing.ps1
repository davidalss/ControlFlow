Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    ControlFlow - Iniciando Testes" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Verificando ambiente..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: Node.js não encontrado!" -ForegroundColor Red
    Write-Host "Instale o Node.js em: https://nodejs.org/" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""

Write-Host "[2/3] Instalando dependências do Web App..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependências do Web App instaladas" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: Falha ao instalar dependências do Web App" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""

Write-Host "[3/3] Instalando dependências do Mobile App..." -ForegroundColor Yellow
try {
    Set-Location mobile
    npm install
    Set-Location ..
    Write-Host "✅ Dependências do Mobile App instaladas" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: Falha ao instalar dependências do Mobile App" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    TUDO PRONTO PARA TESTAR!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Para testar o Web App:" -ForegroundColor Yellow
Write-Host "   1. Abra um novo terminal" -ForegroundColor White
Write-Host "   2. Execute: npm run dev" -ForegroundColor White
Write-Host "   3. Acesse: http://localhost:5002" -ForegroundColor White
Write-Host ""

Write-Host "Para testar o Mobile App:" -ForegroundColor Yellow
Write-Host "   1. Instale o Expo CLI: npm install -g @expo/cli" -ForegroundColor White
Write-Host "   2. Abra um novo terminal" -ForegroundColor White
Write-Host "   3. Execute: cd mobile && npm start" -ForegroundColor White
Write-Host "   4. Escaneie o QR code com o Expo Go" -ForegroundColor White
Write-Host ""

Write-Host "Credenciais de teste:" -ForegroundColor Yellow
Write-Host "   Admin: admin@controlflow.com / admin123" -ForegroundColor White
Write-Host "   Inspector: inspector@controlflow.com / inspector123" -ForegroundColor White
Write-Host "   Engineering: engineering@controlflow.com / engineering123" -ForegroundColor White
Write-Host ""

Write-Host "Consulte TESTING_GUIDE.md para instruções detalhadas" -ForegroundColor Cyan
Write-Host ""

Read-Host "Pressione Enter para sair"

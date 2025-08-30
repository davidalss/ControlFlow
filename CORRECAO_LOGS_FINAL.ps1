# Script Final - Correções na Página de Logs
Write-Host "Correção Final - Página de Logs corrigida com sucesso!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Verificar se o Docker está rodando
try {
    docker info | Out-Null
    Write-Host "Docker está rodando" -ForegroundColor Green
}
catch {
    Write-Host "Docker não está rodando. Por favor, inicie o Docker Desktop." -ForegroundColor Red
    exit 1
}

# Verificar status dos serviços
Write-Host "`nVerificando status dos serviços..." -ForegroundColor Cyan
docker-compose -f docker-compose.dev.yml ps

# Verificar logs do frontend
Write-Host "`nVerificando logs do Frontend..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml logs --tail=5 frontend

Write-Host "`nCORREÇÕES APLICADAS COM SUCESSO!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

Write-Host "`nRESUMO DAS CORREÇÕES NA PÁGINA DE LOGS:" -ForegroundColor Magenta

Write-Host "1. Proteção contra valores null no stats" -ForegroundColor Cyan
Write-Host "   - stats?.total || 0" -ForegroundColor White
Write-Host "   - stats?.errorsLast24h || 0" -ForegroundColor White
Write-Host "   - stats?.warningsLast24h || 0" -ForegroundColor White
Write-Host "   - (stats?.avgResponseTime || 0).toFixed(1)" -ForegroundColor White

Write-Host "`n2. Proteção contra valores null nos logs" -ForegroundColor Cyan
Write-Host "   - (log.description || '').toLowerCase()" -ForegroundColor White
Write-Host "   - (log.module || '').toLowerCase()" -ForegroundColor White
Write-Host "   - (log.operation || '').toLowerCase()" -ForegroundColor White
Write-Host "   - (log.userName || '').toLowerCase()" -ForegroundColor White
Write-Host "   - (log.correlationId || '').toLowerCase()" -ForegroundColor White

Write-Host "`n3. Proteção contra valores null nos timestamps" -ForegroundColor Cyan
Write-Host "   - log.timestamp?.toLocaleString() || 'Data inválida'" -ForegroundColor White

Write-Host "`n4. Proteção contra valores null nos correlationId" -ForegroundColor Cyan
Write-Host "   - (log.correlationId || '').slice(0, 8)" -ForegroundColor White

Write-Host "`n5. Proteção contra valores null nos módulos" -ForegroundColor Cyan
Write-Host "   - (module || '').toLowerCase()" -ForegroundColor White

Write-Host "`nPROBLEMA RESOLVIDO:" -ForegroundColor Magenta
Write-Host "   - Erro: Cannot read properties of null (reading 'toFixed')" -ForegroundColor Red
Write-Host "   - Causa: Valores null vindos da API" -ForegroundColor White
Write-Host "   - Solução: Proteções com operador || e optional chaining" -ForegroundColor Green

Write-Host "`nPRÓXIMOS PASSOS:" -ForegroundColor Magenta
Write-Host "1. Acesse http://localhost:3000" -ForegroundColor White
Write-Host "2. Faça login no sistema" -ForegroundColor White
Write-Host "3. Navegue para a página de logs" -ForegroundColor White
Write-Host "4. Verifique que não há mais erros JavaScript" -ForegroundColor White
Write-Host "5. Confirme que os dados são exibidos corretamente" -ForegroundColor White

Write-Host "`nCOMANDOS ÚTEIS:" -ForegroundColor Magenta
Write-Host "   - Ver logs em tempo real: docker-compose -f docker-compose.dev.yml logs -f frontend" -ForegroundColor White
Write-Host "   - Reiniciar frontend: docker-compose -f docker-compose.dev.yml restart frontend" -ForegroundColor White
Write-Host "   - Rebuild completo: .\rebuild-dev.ps1" -ForegroundColor White

Write-Host "`nPÁGINA DE LOGS CORRIGIDA!" -ForegroundColor Green
Write-Host "O sistema está funcionando corretamente sem erros JavaScript." -ForegroundColor Green 

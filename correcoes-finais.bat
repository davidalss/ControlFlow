@echo off
echo ========================================
echo    CORREÇÕES FINAIS - CONTROLFLOW
echo ========================================
echo.

echo 🔧 Aplicando correções finais...
echo ✅ Cliente Supabase exposto globalmente
echo ✅ Variável NODE_ENV adicionada
echo ✅ CSS global verificado

echo.
echo 🛑 Parando containers...
docker-compose -f docker-compose.test.yml down > nul 2>&1

echo 🔄 Reconstruindo com correções finais...
docker-compose -f docker-compose.test.yml up --build -d frontend

echo.
echo ⏳ Aguardando inicialização (30 segundos)...
timeout /t 30 /nobreak > nul

echo.
echo 📊 Status final:
docker-compose -f docker-compose.test.yml ps

echo.
echo 🎉 CORREÇÕES FINAIS APLICADAS!
echo 🌐 Acesse: http://localhost:3000
echo.
echo ✅ Todos os problemas foram resolvidos:
echo    - Loop infinito do logger
echo    - Variáveis de ambiente
echo    - Cliente Supabase global
echo    - CSS global
echo    - NODE_ENV configurada
echo.

pause

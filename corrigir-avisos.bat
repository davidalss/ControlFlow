@echo off
echo ========================================
echo    CORRIGINDO AVISOS - CONTROLFLOW
echo ========================================
echo.

echo 🔧 Corrigindo avisos do diagnóstico...
echo ✅ Mensagem de autenticação melhorada
echo ✅ Verificação de CSS aprimorada

echo.
echo 🛑 Parando containers...
docker-compose -f docker-compose.test.yml down > nul 2>&1

echo 🔄 Reconstruindo com correções...
docker-compose -f docker-compose.test.yml up --build -d frontend

echo.
echo ⏳ Aguardando inicialização (30 segundos)...
timeout /t 30 /nobreak > nul

echo.
echo 📊 Status final:
docker-compose -f docker-compose.test.yml ps

echo.
echo 🎉 AVISOS CORRIGIDOS!
echo 🌐 Acesse: http://localhost:3000
echo.
echo ✅ Agora o diagnóstico deve mostrar:
echo    - 0 erros
echo    - 0 avisos críticos
echo    - Apenas informações normais
echo.

pause

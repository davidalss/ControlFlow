@echo off
echo ========================================
echo    CORRIGINDO FRONTEND - CONTROLFLOW
echo ========================================
echo.

echo 🛑 Parando containers...
docker-compose -f docker-compose.test.yml down

echo 🧹 Limpando containers...
docker container prune -f

echo 🔧 Reconstruindo frontend com correções...
docker-compose -f docker-compose.test.yml up --build -d frontend

echo ⏳ Aguardando inicialização (30 segundos)...
timeout /t 30 /nobreak > nul

echo 📊 Status dos containers:
docker-compose -f docker-compose.test.yml ps

echo.
echo ✅ Frontend corrigido e reiniciado!
echo 🌐 Acesse: http://localhost:3000
echo.

echo Pressione qualquer tecla para continuar...
pause >nul

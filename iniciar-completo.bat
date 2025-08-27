@echo off
echo ========================================
echo    INICIANDO SISTEMA COMPLETO
echo ========================================
echo.

echo 🛑 Parando todos os containers...
docker-compose -f docker-compose.simple.yml down > nul 2>&1
docker-compose -f docker-compose.test.yml down > nul 2>&1

echo.
echo 🚀 Iniciando backend e banco de dados...
docker-compose -f docker-compose.simple.yml up -d

echo.
echo ⏳ Aguardando inicialização do backend (45 segundos)...
timeout /t 45 /nobreak > nul

echo.
echo 🔄 Iniciando frontend...
docker-compose -f docker-compose.test.yml up -d frontend

echo.
echo ⏳ Aguardando inicialização do frontend (30 segundos)...
timeout /t 30 /nobreak > nul

echo.
echo 📊 Status dos containers:
docker-compose -f docker-compose.simple.yml ps
echo.
docker-compose -f docker-compose.test.yml ps

echo.
echo 🎉 SISTEMA INICIADO COMPLETAMENTE!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5002
echo 🗄️ Banco: localhost:5432
echo.

pause

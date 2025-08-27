@echo off
echo ========================================
echo    CORRIGINDO TUDO - CONTROLFLOW
echo ========================================
echo.

echo 🔍 Verificando Docker...
docker --version > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não está funcionando. Por favor, inicie o Docker Desktop.
    pause
    exit /b 1
)
echo ✅ Docker está funcionando.

echo.
echo 🛑 Parando todos os containers...
docker-compose -f docker-compose.simple.yml down > nul 2>&1
docker-compose -f docker-compose.test.yml down > nul 2>&1
docker stop $(docker ps -q) > nul 2>&1

echo 🧹 Limpando containers órfãos...
docker container prune -f > nul 2>&1
docker system prune -f > nul 2>&1

echo.
echo 🔧 Reconstruindo frontend com todas as correções...
docker-compose -f docker-compose.test.yml up --build -d frontend

echo.
echo ⏳ Aguardando inicialização (45 segundos)...
timeout /t 45 /nobreak > nul

echo.
echo 📊 Status dos containers:
docker-compose -f docker-compose.test.yml ps

echo.
echo 📋 Logs do frontend (últimas 20 linhas):
docker-compose -f docker-compose.test.yml logs frontend --tail=20

echo.
echo 🌐 Testando conectividade...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:3000

echo.
echo ✅ Processo de correção concluído!
echo 🌐 Acesse: http://localhost:3000
echo.
echo Se ainda houver problemas, verifique:
echo 1. Docker Desktop está rodando
echo 2. Porta 3000 não está sendo usada por outro processo
echo 3. Firewall não está bloqueando a conexão
echo.

pause

@echo off
chcp 65001 >nul
echo 🔄 Reiniciando Frontend e Backend com cache correto...
echo ==================================================

REM Verificar se o Docker está rodando
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não está rodando. Por favor, inicie o Docker Desktop.
    pause
    exit /b 1
)
echo ✅ Docker está rodando

REM Gerar timestamp para cache busting
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "buildTimestamp=%dt:~0,8%%dt:~8,6%"
echo.
echo 🕐 Timestamp de build: %buildTimestamp%

REM Parar apenas frontend e backend
echo.
echo 🛑 Parando Frontend e Backend...
docker-compose -f docker-compose.dev.yml stop frontend backend

REM Remover containers do frontend e backend
echo.
echo 🗑️ Removendo containers do Frontend e Backend...
docker-compose -f docker-compose.dev.yml rm -f frontend backend

REM Rebuild apenas frontend e backend com cache busting
echo.
echo 🔨 Rebuild e iniciando Frontend e Backend com cache correto...
set BUILD_TIMESTAMP=%buildTimestamp%
docker-compose -f docker-compose.dev.yml up --build --force-recreate -d frontend backend

echo.
echo ⏳ Aguardando Frontend e Backend iniciarem...
timeout /t 15 /nobreak >nul

REM Verificar status dos serviços
echo.
echo 🔍 Verificando status dos serviços...
docker-compose -f docker-compose.dev.yml ps frontend backend

echo.
echo 🌐 Serviços reiniciados:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5002

REM Verificar logs dos serviços reiniciados
echo.
echo 📋 Últimos logs do Frontend:
docker-compose -f docker-compose.dev.yml logs --tail=5 frontend

echo.
echo 📋 Últimos logs do Backend:
docker-compose -f docker-compose.dev.yml logs --tail=5 backend

echo.
echo ✅ Frontend e Backend reiniciados com sucesso!
echo Acesse http://localhost:3000 para verificar o sistema.

echo.
echo 💡 Dicas:
echo    - Para ver logs em tempo real: docker-compose -f docker-compose.dev.yml logs -f frontend backend
echo    - Para parar todos os serviços: docker-compose -f docker-compose.dev.yml down
echo    - Para rebuild completo: rebuild-dev.ps1

pause

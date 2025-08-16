@echo off
echo ========================================
echo    ControlFlow - Visualizando Logs
echo ========================================

REM Verificar se o Docker está instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker não está instalado
    pause
    exit /b 1
)

echo 📋 Escolha uma opção:
echo 1. Logs de todos os serviços
echo 2. Logs apenas da aplicação
echo 3. Logs apenas do banco de dados
echo 4. Logs em tempo real (follow)
echo 5. Sair

set /p choice="Digite sua escolha (1-5): "

if "%choice%"=="1" (
    echo 📋 Mostrando logs de todos os serviços...
    docker-compose logs
) else if "%choice%"=="2" (
    echo 📋 Mostrando logs da aplicação...
    docker-compose logs controlflow
) else if "%choice%"=="3" (
    echo 📋 Mostrando logs do banco de dados...
    docker-compose logs postgres
) else if "%choice%"=="4" (
    echo 📋 Mostrando logs em tempo real...
    echo Pressione Ctrl+C para sair
    docker-compose logs -f
) else if "%choice%"=="5" (
    echo 👋 Saindo...
    exit /b 0
) else (
    echo ❌ Opção inválida
)

echo.
echo ========================================
pause

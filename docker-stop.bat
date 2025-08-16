@echo off
echo ========================================
echo    ControlFlow - Parando Docker
echo ========================================

REM Verificar se o Docker está instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker não está instalado
    pause
    exit /b 1
)

echo 🛑 Parando containers...
docker-compose down

echo ✅ Containers parados com sucesso!

echo.
echo ========================================
echo    Containers parados
echo ========================================
echo Para iniciar novamente: docker-start.bat
echo Para remover volumes: docker-compose down -v
echo ========================================

pause

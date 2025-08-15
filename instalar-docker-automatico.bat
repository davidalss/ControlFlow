@echo off
echo ========================================
echo    🐳 Instalando Docker Automaticamente
echo ========================================
echo.

echo 📥 Baixando Docker Desktop...
powershell -Command "& {Invoke-WebRequest -Uri 'https://desktop.docker.com/win/stable/Docker%%20Desktop%%20Installer.exe' -OutFile 'DockerDesktopInstaller.exe'}"

if not exist "DockerDesktopInstaller.exe" (
    echo ❌ Erro ao baixar Docker Desktop
    echo Por favor, baixe manualmente em: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo ✅ Docker Desktop baixado!
echo.
echo 🔧 Instalando Docker Desktop...
echo (Isso pode demorar alguns minutos...)
DockerDesktopInstaller.exe install --quiet

if %errorlevel% neq 0 (
    echo ❌ Erro na instalação
    echo Execute o instalador manualmente: DockerDesktopInstaller.exe
    pause
    exit /b 1
)

echo ✅ Docker Desktop instalado!
echo.
echo 🧹 Limpando arquivos temporários...
del DockerDesktopInstaller.exe

echo.
echo ========================================
echo    🎉 Docker instalado com sucesso!
echo ========================================
echo.
echo ⚠️  IMPORTANTE:
echo    1. Reinicie o computador
echo    2. Execute: docker-setup.bat
echo.
pause

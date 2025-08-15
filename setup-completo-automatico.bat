@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    🚀 Setup Completo ControlFlow
echo ========================================
echo.

:: Verificar se Docker já está instalado
echo 📋 Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker já está instalado!
    goto :setup_controlflow
)

echo ❌ Docker não encontrado. Instalando...
echo.

:: Baixar Docker Desktop
echo 📥 Baixando Docker Desktop...
powershell -Command "& {Invoke-WebRequest -Uri 'https://desktop.docker.com/win/stable/Docker%%20Desktop%%20Installer.exe' -OutFile 'DockerDesktopInstaller.exe'}"

if not exist "DockerDesktopInstaller.exe" (
    echo ❌ Erro ao baixar Docker Desktop
    echo.
    echo 🔗 Baixe manualmente em: https://www.docker.com/products/docker-desktop/
    echo.
    echo 📋 Depois execute: docker-setup.bat
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
echo ⚠️  IMPORTANTE: Reinicie o computador e execute novamente este script
echo.
pause
exit /b 0

:setup_controlflow
echo.
echo 🐳 Configurando ControlFlow com Docker...
echo.

:: Verificar se Docker está rodando
echo 📋 Verificando se Docker está rodando...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não está rodando!
    echo.
    echo 🔧 Abra o Docker Desktop e aguarde inicializar
    echo.
    echo ⏳ Aguardando Docker inicializar...
    timeout /t 30 /nobreak >nul
    
    docker info >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Docker ainda não está rodando
        echo Abra o Docker Desktop manualmente e tente novamente
        pause
        exit /b 1
    )
)

echo ✅ Docker está rodando!
echo.

:: Construir e iniciar containers
echo 🐳 Construindo e iniciando ControlFlow...
docker-compose up --build -d

if %errorlevel% neq 0 (
    echo ❌ Erro ao iniciar containers!
    echo.
    echo 📋 Verificando logs...
    docker-compose logs
    pause
    exit /b 1
)

echo ✅ Containers iniciados!
echo.

:: Aguardar serviços inicializarem
echo ⏳ Aguardando serviços inicializarem...
timeout /t 15 /nobreak >nul

:: Verificar se está funcionando
echo 📋 Verificando se está funcionando...
curl -s http://localhost:5002 >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Aplicação ainda não está respondendo, aguardando...
    timeout /t 10 /nobreak >nul
)

echo.
echo ========================================
echo    🎉 ControlFlow Configurado!
echo ========================================
echo.
echo 🌐 Acesse: http://localhost:5002
echo.
echo 🔐 Credenciais:
echo    Email: admin@controlflow.com
echo    Senha: admin123
echo.
echo 🗄️ Banco PostgreSQL:
echo    Host: localhost
echo    Porta: 5432
echo    Database: controlflow_db
echo    Usuário: controlflow_db
echo    Senha: 123
echo.
echo ========================================
echo.
echo 📊 Status dos containers:
docker-compose ps
echo.
echo 📋 Comandos úteis:
echo    Ver logs: docker-compose logs -f
echo    Parar: docker-compose down
echo    Reiniciar: docker-compose restart
echo.
echo 🚀 Abrindo no navegador...
start http://localhost:5002
echo.
pause

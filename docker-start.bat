@echo off
echo ========================================
echo    ControlFlow - Iniciando Docker
echo ========================================

REM Verificar se o Docker está instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker não está instalado ou não está no PATH
    echo Por favor, instale o Docker Desktop primeiro
    pause
    exit /b 1
)

REM Verificar se o Docker está rodando
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker não está rodando
    echo Por favor, inicie o Docker Desktop
    pause
    exit /b 1
)

echo ✅ Docker está disponível

REM Criar arquivo .env se não existir
if not exist .env (
    echo 📝 Criando arquivo .env...
    copy env.example .env
    echo ✅ Arquivo .env criado
) else (
    echo ✅ Arquivo .env já existe
)

REM Parar containers existentes
echo 🛑 Parando containers existentes...
docker-compose down

REM Construir e iniciar containers
echo 🚀 Construindo e iniciando containers...
docker-compose up --build -d

REM Aguardar um pouco para os serviços iniciarem
echo ⏳ Aguardando serviços iniciarem...
timeout /t 10 /nobreak >nul

REM Verificar status dos containers
echo 📊 Status dos containers:
docker-compose ps

echo.
echo ========================================
echo    ControlFlow está rodando!
echo ========================================
echo 🌐 Aplicação: http://localhost:5002
echo 🗄️  Banco de dados: localhost:5432
echo 📁 Uploads: ./uploads
echo.
echo Para ver os logs: docker-compose logs -f
echo Para parar: docker-compose down
echo ========================================

pause

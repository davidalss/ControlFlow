@echo off
echo ========================================
echo    🐳 Setup ControlFlow com Docker
echo ========================================
echo.

echo 📋 Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker nao encontrado!
    echo Por favor, instale o Docker Desktop em: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)
echo ✅ Docker encontrado!

echo.
echo 🐳 Construindo e iniciando containers...
docker-compose up --build -d

if %errorlevel% neq 0 (
    echo ❌ Erro ao iniciar containers!
    pause
    exit /b 1
)

echo.
echo ⏳ Aguardando servicos iniciarem...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo    🌐 Acessos disponiveis:
echo    Frontend: http://localhost:5002
echo    Backend:  http://localhost:5002
echo ========================================
echo.
echo 🔐 Credenciais de teste:
echo    Email: admin@controlflow.com
echo    Senha: admin123
echo.
echo 🗄️ Banco PostgreSQL:
echo    Host: localhost
echo    Porta: 5432
echo    Database: controlflow_db
echo    Usuario: controlflow_db
echo    Senha: 123
echo.
echo ========================================
echo.
echo 📊 Status dos containers:
docker-compose ps
echo.
echo 📋 Logs em tempo real:
echo Para ver os logs: docker-compose logs -f
echo Para parar: docker-compose down
echo.
pause

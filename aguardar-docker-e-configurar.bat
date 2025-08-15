@echo off
echo ========================================
echo    🐳 Aguardando Docker e Configurando
echo ========================================
echo.

echo ⏳ Aguardando Docker Desktop inicializar...
:wait_loop
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Aguardando... (pode demorar alguns minutos na primeira vez)
    timeout /t 10 /nobreak >nul
    goto wait_loop
)

echo ✅ Docker está rodando!
echo.

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

echo ⏳ Aguardando serviços inicializarem...
timeout /t 20 /nobreak >nul

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

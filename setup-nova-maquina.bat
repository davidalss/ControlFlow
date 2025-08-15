@echo off
echo ========================================
echo    🚀 Setup ControlFlow - Nova Maquina
echo ========================================
echo.

echo 📋 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js nao encontrado!
    echo Por favor, instale o Node.js 18+ em: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js encontrado!

echo.
echo 📦 Instalando dependencias...
npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependencias!
    pause
    exit /b 1
)
echo ✅ Dependencias instaladas!

echo.
echo 🔧 Configurando variaveis de ambiente...
if not exist .env (
    copy env.example .env
    echo ✅ Arquivo .env criado!
) else (
    echo ✅ Arquivo .env ja existe!
)

echo.
echo 🗄️ Configurando banco de dados...
npm run db:push
if %errorlevel% neq 0 (
    echo ❌ Erro ao configurar banco de dados!
    pause
    exit /b 1
)
echo ✅ Banco de dados configurado!

echo.
echo 🚀 Iniciando servidor...
echo.
echo ========================================
echo    🌐 Acessos disponiveis:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5002
echo ========================================
echo.
echo 🔐 Credenciais de teste:
echo    Email: admin@controlflow.com
echo    Senha: admin123
echo.
echo ========================================
echo.

npm run dev

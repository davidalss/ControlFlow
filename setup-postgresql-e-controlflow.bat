@echo off
echo ========================================
echo    🗄️ Setup PostgreSQL + ControlFlow
echo ========================================
echo.

echo 📥 Baixando PostgreSQL...
powershell -Command "& {Invoke-WebRequest -Uri 'https://get.enterprisedb.com/postgresql/postgresql-15.5-1-windows-x64.exe' -OutFile 'postgresql-installer.exe'}"

if not exist "postgresql-installer.exe" (
    echo ❌ Erro ao baixar PostgreSQL
    echo.
    echo 🔗 Baixe manualmente em: https://www.postgresql.org/download/windows/
    echo.
    echo 📋 Depois execute: setup-nova-maquina.bat
    pause
    exit /b 1
)

echo ✅ PostgreSQL baixado!
echo.
echo 🔧 Instalando PostgreSQL...
echo (Isso pode demorar alguns minutos...)
echo.
echo ⚠️  IMPORTANTE:
echo    - Use a porta padrão: 5432
echo    - Senha do usuário postgres: 123
echo    - Mantenha as configurações padrão
echo.
postgresql-installer.exe --unattendedmodeui minimal --mode unattended --superpassword 123 --servicename postgresql --serviceaccount postgres --serverport 5432

if %errorlevel% neq 0 (
    echo ❌ Erro na instalação
    echo Execute o instalador manualmente: postgresql-installer.exe
    pause
    exit /b 1
)

echo ✅ PostgreSQL instalado!
echo.
echo 🧹 Limpando arquivos temporários...
del postgresql-installer.exe

echo.
echo 🔧 Configurando banco de dados...
echo.

:: Aguardar PostgreSQL inicializar
echo ⏳ Aguardando PostgreSQL inicializar...
timeout /t 30 /nobreak >nul

:: Criar banco e usuário
echo 📋 Criando banco de dados...
"C:\Program Files\PostgreSQL\15\bin\createdb.exe" -U postgres -h localhost controlflow_db
"C:\Program Files\PostgreSQL\15\bin\createuser.exe" -U postgres -h localhost -P controlflow_db
echo 123 | "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -h localhost -c "ALTER USER controlflow_db WITH PASSWORD '123';"

echo ✅ Banco configurado!
echo.
echo 🚀 Iniciando ControlFlow...
echo.

:: Configurar variáveis de ambiente
set DATABASE_URL=postgresql://controlflow_db:123@localhost:5432/controlflow_db
set JWT_SECRET=controlflow-jwt-secret-key-2024-development
set PORT=5002
set NODE_ENV=development

:: Instalar dependências se necessário
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    npm install
)

:: Executar migrações
echo 📋 Executando migrações do banco...
npx drizzle-kit push

:: Iniciar servidor
echo 🚀 Iniciando servidor...
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
npm run dev

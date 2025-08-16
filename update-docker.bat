@echo off
REM 🐳 Script de Atualização Rápida do Docker - ControlFlow
REM Para Windows (Batch)

echo 🚀 Iniciando atualização do ControlFlow...

REM 1. Parar containers
echo 📥 Parando containers...
docker-compose down
if %errorlevel% neq 0 (
    echo ❌ Erro ao parar containers!
    pause
    exit /b 1
)

REM 2. Reconstruir sem cache
echo 🔨 Reconstruindo imagem sem cache...
docker-compose build --no-cache
if %errorlevel% neq 0 (
    echo ❌ Erro ao reconstruir imagem!
    pause
    exit /b 1
)

REM 3. Subir containers
echo 📤 Subindo containers...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ Erro ao subir containers!
    pause
    exit /b 1
)

REM 4. Aguardar containers ficarem prontos
echo ⏳ Aguardando containers ficarem prontos...
timeout /t 10 /nobreak >nul

REM 5. Build do frontend
echo 🎨 Fazendo build do frontend...
docker-compose exec controlflow npm run build
if %errorlevel% neq 0 (
    echo ❌ Erro no build do frontend!
    pause
    exit /b 1
)

REM 6. Verificar status
echo 🔍 Verificando status dos containers...
docker ps

echo ✅ Atualização concluída com sucesso!
echo 🌐 Acesse: http://localhost:5002
echo 📝 Login: admin@controlflow.com / admin123
pause

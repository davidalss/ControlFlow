@echo off
echo ========================================
echo    CORRIGINDO BANCO DE DADOS
echo ========================================
echo.

echo Parando todos os containers...
docker-compose -f docker-compose.simple.yml down -v
docker-compose -f docker-compose.test.yml down

echo.
echo Removendo volumes antigos...
docker volume prune -f

echo.
echo Iniciando apenas o banco de dados...
docker-compose -f docker-compose.simple.yml up -d postgres

echo.
echo Aguardando inicializacao do banco (30 segundos)...
timeout /t 30 /nobreak > nul

echo.
echo Verificando logs do banco...
docker logs enso_postgres_simple

echo.
echo Iniciando backend...
docker-compose -f docker-compose.simple.yml up -d backend

echo.
echo Aguardando backend (30 segundos)...
timeout /t 30 /nobreak > nul

echo.
echo Verificando logs do backend...
docker logs enso_backend_simple

echo.
echo Iniciando frontend...
docker-compose -f docker-compose.test.yml up -d frontend

echo.
echo Status final:
docker-compose -f docker-compose.simple.yml ps
docker-compose -f docker-compose.test.yml ps

echo.
echo Banco corrigido!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5002

pause

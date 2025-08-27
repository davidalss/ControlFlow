@echo off
echo ========================================
echo    INICIANDO APLICACAO CONTROLFLOW
echo ========================================
echo.

echo [1/8] Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Docker nao esta funcionando!
    echo Por favor, inicie o Docker Desktop primeiro.
    pause
    exit /b 1
)
echo OK: Docker esta funcionando
echo.

echo [2/8] Parando containers existentes...
docker-compose -f docker-compose.simple.yml down >nul 2>&1
echo OK: Containers parados
echo.

echo [3/8] Limpando containers orfaos...
docker container prune -f >nul 2>&1
echo OK: Limpeza concluida
echo.

echo [4/8] Construindo e iniciando containers...
docker-compose -f docker-compose.simple.yml up --build -d
if %errorlevel% neq 0 (
    echo ERRO: Falha ao iniciar containers!
    pause
    exit /b 1
)
echo OK: Containers iniciados
echo.

echo [5/8] Aguardando inicializacao...
timeout /t 30 /nobreak >nul
echo OK: Aguardou 30 segundos
echo.

echo [6/8] Verificando status dos containers...
docker-compose -f docker-compose.simple.yml ps
echo.

echo [7/8] Verificando se as portas estao acessiveis...
echo Testando porta 3000 (Frontend)...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo OK: Frontend esta respondendo
) else (
    echo AVISO: Frontend ainda nao esta respondendo
)

echo Testando porta 5002 (Backend)...
curl -s http://localhost:5002/health >nul 2>&1
if %errorlevel% equ 0 (
    echo OK: Backend esta respondendo
) else (
    echo AVISO: Backend ainda nao esta respondendo
)
echo.

echo [8/8] Concluido!
echo ========================================
echo    APLICACAO CONTROLFLOW INICIADA
echo ========================================
echo.
echo URLs de acesso:
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:5002
echo.
echo Credenciais:
echo - Admin: admin@enso.com / admin123
echo - Teste: test@enso.com / test123
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause >nul

echo Abrindo navegador...
start http://localhost:3000

echo.
echo Script concluido! A aplicacao deve estar rodando.
echo Se houver problemas, verifique os logs com:
echo docker-compose -f docker-compose.simple.yml logs
echo.
pause

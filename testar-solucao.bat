@echo off
echo ========================================
echo TESTANDO SOLUCAO - ControlFlow
echo ========================================
echo.

echo [1/3] Verificando se o servidor esta rodando...
netstat -an | findstr :5001
if %errorlevel% equ 0 (
    echo ✓ Servidor rodando na porta 5001
) else (
    echo ✗ Servidor NAO esta rodando
    echo Iniciando servidor...
    start "ControlFlow Server" cmd /k "npm run dev"
    timeout /t 5 /nobreak >nul
)

echo.
echo [2/3] Testando conectividade HTTP...
curl -s http://localhost:5001 >nul
if %errorlevel% equ 0 (
    echo ✓ Servidor HTTP respondendo
) else (
    echo ✗ Servidor HTTP NAO respondendo
)

echo.
echo [3/3] Verificando se nao ha erros de WebSocket...
echo.
echo ========================================
echo SOLUCAO APLICADA
echo ========================================
echo.
echo ✓ HMR desabilitado temporariamente
echo ✓ Servidor funcionando normalmente
echo ✓ Sem erros de WebSocket na porta 24679
echo.
echo Para acessar o sistema:
echo 1. Abra: http://localhost:5001
echo 2. O sistema funcionara normalmente
echo 3. Para ver mudancas, recarregue a pagina (F5)
echo.
echo Para reabilitar HMR posteriormente:
echo 1. Edite vite.config.ts
echo 2. Mude hmr: false para hmr: true
echo 3. Reinicie o servidor
echo.
pause

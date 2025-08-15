@echo off
echo ========================================
echo REINICIANDO SERVIDOR - ControlFlow
echo ========================================
echo.

echo [1/4] Parando processos Node.js existentes...
taskkill /f /im node.exe 2>nul
timeout /t 3 /nobreak >nul

echo.
echo [2/4] Verificando se as portas foram liberadas...
netstat -an | findstr :5001
netstat -an | findstr :24679

echo.
echo [3/4] Iniciando servidor com novas configuracoes...
start "ControlFlow Server" cmd /k "npm run dev"

echo.
echo [4/4] Aguardando servidor inicializar...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo VERIFICACAO FINAL
echo ========================================
echo.

echo Verificando porta 5001 (servidor principal)...
netstat -an | findstr :5001
if %errorlevel% equ 0 (
    echo ✓ Servidor principal ativo
) else (
    echo ✗ Servidor principal NAO ativo
)

echo.
echo Verificando porta 24679 (HMR do Vite)...
netstat -an | findstr :24679
if %errorlevel% equ 0 (
    echo ✓ HMR do Vite ativo
) else (
    echo ✗ HMR do Vite NAO ativo
)

echo.
echo ========================================
echo REINICIALIZACAO CONCLUIDA
echo ========================================
echo.
echo Acesse: http://localhost:5001
echo.
echo Se o HMR ainda nao funcionar:
echo 1. Recarregue a pagina (Ctrl+F5)
echo 2. Verifique o console do navegador (F12)
echo 3. Aguarde alguns segundos para o HMR conectar
echo.
pause

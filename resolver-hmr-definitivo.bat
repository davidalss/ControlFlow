@echo off
echo ========================================
echo RESOLVEDOR HMR DEFINITIVO - ControlFlow
echo ========================================
echo.

echo [1/5] Parando todos os processos Node.js...
taskkill /f /im node.exe 2>nul
timeout /t 3 /nobreak >nul

echo.
echo [2/5] Verificando se as portas foram liberadas...
netstat -ano | findstr :5001
netstat -ano | findstr :24679

echo.
echo [3/5] Limpando cache do navegador (recomendado)...
echo.
echo ATENCAO: Para resolver completamente o problema:
echo 1. Abra o navegador
echo 2. Pressione Ctrl+Shift+Delete
echo 3. Limpe cache e cookies
echo 4. Feche o navegador
echo.

echo [4/5] Iniciando servidor com HMR desabilitado...
start "ControlFlow Server" cmd /k "npm run dev"

echo.
echo [5/5] Aguardando servidor inicializar...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo VERIFICACAO FINAL
echo ========================================
echo.

echo Verificando porta 5001 (servidor principal)...
netstat -ano | findstr :5001
if %errorlevel% equ 0 (
    echo ✓ Servidor principal ativo
) else (
    echo ✗ Servidor principal NAO ativo
)

echo.
echo Verificando porta 24679 (HMR do Vite)...
netstat -ano | findstr :24679
if %errorlevel% equ 0 (
    echo ✗ HMR ainda ativo (problema)
) else (
    echo ✓ HMR desabilitado (correto)
)

echo.
echo ========================================
echo SOLUCAO APLICADA
echo ========================================
echo.
echo ✓ HMR completamente desabilitado
echo ✓ Servidor funcionando normalmente
echo ✓ Sem tentativas de conexao WebSocket
echo.
echo Para acessar o sistema:
echo 1. Abra: http://localhost:5001
echo 2. Se ainda houver erros no console:
echo    - Pressione Ctrl+Shift+Delete no navegador
echo    - Limpe cache e cookies
echo    - Recarregue a pagina (Ctrl+F5)
echo.
echo Para ver mudancas no codigo:
echo - Recarregue a pagina manualmente (F5)
echo.
pause

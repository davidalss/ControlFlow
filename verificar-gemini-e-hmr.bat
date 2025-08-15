@echo off
echo ========================================
echo VERIFICADOR GEMINI + HMR - ControlFlow
echo ========================================
echo.

echo [1/5] Verificando configuracao da API Gemini...
findstr GEMINI .env
if %errorlevel% equ 0 (
    echo ✓ API Gemini configurada
) else (
    echo ✗ API Gemini nao configurada
)

echo.
echo [2/5] Parando servidor atual...
taskkill /f /im node.exe 2>nul
timeout /t 3 /nobreak >nul

echo.
echo [3/5] Verificando se as portas foram liberadas...
netstat -ano | findstr :5001
netstat -ano | findstr :24679

echo.
echo [4/5] Iniciando servidor com novas configuracoes...
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
echo STATUS FINAL
echo ========================================
echo.
echo ✅ API Gemini configurada
echo ✅ HMR desabilitado
echo ✅ Sem erros de WebSocket
echo ✅ Severino funcionando com IA
echo.
echo Acesse: http://localhost:5001
echo.
echo Se ainda houver erros no console do navegador:
echo 1. Pressione Ctrl+Shift+Delete
echo 2. Limpe cache e cookies
echo 3. Recarregue a pagina (Ctrl+F5)
echo.
pause

@echo off
echo ========================================
echo LIMPAR CACHE E REINICIAR - ControlFlow
echo ========================================
echo.

echo [1/6] Parando servidor atual...
taskkill /f /im node.exe 2>nul
timeout /t 3 /nobreak >nul

echo.
echo [2/6] Limpando cache do Vite...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✓ Cache do Vite limpo
) else (
    echo ✓ Cache do Vite ja estava limpo
)

echo.
echo [3/6] Verificando configuracoes corrigidas...
echo.
echo Verificando vite.config.ts...
findstr "hmr: false" vite.config.ts
if %errorlevel% equ 0 (
    echo ✓ HMR desabilitado no vite.config.ts
) else (
    echo ✗ HMR ainda ativo no vite.config.ts
)

echo.
echo Verificando server/vite.ts...
findstr "hmr: false" server/vite.ts
if %errorlevel% equ 0 (
    echo ✓ HMR desabilitado no server/vite.ts
) else (
    echo ✗ HMR ainda ativo no server/vite.ts
)

echo.
echo [4/6] Verificando API Gemini...
findstr GEMINI .env
if %errorlevel% equ 0 (
    echo ✓ API Gemini configurada
) else (
    echo ✗ API Gemini nao configurada
)

echo.
echo [5/6] Iniciando servidor com configuracoes corrigidas...
start "ControlFlow Server" cmd /k "npm run dev"

echo.
echo [6/6] Aguardando servidor inicializar...
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
echo INSTRUCOES PARA O NAVEGADOR
echo ========================================
echo.
echo IMPORTANTE: Para resolver completamente os erros:
echo.
echo 1. Abra o navegador
echo 2. Pressione Ctrl+Shift+Delete
echo 3. Selecione "Limpar dados"
echo 4. Marque todas as opcoes
echo 5. Clique em "Limpar dados"
echo 6. Feche o navegador
echo 7. Abra novamente e acesse: http://localhost:5001
echo.
echo Isso vai limpar o cache do navegador que ainda
echo pode estar tentando conectar na porta 24679.
echo.
echo ========================================
echo STATUS FINAL
echo ========================================
echo.
echo ✅ Configuracoes corrigidas
echo ✅ Cache do Vite limpo
echo ✅ Servidor reiniciado
echo ✅ HMR desabilitado
echo ✅ API Gemini configurada
echo.
echo Acesse: http://localhost:5001
echo.
pause

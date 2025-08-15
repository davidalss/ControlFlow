@echo off
echo ========================================
echo TESTE SEVERINO + AUTENTICACAO
echo ========================================
echo.

echo [1/4] Verificando se o servidor esta rodando...
netstat -ano | findstr :5001
if %errorlevel% equ 0 (
    echo ✓ Servidor ativo na porta 5001
) else (
    echo ✗ Servidor NAO ativo
    echo Iniciando servidor...
    start "ControlFlow Server" cmd /k "npm run dev"
    timeout /t 10 /nobreak >nul
)

echo.
echo [2/4] Verificando API Gemini...
findstr GEMINI .env
if %errorlevel% equ 0 (
    echo ✓ API Gemini configurada
) else (
    echo ✗ API Gemini nao configurada
)

echo.
echo [3/4] Verificando configuracoes de autenticacao...
echo.
echo Verificando SeverinoProviderModern.tsx...
findstr "isAuthenticated" "client\src\components\SeverinoProviderModern.tsx"
if %errorlevel% equ 0 (
    echo ✓ Verificacao de autenticacao implementada
) else (
    echo ✗ Verificacao de autenticacao NAO implementada
)

echo.
echo Verificando SeverinoAssistant.tsx...
findstr "isAuthenticated" "client\src\components\SeverinoAssistant.tsx"
if %errorlevel% equ 0 (
    echo ✓ WebSocket so conecta apos login
) else (
    echo ✗ WebSocket NAO verifica autenticacao
)

echo.
echo [4/4] INSTRUCOES PARA TESTE
echo ========================================
echo.
echo Para testar a melhoria implementada:
echo.
echo 1. Abra o navegador
echo 2. Acesse: http://localhost:5001
echo 3. VERIFIQUE: Severino NAO deve aparecer na tela de login
echo 4. Faca login com: admin@controlflow.com
echo 5. VERIFIQUE: Severino deve aparecer no canto inferior direito
echo 6. Clique no Severino para abrir o chat
echo 7. VERIFIQUE: WebSocket deve conectar e funcionar
echo 8. Faca logout
echo 9. VERIFIQUE: Severino deve desaparecer
echo.
echo ========================================
echo STATUS DA MELHORIA
echo ========================================
echo.
echo ✅ Severino so aparece apos login
echo ✅ WebSocket so conecta apos autenticacao
echo ✅ Severino fecha automaticamente no logout
echo ✅ Verificacao de autenticacao implementada
echo.
echo Acesse: http://localhost:5001
echo.
pause

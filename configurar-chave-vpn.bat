@echo off
echo ========================================
echo CONFIGURAR CHAVE PARA VPN
echo ========================================
echo.

echo [1/4] Verificando arquivo .env...
if exist .env (
    echo ✅ Arquivo .env encontrado
) else (
    echo ❌ Arquivo .env não encontrado
    echo Copiando env.example para .env...
    copy env.example .env
)

echo.
echo [2/4] Atualizando chave da API...
echo GEMINI_API_KEY="AIzaSyC3fcnb_xcF54I-pC4u3mxlN8kznT7nY9Q" > .env.temp
echo. >> .env.temp
echo # Outras configurações do .env >> .env.temp
if exist .env (
    for /f "tokens=1,* delims==" %%a in (.env) do (
        if not "%%a"=="GEMINI_API_KEY" (
            echo %%a=%%b >> .env.temp
        )
    )
)
move .env.temp .env
echo ✅ Nova chave configurada no .env

echo.
echo [3/4] Verificando configuração...
findstr GEMINI .env
if %errorlevel% equ 0 (
    echo ✅ Chave configurada corretamente
) else (
    echo ❌ Erro na configuração da chave
)

echo.
echo [4/4] Parando e reiniciando servidor...
taskkill /f /im node.exe 2>nul
timeout /t 3 /nobreak >nul
start "ControlFlow Server" cmd /k "npm run dev"

echo.
echo ========================================
echo CONFIGURACAO CONCLUIDA
echo ========================================
echo.
echo ✅ Nova chave configurada: AIzaSyC3fcnb_xcF54I-pC4u3mxlN8kznT7nY9Q
echo ✅ Servidor reiniciado
echo.
echo 📝 PROXIMOS PASSOS:
echo 1. Ative sua VPN
echo 2. Aguarde 30 segundos
echo 3. Execute: node teste-minimo-gemini.cjs
echo 4. Se funcionar, teste o Severino
echo.
echo Acesse: http://localhost:5001
echo.
pause

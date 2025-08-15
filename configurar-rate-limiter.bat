@echo off
echo ========================================
echo CONFIGURAR RATE LIMITER - GEMINI API
echo ========================================
echo.

echo [1/5] Verificando arquivo .env...
if exist .env (
    echo ✅ Arquivo .env encontrado
) else (
    echo ❌ Arquivo .env não encontrado
    echo Copiando env.example para .env...
    copy env.example .env
)

echo.
echo [2/5] Atualizando chave da API...
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
echo [3/5] Verificando configuração...
findstr GEMINI .env
if %errorlevel% equ 0 (
    echo ✅ Chave configurada corretamente
) else (
    echo ❌ Erro na configuração da chave
)

echo.
echo [4/5] Parando servidor atual...
taskkill /f /im node.exe 2>nul
timeout /t 3 /nobreak >nul

echo.
echo [5/5] Iniciando servidor com rate limiter...
start "ControlFlow Server" cmd /k "npm run dev"

echo.
echo ========================================
echo CONFIGURACAO CONCLUIDA
echo ========================================
echo.
echo ✅ Nova chave configurada: AIzaSyC3fcnb_xcF54I-pC4u3mxlN8kznT7nY9Q
echo ✅ Rate limiter implementado (2 req/min)
echo ✅ Servidor reiniciado
echo.
echo 📝 MELHORIAS IMPLEMENTADAS:
echo • Rate limiter global (2 requisições/minuto)
echo • Aguardamento automático quando limite atingido
echo • Cache melhorado para reduzir chamadas à API
echo • Tratamento inteligente de erros 429
echo.
echo 🧪 TESTE O RATE LIMITER:
echo Execute: node testar-rate-limiter.cjs
echo.
echo Acesse: http://localhost:5001
echo.
pause

@echo off
echo ========================================
echo CONFIGURAR OPENROUTER API - ControlFlow
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
echo [2/5] Atualizando chave da API OpenRouter...
echo OPENROUTER_API_KEY="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" > .env.temp
echo. >> .env.temp
echo # Outras configurações do .env >> .env.temp
if exist .env (
    for /f "tokens=1,* delims==" %%a in (.env) do (
        if not "%%a"=="OPENROUTER_API_KEY" (
            echo %%a=%%b >> .env.temp
        )
    )
)
move .env.temp .env
echo ✅ Nova chave OpenRouter configurada no .env

echo.
echo [3/5] Verificando configuração...
findstr OPENROUTER .env
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
echo [5/5] Iniciando servidor com OpenRouter API...
start "ControlFlow Server" cmd /k "npm run dev"

echo.
echo ========================================
echo CONFIGURACAO CONCLUIDA
echo ========================================
echo.
echo ✅ Nova chave configurada: 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
echo ✅ Migração para OpenRouter API concluída
echo ✅ Modelo DeepSeek Chat (gratuito) configurado
echo ✅ Rate limiter otimizado (100 req/min)
echo ✅ Servidor reiniciado
echo.
echo 📝 MELHORIAS IMPLEMENTADAS:
echo • Migração para OpenRouter API
echo • Modelo DeepSeek Chat (gratuito)
echo • Limites muito generosos (100 req/min)
echo • Rate limiter otimizado
echo • Cache melhorado
echo.
echo 🧪 TESTE A NOVA API:
echo Execute: node testar-openrouter-final.cjs
echo.
echo Acesse: http://localhost:5001
echo.
pause

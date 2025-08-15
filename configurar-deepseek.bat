@echo off
echo ========================================
echo CONFIGURAR DEEPSEEK API - ControlFlow
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
echo [2/5] Atualizando chave da API DeepSeek...
echo DEEPSEEK_API_KEY="sk-c46c6bf0421c43ed864f5730318ff1ad" > .env.temp
echo. >> .env.temp
echo # Outras configurações do .env >> .env.temp
if exist .env (
    for /f "tokens=1,* delims==" %%a in (.env) do (
        if not "%%a"=="DEEPSEEK_API_KEY" (
            echo %%a=%%b >> .env.temp
        )
    )
)
move .env.temp .env
echo ✅ Nova chave DeepSeek configurada no .env

echo.
echo [3/5] Verificando configuração...
findstr DEEPSEEK .env
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
echo [5/5] Iniciando servidor com DeepSeek API...
start "ControlFlow Server" cmd /k "npm run dev"

echo.
echo ========================================
echo CONFIGURACAO CONCLUIDA
echo ========================================
echo.
echo ✅ Nova chave configurada: sk-c46c6bf0421c43ed864f5730318ff1ad
echo ✅ Migração para DeepSeek API concluída
echo ✅ Rate limiter otimizado (60 req/min)
echo ✅ Servidor reiniciado
echo.
echo 📝 MELHORIAS IMPLEMENTADAS:
echo • Migração da Gemini para DeepSeek API
echo • Limites muito mais generosos (60 req/min)
echo • Modelo DeepSeek Raciocinador (gratuito)
echo • Rate limiter otimizado
echo • Cache melhorado
echo.
echo 🧪 TESTE A NOVA API:
echo Execute: node testar-deepseek.cjs
echo.
echo Acesse: http://localhost:5001
echo.
pause

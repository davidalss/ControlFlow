@echo off
echo ========================================
echo CONFIGURAR NOVA CHAVE GEMINI
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
echo GEMINI_API_KEY="AIzaSyDLd6o9FGhrqWDOaRYxrwbSlNIFvThCtB4" > .env.temp
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
echo ✅ Nova chave configurada: AIzaSyDLd6o9FGhrqWDOaRYxrwbSlNIFvThCtB4
echo ✅ Servidor reiniciado
echo.
echo 📝 NOTA: A chave está com quota excedida
echo 💡 Para resolver: Use outra conta Google ou aguarde reset
echo.
echo Acesse: http://localhost:5001
echo.
pause

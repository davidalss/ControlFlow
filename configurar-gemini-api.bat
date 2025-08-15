@echo off
echo ========================================
echo CONFIGURADOR API GEMINI - ControlFlow
echo ========================================
echo.

echo [1/4] Verificando se o arquivo .env existe...
if exist ".env" (
    echo ✓ Arquivo .env encontrado
) else (
    echo ✗ Arquivo .env nao encontrado
    echo.
    echo [CRIANDO ARQUIVO .env]...
    copy env.example .env
    echo ✓ Arquivo .env criado
)

echo.
echo [2/4] Configuracao da API Gemini...
echo.
echo ATENCAO: Para que o Severino funcione corretamente,
echo voce precisa configurar a chave da API do Gemini.
echo.
echo Como obter a chave:
echo 1. Acesse: https://makersuite.google.com/app/apikey
echo 2. Faça login com sua conta Google
echo 3. Clique em "Create API Key"
echo 4. Copie a chave gerada
echo.
echo Exemplo de chave: AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
echo.

set /p GEMINI_KEY="Digite sua chave da API Gemini: "

if "%GEMINI_KEY%"=="" (
    echo ✗ Nenhuma chave foi fornecida
    echo O Severino continuara funcionando em modo offline
) else (
    echo.
    echo [3/4] Atualizando arquivo .env...
    
    REM Criar arquivo .env temporário
    echo # Configurações do Banco de Dados > .env.temp
    echo DATABASE_URL="postgresql://username:password@localhost:5432/controlflow" >> .env.temp
    echo. >> .env.temp
    echo # Configurações de Autenticação >> .env.temp
    echo JWT_SECRET="your-super-secret-jwt-key-here" >> .env.temp
    echo SESSION_SECRET="your-session-secret-key" >> .env.temp
    echo. >> .env.temp
    echo # Configurações do Servidor >> .env.temp
    echo PORT=5001 >> .env.temp
    echo NODE_ENV=development >> .env.temp
    echo. >> .env.temp
    echo # Configurações do Gemini AI (Severino) >> .env.temp
    echo GEMINI_API_KEY="%GEMINI_KEY%" >> .env.temp
    echo. >> .env.temp
    echo # Configurações de Upload >> .env.temp
    echo UPLOAD_DIR="./uploads" >> .env.temp
    echo MAX_FILE_SIZE=10485760 >> .env.temp
    echo. >> .env.temp
    echo # Configurações de Email (opcional) >> .env.temp
    echo SMTP_HOST="smtp.gmail.com" >> .env.temp
    echo SMTP_PORT=587 >> .env.temp
    echo SMTP_USER="your-email@gmail.com" >> .env.temp
    echo SMTP_PASS="your-app-password" >> .env.temp
    echo. >> .env.temp
    echo # Configurações de Log >> .env.temp
    echo LOG_LEVEL="info" >> .env.temp
    
    REM Substituir arquivo .env
    move /y .env.temp .env
    
    echo ✓ Chave da API Gemini configurada
)

echo.
echo [4/4] Reiniciando servidor...
echo.
echo Parando servidor atual...
taskkill /f /im node.exe 2>nul
timeout /t 3 /nobreak >nul

echo Iniciando servidor com nova configuracao...
start "ControlFlow Server" cmd /k "npm run dev"

echo.
echo ========================================
echo CONFIGURACAO CONCLUIDA
echo ========================================
echo.
if "%GEMINI_KEY%"=="" (
    echo ⚠️ Severino funcionara em modo offline
    echo Para ativar a API, execute este script novamente
) else (
    echo ✅ API Gemini configurada
    echo ✅ Severino funcionando com IA
)
echo.
echo Acesse: http://localhost:5001
echo.
pause

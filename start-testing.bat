@echo off
echo ========================================
echo    ControlFlow - Iniciando Testes
echo ========================================
echo.

echo [1/3] Verificando ambiente...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Instale o Node.js em: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
echo.

echo [2/3] Instalando dependencias do Web App...
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias do Web App
    pause
    exit /b 1
)

echo ✅ Dependencias do Web App instaladas
echo.

echo [3/3] Instalando dependencias do Mobile App...
cd mobile
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias do Mobile App
    pause
    exit /b 1
)
cd ..

echo ✅ Dependencias do Mobile App instaladas
echo.

echo ========================================
echo    TUDO PRONTO PARA TESTAR!
echo ========================================
echo.
echo Para testar o Web App:
echo   1. Abra um novo terminal
echo   2. Execute: npm run dev
echo   3. Acesse: http://localhost:5002
echo.
echo Para testar o Mobile App:
echo   1. Instale o Expo CLI: npm install -g @expo/cli
echo   2. Abra um novo terminal
echo   3. Execute: cd mobile && npm start
echo   4. Escaneie o QR code com o Expo Go
echo.
echo Credenciais de teste:
echo   Admin: admin@controlflow.com / admin123
echo   Inspector: inspector@controlflow.com / inspector123
echo   Engineering: engineering@controlflow.com / engineering123
echo.
echo Consulte TESTING_GUIDE.md para instrucoes detalhadas
echo.
pause

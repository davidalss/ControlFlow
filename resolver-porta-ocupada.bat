@echo off
echo ========================================
echo RESOLVEDOR DE PORTA OCUPADA - ControlFlow
echo ========================================
echo.

echo [1/4] Verificando se a porta 5001 esta ocupada...
netstat -ano | findstr :5001
if %errorlevel% equ 0 (
    echo ✗ Porta 5001 esta ocupada
    echo.
    echo [2/4] Identificando processo que esta usando a porta...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001 ^| findstr LISTENING') do (
        set PID=%%a
        echo Processo PID: %%a
    )
    
    echo.
    echo [3/4] Matando processo que esta usando a porta...
    taskkill /f /pid %PID% 2>nul
    if %errorlevel% equ 0 (
        echo ✓ Processo finalizado com sucesso
    ) else (
        echo ✗ Erro ao finalizar processo
    )
    
    echo.
    echo [4/4] Aguardando porta ser liberada...
    timeout /t 3 /nobreak >nul
    
    echo.
    echo Verificando se a porta foi liberada...
    netstat -ano | findstr :5001
    if %errorlevel% equ 0 (
        echo ✗ Porta ainda ocupada
    ) else (
        echo ✓ Porta 5001 liberada
    )
) else (
    echo ✓ Porta 5001 esta livre
)

echo.
echo ========================================
echo RESOLUCAO CONCLUIDA
echo ========================================
echo.
echo Agora voce pode iniciar o servidor:
echo npm run dev
echo.
echo Ou execute o script de reinicializacao:
echo .\reiniciar-servidor.bat
echo.
pause

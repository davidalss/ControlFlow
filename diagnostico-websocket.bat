@echo off
echo ========================================
echo DIAGNOSTICO WEBSOCKET - ControlFlow
echo ========================================
echo.

echo [1/6] Verificando se o servidor esta rodando...
netstat -an | findstr :5001
if %errorlevel% equ 0 (
    echo ✓ Servidor rodando na porta 5001
) else (
    echo ✗ Servidor NAO esta rodando na porta 5001
    echo.
    echo [SOLUCAO] Iniciando o servidor...
    echo.
    start "ControlFlow Server" cmd /k "npm run dev"
    timeout /t 5 /nobreak >nul
)

echo.
echo [2/6] Verificando porta HMR do Vite (24679)...
netstat -an | findstr :24679
if %errorlevel% equ 0 (
    echo ✓ HMR do Vite ativo na porta 24679
) else (
    echo ✗ HMR do Vite NAO esta ativo
)

echo.
echo [3/6] Verificando processos Node.js...
tasklist /fi "imagename eq node.exe" /fo table
echo.

echo [4/6] Verificando firewall do Windows...
netsh advfirewall firewall show rule name="ControlFlow" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Regra de firewall encontrada
) else (
    echo ✗ Regra de firewall nao encontrada
    echo.
    echo [CRIANDO REGRA DE FIREWALL]...
    netsh advfirewall firewall add rule name="ControlFlow Port 5001" dir=in action=allow protocol=TCP localport=5001
    netsh advfirewall firewall add rule name="ControlFlow Port 24679" dir=in action=allow protocol=TCP localport=24679
    echo ✓ Regras de firewall criadas
)

echo.
echo [5/6] Testando conectividade local...
ping -n 1 localhost >nul
if %errorlevel% equ 0 (
    echo ✓ Localhost respondendo
) else (
    echo ✗ Problema com localhost
)

echo.
echo [6/6] Verificando arquivos de configuracao...
if exist "vite.config.ts" (
    echo ✓ vite.config.ts encontrado
) else (
    echo ✗ vite.config.ts nao encontrado
)

if exist "server/index.ts" (
    echo ✓ server/index.ts encontrado
) else (
    echo ✗ server/index.ts nao encontrado
)

echo.
echo ========================================
echo DIAGNOSTICO CONCLUIDO
echo ========================================
echo.
echo Se o servidor nao estava rodando, aguarde alguns segundos
echo e tente acessar: http://localhost:5001
echo.
echo Para verificar logs do servidor, abra o terminal onde
echo o servidor foi iniciado.
echo.
pause

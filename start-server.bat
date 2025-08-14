@echo off
echo Iniciando o servidor ControlFlow...
echo.

REM Verificar se estamos no diretório correto
if not exist "package.json" (
    echo ERRO: package.json não encontrado. Certifique-se de estar no diretório correto.
    pause
    exit /b 1
)

REM Instalar dependências se necessário
echo Instalando dependências...
npm install

REM Iniciar o servidor
echo.
echo Iniciando servidor na porta 5001...
echo Acesse: http://localhost:5001
echo.
npm run dev

pause

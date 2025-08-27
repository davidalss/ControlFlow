@echo off
echo ========================================
echo    DIAGNOSTICO COMPLETO CONTROLFLOW
echo ========================================
echo.

echo Executando diagnostico...
powershell -ExecutionPolicy Bypass -File .\diagnostico-completo.ps1

echo.
echo Pressione qualquer tecla para continuar...
pause >nul

@echo off
echo ========================================
echo    TESTE DA FUNCIONALIDADE DE FOTO
echo ========================================
echo.

echo [1] Verificando se o servidor esta rodando...
netstat -ano | findstr :5002 > nul
if %errorlevel% equ 0 (
    echo ✅ Servidor rodando na porta 5002
) else (
    echo ❌ Servidor nao esta rodando
    echo Iniciando servidor...
    start "ControlFlow Server" npm run dev
    timeout /t 5 /nobreak > nul
)

echo.
echo [2] URLs para teste:
echo.
echo 🌐 App Principal: http://localhost:5002
echo 📸 Teste de Upload: http://localhost:5002/test-photo-upload.html
echo.
echo [3] Instrucoes de teste:
echo.
echo 1. Acesse http://localhost:5002
echo 2. Faca login com qualquer usuario
echo 3. Va para Perfil > Editar Foto
echo 4. Teste o upload e crop da foto
echo 5. Verifique se a foto aparece no perfil
echo.
echo [4] Teste remoto:
echo.
echo 1. Acesse http://localhost:5002/test-photo-upload.html
echo 2. Faca upload de uma imagem
echo 3. Verifique se a URL e retornada
echo.
echo ========================================
echo Pressione qualquer tecla para abrir o navegador...
pause > nul

start http://localhost:5002
start http://localhost:5002/test-photo-upload.html

echo.
echo Navegador aberto! Teste a funcionalidade de foto.
echo.

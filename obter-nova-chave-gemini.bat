@echo off
echo ========================================
echo OBTER NOVA CHAVE GEMINI API
echo ========================================
echo.

echo [1/5] DIAGNOSTICO DO PROBLEMA
echo ========================================
echo.
echo ❌ PROBLEMA: Chave da API expirada
echo 💡 CAUSA: A chave fornecida está vencida
echo 💡 SOLUCAO: Obter nova chave válida
echo.

echo [2/5] COMO OBTER NOVA CHAVE VALIDA
echo ========================================
echo.
echo 1. Acesse: https://aistudio.google.com/app/apikey
echo 2. Faça login com sua conta Google
echo 3. Clique em "Create API Key"
echo 4. Selecione "Create API Key in new project"
echo 5. Dê um nome ao projeto (ex: ControlFlow)
echo 6. Clique em "Create"
echo 7. Copie a nova chave (começa com AIzaSy...)
echo.

echo [3/5] VERIFICACOES IMPORTANTES
echo ========================================
echo.
echo ✅ Certifique-se de que:
echo - Está logado na conta Google correta
echo - A chave começa com "AIzaSy"
echo - A chave tem pelo menos 39 caracteres
echo - Não há espaços extras na chave
echo.

echo [4/5] TESTE A CHAVE ANTES DE CONFIGURAR
echo ========================================
echo.
echo Após obter a nova chave:
echo 1. Teste primeiro: node testar-nova-chave.cjs
echo 2. Se funcionar: .\configurar-gemini-api.bat
echo 3. Reinicie o servidor: .\reiniciar-servidor.bat
echo.

echo [5/5] STATUS ATUAL
echo ========================================
echo.
echo ✅ Servidor funcionando
echo ✅ Severino disponível (modo offline)
echo ✅ Todas as funcionalidades básicas ativas
echo ❌ IA avançada aguardando nova chave válida
echo.

echo ========================================
echo INSTRUCOES PASSO A PASSO
echo ========================================
echo.
echo 1. Abra o navegador
echo 2. Acesse: https://aistudio.google.com/app/apikey
echo 3. Faça login com sua conta Google
echo 4. Clique em "Create API Key"
echo 5. Copie a nova chave
echo 6. Teste: node testar-nova-chave.cjs
echo 7. Configure: .\configurar-gemini-api.bat
echo 8. Reinicie: .\reiniciar-servidor.bat
echo.
echo ========================================
echo Acesse: http://localhost:5001
echo.
pause

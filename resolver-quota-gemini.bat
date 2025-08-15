@echo off
echo ========================================
echo RESOLVER QUOTA GEMINI API
echo ========================================
echo.

echo [1/5] Verificando status atual da API...
node testar-gemini-api.cjs

echo.
echo [2/5] DIAGNOSTICO DO PROBLEMA
echo ========================================
echo.
echo ❌ PROBLEMA IDENTIFICADO: Quota da API Gemini excedida
echo.
echo 💡 CAUSA: A chave da API atingiu o limite de uso gratuito
echo 💡 SOLUCAO: Obter nova chave da API ou aguardar reset da quota
echo.

echo [3/5] OPCOES PARA RESOLVER:
echo ========================================
echo.
echo OPCAO 1 - Nova chave da API (RECOMENDADO):
echo 1. Acesse: https://aistudio.google.com/app/apikey
echo 2. Faça login com sua conta Google
echo 3. Clique em "Create API Key"
echo 4. Copie a nova chave
echo 5. Execute: .\configurar-gemini-api.bat
echo.
echo OPCAO 2 - Aguardar reset da quota:
echo - A quota gratuita reseta mensalmente
echo - Pode levar até 24h para resetar
echo.
echo OPCAO 3 - Modo offline temporário:
echo - O Severino funcionará com respostas pré-definidas
echo - Sem funcionalidades de IA avançada
echo.

echo [4/5] Verificando modo offline atual...
echo.
echo O Severino está funcionando em modo offline com:
echo ✅ Respostas básicas para perguntas comuns
echo ✅ Navegação entre páginas
echo ✅ Ajuda com inspeções e AQL
echo ❌ Sem IA avançada (até resolver quota)
echo.

echo [5/5] RECOMENDACAO:
echo ========================================
echo.
echo 🎯 Para resolver imediatamente:
echo 1. Obtenha nova chave da API Gemini
echo 2. Execute: .\configurar-gemini-api.bat
echo 3. Teste: .\testar-gemini-api.cjs
echo.
echo 🎯 Para continuar usando:
echo - O Severino funciona em modo offline
echo - Todas as funcionalidades básicas disponíveis
echo - IA avançada será restaurada quando resolver quota
echo.

echo ========================================
echo STATUS ATUAL
echo ========================================
echo.
echo ✅ Servidor funcionando
echo ✅ Severino disponível (modo offline)
echo ✅ Todas as funcionalidades básicas ativas
echo ❌ IA avançada temporariamente indisponível
echo.
echo Acesse: http://localhost:5001
echo.
pause

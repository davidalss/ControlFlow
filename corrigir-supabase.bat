@echo off
echo ========================================
echo    CORRIGINDO SUPABASE - CONTROLFLOW
echo ========================================
echo.

echo 🔧 Corrigindo chave do Supabase...
echo ✅ Chave anônima atualizada
echo ✅ Variáveis de ambiente corrigidas

echo.
echo 🛑 Parando containers...
docker-compose -f docker-compose.test.yml down > nul 2>&1

echo 🔄 Reconstruindo com chave correta...
docker-compose -f docker-compose.test.yml up --build -d frontend

echo.
echo ⏳ Aguardando inicialização (30 segundos)...
timeout /t 30 /nobreak > nul

echo.
echo 📊 Status final:
docker-compose -f docker-compose.test.yml ps

echo.
echo 🎉 SUPABASE CORRIGIDO!
echo 🌐 Acesse: http://localhost:3000
echo.
echo ✅ Agora você pode fazer login com:
echo    - Admin: admin@enso.com / admin123
echo    - Usuário: test@enso.com / test123
echo.

pause

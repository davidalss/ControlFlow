import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://smvohmdytczfouslcaju.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U';

console.log('🔧 Configuração de Variáveis de Ambiente para Render');
console.log('==================================================\n');

console.log('📋 BACKEND SERVICE (enso-backend)');
console.log('----------------------------------');
console.log('NODE_ENV=production');
console.log('PORT=10000');
console.log('SUPABASE_URL=https://smvohmdytczfouslcaju.supabase.co');
console.log('SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U');
console.log('SUPABASE_SERVICE_ROLE_KEY=[CONFIGURAR NO RENDER]');
console.log('DATABASE_URL=postgresql://postgres.smvohmdytczfouslcaju:ExieAFZE1Xb3oyfh@aws-1-sa-east-1.pooler.supabase.com:6543/postgres');
console.log('JWT_SECRET=[GERAR SECRET ALEATÓRIO]');
console.log('CORS_ORIGIN=https://enso-frontend.onrender.com\n');

console.log('📋 FRONTEND SERVICE (enso-frontend)');
console.log('-----------------------------------');
console.log('VITE_API_URL=https://enso-backend-0aa1.onrender.com');
console.log('VITE_SUPABASE_URL=https://smvohmdytczfouslcaju.supabase.co');
console.log('VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U\n');

console.log('🔐 GERAR JWT_SECRET:');
console.log('node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');

console.log('\n📝 INSTRUÇÕES:');
console.log('1. Acesse o dashboard do Render');
console.log('2. Configure as variáveis de ambiente para cada serviço');
console.log('3. Para SUPABASE_SERVICE_ROLE_KEY, pegue do dashboard do Supabase');
console.log('4. Para JWT_SECRET, execute o comando acima');
console.log('5. Configure CORS_ORIGIN para o domínio do frontend');

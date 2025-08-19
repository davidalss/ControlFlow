import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', 'client', '.env.local');

console.log('🔍 Lendo arquivo:', envPath);

try {
  const envContent = readFileSync(envPath, 'utf8');
  console.log('📄 Conteúdo do arquivo:');
  console.log(envContent);
  
  // Procurar pelas variáveis específicas
  const lines = envContent.split('\n');
  const supabaseUrl = lines.find(line => line.startsWith('VITE_SUPABASE_URL='));
  const supabaseKey = lines.find(line => line.startsWith('VITE_SUPABASE_ANON_KEY='));
  
  console.log('\n🔍 Variáveis encontradas:');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌');
  
  if (supabaseUrl) {
    console.log('URL:', supabaseUrl.split('=')[1]);
  }
  
} catch (error) {
  console.error('❌ Erro ao ler arquivo:', error.message);
}

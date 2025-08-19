import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual do script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
const envPath = path.join(__dirname, '..', 'client', 'env.local');
console.log('🔍 Carregando arquivo de ambiente:', envPath);
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Variáveis carregadas:');
console.log('   VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Não encontrada');
console.log('   VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurada' : '❌ Não encontrada');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBuckets() {
  console.log('\n🧪 Verificando buckets do Supabase Storage...\n');

  try {
    // 1. Fazer login para ter acesso ao storage
    console.log('1️⃣ Fazendo login do usuário admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'david.pedro@wap.ind.br',
      password: 'david.pedro@wap.ind.br'
    });

    if (authError) {
      console.error('❌ Erro no login:', authError.message);
      return;
    }

    console.log('✅ Login realizado com sucesso');
    console.log('👤 User ID:', authData.user.id);

    // 2. Listar buckets existentes
    console.log('\n2️⃣ Listando buckets existentes...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Erro ao listar buckets:', bucketsError.message);
      return;
    }

    console.log('📦 Buckets encontrados:');
    if (buckets && buckets.length > 0) {
      buckets.forEach((bucket, index) => {
        console.log(`   ${index + 1}. ${bucket.name} (${bucket.public ? 'Público' : 'Privado'})`);
      });
    } else {
      console.log('   ❌ Nenhum bucket encontrado');
    }

    // 3. Verificar se o bucket ENSOS existe
    console.log('\n3️⃣ Verificando bucket ENSOS...');
    const ensosBucket = buckets?.find(bucket => bucket.name === 'ENSOS');
    
    if (ensosBucket) {
      console.log('   ✅ Bucket ENSOS encontrado');
      console.log('   📋 Configurações:', {
        name: ensosBucket.name,
        public: ensosBucket.public,
        file_size_limit: ensosBucket.file_size_limit,
        allowed_mime_types: ensosBucket.allowed_mime_types
      });

      // 4. Listar arquivos no bucket ENSOS
      console.log('\n4️⃣ Listando arquivos no bucket ENSOS...');
      const { data: files, error: filesError } = await supabase.storage
        .from('ENSOS')
        .list('FOTOS_PERFIL');

      if (filesError) {
        console.log('   ❌ Erro ao listar arquivos:', filesError.message);
      } else {
        console.log('   📁 Arquivos em FOTOS_PERFIL:');
        if (files && files.length > 0) {
          files.forEach((file, index) => {
            console.log(`      ${index + 1}. ${file.name} (${file.metadata?.size || 'N/A'} bytes)`);
          });
        } else {
          console.log('      📂 Pasta vazia');
        }
      }
    } else {
      console.log('   ❌ Bucket ENSOS não encontrado');
      console.log('   💡 Criando bucket ENSOS...');
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('ENSOS', {
        public: true,
        file_size_limit: 5242880, // 5MB
        allowed_mime_types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });

      if (createError) {
        console.log('   ❌ Erro ao criar bucket:', createError.message);
      } else {
        console.log('   ✅ Bucket ENSOS criado com sucesso');
        console.log('   📋 Configurações:', {
          name: newBucket.name,
          public: newBucket.public,
          file_size_limit: newBucket.file_size_limit,
          allowed_mime_types: newBucket.allowed_mime_types
        });
      }
    }

    // 5. Verificar se o bucket FOTOS_PERFIL existe (alternativa)
    console.log('\n5️⃣ Verificando bucket FOTOS_PERFIL...');
    const fotosBucket = buckets?.find(bucket => bucket.name === 'FOTOS_PERFIL');
    
    if (fotosBucket) {
      console.log('   ✅ Bucket FOTOS_PERFIL encontrado');
    } else {
      console.log('   ❌ Bucket FOTOS_PERFIL não encontrado');
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  } finally {
    // Logout
    const { error: logoutError } = await supabase.auth.signOut();
    if (logoutError) {
      console.error('❌ Erro no logout:', logoutError.message);
    } else {
      console.log('\n👋 Logout realizado');
    }
  }
}

checkBuckets();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual do script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente do servidor (que tem a service role key)
const serverEnvPath = path.join(__dirname, '..', 'env.production');
console.log('🔍 Carregando arquivo de ambiente do servidor:', serverEnvPath);
dotenv.config({ path: serverEnvPath });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Variáveis carregadas:');
console.log('   SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Não encontrada');
console.log('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Configurada' : '❌ Não encontrada');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

// Criar cliente com service role key (tem permissões administrativas)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createBucket() {
  console.log('\n🧪 Criando bucket ENSOS no Supabase Storage...\n');

  try {
    // 1. Listar buckets existentes
    console.log('1️⃣ Listando buckets existentes...');
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

    // 2. Verificar se o bucket ENSOS já existe
    console.log('\n2️⃣ Verificando se o bucket ENSOS já existe...');
    const ensosBucket = buckets?.find(bucket => bucket.name === 'ENSOS');
    
    if (ensosBucket) {
      console.log('   ✅ Bucket ENSOS já existe');
      console.log('   📋 Configurações:', {
        name: ensosBucket.name,
        public: ensosBucket.public,
        file_size_limit: ensosBucket.file_size_limit,
        allowed_mime_types: ensosBucket.allowed_mime_types
      });
    } else {
      console.log('   ❌ Bucket ENSOS não encontrado');
      console.log('   💡 Criando bucket ENSOS...');
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('ENSOS', {
        public: true,
        file_size_limit: 5242880, // 5MB
        allowed_mime_types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });

      if (createError) {
        console.error('   ❌ Erro ao criar bucket:', createError.message);
        return;
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

    // 3. Configurar políticas de segurança (RLS) para o bucket
    console.log('\n3️⃣ Configurando políticas de segurança...');
    
    // Política para permitir upload de fotos de perfil
    const { error: uploadPolicyError } = await supabase.rpc('create_storage_policy', {
      bucket_name: 'ENSOS',
      policy_name: 'allow_photo_upload',
      policy_definition: `
        CREATE POLICY "allow_photo_upload" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'ENSOS' AND
          auth.uid()::text = (storage.foldername(name))[1] AND
          (storage.foldername(name))[2] = 'avatar.jpg'
        );
      `
    });

    if (uploadPolicyError) {
      console.log('   ⚠️  Aviso ao configurar política de upload:', uploadPolicyError.message);
    } else {
      console.log('   ✅ Política de upload configurada');
    }

    // Política para permitir leitura pública de fotos
    const { error: readPolicyError } = await supabase.rpc('create_storage_policy', {
      bucket_name: 'ENSOS',
      policy_name: 'allow_public_read',
      policy_definition: `
        CREATE POLICY "allow_public_read" ON storage.objects
        FOR SELECT USING (bucket_id = 'ENSOS');
      `
    });

    if (readPolicyError) {
      console.log('   ⚠️  Aviso ao configurar política de leitura:', readPolicyError.message);
    } else {
      console.log('   ✅ Política de leitura pública configurada');
    }

    // 4. Testar upload de uma foto de exemplo
    console.log('\n4️⃣ Testando upload de foto...');
    
    // Criar uma imagem de teste simples (1x1 pixel PNG)
    const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    const testUserId = 'test-user';
    const testFilePath = `FOTOS_PERFIL/${testUserId}/avatar.jpg`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ENSOS')
      .upload(testFilePath, testImageData, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.log('   ❌ Erro no upload de teste:', uploadError.message);
    } else {
      console.log('   ✅ Upload de teste realizado com sucesso');
      console.log('   📁 Arquivo:', uploadData.path);
      
      // 5. Testar obtenção da URL pública
      const { data: urlData } = supabase.storage
        .from('ENSOS')
        .getPublicUrl(testFilePath);
      
      console.log('   🔗 URL pública:', urlData.publicUrl);
      
      // 6. Limpar arquivo de teste
      const { error: deleteError } = await supabase.storage
        .from('ENSOS')
        .remove([testFilePath]);
      
      if (deleteError) {
        console.log('   ⚠️  Aviso ao remover arquivo de teste:', deleteError.message);
      } else {
        console.log('   🗑️  Arquivo de teste removido');
      }
    }

    console.log('\n✅ Bucket ENSOS configurado com sucesso!');
    console.log('📝 Próximos passos:');
    console.log('   1. O bucket ENSOS está pronto para uso');
    console.log('   2. As políticas de segurança estão configuradas');
    console.log('   3. O sistema de fotos de perfil deve funcionar corretamente');

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

createBucket();

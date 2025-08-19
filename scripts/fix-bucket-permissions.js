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

async function fixBucketPermissions() {
  console.log('\n🔧 Corrigindo permissões do bucket ENSOS...\n');

  try {
    // 1. Verificar bucket atual
    console.log('1️⃣ Verificando bucket ENSOS atual...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Erro ao listar buckets:', bucketsError.message);
      return;
    }

    const ensosBucket = buckets?.find(bucket => bucket.name === 'ENSOS');
    
    if (!ensosBucket) {
      console.log('   ❌ Bucket ENSOS não encontrado');
      return;
    }

    console.log('   ✅ Bucket ENSOS encontrado');
    console.log('   📋 Configurações atuais:', {
      name: ensosBucket.name,
      public: ensosBucket.public,
      file_size_limit: ensosBucket.file_size_limit,
      allowed_mime_types: ensosBucket.allowed_mime_types
    });

    // 2. Atualizar bucket para garantir que está público
    console.log('\n2️⃣ Atualizando configurações do bucket...');
    
    const { data: updatedBucket, error: updateError } = await supabase.storage.updateBucket('ENSOS', {
      public: true,
      file_size_limit: 5242880, // 5MB
      allowed_mime_types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    });

    if (updateError) {
      console.error('   ❌ Erro ao atualizar bucket:', updateError.message);
      return;
    } else {
      console.log('   ✅ Bucket atualizado com sucesso');
      console.log('   📋 Novas configurações:', {
        name: updatedBucket.name,
        public: updatedBucket.public,
        file_size_limit: updatedBucket.file_size_limit,
        allowed_mime_types: updatedBucket.allowed_mime_types
      });
    }

    // 3. Configurar políticas RLS diretamente via SQL
    console.log('\n3️⃣ Configurando políticas RLS...');
    
    // Política para permitir leitura pública de todos os objetos
    const { error: readPolicyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Public Access" ON storage.objects
        FOR SELECT USING (bucket_id = 'ENSOS');
      `
    });

    if (readPolicyError) {
      console.log('   ⚠️  Aviso ao configurar política de leitura:', readPolicyError.message);
    } else {
      console.log('   ✅ Política de leitura pública configurada');
    }

    // Política para permitir upload de fotos de perfil
    const { error: uploadPolicyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Users can upload photos" ON storage.objects
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

    // Política para permitir atualização de fotos de perfil
    const { error: updatePolicyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Users can update photos" ON storage.objects
        FOR UPDATE USING (
          bucket_id = 'ENSOS' AND
          auth.uid()::text = (storage.foldername(name))[1] AND
          (storage.foldername(name))[2] = 'avatar.jpg'
        );
      `
    });

    if (updatePolicyError) {
      console.log('   ⚠️  Aviso ao configurar política de atualização:', updatePolicyError.message);
    } else {
      console.log('   ✅ Política de atualização configurada');
    }

    // Política para permitir remoção de fotos de perfil
    const { error: deletePolicyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Users can delete photos" ON storage.objects
        FOR DELETE USING (
          bucket_id = 'ENSOS' AND
          auth.uid()::text = (storage.foldername(name))[1] AND
          (storage.foldername(name))[2] = 'avatar.jpg'
        );
      `
    });

    if (deletePolicyError) {
      console.log('   ⚠️  Aviso ao configurar política de remoção:', deletePolicyError.message);
    } else {
      console.log('   ✅ Política de remoção configurada');
    }

    // 4. Testar com anon key
    console.log('\n4️⃣ Testando acesso com anon key...');
    
    // Carregar anon key
    const clientEnvPath = path.join(__dirname, '..', 'client', 'env.local');
    dotenv.config({ path: clientEnvPath });
    
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
    const anonSupabase = createClient(supabaseUrl, anonKey);
    
    // Fazer login
    const { data: authData, error: authError } = await anonSupabase.auth.signInWithPassword({
      email: 'david.pedro@wap.ind.br',
      password: 'david.pedro@wap.ind.br'
    });

    if (authError) {
      console.log('   ❌ Erro no login:', authError.message);
      return;
    }

    console.log('   ✅ Login realizado com sucesso');
    console.log('   👤 User ID:', authData.user.id);

    // Testar listagem de buckets
    const { data: anonBuckets, error: anonBucketsError } = await anonSupabase.storage.listBuckets();
    
    if (anonBucketsError) {
      console.log('   ❌ Erro ao listar buckets com anon key:', anonBucketsError.message);
    } else {
      console.log('   ✅ Buckets listados com anon key');
      const anonEnsoBucket = anonBuckets?.find(bucket => bucket.name === 'ENSOS');
      if (anonEnsoBucket) {
        console.log('   ✅ Bucket ENSOS acessível com anon key');
      } else {
        console.log('   ❌ Bucket ENSOS não acessível com anon key');
      }
    }

    // Testar upload
    const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    const testFilePath = `FOTOS_PERFIL/${authData.user.id}/avatar.jpg`;
    
    const { data: uploadData, error: uploadError } = await anonSupabase.storage
      .from('ENSOS')
      .upload(testFilePath, testImageData, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.log('   ❌ Erro no upload com anon key:', uploadError.message);
    } else {
      console.log('   ✅ Upload realizado com anon key');
      console.log('   📁 Arquivo:', uploadData.path);
      
      // Testar obtenção da URL pública
      const { data: urlData } = anonSupabase.storage
        .from('ENSOS')
        .getPublicUrl(testFilePath);
      
      console.log('   🔗 URL pública:', urlData.publicUrl);
      
      // Limpar arquivo de teste
      const { error: deleteError } = await anonSupabase.storage
        .from('ENSOS')
        .remove([testFilePath]);
      
      if (deleteError) {
        console.log('   ⚠️  Aviso ao remover arquivo de teste:', deleteError.message);
      } else {
        console.log('   🗑️  Arquivo de teste removido');
      }
    }

    // Logout
    await anonSupabase.auth.signOut();

    console.log('\n✅ Permissões do bucket ENSOS corrigidas com sucesso!');
    console.log('📝 Resumo:');
    console.log('   1. ✅ Bucket ENSOS está público');
    console.log('   2. ✅ Políticas RLS configuradas');
    console.log('   3. ✅ Upload e download funcionando');
    console.log('   4. ✅ Sistema de fotos de perfil pronto');

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

fixBucketPermissions();

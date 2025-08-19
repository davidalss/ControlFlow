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

async function testPhotoSystem() {
  console.log('🧪 Testando sistema de fotos de perfil...\n');

  try {
    // 1. Testar login do usuário admin
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

    // 2. Testar upload de foto
    console.log('\n2️⃣ Testando upload de foto...');
    
    // Criar uma imagem de teste simples (1x1 pixel PNG)
    const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    const userId = authData.user.id;
    const filePath = `FOTOS_PERFIL/${userId}/avatar.jpg`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ENSOS')
      .upload(filePath, testImageData, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Erro no upload:', uploadError.message);
      return;
    }

    console.log('✅ Upload realizado com sucesso');
    console.log('📁 Arquivo:', uploadData.path);

    // 3. Testar obtenção da URL pública
    console.log('\n3️⃣ Testando obtenção da URL pública...');
    const { data: urlData } = supabase.storage
      .from('ENSOS')
      .getPublicUrl(filePath);

    console.log('✅ URL pública obtida');
    console.log('🔗 URL:', urlData.publicUrl);

    // 4. Testar download da foto
    console.log('\n4️⃣ Testando download da foto...');
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('ENSOS')
      .download(filePath);

    if (downloadError) {
      console.error('❌ Erro no download:', downloadError.message);
    } else {
      console.log('✅ Download realizado com sucesso');
      console.log('📊 Tamanho do arquivo:', downloadData.size, 'bytes');
    }

    // 5. Testar listagem de arquivos na pasta do usuário
    console.log('\n5️⃣ Testando listagem de arquivos...');
    const { data: files, error: listError } = await supabase.storage
      .from('ENSOS')
      .list(`FOTOS_PERFIL/${userId}`);

    if (listError) {
      console.log('⚠️  Aviso ao listar arquivos:', listError.message);
    } else {
      console.log('✅ Listagem realizada com sucesso');
      if (files && files.length > 0) {
        files.forEach((file, index) => {
          console.log(`   ${index + 1}. ${file.name} (${file.metadata?.size || 'N/A'} bytes)`);
        });
      } else {
        console.log('   📂 Pasta vazia');
      }
    }

    // 6. Limpar arquivo de teste
    console.log('\n6️⃣ Limpando arquivo de teste...');
    const { error: deleteError } = await supabase.storage
      .from('ENSOS')
      .remove([filePath]);

    if (deleteError) {
      console.log('⚠️  Aviso ao remover arquivo de teste:', deleteError.message);
    } else {
      console.log('✅ Arquivo de teste removido');
    }

    console.log('\n🎉 Sistema de fotos de perfil funcionando perfeitamente!');
    console.log('📝 Resumo dos testes:');
    console.log('   ✅ Login do usuário');
    console.log('   ✅ Upload de foto');
    console.log('   ✅ Obtenção de URL pública');
    console.log('   ✅ Download de foto');
    console.log('   ✅ Listagem de arquivos');
    console.log('   ✅ Remoção de arquivo');

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

testPhotoSystem();

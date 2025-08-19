#!/usr/bin/env node

/**
 * Script para configurar o bucket de storage ENSOS no Supabase
 * Execute este script após criar o projeto no Supabase
 */

const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://smvohmdytczfouslcaju.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUxOTUzNCwiZXhwIjoyMDcxMDk1NTM0fQ.UWuEALzLAlQoYQrWGOKuPbWUWxAmMNAHJ9IUtE-qiAE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function setupStorage() {
  console.log('🚀 Configurando bucket de storage ENSOS no Supabase...');

  try {
    // 1. Criar bucket ENSOS se não existir
    console.log('📦 Criando bucket ENSOS...');
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('ENSOS', {
      public: true, // Bucket público para URLs públicas
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
      fileSizeLimit: 5242880, // 5MB
    });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Bucket ENSOS já existe');
      } else {
        console.error('❌ Erro ao criar bucket:', bucketError);
        return;
      }
    } else {
      console.log('✅ Bucket ENSOS criado com sucesso');
    }

    // 2. Listar buckets existentes para verificar
    console.log('📋 Listando buckets existentes...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
    } else {
      console.log('📦 Buckets encontrados:', buckets.map(b => b.name));
    }

    // 3. Testar upload de uma imagem de exemplo
    console.log('🧪 Testando upload de imagem...');
    
    // Criar uma imagem de teste simples (1x1 pixel PNG)
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ENSOS')
      .upload('test/test-image.jpg', testImageBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Erro no teste de upload:', uploadError);
    } else {
      console.log('✅ Teste de upload bem-sucedido');
      
      // Limpar arquivo de teste
      await supabase.storage
        .from('ENSOS')
        .remove(['test/test-image.jpg']);
    }

    // 4. Testar URL pública
    console.log('🔗 Testando geração de URL pública...');
    const { data: urlData } = supabase.storage
      .from('ENSOS')
      .getPublicUrl('FOTOS_PERFIL/test-user/avatar.jpg');

    console.log('📋 URL de exemplo:', urlData.publicUrl);

    console.log('🎉 Configuração do storage concluída com sucesso!');
    console.log('');
    console.log('📋 Resumo da configuração:');
    console.log('   • Bucket: ENSOS');
    console.log('   • Público: Sim');
    console.log('   • Estrutura: FOTOS_PERFIL/{user-id}/avatar.jpg');
    console.log('   • Tamanho máximo: 5MB');
    console.log('   • Tipos permitidos: JPEG, PNG, GIF');
    console.log('');
    console.log('🔗 URLs públicas serão geradas automaticamente');
    console.log('   Exemplo: https://smvohmdytczfouslcaju.supabase.co/storage/v1/object/public/ENSOS/FOTOS_PERFIL/user-id/avatar.jpg');
    console.log('');
    console.log('⚠️  IMPORTANTE: Configure as políticas RLS manualmente no painel do Supabase');
    console.log('   Storage > Policies > Adicionar política para o bucket ENSOS');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupStorage();
}

module.exports = { setupStorage };

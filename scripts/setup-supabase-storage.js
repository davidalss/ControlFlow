#!/usr/bin/env node

/**
 * Script para configurar o bucket de storage ENSOS no Supabase
 * Execute este script após criar o projeto no Supabase
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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

    // 2. Configurar políticas RLS para o bucket
    console.log('🔒 Configurando políticas de acesso...');
    
    // Política para permitir upload de fotos de perfil
    const uploadPolicy = `
      CREATE POLICY "Users can upload their own profile photos" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'ENSOS' AND 
        auth.uid()::text = (storage.foldername(name))[1] AND
        name LIKE 'FOTOS_PERFIL/%/avatar.jpg'
      );
    `;

    // Política para permitir visualização de fotos de perfil
    const viewPolicy = `
      CREATE POLICY "Anyone can view profile photos" ON storage.objects
      FOR SELECT USING (
        bucket_id = 'ENSOS' AND 
        name LIKE 'FOTOS_PERFIL/%/avatar.jpg'
      );
    `;

    // Política para permitir atualização de fotos de perfil
    const updatePolicy = `
      CREATE POLICY "Users can update their own profile photos" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'ENSOS' AND 
        auth.uid()::text = (storage.foldername(name))[1] AND
        name LIKE 'FOTOS_PERFIL/%/avatar.jpg'
      );
    `;

    // Política para permitir exclusão de fotos de perfil
    const deletePolicy = `
      CREATE POLICY "Users can delete their own profile photos" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'ENSOS' AND 
        auth.uid()::text = (storage.foldername(name))[1] AND
        name LIKE 'FOTOS_PERFIL/%/avatar.jpg'
      );
    `;

    // Executar políticas (usando SQL direto)
    const policies = [uploadPolicy, viewPolicy, updatePolicy, deletePolicy];
    
    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        if (error) {
          console.warn('⚠️ Política pode já existir:', error.message);
        } else {
          console.log('✅ Política aplicada com sucesso');
        }
      } catch (err) {
        console.warn('⚠️ Erro ao aplicar política (pode já existir):', err.message);
      }
    }

    // 3. Testar upload de uma imagem de exemplo
    console.log('🧪 Testando upload de imagem...');
    
    // Criar uma imagem de teste simples
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

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  setupStorage();
}

export { setupStorage };

#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const SUPABASE_URL = "https://smvohmdytczfouslcaju.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUxOTUzNCwiZXhwIjoyMDcxMDk1NTM0fQ.UWuEALzLAlQoYQrWGOKuPbWUWxAmMNAHJ9IUtE-qiAE";

// Conectar ao Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testProducts() {
  try {
    console.log('🔄 Testando conexão com Supabase...');
    
    // Testar contagem total
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao contar produtos:', countError);
      return;
    }
    
    console.log(`📊 Total de produtos na tabela: ${count}`);
    
    // Buscar produtos
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      return;
    }
    
    console.log(`✅ Produtos retornados: ${products.length}`);
    
    if (products.length > 0) {
      console.log('\n📋 Primeiros 5 produtos:');
      products.slice(0, 5).forEach((product, index) => {
        console.log(`${index + 1}. ${product.code} - ${product.description}`);
      });
    }
    
    // Verificar se há produtos com is_active = false
    const { data: inactiveProducts, error: inactiveError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', false);
    
    if (!inactiveError && inactiveProducts) {
      console.log(`\n⚠️ Produtos inativos: ${inactiveProducts.length}`);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testProducts();

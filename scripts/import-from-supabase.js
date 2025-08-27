#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import pkg from 'pg';
const { Client } = pkg;

// Configuração do Supabase
const SUPABASE_URL = "https://smvohmdytczfouslcaju.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUxOTUzNCwiZXhwIjoyMDcxMDk1NTM0fQ.UWuEALzLAlQoYQrWGOKuPbWUWxAmMNAHJ9IUtE-qiAE";

// Configuração do PostgreSQL local
const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'enso_db',
  user: 'enso_user',
  password: 'enso_password_123'
};

// Conectar ao Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Conectar ao PostgreSQL local
const pgClient = new Client(DB_CONFIG);

async function importProducts() {
  try {
    console.log('🔄 Iniciando importação de produtos do Supabase para PostgreSQL local...');
    
    // Conectar ao PostgreSQL
    await pgClient.connect();
    console.log('✅ Conectado ao PostgreSQL local');
    
    // Buscar produtos do Supabase
    console.log('📥 Buscando produtos do Supabase...');
    const { data: products, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      throw new Error(`Erro ao buscar produtos do Supabase: ${error.message}`);
    }
    
    console.log(`✅ ${products.length} produtos encontrados no Supabase`);
    
    if (products.length === 0) {
      console.log('⚠️ Nenhum produto encontrado no Supabase');
      return;
    }
    
    // Limpar tabela local
    console.log('🧹 Limpando tabela local...');
    await pgClient.query('DELETE FROM products');
    
    // Inserir produtos
    console.log('📤 Inserindo produtos no banco local...');
    let inserted = 0;
    
    for (const product of products) {
      try {
        const query = `
          INSERT INTO products (
            id, code, description, ean, category, business_unit, 
            technical_parameters, voltage_variants, voltage_type, is_multi_voltage,
            is_active, created_by, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `;
        
        const values = [
          product.id,
          product.code,
          product.description,
          product.ean || null,
          product.category,
          product.business_unit || 'N/A',
          product.technical_parameters || null,
          product.voltage_variants || '[]',
          product.voltage_type || '127V',
          product.is_multi_voltage || false,
          product.is_active !== false,
          product.created_by || null,
          product.created_at || new Date(),
          product.updated_at || new Date()
        ];
        
        await pgClient.query(query, values);
        inserted++;
        
        if (inserted % 50 === 0) {
          console.log(`✅ ${inserted}/${products.length} produtos inseridos...`);
        }
      } catch (err) {
        console.error(`❌ Erro ao inserir produto ${product.code}: ${err.message}`);
      }
    }
    
    console.log(`🎉 Importação concluída! ${inserted} produtos inseridos com sucesso`);
    
  } catch (error) {
    console.error(`❌ Erro na importação: ${error.message}`);
  } finally {
    await pgClient.end();
  }
}

importProducts();

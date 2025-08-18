#!/usr/bin/env node
/**
 * Script para importar produtos do arquivo Excel para o Supabase usando Node.js
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do Supabase
const SUPABASE_URL = "https://smvohmdytczfouslcaju.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUxOTUzNCwiZXhwIjoyMDcxMDk1NTM0fQ.UWuEALzLAlQoYQrWGOKuPbWUWxAmMNAHJ9IUtE-qiAE";

// Conectar ao Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function connectToSupabase() {
    try {
        console.log("✅ Conectado ao Supabase com sucesso!");
        return supabase;
    } catch (error) {
        console.error(`❌ Erro ao conectar ao Supabase: ${error.message}`);
        process.exit(1);
    }
}

function readExcelFile(filePath) {
    try {
        console.log(`📖 Lendo arquivo: ${filePath}`);
        
        if (!fs.existsSync(filePath)) {
            throw new Error(`Arquivo não encontrado: ${filePath}`);
        }
        
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Converter para array de objetos
        const headers = data[0];
        const rows = data.slice(1);
        
        const products = rows.map(row => {
            const product = {};
            headers.forEach((header, index) => {
                if (header && row[index] !== undefined && row[index] !== null && row[index] !== '') {
                    product[header] = row[index];
                }
            });
            return product;
        }).filter(product => Object.keys(product).length > 0);
        
        console.log(`✅ Arquivo lido com sucesso! ${products.length} linhas encontradas`);
        console.log(`📊 Colunas: ${headers.join(', ')}`);
        
        return products;
    } catch (error) {
        console.error(`❌ Erro ao ler arquivo Excel: ${error.message}`);
        process.exit(1);
    }
}

function cleanData(products) {
    console.log("🧹 Limpando dados...");
    
    const cleanedProducts = products.map(product => {
        const cleaned = {};
        Object.keys(product).forEach(key => {
            const value = product[key];
            if (value !== null && value !== undefined && value !== '' && value !== 'nan' && value !== 'NaN') {
                cleaned[key] = String(value).trim();
            }
        });
        return cleaned;
    }).filter(product => Object.keys(product).length > 0);
    
    console.log(`✅ Dados limpos! ${cleanedProducts.length} linhas válidas`);
    return cleanedProducts;
}

function mapBusinessUnit(businessUnit) {
    if (!businessUnit || businessUnit.toLowerCase() === 'nan') {
        return 'N/A';
    }
    
    const mapping = {
        'DIY': 'DIY',
        'TECH': 'TECH', 
        'KITCHEN_BEAUTY': 'KITCHEN_BEAUTY',
        'MOTOR_COMFORT': 'MOTOR_COMFORT',
        'N/A': 'N/A',
        'NA': 'N/A',
        '': 'N/A'
    };
    
    return mapping[businessUnit.toUpperCase().trim()] || 'N/A';
}

function createTechnicalParameters(product) {
    const params = {};
    
    // Mapeia colunas que podem ser parâmetros técnicos (português e inglês)
    const technicalColumns = [
        'VOLTAGEM', 'voltagem', 'voltage', 'POTENCIA', 'potencia', 'power', 
        'CAPACIDADE', 'capacidade', 'capacity', 'PESO', 'peso', 'weight', 
        'DIMENSOES', 'dimensoes', 'dimensions', 'MATERIAL', 'material', 
        'COR', 'cor', 'color', 'GARANTIA', 'garantia', 'warranty', 
        'ORIGEM', 'origem', 'origin', 'CLASSIFICACAO_FISCAL', 'classificacao_fiscal',
        'FAMILIA_GRUPOS', 'familia_grupos', 'FAMILIA_COMERCIAL', 'familia_comercial', 
        'TIPO_EXCLUSIVIDADE', 'tipo_exclusividade', 'DUN', 'PESO BRUTO', 'FAMILIA'
    ];
    
    technicalColumns.forEach(col => {
        if (product[col]) {
            params[col.toLowerCase()] = product[col];
        }
    });
    
    // Adiciona campos específicos se existirem
    Object.keys(product).forEach(key => {
        if (!['CÓDIGO', 'code', 'EAN', 'ean', 'DESCRIÇÃO', 'description', 'CATEGORIA', 'category', 'BU', 'business_unit'].includes(key) && 
            !technicalColumns.includes(key) && product[key]) {
            params[key.toLowerCase()] = product[key];
        }
    });
    
    return Object.keys(params).length > 0 ? JSON.stringify(params) : null;
}

function prepareProductData(product) {
    const productData = {
        id: crypto.randomUUID(),
        code: product['CÓDIGO'] || product.code || null,
        ean: product['EAN'] || product.ean || null,
        description: product['DESCRIÇÃO'] || product.description || null,
        category: product['CATEGORIA'] || product.category || null,
        business_unit: mapBusinessUnit(product['BU'] || product.business_unit),
        technical_parameters: createTechnicalParameters(product),
        created_at: new Date().toISOString()
    };
    
    // Remove campos null ou vazios
    Object.keys(productData).forEach(key => {
        if (productData[key] === null || productData[key] === '') {
            delete productData[key];
        }
    });
    
    return productData;
}

async function insertProductsToSupabase(productsData) {
    console.log(`🚀 Inserindo ${productsData.length} produtos no Supabase...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < productsData.length; i++) {
        const product = productsData[i];
        
        try {
            // Verificar se o produto já existe
            const { data: existing } = await supabase
                .from('products')
                .select('id')
                .eq('code', product.code)
                .single();
            
            if (existing) {
                console.log(`⏭️  Produto ${product.code} já existe, pulando...`);
                continue;
            }
            
            // Inserir produto
            const { data, error } = await supabase
                .from('products')
                .insert(product)
                .select();
            
            if (error) {
                throw error;
            }
            
            if (data) {
                console.log(`✅ [${i + 1}/${productsData.length}] Produto inserido: ${product.code} - ${product.description}`);
                successCount++;
            } else {
                console.log(`❌ [${i + 1}/${productsData.length}] Erro ao inserir produto ${product.code}`);
                errorCount++;
            }
            
        } catch (error) {
            console.error(`❌ [${i + 1}/${productsData.length}] Erro ao inserir produto ${product.code || 'N/A'}: ${error.message}`);
            errorCount++;
        }
    }
    
    console.log(`\n📈 Resumo da importação:`);
    console.log(`✅ Produtos inseridos com sucesso: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📊 Total processado: ${productsData.length}`);
}

async function main() {
    console.log("🔄 Iniciando importação de produtos do Excel para o Supabase...");
    
    // Caminho do arquivo Excel
    const excelFile = path.join(__dirname, '..', 'DADOS.xlsx');
    
    if (!fs.existsSync(excelFile)) {
        console.error(`❌ Arquivo não encontrado: ${excelFile}`);
        console.log("💡 Certifique-se de que o arquivo DADOS.xlsx está na pasta raiz do projeto");
        process.exit(1);
    }
    
    // Conectar ao Supabase
    connectToSupabase();
    
    // Ler arquivo Excel
    const rawProducts = readExcelFile(excelFile);
    
    // Limpar dados
    const cleanedProducts = cleanData(rawProducts);
    
    // Preparar dados dos produtos
    console.log("🔧 Preparando dados dos produtos...");
    const productsData = [];
    
    for (let i = 0; i < cleanedProducts.length; i++) {
        try {
            const productData = prepareProductData(cleanedProducts[i]);
            
            // Validar dados obrigatórios
            if (!productData.code || !productData.description || !productData.category) {
                console.log(`⚠️  Linha ${i + 1}: Dados obrigatórios faltando, pulando...`);
                continue;
            }
            
            productsData.push(productData);
            
        } catch (error) {
            console.error(`❌ Erro ao processar linha ${i + 1}: ${error.message}`);
            continue;
        }
    }
    
    console.log(`✅ ${productsData.length} produtos preparados para inserção`);
    
    // Inserir no Supabase
    if (productsData.length > 0) {
        await insertProductsToSupabase(productsData);
    } else {
        console.log("❌ Nenhum produto válido encontrado para inserção");
    }
    
    console.log("🎉 Importação concluída!");
}

// Executar o script
main().catch(console.error);

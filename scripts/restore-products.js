import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { products } from '../shared/schema.js';

// Dados dos produtos que estavam cadastrados
const productsToRestore = [
  {
    code: "FW011424",
    description: "WAP WL 6100 ULTRA 220V",
    ean: "7899831343843",
    category: "Limpeza",
    businessUnit: "KITCHEN_BEAUTY",
    technicalParameters: JSON.stringify({
      voltagem: "220V",
      familia_grupos: "Lavadoras",
      peso_bruto: "24.5",
      tipo_exclusividade: "CATALOGO ABERTO",
      origem: "Estrangeira",
      familia_comercial: "lavadora - intensivo",
      classificacao_fiscal: "84243010",
      aliquota_ipi: 0,
      multiplo_pedido: 1,
      dt_implant: "2025-02-03T00:00:00.000Z"
    })
  },
  {
    code: "FW011423",
    description: "WAP WL 6100 220V",
    ean: "7899831342846",
    category: "Limpeza",
    businessUnit: "KITCHEN_BEAUTY",
    technicalParameters: JSON.stringify({
      voltagem: "220V",
      familia_grupos: "Lavadoras",
      peso_bruto: "24.5",
      tipo_exclusividade: "CATALOGO ABERTO",
      origem: "Estrangeira",
      familia_comercial: "lavadora - intensivo",
      classificacao_fiscal: "84243010",
      aliquota_ipi: 0,
      multiplo_pedido: 1,
      dt_implant: "2025-02-03T00:00:00.000Z"
    })
  },
  {
    code: "FW009484",
    description: "WAP WL 4000 ULTRA 220V",
    ean: "7899831312610",
    category: "Limpeza",
    businessUnit: "DIY",
    technicalParameters: JSON.stringify({
      voltagem: "220V",
      familia_grupos: "Lavadoras",
      peso_bruto: "12",
      tipo_exclusividade: "CATALOGO ABERTO",
      origem: "Estrangeira",
      familia_comercial: "lavadora - intensivo",
      classificacao_fiscal: "84243010",
      aliquota_ipi: 0,
      multiplo_pedido: 1,
      dt_implant: "2023-06-02T00:00:00.000Z"
    })
  },
  {
    code: "FW009483",
    description: "WAP WL 4000 ULTRA 127V",
    ean: "7899831312603",
    category: "Limpeza",
    businessUnit: "DIY",
    technicalParameters: JSON.stringify({
      voltagem: "127V",
      familia_grupos: "Lavadoras",
      peso_bruto: "12",
      tipo_exclusividade: "CATALOGO ABERTO",
      origem: "Estrangeira",
      familia_comercial: "lavadora - intensivo",
      classificacao_fiscal: "84243010",
      aliquota_ipi: 0,
      multiplo_pedido: 1,
      dt_implant: "2023-06-02T00:00:00.000Z"
    })
  },
  {
    code: "FW009480",
    description: "WAP WL 4000 220V",
    ean: "7899831312597",
    category: "Limpeza",
    businessUnit: "DIY",
    technicalParameters: JSON.stringify({
      voltagem: "220V",
      familia_grupos: "Lavadoras",
      peso_bruto: "12",
      tipo_exclusividade: "CATALOGO ABERTO",
      origem: "Estrangeira",
      familia_comercial: "lavadora - intensivo",
      classificacao_fiscal: "84243010",
      aliquota_ipi: 0,
      multiplo_pedido: 1,
      dt_implant: "2023-06-02T00:00:00.000Z"
    })
  },
  {
    code: "FW009479",
    description: "WAP WL 4000 127V",
    ean: "7899831312580",
    category: "Limpeza",
    businessUnit: "DIY",
    technicalParameters: JSON.stringify({
      voltagem: "127V",
      familia_grupos: "Lavadoras",
      peso_bruto: "12",
      tipo_exclusividade: "CATALOGO ABERTO",
      origem: "Estrangeira",
      familia_comercial: "lavadora - intensivo",
      classificacao_fiscal: "84243010",
      aliquota_ipi: 0,
      multiplo_pedido: 1,
      dt_implant: "2023-06-02T00:00:00.000Z"
    })
  },
  {
    code: "FW009476",
    description: "WAP WL 3000 ULTRA 220V",
    ean: "7899831312573",
    category: "Limpeza",
    businessUnit: "DIY",
    technicalParameters: JSON.stringify({
      voltagem: "220V",
      familia_grupos: "Lavadoras",
      peso_bruto: "8.5",
      tipo_exclusividade: "CATALOGO ABERTO",
      origem: "Estrangeira",
      familia_comercial: "lavadora - intensivo",
      classificacao_fiscal: "84243010",
      aliquota_ipi: 0,
      multiplo_pedido: 1,
      dt_implant: "2023-06-02T00:00:00.000Z"
    })
  },
  {
    code: "FW009475",
    description: "WAP WL 3000 ULTRA 127V",
    ean: "7899831312566",
    category: "Limpeza",
    businessUnit: "DIY",
    technicalParameters: JSON.stringify({
      voltagem: "127V",
      familia_grupos: "Lavadoras",
      peso_bruto: "8.5",
      tipo_exclusividade: "CATALOGO ABERTO",
      origem: "Estrangeira",
      familia_comercial: "lavadora - intensivo",
      classificacao_fiscal: "84243010",
      aliquota_ipi: 0,
      multiplo_pedido: 1,
      dt_implant: "2023-06-02T00:00:00.000Z"
    })
  },
  {
    code: "FW009472",
    description: "WAP WL 3000 220V",
    ean: "7899831312559",
    category: "Limpeza",
    businessUnit: "DIY",
    technicalParameters: JSON.stringify({
      voltagem: "220V",
      familia_grupos: "Lavadoras",
      peso_bruto: "8.5",
      tipo_exclusividade: "CATALOGO ABERTO",
      origem: "Estrangeira",
      familia_comercial: "lavadora - intensivo",
      classificacao_fiscal: "84243010",
      aliquota_ipi: 0,
      multiplo_pedido: 1,
      dt_implant: "2023-06-02T00:00:00.000Z"
    })
  },
  {
    code: "FW009471",
    description: "WAP WL 3000 127V",
    ean: "7899831312542",
    category: "Limpeza",
    businessUnit: "DIY",
    technicalParameters: JSON.stringify({
      voltagem: "127V",
      familia_grupos: "Lavadoras",
      peso_bruto: "8.5",
      tipo_exclusividade: "CATALOGO ABERTO",
      origem: "Estrangeira",
      familia_comercial: "lavadora - intensivo",
      classificacao_fiscal: "84243010",
      aliquota_ipi: 0,
      multiplo_pedido: 1,
      dt_implant: "2023-06-02T00:00:00.000Z"
    })
  },
  {
    code: "FW009468",
    description: "WAP WL 2000 ULTRA 220V",
    ean: "7899831312535",
    category: "Limpeza",
    businessUnit: "DIY",
    technicalParameters: JSON.stringify({
      voltagem: "220V",
      familia_grupos: "Lavadoras",
      peso_bruto: "5.5",
      tipo_exclusividade: "CATALOGO ABERTO",
      origem: "Estrangeira",
      familia_comercial: "lavadora - intensivo",
      classificacao_fiscal: "84243010",
      aliquota_ipi: 0,
      multiplo_pedido: 1,
      dt_implant: "2023-06-02T00:00:00.000Z"
    })
  },
  {
    code: "FW009467",
    description: "WAP WL 2000 ULTRA 127V",
    ean: "7899831312528",
    category: "Limpeza",
    businessUnit: "DIY",
    technicalParameters: JSON.stringify({
      voltagem: "127V",
      familia_grupos: "Lavadoras",
      peso_bruto: "5.5",
      tipo_exclusividade: "CATALOGO ABERTO",
      origem: "Estrangeira",
      familia_comercial: "lavadora - intensivo",
      classificacao_fiscal: "84243010",
      aliquota_ipi: 0,
      multiplo_pedido: 1,
      dt_implant: "2023-06-02T00:00:00.000Z"
    })
  },
  {
    code: "FW009464",
    description: "WAP WL 2000 220V",
    ean: "7899831312511",
    category: "Limpeza",
    businessUnit: "DIY",
    technicalParameters: JSON.stringify({
      voltagem: "220V",
      familia_grupos: "Lavadoras",
      peso_bruto: "5.5",
      tipo_exclusividade: "CATALOGO ABERTO",
      origem: "Estrangeira",
      familia_comercial: "lavadora - intensivo",
      classificacao_fiscal: "84243010",
      aliquota_ipi: 0,
      multiplo_pedido: 1,
      dt_implant: "2023-06-02T00:00:00.000Z"
    })
  },
  {
    code: "FW009463",
    description: "WAP WL 2000 127V",
    ean: "7899831312504",
    category: "Limpeza",
    businessUnit: "DIY",
    technicalParameters: JSON.stringify({
      voltagem: "127V",
      familia_grupos: "Lavadoras",
      peso_bruto: "5.5",
      tipo_exclusividade: "CATALOGO ABERTO",
      origem: "Estrangeira",
      familia_comercial: "lavadora - intensivo",
      classificacao_fiscal: "84243010",
      aliquota_ipi: 0,
      multiplo_pedido: 1,
      dt_implant: "2023-06-02T00:00:00.000Z"
    })
  },
  {
    code: "FW009460",
    description: "WAP WL 1000 ULTRA 220V",
    ean: "7899831312498",
    category: "Limpeza",
    businessUnit: "DIY",
    technicalParameters: JSON.stringify({
      voltagem: "220V",
      familia_grupos: "Lavadoras",
      peso_bruto: "3.5",
      tipo_exclusividade: "CATALOGO ABERTO",
      origem: "Estrangeira",
      familia_comercial: "lavadora - intensivo",
      classificacao_fiscal: "84243010",
      aliquota_ipi: 0,
      multiplo_pedido: 1,
      dt_implant: "2023-06-02T00:00:00.000Z"
    })
  },
  {
    code: "FW009459",
    description: "WAP WL 1000 ULTRA 127V",
    ean: "7899831312481",
    category: "Limpeza",
    businessUnit: "DIY",
    technicalParameters: JSON.stringify({
      voltagem: "127V",
      familia_grupos: "Lavadoras",
      peso_bruto: "3.5",
      tipo_exclusividade: "CATALOGO ABERTO",
      origem: "Estrangeira",
      familia_comercial: "lavadora - intensivo",
      classificacao_fiscal: "84243010",
      aliquota_ipi: 0,
      multiplo_pedido: 1,
      dt_implant: "2023-06-02T00:00:00.000Z"
    })
  },
  {
    code: "FW009456",
    description: "WAP WL 1000 220V",
    ean: "7899831312474",
    category: "Limpeza",
    businessUnit: "DIY",
    technicalParameters: JSON.stringify({
      voltagem: "220V",
      familia_grupos: "Lavadoras",
      peso_bruto: "3.5",
      tipo_exclusividade: "CATALOGO ABERTO",
      origem: "Estrangeira",
      familia_comercial: "lavadora - intensivo",
      classificacao_fiscal: "84243010",
      aliquota_ipi: 0,
      multiplo_pedido: 1,
      dt_implant: "2023-06-02T00:00:00.000Z"
    })
  },
  {
    code: "FW009455",
    description: "WAP WL 1000 127V",
    ean: "7899831312467",
    category: "Limpeza",
    businessUnit: "DIY",
    technicalParameters: JSON.stringify({
      voltagem: "127V",
      familia_grupos: "Lavadoras",
      peso_bruto: "3.5",
      tipo_exclusividade: "CATALOGO ABERTO",
      origem: "Estrangeira",
      familia_comercial: "lavadora - intensivo",
      classificacao_fiscal: "84243010",
      aliquota_ipi: 0,
      multiplo_pedido: 1,
      dt_implant: "2023-06-02T00:00:00.000Z"
    })
  },
  {
    code: "FW009452",
    description: "WAP WL 500 ULTRA 220V",
    ean: "7899831312450",
    category: "Limpeza",
    businessUnit: "DIY",
    technicalParameters: JSON.stringify({
      voltagem: "220V",
      familia_grupos: "Lavadoras",
      peso_bruto: "2.5",
      tipo_exclusividade: "CATALOGO ABERTO",
      origem: "Estrangeira",
      familia_comercial: "lavadora - intensivo",
      classificacao_fiscal: "84243010",
      aliquota_ipi: 0,
      multiplo_pedido: 1,
      dt_implant: "2023-06-02T00:00:00.000Z"
    })
  },
  {
    code: "FW009451",
    description: "WAP WL 500 ULTRA 127V",
    ean: "7899831312443",
    category: "Limpeza",
    businessUnit: "DIY",
    technicalParameters: JSON.stringify({
      voltagem: "127V",
      familia_grupos: "Lavadoras",
      peso_bruto: "2.5",
      tipo_exclusividade: "CATALOGO ABERTO",
      origem: "Estrangeira",
      familia_comercial: "lavadora - intensivo",
      classificacao_fiscal: "84243010",
      aliquota_ipi: 0,
      multiplo_pedido: 1,
      dt_implant: "2023-06-02T00:00:00.000Z"
    })
  }
];

async function restoreProducts() {
  console.log('🔄 Iniciando restauração dos produtos...');
  
  // Configurar conexão com o banco
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.smvohmdytczfouslcaju:ExieAFZE1Xb3oyfh@aws-1-sa-east-1.pooler.supabase.com:6543/postgres';
  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    // Verificar produtos existentes
    const existingProducts = await db.select().from(products);
    console.log(`📊 Produtos existentes no banco: ${existingProducts.length}`);

    let createdCount = 0;
    let skippedCount = 0;

    // Inserir produtos
    for (const productData of productsToRestore) {
      try {
        // Verificar se o produto já existe
        const existingProduct = await db.select().from(products).where(eq(products.code, productData.code));
        
        if (existingProduct.length > 0) {
          console.log(`⏭️  Produto ${productData.code} já existe, pulando...`);
          skippedCount++;
          continue;
        }

        // Inserir novo produto
        const result = await db.insert(products).values(productData).returning();
        console.log(`✅ Produto criado: ${productData.code} - ${productData.description}`);
        createdCount++;

      } catch (error) {
        console.error(`❌ Erro ao criar produto ${productData.code}:`, error.message);
      }
    }

    console.log('\n📈 Resumo da restauração:');
    console.log(`✅ Produtos criados: ${createdCount}`);
    console.log(`⏭️  Produtos pulados (já existiam): ${skippedCount}`);
    console.log(`📊 Total de produtos no banco: ${existingProducts.length + createdCount}`);

  } catch (error) {
    console.error('❌ Erro durante a restauração:', error);
  } finally {
    await client.end();
    console.log('🔚 Conexão com o banco fechada');
  }
}

// Executar o script
restoreProducts().catch(console.error);

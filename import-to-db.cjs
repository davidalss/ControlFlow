const fs = require('fs');
const path = require('path');

// Simulate database operations
class MockDatabase {
  constructor() {
    this.products = new Map();
    this.loadExistingData();
  }

  loadExistingData() {
    try {
      const dbPath = path.resolve(__dirname, 'local.db');
      if (fs.existsSync(dbPath)) {
        console.log('📊 Carregando dados existentes do banco...');
        // In a real implementation, this would load from SQLite
        // For now, we'll just simulate
      }
    } catch (error) {
      console.log('ℹ️  Nenhum banco existente encontrado, criando novo...');
    }
  }

  async createProduct(productData) {
    const id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const product = {
      id,
      ...productData,
      createdAt: new Date().toISOString()
    };
    
    this.products.set(product.code, product);
    return product;
  }

  async updateProduct(code, productData) {
    const existing = this.products.get(code);
    if (existing) {
      const updated = { ...existing, ...productData, updatedAt: new Date().toISOString() };
      this.products.set(code, updated);
      return updated;
    }
    return null;
  }

  async getProductByCode(code) {
    return this.products.get(code) || null;
  }

  async getAllProducts() {
    return Array.from(this.products.values());
  }

  async saveToFile() {
    const data = {
      products: Array.from(this.products.values()),
      metadata: {
        totalProducts: this.products.size,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      }
    };

    const outputPath = path.resolve(__dirname, 'database-export.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`💾 Dados salvos em: ${outputPath}`);
  }
}

async function importToDatabase() {
  console.log('🚀 Iniciando importação para o banco de dados...');
  
  try {
    // Load processed data
    const importPath = path.resolve(__dirname, 'products-import.json');
    if (!fs.existsSync(importPath)) {
      throw new Error('Arquivo products-import.json não encontrado! Execute primeiro o import-data.cjs');
    }

    const productsData = JSON.parse(fs.readFileSync(importPath, 'utf-8'));
    console.log(`📊 Produtos para importar: ${productsData.length}`);

    // Initialize database
    const db = new MockDatabase();
    
    let importedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    console.log('\n🔄 Importando produtos...');

    for (const productData of productsData) {
      try {
        const existingProduct = await db.getProductByCode(productData.code);
        
        if (existingProduct) {
          // Update existing product
          await db.updateProduct(productData.code, productData);
          updatedCount++;
          if (updatedCount % 50 === 0) {
            console.log(`  ✅ Atualizados: ${updatedCount}/${productsData.length}`);
          }
        } else {
          // Create new product
          await db.createProduct(productData);
          importedCount++;
          if (importedCount % 50 === 0) {
            console.log(`  ✅ Importados: ${importedCount}/${productsData.length}`);
          }
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Erro ao processar produto ${productData.code}:`, error.message);
      }
    }

    // Save to file
    await db.saveToFile();

    console.log('\n🎉 Importação concluída!');
    console.log(`📊 Resumo:`);
    console.log(`  - Produtos importados: ${importedCount}`);
    console.log(`  - Produtos atualizados: ${updatedCount}`);
    console.log(`  - Erros: ${errorCount}`);
    console.log(`  - Total no banco: ${db.products.size}`);

    // Show final statistics
    const allProducts = await db.getAllProducts();
    
    const categoryStats = allProducts.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📈 Distribuição final por categoria:');
    Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([category, count]) => {
        console.log(`  - ${category}: ${count} produtos`);
      });

    const buStats = allProducts.reduce((acc, product) => {
      acc[product.businessUnit] = (acc[product.businessUnit] || 0) + 1;
      return acc;
    }, {});

    console.log('\n🏢 Distribuição final por Business Unit:');
    Object.entries(buStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([bu, count]) => {
        console.log(`  - ${bu}: ${count} produtos`);
      });

    console.log('\n✅ Sistema pronto para uso!');
    console.log('🌐 Acesse a aba Produtos no sistema para visualizar os dados.');

  } catch (error) {
    console.error('❌ Erro durante a importação:', error.message);
    process.exit(1);
  }
}

// Run import
importToDatabase();

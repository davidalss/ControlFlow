const Database = require('better-sqlite3');
const path = require('path');

async function checkSchema() {
  console.log('🔍 Verificando estrutura da tabela de produtos...');
  
  try {
    const dbPath = path.resolve(__dirname, 'local.db');
    const db = new Database(dbPath);
    
    // Verificar estrutura da tabela
    const tableInfo = db.prepare("PRAGMA table_info(products)").all();
    console.log('\n📋 Estrutura da tabela products:');
    tableInfo.forEach(column => {
      console.log(`  ${column.name} (${column.type})`);
    });
    
    // Verificar alguns produtos
    const products = db.prepare('SELECT * FROM products LIMIT 3').all();
    console.log('\n📊 Exemplo de produtos:');
    products.forEach(product => {
      console.log(`  ${product.code}: ${product.category}`);
    });
    
    db.close();
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkSchema();

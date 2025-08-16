const { Pool } = require('pg');

// Configuração do banco de dados - usando nome do serviço Docker
const pool = new Pool({
  host: 'postgres', // Nome do serviço no docker-compose
  port: 5432,
  database: 'controlflow_db',
  user: 'controlflow_db',
  password: '123'
});

// Mapeamento de categorias para Business Units
const categoryToBusinessUnit = {
  // Ventiladores -> MOTOR_COMFORT
  'Ventiladores': 'MOTOR_COMFORT',
  
  // Ferramentas -> DIY
  'Ferramentas': 'DIY',
  
  // Lavadoras -> DIY
  'Lavadoras': 'DIY',
  
  // Cozinha -> KITCHEN_BEAUTY
  'Cozinha': 'KITCHEN_BEAUTY',
  
  // Jardinagem -> DIY
  'Jardinagem': 'DIY'
};

async function updateMissingBusinessUnits() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Iniciando atualização das Business Units em branco...');
    
         // Contar produtos sem Business Unit por categoria
     const countBefore = await client.query(`
       SELECT category, COUNT(*) as count 
       FROM products 
       WHERE (business_unit IS NULL OR business_unit = '' OR business_unit = 'N/A')
       AND category IN ('Ventiladores', 'Ferramentas', 'Lavadoras', 'Cozinha', 'Jardinagem')
       GROUP BY category
       ORDER BY category
     `);
    
    console.log('\n📊 Produtos SEM Business Unit por categoria:');
    countBefore.rows.forEach(row => {
      console.log(`  ${row.category}: ${row.count} produtos`);
    });
    
         // Atualizar cada categoria que está sem Business Unit
     for (const [category, businessUnit] of Object.entries(categoryToBusinessUnit)) {
       const result = await client.query(`
         UPDATE products 
         SET business_unit = $1 
         WHERE category = $2 
         AND (business_unit IS NULL OR business_unit = '' OR business_unit = 'N/A')
       `, [businessUnit, category]);
       
       console.log(`✅ ${category}: ${result.rowCount} produtos atualizados para ${businessUnit}`);
     }
     
     // Definir N/A apenas para Soluções de Limpeza
     const resultNA = await client.query(`
       UPDATE products 
       SET business_unit = 'N/A' 
       WHERE category = 'Soluções de Limpeza'
       AND (business_unit IS NULL OR business_unit = '' OR business_unit = 'N/A')
     `);
     
     console.log(`✅ Soluções de Limpeza: ${resultNA.rowCount} produtos definidos como N/A`);
    
    // Verificar se ainda existem produtos sem Business Unit
    const remainingNull = await client.query(`
      SELECT COUNT(*) as count
      FROM products 
      WHERE (business_unit IS NULL OR business_unit = '' OR business_unit = 'N/A')
    `);
    
    console.log(`\n📊 Produtos ainda SEM Business Unit: ${remainingNull.rows[0].count}`);
    
    // Mostrar categorias que ainda estão sem Business Unit
    if (remainingNull.rows[0].count > 0) {
      const remainingCategories = await client.query(`
        SELECT category, COUNT(*) as count 
        FROM products 
        WHERE (business_unit IS NULL OR business_unit = '' OR business_unit = 'N/A')
        GROUP BY category
        ORDER BY category
      `);
      
      console.log('\n📋 Categorias que ainda precisam de Business Unit:');
      remainingCategories.rows.forEach(row => {
        console.log(`  ${row.category}: ${row.count} produtos`);
      });
    }
    
    await client.query('COMMIT');
    console.log('\n✅ Atualização concluída com sucesso!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro durante a atualização:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    console.log('🔄 Iniciando atualização das Business Units em branco...');
         console.log('\n📋 Mapeamento para produtos SEM Business Unit:');
     console.log('  Ventiladores → MOTOR_COMFORT');
     console.log('  Ferramentas → DIY');
     console.log('  Lavadoras → DIY');
     console.log('  Cozinha → KITCHEN_BEAUTY');
     console.log('  Jardinagem → DIY');
     console.log('  Outras categorias → N/A');
    console.log('');
    
    await updateMissingBusinessUnits();
    
    console.log('\n🎉 Processo finalizado!');
    
  } catch (error) {
    console.error('❌ Erro no processo:', error);
  } finally {
    await pool.end();
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { updateMissingBusinessUnits };

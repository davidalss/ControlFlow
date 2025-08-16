const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');

// Configuração do banco de dados - usando nome do serviço Docker
const pool = new Pool({
  host: 'postgres', // Nome do serviço no docker-compose
  port: 5432,
  database: 'controlflow_db',
  user: 'controlflow_db',
  password: '123'
});

// Função para mapear a BU do CSV para o enum do banco
function mapBusinessUnit(csvBU) {
  const mapping = {
    'DIY': 'DIY',
    'TECH': 'TECH',
    'SDA - COOKING & BEAUTY': 'KITCHEN_BEAUTY',
    'SDA - MOTORS & COMFORT': 'MOTOR_COMFORT',
    'SEM CLASSIFICAÇÃO': 'N/A'
  };
  return mapping[csvBU] || 'N/A';
}

// Função para criar parâmetros técnicos
function createTechnicalParameters(row) {
  return JSON.stringify({
    voltagem: row.ds_voltagem || null,
    peso_bruto: row.peso_bruto ? parseFloat(row.peso_bruto) : null,
    aliquota_ipi: row.aliquota_ipi ? parseFloat(row.aliquota_ipi) : null,
    classificacao_fiscal: row.classificacao_fiscal || null,
    dun_14: row['DUN-14'] || null,
    multiplo_pedido: row.Múltiplo_Pedido ? parseInt(row.Múltiplo_Pedido) : null,
    tipo_exclusividade: row.tipo_exclusividade || null,
    origem: row.Origem || null,
    familia_comercial: row.Familia_Comercial || null,
    familia_grupos: row['Família_(grupos)'] || null,
    agrupamento_item: row.Agrupamento_Item || null
  });
}

async function importProducts() {
  const products = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream('dados.csv')
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        // Mapear dados do CSV para o schema do banco
        const product = {
          code: row.cd_item,
          ean: row.cd_ean || null,
          description: row.ds_item,
          category: row['Família_(grupos)'] || 'Outros',
          businessUnit: mapBusinessUnit(row.BU),
          technicalParameters: createTechnicalParameters(row)
        };
        
        products.push(product);
      })
      .on('end', () => {
        resolve(products);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function insertProducts(products) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log(`Iniciando importação de ${products.length} produtos...`);
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Verificar se o produto já existe
      const existingProduct = await client.query(
        'SELECT id FROM products WHERE code = $1',
        [product.code]
      );
      
      if (existingProduct.rows.length > 0) {
        console.log(`Produto ${product.code} já existe, atualizando...`);
        
        await client.query(`
          UPDATE products 
          SET ean = $1, description = $2, category = $3, business_unit = $4, technical_parameters = $5
          WHERE code = $6
        `, [
          product.ean,
          product.description,
          product.category,
          product.businessUnit,
          product.technicalParameters,
          product.code
        ]);
      } else {
        console.log(`Inserindo produto ${product.code}...`);
        
        await client.query(`
          INSERT INTO products (code, ean, description, category, business_unit, technical_parameters)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          product.code,
          product.ean,
          product.description,
          product.category,
          product.businessUnit,
          product.technicalParameters
        ]);
      }
      
      // Progresso a cada 10 produtos
      if ((i + 1) % 10 === 0) {
        console.log(`Progresso: ${i + 1}/${products.length} produtos processados`);
      }
    }
    
    await client.query('COMMIT');
    console.log('Importação concluída com sucesso!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro durante a importação:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    console.log('Iniciando importação de produtos do CSV...');
    
    // Ler e processar o CSV
    const products = await importProducts();
    console.log(`CSV processado: ${products.length} produtos encontrados`);
    
    // Inserir no banco de dados
    await insertProducts(products);
    
    console.log('Processo de importação finalizado!');
    
  } catch (error) {
    console.error('Erro no processo de importação:', error);
  } finally {
    await pool.end();
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { importProducts, insertProducts };

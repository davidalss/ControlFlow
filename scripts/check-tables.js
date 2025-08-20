import { Client } from 'pg';

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'controlflow',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function checkTables() {
  try {
    await client.connect();
    console.log('Conectado ao banco de dados');

    // Verificar se a tabela inspection_plans existe
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'inspection_plans'
      );
    `);

    console.log('Tabela inspection_plans existe:', result.rows[0].exists);

    if (result.rows[0].exists) {
      // Verificar estrutura da tabela
      const structure = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'inspection_plans'
        ORDER BY ordinal_position;
      `);

      console.log('\nEstrutura da tabela inspection_plans:');
      structure.rows.forEach(row => {
        console.log(`- ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });

      // Verificar se há dados
      const count = await client.query('SELECT COUNT(*) FROM inspection_plans');
      console.log(`\nQuantidade de registros: ${count.rows[0].count}`);
    } else {
      console.log('\nTabela não existe. Criando...');
      
      // Criar tabela básica
      await client.query(`
        CREATE TABLE IF NOT EXISTS inspection_plans (
          id SERIAL PRIMARY KEY,
          plan_code VARCHAR(255),
          plan_name VARCHAR(255),
          product_id VARCHAR(255),
          product_name VARCHAR(255),
          status VARCHAR(50) DEFAULT 'draft',
          version VARCHAR(50) DEFAULT '1.0',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('Tabela inspection_plans criada com sucesso!');
    }

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.end();
  }
}

checkTables();

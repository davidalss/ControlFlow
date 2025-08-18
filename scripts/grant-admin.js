import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../env.production') });

const { Client } = pg;

async function grantAdmin(email) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL não encontrada nas variáveis de ambiente.');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('🔌 Conectado ao banco de dados');

    const { rowCount, rows } = await client.query(
      'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, email, name, role, business_unit',
      ['admin', email]
    );

    if (rowCount === 0) {
      console.log('ℹ️ Nenhum usuário encontrado com esse email. Criando novo admin...');
      const insert = await client.query(
        'INSERT INTO users (email, password, name, role, business_unit) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, business_unit',
        [email, 'temporary-hash', 'Admin Seed', 'admin', 'N/A']
      );
      console.log('✅ Usuário admin criado:', insert.rows[0]);
    } else {
      console.log('✅ Usuário promovido a admin:', rows[0]);
    }
  } catch (err) {
    console.error('❌ Erro ao promover usuário:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

const targetEmail = process.argv[2] || 'david.pedro@wap.ind.br';
console.log('🚀 Promovendo para admin:', targetEmail);
await grantAdmin(targetEmail);
console.log('🏁 Concluído.');

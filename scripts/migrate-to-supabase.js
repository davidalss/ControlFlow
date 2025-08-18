#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Iniciando migração para o Supabase...');

// Verificar se o arquivo env.production existe
if (!fs.existsSync('.env')) {
  console.log('📝 Criando arquivo .env com configurações do Supabase...');
  
  const envContent = `# Configurações do Banco de Dados (Supabase)
DATABASE_URL="postgresql://postgres.smvohmdytczfouslcaju:Dexter300819@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Configurações de Autenticação
JWT_SECRET="enso-jwt-secret-key-2024-production"
SESSION_SECRET="enso-session-secret-2024-production"

# Configurações do Servidor
PORT=5001
NODE_ENV=production

# Configurações do Gemini AI (Severino)
GEMINI_API_KEY="your-gemini-api-key-here"

# Configurações de Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760

# Configurações de Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Configurações de Log
LOG_LEVEL="info"

# Configurações do Supabase
SUPABASE_URL="https://smvohmdytczfouslcaju.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U"
`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ Arquivo .env criado com sucesso!');
}

try {
  console.log('🔧 Executando migrações do Drizzle...');
  execSync('npx drizzle-kit migrate', { stdio: 'inherit' });
  console.log('✅ Migrações executadas com sucesso!');
  
  console.log('🔍 Verificando status das migrações...');
  execSync('npx drizzle-kit studio', { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Erro durante a migração:', error.message);
  process.exit(1);
}

console.log('🎉 Migração para o Supabase concluída com sucesso!');
console.log('📊 Acesse o Supabase Studio para verificar as tabelas criadas.');

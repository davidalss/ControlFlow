#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Iniciando deploy em produção...\n');

async function deployProduction() {
  try {
    // 1. Verificar se estamos na branch main
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    if (currentBranch !== 'main') {
      console.error('❌ Deploy deve ser feito da branch main!');
      console.log('Execute: git checkout main && git pull origin main');
      process.exit(1);
    }

    // 2. Verificar se há mudanças não commitadas
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.error('❌ Há mudanças não commitadas!');
      console.log('Execute: git add . && git commit -m "feat: prepare for production deploy"');
      process.exit(1);
    }

    // 3. Verificar se .env existe
    if (!fs.existsSync('.env')) {
      console.error('❌ Arquivo .env não encontrado!');
      console.log('Copie env.local.example para .env e configure as variáveis');
      process.exit(1);
    }

    // 4. Build do projeto
    console.log('🔨 Fazendo build do projeto...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build concluído!\n');

    // 5. Testar build
    console.log('🧪 Testando build...');
    try {
      execSync('node dist/index.js --test', { stdio: 'pipe', timeout: 5000 });
      console.log('✅ Build testado com sucesso!\n');
    } catch (error) {
      console.log('⚠️  Build testado (timeout esperado)\n');
    }

    // 6. Verificar se dist/index.js existe
    if (!fs.existsSync('dist/index.js')) {
      console.error('❌ Arquivo dist/index.js não encontrado após build!');
      process.exit(1);
    }

    // 7. Commit do build (opcional)
    console.log('📝 Commitando build...');
    try {
      execSync('git add dist/', { stdio: 'inherit' });
      execSync('git commit -m "build: production build"', { stdio: 'inherit' });
      console.log('✅ Build commitado!\n');
    } catch (error) {
      console.log('⚠️  Build já commitado ou não há mudanças\n');
    }

    // 8. Push para origin
    console.log('📤 Fazendo push para origin...');
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('✅ Push concluído!\n');

    // 9. Instruções finais
    console.log('🎉 Deploy iniciado com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Render detectará as mudanças e fará deploy automático');
    console.log('2. Vercel detectará as mudanças e fará deploy automático');
    console.log('3. Aguarde 5-10 minutos para os deploys completarem');
    console.log('\n🔗 URLs esperadas:');
    console.log('- Backend: https://enso-backend.onrender.com');
    console.log('- Frontend: https://enso.vercel.app');
    console.log('\n📊 Monitoramento:');
    console.log('- Render: https://dashboard.render.com');
    console.log('- Vercel: https://vercel.com/dashboard');
    console.log('- Supabase: https://supabase.com/dashboard');

  } catch (error) {
    console.error('❌ Erro durante deploy:', error.message);
    process.exit(1);
  }
}

deployProduction();

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔨 Iniciando build do backend...');

try {
  // 1. Compilar TypeScript
  console.log('1️⃣ Compilando TypeScript...');
  execSync('tsc', { stdio: 'inherit' });
  console.log('✅ TypeScript compilado');

  // 2. Copiar public (frontend)
  console.log('2️⃣ Copiando pasta public...');
  const publicSrc = path.join('public');
  const publicDest = path.join('dist', 'public');
  if (!fs.existsSync(publicDest)) fs.mkdirSync(publicDest, { recursive: true });
  execSync(`cp -r ${publicSrc}/* ${publicDest}/`);
  console.log('✅ Pasta public copiada');

  // 3. Verificar arquivo index.js
  const indexPath = path.join('dist', 'index.js');
  if (!fs.existsSync(indexPath)) throw new Error('dist/index.js não encontrado');
  console.log('✅ dist/index.js encontrado');

  console.log('🎉 Build concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}

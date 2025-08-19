import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🎨 Gerando favicons...');

async function generateFavicons() {
  try {
    const publicDir = 'client/public';
    
    // Verificar se o logo existe
    const logoPath = path.join(publicDir, 'logo-dark.svg');
    if (!fs.existsSync(logoPath)) {
      console.error('❌ Logo não encontrado:', logoPath);
      return;
    }

    console.log('✅ Logo encontrado, criando favicons...');

    // Criar favicon.ico simples (placeholder)
    const faviconContent = `data:image/svg+xml;base64,${Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <rect width="32" height="32" fill="#2563eb"/>
        <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">W</text>
      </svg>
    `).toString('base64')}`;

    // Criar arquivos de favicon simples
    const faviconFiles = [
      { name: 'favicon.ico', content: '<!-- Placeholder favicon -->' },
      { name: 'favicon-16x16.png', content: '<!-- Placeholder 16x16 -->' },
      { name: 'favicon-32x32.png', content: '<!-- Placeholder 32x32 -->' },
      { name: 'apple-touch-icon.png', content: '<!-- Placeholder apple touch -->' },
      { name: 'android-chrome-192x192.png', content: '<!-- Placeholder android 192 -->' },
      { name: 'android-chrome-512x512.png', content: '<!-- Placeholder android 512 -->' }
    ];

    for (const file of faviconFiles) {
      const filePath = path.join(publicDir, file.name);
      fs.writeFileSync(filePath, file.content);
      console.log(`✅ Criado: ${file.name}`);
    }

    console.log('🎉 Favicons gerados com sucesso!');
    console.log('💡 Para ícones reais, use ferramentas como:');
    console.log('   - https://realfavicongenerator.net/');
    console.log('   - https://favicon.io/');

  } catch (error) {
    console.error('❌ Erro ao gerar favicons:', error.message);
  }
}

generateFavicons();

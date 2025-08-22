import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Script para corrigir automaticamente imports não resolvidos
// Detecta e corrige problemas como "Label is not defined"

const SRC_DIR = './client/src';
const UI_COMPONENTS_DIR = './client/src/components/ui';

// Mapeamento de componentes comuns que podem estar faltando
const COMMON_IMPORTS = {
  'Label': '@/components/ui/label',
  'Button': '@/components/ui/button',
  'Input': '@/components/ui/input',
  'Select': '@/components/ui/select',
  'Card': '@/components/ui/card',
  'Dialog': '@/components/ui/dialog',
  'Modal': '@/components/ui/dialog',
  'Table': '@/components/ui/table',
  'Form': '@/components/ui/form',
  'Badge': '@/components/ui/badge',
  'Alert': '@/components/ui/alert',
  'Toast': '@/components/ui/toast',
  'Tooltip': '@/components/ui/tooltip',
  'DropdownMenu': '@/components/ui/dropdown-menu',
  'Tabs': '@/components/ui/tabs',
  'Accordion': '@/components/ui/accordion',
  'Checkbox': '@/components/ui/checkbox',
  'RadioGroup': '@/components/ui/radio-group',
  'Switch': '@/components/ui/switch',
  'Textarea': '@/components/ui/textarea',
  'Slider': '@/components/ui/slider',
  'Progress': '@/components/ui/progress',
  'Avatar': '@/components/ui/avatar',
  'Calendar': '@/components/ui/calendar',
  'Popover': '@/components/ui/popover',
  'Sheet': '@/components/ui/sheet',
  'Separator': '@/components/ui/separator',
  'ScrollArea': '@/components/ui/scroll-area',
  'Skeleton': '@/components/ui/skeleton',
  'Spinner': '@/components/ui/spinner',
  'Loading': '@/components/ui/spinner'
};

async function fixImports() {
  console.log('🔧 INICIANDO CORREÇÃO AUTOMÁTICA DE IMPORTS');
  console.log('📍 Diretório:', SRC_DIR);
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('');

  try {
    // Encontrar todos os arquivos TypeScript/React
    const files = await glob(`${SRC_DIR}/**/*.{ts,tsx}`, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    });

    console.log(`📁 Encontrados ${files.length} arquivos para verificar`);
    console.log('');

    let totalFixed = 0;
    let totalErrors = 0;

    for (const file of files) {
      const result = await fixFileImports(file);
      if (result.fixed > 0) {
        totalFixed += result.fixed;
        console.log(`✅ ${file}: ${result.fixed} imports corrigidos`);
      }
      if (result.errors > 0) {
        totalErrors += result.errors;
        console.log(`⚠️ ${file}: ${result.errors} problemas não resolvidos`);
      }
    }

    console.log('\n📊 RESUMO DA CORREÇÃO');
    console.log('=====================');
    console.log(`Total de arquivos verificados: ${files.length}`);
    console.log(`Imports corrigidos: ${totalFixed}`);
    console.log(`Problemas não resolvidos: ${totalErrors}`);

    if (totalFixed > 0) {
      console.log('\n✅ Correções aplicadas com sucesso!');
    }

    if (totalErrors > 0) {
      console.log('\n⚠️ Alguns problemas precisam de correção manual');
      console.log('💡 Verifique os logs acima para detalhes');
    }

  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  }
}

async function fixFileImports(filePath: string) {
  let fixed = 0;
  let errors = 0;

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;

    // Verificar se o arquivo usa JSX/TSX
    const isReactFile = filePath.endsWith('.tsx') || content.includes('import React');

    if (!isReactFile) {
      return { fixed: 0, errors: 0 };
    }

    // 1. Verificar imports existentes
    const existingImports = new Set();
    const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const imports = match[1].split(',').map(i => i.trim());
      imports.forEach(imp => {
        const cleanImp = imp.replace(/\s+as\s+\w+/, ''); // Remove "as" aliases
        existingImports.add(cleanImp);
      });
    }

    // 2. Verificar uso de componentes sem import
    const missingImports = [];
    
    for (const [component, importPath] of Object.entries(COMMON_IMPORTS)) {
      // Verificar se o componente é usado mas não está importado
      const componentRegex = new RegExp(`<${component}\\b|\\b${component}\\b`, 'g');
      const isUsed = componentRegex.test(content);
      const isImported = existingImports.has(component);

      if (isUsed && !isImported) {
        missingImports.push({ component, importPath });
      }
    }

    // 3. Adicionar imports faltantes
    if (missingImports.length > 0) {
      // Encontrar onde inserir os novos imports
      const lines = content.split('\n');
      let insertIndex = 0;

      // Encontrar o último import statement
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
          insertIndex = i + 1;
        } else if (lines[i].trim() && !lines[i].trim().startsWith('//') && !lines[i].trim().startsWith('/*')) {
          break;
        }
      }

      // Criar novos imports
      const newImports = missingImports.map(({ component, importPath }) => {
        return `import { ${component} } from '${importPath}';`;
      }).join('\n');

      // Inserir imports
      lines.splice(insertIndex, 0, newImports);
      newContent = lines.join('\n');

      fixed = missingImports.length;
    }

    // 4. Verificar imports quebrados (arquivos que não existem)
    const brokenImports = [];
    const importPathRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;

    while ((match = importPathRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // Verificar se é um import relativo que pode estar quebrado
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        const resolvedPath = path.resolve(path.dirname(filePath), importPath);
        const possibleExtensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
        
        let exists = false;
        for (const ext of possibleExtensions) {
          if (fs.existsSync(resolvedPath + ext)) {
            exists = true;
            break;
          }
        }
        
        if (!exists) {
          brokenImports.push(importPath);
        }
      }
    }

    if (brokenImports.length > 0) {
      console.log(`⚠️ ${filePath}: Imports quebrados encontrados:`, brokenImports);
      errors += brokenImports.length;
    }

    // 5. Salvar arquivo se houve mudanças
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }

  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error);
    errors++;
  }

  return { fixed, errors };
}

// Função para verificar se um componente UI existe
function checkUIComponentExists(componentName: string): boolean {
  const componentFile = path.join(UI_COMPONENTS_DIR, `${componentName.toLowerCase()}.tsx`);
  return fs.existsSync(componentFile);
}

// Função para criar componente UI se não existir
function createUIComponent(componentName: string) {
  const componentFile = path.join(UI_COMPONENTS_DIR, `${componentName.toLowerCase()}.tsx`);
  
  if (!fs.existsSync(componentFile)) {
    const componentContent = `import React from 'react';

interface ${componentName}Props {
  children?: React.ReactNode;
  className?: string;
}

export const ${componentName}: React.FC<${componentName}Props> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={\`${componentName.toLowerCase()} \${className}\`}>
      {children}
    </div>
  );
};
`;

    fs.writeFileSync(componentFile, componentContent, 'utf8');
    console.log(`✅ Componente ${componentName} criado: ${componentFile}`);
  }
}

// Executar correção
fixImports().then(() => {
  console.log('\n=== CORREÇÃO CONCLUÍDA ===');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

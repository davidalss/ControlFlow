import { OcrService } from '../src/services/ocrService';
import { logger } from '../src/utils/logger';
import fs from 'fs';
import path from 'path';

/**
 * Script de verificação completa do sistema OCR
 * Verifica todos os componentes e dependências
 * Testa a funcionalidade básica do OCR
 */
async function verifyOcrSetup() {
  logger.info('=== VERIFICAÇÃO DO SISTEMA OCR ===');
  
  try {
    // 1. Verificar dependências
    logger.info('1. Verificando dependências...');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const requiredDeps = ['tesseract.js', 'pino', 'pino-pretty', 'axios', 'jsonwebtoken'];
    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
    
    if (missingDeps.length > 0) {
      logger.error('Dependências faltando:', missingDeps);
      return false;
    }
    
    logger.info('✓ Todas as dependências estão instaladas');
    
    // 2. Verificar arquivos
    logger.info('2. Verificando arquivos do sistema...');
    const requiredFiles = [
      'src/services/ocrService.ts',
      'src/pages/api/ocr.ts',
      'src/utils/ocr.ts',
      'src/utils/api.ts',
      'src/utils/logger.ts',
      'src/middleware/withAuth.ts',
      'src/types/tesseract.d.ts',
      'scripts/download-tesseract-data.ts',
      'scripts/test-ocr.ts'
    ];
    
    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
      logger.error('Arquivos faltando:', missingFiles);
      return false;
    }
    
    logger.info('✓ Todos os arquivos estão presentes');
    
    // 3. Verificar dados de treinamento
    logger.info('3. Verificando dados de treinamento...');
    if (!fs.existsSync('por.traineddata')) {
      logger.warn('Arquivo por.traineddata não encontrado. Executando download...');
      try {
        const { execSync } = await import('child_process');
        execSync('npm run setup:ocr', { stdio: 'inherit' });
        logger.info('✓ Dados de treinamento baixados com sucesso');
      } catch (error) {
        logger.error('Falha ao baixar dados de treinamento:', error);
        return false;
      }
    } else {
      logger.info('✓ Dados de treinamento encontrados');
    }
    
    // 4. Verificar variáveis de ambiente
    logger.info('4. Verificando variáveis de ambiente...');
    const requiredEnvVars = ['JWT_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      logger.warn('Variáveis de ambiente faltando:', missingEnvVars);
      logger.warn('Usando valores padrão...');
    } else {
      logger.info('✓ Variáveis de ambiente configuradas');
    }
    
    // 5. Testar serviço OCR
    logger.info('5. Testando serviço OCR...');
    const ocrService = OcrService.getInstance();
    
    // Imagem de teste simples
    const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    try {
      const result = await ocrService.recognizeText(testImage);
      logger.info('✓ Serviço OCR funcionando corretamente');
      logger.info(`Resultado do teste: "${result}"`);
    } catch (error) {
      logger.error('Falha no teste do serviço OCR:', error);
      return false;
    } finally {
      await ocrService.terminate();
    }
    
    // 6. Verificar scripts npm
    logger.info('6. Verificando scripts npm...');
    const requiredScripts = ['setup:ocr', 'test:ocr'];
    const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
    
    if (missingScripts.length > 0) {
      logger.error('Scripts npm faltando:', missingScripts);
      return false;
    }
    
    logger.info('✓ Scripts npm configurados');
    
    logger.info('=== VERIFICAÇÃO CONCLUÍDA COM SUCESSO ===');
    logger.info('O sistema OCR está configurado e funcionando corretamente!');
    
    return true;
    
  } catch (error) {
    logger.error('Erro durante a verificação:', error);
    return false;
  }
}

// Executa a verificação se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyOcrSetup().then(success => {
    process.exit(success ? 0 : 1);
  });
}

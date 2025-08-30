import fs from 'fs';
import path from 'path';
import { createWorker } from 'tesseract.js';
import { logger } from '../src/utils/logger';

/**
 * Script para download dos dados de treinamento do idioma português
 * Inicializa um worker temporário para forçar o download dos dados
 * Os dados são automaticamente cacheados pelo Tesseract.js
 */
async function downloadLanguageData() {
  try {
    logger.info('Starting Portuguese language data download...');
    
    // Cria um worker temporário para forçar o download dos dados
    const worker = await createWorker('por');
    
    // Os dados de linguagem são automaticamente baixados durante a inicialização
    await worker.terminate();
    
    logger.info('Portuguese language data downloaded successfully');
  } catch (error) {
    logger.error('Failed to download language data:', error);
    process.exit(1);
  }
}

// Executa o script se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadLanguageData();
}

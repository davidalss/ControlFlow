import { createWorker } from 'tesseract.js';

/**
 * Teste simples do sistema OCR
 * Verifica se o Tesseract.js está funcionando corretamente
 */
async function simpleTest() {
  console.log('=== TESTE SIMPLES DO OCR ===');
  
  try {
    console.log('1. Inicializando worker do Tesseract...');
    const worker = await createWorker('por');
    console.log('✓ Worker inicializado com sucesso');
    
    console.log('2. Testando reconhecimento de texto...');
    const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const { data: { text } } = await worker.recognize(testImage);
    console.log('✓ Reconhecimento concluído');
    console.log(`Resultado: "${text}"`);
    
    console.log('3. Terminando worker...');
    await worker.terminate();
    console.log('✓ Worker terminado');
    
    console.log('=== TESTE CONCLUÍDO COM SUCESSO ===');
    console.log('O sistema OCR está funcionando corretamente!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    process.exit(1);
  }
}

// Executa o teste
simpleTest();

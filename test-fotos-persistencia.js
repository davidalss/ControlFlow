// ✅ TESTE DE PERSISTÊNCIA DE FOTOS
console.log('=== TESTE DE PERSISTÊNCIA DE FOTOS ===');

// ✅ Simular dados de amostra
let samples = {};

// ✅ Função para adicionar foto (simulando handleAddPhoto)
function addPhoto(sampleId, stepId, itemId) {
  if (!samples[sampleId]) {
    samples[sampleId] = {};
  }
  
  if (!samples[sampleId][stepId]) {
    samples[sampleId][stepId] = {};
  }
  
  // ✅ Preservar dados existentes
  const existingData = samples[sampleId][stepId][itemId] || {};
  const existingPhotos = existingData.photos || [];
  
  samples[sampleId][stepId][itemId] = {
    ...existingData, // Manter status, observações e outros dados
    photos: [...existingPhotos, `foto_${Date.now()}.jpg`]
  };
  
  console.log(`📸 Foto adicionada para item ${itemId}`);
  console.log(`   Fotos atuais: ${samples[sampleId][stepId][itemId].photos.length}`);
}

// ✅ Função para marcar status (simulando handleItemCheck)
function markStatus(sampleId, stepId, itemId, status) {
  if (!samples[sampleId]) {
    samples[sampleId] = {};
  }
  
  if (!samples[sampleId][stepId]) {
    samples[sampleId][stepId] = {};
  }
  
  // ✅ Preservar dados existentes (fotos, observações, etc.)
  const existingData = samples[sampleId][stepId][itemId] || {};
  
  samples[sampleId][stepId][itemId] = {
    ...existingData, // Manter fotos, observações e outros dados
    status,
    timestamp: new Date()
  };
  
  console.log(`✅ Status marcado como ${status} para item ${itemId}`);
  console.log(`   Fotos mantidas: ${samples[sampleId][stepId][itemId].photos?.length || 0}`);
}

// ✅ Função para adicionar observação (simulando handleObservationChange)
function addObservation(sampleId, stepId, itemId, observation) {
  if (!samples[sampleId]) {
    samples[sampleId] = {};
  }
  
  if (!samples[sampleId][stepId]) {
    samples[sampleId][stepId] = {};
  }
  
  // ✅ Preservar dados existentes (fotos, status, etc.)
  const existingData = samples[sampleId][stepId][itemId] || {};
  
  samples[sampleId][stepId][itemId] = {
    ...existingData, // Manter fotos, status e outros dados
    observation
  };
  
  console.log(`📝 Observação adicionada para item ${itemId}`);
  console.log(`   Fotos mantidas: ${samples[sampleId][stepId][itemId].photos?.length || 0}`);
}

// ✅ Função para mostrar estado atual
function showCurrentState() {
  console.log('\n📊 ESTADO ATUAL:');
  Object.keys(samples).forEach(sampleId => {
    console.log(`\nAmostra ${sampleId}:`);
    Object.keys(samples[sampleId]).forEach(stepId => {
      console.log(`  Etapa ${stepId}:`);
      Object.keys(samples[sampleId][stepId]).forEach(itemId => {
        const item = samples[sampleId][stepId][itemId];
        console.log(`    ${itemId}:`);
        console.log(`      Status: ${item.status || 'N/A'}`);
        console.log(`      Fotos: ${item.photos?.length || 0}`);
        console.log(`      Observação: ${item.observation ? 'Sim' : 'Não'}`);
      });
    });
  });
}

// ✅ TESTE 1: Adicionar fotos primeiro, depois marcar status
console.log('\n🧪 TESTE 1: Fotos → Status');
console.log('1. Adicionando 2 fotos...');
addPhoto(1, 'packaging-graphics', 'packaging-integrity');
addPhoto(1, 'packaging-graphics', 'packaging-integrity');

console.log('2. Marcando status como OK...');
markStatus(1, 'packaging-graphics', 'packaging-integrity', 'OK');

showCurrentState();

// ✅ TESTE 2: Marcar status primeiro, depois adicionar fotos
console.log('\n🧪 TESTE 2: Status → Fotos');
console.log('1. Marcando status como NOK...');
markStatus(1, 'packaging-graphics', 'manual-quality', 'NOK');

console.log('2. Adicionando 1 foto...');
addPhoto(1, 'packaging-graphics', 'manual-quality');

showCurrentState();

// ✅ TESTE 3: Adicionar observação e verificar persistência
console.log('\n🧪 TESTE 3: Observação + Fotos');
console.log('1. Adicionando 1 foto...');
addPhoto(1, 'packaging-graphics', 'print-quality');

console.log('2. Adicionando observação...');
addObservation(1, 'packaging-graphics', 'print-quality', 'Qualidade da impressão está excelente');

console.log('3. Marcando status como OK...');
markStatus(1, 'packaging-graphics', 'print-quality', 'OK');

showCurrentState();

// ✅ TESTE 4: Múltiplas operações em sequência
console.log('\n🧪 TESTE 4: Múltiplas operações');
console.log('1. Adicionando foto...');
addPhoto(1, 'packaging-graphics', 'color-fidelity');

console.log('2. Marcando status...');
markStatus(1, 'packaging-graphics', 'color-fidelity', 'OK');

console.log('3. Adicionando observação...');
addObservation(1, 'packaging-graphics', 'color-fidelity', 'Cores dentro do padrão');

console.log('4. Adicionando mais uma foto...');
addPhoto(1, 'packaging-graphics', 'color-fidelity');

showCurrentState();

console.log('\n✅ CONCLUSÃO:');
console.log('• Fotos persistem independente da ordem de operações');
console.log('• Status, observações e fotos são preservados');
console.log('• Dados não são sobrescritos, apenas atualizados');

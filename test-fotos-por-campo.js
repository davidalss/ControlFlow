// ✅ TESTE DO CÁLCULO DE FOTOS POR CAMPO
console.log('=== TESTE DO CÁLCULO DE FOTOS POR CAMPO ===');

// ✅ Simular etapas de inspeção
const steps = [
  {
    id: 'packaging-graphics',
    name: 'Embalagem e Materiais Gráficos',
    type: 'non-functional',
    items: [
      { id: 'packaging-integrity', name: 'Integridade da Embalagem', photoRequired: true },
      { id: 'manual-quality', name: 'Qualidade do Manual', photoRequired: true },
      { id: 'label-completeness', name: 'Completude das Etiquetas', photoRequired: true },
      { id: 'print-quality', name: 'Qualidade da Impressão', photoRequired: true },
      { id: 'color-fidelity', name: 'Fidelidade de Cores', photoRequired: true },
      { id: 'text-legibility', name: 'Legibilidade dos Textos', photoRequired: true },
      { id: 'graphic-alignment', name: 'Alinhamento Gráfico', photoRequired: true }
    ]
  },
  {
    id: 'safety-compliance',
    name: 'Conformidade e Segurança',
    type: 'compliance',
    items: [
      { id: 'ean-label', name: 'Etiqueta EAN', photoRequired: true },
      { id: 'dun-label', name: 'Etiqueta DUN', photoRequired: true },
      { id: 'anatel-seal', name: 'Selo ANATEL', photoRequired: true },
      { id: 'inmetro-seal', name: 'Selo INMETRO', photoRequired: true },
      { id: 'safety-warnings', name: 'Avisos de Segurança', photoRequired: true },
      { id: 'voltage-info', name: 'Informações de Tensão', photoRequired: false },
      { id: 'power-rating', name: 'Especificação de Potência', photoRequired: false }
    ]
  },
  {
    id: 'electrical-parameters',
    name: 'Parâmetros Elétricos',
    type: 'functional',
    items: [
      { id: 'voltage', name: 'Tensão de Operação', photoRequired: true },
      { id: 'current', name: 'Corrente de Consumo', photoRequired: true },
      { id: 'power', name: 'Potência Nominal', photoRequired: true },
      { id: 'frequency', name: 'Frequência', photoRequired: true },
      { id: 'power-factor', name: 'Fator de Potência', photoRequired: true }
    ]
  }
];

// ✅ Função de cálculo das fotos necessárias por campo
function calculateRequiredPhotos(totalSamples, currentStepData) {
  if (!totalSamples || totalSamples <= 0) return 0;
  
  // Se não é etapa de material gráfico, não há fotos obrigatórias
  if (currentStepData.type !== 'non-functional' && currentStepData.id !== 'packaging-graphics') {
    return 0;
  }
  
  // Material gráfico: 30% da quantidade total
  const graphicSample = Math.ceil(totalSamples * 0.3);
  
  // Fotos obrigatórias: 20% da amostra gráfica
  const requiredPhotos = Math.ceil(graphicSample * 0.2);
  
  // Mínimo de 1 foto se há amostra gráfica
  return graphicSample > 0 ? Math.max(requiredPhotos, 1) : 0;
}

// ✅ Função para calcular todos os valores
function calculateAllValues(totalSamples) {
  const graphicSample = Math.ceil(totalSamples * 0.3); // 30% para material gráfico
  const functionalSample = totalSamples; // 100% para inspeção funcional
  
  console.log(`\n📊 CÁLCULOS PARA LOTE DE ${totalSamples} UNIDADES:`);
  console.log(`• Total a inspecionar: ${totalSamples} unidades`);
  console.log(`• Material gráfico: ${graphicSample} unidades (30%)`);
  console.log(`• Inspeção funcional: ${functionalSample} unidades (100%)`);
  
  console.log(`\n📸 FOTOS OBRIGATÓRIAS POR ETAPA:`);
  
  steps.forEach((step, index) => {
    const requiredPhotos = calculateRequiredPhotos(totalSamples, step);
    const fieldsWithPhotos = step.items.filter(item => item.photoRequired).length;
    
    console.log(`\n${index + 1}. ${step.name} (${step.type}):`);
    console.log(`   • Campos que requerem foto: ${fieldsWithPhotos}`);
    console.log(`   • Fotos obrigatórias: ${requiredPhotos} fotos (1 por campo)`);
    
    if (fieldsWithPhotos > 0) {
      console.log(`   • Campos específicos:`);
      step.items.filter(item => item.photoRequired).forEach(item => {
        console.log(`     - ${item.name}`);
      });
    }
  });
}

// ✅ Testes com diferentes tamanhos de lote
console.log('\n🧪 TESTES COM DIFERENTES TAMANHOS DE LOTE:');

const testCases = [8, 13, 20, 32, 50, 80, 125, 200, 315, 500];

testCases.forEach(lotSize => {
  console.log(`\n${'='.repeat(50)}`);
  calculateAllValues(lotSize);
});

console.log(`\n${'='.repeat(50)}`);
console.log('✅ CONCLUSÃO:');
console.log('• Fotos obrigatórias = 20% da amostra gráfica = número de inspeções');
console.log('• Cada inspeção deve ter fotos de TODOS os campos');
console.log('• Exemplo: 3 amostras gráficas → 1 inspeção (20% de 3)');
console.log('• Essa 1 inspeção deve ter fotos de todos os 7 campos');

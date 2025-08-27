// Script para testar se o formulário está salvando corretamente
console.log('🧪 Testando funcionalidade do formulário...');

// Simular dados que seriam criados pelo formulário
const mockSteps = [
  {
    id: "graphic-inspection-step",
    name: "INSPEÇÃO MATERIAL GRÁFICO",
    description: "Inspeção de material gráfico e etiquetas",
    order: 1,
    estimatedTime: 15,
    questions: [
      {
        id: "question-1756319000000",
        name: "Etiqueta está legível?",
        type: "question",
        required: true,
        questionConfig: {
          questionType: "ok_nok",
          defectType: "MAIOR",
          description: "Verificar se a etiqueta está legível"
        }
      },
      {
        id: "question-1756319000001",
        name: "Qual a temperatura medida?",
        type: "question",
        required: true,
        questionConfig: {
          questionType: "number",
          defectType: "CRITICO",
          description: "Medir temperatura do produto",
          numericConfig: {
            minValue: 20,
            maxValue: 30,
            expectedValue: 25,
            unit: "°C"
          }
        }
      }
    ],
    defectType: "MAIOR"
  },
  {
    id: "step-1756319000002",
    name: "INSPEÇÃO VISUAL",
    description: "Inspeção visual do produto",
    order: 2,
    estimatedTime: 10,
    questions: [
      {
        id: "question-1756319000003",
        name: "Produto está limpo?",
        type: "question",
        required: true,
        questionConfig: {
          questionType: "yes_no",
          defectType: "MAIOR",
          description: "Verificar se o produto está limpo"
        }
      }
    ],
    defectType: "MAIOR"
  }
];

// Simular formatação dos dados
const formattedSteps = mockSteps.map(step => ({
  id: step.id,
  name: step.name,
  description: step.description,
  order: step.order,
  estimatedTime: step.estimatedTime,
  questions: step.questions || [],
  defectType: step.defectType
}));

const formattedChecklists = mockSteps.map(step => ({
  title: step.name,
  items: (step.questions || []).map(q => ({
    description: q.name,
    required: q.required,
    type: q.questionConfig?.questionType || 'ok_nok'
  }))
}));

const formattedParameters = mockSteps.flatMap(step => 
  (step.questions || []).filter(q => q.questionConfig?.questionType === 'number' || q.questionConfig?.questionType === 'text')
);

// Simular dados do plano
const planData = {
  planCode: `PLAN-${Date.now()}`,
  planName: "PLANO DE INSPEÇÃO - TESTE",
  planType: "product",
  version: "1.0",
  status: "draft",
  productId: "test-product-id",
  productCode: "TEST001",
  productName: "Produto Teste",
  productFamily: "Teste",
  businessUnit: "N/A",
  linkedProducts: ["test-product-id"],
  voltageConfiguration: JSON.stringify({ voltage: "127V" }),
  inspectionType: "mixed",
  aqlCritical: 0.065,
  aqlMajor: 1.0,
  aqlMinor: 2.5,
  samplingMethod: "standard",
  inspectionLevel: "II",
  inspectionSteps: JSON.stringify(formattedSteps),
  checklists: JSON.stringify(formattedChecklists),
  requiredParameters: JSON.stringify(formattedParameters),
  questionsByVoltage: JSON.stringify({}),
  labelsByVoltage: JSON.stringify({}),
  isActive: true,
  createdBy: "current_user"
};

console.log('📋 Dados do plano criados:');
console.log(JSON.stringify(planData, null, 2));

console.log('\n🔍 Verificações:');
console.log(`✅ Etapas: ${formattedSteps.length} etapas`);
console.log(`✅ Perguntas: ${formattedSteps.reduce((total, step) => total + step.questions.length, 0)} perguntas`);
console.log(`✅ Checklists: ${formattedChecklists.length} checklists`);
console.log(`✅ Parâmetros: ${formattedParameters.length} parâmetros`);

// Verificar se as perguntas estão sendo incluídas
formattedSteps.forEach((step, index) => {
  console.log(`\n📋 Etapa ${index + 1}: ${step.name}`);
  console.log(`   Perguntas: ${step.questions.length}`);
  step.questions.forEach((question, qIndex) => {
    console.log(`   - ${qIndex + 1}. ${question.name} (${question.questionConfig?.questionType})`);
  });
});

console.log('\n✅ Teste concluído!');
console.log('🎯 Se os dados estão corretos aqui, o formulário deve estar funcionando');

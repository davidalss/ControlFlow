// Script para testar a API de planos de inspeção
const testApi = async () => {
  try {
    console.log('🔍 Testando API de planos de inspeção...');
    
    // Simular dados que deveriam vir do banco
    const mockData = [
      {
        id: "75abf1e2-5200-4088-9a97-8f1942789991",
        planCode: "PLAN-1756317538878",
        planName: "PLANO DE INSPEÇÃO - WAP AIRFRY OVEN DIGITAL PROSDOCIMO 12L 127V",
        planType: "product",
        version: "1.0",
        status: "draft",
        productId: "4e8e463c-1659-4a05-ae13-e414901d550c",
        productCode: "WAP001",
        productName: "WAP AIRFRY OVEN DIGITAL PROSDOCIMO 12L 127V",
        productFamily: "Kitchen",
        businessUnit: "N/A",
        inspectionType: "mixed",
        aqlCritical: 0.065,
        aqlMajor: 1.0,
        aqlMinor: 2.5,
        samplingMethod: "standard",
        inspectionLevel: "II",
        inspectionSteps: JSON.stringify([
          {
            id: "graphic-inspection-step",
            name: "INSPEÇÃO MATERIAL GRÁFICO",
            description: "Inspeção de material gráfico e etiquetas",
            order: 1,
            estimatedTime: 15,
            fields: [],
            questions: [
              {
                id: "q1",
                name: "Etiqueta está legível?",
                type: "question",
                required: true,
                questionConfig: {
                  questionType: "ok_nok",
                  defectType: "MAIOR"
                }
              }
            ],
            defectType: "MAIOR"
          }
        ]),
        checklists: JSON.stringify([
          {
            title: "INSPEÇÃO MATERIAL GRÁFICO",
            items: [
              {
                description: "Etiqueta está legível?",
                required: true,
                type: "ok_nok"
              }
            ]
          }
        ]),
        requiredParameters: JSON.stringify([]),
        isActive: true,
        createdAt: "2025-08-19T00:12:04.552Z",
        updatedAt: "2025-08-27T17:54:40.212Z"
      }
    ];

    console.log('📋 Dados mockados:');
    console.log(JSON.stringify(mockData[0], null, 2));

    // Simular como o frontend processa os dados
    const plan = mockData[0];
    
    console.log('\n🔍 Processamento no frontend:');
    console.log(`planName: ${plan.planName || 'Sem nome'}`);
    console.log(`productName: ${plan.productName || 'Produto não especificado'}`);
    console.log(`planCode: ${plan.planCode || 'Sem código'}`);
    
    // Calcular total de perguntas
    let totalQuestions = 0;
    try {
      if (plan.inspectionSteps) {
        const steps = JSON.parse(plan.inspectionSteps);
        totalQuestions = steps.reduce((total, step) => {
          return total + (step.questions || []).length;
        }, 0);
      }
    } catch (error) {
      console.warn('Erro ao parsear inspectionSteps:', error);
      totalQuestions = 0;
    }
    
    console.log(`Total de perguntas: ${totalQuestions}`);
    
    console.log('\n✅ Teste concluído!');
    console.log('🎯 Se os dados estão corretos aqui, o problema pode estar na API real');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
};

testApi();

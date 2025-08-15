import { db } from './server/db.js';
import { inspectionPlans } from './shared/schema.js';

async function createTestPlan() {
  try {
    const testPlan = {
      planCode: "PCG02.049",
      planName: "Plano de Inspeção Air Fryer Barbecue",
      planType: "product",
      version: "Rev. 01",
      status: 'active',
      productId: "AFB001",
      productCode: "AFB001",
      productName: "Air Fryer Barbecue - Fritadeira Elétrica com Função Churrasco",
      productFamily: "Eletrodomésticos",
      businessUnit: "KITCHEN_BEAUTY",
      inspectionType: "mixed",
      samplingMethod: "NBR 5426",
      inspectionLevel: "II",
      inspectionSteps: JSON.stringify([
        {
          id: `step_graphic_${Date.now()}`,
          name: 'INSPEÇÃO MATERIAL GRÁFICO',
          description: 'Inspeção de etiquetas, rótulos e material gráfico do produto',
          fields: [
            {
              id: `field_etiqueta_principal_${Date.now()}`,
              name: 'Etiqueta Principal',
              type: 'photo',
              required: true,
              description: 'Foto da etiqueta principal do produto',
              photoConfig: {
                required: true,
                quantity: 1,
                allowAnnotations: true,
                compareWithStandard: false
              }
            },
            {
              id: `field_etiqueta_secundaria_${Date.now()}`,
              name: 'Etiqueta Secundária',
              type: 'photo',
              required: true,
              description: 'Foto da etiqueta secundária ou complementar',
              photoConfig: {
                required: true,
                quantity: 1,
                allowAnnotations: true,
                compareWithStandard: false
              }
            },
            {
              id: `field_rotulo_produto_${Date.now()}`,
              name: 'Rótulo do Produto',
              type: 'photo',
              required: true,
              description: 'Foto do rótulo principal do produto',
              photoConfig: {
                required: true,
                quantity: 1,
                allowAnnotations: true,
                compareWithStandard: false
              }
            },
            {
              id: `field_material_conforme_${Date.now()}`,
              name: 'Material está conforme?',
              type: 'checkbox',
              required: true,
              description: 'Verificar se o material gráfico está conforme especificação'
            },
            {
              id: `field_cores_corretas_${Date.now()}`,
              name: 'Cores estão corretas?',
              type: 'checkbox',
              required: true,
              description: 'Verificar se as cores estão conforme padrão'
            },
            {
              id: `field_texto_legivel_${Date.now()}`,
              name: 'Texto está legível?',
              type: 'checkbox',
              required: true,
              description: 'Verificar se todos os textos estão legíveis'
            },
            {
              id: `field_observacoes_graficas_${Date.now()}`,
              name: 'Observações',
              type: 'text',
              required: false,
              description: 'Observações sobre o material gráfico'
            }
          ],
          order: 1,
          required: true,
          estimatedTime: 10,
          isGraphicInspection: true
        },
        {
          id: `step_funcional_${Date.now()}`,
          name: 'INSPEÇÃO FUNCIONAL',
          description: 'Testes funcionais do produto',
          fields: [
            {
              id: `field_teste_ligar_${Date.now()}`,
              name: 'Teste de Ligamento',
              type: 'checkbox',
              required: true,
              description: 'Verificar se o produto liga corretamente'
            },
            {
              id: `field_teste_temperatura_${Date.now()}`,
              name: 'Teste de Temperatura',
              type: 'checkbox',
              required: true,
              description: 'Verificar se a temperatura está funcionando'
            },
            {
              id: `field_teste_timer_${Date.now()}`,
              name: 'Teste do Timer',
              type: 'checkbox',
              required: true,
              description: 'Verificar se o timer está funcionando'
            },
            {
              id: `field_foto_funcional_${Date.now()}`,
              name: 'Foto do Teste Funcional',
              type: 'photo',
              required: true,
              description: 'Foto do produto funcionando',
              photoConfig: {
                required: true,
                quantity: 1,
                allowAnnotations: false,
                compareWithStandard: false
              }
            }
          ],
          order: 2,
          required: true,
          estimatedTime: 15
        },
        {
          id: `step_visual_${Date.now()}`,
          name: 'INSPEÇÃO VISUAL',
          description: 'Inspeção visual do produto',
          fields: [
            {
              id: `field_aparencia_geral_${Date.now()}`,
              name: 'Aparência Geral',
              type: 'checkbox',
              required: true,
              description: 'Verificar aparência geral do produto'
            },
            {
              id: `field_defeitos_superficiais_${Date.now()}`,
              name: 'Defeitos Superficiais',
              type: 'select',
              required: true,
              description: 'Identificar defeitos superficiais',
              options: ['Nenhum', 'Leve', 'Moderado', 'Severo']
            },
            {
              id: `field_foto_visual_${Date.now()}`,
              name: 'Foto da Inspeção Visual',
              type: 'photo',
              required: true,
              description: 'Foto geral do produto',
              photoConfig: {
                required: true,
                quantity: 2,
                allowAnnotations: true,
                compareWithStandard: false
              }
            }
          ],
          order: 3,
          required: true,
          estimatedTime: 8
        }
      ]),
      checklists: JSON.stringify([
        {
          name: "Checklist Material Gráfico",
          items: [
            "Etiqueta principal presente e legível",
            "Etiqueta secundária conforme especificação",
            "Rótulo do produto correto",
            "Cores conforme padrão",
            "Textos legíveis"
          ]
        },
        {
          name: "Checklist Funcional",
          items: [
            "Produto liga corretamente",
            "Temperatura funciona",
            "Timer funciona",
            "Função churrasco ativa"
          ]
        },
        {
          name: "Checklist Visual",
          items: [
            "Aparência geral adequada",
            "Sem defeitos superficiais",
            "Acabamento conforme padrão"
          ]
        }
      ]),
      requiredParameters: JSON.stringify([
        {
          name: "Temperatura",
          unit: "°C",
          min: 80,
          max: 200,
          required: true
        },
        {
          name: "Timer",
          unit: "minutos",
          min: 1,
          max: 60,
          required: true
        },
        {
          name: "Potência",
          unit: "W",
          value: 1500,
          required: true
        }
      ]),
      requiredPhotos: JSON.stringify([
        {
          name: "Etiqueta Principal",
          required: true,
          quantity: 1
        },
        {
          name: "Etiqueta Secundária",
          required: true,
          quantity: 1
        },
        {
          name: "Rótulo do Produto",
          required: true,
          quantity: 1
        },
        {
          name: "Teste Funcional",
          required: true,
          quantity: 1
        },
        {
          name: "Inspeção Visual",
          required: true,
          quantity: 2
        }
      ]),
      createdBy: 'admin@controlflow.com',
      observations: "Plano de inspeção para Air Fryer Barbecue com função churrasco",
      specialInstructions: "Atenção especial ao material gráfico e função churrasco"
    };

    const result = await db.insert(inspectionPlans).values(testPlan);
    console.log("✅ Plano de inspeção de teste criado com sucesso!");
    console.log("Plano:", testPlan.planName);
    console.log("Código:", testPlan.planCode);
    console.log("Produto:", testPlan.productName);
    console.log("Etapas:", JSON.parse(testPlan.inspectionSteps).length);
    console.log("Campos totais:", JSON.parse(testPlan.inspectionSteps).reduce((total, step) => total + step.fields.length, 0));
    
    return result;
  } catch (error) {
    console.error("❌ Erro ao criar plano:", error);
    throw error;
  }
}

// Executar
createTestPlan()
  .then(() => {
    console.log("✅ Script executado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });

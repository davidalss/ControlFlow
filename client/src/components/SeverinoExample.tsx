import React, { useEffect } from 'react';
import { useSeverinoContext } from './SeverinoProvider';

// Exemplo de como usar o Severino em uma página de inspeção
export const InspectionPageWithSeverino: React.FC = () => {
  const { updateContext, getContextualSuggestions, provideProactiveHelp } = useSeverinoContext();

  // Atualizar contexto quando a página carrega
  useEffect(() => {
    // Contexto específico da página de inspeção
    const inspectionContext = {
      page: 'inspections',
      currentProduct: {
        id: 'PROD001',
        name: 'Torradeira Elétrica',
        ean: '7891234567892',
        category: 'Eletrodomésticos'
      },
      currentInspection: {
        id: 'INS001',
        status: 'in_progress',
        step: 'sampling_setup',
        lotSize: 1000,
        aqlLevel: 'II',
        aqlValue: 2.5
      },
      formData: {
        lotSize: 1000,
        aqlLevel: 'II',
        aqlValue: 2.5,
        inspector: 'João Silva',
        date: new Date()
      }
    };

    // Atualizar contexto do Severino
    updateContext('inspections', inspectionContext);

    // Fornecer ajuda proativa após 3 segundos
    setTimeout(() => {
      provideProactiveHelp();
    }, 3000);
  }, [updateContext, provideProactiveHelp]);

  // Obter sugestões contextuais
  const contextualSuggestions = getContextualSuggestions();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Inspeção de Qualidade</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulário de Inspeção */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Configuração da Inspeção</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="product">
                Produto
              </label>
              <input
                id="product"
                type="text"
                value="Torradeira Elétrica (7891234567892)"
                className="w-full p-2 border rounded"
                readOnly
                aria-label="Produto selecionado"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="lotSize">
                Tamanho do Lote
              </label>
              <input
                id="lotSize"
                type="number"
                value={1000}
                className="w-full p-2 border rounded"
                placeholder="Digite o tamanho do lote"
                aria-label="Tamanho do lote"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="inspectionLevel">
                Nível de Inspeção
              </label>
              <select 
                id="inspectionLevel"
                className="w-full p-2 border rounded"
                aria-label="Nível de inspeção"
              >
                <option value="I">Nível I - Reduzida</option>
                <option value="II" selected>Nível II - Normal</option>
                <option value="III">Nível III - Rigorosa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="aqlValue">
                Critério AQL
              </label>
              <input
                id="aqlValue"
                type="number"
                step="0.1"
                value={2.5}
                className="w-full p-2 border rounded"
                placeholder="Ex: 2.5"
                aria-label="Critério AQL"
              />
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Calcular Amostra
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Iniciar Inspeção
            </button>
          </div>
        </div>

        {/* Sugestões do Severino */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <span className="text-blue-600 mr-2">🤖</span>
            Sugestões do Severino
          </h2>
          
          <div className="space-y-3">
            {contextualSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 bg-white dark:bg-gray-800 rounded border-l-4 border-blue-500"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {suggestion}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-4 border-yellow-500">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              💡 <strong>Dica:</strong> Para lote de 1000 peças, Nível II, AQL 2.5, 
              o tamanho da amostra recomendado é 80 peças.
            </p>
          </div>
        </div>
      </div>

      {/* Resultados da Amostragem */}
      <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Resultados da Amostragem</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded">
            <div className="text-2xl font-bold text-green-600">80</div>
            <div className="text-sm text-green-700 dark:text-green-300">
              Tamanho da Amostra
            </div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
            <div className="text-2xl font-bold text-blue-600">≤ 5</div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              Aceitar se (defeitos)
            </div>
          </div>
          
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded">
            <div className="text-2xl font-bold text-red-600">≥ 6</div>
            <div className="text-sm text-red-700 dark:text-red-300">
              Rejeitar se (defeitos)
            </div>
          </div>
        </div>
      </div>

      {/* Instruções do Severino */}
      <div className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">🎯</span>
          Instruções do Severino
        </h2>
        
        <div className="space-y-2 text-sm">
          <p>• Inspecione as 80 peças selecionadas aleatoriamente</p>
          <p>• Registre todos os defeitos encontrados</p>
          <p>• Tire fotos de não conformidades</p>
          <p>• Documente observações importantes</p>
          <p>• Decida aprovação/rejeição baseado nos critérios</p>
        </div>

        <div className="mt-4 flex space-x-3">
          <button className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100">
            📸 Capturar Fotos
          </button>
          <button className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100">
            📝 Registrar Defeitos
          </button>
          <button className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100">
            ✅ Finalizar Inspeção
          </button>
        </div>
      </div>
    </div>
  );
};

export default InspectionPageWithSeverino;

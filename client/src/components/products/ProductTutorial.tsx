import React, { useState } from 'react';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  HelpCircle, 
  Package, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  History,
  Eye,
  Download,
  Upload,
  RefreshCw,
  BarChart3,
  Tag,
  Building,
  Hash,
  Plus,
  CheckCircle,
  ArrowRight,
  X
} from "lucide-react";

interface ProductTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductTutorial({ isOpen, onClose }: ProductTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "1. Gestão de Produtos",
      description: "Sistema completo para controle do catálogo de produtos",
      icon: <Package className="h-6 w-6 text-blue-500" />,
      content: (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Cadastro completo de produtos</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Histórico de alterações</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Filtros e busca avançada</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Exportação de dados</span>
          </div>
        </div>
      )
    },
    {
      title: "2. Cadastro de Produtos",
      description: "Como criar e gerenciar produtos no sistema",
      icon: <Plus className="h-6 w-6 text-green-500" />,
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Campos Obrigatórios:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Código:</strong> Identificador único do produto</li>
              <li>• <strong>Descrição:</strong> Nome/descrição do produto</li>
              <li>• <strong>Categoria:</strong> Classificação do produto</li>
              <li>• <strong>Unidade de Negócio:</strong> Área responsável</li>
            </ul>
          </div>
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Campos Opcionais:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• <strong>EAN:</strong> Código de barras</li>
              <li>• <strong>Especificações:</strong> Detalhes técnicos</li>
              <li>• <strong>Observações:</strong> Informações adicionais</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "3. Filtros e Busca",
      description: "Como encontrar produtos rapidamente",
      icon: <Search className="h-6 w-6 text-purple-500" />,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-blue-800">Busca por Texto</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">Busque por código, descrição ou EAN</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-green-800">Filtros</span>
                </div>
                <p className="text-sm text-green-700 mt-1">Filtre por categoria e unidade de negócio</p>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-purple-800">Ordenação</span>
                </div>
                <p className="text-sm text-purple-700 mt-1">Ordene por código, descrição, categoria ou data</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "4. Ações Disponíveis",
      description: "O que você pode fazer com cada produto",
      icon: <Edit className="h-6 w-6 text-orange-500" />,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-blue-800">Visualizar</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">Veja todos os detalhes do produto</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <Edit className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-green-800">Editar</span>
                </div>
                <p className="text-sm text-green-700 mt-1">Modifique as informações do produto</p>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <History className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-purple-800">Histórico</span>
                </div>
                <p className="text-sm text-purple-700 mt-1">Veja todas as alterações realizadas</p>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-red-800">Excluir</span>
                </div>
                <p className="text-sm text-red-700 mt-1">Remova o produto do sistema</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "5. Funcionalidades Avançadas",
      description: "Recursos adicionais para gestão eficiente",
      icon: <Download className="h-6 w-6 text-indigo-500" />,
      content: (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Exportação de produtos em JSON</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Atualização automática dos dados</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Estatísticas em tempo real</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Interface responsiva</span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <h4 className="font-medium text-indigo-800 mb-2">Estatísticas Disponíveis:</h4>
            <ul className="text-sm text-indigo-700 space-y-1">
              <li>• <strong>Total de Produtos:</strong> Quantidade total cadastrada</li>
              <li>• <strong>Categorias:</strong> Número de categorias diferentes</li>
              <li>• <strong>Unidades de Negócio:</strong> Áreas responsáveis</li>
              <li>• <strong>Com EAN:</strong> Produtos com código de barras</li>
            </ul>
          </div>
        </div>
      )
    }
  ];
  
  const resetTutorial = () => {
    setCurrentStep(0);
  };
  
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full z-10 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <div className="flex items-center space-x-2">
                <HelpCircle className="h-6 w-6 text-blue-500" />
                <h2 className="text-lg font-semibold text-black">Tutorial: Como Usar a Gestão de Produtos</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              {steps[currentStep] && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    {steps[currentStep].icon}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {steps[currentStep].title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {steps[currentStep].description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    {steps[currentStep].content}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between p-4 border-t flex-shrink-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {currentStep + 1} de {steps.length}
                </span>
                <div className="flex space-x-1">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={resetTutorial}
                  className="text-sm"
                >
                  Reiniciar
                </Button>
                
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="text-sm"
                  >
                    Anterior
                  </Button>
                )}
                
                {currentStep < steps.length - 1 ? (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="text-sm"
                  >
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={onClose}
                    className="text-sm"
                  >
                    Finalizar
                    <CheckCircle className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

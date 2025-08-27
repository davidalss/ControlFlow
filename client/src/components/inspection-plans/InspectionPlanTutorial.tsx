import React, { useState } from 'react';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  HelpCircle, 
  Package, 
  Zap, 
  Settings, 
  FileText, 
  CheckCircle,
  ArrowRight,
  X
} from "lucide-react";

interface InspectionPlanTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InspectionPlanTutorial({ isOpen, onClose }: InspectionPlanTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "1. Informações Básicas",
      description: "Configure os dados fundamentais do plano",
      icon: <FileText className="h-6 w-6 text-blue-500" />,
      content: (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Código do plano (ex: PCG02.049)</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Nome descritivo do plano</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Versão (ex: Rev. 01)</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Tipo (Produto ou Peças)</span>
          </div>
        </div>
      )
    },
    {
      title: "2. Seleção de Produtos",
      description: "Escolha os produtos que serão inspecionados",
      icon: <Package className="h-6 w-6 text-green-500" />,
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Como funciona:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>1 produto:</strong> BIVOLT ou voltagem única</li>
              <li>• <strong>2 produtos:</strong> 127V + 220V (DUAL)</li>
              <li>• <strong>Busque</strong> por código ou descrição</li>
              <li>• <strong>Selecione</strong> a voltagem correta</li>
            </ul>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-800">127V</Badge>
            <Badge variant="outline" className="bg-green-100 text-green-800">220V</Badge>
            <Badge variant="outline" className="bg-purple-100 text-purple-800">BIVOLT</Badge>
          </div>
        </div>
      )
    },
    {
      title: "3. Configuração de Voltagens",
      description: "O sistema detecta automaticamente a configuração",
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-purple-800">BIVOLT</span>
                </div>
                <p className="text-sm text-purple-700 mt-1">Produto funciona em 127V e 220V</p>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-orange-500" />
                  <span className="font-medium text-orange-800">DUAL</span>
                </div>
                <p className="text-sm text-orange-700 mt-1">Dois produtos com voltagens diferentes</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "4. Configurações AQL",
      description: "Defina os limites de aceitação por tipo de defeito",
      icon: <Settings className="h-6 w-6 text-red-500" />,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 border border-red-200 bg-red-50 rounded">
              <div className="font-bold text-red-600">CRÍTICO</div>
              <div className="text-xs text-red-500">Limite: 0</div>
              <div className="text-xs text-red-400">Rejeição automática</div>
            </div>
            <div className="text-center p-2 border border-yellow-200 bg-yellow-50 rounded">
              <div className="font-bold text-yellow-600">MAIOR</div>
              <div className="text-xs text-yellow-500">Limite: 2.5</div>
              <div className="text-xs text-yellow-400">Aprovação condicional</div>
            </div>
            <div className="text-center p-2 border border-blue-200 bg-blue-50 rounded">
              <div className="font-bold text-blue-600">MENOR</div>
              <div className="text-xs text-blue-500">Limite: 4.0</div>
              <div className="text-xs text-blue-400">Aprovação condicional</div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p><strong>Método:</strong> NBR 5426 (padrão)</p>
            <p><strong>Nível:</strong> II (padrão)</p>
          </div>
        </div>
      )
    },
    {
      title: "5. Perguntas de Inspeção",
      description: "Cadastre as perguntas organizadas por voltagem",
      icon: <FileText className="h-6 w-6 text-purple-500" />,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 border border-gray-200 bg-gray-50 rounded">
              <div className="font-medium text-gray-800">Ambas Voltagens</div>
              <div className="text-xs text-gray-500">Perguntas comuns</div>
            </div>
            <div className="text-center p-2 border border-blue-200 bg-blue-50 rounded">
              <div className="font-medium text-blue-800">127V</div>
              <div className="text-xs text-blue-500">Específicas 127V</div>
            </div>
            <div className="text-center p-2 border border-green-200 bg-green-50 rounded">
              <div className="font-medium text-green-800">220V</div>
              <div className="text-xs text-green-500">Específicas 220V</div>
            </div>
          </div>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Classificação de Defeitos:</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="font-bold text-red-600">CRÍTICO</div>
                <div className="text-xs text-red-500">Rejeição automática</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-600">MAIOR</div>
                <div className="text-xs text-yellow-500">Aprovação condicional</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-600">MENOR</div>
                <div className="text-xs text-blue-500">Aprovação condicional</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "6. Tipos de Perguntas",
      description: "Escolha o tipo mais adequado para cada verificação",
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 border border-gray-200 rounded">
              <div className="font-medium text-sm">OK/NOK</div>
              <div className="text-xs text-gray-500">Verificação simples</div>
            </div>
            <div className="p-2 border border-gray-200 rounded">
              <div className="font-medium text-sm">Sim/Não</div>
              <div className="text-xs text-gray-500">Resposta binária</div>
            </div>
            <div className="p-2 border border-gray-200 rounded">
              <div className="font-medium text-sm">Número</div>
              <div className="text-xs text-gray-500">Valores numéricos</div>
            </div>
            <div className="p-2 border border-gray-200 rounded">
              <div className="font-medium text-sm">Escala 1-5</div>
              <div className="text-xs text-gray-500">Avaliação qualitativa</div>
            </div>
            <div className="p-2 border border-gray-200 rounded">
              <div className="font-medium text-sm">Texto</div>
              <div className="text-xs text-gray-500">Observações</div>
            </div>
            <div className="p-2 border border-gray-200 rounded">
              <div className="font-medium text-sm">Foto</div>
              <div className="text-xs text-gray-500">Evidência visual</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "7. Observações e Instruções",
      description: "Adicione informações importantes para os inspetores",
      icon: <FileText className="h-6 w-6 text-indigo-500" />,
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <h4 className="font-medium text-indigo-800 mb-2">Observações:</h4>
            <ul className="text-sm text-indigo-700 space-y-1">
              <li>• Informações gerais sobre o plano</li>
              <li>• Contexto da inspeção</li>
              <li>• Considerações especiais</li>
            </ul>
          </div>
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Instruções Especiais:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Orientações para inspetores</li>
              <li>• Procedimentos específicos</li>
              <li>• Cuidados especiais</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "8. Salvar e Finalizar",
      description: "Revise e salve o plano de inspeção",
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Verificações Finais:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✓ Nome do plano preenchido</li>
              <li>✓ Pelo menos 1 produto selecionado</li>
              <li>✓ Pelo menos 1 pergunta cadastrada</li>
              <li>✓ Configurações AQL definidas</li>
            </ul>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Após salvar, o plano estará disponível para uso nas inspeções!
            </p>
          </div>
        </div>
      )
    }
  ];
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
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
                <h2 className="text-lg font-semibold text-black">Tutorial: Como Criar um Plano de Inspeção</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
                        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
        
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Passo {currentStep + 1} de {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% completo</span>
          </div>
          
          {/* Current Step */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {steps[currentStep].icon}
              <div>
                <h3 className="text-lg font-semibold">{steps[currentStep].title}</h3>
                <p className="text-gray-600">{steps[currentStep].description}</p>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              {steps[currentStep].content}
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={resetTutorial}
                disabled={currentStep === 0}
              >
                Reiniciar
              </Button>
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                Anterior
              </Button>
            </div>
            
            <div className="flex space-x-2">
              {currentStep < steps.length - 1 ? (
                <Button onClick={nextStep}>
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={onClose}>
                  Finalizar Tutorial
                  <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Quick Tips */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">💡 Dica Rápida:</h4>
            <p className="text-sm text-blue-700">
              {currentStep === 0 && "O código do plano deve ser único e seguir um padrão (ex: PCG02.049)"}
              {currentStep === 1 && "Para produtos bivolt, selecione apenas uma vez com a opção BIVOLT"}
              {currentStep === 2 && "O sistema detecta automaticamente se é BIVOLT ou DUAL baseado nos produtos"}
              {currentStep === 3 && "Defeitos críticos sempre causam rejeição automática, independente do limite"}
              {currentStep === 4 && "Perguntas 'Ambas Voltagens' são aplicadas para todas as voltagens"}
              {currentStep === 5 && "Use OK/NOK para verificações simples e Número para medições específicas"}
              {currentStep === 6 && "Instruções especiais aparecem para o inspetor durante a execução"}
              {currentStep === 7 && "Você pode editar o plano a qualquer momento após salvá-lo"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

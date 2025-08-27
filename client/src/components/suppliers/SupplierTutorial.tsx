import React, { useState } from 'react';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  HelpCircle, 
  Users, 
  Star, 
  BarChart3, 
  FileText, 
  CheckCircle,
  ArrowRight,
  X,
  TrendingUp,
  Shield,
  Clock,
  DollarSign
} from "lucide-react";

interface SupplierTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupplierTutorial({ isOpen, onClose }: SupplierTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "1. Gestão de Fornecedores",
      description: "Sistema completo para controle de fornecedores",
      icon: <Users className="h-6 w-6 text-blue-500" />,
      content: (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Cadastro completo de fornecedores</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Avaliações e auditorias</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Métricas de performance</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Histórico completo</span>
          </div>
        </div>
      )
    },
    {
      title: "2. Sistema de Avaliação",
      description: "Como funciona o sistema de estrelas e avaliações",
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Critérios de Avaliação:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Qualidade:</strong> 0-100 pontos</li>
              <li>• <strong>Entrega:</strong> 0-100 pontos</li>
              <li>• <strong>Custo:</strong> 0-100 pontos</li>
              <li>• <strong>Comunicação:</strong> 0-100 pontos</li>
              <li>• <strong>Suporte Técnico:</strong> 0-100 pontos</li>
            </ul>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Rating Final:</span>
            <Badge variant="outline" className="bg-green-100 text-green-800">4.5 ⭐</Badge>
            <span className="text-xs text-gray-600">(Média dos critérios ÷ 20)</span>
          </div>
        </div>
      )
    },
    {
      title: "3. Métricas Automáticas",
      description: "Gráficos que se atualizam automaticamente",
      icon: <BarChart3 className="h-6 w-6 text-green-500" />,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-blue-800">Taxa de Defeitos</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">Calculada automaticamente: 100% - Score de Qualidade</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-green-800">Entrega no Prazo</span>
                </div>
                <p className="text-sm text-green-700 mt-1">Baseada diretamente no score de entrega das avaliações</p>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-purple-800">Eficiência de Custo</span>
                </div>
                <p className="text-sm text-purple-700 mt-1">Baseada diretamente no score de custo das avaliações</p>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="font-medium text-orange-800">Tempo de Resposta</span>
                </div>
                <p className="text-sm text-orange-700 mt-1">Calculado baseado no score de comunicação (1-10 dias)</p>
              </CardContent>
            </Card>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Como funcionam:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Taxa de Defeitos:</strong> Quanto maior a qualidade, menor a taxa</li>
              <li>• <strong>Entrega no Prazo:</strong> Score de entrega reflete a pontualidade</li>
              <li>• <strong>Eficiência de Custo:</strong> Score de custo mostra a eficiência</li>
              <li>• <strong>Tempo de Resposta:</strong> Baseado na comunicação (1-10 dias)</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "4. Auditorias e Controle",
      description: "Sistema de auditorias para controle de qualidade",
      icon: <Shield className="h-6 w-6 text-red-500" />,
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="font-medium text-orange-800 mb-2">Tipos de Auditoria:</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• <strong>Inicial:</strong> Primeira auditoria do fornecedor</li>
              <li>• <strong>Vigilância:</strong> Auditorias periódicas</li>
              <li>• <strong>Recertificação:</strong> Renovação de certificação</li>
              <li>• <strong>Acompanhamento:</strong> Verificação de correções</li>
            </ul>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-100 text-green-800">Aprovado</Badge>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Condicional</Badge>
            <Badge variant="outline" className="bg-red-100 text-red-800">Reprovado</Badge>
          </div>
        </div>
      )
    },
    {
      title: "5. Histórico e Relatórios",
      description: "Acompanhe toda a evolução do fornecedor",
      icon: <FileText className="h-6 w-6 text-purple-500" />,
      content: (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Histórico completo de avaliações</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Relatórios de auditorias</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Gráficos de evolução</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Métricas em tempo real</span>
          </div>
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>Dica:</strong> Use as abas para navegar entre Visão Geral, Performance, Avaliações, Auditorias e Métricas
            </p>
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
                <h2 className="text-lg font-semibold text-black">Tutorial: Como Usar a Gestão de Fornecedores</h2>
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

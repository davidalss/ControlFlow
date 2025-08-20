import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Play, CheckCircle } from 'lucide-react';

interface AppTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppTutorial({ isOpen, onClose }: AppTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Módulo de Inspeção",
      description: "Sistema completo de inspeção de qualidade com fotos, relatórios e aprovações",
      features: [
        "Captura de fotos com câmera integrada",
        "Relatórios detalhados de inspeção",
        "Sistema de aprovação em múltiplos níveis",
        "Plano de inspeção personalizado"
      ]
    },
    {
      title: "Gestão de Produtos",
      description: "Cadastro e controle completo de produtos e fornecedores",
      features: [
        "Cadastro completo de produtos",
        "Gestão de fornecedores",
        "Histórico de produtos",
        "Categorização automática"
      ]
    },
    {
      title: "Dashboard Inteligente",
      description: "Visão geral em tempo real com métricas e indicadores de qualidade",
      features: [
        "Métricas em tempo real",
        "Gráficos interativos",
        "Indicadores de qualidade",
        "Alertas automáticos"
      ]
    }
  ];

  const currentStepData = steps[currentStep];

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

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Play className="w-5 h-5" />
            <span>Demonstração do Sistema ENSO</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Passo {currentStep + 1} de {steps.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <h3 className="text-xl font-bold mb-2">{currentStepData.title}</h3>
            <p className="text-muted-foreground mb-4">{currentStepData.description}</p>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Funcionalidades:</h4>
              {currentStepData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Anterior
            </Button>
            
            <Button
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
            >
              Próximo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

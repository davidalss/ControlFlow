import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play, 
  Pause,
  Camera,
  Package,
  BarChart3,
  Users,
  Settings,
  CheckCircle
} from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  module: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Módulo de Inspeção",
    description: "Sistema completo de inspeção de qualidade com fotos, relatórios e aprovações",
    module: "Inspeção",
    icon: <Camera className="w-8 h-8" />,
    color: "from-blue-500 to-blue-600",
    features: [
      "Captura de fotos com câmera integrada",
      "Relatórios detalhados de inspeção",
      "Sistema de aprovação em múltiplos níveis",
      "Plano de inspeção personalizado",
      "AQL Calculator integrado",
      "Histórico completo de inspeções"
    ]
  },
  {
    id: 2,
    title: "Gestão de Produtos",
    description: "Cadastro e controle completo de produtos e fornecedores",
    module: "Produtos",
    icon: <Package className="w-8 h-8" />,
    color: "from-green-500 to-green-600",
    features: [
      "Cadastro completo de produtos",
      "Gestão de fornecedores",
      "Histórico de produtos",
      "Categorização automática",
      "Busca avançada",
      "Relatórios de produtos"
    ]
  },
  {
    id: 3,
    title: "Dashboard Inteligente",
    description: "Visão geral em tempo real com métricas e indicadores de qualidade",
    module: "Dashboard",
    icon: <BarChart3 className="w-8 h-8" />,
    color: "from-purple-500 to-purple-600",
    features: [
      "Métricas em tempo real",
      "Gráficos interativos",
      "Indicadores de qualidade",
      "Alertas automáticos",
      "Relatórios personalizados",
      "Exportação de dados"
    ]
  },
  {
    id: 4,
    title: "Gestão de Usuários",
    description: "Controle de acesso e permissões por nível hierárquico",
    module: "Usuários",
    icon: <Users className="w-8 h-8" />,
    color: "from-orange-500 to-orange-600",
    features: [
      "Controle de acesso por perfil",
      "Gestão de permissões",
      "Histórico de atividades",
      "Autenticação segura",
      "Backup automático",
      "Sincronização em nuvem"
    ]
  },
  {
    id: 5,
    title: "Configurações Avançadas",
    description: "Personalização completa do sistema para sua empresa",
    module: "Configurações",
    icon: <Settings className="w-8 h-8" />,
    color: "from-red-500 to-red-600",
    features: [
      "Personalização de interface",
      "Configuração de workflows",
      "Integração com sistemas",
      "Backup e restauração",
      "Logs de sistema",
      "Suporte técnico"
    ]
  }
];

interface AppTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppTutorial({ isOpen, onClose }: AppTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  const currentTutorialStep = tutorialSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex items-center justify-between pb-4">
          <DialogTitle className="flex items-center space-x-2">
            <Play className="w-5 h-5" />
            <span>Demonstração do Sistema ENSO</span>
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Passo {currentStep + 1} de {tutorialSteps.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-stone-600 to-stone-800 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex space-x-6 min-h-0">
            {/* Left Panel - Tutorial Info */}
            <div className="w-1/2 flex flex-col">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${currentTutorialStep.color} text-white`}>
                    {currentTutorialStep.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {currentTutorialStep.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {currentTutorialStep.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">
                    Principais Funcionalidades:
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {currentTutorialStep.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    💡 Dica do Sistema
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    O ENSO foi desenvolvido para ser intuitivo e fácil de usar. 
                    Todos os módulos seguem o mesmo padrão de interface, garantindo 
                    uma experiência consistente para sua equipe.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Panel - Mock Interface */}
            <div className="w-1/2 flex flex-col">
              <div className="flex-1 bg-gray-50 rounded-lg border overflow-hidden">
                {/* Mock Header */}
                <div className="bg-white border-b p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-stone-600 to-stone-800 rounded-lg"></div>
                      <div>
                        <div className="w-20 h-3 bg-gray-300 rounded mb-1"></div>
                        <div className="w-16 h-2 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-200 rounded"></div>
                      <div className="w-6 h-6 bg-gray-200 rounded"></div>
                      <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>

                {/* Mock Content */}
                <div className="p-4">
                  <div className="space-y-3">
                    {/* Mock Cards */}
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="bg-white rounded-lg p-3 border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-lg"></div>
                            <div>
                              <div className="w-24 h-3 bg-gray-300 rounded mb-1"></div>
                              <div className="w-16 h-2 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-6 h-6 bg-gray-200 rounded"></div>
                            <div className="w-6 h-6 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Mock Stats */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="bg-white rounded-lg p-2 text-center">
                        <div className="w-8 h-4 bg-gray-300 rounded mx-auto mb-1"></div>
                        <div className="w-12 h-2 bg-gray-200 rounded mx-auto"></div>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center">
                        <div className="w-8 h-4 bg-gray-300 rounded mx-auto mb-1"></div>
                        <div className="w-12 h-2 bg-gray-200 rounded mx-auto"></div>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center">
                        <div className="w-8 h-4 bg-gray-300 rounded mx-auto mb-1"></div>
                        <div className="w-12 h-2 bg-gray-200 rounded mx-auto"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            <div className="flex items-center space-x-2">
              {tutorialSteps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(index)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                    index === currentStep
                      ? 'bg-stone-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {step.module}
                </button>
              ))}
            </div>

            <Button
              onClick={nextStep}
              disabled={currentStep === tutorialSteps.length - 1}
              className="flex items-center space-x-2 bg-gradient-to-r from-stone-600 to-stone-800 hover:from-stone-700 hover:to-stone-900"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

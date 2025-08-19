import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play, 
  Pause,
  Camera,
  FileText,
  Users,
  BarChart3,
  Settings,
  Shield,
  BookOpen,
  Target,
  Building,
  Truck,
  Package,
  CheckCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Plus,
  Star,
  Award,
  Zap,
  Brain,
  Cpu,
  Database,
  Cloud,
  Smartphone,
  Monitor,
  Server,
  Globe,
  Lock,
  Wifi,
  Activity,
  TrendingUp,
  PieChart,
  LineChart,
  MessageCircle,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  module: string;
  icon: React.ReactNode;
  features: string[];
  image?: string;
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
    title: "Sistema de Usuários",
    description: "Controle de acesso e permissões por níveis hierárquicos",
    module: "Usuários",
    icon: <Users className="w-8 h-8" />,
    color: "from-purple-500 to-purple-600",
    features: [
      "Gestão de usuários e permissões",
      "Níveis hierárquicos (Admin, Coordenador, Inspetor)",
      "Controle de acesso por módulos",
      "Histórico de atividades",
      "Perfis personalizáveis",
      "Sistema de grupos"
    ]
  },
  {
    id: 4,
    title: "Relatórios e Analytics",
    description: "Dashboards interativos e relatórios detalhados",
    module: "Relatórios",
    icon: <BarChart3 className="w-8 h-8" />,
    color: "from-orange-500 to-orange-600",
    features: [
      "Dashboard interativo em tempo real",
      "Relatórios personalizáveis",
      "Gráficos e estatísticas",
      "Exportação em múltiplos formatos",
      "Indicadores de qualidade (KPIs)",
      "Análise de tendências"
    ]
  },
  {
    id: 5,
    title: "Sistema de Treinamentos",
    description: "Plataforma completa de treinamento e certificação",
    module: "Treinamentos",
    icon: <BookOpen className="w-8 h-8" />,
    color: "from-red-500 to-red-600",
    features: [
      "Cursos online interativos",
      "Sistema de certificação",
      "Acompanhamento de progresso",
      "Materiais didáticos",
      "Avaliações e testes",
      "Histórico de treinamentos"
    ]
  },
  {
    id: 6,
    title: "SGQ - Gestão da Qualidade",
    description: "Sistema de gestão da qualidade com RNCs e não conformidades",
    module: "SGQ",
    icon: <Shield className="w-8 h-8" />,
    color: "from-indigo-500 to-indigo-600",
    features: [
      "Gestão de RNCs (Registros de Não Conformidade)",
      "Tratamento de não conformidades",
      "Ações corretivas e preventivas",
      "Fluxo de aprovação SGQ",
      "Relatórios de qualidade",
      "Conformidade com normas"
    ]
  },
  {
    id: 7,
    title: "Dashboard Principal",
    description: "Visão geral completa do sistema com métricas e indicadores",
    module: "Dashboard",
    icon: <Activity className="w-8 h-8" />,
    color: "from-teal-500 to-teal-600",
    features: [
      "Visão geral em tempo real",
      "Métricas de qualidade",
      "Alertas e notificações",
      "Atividades recentes",
      "Indicadores de performance",
      "Acesso rápido aos módulos"
    ]
  },
  {
    id: 8,
    title: "Configurações e Integração",
    description: "Configurações avançadas e integração com outros sistemas",
    module: "Configurações",
    icon: <Settings className="w-8 h-8" />,
    color: "from-gray-500 to-gray-600",
    features: [
      "Configurações do sistema",
      "Integração com ERPs",
      "APIs e webhooks",
      "Backup e segurança",
      "Personalização de interface",
      "Configurações de notificações"
    ]
  }
];

interface AppTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppTutorial({ isOpen, onClose }: AppTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

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

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const currentTutorial = tutorialSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="text-2xl font-bold text-stone-800 dark:text-stone-200">
            Tutorial Completo - Sistema ENSO
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-600 dark:text-stone-400">
                Passo {currentStep + 1} de {tutorialSteps.length}
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-stone-600 dark:text-stone-400"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-stone-600 to-stone-800 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {tutorialSteps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentStep
                      ? 'bg-stone-600 dark:bg-stone-300'
                      : 'bg-stone-300 dark:bg-stone-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side - Module Info */}
              <div className="space-y-6">
                <div className="text-center lg:text-left">
                  <div className={`w-16 h-16 mx-auto lg:mx-0 mb-4 bg-gradient-to-r ${currentTutorial.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    {currentTutorial.icon}
                  </div>
                  
                  <Badge className="mb-3 bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                    {currentTutorial.module}
                  </Badge>
                  
                  <h3 className="text-2xl font-bold mb-3 text-stone-800 dark:text-stone-200">
                    {currentTutorial.title}
                  </h3>
                  
                  <p className="text-stone-600 dark:text-stone-400 mb-6">
                    {currentTutorial.description}
                  </p>
                </div>

                {/* Features List */}
                <div>
                  <h4 className="font-semibold mb-3 text-stone-800 dark:text-stone-200">
                    Principais Funcionalidades:
                  </h4>
                  <ul className="space-y-2">
                    {currentTutorial.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-stone-600 dark:text-stone-400">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Side - Mock Interface */}
              <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-6 border border-stone-200 dark:border-stone-700">
                <div className="bg-white dark:bg-stone-900 rounded-lg shadow-lg overflow-hidden">
                  {/* Mock Header */}
                  <div className="bg-gradient-to-r from-stone-600 to-stone-800 text-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          {currentTutorial.icon}
                        </div>
                        <span className="font-semibold">{currentTutorial.module}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Mock Content */}
                  <div className="p-4">
                    <div className="space-y-3">
                      {/* Mock Search Bar */}
                      <div className="flex items-center space-x-2 bg-stone-100 dark:bg-stone-800 rounded-lg p-2">
                        <Search className="w-4 h-4 text-stone-500" />
                        <div className="w-32 h-4 bg-stone-200 dark:bg-stone-700 rounded"></div>
                      </div>

                      {/* Mock Cards */}
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="bg-stone-50 dark:bg-stone-800 rounded-lg p-3 border border-stone-200 dark:border-stone-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-stone-400 to-stone-600 rounded-lg"></div>
                              <div>
                                <div className="w-24 h-3 bg-stone-300 dark:bg-stone-600 rounded mb-1"></div>
                                <div className="w-16 h-2 bg-stone-200 dark:bg-stone-700 rounded"></div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-6 h-6 bg-stone-200 dark:bg-stone-700 rounded"></div>
                              <div className="w-6 h-6 bg-stone-200 dark:bg-stone-700 rounded"></div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Mock Stats */}
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-2 text-center">
                          <div className="w-8 h-4 bg-stone-300 dark:bg-stone-600 rounded mx-auto mb-1"></div>
                          <div className="w-12 h-2 bg-stone-200 dark:bg-stone-700 rounded mx-auto"></div>
                        </div>
                        <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-2 text-center">
                          <div className="w-8 h-4 bg-stone-300 dark:bg-stone-600 rounded mx-auto mb-1"></div>
                          <div className="w-12 h-2 bg-stone-200 dark:bg-stone-700 rounded mx-auto"></div>
                        </div>
                        <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-2 text-center">
                          <div className="w-8 h-4 bg-stone-300 dark:bg-stone-600 rounded mx-auto mb-1"></div>
                          <div className="w-12 h-2 bg-stone-200 dark:bg-stone-700 rounded mx-auto"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-stone-200 dark:border-stone-700">
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
                      ? 'bg-stone-600 text-white dark:bg-stone-300 dark:text-stone-900'
                      : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
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

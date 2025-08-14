import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Search, AlertTriangle, FileText, BarChart3, Database, Brain, Shield, Target, Award, BarChart, Settings, Users, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeaturesModal({ isOpen, onClose }: FeaturesModalProps) {
  const [activeTab, setActiveTab] = useState(0);

  const modules = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Treinamentos",
      description: "Plataforma completa de EAD com certificados digitais, testes automatizados e histórico completo de treinamentos.",
      features: ["Certificados digitais", "Testes automatizados", "Histórico completo", "Relatórios de progresso"],
      color: "from-blue-500 to-blue-600",
      preview: "dashboard-treinos"
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Inspeções",
      description: "Sistema de inspeção com wizard intuitivo, fotos obrigatórias e validações em tempo real.",
      features: ["Wizard intuitivo", "Fotos obrigatórias", "Validações em tempo real", "Relatórios detalhados"],
      color: "from-green-500 to-green-600",
      preview: "dashboard-inspecoes"
    },
    {
      icon: <AlertTriangle className="w-8 h-8" />,
      title: "RNC & CAPA",
      description: "Gestão completa de não conformidades e ações corretivas preventivas.",
      features: ["Registro de RNC", "Ações corretivas", "Preventivas", "Acompanhamento"],
      color: "from-red-500 to-red-600",
      preview: "dashboard-rnc"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "KPIs & Relatórios",
      description: "Indicadores de qualidade e relatórios gerenciais em tempo real.",
      features: ["KPIs em tempo real", "Relatórios gerenciais", "Dashboards", "Exportação"],
      color: "from-purple-500 to-purple-600",
      preview: "dashboard-kpis"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Inteligência Artificial",
      description: "IA aplicada para análise preditiva, detecção de anomalias e otimização.",
      features: ["Análise preditiva", "Detecção de anomalias", "Otimização automática", "Insights inteligentes"],
      color: "from-indigo-500 to-indigo-600",
      preview: "dashboard-ai"
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Integração ERP",
      description: "Integração completa com SAP, TOTVS e outros sistemas ERP.",
      features: ["API REST", "Sincronização automática", "Dados em tempo real", "Backup automático"],
      color: "from-pink-500 to-pink-600",
      preview: "dashboard-erp"
    }
  ];

  const previewScreens = {
    "dashboard-treinos": {
      title: "Dashboard de Treinamentos",
      elements: [
        { type: "header", text: "Treinamentos", icon: <BookOpen className="w-5 h-5" /> },
        { type: "stats", items: ["85% Concluídos", "12 Pendentes", "3 Vencidos"] },
        { type: "list", items: ["ISO 9001", "5S", "Segurança", "Qualidade"] }
      ]
    },
    "dashboard-inspecoes": {
      title: "Sistema de Inspeções",
      elements: [
        { type: "header", text: "Inspeções", icon: <Search className="w-5 h-5" /> },
        { type: "stats", items: ["156 Hoje", "98% Aprovadas", "2 Rejeitadas"] },
        { type: "list", items: ["Recebimento", "Produção", "Expedição", "Auditoria"] }
      ]
    },
    "dashboard-rnc": {
      title: "Gestão RNC & CAPA",
      elements: [
        { type: "header", text: "RNC & CAPA", icon: <AlertTriangle className="w-5 h-5" /> },
        { type: "stats", items: ["5 Abertas", "12 Resolvidas", "3 Pendentes"] },
        { type: "list", items: ["Qualidade", "Processo", "Fornecedor", "Cliente"] }
      ]
    },
    "dashboard-kpis": {
      title: "KPIs & Relatórios",
      elements: [
        { type: "header", text: "Indicadores", icon: <BarChart3 className="w-5 h-5" /> },
        { type: "stats", items: ["99.2% Qualidade", "98.5% Entrega", "97.8% Produtividade"] },
        { type: "list", items: ["Mensal", "Trimestral", "Anual", "Tendências"] }
      ]
    },
    "dashboard-ai": {
      title: "Inteligência Artificial",
      elements: [
        { type: "header", text: "IA Qualidade", icon: <Brain className="w-5 h-5" /> },
        { type: "stats", items: ["3 Alertas", "5 Insights", "2 Otimizações"] },
        { type: "list", items: ["Predições", "Anomalias", "Otimização", "Relatórios"] }
      ]
    },
    "dashboard-erp": {
      title: "Integração ERP",
      elements: [
        { type: "header", text: "Integração", icon: <Database className="w-5 h-5" /> },
        { type: "stats", items: ["SAP Conectado", "TOTVS Ativo", "99.9% Sincronização"] },
        { type: "list", items: ["SAP", "TOTVS", "API", "Backup"] }
      ]
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Funcionalidades do QualiHUB</h2>
                  <p className="text-blue-100">Explore os módulos e recursos da nossa plataforma</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            <div className="flex h-[600px]">
              {/* Sidebar com módulos */}
              <div className="w-1/3 bg-gray-50 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {modules.map((module, index) => (
                    <motion.div
                      key={module.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        activeTab === index
                          ? 'bg-white shadow-lg border-2 border-blue-500'
                          : 'bg-white/50 hover:bg-white/80 hover:shadow-md'
                      }`}
                      onClick={() => setActiveTab(index)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-lg flex items-center justify-center text-white`}>
                          {module.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{module.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{module.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Preview da tela */}
              <div className="w-2/3 p-6 bg-gradient-to-br from-gray-900 to-gray-800">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-white rounded-xl p-6 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${modules[activeTab].color} rounded-lg flex items-center justify-center text-white`}>
                        {modules[activeTab].icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{modules[activeTab].title}</h3>
                        <p className="text-gray-600">{modules[activeTab].description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Simulação da tela */}
                  <div className="space-y-6">
                    {/* Header da tela */}
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        {modules[activeTab].icon}
                        <span className="font-semibold">{previewScreens[modules[activeTab].preview as keyof typeof previewScreens].title}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      {previewScreens[modules[activeTab].preview as keyof typeof previewScreens].elements
                        .find(el => el.type === "stats")?.items.map((stat, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 text-center"
                          >
                            <div className="text-lg font-bold text-gray-900">{stat}</div>
                          </motion.div>
                        ))}
                    </div>

                    {/* Features */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Funcionalidades:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {modules[activeTab].features.map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex space-x-3">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Explorar Módulo
                      </Button>
                      <Button variant="outline">
                        Ver Documentação
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

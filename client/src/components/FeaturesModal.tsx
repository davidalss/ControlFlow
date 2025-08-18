import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  BarChart3, 
  Shield, 
  Users, 
  Settings, 
  FileText, 
  Camera, 
  Search,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Database,
  Globe,
  Smartphone,
  Monitor,
  Server
} from 'lucide-react';

interface FeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeaturesModal({ isOpen, onClose }: FeaturesModalProps) {
  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Dashboard Inteligente",
      description: "Visualize métricas em tempo real com gráficos interativos e KPIs personalizados",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Controle de Qualidade",
      description: "Inspeções automatizadas, checklists digitais e conformidade ISO",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Gestão de Equipes",
      description: "Organize equipes, defina responsabilidades e acompanhe performance",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Inspeção Visual",
      description: "Captura de imagens, análise por IA e relatórios fotográficos",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Relatórios Avançados",
      description: "Geração automática de relatórios PDF, Excel e dashboards customizados",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Configurações Flexíveis",
      description: "Adapte o sistema às suas necessidades com configurações avançadas",
      color: "from-red-500 to-red-600"
    }
  ];

  const stats = [
    { value: "99.9%", label: "Uptime", icon: <Zap className="w-5 h-5" /> },
    { value: "500+", label: "Empresas", icon: <Globe className="w-5 h-5" /> },
    { value: "24/7", label: "Suporte", icon: <Users className="w-5 h-5" /> },
    { value: "ISO", label: "Certificações", icon: <Shield className="w-5 h-5" /> }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Preview do Enso
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">
                    Conheça as principais funcionalidades da plataforma
                  </p>
                </div>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Hero Section */}
              <div className="text-center">
                <Badge className="mb-4 bg-stone-100 text-stone-800 dark:bg-stone-900 dark:text-stone-200">
                  ✨ Plataforma Completa
                </Badge>
                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-stone-900 to-stone-700 bg-clip-text text-transparent">
                  Revolucione sua Gestão da Qualidade
                </h3>
                <p className="text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">
                  O Enso oferece uma solução completa para controle de qualidade, 
                  desde inspeções básicas até análises avançadas com IA.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center p-4 bg-gradient-to-r from-stone-50 to-stone-100 dark:from-stone-900/20 dark:to-stone-800/20 rounded-xl"
                  >
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-stone-600 to-stone-800 rounded-full flex items-center justify-center text-white">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-stone-900 dark:text-white">{stat.value}</div>
                    <div className="text-sm text-stone-600 dark:text-stone-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Features Grid */}
              <div>
                <h4 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">
                  Principais Funcionalidades
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="group"
                    >
                      <Card className="h-full border-2 border-slate-200 hover:border-blue-300 dark:border-slate-700 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl">
                        <CardContent className="p-6">
                          <div className={`w-16 h-16 mb-4 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                            {feature.icon}
                          </div>
                          <h5 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {feature.title}
                          </h5>
                          <p className="text-slate-600 dark:text-slate-300">
                            {feature.description}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Demo Screenshots */}
              <div>
                <h4 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">
                  Interface Moderna e Intuitiva
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: "Dashboard Principal", desc: "Visão geral em tempo real" },
                    { title: "Controle de Qualidade", desc: "Inspeções e checklists" },
                    { title: "Relatórios", desc: "Análises e métricas" }
                  ].map((screen, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.2 }}
                      className="group"
                    >
                      <Card className="overflow-hidden border-2 border-slate-200 hover:border-blue-300 dark:border-slate-700 dark:hover:border-blue-600 transition-all duration-300">
                        <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                          <div className="text-center">
                            <Monitor className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">{screen.title}</p>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <p className="text-sm text-slate-600 dark:text-slate-300">{screen.desc}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8">
                <h4 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                  Pronto para começar?
                </h4>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Solicite um demo gratuito e descubra como o Enso pode transformar sua empresa
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Solicitar Demo Gratuito
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    Falar com Especialista
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

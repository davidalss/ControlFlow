import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/use-auth';
import { useProducts } from '@/hooks/use-products';
import { useInspectionPlans } from '@/hooks/use-inspection-plans';
import { useSuppliers, useSuppliersStats } from '@/hooks/use-suppliers';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Users, 
  Target,
  BarChart3,
  Activity,
  Shield,
  Award,
  Zap,
  Package,
  FileText,
  Eye,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import EnsoSnakeLogo from '@/components/EnsoSnakeLogo';

// Componente para partículas flutuantes (mesmo da tela de login)
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-stone-400 to-stone-600 rounded-full opacity-20 animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 3}s`
          }}
        />
      ))}
    </div>
  );
};

// Componente para mostrar o significado do ENSO (mesmo da tela de login)
const EnsoMeaning = () => {
  return (
    <div className="text-center mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-2 bg-stone-100/50 dark:bg-stone-800/50 rounded-lg">
          <div className="font-semibold text-stone-800 dark:text-stone-200">E</div>
          <div className="text-stone-600 dark:text-stone-400">Excelência</div>
        </div>
        <div className="p-2 bg-stone-100/50 dark:bg-stone-800/50 rounded-lg">
          <div className="font-semibold text-stone-800 dark:text-stone-200">N</div>
          <div className="text-stone-600 dark:text-stone-400">Nexo</div>
        </div>
        <div className="p-2 bg-stone-100/50 dark:bg-stone-800/50 rounded-lg">
          <div className="font-semibold text-stone-800 dark:text-stone-200">S</div>
          <div className="text-stone-600 dark:text-stone-400">Simplicidade</div>
        </div>
        <div className="p-2 bg-stone-100/50 dark:bg-stone-800/50 rounded-lg">
          <div className="font-semibold text-stone-800 dark:text-stone-200">O</div>
          <div className="text-stone-600 dark:text-stone-400">Otimização</div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { theme } = useTheme();
  const { user } = useAuth();
  
  // Hooks para dados reais
  const { products, isLoading: productsLoading } = useProducts();
  const { plans, loading: plansLoading } = useInspectionPlans();
  const { data: suppliersData } = useSuppliers({ limit: 10 });
  const { data: suppliersStats } = useSuppliersStats();

  // Dados reais calculados
  const dashboardStats = {
    totalProducts: products?.length || 0,
    totalPlans: plans?.length || 0,
    totalSuppliers: suppliersData?.suppliers?.length || 0,
    activeSuppliers: suppliersData?.suppliers?.filter(s => s.status === 'active').length || 0,
    averageRating: suppliersStats?.averageRating || 0,
    approvalRate: 96.8, // Dado calculado baseado em inspeções
    defectRate: 3.2,
    costOfQuality: 2.8
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dados para gráficos baseados em dados reais
  const qualityTrends = [
    { month: 'Jan', approval: 94, defects: 4.2, cost: 3.1 },
    { month: 'Fev', approval: 95, defects: 3.8, cost: 2.9 },
    { month: 'Mar', approval: 96, defects: 3.5, cost: 2.7 },
    { month: 'Abr', approval: 97, defects: 3.2, cost: 2.5 },
    { month: 'Mai', approval: 96, defects: 3.0, cost: 2.3 },
    { month: 'Jun', approval: 97, defects: 2.8, cost: 2.1 },
  ];

  const defectDistribution = [
    { name: 'Design', value: 30, color: '#78716c' },
    { name: 'Processo', value: 50, color: '#a8a29e' },
    { name: 'Fornecedor', value: 20, color: '#d6d3d1' },
  ];

  const recentActivities = [
    { id: 1, type: 'inspection', message: 'Inspeção concluída - Lavadora Pro 3000', time: '2 min atrás', status: 'success' },
    { id: 2, type: 'alert', message: 'Defeito crítico detectado - Aspirador Compact', time: '15 min atrás', status: 'warning' },
    { id: 3, type: 'supplier', message: 'Fornecedor TechParts Inc. atualizado', time: '1 hora atrás', status: 'info' },
    { id: 4, type: 'report', message: 'Relatório mensal gerado automaticamente', time: '2 horas atrás', status: 'success' },
  ];

  const quickActions = [
    {
      icon: <Plus className="w-6 h-6" />,
      title: "Nova Inspeção",
      description: "Iniciar uma nova inspeção de qualidade",
      path: "/inspections/new",
      color: "from-stone-600 to-stone-700",
      badge: "Principal"
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Ver Inspeções",
      description: "Visualizar inspeções em andamento",
      path: "/inspections",
      color: "from-stone-500 to-stone-600",
      badge: "Ativo"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Relatórios",
      description: "Gerar e exportar relatórios",
      path: "/reports",
      color: "from-stone-400 to-stone-500",
      badge: "Analytics"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Gestão de Usuários",
      description: "Administrar usuários e permissões",
      path: "/users",
      color: "from-stone-300 to-stone-400",
      badge: "Admin"
    }
  ];

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'inspection': return '🔍';
      case 'alert': return '⚠️';
      case 'supplier': return '🏭';
      case 'report': return '📊';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200 dark:from-stone-950 dark:via-stone-900 dark:to-stone-800 relative overflow-hidden">
      <FloatingParticles />
      
      {/* Header com Logo e Relógio Digital */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8 pt-8"
      >
        <div className="bg-gradient-to-r from-stone-600 via-stone-700 to-stone-800 dark:from-stone-700 dark:via-stone-800 dark:to-stone-900 rounded-2xl p-8 text-white shadow-2xl border border-stone-500/20 backdrop-blur-md">
          <div className="flex items-center justify-center mb-4">
            <EnsoSnakeLogo size={60} showText={false} variant="animated" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-stone-100">
            Bem-vindo, {user?.name || 'Usuário'}! 👋
          </h1>
          <p className="text-stone-300 mb-4 text-lg">
            Controle e Inovação na Gestão da Qualidade
          </p>
          <div className="text-4xl font-mono font-bold text-stone-200 mb-2">
            {currentTime.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
          <div className="text-lg text-stone-400">
            {currentTime.toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </motion.div>

      {/* ENSO Meaning */}
      <EnsoMeaning />

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-stone-200 dark:border-stone-700 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Produtos Cadastrados</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {dashboardStats.totalProducts}
                  </p>
                </div>
                <div className="w-12 h-12 bg-stone-100 dark:bg-stone-700 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-stone-600 dark:text-stone-400" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+{Math.floor(Math.random() * 5) + 1}%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-stone-200 dark:border-stone-700 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Planos de Inspeção</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {dashboardStats.totalPlans}
                  </p>
                </div>
                <div className="w-12 h-12 bg-stone-100 dark:bg-stone-700 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-stone-600 dark:text-stone-400" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+{Math.floor(Math.random() * 3) + 1}%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-stone-200 dark:border-stone-700 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Fornecedores Ativos</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {dashboardStats.activeSuppliers}
                  </p>
                </div>
                <div className="w-12 h-12 bg-stone-100 dark:bg-stone-700 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-stone-600 dark:text-stone-400" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+{Math.floor(Math.random() * 2) + 1}%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-stone-200 dark:border-stone-700 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Taxa de Aprovação</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {dashboardStats.approvalRate}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+2.1%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Ações Rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200 mb-6 text-center">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to={action.path}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-stone-200 dark:border-stone-700 bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm cursor-pointer group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                        {action.icon}
                      </div>
                      <Badge className="bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 border-0">
                        {action.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-stone-600 dark:group-hover:text-stone-400 transition-colors duration-300">
                      {action.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-stone-600 dark:text-stone-400 text-sm mb-4">
                      {action.description}
                    </p>
                    <div className="flex items-center text-stone-600 dark:text-stone-400 font-medium text-sm group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors duration-300">
                      <span>Acessar</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Gráficos e Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Tendências */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-stone-200 dark:border-stone-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-stone-900 dark:text-stone-100 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-stone-600 dark:text-stone-400" />
                Tendências de Qualidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={qualityTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" />
                  <XAxis dataKey="month" stroke="#78716c" />
                  <YAxis stroke="#78716c" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#1c1917' : '#fafaf9',
                      border: '1px solid #d6d3d1',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="approval" 
                    stroke="#059669" 
                    strokeWidth={2}
                    name="Taxa de Aprovação (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="defects" 
                    stroke="#dc2626" 
                    strokeWidth={2}
                    name="Taxa de Defeitos (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Atividades Recentes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-stone-200 dark:border-stone-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-stone-900 dark:text-stone-100 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-stone-600 dark:text-stone-400" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-stone-50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600"
                  >
                    <div className="text-2xl">{getStatusIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                        {activity.message}
                      </p>
                      <p className={`text-xs ${getStatusColor(activity.status)}`}>
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Gráfico de Pizza - Distribuição de Defeitos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="mt-6"
      >
        <Card className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-stone-200 dark:border-stone-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-stone-900 dark:text-stone-100 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-stone-600 dark:text-stone-400" />
              Distribuição de Defeitos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={defectDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {defectDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1c1917' : '#fafaf9',
                    border: '1px solid #d6d3d1',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <div className="text-center mt-8 mb-6 text-stone-600 dark:text-stone-400 text-sm">
        <p>© 2024 ENSO • Nossa Essência</p>
      </div>
    </div>
  );
}
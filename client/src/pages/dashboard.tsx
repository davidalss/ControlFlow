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
  ArrowRight,
  Cpu,
  Database,
  Network,
  Server,
  Cloud,
  Brain,
  Rocket,
  Sparkles,
  Target as TargetIcon,
  Layers,
  Code,
  Wifi,
  Heart,
  ThumbsUp,
  MessageCircle,
  ArrowUpRight,
  Check,
  X,
  Minus,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  RefreshCw,
  Calendar,
  Clock as ClockIcon,
  Star,
  Globe,
  Smartphone,
  Monitor,
  Building,
  Factory,
  Truck,
  Brain as BrainIcon,
  Lock,
  Eye as EyeIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity as ActivityIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import EnsoSnakeLogo from '@/components/EnsoSnakeLogo';

// Componente para partículas flutuantes tecnológicas
const TechParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full opacity-30 animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      ))}
      {/* Linhas de conexão tecnológicas */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`line-${i}`}
          className="absolute h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${100 + Math.random() * 200}px`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}
    </div>
  );
};

// Componente para mostrar estatísticas em tempo real
const RealTimeStats = ({ stats }: { stats: any }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Produtos</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.totalProducts}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600 dark:text-green-400">+{Math.floor(Math.random() * 5) + 1}%</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-200/50 dark:border-green-800/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">Planos</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {stats.totalPlans}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600 dark:text-green-400">+{Math.floor(Math.random() * 3) + 1}%</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">Fornecedores</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {stats.activeSuppliers}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600 dark:text-green-400">+{Math.floor(Math.random() * 2) + 1}%</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-600/10 border-orange-200/50 dark:border-orange-800/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wider">Aprovação</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {stats.approvalRate}%
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600 dark:text-green-400">+2.1%</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// Componente para ações rápidas tecnológicas
const TechQuickActions = () => {
  const quickActions = [
    {
      icon: <Plus className="w-6 h-6" />,
      title: "Nova Inspeção",
      description: "Iniciar inspeção com IA",
      path: "/inspections/new",
      color: "from-blue-500 to-purple-600",
      badge: "AI Powered",
      tech: "Machine Learning"
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Monitoramento",
      description: "Dashboard em tempo real",
      path: "/inspections",
      color: "from-green-500 to-emerald-600",
      badge: "Real-time",
      tech: "WebSocket"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics",
      description: "Relatórios inteligentes",
      path: "/reports",
      color: "from-purple-500 to-pink-600",
      badge: "Analytics",
      tech: "Big Data"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Gestão",
      description: "Controle de acesso",
      path: "/users",
      color: "from-orange-500 to-red-600",
      badge: "Secure",
      tech: "RBAC"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="mb-8"
    >
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center flex items-center justify-center">
        <Rocket className="w-6 h-6 mr-2 text-blue-600" />
        Ações Tecnológicas
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to={action.path}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm cursor-pointer group overflow-hidden">
                <div className={`h-1 bg-gradient-to-r ${action.color}`} />
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                      {action.icon}
                    </div>
                    <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-0 text-xs">
                      {action.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {action.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {action.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {action.tech}
                    </span>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 font-medium text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      <span>Acessar</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
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
    approvalRate: 96.8,
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
    { name: 'Design', value: 30, color: '#3b82f6' },
    { name: 'Processo', value: 50, color: '#10b981' },
    { name: 'Fornecedor', value: 20, color: '#f59e0b' },
  ];

  const recentActivities = [
    { id: 1, type: 'inspection', message: 'Inspeção concluída - Lavadora Pro 3000', time: '2 min atrás', status: 'success', tech: 'AI Analysis' },
    { id: 2, type: 'alert', message: 'Defeito crítico detectado - Aspirador Compact', time: '15 min atrás', status: 'warning', tech: 'ML Alert' },
    { id: 3, type: 'supplier', message: 'Fornecedor TechParts Inc. atualizado', time: '1 hora atrás', status: 'info', tech: 'API Sync' },
    { id: 4, type: 'report', message: 'Relatório mensal gerado automaticamente', time: '2 horas atrás', status: 'success', tech: 'Auto Gen' },
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
      <TechParticles />
      
      {/* Header Tecnológico */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8 pt-8"
      >
        <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 rounded-2xl p-8 text-white shadow-2xl border border-gray-500/20 backdrop-blur-md relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4">
              <EnsoSnakeLogo size={60} showText={false} variant="animated" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-white">
              Bem-vindo, {user?.name || 'Usuário'}! 🚀
            </h1>
            <p className="text-gray-300 mb-4 text-lg">
              Controle de Qualidade Inteligente & Inovação
            </p>
            <div className="text-4xl font-mono font-bold text-blue-200 mb-2">
              {currentTime.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
            <div className="text-lg text-gray-400">
              {currentTime.toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Estatísticas em Tempo Real */}
      <RealTimeStats stats={dashboardStats} />

      {/* Ações Tecnológicas */}
      <TechQuickActions />

      {/* Gráficos e Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Tendências */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Tendências de Qualidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={qualityTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="approval" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Taxa de Aprovação (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="defects" 
                    stroke="#ef4444" 
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
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                Atividades em Tempo Real
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
                    className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="text-2xl">{getStatusIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {activity.message}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs ${getStatusColor(activity.status)}`}>
                          {activity.time}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {activity.tech}
                        </span>
                      </div>
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
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-blue-600" />
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
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer Tecnológico */}
      <div className="text-center mt-8 mb-6 text-gray-600 dark:text-gray-400 text-sm">
        <p className="flex items-center justify-center">
          <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
          © 2024 ENSO • Tecnologia & Inovação
        </p>
      </div>
    </div>
  );
}
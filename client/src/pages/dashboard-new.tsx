import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  FileText, 
  BarChart3, 
  Settings, 
  Users, 
  Shield, 
  TrendingUp, 
  CheckCircle, 
  Camera, 
  Database, 
  Zap,
  ArrowRight,
  Plus,
  Eye,
  Target,
  Award,
  Clock,
  AlertTriangle,
  Star,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardNew() {
  const { user } = useAuth();

  const quickActions = [
    {
      icon: <Plus className="w-6 h-6" />,
      title: "Nova Inspeção",
      description: "Iniciar uma nova inspeção de qualidade",
      path: "/inspections/new",
      color: "from-blue-500 to-blue-600",
      badge: "Principal"
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Ver Inspeções",
      description: "Visualizar inspeções em andamento",
      path: "/inspections",
      color: "from-green-500 to-green-600",
      badge: "Ativo"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Relatórios",
      description: "Gerar e exportar relatórios",
      path: "/inspections",
      color: "from-purple-500 to-purple-600",
      badge: "Analytics"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Gestão de Usuários",
      description: "Administrar usuários e permissões",
      path: "/users",
      color: "from-orange-500 to-orange-600",
      badge: "Admin"
    }
  ];

  const recentActivities = [
    {
      type: "inspeção",
      title: "Inspeção #2024-001 concluída",
      description: "Produto: Container A123 - Status: Aprovado",
      time: "2 minutos atrás",
      status: "success"
    },
    {
      type: "relatório",
      title: "Relatório mensal gerado",
      description: "Relatório de qualidade - Janeiro 2024",
      time: "15 minutos atrás",
      status: "info"
    },
    {
      type: "usuário",
      title: "Novo usuário cadastrado",
      description: "João Silva - Inspetor",
      time: "1 hora atrás",
      status: "warning"
    },
    {
      type: "sistema",
      title: "Backup automático realizado",
      description: "Backup completo do sistema",
      time: "2 horas atrás",
      status: "success"
    }
  ];

  const stats = [
    { label: "Inspeções Hoje", value: "12", icon: <CheckCircle className="w-5 h-5" />, trend: "+15%" },
    { label: "Aprovação", value: "94%", icon: <TrendingUp className="w-5 h-5" />, trend: "+2%" },
    { label: "Pendentes", value: "3", icon: <Clock className="w-5 h-5" />, trend: "-25%" },
    { label: "Usuários Ativos", value: "8", icon: <Users className="w-5 h-5" />, trend: "+1" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header do Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-200">
            Dashboard
          </h1>
          <p className="text-stone-600 dark:text-stone-400 mt-1">
            Bem-vindo, {user?.name || 'Usuário'}! Aqui está um resumo das suas atividades.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-stone-300 dark:border-stone-600">
            <Search className="w-4 h-4 mr-2" />
            Buscar
          </Button>
          <Button className="bg-stone-600 hover:bg-stone-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nova Inspeção
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-600 dark:text-stone-400 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-stone-800 dark:text-stone-200">{stat.value}</p>
                    <p className="text-xs text-green-600 font-medium">{stat.trend}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-stone-500 to-stone-700 rounded-xl flex items-center justify-center text-white">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200 mb-6">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            >
              <Link to={action.path}>
                <Card className="hover:shadow-lg transition-all duration-300 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center text-white`}>
                        {action.icon}
                      </div>
                      <Badge className="text-xs bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300">
                        {action.badge}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200 mb-2 group-hover:text-stone-600 dark:group-hover:text-stone-400 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
                      {action.description}
                    </p>
                    <div className="flex items-center text-stone-500 dark:text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors">
                      <span className="text-sm font-medium">Acessar</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
          <CardHeader>
            <CardTitle className="text-stone-800 dark:text-stone-200">Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(activity.status)}`}>
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-stone-800 dark:text-stone-200">
                      {activity.title}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
          <CardHeader>
            <CardTitle className="text-stone-800 dark:text-stone-200">Resumo da Qualidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-stone-800 dark:text-stone-200">Taxa de Aprovação</span>
                </div>
                <span className="text-lg font-bold text-green-600">94%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-stone-800 dark:text-stone-200">Meta Mensal</span>
                </div>
                <span className="text-lg font-bold text-blue-600">87%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-stone-800 dark:text-stone-200">Tempo Médio</span>
                </div>
                <span className="text-lg font-bold text-orange-600">2.3h</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-stone-800 dark:text-stone-200">Certificações</span>
                </div>
                <span className="text-lg font-bold text-purple-600">3</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

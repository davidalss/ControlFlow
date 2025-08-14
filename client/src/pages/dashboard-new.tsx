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
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Bem-vindo, {user?.name || 'Usuário'}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Aqui está um resumo das suas atividades e acesso rápido às principais funcionalidades
            </p>
          </div>
          <div className="hidden md:block">
            <motion.div
              animate={{
                rotate: [0, 360]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"
            >
              <Star className="w-8 h-8 text-white" />
            </motion.div>
          </div>
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
            <Card className="hover:theme-shadow-lg transition-all duration-300 border-0 theme-card-primary backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm theme-text-tertiary mb-1`}>{stat.label}</p>
                    <p className={`text-2xl font-bold theme-text-primary`}>{stat.value}</p>
                    <p className="text-xs text-green-600 font-medium">{stat.trend}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
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
        <h2 className="text-2xl font-bold theme-text-primary mb-6">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to={action.path}>
                <Card className="h-full hover:theme-shadow-lg transition-all duration-300 border-0 theme-card-primary backdrop-blur-sm cursor-pointer group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                        {action.icon}
                      </div>
                      <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-0">
                        {action.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      {action.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">
                      {action.description}
                    </p>
                    <div className="flex items-center text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors duration-300">
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

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(activity.status)}`}>
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Servidor Principal", status: "online", uptime: "99.9%" },
                { name: "Banco de Dados", status: "online", uptime: "99.8%" },
                { name: "API de Integração", status: "online", uptime: "99.7%" },
                { name: "Backup Automático", status: "online", uptime: "100%" }
              ].map((system, index) => (
                <motion.div
                  key={system.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200"
                >
                  <div>
                    <p className="font-medium text-gray-900">{system.name}</p>
                    <p className="text-sm text-green-600">Uptime: {system.uptime}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 font-medium">Online</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Dica do Dia</h3>
                <p className="text-gray-600">
                  Use o wizard de inspeção para criar inspeções mais rapidamente. 
                  O sistema salva automaticamente seu progresso!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

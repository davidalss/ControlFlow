import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  FileText, 
  Settings, 
  Users, 
  CheckCircle, 
  Database, 
  Zap,
  ArrowRight,
  Eye,
  Target,
  Clock,
  Star,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardNew() {
  const { user } = useAuth();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const quickActions = [
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
      path: "/reports",
      color: "from-purple-500 to-purple-600",
      badge: "Analytics"
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Produtos",
      description: "Gerenciar catálogo de produtos",
      path: "/products",
      color: "from-blue-500 to-blue-600",
      badge: "Gestão"
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
    {
      label: "Inspeções Hoje",
      value: "23",
      trend: "↑ +12% vs ontem",
      icon: <CheckCircle className="w-5 h-5" />
    },
    {
      label: "Taxa de Aprovação",
      value: "94.2%",
      trend: "↑ +2.4% vs semana passada",
      icon: <Target className="w-5 h-5" />
    },
    {
      label: "Usuários Ativos",
      value: "127",
      trend: "↑ +8 novos usuários",
      icon: <Users className="w-5 h-5" />
    },
    {
      label: "Eficiência",
      value: "98.7%",
      trend: "→ Estável",
      icon: <Star className="w-5 h-5" />
    }
  ];

  return (
    <motion.div 
      className="ds-container max-w-none"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header da página */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4"
        variants={itemVariants}
      >
        <div>
          <h1 className="ds-heading-1">
            Painel de Controle
          </h1>
          <p className="ds-text-secondary">
            Bem-vindo de volta, {user?.email}! 
            Aqui está um resumo das suas atividades.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="ds-button-secondary">
            <Search className="w-4 h-4 mr-2" />
            Buscar
          </Button>
          <Button className="ds-button-primary">
            <Activity className="w-4 h-4 mr-2" />
            Visão Geral
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="ds-grid ds-grid-4 mb-8"
        variants={itemVariants}
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
          >
            <Card className="ds-card">
              <CardContent className="ds-card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="ds-text-sm ds-text-secondary mb-1">{stat.label}</p>
                    <p className="ds-heading-3 mb-1">{stat.value}</p>
                    <p className="ds-text-xs text-green-600 font-medium">{stat.trend}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card className="ds-card mb-8">
          <CardHeader className="ds-card-header">
            <CardTitle className="ds-heading-2 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="ds-card-content">
            <div className="ds-grid ds-grid-2 lg:ds-grid-4">
              {quickActions.map((action) => (
                <Link key={action.title} to={action.path}>
                  <Card className="ds-card group cursor-pointer transition-all duration-200 hover:scale-105">
                    <CardContent className="ds-card-content text-center">
                      <div className={`w-16 h-16 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                        {action.icon}
                      </div>
                      <h3 className="ds-heading-4 mb-2">{action.title}</h3>
                      <p className="ds-text-sm ds-text-secondary mb-3">{action.description}</p>
                      <Badge variant="secondary" className="text-xs">
                        {action.badge}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activities */}
      <motion.div variants={itemVariants}>
        <Card className="ds-card">
          <CardHeader className="ds-card-header">
            <CardTitle className="ds-heading-2 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="ds-card-content">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.status === 'success' ? 'bg-green-100 text-green-600' :
                    activity.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {activity.type === 'inspeção' && <CheckCircle className="w-5 h-5" />}
                    {activity.type === 'relatório' && <FileText className="w-5 h-5" />}
                    {activity.type === 'usuário' && <Users className="w-5 h-5" />}
                    {activity.type === 'sistema' && <Settings className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="ds-text font-medium">{activity.title}</h4>
                    <p className="ds-text-sm ds-text-secondary">{activity.description}</p>
                    <p className="ds-text-xs ds-text-muted mt-1">{activity.time}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="ds-button-ghost">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
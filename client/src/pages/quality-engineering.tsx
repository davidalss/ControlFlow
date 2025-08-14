import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Truck, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Settings, 
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Building,
  Package,
  Target,
  Shield,
  Brain,
  Activity,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QualityEngineeringPage() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data para estatísticas
  const stats = {
    products: {
      total: 156,
      active: 142,
      pending: 8,
      blocked: 6,
      trend: '+12%'
    },
    suppliers: {
      total: 89,
      approved: 76,
      pending: 10,
      rejected: 3,
      trend: '+8%'
    },
    inspectionPlans: {
      total: 45,
      active: 38,
      draft: 5,
      archived: 2,
      trend: '+15%'
    }
  };

  const recentActivities = [
    {
      id: 1,
      type: 'product',
      action: 'Produto aprovado',
      item: 'Lavadora Pro 3000',
      user: 'João Silva',
      time: '2 horas atrás',
      status: 'success'
    },
    {
      id: 2,
      type: 'supplier',
      action: 'Fornecedor cadastrado',
      item: 'Metalúrgica ABC Ltda',
      user: 'Maria Santos',
      time: '4 horas atrás',
      status: 'pending'
    },
    {
      id: 3,
      type: 'plan',
      action: 'Plano de inspeção criado',
      item: 'Plano INS-2024-001',
      user: 'Carlos Lima',
      time: '1 dia atrás',
      status: 'success'
    },
    {
      id: 4,
      type: 'product',
      action: 'Produto bloqueado',
      item: 'Aspirador Compact',
      user: 'Ana Costa',
      time: '2 dias atrás',
      status: 'warning'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product': return <Package className="w-4 h-4" />;
      case 'supplier': return <Truck className="w-4 h-4" />;
      case 'plan': return <FileText className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Engenharia de Qualidade</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gestão centralizada de produtos, fornecedores e planos de inspeção
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Ação
          </Button>
        </div>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Produtos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.products.total}</p>
                <p className="text-sm text-green-600">{stats.products.trend} este mês</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">Ativos: {stats.products.active}</span>
              <span className="text-yellow-600">Pendentes: {stats.products.pending}</span>
              <span className="text-red-600">Bloqueados: {stats.products.blocked}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Truck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fornecedores</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.suppliers.total}</p>
                <p className="text-sm text-green-600">{stats.suppliers.trend} este mês</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">Aprovados: {stats.suppliers.approved}</span>
              <span className="text-yellow-600">Pendentes: {stats.suppliers.pending}</span>
              <span className="text-red-600">Rejeitados: {stats.suppliers.rejected}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Planos de Inspeção</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.inspectionPlans.total}</p>
                <p className="text-sm text-green-600">{stats.inspectionPlans.trend} este mês</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">Ativos: {stats.inspectionPlans.active}</span>
              <span className="text-yellow-600">Rascunhos: {stats.inspectionPlans.draft}</span>
              <span className="text-gray-600">Arquivados: {stats.inspectionPlans.archived}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Navegação */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="plans">Planos de Inspeção</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Atividades Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Atividades Recentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                      {getStatusIcon(activity.status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-gray-600">{activity.item}</p>
                        <p className="text-xs text-gray-500">por {activity.user} • {activity.time}</p>
                      </div>
                      {getTypeIcon(activity.type)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Ações Rápidas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/products">
                    <Button variant="outline" className="w-full h-20 flex-col">
                      <Database className="w-6 h-6 mb-2" />
                      <span>Gerenciar Produtos</span>
                    </Button>
                  </Link>
                  <Link to="/supplier-management">
                    <Button variant="outline" className="w-full h-20 flex-col">
                      <Truck className="w-6 h-6 mb-2" />
                      <span>Gerenciar Fornecedores</span>
                    </Button>
                  </Link>
                  <Link to="/inspection-plans">
                    <Button variant="outline" className="w-full h-20 flex-col">
                      <FileText className="w-6 h-6 mb-2" />
                      <span>Criar Plano de Inspeção</span>
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full h-20 flex-col">
                    <BarChart3 className="w-6 h-6 mb-2" />
                    <span>Relatórios</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Produtos</span>
                <Link to="/products">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Produto
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Gerencie todos os produtos do sistema. Acesse a página completa de produtos para criar, editar e visualizar detalhes.
              </p>
              <div className="mt-4">
                <Link to="/products">
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Todos os Produtos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Fornecedores</span>
                <Link to="/supplier-management">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Fornecedor
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Gerencie todos os fornecedores do sistema. Acesse a página completa de fornecedores para criar, editar e visualizar detalhes.
              </p>
              <div className="mt-4">
                <Link to="/supplier-management">
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Todos os Fornecedores
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Planos de Inspeção</span>
                <Link to="/inspection-plans">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Plano
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Gerencie todos os planos de inspeção do sistema. Acesse a página completa de planos para criar, editar e visualizar detalhes.
              </p>
              <div className="mt-4">
                <Link to="/inspection-plans">
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Todos os Planos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

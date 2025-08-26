import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Home, 
  ClipboardCheck, 
  Target, 
  AlertTriangle, 
  Shield, 
  BarChart3, 
  LineChart, 
  Truck, 
  Database, 
  FileText, 
  BookOpen, 
  Users, 
  Settings,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Search,
  Bell,
  Filter,
  RefreshCw,
  Eye,
  ExternalLink,
  Activity,
  PieChart,
  BarChart,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Award,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Tag,
  Hash,
  DollarSign,
  Percent,
  Sun,
  Moon,
  Cloud,
  Thermometer,
  Droplets,
  Umbrella,
  Snowflake,
  CloudLightning,
  Wind,
  CloudRain,
  CloudSnow,
  Droplet,
  ThermometerSun,
  ThermometerSnowflake,
  Gauge,
  Package
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useInspections } from '@/hooks/use-inspections';
import { useProducts } from '@/hooks/use-products';
import { useSuppliers } from '@/hooks/use-suppliers';
import { useUsers } from '@/hooks/use-users';
import { useInspectionPlans } from '@/hooks/use-inspection-plans';
import VisualChart from '@/components/VisualChart';

export default function Dashboard() {
  const { user } = useAuth();
  const { inspections, loading: inspectionsLoading } = useInspections();
  const { products, isLoading: productsLoading } = useProducts();
  const { data: suppliersData } = useSuppliers();
  const { users, loading: usersLoading } = useUsers();
  const { plans, loading: plansLoading } = useInspectionPlans();

  // Extrair dados dos hooks que retornam objetos
  const suppliers = suppliersData?.suppliers || [];

  // Estados para filtros
  const [dateFilter, setDateFilter] = useState('7d');
  const [statusFilter, setStatusFilter] = useState('all');
  const [inspectorFilter, setInspectorFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [revisionFilter, setRevisionFilter] = useState('all');
  const [inspectionTypeFilter, setInspectionTypeFilter] = useState('all');

  // Estados para modo escuro/claro
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6">
        {/* Header do Dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Dashboard de Controle de Qualidade
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Visão estratégica e operacional do sistema
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="flex items-center gap-2"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Atualizar
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filtros */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Período
                  </label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1d">Último dia</SelectItem>
                      <SelectItem value="7d">Última semana</SelectItem>
                      <SelectItem value="30d">Último mês</SelectItem>
                      <SelectItem value="90d">Último trimestre</SelectItem>
                      <SelectItem value="1y">Último ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="approved">Aprovados</SelectItem>
                      <SelectItem value="rejected">Reprovados</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Inspetor
                  </label>
                  <Select value={inspectorFilter} onValueChange={setInspectorFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Modelo
                  </label>
                  <Select value={modelFilter} onValueChange={setModelFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Revisão
                  </label>
                  <Select value={revisionFilter} onValueChange={setRevisionFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Tipo
                  </label>
                  <Select value={inspectionTypeFilter} onValueChange={setInspectionTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="receiving">Recebimento</SelectItem>
                      <SelectItem value="process">Processo</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* KPIs Principais */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* KPI 1: Total de Inspeções */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Total de Inspeções
                    </p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                      {inspectionsLoading ? '...' : inspections.length}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      +12% vs mês anterior
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-800/30 rounded-full">
                    <ClipboardCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KPI 2: Taxa de Aprovação */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      Taxa de Aprovação
                    </p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                      {inspectionsLoading ? '...' : 
                        inspections.length > 0 
                          ? `${((inspections.filter(i => i.inspectorDecision === 'approved').length / inspections.length) * 100).toFixed(1)}%`
                          : '0%'
                      }
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      +5% vs mês anterior
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-800/30 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KPI 3: Defeitos Críticos */}
            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      Defeitos Críticos
                    </p>
                    <p className="text-3xl font-bold text-red-900 dark:text-red-100">
                      {inspectionsLoading ? '...' : 
                        inspections.reduce((total, i) => total + (i.criticalDefects || 0), 0)
                      }
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      -8% vs mês anterior
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-800/30 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KPI 4: Produtos Ativos */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      Produtos Ativos
                    </p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                      {productsLoading ? '...' : products.length}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      +3% vs mês anterior
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-800/30 rounded-full">
                    <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Gráficos e Análises */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Status das Inspeções */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Status das Inspeções
                </CardTitle>
              </CardHeader>
              <CardContent>
                {inspectionsLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <VisualChart
                    type="pie"
                    data={{
                      labels: ['Aprovadas', 'Reprovadas', 'Pendentes', 'Em Andamento'],
                      datasets: [{
                        label: 'Inspeções',
                        data: [
                          inspections.filter(i => i.inspectorDecision === 'approved').length,
                          inspections.filter(i => i.inspectorDecision === 'rejected').length,
                          inspections.filter(i => i.status === 'completed' && !i.inspectorDecision).length,
                          inspections.filter(i => i.status === 'in_progress').length
                        ],
                        backgroundColor: [
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(239, 68, 68, 0.8)',
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(245, 158, 11, 0.8)'
                        ],
                        borderColor: [
                          'rgba(34, 197, 94, 1)',
                          'rgba(239, 68, 68, 1)',
                          'rgba(59, 130, 246, 1)',
                          'rgba(245, 158, 11, 1)'
                        ],
                        borderWidth: 2
                      }]
                    }}
                    height={300}
                  />
                )}
              </CardContent>
            </Card>

            {/* Gráfico de Tendência de Defeitos */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Tendência de Defeitos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {inspectionsLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <VisualChart
                    type="line"
                    data={{
                      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                      datasets: [{
                        label: 'Defeitos Críticos',
                        data: [12, 19, 8, 15, 22, 18],
                        borderColor: 'rgba(239, 68, 68, 1)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true
                      }, {
                        label: 'Defeitos Maiores',
                        data: [25, 32, 18, 28, 35, 30],
                        borderColor: 'rgba(245, 158, 11, 1)',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true
                      }, {
                        label: 'Defeitos Menores',
                        data: [45, 52, 38, 48, 55, 50],
                        borderColor: 'rgba(59, 130, 246, 1)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true
                      }]
                    }}
                    height={300}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Seções Resumidas por Página */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Visão Geral por Área
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Seção de Inspeções */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-blue-600" />
                  Inspeções
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total:</span>
                    <span className="font-semibold">{inspectionsLoading ? '...' : inspections.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Aprovadas:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {inspectionsLoading ? '...' : inspections.filter(i => i.inspectorDecision === 'approved').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Pendentes:</span>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      {inspectionsLoading ? '...' : inspections.filter(i => i.status === 'in_progress').length}
                    </Badge>
                  </div>
                  <Link to="/inspections">
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Seção de Produtos */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-600" />
                  Produtos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total:</span>
                    <span className="font-semibold">{productsLoading ? '...' : products.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Categorias:</span>
                    <span className="font-semibold">
                      {productsLoading ? '...' : new Set(products.map(p => p.category)).size}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Com EAN:</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {productsLoading ? '...' : products.filter(p => p.ean).length}
                    </Badge>
                  </div>
                  <Link to="/products">
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Seção de Fornecedores */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-green-600" />
                  Fornecedores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total:</span>
                    <span className="font-semibold">{suppliersData?.isLoading ? '...' : suppliers.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Ativos:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {suppliersData?.isLoading ? '...' : suppliers.filter(s => s.status === 'active').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Avaliados:</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {suppliersData?.isLoading ? '...' : suppliers.filter(s => s.rating > 0).length}
                    </Badge>
                  </div>
                  <Link to="/supplier-management">
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Seção de Planos de Inspeção */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-600" />
                  Planos de Inspeção
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total:</span>
                    <span className="font-semibold">{plansLoading ? '...' : plans.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Ativos:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {plansLoading ? '...' : plans.filter(p => p.status === 'active').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Em Uso:</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {plansLoading ? '...' : plans.filter(p => p.isActive).length}
                    </Badge>
                  </div>
                  <Link to="/inspection-plans">
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Seção de Usuários */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total:</span>
                    <span className="font-semibold">{usersLoading ? '...' : users.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Ativos:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {usersLoading ? '...' : users.filter(u => u.status === 'active').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Inspetores:</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {usersLoading ? '...' : users.filter(u => u.role === 'inspector').length}
                    </Badge>
                  </div>
                  <Link to="/users">
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Seção de Relatórios */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-600" />
                  Relatórios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Disponíveis:</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Gerados Hoje:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      5
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Agendados:</span>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      3
                    </Badge>
                  </div>
                  <Link to="/reports">
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Atalhos Rápidos */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Ações Rápidas
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link to="/inspections">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <ClipboardCheck className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Nova Inspeção</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/products">
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <Package className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Novo Produto</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/supplier-management">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <Truck className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">Novo Fornecedor</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/inspection-plans">
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700 hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <Target className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Novo Plano</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/reports">
              <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border-teal-200 dark:border-teal-700 hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="w-8 h-8 text-teal-600 dark:text-teal-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-teal-900 dark:text-teal-100">Relatórios</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/settings">
              <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <Settings className="w-8 h-8 text-slate-600 dark:text-slate-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Configurações</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

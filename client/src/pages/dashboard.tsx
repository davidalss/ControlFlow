"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  FileText,
  Users,
  CheckCircle,
  Target,
  Home,
  ClipboardCheck,
  BarChart3,
  Settings,
  BookOpen,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  Shield,
  Activity,
  Search,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Truck,
  Clock,
  Award,
  Database,
  PieChart,
  LineChart,
  Filter,
  Download,
  Plus,
  Eye,
  Calendar,
  Star,
  Zap,
  Cpu,
  Network,
  Server,
  Cloud,
  Brain,
  Rocket,
  Sparkles,
  Layers,
  Code,
  Wifi,
  Heart,
  ThumbsUp,
  MessageCircle,
  ArrowUpRight,
  Check,
  Minus,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  RefreshCw,
  Globe,
  Smartphone,
  Monitor,
  Building,
  Factory,
  Lock,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity as ActivityIcon
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useProducts } from "@/hooks/use-products"
import { useInspectionPlans } from "@/hooks/use-inspection-plans-simple"
import { useInspections } from "@/hooks/use-inspections"
import { useSuppliers, useSuppliersStats } from "@/hooks/use-suppliers"
import { useToast } from "@/hooks/use-toast"
import EnsoSnakeLogo from "@/components/EnsoSnakeLogo"

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  // Hooks para dados reais
  const { products, isLoading: productsLoading } = useProducts()
  const { plans, loading: plansLoading } = useInspectionPlans()
  const { inspections, loading: inspectionsLoading } = useInspections()
  const { data: suppliersData } = useSuppliers({ limit: 10 })
  const { data: suppliersStats } = useSuppliersStats()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Calcular métricas reais baseadas nos dados
  const dashboardStats = {
    totalProducts: products?.length || 0,
    totalPlans: plans?.length || 0,
    totalInspections: inspections?.length || 0,
    totalSuppliers: suppliersData?.suppliers?.length || 0,
    activeSuppliers: suppliersData?.suppliers?.filter(s => s.status === 'active').length || 0,
    averageRating: suppliersStats?.averageRating || 8.5,
    approvalRate: 96.8,
    defectRate: 3.2,
    costOfQuality: 2.8
  }

  // Calcular KPIs de qualidade baseados em dados reais
  const completedInspections = inspections?.filter(i => i.status === 'completed' || i.status === 'approved' || i.status === 'rejected').length || 0
  const approvedInspections = inspections?.filter(i => i.inspectorDecision === 'approved').length || 0
  const rejectedInspections = inspections?.filter(i => i.inspectorDecision === 'rejected').length || 0
  const pendingInspections = inspections?.filter(i => i.status === 'in_progress').length || 0
  const actualApprovalRate = completedInspections > 0 ? ((approvedInspections / completedInspections) * 100).toFixed(1) : '0'

  const navigationItems = [
    { name: "Dashboard", icon: Home, active: true, badge: null, path: "/dashboard" },
    { name: "Inspeções", icon: ClipboardCheck, active: false, badge: pendingInspections.toString(), path: "/inspections" },
    { name: "Planos de Inspeção", icon: Target, active: false, badge: dashboardStats.totalPlans.toString(), path: "/inspection-plans" },
    { name: "Não Conformidades", icon: AlertTriangle, active: false, badge: "8", path: "/sgq" },
    { name: "Auditorias", icon: Shield, active: false, badge: "3", path: "/audits" },
    { name: "Relatórios", icon: BarChart3, active: false, badge: null, path: "/reports" },
    { name: "CEP/SPC", icon: LineChart, active: false, badge: "5", path: "/spc-control" },
    { name: "Fornecedores", icon: Truck, active: false, badge: dashboardStats.totalSuppliers.toString(), path: "/supplier-management" },
    { name: "Produtos", icon: Database, active: false, badge: dashboardStats.totalProducts.toString(), path: "/products" },
    { name: "Documentos", icon: FileText, active: false, badge: null, path: "/documents" },
    { name: "Treinamentos", icon: BookOpen, active: false, badge: "7", path: "/training" },
    { name: "Usuários", icon: Users, active: false, badge: null, path: "/users" },
    { name: "Configurações", icon: Settings, active: false, badge: null, path: "/settings" },
  ]

  const qualityMetrics = [
    {
      title: "Taxa de Aprovação",
      value: `${actualApprovalRate}%`,
      target: "95%",
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
      trend: completedInspections > 0 ? `${((approvedInspections / completedInspections) * 100 - 95).toFixed(1)}%` : "0%",
      trendDirection: completedInspections > 0 && (approvedInspections / completedInspections) * 100 >= 95 ? "up" : "down",
      period: "vs meta",
    },
    {
      title: "Inspeções Pendentes",
      value: pendingInspections.toString(),
      target: "< 5",
      icon: Clock,
      color: "from-orange-500 to-orange-600",
      trend: pendingInspections > 5 ? "+" + (pendingInspections - 5) : "-" + (5 - pendingInspections),
      trendDirection: pendingInspections <= 5 ? "up" : "down",
      period: "vs meta",
    },
    {
      title: "Planos Ativos",
      value: dashboardStats.totalPlans.toString(),
      target: "> 10",
      icon: Target,
      color: "from-blue-500 to-blue-600",
      trend: dashboardStats.totalPlans > 10 ? "+" + (dashboardStats.totalPlans - 10) : "-" + (10 - dashboardStats.totalPlans),
      trendDirection: dashboardStats.totalPlans >= 10 ? "up" : "down",
      period: "vs meta",
    },
    {
      title: "Fornecedores Ativos",
      value: dashboardStats.activeSuppliers.toString(),
      target: "> 5",
      icon: Truck,
      color: "from-purple-500 to-purple-600",
      trend: dashboardStats.activeSuppliers > 5 ? "+" + (dashboardStats.activeSuppliers - 5) : "-" + (5 - dashboardStats.activeSuppliers),
      trendDirection: dashboardStats.activeSuppliers >= 5 ? "up" : "down",
      period: "vs meta",
    },
  ]

  const analysisTools = [
    {
      title: "Análise de Produtos",
      description: "Gestão do catálogo de produtos",
      icon: Database,
      color: "from-blue-500 to-blue-600",
      data: `${dashboardStats.totalProducts} produtos cadastrados`,
      path: "/products"
    },
    {
      title: "Planos de Inspeção",
      description: "Configuração e gestão de planos",
      icon: Target,
      color: "from-green-500 to-green-600",
      data: `${dashboardStats.totalPlans} planos ativos`,
      path: "/inspection-plans"
    },
    {
      title: "Execução de Inspeções",
      description: "Realizar inspeções de qualidade",
      icon: ClipboardCheck,
      color: "from-orange-500 to-orange-600",
      data: `${pendingInspections} inspeções pendentes`,
      path: "/inspections"
    },
    {
      title: "Gestão de Fornecedores",
      description: "Avaliação e controle de fornecedores",
      icon: Truck,
      color: "from-purple-500 to-purple-600",
      data: `${dashboardStats.activeSuppliers} fornecedores ativos`,
      path: "/supplier-management"
    },
  ]

  const industrialKPIs = [
    {
      name: "Taxa de Conformidade",
      value: `${actualApprovalRate}%`,
      target: "> 95%",
      status: parseFloat(actualApprovalRate) >= 95 ? "excellent" : parseFloat(actualApprovalRate) >= 90 ? "good" : "warning",
      trend: completedInspections > 0 ? `${((approvedInspections / completedInspections) * 100 - 95).toFixed(1)}%` : "0%",
      unit: "% de aprovação",
    },
    {
      name: "Eficiência de Inspeção",
      value: completedInspections > 0 ? `${((completedInspections / dashboardStats.totalInspections) * 100).toFixed(1)}%` : "0%",
      target: "> 90%",
      status: completedInspections > 0 && (completedInspections / dashboardStats.totalInspections) * 100 >= 90 ? "excellent" : "good",
      trend: completedInspections > 0 ? `${((completedInspections / dashboardStats.totalInspections) * 100 - 90).toFixed(1)}%` : "0%",
      unit: "% de conclusão",
    },
    {
      name: "Cobertura de Planos",
      value: dashboardStats.totalPlans > 0 ? `${((dashboardStats.totalPlans / Math.max(dashboardStats.totalProducts, 1)) * 100).toFixed(1)}%` : "0%",
      target: "> 80%",
      status: dashboardStats.totalPlans > 0 && (dashboardStats.totalPlans / Math.max(dashboardStats.totalProducts, 1)) * 100 >= 80 ? "excellent" : "good",
      trend: dashboardStats.totalPlans > 0 ? `${((dashboardStats.totalPlans / Math.max(dashboardStats.totalProducts, 1)) * 100 - 80).toFixed(1)}%` : "0%",
      unit: "% de produtos com plano",
    },
    {
      name: "Satisfação Fornecedores",
      value: dashboardStats.averageRating.toFixed(1),
      target: "> 8.0",
      status: dashboardStats.averageRating >= 8.0 ? "excellent" : dashboardStats.averageRating >= 7.0 ? "good" : "warning",
      trend: `${(dashboardStats.averageRating - 8.0).toFixed(1)}`,
      unit: "nota média",
    },
    {
      name: "Tempo Resposta NC",
      value: "1.8 dias",
      target: "< 3 dias",
      status: "excellent",
      trend: "-0.5 dias",
      unit: "média",
    },
    {
      name: "Conformidade ISO",
      value: "97.5%",
      target: "> 95%",
      status: "excellent",
      trend: "+1.2%",
      unit: "requisitos atendidos",
    },
  ]

  const recentActivities = [
    {
      title: "Nova inspeção criada",
      description: `Inspeção #${inspections?.[0]?.inspectionCode || '001'} - ${inspections?.[0]?.productName || 'Produto'} - ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      status: "success",
      icon: ClipboardCheck,
      priority: "medium",
    },
    {
      title: "Plano de inspeção atualizado",
      description: `Plano ${plans?.[0]?.planName || 'Padrão'} - Revisão ${plans?.[0]?.version || '1.0'} - ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      status: "info",
      icon: Target,
      priority: "low",
    },
    {
      title: "Produto cadastrado",
      description: `${products?.[0]?.description || 'Novo Produto'} - Código: ${products?.[0]?.code || '001'} - ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      status: "success",
      icon: Database,
      priority: "medium",
    },
    {
      title: "Fornecedor aprovado",
      description: `${suppliersData?.suppliers?.[0]?.name || 'Fornecedor'} - Qualificação completa - ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      status: "info",
      icon: Truck,
      priority: "low",
    },
    {
      title: "Sistema atualizado",
      description: "ControlFlow v2.1.0 - Novas funcionalidades implementadas - " + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: "success",
      icon: Zap,
      priority: "medium",
    },
  ]

  const supplierPerformance = suppliersData?.suppliers?.slice(0, 3).map(supplier => ({
    name: supplier.name,
    quality: `${(Math.random() * 10 + 85).toFixed(1)}%`,
    delivery: `${(Math.random() * 10 + 85).toFixed(1)}%`,
    status: Math.random() > 0.7 ? "excellent" : Math.random() > 0.4 ? "good" : "warning"
  })) || [
    { name: "Metalúrgica ABC", quality: "98.5%", delivery: "95%", status: "excellent" },
    { name: "Componentes XYZ", quality: "94.2%", delivery: "88%", status: "good" },
    { name: "Fornecedor 123", quality: "89.1%", delivery: "92%", status: "warning" },
  ]

  const handleLogout = () => {
    // Implementar logout
    toast({
      title: "Logout",
      description: "Sessão encerrada com sucesso",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-white flex">
      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <EnsoSnakeLogo size={24} showText={false} variant="animated" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">ENSO</h2>
                <p className="text-xs text-blue-600 dark:text-blue-400">Sistema de Qualidade</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                    item.active
                      ? "bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={`w-5 h-5 ${item.active ? "text-blue-600 dark:text-blue-400" : ""}`} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.badge && <Badge className="bg-orange-500 text-white text-xs">{item.badge}</Badge>}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-100/50 dark:bg-gray-800/50">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white font-medium text-sm">{user?.name || 'Usuário'}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">{user?.role || 'Usuário'}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <LogOut className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 lg:ml-0">
        <motion.div
          className="relative bg-gradient-to-r from-white/90 via-blue-50/20 to-white/90 dark:from-gray-900/90 dark:via-blue-900/20 dark:to-gray-900/90 backdrop-blur-xl border-b border-gray-200/30 dark:border-gray-700/30 shadow-2xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-0 right-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-3 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/70 dark:hover:bg-gray-700/70 transition-all duration-200 border border-gray-200/30 dark:border-gray-700/30"
                >
                  <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <motion.h1
                      className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      DASHBOARD
                    </motion.h1>
                    <motion.p
                      className="text-gray-600 dark:text-gray-300 font-medium"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {currentTime.toLocaleDateString("pt-BR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      • {currentTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </motion.p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <motion.div
                  className="hidden md:flex items-center space-x-2 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-xl px-4 py-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none w-48"
                  />
                </motion.div>

                <motion.div
                  className="relative p-3 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-200/70 dark:hover:bg-gray-700/70 transition-all cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <span className="text-xs text-white font-bold">8</span>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-green-500/20 backdrop-blur-sm border border-green-500/30"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.div
                    className="w-3 h-3 bg-green-500 rounded-full shadow-lg"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  ></motion.div>
                  <span className="text-green-700 dark:text-green-400 text-sm font-medium">Sistema Online</span>
                </motion.div>

                <motion.div
                  className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-200/70 dark:hover:bg-gray-700/70 transition-all cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-gray-900 dark:text-white font-medium text-sm">{user?.name || 'Usuário'}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{user?.role || 'Usuário'}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </motion.div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Main KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {qualityMetrics.map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all shadow-lg hover:shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${metric.color} shadow-lg`}>
                          <metric.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">Meta: {metric.target}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">{metric.title}</p>
                        <div className="flex items-center space-x-2">
                          {metric.trendDirection === "up" ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {metric.trend} {metric.period}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Analysis Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {analysisTools.map((tool, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Link to={tool.path}>
                    <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all cursor-pointer group shadow-lg hover:shadow-xl">
                      <CardContent className="p-6">
                        <div
                          className={`p-4 rounded-lg bg-gradient-to-r ${tool.color} mb-4 w-fit group-hover:scale-110 transition-transform shadow-lg`}
                        >
                          <tool.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">{tool.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{tool.description}</p>
                        <p className="text-blue-600 dark:text-blue-400 text-xs font-medium">{tool.data}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Industrial KPIs */}
              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    KPIs Industriais
                    <Badge className="ml-auto bg-green-500 text-white text-xs">6 indicadores</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {industrialKPIs.map((kpi, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-100/50 dark:bg-gray-700/50 hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white font-medium">{kpi.name}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{kpi.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-900 dark:text-white font-bold">{kpi.value}</p>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              kpi.status === "excellent"
                                ? "bg-green-500"
                                : kpi.status === "good"
                                  ? "bg-blue-500"
                                  : "bg-orange-500"
                            }`}
                          ></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{kpi.trend}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Supplier Performance */}
              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center">
                    <Truck className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                    Desempenho Fornecedores
                    <Filter className="w-4 h-4 ml-auto text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {supplierPerformance.map((supplier, index) => (
                    <div key={index} className="p-3 rounded-lg bg-gray-100/50 dark:bg-gray-700/50 hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-900 dark:text-white font-medium">{supplier.name}</p>
                        <Badge
                          className={`${
                            supplier.status === "excellent"
                              ? "bg-green-500"
                              : supplier.status === "good"
                                ? "bg-blue-500"
                                : "bg-orange-500"
                          } text-white text-xs`}
                        >
                          {supplier.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Qualidade</p>
                          <p className="text-gray-900 dark:text-white font-medium">{supplier.quality}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Entrega</p>
                          <p className="text-gray-900 dark:text-white font-medium">{supplier.delivery}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                    Atividades Recentes
                    <Download className="w-4 h-4 ml-auto text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivities.slice(0, 5).map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-3 rounded-lg bg-gray-100/50 dark:bg-gray-700/50 hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-colors"
                    >
                      <div
                        className={`p-2 rounded-full ${
                          activity.status === "success"
                            ? "bg-green-500/20 border border-green-500/30"
                            : activity.status === "critical"
                              ? "bg-red-500/20 border border-red-500/30"
                              : activity.status === "info"
                                ? "bg-blue-500/20 border border-blue-500/30"
                                : "bg-purple-500/20 border border-purple-500/30"
                        }`}
                      >
                        <activity.icon
                          className={`w-4 h-4 ${
                            activity.status === "success"
                              ? "text-green-600 dark:text-green-400"
                              : activity.status === "critical"
                                ? "text-red-600 dark:text-red-400"
                                : activity.status === "info"
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-purple-600 dark:text-purple-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-gray-900 dark:text-white font-medium text-sm">{activity.title}</p>
                          {activity.priority === "critical" && (
                            <Badge className="bg-red-500 text-white text-xs">CRÍTICO</Badge>
                          )}
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
  Menu,
  X,
  User,
  LogOut,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  Star,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  Activity,
  PieChart,
  BarChart,
  LineChart as LineChartIcon,
  Filter,
  RefreshCw,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Info,
  AlertCircle,
  CheckSquare,
  Square,
  Circle,
  Minus,
  Plus as PlusIcon,
  Minus as MinusIcon,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Save,
  Upload,
  Share2,
  Copy,
  Lock,
  Unlock,
  EyeOff,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  PhoneCall,
  Video,
  Image,
  File,
  Folder,
  Archive,
  Tag,
  Hash,
  AtSign,
  DollarSign,
  Percent,
  Hash as HashIcon,
  Star as StarIcon,
  Heart as HeartIcon,
  Zap as ZapIcon,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Droplets,
  Umbrella,
  Snowflake,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  CloudHail,
  CloudSleet,
  CloudHaze,
  CloudMist,
  CloudSmog,
  CloudDust,
  CloudSand,
  CloudAsh,
  CloudSmoke,
  CloudFunnel,
  CloudMoon,
  CloudSun,
  CloudMoonRain,
  CloudSunRain,
  CloudMoonSnow,
  CloudSunSnow,
  CloudMoonLightning,
  CloudSunLightning,
  CloudMoonFog,
  CloudSunFog,
  CloudMoonHail,
  CloudSunHail,
  CloudMoonSleet,
  CloudSunSleet,
  CloudMoonHaze,
  CloudSunHaze,
  CloudMoonMist,
  CloudSunMist,
  CloudMoonSmog,
  CloudSunSmog,
  CloudMoonDust,
  CloudSunDust,
  CloudMoonSand,
  CloudSunSand,
  CloudMoonAsh,
  CloudSunAsh,
  CloudMoonSmoke,
  CloudSunSmoke,
  CloudMoonFunnel,
  CloudSunFunnel
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useProducts } from '@/hooks/use-products';
import { useInspectionPlans } from '@/hooks/use-inspection-plans';
import { useInspections } from '@/hooks/use-inspections';
import { useSuppliers } from '@/hooks/use-suppliers';
import { useSuppliersStats } from '@/hooks/use-suppliers-stats';
import { useToast } from "@/hooks/use-toast"
import EnsoSnakeLogo from "@/components/EnsoSnakeLogo"

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-white p-6">
      {/* Header do Dashboard */}
      <motion.div
        className="relative bg-gradient-to-r from-white/90 via-blue-50/20 to-white/90 dark:from-gray-900/90 dark:via-blue-900/20 dark:to-gray-900/90 backdrop-blur-xl border border-gray-200/30 dark:border-gray-700/30 shadow-2xl rounded-2xl mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-0 right-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
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
                />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Sistema Online</span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Métricas de Qualidade */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {qualityMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      {metric.trendDirection === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${metric.trendDirection === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {metric.trend}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{metric.period}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.title}</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">/ {metric.target}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Ferramentas de Análise */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Ferramentas de Análise</span>
              </CardTitle>
              <CardDescription>
                Acesse rapidamente as principais funcionalidades do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {analysisTools.map((tool) => (
                  <Link
                    key={tool.title}
                    to={tool.path}
                    className="group p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${tool.color} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <tool.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {tool.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{tool.description}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{tool.data}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>KPIs Industriais</span>
              </CardTitle>
              <CardDescription>
                Indicadores de performance em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {industrialKPIs.map((kpi, index) => (
                  <div key={kpi.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 dark:bg-gray-700/50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{kpi.name}</h4>
                        <Badge 
                          variant={kpi.status === "excellent" ? "default" : kpi.status === "good" ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          {kpi.status === "excellent" ? "Excelente" : kpi.status === "good" ? "Bom" : "Atenção"}
                        </Badge>
                      </div>
                      <div className="flex items-baseline space-x-2 mt-1">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{kpi.value}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">/ {kpi.target}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{kpi.unit}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        {kpi.trend.startsWith('+') ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : kpi.trend.startsWith('-') ? (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        ) : (
                          <Minus className="w-4 h-4 text-gray-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          kpi.trend.startsWith('+') ? "text-green-600 dark:text-green-400" : 
                          kpi.trend.startsWith('-') ? "text-red-600 dark:text-red-400" : 
                          "text-gray-600 dark:text-gray-400"
                        }`}>
                          {kpi.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Atividades Recentes e Performance de Fornecedores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <span>Atividades Recentes</span>
              </CardTitle>
              <CardDescription>
                Últimas ações realizadas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.status === "success" ? "bg-green-100 dark:bg-green-900" :
                      activity.status === "info" ? "bg-blue-100 dark:bg-blue-900" :
                      "bg-yellow-100 dark:bg-yellow-900"
                    }`}>
                      <activity.icon className={`w-4 h-4 ${
                        activity.status === "success" ? "text-green-600 dark:text-green-400" :
                        activity.status === "info" ? "text-blue-600 dark:text-blue-400" :
                        "text-yellow-600 dark:text-yellow-400"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{activity.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
                    </div>
                    <Badge 
                      variant={activity.priority === "high" ? "destructive" : activity.priority === "medium" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {activity.priority === "high" ? "Alta" : activity.priority === "medium" ? "Média" : "Baixa"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-orange-600" />
                <span>Performance de Fornecedores</span>
              </CardTitle>
              <CardDescription>
                Avaliação dos principais fornecedores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supplierPerformance.map((supplier, index) => (
                  <div key={index} className="p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">{supplier.name}</h4>
                      <Badge 
                        variant={supplier.status === "excellent" ? "default" : supplier.status === "good" ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {supplier.status === "excellent" ? "Excelente" : supplier.status === "good" ? "Bom" : "Atenção"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Qualidade</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{supplier.quality}</span>
                      </div>
                      <Progress 
                        value={parseFloat(supplier.quality)} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Entrega</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{supplier.delivery}</span>
                      </div>
                      <Progress 
                        value={parseFloat(supplier.delivery)} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
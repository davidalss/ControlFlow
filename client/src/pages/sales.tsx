import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  ArrowRight, 
  Play, 
  Shield, 
  Zap, 
  TrendingUp, 
  Users, 
  Award,
  Star,
  Globe,
  Smartphone,
  Monitor,
  Server,
  Database,
  Target,
  BookOpen,
  BarChart3,
  Settings,
  FileText,
  Camera,
  Search,
  Building,
  Factory,
  Truck,
  Package,
  Cpu,
  Brain,
  Lock,
  Eye,
  BarChart,
  PieChart,
  LineChart,
  Activity,
  Clock,
  Calendar,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  Sparkles,
  Rocket,
  Target as TargetIcon,
  Layers,
  Code,
  Cloud,
  Wifi,
  Shield as ShieldIcon,
  Zap as ZapIcon,
  Star as StarIcon,
  Heart,
  ThumbsUp,
  MessageCircle,
  ArrowUpRight,
  Check,
  X,
  Minus
} from 'lucide-react';
import ParticleEffect from '@/components/ParticleEffect';
import FeaturesModal from '@/components/FeaturesModal';
import DemoRequestModal from '@/components/DemoRequestModal';
import AnimatedLogo from '@/components/AnimatedLogo';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import '@/styles/sales-page.css';

// Paleta de cores tecnológica moderna
const techColors = {
  primary: '#0D0D0D',
  secondary: '#1A1A1A',
  accent: '#00D4FF', // Azul elétrico
  accent2: '#8B5CF6', // Roxo neon
  accent3: '#F59E0B', // Laranja suave
  accent4: '#10B981', // Verde ciano
  accent5: '#EF4444', // Vermelho neon
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A'
};

export default function SalesPage() {
  const [currentWord, setCurrentWord] = useState(0);
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const { scrollY } = useScroll();
  const { isDark } = useTheme();
  
  // Refs para seções
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const dashboardRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  const animatedWords = ['Qualidade', 'Inovação', 'Controle', 'Tecnologia', 'Futuro'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % animatedWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Parallax effects
  const heroY = useTransform(scrollY, [0, 1000], [0, -200]);
  const featuresY = useTransform(scrollY, [0, 1000], [0, -100]);
  const dashboardY = useTransform(scrollY, [0, 1000], [0, -150]);

  const modules = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Treinamentos",
      description: "Plataforma completa de EAD com certificados, testes e histórico de treinamentos",
      color: techColors.accent,
      features: ["Certificados digitais", "Testes automatizados", "Histórico completo", "Relatórios de progresso"]
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Inspeções",
      description: "Sistema de inspeção com wizard intuitivo, fotos obrigatórias e validações",
      color: techColors.accent4,
      features: ["Wizard intuitivo", "Fotos obrigatórias", "Validações em tempo real", "Relatórios detalhados"]
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Inteligência Artificial",
      description: "IA aplicada para análise preditiva, detecção de anomalias e otimização",
      color: techColors.accent2,
      features: ["Análise preditiva", "Detecção de anomalias", "Otimização automática", "Insights inteligentes"]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Garantia de Qualidade",
      description: "Controle rigoroso de processos e conformidade com normas internacionais",
      color: techColors.accent5,
      features: ["Controle de processos", "Conformidade ISO", "Auditoria automática", "Gestão de não conformidades"]
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Engenharia da Qualidade",
      description: "Ferramentas avançadas para engenheiros de qualidade e técnicos",
      color: techColors.accent3,
      features: ["Análise estatística", "Controle SPC", "Capabilidade de processos", "FMEA"]
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "SGQ & SGI",
      description: "Sistemas de Gestão da Qualidade e Integrado com certificação",
      color: techColors.accent,
      features: ["Gestão documental", "Controle de mudanças", "Auditorias internas", "Certificação ISO"]
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Gestão de Processos",
      description: "Mapeamento, otimização e controle de processos industriais",
      color: techColors.accent4,
      features: ["Mapeamento de processos", "Otimização contínua", "Indicadores KPI", "Melhoria contínua"]
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Integração ERP",
      description: "Integração completa com SAP, TOTVS e outros sistemas ERP",
      color: techColors.accent2,
      features: ["API REST", "Sincronização automática", "Dados em tempo real", "Backup automático"]
    }
  ];

  const benefits = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Redução de 60% no tempo de inspeção",
      description: "Processos otimizados com wizard intuitivo e automação"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Aumento de 40% na produtividade",
      description: "Ferramentas avançadas que aceleram decisões estratégicas"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "100% de conformidade com normas",
      description: "Controle rigoroso com ISO, IATF, Inmetro e outras certificações"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Integração total com sistemas existentes",
      description: "Compatibilidade com SAP, TOTVS e APIs personalizadas"
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Gerente de Qualidade",
      company: "Indústria ABC",
      content: "O ControlFlow revolucionou nossa gestão da qualidade. Reduzimos 70% do tempo de inspeção e aumentamos significativamente nossa conformidade.",
      rating: 5,
      avatar: "MS"
    },
    {
      name: "João Santos",
      role: "Diretor Industrial",
      company: "Manufacturing XYZ",
      content: "A integração com nosso SAP foi perfeita. Agora temos controle total da qualidade em tempo real, algo que nunca tivemos antes.",
      rating: 5,
      avatar: "JS"
    },
    {
      name: "Ana Costa",
      role: "Coordenadora de Qualidade",
      company: "Tech Solutions",
      content: "A plataforma de treinamentos é excepcional. Nossos colaboradores adoram a facilidade de uso e os certificados digitais.",
      rating: 5,
      avatar: "AC"
    }
  ];

  const companies = [
    "Indústria ABC", "Manufacturing XYZ", "Tech Solutions", "Quality Corp", 
    "Industrial Plus", "Smart Factory", "Precision Tech", "Global Quality"
  ];

  // Componente de partículas tecnológicas
  const TechParticles = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5
          }}
        />
      ))}
    </div>
  );

  // Componente de gradiente animado
  const AnimatedGradient = () => (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-orange-500/20"
        animate={{
          background: [
            "linear-gradient(45deg, rgba(0, 212, 255, 0.2), rgba(139, 92, 246, 0.2), rgba(245, 158, 11, 0.2))",
            "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(245, 158, 11, 0.2), rgba(0, 212, 255, 0.2))",
            "linear-gradient(225deg, rgba(245, 158, 11, 0.2), rgba(0, 212, 255, 0.2), rgba(139, 92, 246, 0.2))",
            "linear-gradient(315deg, rgba(0, 212, 255, 0.2), rgba(139, 92, 246, 0.2), rgba(245, 158, 11, 0.2))"
          ]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden" style={{ scrollBehavior: 'smooth' }}>
      <TechParticles />
      
      {/* Header Fixo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <AnimatedLogo size="md" showText={true} />
            </motion.div>

            <nav className="hidden md:flex items-center space-x-8">
              {['Módulos', 'Benefícios', 'Dashboard', 'Cases', 'Preços'].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-300 hover:text-white transition-colors relative group"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-full"></span>
                </motion.a>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <ThemeToggle size="sm" className="bg-white/10 border-white/20" />
              <Link to="/login">
                <Button variant="outline" className="border-white/20 text-white hover:border-white/40">
                  Entrar
                </Button>
              </Link>
              <Button 
                onClick={() => setIsDemoModalOpen(true)}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black font-semibold"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Começar Agora
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Page */}
      <section ref={heroRef} className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <AnimatedGradient />
        
        <motion.div
          style={{ y: heroY }}
          className="relative z-10 text-center px-4 sm:px-6 lg:px-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentWord}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 text-cyan-400 mb-6"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {animatedWords[currentWord]}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
          >
            <span className="text-white">Plataforma Completa para</span>
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Gestão da Qualidade
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Aplicativo web e mobile para gestão total da qualidade compatível com normas 
            <span className="font-semibold text-cyan-400"> ISO, IATF, Inmetro</span> e muito mais.
            Mais completo que os módulos de qualidade do SAP/TOTVS.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black font-semibold text-lg px-10 py-6 rounded-xl shadow-2xl shadow-cyan-400/25"
                onClick={() => setIsDemoModalOpen(true)}
              >
                <Rocket className="w-6 h-6 mr-3" />
                Começar Agora
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-10 py-6 rounded-xl border-2 border-white/20 text-white hover:border-white/40 hover:bg-white/5"
                onClick={() => setIsFeaturesModalOpen(true)}
              >
                <Globe className="w-6 h-6 mr-3" />
                Ver Funcionalidades
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats Animados */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto"
          >
            {[
              { value: "500+", label: "Empresas Atendidas", icon: <Building className="w-8 h-8" /> },
              { value: "99.9%", label: "Uptime Garantido", icon: <Shield className="w-8 h-8" /> },
              { value: "24/7", label: "Suporte Técnico", icon: <Users className="w-8 h-8" /> },
              { value: "ISO", label: "Certificações", icon: <Award className="w-8 h-8" /> }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                className="text-center group"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 text-cyan-400 group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gray-400"
          >
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section - Full Page */}
      <section ref={featuresRef} className="min-h-screen flex items-center justify-center relative bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">Módulos</span>
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Tecnológicos
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Descubra como nossa plataforma revoluciona a gestão da qualidade com tecnologia de ponta
            </p>
          </motion.div>

          <motion.div
            style={{ y: featuresY }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {modules.map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <Card className="bg-gray-900/50 border border-gray-800 hover:border-cyan-400/30 transition-all duration-300 backdrop-blur-sm">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <div 
                        className="p-4 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 text-cyan-400 group-hover:scale-110 transition-transform"
                        style={{ borderColor: module.color + '40' }}
                      >
                        {module.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-white">{module.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-400 mb-4">{module.description}</p>
                    <div className="space-y-2">
                      {module.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center justify-center text-sm text-gray-300">
                          <Check className="w-4 h-4 mr-2 text-green-400" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Dashboard Section - Full Page */}
      <section ref={dashboardRef} className="min-h-screen flex items-center justify-center relative bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">Dashboards</span>
              <span className="block bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Interativos
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Visualize seus dados de qualidade em tempo real com gráficos avançados e análises preditivas
            </p>
          </motion.div>

          <motion.div
            style={{ y: dashboardY }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Mock Dashboard */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Dashboard de Qualidade</h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  </div>
                </div>
                
                {/* Mock Charts */}
                <div className="space-y-6">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-300">Taxa de Conformidade</span>
                      <span className="text-green-400 font-semibold">98.5%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "98.5%" }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-cyan-400 mb-1">1,247</div>
                      <div className="text-sm text-gray-400">Inspeções Hoje</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-1">89%</div>
                      <div className="text-sm text-gray-400">Eficiência</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-gray-300 mb-3">Tendência Semanal</div>
                    <div className="flex items-end space-x-1 h-20">
                      {[65, 72, 68, 85, 78, 92, 89].map((value, index) => (
                        <motion.div
                          key={index}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${value}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="flex-1 bg-gradient-to-t from-cyan-400 to-blue-500 rounded-t"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start space-x-4 group"
                >
                  <div className="flex-shrink-0 p-3 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 text-cyan-400 group-hover:scale-110 transition-transform">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                    <p className="text-gray-400">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section - Full Page */}
      <section ref={testimonialsRef} className="min-h-screen flex items-center justify-center relative bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">O que nossos</span>
              <span className="block bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                clientes dizem
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Empresas que transformaram sua gestão da qualidade com nossa plataforma
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="bg-gray-900/50 border border-gray-800 hover:border-orange-400/30 transition-all duration-300 backdrop-blur-sm h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{testimonial.name}</h4>
                        <p className="text-gray-400 text-sm">{testimonial.role}</p>
                        <p className="text-gray-500 text-sm">{testimonial.company}</p>
                      </div>
                    </div>
                    
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    
                    <p className="text-gray-300 italic">"{testimonial.content}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Companies */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 text-center"
          >
            <p className="text-gray-400 mb-8">Empresas que confiam em nós</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {companies.map((company, index) => (
                <motion.div
                  key={company}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  {company}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Full Page */}
      <section ref={ctaRef} className="min-h-screen flex items-center justify-center relative bg-gradient-to-b from-gray-900 to-black">
        <AnimatedGradient />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">Pronto para</span>
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                transformar sua qualidade?
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Junte-se a centenas de empresas que já revolucionaram sua gestão da qualidade com o ControlFlow
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black font-semibold text-xl px-12 py-8 rounded-2xl shadow-2xl shadow-cyan-400/25"
                onClick={() => setIsDemoModalOpen(true)}
              >
                <Rocket className="w-8 h-8 mr-4" />
                Começar Agora
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                variant="outline" 
                className="text-xl px-12 py-8 rounded-2xl border-2 border-white/20 text-white hover:border-white/40 hover:bg-white/5"
                onClick={() => setIsFeaturesModalOpen(true)}
              >
                <Globe className="w-8 h-8 mr-4" />
                Ver Demonstração
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: <Shield className="w-8 h-8" />, title: "Segurança Garantida", desc: "Dados protegidos com criptografia de ponta" },
              { icon: <Zap className="w-8 h-8" />, title: "Implementação Rápida", desc: "Configure em menos de 24 horas" },
              { icon: <Users className="w-8 h-8" />, title: "Suporte 24/7", desc: "Equipe especializada sempre disponível" }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 text-cyan-400">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Modals */}
      <FeaturesModal 
        isOpen={isFeaturesModalOpen} 
        onClose={() => setIsFeaturesModalOpen(false)} 
      />
      <DemoRequestModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
      />
    </div>
  );
}
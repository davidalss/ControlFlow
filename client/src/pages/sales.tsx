import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
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
  MapPin
} from 'lucide-react';
import ParticleEffect from '@/components/ParticleEffect';
import FeaturesModal from '@/components/FeaturesModal';
import DemoRequestModal from '@/components/DemoRequestModal';
import AnimatedLogo from '@/components/AnimatedLogo';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SalesPage() {
  const [currentWord, setCurrentWord] = useState(0);
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -200]);
  const { isDark } = useTheme();

  const animatedWords = ['Qualidade', 'Inovação', 'Controle'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % animatedWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const modules = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Treinamentos",
      description: "Plataforma completa de EAD com certificados, testes e histórico de treinamentos",
      color: "from-blue-500 to-blue-600",
      features: ["Certificados digitais", "Testes automatizados", "Histórico completo", "Relatórios de progresso"]
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Inspeções",
      description: "Sistema de inspeção com wizard intuitivo, fotos obrigatórias e validações",
      color: "from-green-500 to-green-600",
      features: ["Wizard intuitivo", "Fotos obrigatórias", "Validações em tempo real", "Relatórios detalhados"]
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Inteligência Artificial",
      description: "IA aplicada para análise preditiva, detecção de anomalias e otimização",
      color: "from-purple-500 to-purple-600",
      features: ["Análise preditiva", "Detecção de anomalias", "Otimização automática", "Insights inteligentes"]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Garantia de Qualidade",
      description: "Controle rigoroso de processos e conformidade com normas internacionais",
      color: "from-red-500 to-red-600",
      features: ["Controle de processos", "Conformidade ISO", "Auditoria automática", "Gestão de não conformidades"]
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Engenharia da Qualidade",
      description: "Ferramentas avançadas para engenheiros de qualidade e técnicos",
      color: "from-orange-500 to-orange-600",
      features: ["Análise estatística", "Controle SPC", "Capabilidade de processos", "FMEA"]
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "SGQ & SGI",
      description: "Sistemas de Gestão da Qualidade e Integrado com certificação",
      color: "from-indigo-500 to-indigo-600",
      features: ["Gestão documental", "Controle de mudanças", "Auditorias internas", "Certificação ISO"]
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Gestão de Processos",
      description: "Mapeamento, otimização e controle de processos industriais",
      color: "from-teal-500 to-teal-600",
      features: ["Mapeamento de processos", "Otimização contínua", "Indicadores KPI", "Melhoria contínua"]
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Integração ERP",
      description: "Integração completa com SAP, TOTVS e outros sistemas ERP",
      color: "from-pink-500 to-pink-600",
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
      content: "O QualiHUB revolucionou nossa gestão da qualidade. Reduzimos 70% do tempo de inspeção e aumentamos significativamente nossa conformidade.",
      rating: 5
    },
    {
      name: "João Santos",
      role: "Diretor Industrial",
      company: "Manufacturing XYZ",
      content: "A integração com nosso SAP foi perfeita. Agora temos controle total da qualidade em tempo real, algo que nunca tivemos antes.",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Coordenadora de Qualidade",
      company: "Tech Solutions",
      content: "A plataforma de treinamentos é excepcional. Nossos colaboradores adoram a facilidade de uso e os certificados digitais.",
      rating: 5
    }
  ];

  const companies = [
    "Indústria ABC", "Manufacturing XYZ", "Tech Solutions", "Quality Corp", 
    "Industrial Plus", "Smart Factory", "Precision Tech", "Global Quality"
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-r ${isDark ? 'from-slate-900 to-slate-800' : 'from-slate-100 to-slate-200'} flex flex-col relative overflow-x-hidden`} style={{ scrollBehavior: 'smooth' }}>
      
      {/* Elegant Subtle Background Animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Floating Orbs */}
        <motion.div
          className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial ${isDark ? 'from-slate-600/2' : 'from-slate-300/3'} via-transparent to-transparent rounded-full blur-3xl`}
          animate={{
            scale: [1, 1.1, 1],
            opacity: isDark ? [0.1, 0.25, 0.1] : [0.05, 0.15, 0.05]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className={`absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-radial ${isDark ? 'from-slate-500/2' : 'from-slate-400/3'} via-transparent to-transparent rounded-full blur-3xl`}
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: isDark ? [0.08, 0.2, 0.08] : [0.03, 0.12, 0.03]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 8
          }}
        />

        {/* Gentle Particle System */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className={`absolute w-0.5 h-0.5 ${isDark ? 'bg-slate-400/10' : 'bg-slate-500/8'} rounded-full`}
            style={{
              left: `${25 + i * 10}%`,
              top: `${15 + (i % 3) * 25}%`
            }}
            animate={{
              y: [0, -25, 0],
              opacity: isDark ? [0, 0.4, 0] : [0, 0.3, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 12 + i * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1
            }}
          />
        ))}

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-3">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`grid-${i}`}
              className={`absolute w-full h-px ${isDark ? 'bg-slate-500' : 'bg-slate-400'}`}
              style={{ top: `${i * 16}%` }}
              animate={{
                opacity: isDark ? [0, 0.2, 0] : [0, 0.15, 0]
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                delay: i * 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Light Mode Specific Animations */}
        {!isDark && (
          <>
            {/* Subtle Light Waves */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-200/5 to-transparent"
              animate={{
                opacity: [0, 0.1, 0],
                scaleY: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Floating Light Dots */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={`light-dot-${i}`}
                className="absolute w-1 h-1 bg-slate-300/20 rounded-full"
                style={{
                  left: `${30 + i * 15}%`,
                  top: `${20 + (i % 2) * 30}%`
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0, 0.4, 0],
                  scale: [0, 1.5, 0]
                }}
                transition={{
                  duration: 8 + i * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 1.5
                }}
              />
            ))}
          </>
        )}

        {/* Parallax Background Elements */}
        <motion.div
          className={`absolute top-1/3 left-1/6 w-64 h-64 ${isDark ? 'bg-blue-500/5' : 'bg-blue-500/10'} rounded-full blur-3xl`}
          style={{ y: useTransform(scrollY, [0, 1000], [0, -100]) }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className={`absolute bottom-1/3 right-1/6 w-80 h-80 ${isDark ? 'bg-purple-500/5' : 'bg-purple-500/10'} rounded-full blur-3xl`}
          style={{ y: useTransform(scrollY, [0, 1000], [0, 100]) }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
            x: [0, -40, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Header */}
      <header className={`relative z-10 ${isDark ? 'bg-slate-800/80' : 'bg-white/80'} backdrop-blur-md border-b ${isDark ? 'border-slate-600/20' : 'border-white/20'} sticky top-0`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <AnimatedLogo size="md" showText={true} />
            </motion.div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#modules" className={`${isDark ? 'text-slate-300 hover:text-slate-100' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>Módulos</a>
              <a href="#benefits" className={`${isDark ? 'text-slate-300 hover:text-slate-100' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>Benefícios</a>
              <a href="#testimonials" className={`${isDark ? 'text-slate-300 hover:text-slate-100' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>Cases</a>
              <a href="#pricing" className={`${isDark ? 'text-slate-300 hover:text-slate-100' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>Preços</a>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <ThemeToggle size="sm" className={`${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'}`} />
              <Link to="/login">
                <Button variant="outline" className={`${isDark ? 'border-slate-600 text-slate-300 hover:border-slate-500' : 'border-gray-300 hover:border-blue-500'}`}>
                  Entrar
                </Button>
              </Link>
              <Button 
                onClick={() => setIsDemoModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Solicitar Demonstração
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          style={{ y: useTransform(scrollY, [0, 500], [0, -30]) }}
          className="relative z-10"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-8"
              >
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={currentWord}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-slate-300' : 'text-blue-600'} mb-4`}
                  >
                    {animatedWords[currentWord]}
                  </motion.h2>
                </AnimatePresence>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`text-5xl md:text-7xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}
              >
                Plataforma Completa para
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Gestão da Qualidade
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className={`text-xl md:text-2xl ${isDark ? 'text-slate-400' : 'text-gray-600'} mb-8 max-w-4xl mx-auto`}
              >
                Aplicativo web e mobile para gestão total da qualidade compatível com normas 
                <span className="font-semibold text-blue-600"> ISO, IATF, Inmetro</span> e muito mais.
                Mais completo que os módulos de qualidade do SAP/TOTVS.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4"
                    onClick={() => setIsDemoModalOpen(true)}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Solicitar Demonstração
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className={`text-lg px-8 py-4 border-2 ${isDark ? 'border-slate-600 text-slate-300 hover:border-slate-500' : 'border-gray-300 hover:border-blue-500'}`}
                    onClick={() => setIsFeaturesModalOpen(true)}
                  >
                    <Globe className="w-5 h-5 mr-2" />
                    Ver Funcionalidades
                  </Button>
                </motion.div>
              </motion.div>

              {/* Animated Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
              >
                {[
                  { value: "500+", label: "Empresas Atendidas" },
                  { value: "99.9%", label: "Uptime Garantido" },
                  { value: "24/7", label: "Suporte Técnico" },
                  { value: "ISO", label: "Certificações" }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>{stat.value}</div>
                    <div className={`${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Advanced Digital Quality Flow */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-purple-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Fluxo Digital de Qualidade</h2>
            <p className="text-xl text-blue-100">Visualize como nossa tecnologia transforma seus processos de qualidade</p>
          </motion.div>

          {/* Advanced Animated Conveyor Belt */}
          <div className="relative h-48 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Conveyor Belt Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-0 w-1 h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent"
                  style={{ left: `${i * 5}%` }}
                  animate={{
                    opacity: [0, 1, 0],
                    scaleY: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>

            {/* Moving Conveyor Lines */}
            <div className="absolute inset-0">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                  style={{ top: `${30 + i * 20}%` }}
                  animate={{
                    x: ["-100%", "100%"]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "linear"
                  }}
                />
              ))}
            </div>

            {/* Quality Check Points */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 transform -translate-y-1/2 w-8 h-8 bg-green-500/20 rounded-full border-2 border-green-400 flex items-center justify-center"
                style={{ left: `${15 + i * 15}%` }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
              >
                <CheckCircle className="w-4 h-4 text-green-400" />
              </motion.div>
            ))}

            {/* Animated Products */}
            {[
              { icon: <BookOpen className="w-6 h-6" />, color: "from-blue-500 to-blue-600", delay: 0 },
              { icon: <Search className="w-6 h-6" />, color: "from-green-500 to-green-600", delay: 1.5 },
              { icon: <Brain className="w-6 h-6" />, color: "from-purple-500 to-purple-600", delay: 3 },
              { icon: <Shield className="w-6 h-6" />, color: "from-red-500 to-red-600", delay: 4.5 },
              { icon: <Target className="w-6 h-6" />, color: "from-orange-500 to-orange-600", delay: 6 }
            ].map((product, index) => (
              <motion.div
                key={index}
                className="absolute top-1/2 transform -translate-y-1/2 w-16 h-16 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-lg cursor-pointer group"
                style={{ 
                  background: `linear-gradient(135deg, ${product.color.split(' ')[1].replace('to-', '')} 0%, ${product.color.split(' ')[2]} 100%)`
                }}
                initial={{ x: -100, y: 0 }}
                animate={{
                  x: ["-100px", "calc(100vw - 100px)", "calc(100vw + 50px)"],
                  y: [0, 0, -20, -10, 0]
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  delay: product.delay,
                  ease: "easeInOut",
                  times: [0, 0.8, 0.85, 0.9, 0.95]
                }}
                whileHover={{
                  scale: 1.1,
                  rotateY: 180,
                  transition: { duration: 0.3 }
                }}
              >
                {/* Product Shadow */}
                <motion.div
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-black/20 rounded-full blur-sm"
                  animate={{
                    scaleX: [1, 0.8, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    delay: product.delay,
                    ease: "easeInOut"
                  }}
                />

                {/* Product Content */}
                <div className="relative z-10 text-white">
                  {product.icon}
                </div>

                {/* Bounce Particles */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    delay: product.delay + 9.6, // When product bounces
                    ease: "easeInOut"
                  }}
                >
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                      style={{
                        left: "50%",
                        top: "50%"
                      }}
                      animate={{
                        x: [0, (i - 3) * 20],
                        y: [0, -30 - i * 5],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: product.delay + 9.6 + i * 0.1,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </motion.div>

                                 {/* Glow Effect on Hover */}
                 <motion.div
                   className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100"
                   animate={{
                     x: ["-100%", "100%"]
                   }}
                   transition={{
                     duration: 1,
                     repeat: Infinity,
                     ease: "linear"
                   }}
                 />

                 {/* Quality Check Glow */}
                 <motion.div
                   className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-xl opacity-0"
                   animate={{
                     opacity: [0, 0.8, 0],
                     scale: [1, 1.1, 1]
                   }}
                   transition={{
                     duration: 12,
                     repeat: Infinity,
                     delay: product.delay + 6, // When passing check points
                     ease: "easeInOut"
                   }}
                 />
              </motion.div>
            ))}

            {/* Enhanced Particle Effects */}
            <ParticleEffect count={25} color="bg-blue-400" size={1} duration={4} />
            <ParticleEffect count={15} color="bg-green-400" size={2} duration={3} />
            <ParticleEffect count={10} color="bg-purple-400" size={3} duration={5} />

            {/* Data Flow Lines */}
            <div className="absolute inset-0">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-0.5 h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent"
                  style={{ left: `${20 + i * 15}%` }}
                  animate={{
                    scaleY: [0, 1, 0],
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.8,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>

            {/* Quality Score Indicators */}
            <div className="absolute top-4 right-4 flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-green-400 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>

            {/* Quality Progress Bar */}
            <div className="absolute top-4 left-4 right-20 h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>

            {/* Quality Percentage */}
            <motion.div
              className="absolute top-6 left-4 text-xs font-semibold text-green-400"
              animate={{
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              99.9% Qualidade
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mt-8"
          >
            <p className="text-blue-100 text-lg">
              Cada produto representa um módulo do sistema que passa por validação digital e é aprovado automaticamente
            </p>
            <p className="text-blue-200 text-sm mt-2">
              Passe o mouse sobre os produtos para ver as interações
            </p>
          </motion.div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-20 relative">
        <motion.div
          style={{ y: useTransform(scrollY, [500, 1500], [0, -20]) }}
          className="relative z-10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                Módulos Completos
              </h2>
              <p className={`text-xl ${isDark ? 'text-slate-400' : 'text-gray-600'} max-w-3xl mx-auto`}>
                Solução mais completa que os módulos de qualidade do SAP/TOTVS, 
                com integração total e personalizações avançadas
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {modules.map((module, index) => (
                <motion.div
                  key={module.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className={`h-full hover:shadow-xl transition-all duration-300 border-0 ${isDark ? 'bg-slate-800/80' : 'bg-white/80'} backdrop-blur-sm group`}>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-16 h-16 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {module.icon}
                        </div>
                        <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-0">
                          Premium
                        </Badge>
                      </div>
                      <CardTitle className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {module.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'} leading-relaxed mb-4`}>
                        {module.description}
                      </p>
                      <ul className="space-y-2">
                        {module.features.map((feature, idx) => (
                          <li key={idx} className={`flex items-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className={`py-20 ${isDark ? 'bg-slate-800/50' : 'bg-white/50'} backdrop-blur-sm relative`}>
        <motion.div
          style={{ y: useTransform(scrollY, [1000, 2000], [0, -15]) }}
          className="relative z-10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                Resultados Comprovados
              </h2>
              <p className={`text-xl ${isDark ? 'text-slate-400' : 'text-gray-600'} max-w-3xl mx-auto`}>
                Benefícios reais que transformam sua gestão da qualidade
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`flex items-start space-x-4 p-6 ${isDark ? 'bg-slate-800/60' : 'bg-white/60'} backdrop-blur-sm rounded-2xl border ${isDark ? 'border-slate-600/20' : 'border-white/20'} hover:shadow-lg transition-all duration-300`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                      {benefit.title}
                    </h3>
                    <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'} leading-relaxed`}>
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              Cases de Sucesso
            </h2>
            <p className={`text-xl ${isDark ? 'text-slate-400' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Empresas que confiam no QualiHUB para transformar sua gestão da qualidade
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`h-full ${isDark ? 'bg-slate-800/80' : 'bg-white/80'} backdrop-blur-sm border-0 shadow-lg`}>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'} mb-4 italic`}>
                      "{testimonial.content}"
                    </p>
                    <div>
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{testimonial.name}</p>
                      <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>{testimonial.role}</p>
                      <p className="text-sm text-blue-600">{testimonial.company}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Companies Logos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center"
          >
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-8`}>
              Empresas que confiam em nós
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {companies.map((company, index) => (
                <motion.div
                  key={company}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className={`${isDark ? 'bg-slate-800/60' : 'bg-white/60'} backdrop-blur-sm rounded-xl p-6 border ${isDark ? 'border-slate-600/20' : 'border-white/20'} hover:${isDark ? 'bg-slate-800/80' : 'bg-white/80'} transition-all duration-300`}
                >
                  <div className="text-center">
                    <Building className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{company}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Planos Acessíveis
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Preços competitivos para empresas de todos os tamanhos
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-6xl font-bold mb-4">
                R$ 25
                <span className="text-2xl text-blue-100">/mês</span>
              </div>
              <p className="text-xl text-blue-100 mb-6">por usuário</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Implementação gratuita</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Suporte técnico 24/7</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Integração com SAP/TOTVS</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Certificações ISO incluídas</span>
                </div>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-8">
                <p className="text-yellow-200 font-semibold">
                  🎉 Oferta especial de implementação por tempo limitado!
                </p>
              </div>

              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Solicitar Demonstração
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="demo" className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>
              Entre para a nova era da qualidade
            </h2>
            <p className={`text-xl ${isDark ? 'text-slate-400' : 'text-gray-600'} mb-8`}>
              Transforme sua gestão da qualidade com a plataforma mais completa do mercado. 
              Compatível com todas as normas internacionais e integração total com seus sistemas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4"
                onClick={() => setIsDemoModalOpen(true)}
              >
                Solicitar Demonstração
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Link to="/login">
                <Button size="lg" variant="outline" className={`text-lg px-8 py-4 border-2 ${isDark ? 'border-slate-600 text-slate-300 hover:border-slate-500' : 'border-gray-300 hover:border-blue-500'}`}>
                  Começar Agora
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${isDark ? 'bg-slate-900' : 'bg-gray-900'} text-white py-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">Q</span>
                </div>
                <span className="text-xl font-bold">QualiHUB</span>
              </div>
              <p className={`${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
                Plataforma completa para gestão da qualidade, 
                inspeções e controle de processos.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className={`space-y-2 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
                <li><a href="#modules" className="hover:text-white transition-colors">Módulos</a></li>
                <li><a href="#benefits" className="hover:text-white transition-colors">Benefícios</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Cases</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className={`space-y-2 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
                <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contato</h3>
              <ul className={`space-y-2 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>contato@qualihub.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>(41) 9999-9999</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Curitiba, PR</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className={`border-t ${isDark ? 'border-slate-800' : 'border-gray-800'} mt-8 pt-8 text-center ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
            <p>&copy; 2025 QualiHUB. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Modais */}
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
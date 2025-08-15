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
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const dashboardRef = useRef<HTMLElement>(null);
  const testimonialsRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Hook para verificar se a seção está visível
  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.3 });
  const dashboardInView = useInView(dashboardRef, { once: true, amount: 0.3 });
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.3 });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.3 });
  
  const animatedWords = ['Qualidade', 'Inovação', 'Controle', 'Tecnologia', 'Futuro'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % animatedWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Parallax effects - movimento muito mais suave e visível
  const heroY = useTransform(scrollY, [0, 1000], [0, -200]);
  const featuresY = useTransform(scrollY, [0, 1000], [0, -150]);
  const dashboardY = useTransform(scrollY, [0, 1000], [0, -180]);
  const testimonialsY = useTransform(scrollY, [0, 1000], [0, -120]);
  const ctaY = useTransform(scrollY, [0, 1000], [0, -160]);

  // Detectar seção ativa
  useEffect(() => {
    const handleScroll = () => {
      const sections = [heroRef, featuresRef, dashboardRef, testimonialsRef, ctaRef];
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i].current;
        if (section) {
          const offsetTop = section.offsetTop;
          const offsetBottom = offsetTop + section.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(i);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Função para rolar até uma seção específica com scroll suave
  const scrollToSection = (index: number) => {
    const sections = [heroRef, featuresRef, dashboardRef, testimonialsRef, ctaRef];
    const section = sections[index].current;
    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Função para loop infinito - voltar ao início quando chegar ao final
  useEffect(() => {
    let isScrolling = false;
    
    const handleScroll = () => {
      if (isScrolling) return;
      
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Se chegou ao final da página, voltar ao início suavemente
      if (scrollPosition + windowHeight >= documentHeight - 50) {
        isScrolling = true;
        
        // Adicionar efeito visual de transição
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, rgba(0, 212, 255, 0.1), rgba(139, 92, 246, 0.1));
          z-index: 9999;
          opacity: 0;
          transition: opacity 0.5s ease-in-out;
          pointer-events: none;
        `;
        document.body.appendChild(overlay);
        
        // Fade in
        setTimeout(() => {
          overlay.style.opacity = '1';
        }, 10);
        
        // Scroll suave para o topo
        setTimeout(() => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
          
          // Fade out e remover overlay
          setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
              document.body.removeChild(overlay);
              isScrolling = false;
            }, 500);
          }, 1000);
        }, 500);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
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
    <div className="absolute inset-0 overflow-hidden z-0">
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

  // Componente de indicador de seção
  const SectionIndicator = () => (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 flex flex-col space-y-3">
      {['Início', 'Módulos', 'Dashboard', 'Depoimentos', 'Começar'].map((label, index) => (
        <button
          key={index}
          onClick={() => scrollToSection(index)}
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
            activeSection === index 
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black' 
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
          aria-label={`Ir para seção ${label}`}
        >
          <span className="text-xs font-medium">{index + 1}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className="sales-page-container relative"
    >
      <TechParticles />
      <SectionIndicator />
      
      {/* Header Fixo */}
      <header className="sales-header fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md">
        <div className="header-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <AnimatedLogo size="md" showText={true} />
            </motion.div>
            <nav className="header-nav hidden md:flex space-x-8">
              {['Módulos', 'Benefícios', 'Dashboard', 'Cases', 'Preços'].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-300 hover:text-white transition-colors relative group text-sm font-medium"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-full"></span>
                </motion.a>
              ))}
            </nav>
            <div className="header-actions flex items-center space-x-4">
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
      <section 
        ref={heroRef} 
        className="hero-section min-h-screen flex items-center justify-center relative pt-16 snap-start"
      >
        <AnimatedGradient />
        
        <motion.div
          style={{ y: heroY }}
          className="hero-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 2, ease: "easeOut" }}
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
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 2.5, ease: "easeOut", delay: 0.3 }}
            className="hero-title text-4xl md:text-6xl font-bold mb-6"
          >
            <span className="text-white">Plataforma Completa para</span>
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Gestão da Qualidade
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 2.5, ease: "easeOut", delay: 0.6 }}
            className="hero-subtitle text-xl text-gray-300 max-w-3xl mx-auto mb-10"
          >
            Aplicativo web e mobile para gestão total da qualidade compatível com normas 
            <span className="font-semibold text-cyan-400"> ISO, IATF, Inmetro</span> e muito mais.
            Mais completo que os módulos de qualidade do SAP/TOTVS.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 2.5, ease: "easeOut", delay: 0.9 }}
            className="hero-buttons flex flex-col sm:flex-row justify-center gap-4 mb-16"
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
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 2.5, ease: "easeOut", delay: 1.2 }}
            className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
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
                animate={heroInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                className="stat-item bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10"
              >
                <div className="stat-icon flex justify-center mb-3">
                  <div className="p-3 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 text-cyan-400">
                    {stat.icon}
                  </div>
                </div>
                <div className="stat-value text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="stat-label text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={heroInView ? { opacity: 1 } : {}}
          transition={{ delay: 3 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-gray-400 flex flex-col items-center"
          >
            <ChevronDown className="w-8 h-8 mb-2" />
            <span className="text-sm text-gray-500 animate-pulse">Scroll infinito</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section - Full Page */}
      <section 
        ref={featuresRef} 
        className="features-section snap-start"
      >
        <div className="section-container">
          <div className="content-wrapper">
                         <motion.div
               style={{ y: featuresY }}
             >
                               <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="text-center mb-16"
                >
                 <h2 className="section-title text-4xl md:text-5xl font-bold mb-4">
                   <span className="text-white">Módulos</span>
                   <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                     Tecnológicos
                   </span>
                 </h2>
                 <p className="section-subtitle text-xl text-gray-400 max-w-3xl mx-auto">
                   Descubra como nossa plataforma revoluciona a gestão da qualidade com tecnologia de ponta
                 </p>
               </motion.div>
               
               <motion.div
                 className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
               >
                 {modules.map((module, index) => (
                                       <motion.div
                      key={module.title}
                      initial={{ opacity: 0, y: 50 }}
                      animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.2 }}
                      whileHover={{ y: -15, scale: 1.05 }}
                      className="group"
                    >
                     <div className="feature-card bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 h-full flex flex-col">
                       <div className="feature-icon mb-4">
                         <div 
                           className="p-4 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 text-cyan-400 group-hover:scale-110 transition-transform"
                           style={{ borderColor: module.color + '40' }}
                         >
                           {module.icon}
                         </div>
                       </div>
                       <h3 className="feature-title text-xl font-bold text-white mb-2">{module.title}</h3>
                       <p className="feature-description text-gray-400 mb-4 flex-grow">{module.description}</p>
                       <ul className="feature-list space-y-2">
                         {module.features.map((feature, idx) => (
                           <li key={idx} className="flex items-start text-gray-300">
                             <Check className="w-4 h-4 mr-2 text-green-400 mt-1 flex-shrink-0" />
                             <span className="text-sm">{feature}</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                   </motion.div>
                 ))}
               </motion.div>
             </motion.div>
           </div>
         </div>
       </section>

      {/* Dashboard Section - Full Page */}
      <section 
        ref={dashboardRef} 
        className="dashboard-section min-h-screen py-20 relative snap-start"
      >
        <div className="section-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            style={{ y: dashboardY }}
            className="content-wrapper"
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={dashboardInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="section-title text-4xl md:text-5xl font-bold mb-4">
                <span className="text-white">Dashboards</span>
                <span className="block bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  Interativos
                </span>
              </h2>
              <p className="section-subtitle text-xl text-gray-400 max-w-3xl mx-auto">
                Visualize seus dados de qualidade em tempo real com gráficos avançados e análises preditivas
              </p>
            </motion.div>
            
            <motion.div
              className="dashboard-content grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              {/* Mock Dashboard */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={dashboardInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8 }}
                className="relative z-10"
              >
                <div className="dashboard-mock bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 p-6 shadow-2xl">
                  <div className="dashboard-header flex justify-between items-center mb-6">
                    <h3 className="dashboard-title text-xl font-bold text-white">Dashboard de Qualidade</h3>
                    <div className="dashboard-controls flex space-x-2">
                      <div className="dashboard-control w-3 h-3 rounded-full bg-green-400"></div>
                      <div className="dashboard-control w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="dashboard-control w-3 h-3 rounded-full bg-red-400"></div>
                    </div>
                  </div>
                  
                  {/* Mock Charts */}
                  <div className="space-y-6">
                    <div className="dashboard-chart">
                      <div className="chart-header flex justify-between items-center mb-2">
                        <span className="chart-label text-gray-400">Taxa de Conformidade</span>
                        <span className="chart-value text-white font-bold">98.5%</span>
                      </div>
                      <div className="chart-bar h-3 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={dashboardInView ? { width: "98.5%" } : {}}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="chart-progress h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                        />
                      </div>
                    </div>
                    
                    <div className="dashboard-stats grid grid-cols-2 gap-4">
                      <div className="stat-card bg-black/30 p-4 rounded-xl border border-white/5">
                        <div className="stat-value cyan text-2xl font-bold text-cyan-400">1,247</div>
                        <div className="stat-label text-gray-400 text-sm">Inspeções Hoje</div>
                      </div>
                      <div className="stat-card bg-black/30 p-4 rounded-xl border border-white/5">
                        <div className="stat-value purple text-2xl font-bold text-purple-400">89%</div>
                        <div className="stat-label text-gray-400 text-sm">Eficiência</div>
                      </div>
                    </div>
                    
                    <div className="dashboard-trend">
                      <div className="trend-label text-gray-400 mb-3">Tendência Semanal</div>
                      <div className="trend-chart flex items-end justify-between h-24">
                        {[65, 72, 68, 85, 78, 92, 89].map((value, index) => (
                          <motion.div
                            key={index}
                            initial={{ height: 0 }}
                            animate={dashboardInView ? { height: `${value}%` } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="trend-bar w-8 bg-gradient-to-t from-cyan-400 to-blue-500 rounded-t-lg"
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
                animate={dashboardInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8 }}
                className="benefits-list space-y-6"
              >
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={dashboardInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="benefit-item flex items-start p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                  >
                    <div className="benefit-icon p-3 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 text-cyan-400 mr-4">
                      {benefit.icon}
                    </div>
                    <div className="benefit-content">
                      <h3 className="text-lg font-bold text-white mb-1">{benefit.title}</h3>
                      <p className="text-gray-400">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section - Full Page */}
      <section 
        ref={testimonialsRef} 
        className="testimonials-section min-h-screen py-20 relative snap-start"
      >
        <div className="section-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            style={{ y: testimonialsY }}
            className="content-wrapper"
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="section-title text-4xl md:text-5xl font-bold mb-4">
                <span className="text-white">O que nossos</span>
                <span className="block bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  clientes dizem
                </span>
              </h2>
              <p className="section-subtitle text-xl text-gray-400 max-w-3xl mx-auto">
                Empresas que transformaram sua gestão da qualidade com nossa plataforma
              </p>
            </motion.div>
            
            <div className="testimonials-grid grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 50 }}
                  animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ y: -10 }}
                  className="group"
                >
                  <div className="testimonial-card bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 h-full flex flex-col">
                    <div className="testimonial-header flex items-center mb-4">
                      <div className="testimonial-avatar w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-black font-bold mr-4">
                        {testimonial.avatar}
                      </div>
                      <div className="testimonial-info">
                        <h4 className="text-white font-bold">{testimonial.name}</h4>
                        <p className="text-gray-400 text-sm">{testimonial.role}</p>
                        <p className="text-cyan-400 text-xs">{testimonial.company}</p>
                      </div>
                    </div>
                    
                    <div className="testimonial-rating flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    
                    <p className="testimonial-content text-gray-300 flex-grow italic">"{testimonial.content}"</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Full Page */}
      <section 
        ref={ctaRef} 
        className="cta-section min-h-screen py-20 relative flex items-center snap-start"
      >
        <div className="section-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            style={{ y: ctaY }}
            className="content-wrapper"
          >
            <div className="cta-content text-center">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={ctaInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
                className="mb-12"
              >
                <h2 className="cta-title text-4xl md:text-5xl font-bold mb-4">
                  <span className="text-white">Pronto para</span>
                  <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    transformar sua qualidade?
                  </span>
                </h2>
                <p className="cta-subtitle text-xl text-gray-400 max-w-3xl mx-auto">
                  Junte-se a centenas de empresas que já revolucionaram sua gestão da qualidade com o ControlFlow
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={ctaInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="cta-buttons flex flex-col sm:flex-row justify-center gap-6 mb-16"
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
                animate={ctaInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="cta-features grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
              >
                {[
                  { icon: <Shield className="w-8 h-8" />, title: "Segurança Garantida", desc: "Dados protegidos com criptografia de ponta" },
                  { icon: <Zap className="w-8 h-8" />, title: "Implementação Rápida", desc: "Configure em menos de 24 horas" },
                  { icon: <Users className="w-8 h-8" />, title: "Suporte 24/7", desc: "Equipe especializada sempre disponível" }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={ctaInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className="cta-feature bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10"
                  >
                    <div className="cta-feature-icon flex justify-center mb-4">
                      <div className="p-4 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 text-cyan-400">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
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
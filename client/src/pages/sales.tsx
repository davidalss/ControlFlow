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
  Minus,
  ChevronRight,
  ChevronLeft,
  ChevronUp
} from 'lucide-react';
import ParticleEffect from '@/components/ParticleEffect';
import FeaturesModal from '@/components/FeaturesModal';
import DemoRequestModal from '@/components/DemoRequestModal';
import AppTutorial from '@/components/AppTutorial';
import EnsoSnakeLogo from '@/components/EnsoSnakeLogo';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/use-auth';
import '@/styles/sales-page.css';

// Paleta de cores stone moderna e profissional
const colors = {
  primary: '#1c1917', // stone-900
  secondary: '#44403c', // stone-700
  accent: '#78716c', // stone-500
  dark: '#0c0a09', // stone-950
  light: '#fafaf9', // stone-50
  success: '#059669', // emerald-600
  warning: '#d97706', // amber-600
  danger: '#dc2626', // red-600
  text: '#1c1917', // stone-900
  textSecondary: '#57534e', // stone-600
  textLight: '#fafaf9' // stone-50
};

export default function SalesPage() {
  const [currentWord, setCurrentWord] = useState(0);
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { scrollY } = useScroll();
  const { isDark } = useTheme();
  const { user } = useAuth();

  // Adicionar classe allow-scroll ao body para permitir scroll e modais
  useEffect(() => {
    document.body.classList.add('allow-scroll');
    return () => {
      document.body.classList.remove('allow-scroll');
    };
  }, []);
  
  // Refs para animações
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const testimonialsRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);
  
  const animatedWords = ['Qualidade', 'Inovação', 'Controle', 'Eficiência'];
  
  // Dados dos depoimentos
  const testimonials = [
    {
      name: "Maria Silva",
      role: "Diretora de Qualidade",
      company: "TechCorp",
      content: "O ENSO revolucionou nosso controle de qualidade. Reduzimos defeitos em 85% no primeiro mês.",
      avatar: "👩‍💼"
    },
    {
      name: "João Santos",
      role: "Gerente de Produção",
      company: "InduTech",
      content: "Interface intuitiva e relatórios detalhados. Nossa produtividade aumentou 40%.",
      avatar: "👨‍💼"
    },
    {
      name: "Ana Costa",
      role: "CEO",
      company: "StartupXYZ",
      content: "A melhor decisão que tomamos foi implementar o ENSO. ROI incrível!",
      avatar: "👩‍💻"
    }
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % animatedWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [animatedWords.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Dados dos planos
  const plans = [
    {
      name: "Starter",
      price: "R$ 299",
      period: "/mês",
      description: "Ideal para pequenas empresas",
      features: [
        "Até 5 usuários",
        "Relatórios básicos",
        "Suporte por email",
        "Atualizações mensais"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "R$ 599",
      period: "/mês",
      description: "Perfeito para empresas em crescimento",
      features: [
        "Até 20 usuários",
        "Relatórios avançados",
        "Suporte prioritário",
        "Atualizações semanais",
        "Integração com APIs",
        "Backup automático"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Sob consulta",
      period: "",
      description: "Para grandes corporações",
      features: [
        "Usuários ilimitados",
        "Relatórios customizados",
        "Suporte 24/7",
        "Atualizações diárias",
        "Integração completa",
        "SLA garantido",
        "Treinamento dedicado"
      ],
      popular: false
    }
  ];

  // Dados dos benefícios
  const benefits = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Controle Total",
      description: "Monitore todos os aspectos da qualidade em tempo real",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Resultados Comprovados",
      description: "Aumente a produtividade em até 60%",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Implementação Rápida",
      description: "Comece a usar em menos de 24 horas",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Suporte Especializado",
      description: "Equipe dedicada para seu sucesso",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics Avançados",
      description: "Insights profundos para decisões estratégicas",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Segurança Máxima",
      description: "Dados protegidos com criptografia de ponta",
      color: "from-red-500 to-red-600"
    }
  ];

  // Função para enviar email de solicitação de demo
  const handleDemoRequest = () => {
    const subject = encodeURIComponent("Solicitação de Demo Gratuito - ENSO");
    const body = encodeURIComponent(`
Olá! 

Gostaria de solicitar um demo gratuito da plataforma ENSO.

Informações da empresa:
- Nome da empresa: 
- Setor: 
- Número de funcionários: 
- Principais desafios: 

Aguardo o contato!

Atenciosamente,
[Seu nome]
    `);
    
    window.open(`mailto:contato@enso.com?subject=${subject}&body=${body}`, '_blank');
  };

  // Função para abrir WhatsApp
  const handleWhatsAppContact = () => {
    const message = encodeURIComponent("Olá! Gostaria de falar com um especialista sobre a plataforma ENSO.");
    const phone = "5541991152861"; // (41) 99115-2861
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200 dark:from-stone-900 dark:via-stone-800 dark:to-stone-700 sales-page-container">
      {/* Header */}
      <header className="fixed top-0 w-full z-[9999] bg-white/90 backdrop-blur-md border-b border-stone-200 dark:bg-stone-900/90 dark:border-stone-700 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <EnsoSnakeLogo size={40} showText={false} />
            <span className="text-2xl font-bold bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent dark:from-stone-300 dark:to-stone-100">
              ENSO
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              className="text-stone-600 hover:text-stone-800 dark:text-stone-300 dark:hover:text-stone-100 transition-colors relative group"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Recursos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-stone-600 dark:bg-stone-300 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a 
              href="#testimonials" 
              className="text-stone-600 hover:text-stone-800 dark:text-stone-300 dark:hover:text-stone-100 transition-colors relative group"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Depoimentos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-stone-600 dark:bg-stone-300 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a 
              href="#pricing" 
              className="text-stone-600 hover:text-stone-800 dark:text-stone-300 dark:hover:text-stone-100 transition-colors relative group"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Preços
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-stone-600 dark:bg-stone-300 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <Link 
              to="/login" 
              className="text-stone-600 hover:text-stone-800 dark:text-stone-300 dark:hover:text-stone-100 transition-colors relative group"
            >
              Login
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-stone-600 dark:bg-stone-300 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button 
              onClick={() => {
                console.log('Botão Demo Gratuito clicado');
                setIsTutorialOpen(true);
              }}
              className="bg-gradient-to-r from-stone-600 to-stone-800 hover:from-stone-700 hover:to-stone-900 text-white dark:from-stone-500 dark:to-stone-700 dark:hover:from-stone-600 dark:hover:to-stone-800"
            >
              Demo Gratuito
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-600 via-stone-700 to-stone-900 opacity-10"></div>
        <ParticleEffect />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200">
              ✨ Nova versão disponível
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-stone-900 via-stone-700 to-stone-600 bg-clip-text text-transparent dark:from-stone-100 dark:via-stone-200 dark:to-stone-300">
              Sinônimo de
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-600 to-stone-800 dark:from-stone-300 dark:to-stone-100">
                {animatedWords[currentWord]}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-stone-600 dark:text-stone-300 mb-8 max-w-3xl mx-auto">
              O ENSO é a plataforma mais avançada para controle de qualidade e gestão de processos industriais. 
              Transforme sua empresa com tecnologia de ponta.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                onClick={handleWhatsAppContact}
                className="bg-gradient-to-r from-stone-600 to-stone-800 hover:from-stone-700 hover:to-stone-900 text-white text-lg px-8 py-4 transform hover:scale-105 transition-all duration-200 dark:from-stone-500 dark:to-stone-700 dark:hover:from-stone-600 dark:hover:to-stone-800"
              >
                Comece Agora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                onClick={() => {
                  console.log('Botão Ver Demo clicado');
                  setIsTutorialOpen(true);
                }}
                className="text-lg px-8 py-4 border-2 border-stone-300 hover:border-stone-600 hover:text-stone-600 transform hover:scale-105 transition-all duration-200 dark:border-stone-600 dark:hover:border-stone-400 dark:text-stone-300 dark:hover:text-stone-100"
              >
                <Play className="mr-2 w-5 h-5" />
                Ver Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-stone-600 via-stone-700 to-stone-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Empresas Atendidas", icon: <Building className="w-8 h-8" /> },
              { value: "99.9%", label: "Uptime Garantido", icon: <Shield className="w-8 h-8" /> },
              { value: "24/7", label: "Suporte Técnico", icon: <Users className="w-8 h-8" /> },
              { value: "ISO", label: "Certificações", icon: <Award className="w-8 h-8" /> }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-white"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-stone-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={featuresRef} id="features" className="py-20 bg-white dark:bg-stone-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-stone-900 to-stone-700 bg-clip-text text-transparent dark:from-stone-100 dark:to-stone-300">
              Por que escolher o ENSO?
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">
              Descubra como nossa plataforma pode transformar seus processos e resultados
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <Card className="h-full p-6 border-2 border-stone-200 hover:border-stone-400 dark:border-stone-700 dark:hover:border-stone-500 transition-all duration-300 hover:shadow-xl group">
                  <CardContent className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${benefit.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-stone-900 dark:text-white group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-stone-600 dark:text-stone-300">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} id="testimonials" className="py-20 bg-gradient-to-r from-stone-50 to-stone-100 dark:from-stone-800 dark:to-stone-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-stone-900 to-stone-700 bg-clip-text text-transparent dark:from-stone-100 dark:to-stone-300">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-300">
              Histórias reais de sucesso e transformação
            </p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <Card className="p-8 border-2 border-stone-200 dark:border-stone-700">
                  <CardContent>
                    <div className="text-6xl mb-4">{testimonials[currentTestimonial].avatar}</div>
                    <p className="text-xl text-stone-600 dark:text-stone-300 mb-6 italic">
                      "{testimonials[currentTestimonial].content}"
                    </p>
                    <div>
                      <h4 className="font-semibold text-stone-900 dark:text-white">
                        {testimonials[currentTestimonial].name}
                      </h4>
                      <p className="text-stone-600 dark:text-stone-400">
                        {testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].company}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
            
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  aria-label={`Ir para depoimento ${index + 1}`}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial 
                      ? 'bg-stone-600 dark:bg-stone-300' 
                      : 'bg-stone-300 dark:bg-stone-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} id="pricing" className="py-20 bg-white dark:bg-stone-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-stone-900 to-stone-700 bg-clip-text text-transparent dark:from-stone-100 dark:to-stone-300">
              Planos que se adaptam ao seu negócio
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-300">
              Escolha o plano ideal para suas necessidades
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-stone-600 to-stone-800 text-white px-4 py-2 dark:from-stone-500 dark:to-stone-700">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <Card className={`h-full p-6 border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? 'border-stone-500 bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-800/20 dark:to-stone-700/20' 
                    : 'border-stone-200 dark:border-stone-700'
                }`}>
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-stone-900 dark:text-white">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-stone-900 dark:text-white">
                        {plan.price}
                      </span>
                      <span className="text-stone-600 dark:text-stone-400">
                        {plan.period}
                      </span>
                    </div>
                    <p className="text-stone-600 dark:text-stone-400 mt-2">
                      {plan.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-stone-700 dark:text-stone-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-stone-600 to-stone-800 hover:from-stone-700 hover:to-stone-900 text-white dark:from-stone-500 dark:to-stone-700 dark:hover:from-stone-600 dark:hover:to-stone-800'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-900 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-white'
                      }`}
                      onClick={handleWhatsAppContact}
                    >
                      {plan.name === 'Enterprise' ? 'Falar com Vendas' : 'Começar Agora'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-stone-600 via-stone-700 to-stone-900">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Pronto para transformar sua empresa?
            </h2>
            <p className="text-xl text-stone-200 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de empresas que já confiam no ENSO para revolucionar seus processos
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={handleDemoRequest}
                className="bg-white text-stone-600 hover:bg-stone-50 text-lg px-8 py-4 transform hover:scale-105 transition-all duration-200"
              >
                Solicitar Demo Gratuito
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                onClick={handleWhatsAppContact}
                className="border-white text-white hover:bg-white hover:text-stone-600 text-lg px-8 py-4 transform hover:scale-105 transition-all duration-200"
              >
                <Phone className="mr-2 w-5 h-5" />
                Falar com Especialista
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <EnsoSnakeLogo size={50} showText={true} />
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-stone-400">
                <li><a href="#features" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrações</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-stone-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-stone-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Comunidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-stone-800 mt-8 pt-8 text-center text-stone-400">
            <p>&copy; 2025 ENSO. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: scrollY.get() > 500 ? 1 : 0, 
          scale: scrollY.get() > 500 ? 1 : 0 
        }}
        transition={{ duration: 0.3 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gradient-to-r from-stone-600 to-stone-800 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center dark:from-stone-500 dark:to-stone-700"
        aria-label="Voltar ao topo"
      >
        <ChevronUp className="w-6 h-6" />
      </motion.button>

      {/* Modals */}
      <FeaturesModal 
        isOpen={isFeaturesModalOpen} 
        onClose={() => setIsFeaturesModalOpen(false)} 
      />
      
      <DemoRequestModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
      />

      <AppTutorial 
        isOpen={isTutorialOpen} 
        onClose={() => setIsTutorialOpen(false)} 
      />
    </div>
  );
}
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
  ChevronLeft
} from 'lucide-react';
import ParticleEffect from '@/components/ParticleEffect';
import FeaturesModal from '@/components/FeaturesModal';
import DemoRequestModal from '@/components/DemoRequestModal';
import AnimatedLogo from '@/components/AnimatedLogo';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import '@/styles/sales-page.css';

// Paleta de cores moderna e profissional
const colors = {
  primary: '#1E40AF', // Azul principal
  secondary: '#3B82F6', // Azul secundário
  accent: '#8B5CF6', // Roxo para contraste
  dark: '#0F172A', // Preto azulado
  light: '#F8FAFC', // Branco suave
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  text: '#1E293B',
  textSecondary: '#64748B',
  textLight: '#FFFFFF'
};

export default function SalesPage() {
  const [currentWord, setCurrentWord] = useState(0);
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { scrollY } = useScroll();
  const { isDark } = useTheme();
  
  // Refs para animações
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const testimonialsRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);
  
  const animatedWords = ['Qualidade', 'Inovação', 'Controle', 'Eficiência'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % animatedWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Dados dos depoimentos
  const testimonials = [
    {
      name: "Maria Silva",
      role: "Diretora de Qualidade",
      company: "TechCorp",
      content: "O Enso revolucionou nosso controle de qualidade. Reduzimos defeitos em 85% no primeiro mês.",
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
      content: "A melhor decisão que tomamos foi implementar o Enso. ROI incrível!",
      avatar: "👩‍💻"
    }
  ];

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
      description: "Monitore todos os aspectos da qualidade em tempo real"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Resultados Comprovados",
      description: "Aumente a produtividade em até 60%"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Implementação Rápida",
      description: "Comece a usar em menos de 24 horas"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Suporte Especializado",
      description: "Equipe dedicada para seu sucesso"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics Avançados",
      description: "Insights profundos para decisões estratégicas"
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Segurança Máxima",
      description: "Dados protegidos com criptografia de ponta"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 dark:bg-slate-900/80 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <AnimatedLogo />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Enso
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors">Recursos</a>
            <a href="#testimonials" className="text-slate-600 hover:text-blue-600 transition-colors">Depoimentos</a>
            <a href="#pricing" className="text-slate-600 hover:text-blue-600 transition-colors">Preços</a>
            <Link to="/login" className="text-slate-600 hover:text-blue-600 transition-colors">Login</Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button 
              onClick={() => setIsDemoModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Demo Gratuito
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-slate-900 opacity-10"></div>
        <ParticleEffect />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              ✨ Nova versão disponível
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Revolucione seu
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {animatedWords[currentWord]}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              O Enso é a plataforma mais avançada para controle de qualidade e gestão de processos industriais. 
              Transforme sua empresa com tecnologia de ponta.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                onClick={() => setIsDemoModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-4 transform hover:scale-105 transition-all duration-200"
              >
                Comece Agora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                onClick={() => setIsFeaturesModalOpen(true)}
                className="text-lg px-8 py-4 border-2 border-slate-300 hover:border-blue-600 hover:text-blue-600 transform hover:scale-105 transition-all duration-200"
              >
                <Play className="mr-2 w-5 h-5" />
                Ver Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={featuresRef} id="features" className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent">
              Por que escolher o Enso?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
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
                <Card className="h-full p-6 border-2 border-slate-200 hover:border-blue-300 dark:border-slate-700 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl">
                  <CardContent className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                      {benefit.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
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
      <section ref={testimonialsRef} id="testimonials" className="py-20 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
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
                <Card className="p-8 border-2 border-slate-200 dark:border-slate-700">
                  <CardContent>
                    <div className="text-6xl mb-4">{testimonials[currentTestimonial].avatar}</div>
                    <p className="text-xl text-slate-600 dark:text-slate-300 mb-6 italic">
                      "{testimonials[currentTestimonial].content}"
                    </p>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {testimonials[currentTestimonial].name}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
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
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial 
                      ? 'bg-blue-600' 
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} id="pricing" className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent">
              Planos que se adaptam ao seu negócio
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
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
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <Card className={`h-full p-6 border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20' 
                    : 'border-slate-200 dark:border-slate-700'
                }`}>
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">
                        {plan.price}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {plan.period}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                      {plan.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white'
                      }`}
                      onClick={() => setIsDemoModalOpen(true)}
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
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-slate-900">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Pronto para transformar sua empresa?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de empresas que já confiam no Enso para revolucionar seus processos
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => setIsDemoModalOpen(true)}
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 transform hover:scale-105 transition-all duration-200"
              >
                Solicitar Demo Gratuito
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 transform hover:scale-105 transition-all duration-200"
              >
                <Phone className="mr-2 w-5 h-5" />
                Falar com Especialista
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <AnimatedLogo />
                <span className="text-2xl font-bold">Enso</span>
              </div>
              <p className="text-slate-400">
                Revolucionando o controle de qualidade com tecnologia de ponta.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrações</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Comunidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Enso. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

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
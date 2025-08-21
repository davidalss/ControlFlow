import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  ArrowRight,
  Play,
  Shield,
  TrendingUp,
  Users,
  Award,
  Star,
  Rocket,
  ChevronUp,
  Menu,
  X,
  Target,
  BarChart3,
  Clock,
  Settings,
  Phone,
  Mail,
  MapPin,
  Search,
  Cog,
  FileText,
  Brain,
  Zap,
  Database,
  Wrench,
  GraduationCap,
} from "lucide-react"

export default function SalesPage() {
  const [currentWord, setCurrentWord] = useState(0)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const animatedWords = ["QUALIDADE", "EXCELÊNCIA", "INOVAÇÃO", "TECNOLOGIA"]

  const testimonials = [
    {
      name: "Carlos Mendes",
      role: "Diretor de Qualidade, MegaIndustrial Corp",
      content:
        "O ENSO revolucionou nosso SGQ. Implementamos todos os módulos em 45 dias e obtivemos certificação ISO 9001 em tempo recorde.",
      avatar: "👨‍💼",
      rating: 5,
      results: "ISO 9001 certificada",
    },
    {
      name: "Ana Rodrigues",
      role: "Gerente de Processos, TechPower",
      content:
        "A integração entre treinamentos, inspeções e IA preditiva nos deu controle total sobre a qualidade. ROI de 650% em 6 meses.",
      avatar: "👩‍💼",
      rating: 5,
      results: "650% ROI",
    },
    {
      name: "Roberto Silva",
      role: "VP Engenharia, GlobalTech",
      content:
        "Sistema completo que unificou todos nossos processos de qualidade. A IA detecta problemas antes mesmo deles acontecerem.",
      avatar: "👨‍🔬",
      rating: 5,
      results: "Zero defeitos",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev: number) => (prev + 1) % animatedWords.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [animatedWords.length])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev: number) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      "Olá! Gostaria de conhecer mais sobre a plataforma ENSO de Gestão da Qualidade e agendar uma demonstração.",
    )
    window.open(`https://wa.me/5541991152861?text=${message}`, "_blank")
  }

  const handleDemoRequest = () => {
    window.open(
      "mailto:contato@enso.com?subject=Demonstração ENSO - Sistema de Gestão da Qualidade&body=Olá! Gostaria de agendar uma demonstração da plataforma ENSO para implementar um sistema completo de gestão da qualidade em minha empresa.",
      "_blank",
    )
  }

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
    setIsMenuOpen(false)
  }

  return (
    <div className="sales-page">
      <header className="sales-header">
        <div className="sales-container">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xl">E</span>
              </div>
              <span className="text-2xl font-bold sales-text-gradient">
                ENSO
              </span>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              {[
                { href: "modules", label: "Módulos" },
                { href: "solutions", label: "Soluções" },
                { href: "results", label: "Resultados" },
                { href: "plans", label: "Planos" },
              ].map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="text-gray-300 hover:text-cyan-400 transition-colors font-medium"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <Button
                onClick={handleDemoRequest}
                className="hidden md:flex sales-button-primary font-medium px-6 py-2"
              >
                <Play className="mr-2 w-4 h-4" />
                Demo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-cyan-400"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden bg-black border-t border-cyan-500/20 mt-4">
              <div className="py-4 space-y-4">
                {[
                  { href: "modules", label: "Módulos" },
                  { href: "solutions", label: "Soluções" },
                  { href: "results", label: "Resultados" },
                  { href: "plans", label: "Planos" },
                ].map((item) => (
                  <button
                    key={item.href}
                    onClick={() => scrollToSection(item.href)}
                    className="block w-full text-left text-gray-300 hover:text-cyan-400 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                <Button
                  onClick={handleDemoRequest}
                  className="w-full sales-button-primary"
                >
                  Demonstração
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <motion.section
        className="sales-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="sales-container text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 text-sm font-medium">
              <Award className="w-4 h-4 mr-2" />
              Sistema Completo de Gestão da Qualidade
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="text-white">Plataforma de</span>
              <br />
              <motion.span
                key={currentWord}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="sales-text-gradient"
              >
                {animatedWords[currentWord]}
              </motion.span>
              <br />
              <span className="text-white">Industrial</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Sistema completo que integra{" "}
              <span className="text-cyan-400 font-semibold">Treinamentos, Inspeções, Engenharia, SGQ e IA</span>
              <br />
              em uma única plataforma para <span className="text-yellow-400 font-semibold">máxima eficiência</span> e
              conformidade normativa.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button
                size="lg"
                onClick={handleWhatsAppContact}
                className="sales-button-primary text-lg px-10 py-4 font-semibold"
              >
                <Rocket className="mr-3 w-5 h-5" />
                Implementar Sistema
                <ArrowRight className="ml-3 w-5 h-5" />
              </Button>

              <Button
                size="lg"
                onClick={handleDemoRequest}
                className="sales-button-outline text-lg px-10 py-4 font-semibold"
              >
                <Play className="mr-3 w-5 h-5" />
                Ver Demonstração
              </Button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span>ISO 9001 | ISO 14001</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                <span>IA Integrada</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>500+ Empresas</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <section className="sales-section">
        <div className="sales-container">
          <div className="sales-grid sales-grid-4 text-center">
            {[
              { value: "650%", label: "ROI Médio", icon: <TrendingUp className="w-6 h-6" />, color: "text-green-400" },
              { value: "99.8%", label: "Conformidade", icon: <Target className="w-6 h-6" />, color: "text-cyan-400" },
              {
                value: "30 dias",
                label: "Implementação",
                icon: <Clock className="w-6 h-6" />,
                color: "text-yellow-400",
              },
              {
                value: "6 módulos",
                label: "Integrados",
                icon: <Settings className="w-6 h-6" />,
                color: "text-purple-400",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`${stat.color} mb-2 flex justify-center`}>{stat.icon}</div>
                <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="modules" className="sales-section">
        <div className="sales-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Módulos Integrados</h2>
            <p className="text-xl text-gray-300">Sistema completo de gestão da qualidade em 6 módulos</p>
          </div>

          <div className="sales-grid sales-grid-3">
            {[
              {
                icon: <GraduationCap className="w-8 h-8" />,
                title: "Treinamentos",
                description: "Gestão completa de capacitação e desenvolvimento de competências.",
                features: [
                  "Trilhas de aprendizagem",
                  "Certificações digitais",
                  "Avaliações automáticas",
                  "Relatórios de progresso",
                ],
                color: "from-green-500 to-emerald-600",
              },
              {
                icon: <Search className="w-8 h-8" />,
                title: "Inspeções",
                description: "Sistema inteligente de inspeções com IA e automação completa.",
                features: ["Checklists digitais", "Inspeção por IA", "Não conformidades", "Planos de ação"],
                color: "from-blue-500 to-cyan-600",
              },
              {
                icon: <Wrench className="w-8 h-8" />,
                title: "Engenharia",
                description: "Gestão de projetos, especificações técnicas e controle de mudanças.",
                features: [
                  "Controle de documentos",
                  "Gestão de mudanças",
                  "Especificações técnicas",
                  "Aprovações digitais",
                ],
                color: "from-orange-500 to-red-600",
              },
              {
                icon: <FileText className="w-8 h-8" />,
                title: "SGQ",
                description: "Sistema de Gestão da Qualidade completo e certificável.",
                features: ["ISO 9001 ready", "Auditorias internas", "Indicadores KPI", "Melhoria contínua"],
                color: "from-purple-500 to-violet-600",
              },
              {
                icon: <Cog className="w-8 h-8" />,
                title: "Processos",
                description: "Mapeamento, otimização e controle de processos industriais.",
                features: [
                  "Fluxogramas digitais",
                  "Controle estatístico",
                  "Otimização automática",
                  "Monitoramento real-time",
                ],
                color: "from-yellow-500 to-amber-600",
              },
              {
                icon: <Brain className="w-8 h-8" />,
                title: "IA Integrada",
                description: "Inteligência artificial aplicada em todos os módulos do sistema.",
                features: [
                  "Análise preditiva",
                  "Detecção de anomalias",
                  "Otimização automática",
                  "Insights inteligentes",
                ],
                color: "from-cyan-500 to-blue-600",
              },
            ].map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="sales-card h-full group">
                  <CardHeader>
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-r ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <div className="text-white">{module.icon}</div>
                    </div>
                    <CardTitle className="text-white text-xl">{module.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-6">{module.description}</p>
                    <ul className="space-y-2">
                      {module.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-gray-400">
                          <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
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
      </section>

      <section id="solutions" className="sales-section">
        <div className="sales-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Soluções Integradas</h2>
            <p className="text-xl text-gray-300">Tecnologia que conecta todos os aspectos da qualidade</p>
          </div>

          <div className="sales-grid sales-grid-2 items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">Integração Total</h3>
              <p className="text-gray-300 mb-8 text-lg">
                O ENSO conecta todos os módulos em uma única plataforma, proporcionando visão 360° da qualidade em sua
                empresa.
              </p>

              <div className="space-y-4">
                {[
                  { icon: <Database className="w-5 h-5" />, text: "Base de dados unificada" },
                  { icon: <Zap className="w-5 h-5" />, text: "Automação inteligente" },
                  { icon: <BarChart3 className="w-5 h-5" />, text: "Dashboards executivos" },
                  { icon: <Shield className="w-5 h-5" />, text: "Segurança corporativa" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 text-gray-300">
                    <div className="text-cyan-400">{item.icon}</div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sales-grid sales-grid-2">
              {[
                { title: "Treinamentos", value: "100%", subtitle: "Digitalizados" },
                { title: "Inspeções", value: "99.8%", subtitle: "Precisão IA" },
                { title: "Processos", value: "85%", subtitle: "Otimização" },
                { title: "Conformidade", value: "ISO", subtitle: "Certificável" },
              ].map((metric, index) => (
                <Card
                  key={index}
                  className="sales-card text-center p-6"
                >
                  <div className="text-2xl font-bold text-cyan-400 mb-1">{metric.value}</div>
                  <div className="text-white font-medium mb-1">{metric.title}</div>
                  <div className="text-gray-400 text-sm">{metric.subtitle}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="results" className="sales-section">
        <div className="sales-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Resultados Comprovados</h2>
            <p className="text-xl text-gray-300">Empresas que transformaram sua gestão da qualidade</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="sales-card">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="text-4xl mr-4">{testimonials[currentTestimonial].avatar}</div>
                      <div>
                        <h4 className="text-white font-semibold text-lg">{testimonials[currentTestimonial].name}</h4>
                        <p className="text-gray-400">{testimonials[currentTestimonial].role}</p>
                        <div className="flex mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                      <div className="ml-auto">
                        <Badge className="bg-green-600 text-white">{testimonials[currentTestimonial].results}</Badge>
                      </div>
                    </div>
                    <blockquote className="text-gray-300 text-lg italic leading-relaxed">
                      "{testimonials[currentTestimonial].content}"
                    </blockquote>
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
                    index === currentTestimonial ? "bg-cyan-400" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="plans" className="sales-section">
        <div className="sales-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Planos Completos</h2>
            <p className="text-xl text-gray-300">Sistema completo de gestão da qualidade para sua empresa</p>
          </div>

          <div className="sales-grid sales-grid-3 max-w-6xl mx-auto">
            {[
              {
                name: "Starter",
                price: "R$ 897",
                period: "/mês",
                description: "Para empresas iniciando na qualidade",
                features: [
                  "3 módulos inclusos",
                  "Treinamentos básicos",
                  "Inspeções digitais",
                  "SGQ simplificado",
                  "Suporte técnico",
                  "Até 50 usuários",
                ],
                popular: false,
              },
              {
                name: "Professional",
                price: "R$ 1.497",
                period: "/mês",
                description: "Sistema completo para operações avançadas",
                features: [
                  "Todos os 6 módulos",
                  "IA integrada completa",
                  "Certificação ISO ready",
                  "Automação avançada",
                  "Suporte 24/7",
                  "Usuários ilimitados",
                  "Consultoria especializada",
                ],
                popular: true,
              },
              {
                name: "Enterprise",
                price: "Sob consulta",
                period: "",
                description: "Solução personalizada e dedicada",
                features: [
                  "Customização completa",
                  "Integração específica",
                  "Treinamento in-company",
                  "SLA personalizado",
                  "Suporte dedicado",
                  "Múltiplas plantas",
                ],
                popular: false,
              },
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  className={`relative h-full sales-card ${
                    plan.popular ? "border-cyan-500" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1">
                        Mais Completo
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-white text-2xl mb-2">{plan.name}</CardTitle>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-cyan-400">{plan.price}</span>
                      <span className="text-gray-400">{plan.period}</span>
                    </div>
                    <p className="text-gray-300">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-gray-300">
                          <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={handleWhatsAppContact}
                      className={`w-full ${
                        plan.popular ? "sales-button-primary" : "sales-button-outline"
                      } font-semibold py-3`}
                    >
                      Implementar Sistema
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="sales-section" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #0891b2 100%)' }}>
        <div className="sales-container text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Pronto para Revolucionar sua Qualidade?</h2>
          <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Implemente um sistema completo de gestão da qualidade com IA integrada. Mais de 500 empresas já
            transformaram seus processos com o ENSO.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleWhatsAppContact}
              className="bg-white text-blue-900 hover:bg-gray-100 font-semibold px-8 py-4 text-lg"
            >
              <Phone className="mr-2 w-5 h-5" />
              Falar com Especialista
            </Button>
            <Button
              size="lg"
              onClick={handleDemoRequest}
              className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-4 text-lg bg-transparent"
            >
              <Play className="mr-2 w-5 h-5" />
              Agendar Demo
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-black text-white py-12 border-t border-gray-800">
        <div className="sales-container">
          <div className="sales-grid sales-grid-4 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-xl">E</span>
                </div>
                <span className="text-2xl font-bold sales-text-gradient">
                  ENSO
                </span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Sistema completo de gestão da qualidade com IA integrada para transformar operações industriais.
              </p>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>Curitiba, PR - Brasil</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-green-400" />
                  <a href="tel:+5541991152861" className="hover:text-cyan-400 transition-colors">
                    (41) 99115-2861
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <a href="mailto:contato@enso.com" className="hover:text-cyan-400 transition-colors">
                    contato@enso.com
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-cyan-400">Módulos</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button onClick={() => scrollToSection("modules")} className="hover:text-cyan-400 transition-colors">
                    Treinamentos
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("modules")} className="hover:text-cyan-400 transition-colors">
                    Inspeções
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("modules")} className="hover:text-cyan-400 transition-colors">
                    SGQ
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("modules")} className="hover:text-cyan-400 transition-colors">
                    IA Integrada
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-cyan-400">Contato</h3>
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <a
                    href={`https://wa.me/5541991152861?text=${encodeURIComponent("Olá! Gostaria de conhecer mais sobre o sistema ENSO de gestão da qualidade.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-200"
                  >
                    <Phone className="w-5 h-5 text-white" />
                  </a>
                  <a
                    href="mailto:contato@enso.com"
                    className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-200"
                  >
                    <Mail className="w-5 h-5 text-white" />
                  </a>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-600 text-white text-xs">ISO 9001</Badge>
                  <Badge className="bg-blue-600 text-white text-xs">ISO 14001</Badge>
                  <Badge className="bg-purple-600 text-white text-xs">ISO 27001</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              &copy; 2025 ENSO - Sistema de Gestão da Qualidade. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      <button
        className={`sales-back-to-top ${scrollY > 500 ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Voltar ao topo"
      >
        <ChevronUp className="w-6 h-6" />
      </button>
    </div>
  )
}
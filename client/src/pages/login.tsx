import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle, AlertCircle, Shield, Zap, TrendingUp, Sparkles, Sun, Moon, Star, Target, Users, Settings } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import EnsoLogo from '@/components/EnsoLogo';
import ParticleEffect from '@/components/ParticleEffect';
import { useAuth } from '@/hooks/use-auth';

// Componente de partículas flutuantes para o background
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${6 + Math.random() * 4}s`
          }}
        />
      ))}
    </div>
  );
};

// Componente do significado ENSO
const EnsoMeaning = () => {
  const meanings = [
    { letter: 'E', word: 'Excelência', description: 'Compromisso constante com a qualidade e a melhoria contínua' },
    { letter: 'N', word: 'Nexo', description: 'A conexão que une pessoas, processos e informações' },
    { letter: 'S', word: 'Simplicidade', description: 'Soluções intuitivas que transformam processos complexos' },
    { letter: 'O', word: 'Otimização', description: 'A melhoria contínua aplicada ao dia a dia' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {meanings.map((item, index) => (
        <motion.div
          key={item.letter}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="text-center p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover-lift"
        >
          <div className="text-2xl font-bold text-blue-400 mb-2">{item.letter}</div>
          <div className="text-sm font-semibold text-white mb-1">{item.word}</div>
          <div className="text-xs text-white/70">{item.description}</div>
        </motion.div>
      ))}
    </div>
  );
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDark, toggleTheme } = useTheme();
  const { login, user, loading } = useAuth();

  const animatedWords = ['Qualidade', 'Inovação', 'Controle', 'Eficiência'];
  
  // Efeito para redirecionar quando o usuário é autenticado
  useEffect(() => {
    console.log('LoginPage - useEffect - user:', user, 'loading:', loading);
    if (user && !loading) {
      console.log('Usuário autenticado, redirecionando para dashboard...');
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % animatedWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Email validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(email));
  }, [email]);

  // Password validation
  useEffect(() => {
    setIsValidPassword(password.length >= 6);
  }, [password]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedLogin(true);
    
    if (!isValidEmail || !isValidPassword) {
      console.log('Validação falhou:', { isValidEmail, isValidPassword });
      return;
    }
    
    setIsLoading(true);
    console.log('Tentando fazer login com:', { email });

    try {
      await login(email, password);
      console.log('Login realizado com sucesso');

      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo ao ENSO!`,
      });

      // O redirecionamento será feito pelo useEffect quando o usuário for autenticado
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      // Mensagens de erro específicas
      let errorMessage = "Credenciais inválidas";
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Email ou senha incorretos. Verifique suas credenciais.";
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = "Email não confirmado. Verifique sua caixa de entrada.";
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
      } else if (error.message?.includes('User not found')) {
        errorMessage = "Usuário não encontrado. Verifique se o email está correto.";
      }
      
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-slate-900/20"></div>
      <FloatingParticles />
      <ParticleEffect />
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/">
            <EnsoLogo size={40} showText={true} variant="animated" />
          </Link>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-screen items-center justify-center px-4 pt-20">
        <div className="w-full max-w-4xl">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <Badge className="mb-4 bg-blue-500/20 text-blue-200 border border-blue-400/30">
              ✨ Acesso ao Sistema ENSO
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Revolucione seu
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">
                {animatedWords[currentWord]}
              </span>
            </h1>
            
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Faça login para acessar a plataforma ENSO de controle de qualidade
            </p>

            {/* Significado ENSO */}
            <EnsoMeaning />
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-md mx-auto"
          >
            <Card className="border border-white/20 shadow-2xl bg-white/10 backdrop-blur-md">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-white">
                  Entrar no Sistema
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/90">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`pl-10 border-2 bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-blue-400 focus:bg-white/20 transition-all ${
                          hasAttemptedLogin && !isValidEmail 
                            ? 'border-red-400 focus:border-red-400' 
                            : ''
                        }`}
                        required
                      />
                    </div>
                    {hasAttemptedLogin && !isValidEmail && (
                      <p className="text-red-300 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Email inválido
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/90">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`pl-10 pr-10 border-2 bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-blue-400 focus:bg-white/20 transition-all ${
                          hasAttemptedLogin && !isValidPassword 
                            ? 'border-red-400 focus:border-red-400' 
                            : ''
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {hasAttemptedLogin && !isValidPassword && (
                      <p className="text-red-300 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Senha deve ter pelo menos 6 caracteres
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 transform hover:scale-105 transition-all duration-200 shadow-lg border-0"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Entrando...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Entrar
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </form>

                {/* Footer */}
                <div className="text-center pt-4 border-t border-white/20">
                  <p className="text-sm text-white/60">
                    © 2024 ENSO • Nossa Essência
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
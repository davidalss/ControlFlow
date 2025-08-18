import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from '@/lib/supabaseClient';
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle, AlertCircle, Shield, Zap, TrendingUp, Sparkles, Sun, Moon, Copy, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import AnimatedLogo from '@/components/AnimatedLogo';
import ParticleEffect from '@/components/ParticleEffect';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDark, toggleTheme } = useTheme();

  const animatedWords = ['Qualidade', 'Inovação', 'Controle', 'Eficiência'];
  
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
      return;
    }
    
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message || "Credenciais inválidas",
          variant: "destructive",
        });
        return;
      }

      // Save session
      localStorage.setItem('supabase_session', JSON.stringify(data.session));

      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo!`,
      });

      window.location.href = '/dashboard';
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@controlflow.com',
        password: 'admin123',
      })

      if (error) {
        toast({
          title: "Erro no login demo",
          description: error.message || "Erro ao fazer login demo",
          variant: "destructive",
        });
        return;
      }

      // Save session
      localStorage.setItem('supabase_session', JSON.stringify(data.session));

      toast({
        title: "Login demo realizado com sucesso!",
        description: `Bem-vindo!`,
      });

      window.location.href = '/dashboard';
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copiado!",
        description: `${field} copiado para a área de transferência`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar para a área de transferência",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-slate-900 opacity-5"></div>
      <ParticleEffect />
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 dark:bg-slate-900/80 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <AnimatedLogo />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Enso
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link to="/sales">
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                Ver Landing Page
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-screen items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              ✨ Acesso ao Sistema
            </Badge>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Revolucione seu
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {animatedWords[currentWord]}
              </span>
            </h1>
            
            <p className="text-slate-600 dark:text-slate-300">
              Faça login para acessar a plataforma mais avançada de controle de qualidade
            </p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                  Entrar no Sistema
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`pl-10 border-2 transition-colors ${
                          hasAttemptedLogin && !isValidEmail 
                            ? 'border-red-500 focus:border-red-500' 
                            : 'border-slate-300 focus:border-blue-600 dark:border-slate-600 dark:focus:border-blue-500'
                        }`}
                        required
                      />
                    </div>
                    {hasAttemptedLogin && !isValidEmail && (
                      <p className="text-red-500 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Email inválido
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`pl-10 pr-10 border-2 transition-colors ${
                          hasAttemptedLogin && !isValidPassword 
                            ? 'border-red-500 focus:border-red-500' 
                            : 'border-slate-300 focus:border-blue-600 dark:border-slate-600 dark:focus:border-blue-500'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {hasAttemptedLogin && !isValidPassword && (
                      <p className="text-red-500 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Senha deve ter pelo menos 6 caracteres
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 transform hover:scale-105 transition-all duration-200"
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

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-300 dark:border-slate-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">ou</span>
                  </div>
                </div>

                <Button
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-2 border-slate-300 hover:border-blue-600 hover:text-blue-600 dark:border-slate-600 dark:hover:border-blue-500 dark:hover:text-blue-400"
                >
                  <Shield className="mr-2 w-5 h-5" />
                  Login Demo
                </Button>
              </CardContent>
            </Card>

            {/* Admin Credentials */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-6"
            >
              <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-blue-800 dark:text-blue-200 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Credenciais de Administrador
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm text-blue-700 dark:text-blue-300">Email:</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value="admin@controlflow.com"
                        readOnly
                        className="bg-white dark:bg-slate-800 border-blue-300 dark:border-blue-600 text-blue-800 dark:text-blue-200"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard('admin@controlflow.com', 'Email')}
                        className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/30"
                      >
                        {copiedField === 'Email' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-blue-700 dark:text-blue-300">Senha:</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value="admin123"
                        readOnly
                        className="bg-white dark:bg-slate-800 border-blue-300 dark:border-blue-600 text-blue-800 dark:text-blue-200"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard('admin123', 'Senha')}
                        className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/30"
                      >
                        {copiedField === 'Senha' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
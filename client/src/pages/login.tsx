import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from '@/lib/supabaseClient';
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle, AlertCircle, Shield, Zap, TrendingUp, Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDark, toggleTheme } = useTheme();

  const animatedWords = ['Qualidade', 'Inovação', 'Controle'];
  
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

  return (
      <div className={`h-screen bg-gradient-to-r ${isDark ? 'from-slate-900 to-slate-800' : 'from-slate-100 to-slate-200'} flex relative overflow-hidden`}>
        
        {/* Enhanced Background Animation with Particle Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Particle Effect with Wind */}
          <ParticleEffect particleCount={60} />
          
          {/* Enhanced Floating Orbs */}
          <motion.div
            className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial ${isDark ? 'from-slate-600/3' : 'from-slate-300/4'} via-transparent to-transparent rounded-full blur-3xl`}
            animate={{
              scale: [1, 1.15, 1],
              opacity: isDark ? [0.1, 0.3, 0.1] : [0.05, 0.2, 0.05],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className={`absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-radial ${isDark ? 'from-slate-500/3' : 'from-slate-400/4'} via-transparent to-transparent rounded-full blur-3xl`}
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: isDark ? [0.08, 0.25, 0.08] : [0.03, 0.15, 0.03],
              rotate: [360, 180, 0]
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 8
            }}
          />

          {/* Enhanced Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`grid-${i}`}
                className={`absolute w-full h-px ${isDark ? 'bg-slate-500' : 'bg-slate-400'}`}
                style={{ top: `${i * 12}%` }}
                animate={{
                  opacity: isDark ? [0, 0.25, 0] : [0, 0.2, 0],
                  scaleX: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  delay: i * 1.5,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Theme-Specific Enhanced Animations */}
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="dark-animations"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Dark Mode Specific Effects */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-slate-800/10 via-transparent to-slate-900/10"
                  animate={{
                    opacity: [0.1, 0.3, 0.1],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Dark Mode Floating Elements */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={`dark-element-${i}`}
                    className="absolute w-2 h-2 bg-slate-400/20 rounded-full"
                    style={{
                      left: `${20 + i * 12}%`,
                      top: `${25 + (i % 3) * 20}%`
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0, 0.6, 0],
                      scale: [0, 1.2, 0],
                      x: [0, 10, 0]
                    }}
                    transition={{
                      duration: 10 + i * 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 1
                    }}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="light-animations"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Light Mode Specific Effects */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-200/8 to-transparent"
                  animate={{
                    opacity: [0, 0.15, 0],
                    scaleY: [0.8, 1.3, 0.8]
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Light Mode Floating Elements */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={`light-element-${i}`}
                    className="absolute w-1.5 h-1.5 bg-slate-300/30 rounded-full"
                    style={{
                      left: `${15 + i * 10}%`,
                      top: `${20 + (i % 4) * 15}%`
                    }}
                    animate={{
                      y: [0, -25, 0],
                      opacity: [0, 0.5, 0],
                      scale: [0, 1.3, 0],
                      x: [0, 15, 0]
                    }}
                    transition={{
                      duration: 8 + i * 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.8
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      {/* Left Side - Compact Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-sm">
          {/* Compact Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-6"
          >
            <div className="flex items-center justify-center mb-4">
              <AnimatedLogo size="md" showText={true} />
            </div>
            
            {/* Compact Animated Word */}
            <motion.div className="mb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentWord}
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className={`${isDark ? 'text-slate-300' : 'text-slate-800'} text-sm font-medium`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {animatedWords[currentWord]}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Enhanced Theme Toggle Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center mb-4"
          >
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-full transition-all duration-500 ${
                isDark 
                  ? 'bg-slate-700/60 hover:bg-slate-600/60 text-slate-300 hover:text-white' 
                  : 'bg-white/60 hover:bg-slate-100/60 text-slate-600 hover:text-slate-800'
              } backdrop-blur-md border border-slate-200/30 shadow-lg hover:shadow-xl relative overflow-hidden`}
              aria-label="Alternar tema"
            >
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              <motion.div
                className="relative z-10"
                animate={{ 
                  rotate: isDark ? 180 : 0,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 0.5,
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <AnimatePresence mode="wait">
                  {isDark ? (
                    <motion.div
                      key="sun"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Sun className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Moon className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Glow Effect */}
              <motion.div
                className={`absolute inset-0 rounded-full ${
                  isDark 
                    ? 'bg-slate-400/20' 
                    : 'bg-slate-500/20'
                }`}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0, 0.5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.button>
          </motion.div>

          {/* Enhanced Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className={`shadow-2xl border-0 ${isDark ? 'bg-slate-800/60' : 'bg-white/60'} backdrop-blur-xl rounded-xl overflow-hidden relative`}
              animate={{
                boxShadow: isDark 
                  ? [
                      "0 25px 50px rgba(0, 0, 0, 0.3)",
                      "0 35px 70px rgba(0, 0, 0, 0.4)",
                      "0 25px 50px rgba(0, 0, 0, 0.3)"
                    ]
                  : [
                      "0 25px 50px rgba(0, 0, 0, 0.1)",
                      "0 35px 70px rgba(0, 0, 0, 0.15)",
                      "0 25px 50px rgba(0, 0, 0, 0.1)"
                    ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Card Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              <Card className="bg-transparent border-0 shadow-none">
              <CardHeader className="text-center pb-4">
                <CardTitle className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                  Acesse sua conta
                </CardTitle>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm`} style={{ fontFamily: 'Inter, sans-serif' }}>
                  Entre com suas credenciais
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-3">
                  {/* Email Field */}
                  <div className="space-y-1">
                                          <Label htmlFor="email" className={`${isDark ? 'text-slate-300' : 'text-slate-700'} font-medium text-sm`} style={{ fontFamily: 'Inter, sans-serif' }}>
                      Email
                    </Label>
                    <div className="relative">
                        <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-600'} w-4 h-4`} />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`pl-10 pr-8 h-10 ${isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'} focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-300 ${hasAttemptedLogin && email && !isValidEmail ? 'border-red-500' : ''}`}
                        placeholder="seu@email.com"
                        required
                      />
                      <AnimatePresence>
                        {email && email.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {isValidEmail ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                                          <Label htmlFor="password" className={`${isDark ? 'text-slate-300' : 'text-slate-700'} font-medium text-sm`} style={{ fontFamily: 'Inter, sans-serif' }}>
                      Senha
                    </Label>
                    <div className="relative">
                        <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-600'} w-4 h-4`} />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`pl-10 pr-12 h-10 ${isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'} focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-300 ${hasAttemptedLogin && password && !isValidPassword ? 'border-red-500' : ''}`}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-600'} hover:${isDark ? 'text-slate-300' : 'text-slate-800'} transition-colors bg-transparent border-none p-1 rounded`}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="pt-2"
                  >
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full h-10 bg-gradient-to-r ${isDark ? 'from-slate-600 to-slate-700' : 'from-slate-200 to-slate-300'} text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden`}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{
                          x: ['-100%', '100%']
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <span className="relative z-10">
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Entrando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <span>Entrar</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                      </span>
                    </Button>
                  </motion.div>
                </form>

                {/* Demo Login */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className={`w-full border-t ${isDark ? 'border-slate-600' : 'border-slate-300'}`} />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className={`px-3 ${isDark ? 'text-slate-400' : 'text-slate-600'} font-medium`} style={{ fontFamily: 'Inter, sans-serif' }}>ou</span>
                  </div>
                </div>

                  <Button
                    onClick={handleDemoLogin}
                    disabled={isLoading}
                    variant="outline"
                  className={`w-full h-10 ${isDark ? 'bg-slate-700/20 text-slate-300 border-slate-600' : 'bg-slate-200 text-slate-800 border-slate-300'} transition-all duration-200 bg-transparent`}
                  >
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Login Demo</span>
                    </div>
                  </Button>

                {/* Demo Credentials */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`text-center p-3 ${isDark ? 'bg-slate-700/20 border-slate-600' : 'bg-slate-200 border-slate-300'} rounded-lg border ${isDark ? 'border-slate-600' : 'border-slate-300'}`}
                >
                  <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-xs`} style={{ fontFamily: 'Inter, sans-serif' }}>
                    <strong>Demo:</strong> admin@controlflow.com / admin123
                  </p>
                </motion.div>
              </CardContent>
              </Card>
            </motion.div>

            {/* Compact Footer */}
            <motion.div 
              className="text-center mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <p className={`${isDark ? 'text-slate-500' : 'text-slate-600'} text-xs`} style={{ fontFamily: 'Inter, sans-serif' }}>
                © 2024 Enso. Todos os direitos reservados.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Professional Dark Features */}
      <div className="hidden lg:flex flex-1 p-8 items-center justify-center relative overflow-hidden">
        {/* Advanced Animated Background */}
        <div className="absolute inset-0">
          {/* Floating Geometric Shapes */}
          {[...Array(6)].map((_, i) => (
          <motion.div
              key={i}
              className="absolute w-20 h-20 border border-white/10 rounded-lg"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + (i % 3) * 30}%`,
                transform: `rotate(${i * 45}deg)`
              }}
            animate={{
                rotate: [i * 45, i * 45 + 360],
              scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1],
                y: [0, -20, 0]
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5
              }}
            />
          ))}

          {/* Animated Circles */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`circle-${i}`}
              className="absolute w-32 h-32 bg-white/5 rounded-full blur-xl"
              style={{
                left: `${10 + i * 25}%`,
                top: `${20 + (i % 2) * 40}%`
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.1, 0.4, 0.1],
                x: [0, 30, 0],
                y: [0, -30, 0]
              }}
              transition={{
                duration: 6 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.8
              }}
            />
          ))}

          {/* Particle System */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: [0, Math.random() * 50 - 25, 0]
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                ease: "easeOut",
                delay: Math.random() * 2
              }}
            />
          ))}

          {/* Gradient Orbs */}
          <motion.div
            className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.1, 0.4, 0.1],
              rotate: [360, 180, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>

        {/* Content Container */}
        <div className="max-w-xl text-white relative z-10">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {/* Professional Title */}
            <motion.div className="mb-8">
            <motion.h2 
                className="text-4xl font-bold mb-3 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <motion.span
                  className="block text-white"
              animate={{
                    textShadow: [
                      "0 0 10px rgba(255,255,255,0.3)",
                      "0 0 20px rgba(255,255,255,0.5)",
                      "0 0 10px rgba(255,255,255,0.3)"
                    ]
              }}
              transition={{
                    duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
                >
                  Transforme sua
                </motion.span>
                <motion.span
                  className={`block ${isDark ? 'text-white' : 'text-slate-800'}`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  Gestão da Qualidade
                </motion.span>
            </motion.h2>
            
              <motion.p
                className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}
                style={{ fontFamily: 'Inter, sans-serif' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                Plataforma enterprise para controle total da qualidade
              </motion.p>
            </motion.div>
            
            {/* Animated Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="mt-8"
            >
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "99.9%", label: "Uptime", icon: "⚡" },
                  { value: "500+", label: "Empresas", icon: "🏢" },
                  { value: "24/7", label: "Suporte", icon: "🛡️" }
                ].map((stat, index) => (
                <motion.div
                  key={index}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 1.4 + index * 0.2,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                    className={`bg-gradient-to-br ${isDark ? 'from-slate-700/20 to-slate-800/20' : 'from-slate-200/20 to-slate-300/20'} backdrop-blur-md rounded-xl p-4 border ${isDark ? 'border-slate-600/60' : 'border-slate-300/60'} text-center group relative overflow-hidden`}
                  >
                    {/* Hover Glow Effect */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r from-slate-500/0 via-slate-500/10 to-slate-500/0 opacity-0 group-hover:opacity-100`}
                      animate={{
                        x: ['-100%', '100%']
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    <div className="relative z-10">
                      <motion.div
                        className="text-2xl mb-2"
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.5
                        }}
                      >
                        {stat.icon}
                      </motion.div>
                      <motion.div
                        className="text-2xl font-bold text-white mb-1"
                        animate={{
                          textShadow: [
                            "0 0 5px rgba(255,255,255,0.3)",
                            "0 0 10px rgba(255,255,255,0.5)",
                            "0 0 5px rgba(255,255,255,0.3)"
                          ]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.3
                        }}
                      >
                        {stat.value}
                      </motion.div>
                      <div className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-xs font-medium`} style={{ fontFamily: 'Inter, sans-serif' }}>
                        {stat.label}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Animated Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2.0 }}
              className="mt-8"
            >
              <motion.div
                className={`bg-gradient-to-r ${isDark ? 'from-slate-700/20 to-slate-800/20' : 'from-slate-200/20 to-slate-300/20'} backdrop-blur-md rounded-xl p-6 border ${isDark ? 'border-slate-600/40' : 'border-slate-300/40'} relative overflow-hidden`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-slate-400 rounded-full"
                      style={{
                        left: `${20 + i * 10}%`,
                        top: `${30 + (i % 3) * 20}%`
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                        y: [0, -20, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.4,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
                
                <div className="relative z-10">
                  <motion.h3 
                    className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'} mb-3`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    animate={{
                      textShadow: [
                        "0 0 0px rgba(255,255,255,0)",
                        "0 0 8px rgba(255,255,255,0.1)",
                        "0 0 0px rgba(255,255,255,0)"
                      ]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    ✨ Tecnologia de Ponta
                  </motion.h3>
                  <div className="space-y-2">
                    {[
                      "IA e Machine Learning avançado",
                      "Integração com SAP, TOTVS e ERPs",
                      "Compliance ISO 9001, IATF, Inmetro"
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: 2.2 + index * 0.2 
                        }}
                        className="flex items-center space-x-2"
                      >
                        <motion.div
                          className={`w-1.5 h-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'} rounded-full`}
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.3
                          }}
                        />
                        <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm`} style={{ fontFamily: 'Inter, sans-serif' }}>{feature}</span>
                </motion.div>
              ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Elegant Quote */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.8 }}
              className="mt-8 text-center"
            >
              {/* Quote Text */}
              <motion.div className="mb-6">
                <motion.p
                  className={`${isDark ? 'text-white' : 'text-slate-800'} text-xl font-light leading-relaxed mb-2`}
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '0.01em'
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 3.0 }}
                >
                  "A qualidade não é um ato,
                </motion.p>
                <motion.p
                  className={`${isDark ? 'text-white' : 'text-slate-800'} text-xl font-light leading-relaxed`}
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '0.01em'
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 3.2 }}
                >
                  é um hábito."
                </motion.p>
              </motion.div>

              {/* Author */}
              <motion.div
                className="flex items-center justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 3.4 }}
              >
                <div className={`w-6 h-px ${isDark ? 'border-slate-600' : 'border-slate-300'} mr-3`}></div>
                <span
                  className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm font-medium tracking-wide`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Enso
                </span>
                <div className={`w-6 h-px ${isDark ? 'border-slate-600' : 'border-slate-300'} ml-3`}></div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
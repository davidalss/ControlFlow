import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { LogoWithText, Logo } from "@/components/Logo";
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Animated background particles with more complex patterns
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, speed: number, angle: number, opacity: number}>>([]);
  const [gridLines, setGridLines] = useState<Array<{id: number, x: number, y: number, length: number, angle: number}>>([]);

  useEffect(() => {
    // Create animated particles with more complex movement
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 0.5 + 0.2,
      angle: Math.random() * 360,
      opacity: Math.random() * 0.5 + 0.3
    }));
    setParticles(newParticles);

    // Create grid lines for cyber effect
    const newGridLines = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      length: Math.random() * 30 + 20,
      angle: Math.random() * 360
    }));
    setGridLines(newGridLines);

    // Animate particles
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + Math.cos(particle.angle * Math.PI / 180) * particle.speed) % 100,
        y: (particle.y + Math.sin(particle.angle * Math.PI / 180) * particle.speed) % 100,
        angle: particle.angle + 0.5
      })));
    }, 50);

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

  // Mouse tracking removed to fix black square issue

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedLogin(true);
    
    if (!isValidEmail || !isValidPassword) {
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Save token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${data.user.name}!`,
        });

        // Force navigation
        window.location.href = '/dashboard';
      } else {
        const error = await response.json();
        toast({
          title: "Erro no login",
          description: error.message || "Credenciais inválidas",
          variant: "destructive",
        });
      }
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: 'admin@controlflow.com', 
          password: 'admin123' 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Save token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast({
          title: "Login demo realizado com sucesso!",
          description: `Bem-vindo, ${data.user.name}!`,
        });

        // Force navigation
        window.location.href = '/dashboard';
      } else {
        const error = await response.json();
        toast({
          title: "Erro no login demo",
          description: error.message || "Erro ao fazer login demo",
          variant: "destructive",
        });
      }
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
    <div className="min-h-screen login-background">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-tertiary/20" />
        
        {/* Animated Grid Pattern */}
        <div className="login-grid" />
        
        {/* Floating Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
            }}
          />
        ))}

        {/* Grid Lines */}
        {gridLines.map((line) => (
          <motion.div
            key={line.id}
            className="absolute bg-primary/20"
            style={{
              left: `${line.x}%`,
              top: `${line.y}%`,
              width: line.length,
              height: 1,
              transform: `rotate(${line.angle}deg)`,
              transformOrigin: '0 0',
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scaleX: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: line.id * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}

                 {/* Industrial Gears */}
         <motion.div
           className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-xl orbital-circle"
         />
         <motion.div
           className="absolute bottom-20 right-20 w-40 h-40 bg-secondary/10 rounded-full blur-xl orbital-circle"
         />
         <motion.div
           className="absolute top-1/2 left-1/2 w-24 h-24 bg-primary/5 rounded-full blur-lg orbital-circle"
         />

         {/* Industrial Data Streams */}
         <div className="data-stream" style={{ left: '10%', animationDelay: '0s' }} />
         <div className="data-stream" style={{ left: '30%', animationDelay: '2s' }} />
         <div className="data-stream" style={{ left: '50%', animationDelay: '4s' }} />
         <div className="data-stream" style={{ left: '70%', animationDelay: '6s' }} />
         <div className="data-stream" style={{ left: '90%', animationDelay: '8s' }} />

         {/* Quality Control Indicators */}
         <div className="quality-indicator" style={{ top: '15%', left: '15%' }} />
         <div className="quality-indicator" style={{ top: '25%', right: '20%' }} />
         <div className="quality-indicator" style={{ bottom: '30%', left: '25%' }} />
         <div className="quality-indicator" style={{ bottom: '20%', right: '15%' }} />

         {/* Industrial Progress Bars */}
         <div className="progress-bar" style={{ top: '10%', left: '5%', width: '20%' }} />
         <div className="progress-bar" style={{ top: '20%', right: '10%', width: '25%' }} />
         <div className="progress-bar" style={{ bottom: '15%', left: '10%', width: '30%' }} />
         <div className="progress-bar" style={{ bottom: '25%', right: '5%', width: '15%' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 login-container">
        <div className="w-full max-w-md login-content">
          {/* Logo and Title */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-center mb-8"
          >
            <motion.div 
              className="flex justify-center mb-6 logo-container"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            >
              <LogoWithText size="xl" animated={true} />
            </motion.div>
            
            <motion.div 
              className="mt-6 flex justify-center space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                className="flex items-center space-x-1 text-blue-200 text-caption badge font-medium drop-shadow-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Qualidade</span>
              </motion.div>
              <div className="w-px h-4 bg-blue-300" />
              <motion.div 
                className="flex items-center space-x-1 text-blue-200 text-caption badge font-medium drop-shadow-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Inovação</span>
              </motion.div>
              <div className="w-px h-4 bg-blue-300" />
              <motion.div 
                className="flex items-center space-x-1 text-blue-200 text-caption badge font-medium drop-shadow-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Controle</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          >
            <Card className="login-card">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-title-secondary text-gray-900 font-bold">
                  Acesse sua conta
                </CardTitle>
                <p className="text-body text-gray-600">
                  Entre com suas credenciais para continuar
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-4">
                                     {/* Email Field */}
                   <div className="space-y-2">
                     <Label htmlFor="email" className="text-gray-800 font-semibold text-sm">
                       Email
                     </Label>
                     <div className="relative">
                       <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                       <Input
                         id="email"
                         type="email"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                                                   className={`pl-10 pr-8 login-input ${hasAttemptedLogin && email && !isValidEmail ? 'border-red-500 focus:border-red-500' : ''}`}
                         placeholder="seu@email.com"
                         required
                       />
                                               <AnimatePresence>
                          {email && email.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0 }}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-5 h-5"
                            >
                              {isValidEmail ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-red-500" />
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                     </div>
                     {hasAttemptedLogin && email && !isValidEmail && (
                       <motion.p
                         initial={{ opacity: 0, y: -10 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="text-red-500 text-xs mt-1 flex items-center"
                       >
                         <AlertCircle className="w-3 h-3 mr-1" />
                         Digite um email válido (ex: usuario@exemplo.com)
                       </motion.p>
                     )}
                   </div>

                                     {/* Password Field */}
                   <div className="space-y-2">
                     <Label htmlFor="password" className="text-gray-800 font-semibold text-sm">
                       Senha
                     </Label>
                     <div className="relative">
                       <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                       <Input
                         id="password"
                         type={showPassword ? "text" : "password"}
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                                                   className={`pl-10 pr-14 login-input ${hasAttemptedLogin && password && !isValidPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                         placeholder="••••••••"
                         required
                       />
                       <button
                         type="button"
                         onClick={() => setShowPassword(!showPassword)}
                         className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors bg-transparent border-none p-1 rounded flex items-center justify-center"
                       >
                         {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                       </button>
                                               <AnimatePresence>
                          {password && password.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0 }}
                              className="absolute right-10 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-5 h-5"
                            >
                              {isValidPassword ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-red-500" />
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                     </div>
                     {hasAttemptedLogin && password && !isValidPassword && (
                       <motion.p
                         initial={{ opacity: 0, y: -10 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="text-red-500 text-xs mt-1 flex items-center"
                       >
                         <AlertCircle className="w-3 h-3 mr-1" />
                         A senha deve ter pelo menos 6 caracteres
                       </motion.p>
                     )}
                   </div>

                  {/* Login Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                                         <Button
                       type="submit"
                       disabled={isLoading}
                       className="w-full login-button font-semibold py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed text-button"
                     >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full loading-spinner" />
                          <span>Entrando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <span>Entrar</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </form>

                {/* Demo Login */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-primary/20" />
                  </div>
                                     <div className="relative flex justify-center text-sm">
                     <span className="px-2 bg-white text-blue-600 font-semibold">ou</span>
                   </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                                                       <Button
                    onClick={handleDemoLogin}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full border-blue-600 text-blue-700 hover:bg-blue-50 hover:border-blue-700 transition-all duration-300 text-button bg-white font-semibold shadow-md"
                  >
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-semibold text-blue-700">Login Demo</span>
                    </div>
                  </Button>
                </motion.div>

                {/* Demo Credentials */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-center"
                >
                                     <p className="text-blue-200 text-caption drop-shadow-sm">
                     <strong>Demo:</strong> admin@controlflow.com / admin123
                   </p>
                </motion.div>
              </CardContent>
            </Card>

            {/* Footer */}
            <motion.div 
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <p className="text-blue-200 text-caption drop-shadow-sm">
                © 2024 QualiHub. Todos os direitos reservados.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
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
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
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

  // Mouse tracking for light effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
      
      // Update CSS variables for the light effect
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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

        {/* Animated Circles */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-secondary/10 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
            x: [0, -60, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-24 h-24 bg-primary/5 rounded-full blur-lg"
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.2, 0.5, 0.2],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 login-container">
        <div className="w-full max-w-md login-content">
          {/* Logo and Title */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-6 logo-container">
              <Logo size="xl" animated={true} />
            </div>
            
                          <h1 className="text-title-primary text-primary mb-3 title-text">
                QualiHub
              </h1>
            
                          <p className="text-body text-secondary font-medium subtitle-text">
                Controle e Inovação na Gestão da Qualidade
              </p>
            
                          <div className="mt-4 flex justify-center space-x-4">
                <div className="flex items-center space-x-1 text-primary text-caption badge">
                  <CheckCircle className="w-4 h-4" />
                  <span>Qualidade</span>
                </div>
                <div className="w-px h-4 bg-primary/30" />
                <div className="flex items-center space-x-1 text-secondary text-caption badge">
                  <CheckCircle className="w-4 h-4" />
                  <span>Inovação</span>
                </div>
                <div className="w-px h-4 bg-secondary/30" />
                <div className="flex items-center space-x-1 text-primary text-caption badge">
                  <CheckCircle className="w-4 h-4" />
                  <span>Controle</span>
                </div>
              </div>
          </motion.div>

          {/* Login Card */}
          <div>
            <Card className="login-card">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-title-secondary text-primary">
                  Acesse sua conta
                </CardTitle>
                <p className="text-body text-secondary">
                  Entre com suas credenciais para continuar
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-primary font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 login-input"
                        placeholder="seu@email.com"
                        required
                      />
                      <AnimatePresence>
                        {isValidEmail && email && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            <CheckCircle className="w-4 h-4 text-success" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-primary font-medium">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-4 h-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 login-input"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <AnimatePresence>
                        {isValidPassword && password && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="absolute right-10 top-1/2 transform -translate-y-1/2"
                          >
                            <CheckCircle className="w-4 h-4 text-success" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Login Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={isLoading || !isValidEmail || !isValidPassword}
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
                    <span className="px-2 bg-secondary/80 text-secondary">ou</span>
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
                    className="w-full border-primary/20 text-primary hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 text-button"
                  >
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Login Demo</span>
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
                  <p className="text-secondary text-caption">
                    <strong>Demo:</strong> admin@controlflow.com / admin123
                  </p>
                </motion.div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-secondary text-caption">
                © 2024 QualiHub. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
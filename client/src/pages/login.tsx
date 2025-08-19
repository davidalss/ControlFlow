import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import EnsoSnakeLogo from '@/components/EnsoSnakeLogo';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

// Componente para partículas flutuantes
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-stone-400 to-stone-600 rounded-full opacity-20 animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 3}s`
          }}
        />
      ))}
    </div>
  );
};

// Componente para animação de sombras no fundo
const AnimatedShadows = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Sombra principal animada */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-stone-300/10 to-transparent rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-bl from-stone-400/8 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      
      {/* Sombras secundárias */}
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-stone-500/5 to-transparent rounded-full blur-2xl animate-float-slow" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-t from-stone-600/6 to-transparent rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '1.5s' }} />
      
      {/* Sombra sutil no centro */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-stone-700/3 to-stone-500/3 rounded-full blur-2xl animate-pulse-very-slow" />
    </div>
  );
};

// Componente para mostrar o significado do ENSO
const EnsoMeaning = () => {
  return (
    <div className="text-center mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-2 bg-stone-100/50 dark:bg-stone-800/50 rounded-lg">
          <div className="font-semibold text-stone-800 dark:text-stone-200">E</div>
          <div className="text-stone-600 dark:text-stone-400">Excelência</div>
        </div>
        <div className="p-2 bg-stone-100/50 dark:bg-stone-800/50 rounded-lg">
          <div className="font-semibold text-stone-800 dark:text-stone-200">N</div>
          <div className="text-stone-600 dark:text-stone-400">Nexo</div>
        </div>
        <div className="p-2 bg-stone-100/50 dark:bg-stone-800/50 rounded-lg">
          <div className="font-semibold text-stone-800 dark:text-stone-200">S</div>
          <div className="text-stone-600 dark:text-stone-400">Simplicidade</div>
        </div>
        <div className="p-2 bg-stone-100/50 dark:bg-stone-800/50 rounded-lg">
          <div className="font-semibold text-stone-800 dark:text-stone-200">O</div>
          <div className="text-stone-600 dark:text-stone-400">Otimização</div>
        </div>
      </div>
    </div>
  );
};



export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme } = useTheme();
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !loading) {
      navigate('/app');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao ENSO!",
      });
    } catch (error: any) {
      let errorMessage = "Erro ao fazer login. Tente novamente.";
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha incorretos.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Email não confirmado. Verifique sua caixa de entrada.";
      } else if (error.message.includes("Too many requests")) {
        errorMessage = "Muitas tentativas. Aguarde um momento.";
      } else if (error.message.includes("User not found")) {
        errorMessage = "Usuário não encontrado.";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200 dark:from-stone-950 dark:via-stone-900 dark:to-stone-800 relative overflow-hidden">
      <AnimatedShadows />
      <FloatingParticles />
      
      {/* Header minimalista */}
      <header className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {/* Logo centralizada */}
          <div className="text-center mb-8">
            <EnsoSnakeLogo size={80} showText={true} variant="animated" />
          </div>

          {/* Hero Section */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-700 via-stone-600 to-stone-500">
                Sistema ENSO
              </span>
            </h1>
            <p className="text-stone-600 dark:text-stone-400">
              Faça login para acessar sua conta
            </p>
          </div>

          {/* ENSO Meaning */}
          <EnsoMeaning />

          {/* Login Form */}
          <Card className="border border-stone-200/20 shadow-2xl bg-white/10 backdrop-blur-md">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-stone-800 dark:text-stone-200">Entrar</CardTitle>
              <CardDescription className="text-stone-600 dark:text-stone-400">
                Digite suas credenciais para acessar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-stone-700 dark:text-stone-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className={`pl-10 border-2 bg-stone-50/50 dark:bg-stone-800/50 border-stone-200/20 text-stone-800 dark:text-stone-200 placeholder-stone-500 focus:border-stone-400 focus:bg-stone-50 dark:focus:bg-stone-800 transition-all ${
                        error ? 'border-red-300' : ''
                      }`}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-stone-700 dark:text-stone-300">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha"
                      className={`pl-10 pr-10 border-2 bg-stone-50/50 dark:bg-stone-800/50 border-stone-200/20 text-stone-800 dark:text-stone-200 placeholder-stone-500 focus:border-stone-400 focus:bg-stone-50 dark:focus:bg-stone-800 transition-all ${
                        error ? 'border-red-300' : ''
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-stone-600 to-stone-700 hover:from-stone-700 hover:to-stone-800 text-white font-semibold py-3 transform hover:scale-105 transition-all duration-200 shadow-lg border-0"
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 text-stone-600 dark:text-stone-400 text-sm">
            <p>© 2024 ENSO • Nossa Essência</p>
          </div>
        </div>
      </main>
    </div>
  );
}
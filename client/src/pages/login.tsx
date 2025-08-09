import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao Sistema de Controle de Qualidade WAP",
      });
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Email ou senha inválidos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50">
      <div className="max-w-md w-full">
        {/* WAP Logo and Branding */}
        <div className="text-center mb-8">
          <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="material-icons text-2xl">precision_manufacturing</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">Sistema de Controle de Qualidade</h1>
          <p className="text-neutral-600">WAP - Gestão Integrada de Inspeções</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  E-mail
                </Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  placeholder="seu.email@wap.com.br"
                  required
                />
              </div>
              
              <div className="mb-6">
                <Label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Senha
                </Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <span className="material-icons mr-2">login</span>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <a href="#" className="text-sm text-primary hover:text-primary/80">
                Esqueceu sua senha?
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center mt-6 text-xs text-neutral-500">
          <p>Acesso seguro com autenticação JWT • Sessão expira automaticamente</p>
        </div>
      </div>
    </div>
  );
}

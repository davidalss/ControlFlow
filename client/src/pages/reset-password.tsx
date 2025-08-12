import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast({ title: "Erro", description: "Token de redefinição não encontrado.", variant: "destructive" });
      navigate('/login');
    }
  }, [searchParams, navigate, toast]);

  const resetPasswordMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/auth/reset-password', data),
    onSuccess: () => {
      toast({ 
        title: "Senha Redefinida com Sucesso", 
        description: "Você já pode fazer login com sua nova senha."
      });
      navigate('/login');
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao Redefinir Senha", 
        description: error.message || "Token inválido ou expirado. Por favor, solicite um novo link.", 
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    if (!token) return;

    resetPasswordMutation.mutate({ token, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50">
      <div className="max-w-md w-full">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Redefinir sua Senha</CardTitle>
            <CardDescription>Escolha uma nova senha para sua conta.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Nova Senha</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!password || password !== confirmPassword || resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? "Salvando..." : "Salvar Nova Senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

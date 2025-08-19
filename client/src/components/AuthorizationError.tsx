import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthorizationErrorProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
}

export default function AuthorizationError({ 
  title = "Acesso Negado", 
  message = "Você não tem permissão para acessar esta página.",
  showHomeButton = true 
}: AuthorizationErrorProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900 p-4">
      <Card className="w-full max-w-md border-red-200 dark:border-red-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl font-bold text-red-800 dark:text-red-200">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-stone-600 dark:text-stone-400">
            <AlertTriangle className="w-4 h-4" />
            <p>{message}</p>
          </div>
          
          {showHomeButton && (
            <Button 
              onClick={() => navigate('/app')}
              className="w-full bg-stone-600 hover:bg-stone-700 text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          )}
          
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Se você acredita que deveria ter acesso a esta página, entre em contato com o administrador.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

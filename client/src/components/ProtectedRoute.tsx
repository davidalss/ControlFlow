import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  console.log('=== PROTECTED ROUTE ===');
  console.log('Loading:', loading);
  console.log('User:', user);
  console.log('Current pathname:', window.location.pathname);

  if (loading) {
    console.log('Mostrando tela de loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
          <p className="text-stone-600 dark:text-stone-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('Usuário não autenticado, redirecionando para login...');
    return <Navigate to="/login" replace />;
  }

  console.log('Usuário autenticado, renderizando conteúdo...');
  return <>{children}</>;
}

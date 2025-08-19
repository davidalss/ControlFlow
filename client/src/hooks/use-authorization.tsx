import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';

interface UseAuthorizationOptions {
  requiredRoles?: string[];
  requiredPermissions?: string[];
}

interface AuthorizationResult {
  isAuthorized: boolean;
  isLoading: boolean;
  error: string | null;
  userRole: string | undefined;
}

export function useAuthorization(options: UseAuthorizationOptions = {}): AuthorizationResult {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthorization = () => {
      setIsLoading(true);
      setError(null);

      // Se não há usuário, não está autorizado
      if (!user) {
        setError('Usuário não autenticado');
        setIsLoading(false);
        return;
      }

      // Se não há roles requeridos, está autorizado
      if (!options.requiredRoles || options.requiredRoles.length === 0) {
        setIsLoading(false);
        return;
      }

      // Verificar se o usuário tem um dos roles requeridos
      const hasRequiredRole = options.requiredRoles.includes(user.role || '');
      
      if (!hasRequiredRole) {
        setError(`Acesso negado. Roles permitidos: ${options.requiredRoles.join(', ')}`);
      }

      setIsLoading(false);
    };

    checkAuthorization();
  }, [user, options.requiredRoles, options.requiredPermissions]);

  return {
    isAuthorized: !error && !isLoading,
    isLoading,
    error,
    userRole: user?.role
  };
}

// Hook para verificar se o usuário tem um role específico
export function useHasRole(role: string): boolean {
  const { user } = useAuth();
  return user?.role === role;
}

// Hook para verificar se o usuário tem pelo menos um dos roles
export function useHasAnyRole(roles: string[]): boolean {
  const { user } = useAuth();
  return roles.includes(user?.role || '');
}

// Hook para verificar se o usuário é admin
export function useIsAdmin(): boolean {
  return useHasRole('admin');
}

// Hook para verificar se o usuário é inspetor
export function useIsInspector(): boolean {
  return useHasRole('inspector');
}

// Hook para verificar se o usuário é engenharia
export function useIsEngineering(): boolean {
  return useHasRole('engineering');
}

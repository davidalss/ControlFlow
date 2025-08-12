import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";

// Interface do usuário logado no sistema
interface User {
  id: string;
  email: string;
  name: string;
  role: string; // inspector, engineering, manager, block_control
  photo?: string; // URL da foto do usuário
  businessUnit?: string;
}

// Interface do contexto de autenticação
interface AuthContextType {
  user: User | null; // Dados do usuário logado ou null se não logado
  login: (email: string, password: string) => Promise<void>; // Função para fazer login
  logout: () => void; // Função para fazer logout
  loading: boolean; // Estado de carregamento durante verificação inicial
  updateUser: (updates: Partial<User>) => void; // Atualiza dados do usuário no contexto
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider de autenticação que gerencia estado do usuário logado
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Efeito que roda na inicialização para verificar se já existe um token salvo
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Se tem token, verifica se ainda é válido fazendo requisição para /api/auth/me
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(async res => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          if (typeof window !== 'undefined') window.location.href = '/login';
          return { user: null } as any;
        }
        return res.json();
      })
      .then(data => {
        if (data.user) {
          setUser(data.user); // Token válido, usuário logado
        } else {
          localStorage.removeItem('token'); // Token inválido, remove
          if (typeof window !== 'undefined') window.location.href = '/login';
        }
      })
      .catch(() => {
        localStorage.removeItem('token'); // Erro na requisição, remove token
        if (typeof window !== 'undefined') window.location.href = '/login';
      })
      .finally(() => {
        setLoading(false); // Para o loading independente do resultado
      });
    } else {
      setLoading(false); // Sem token, para o loading
    }
  }, []);

  // Função para fazer login - envia email e senha para a API
  const login = async (email: string, password: string) => {
    const response = await apiRequest('POST', '/api/auth/login', { email, password });
    const data = await response.json();
    
    setUser(data.user); // Salva dados do usuário no estado
    localStorage.setItem('token', data.token); // Salva o token JWT no navegador
  };

  // Atualiza usuário parcialmente (ex.: foto)
  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };


  // Função para fazer logout - limpa dados do usuário e token
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para acessar o contexto de autenticação em qualquer componente
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

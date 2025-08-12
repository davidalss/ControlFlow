import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";

// Interface do usuário logado no sistema
interface User {
  id: string;
  email: string;
  name: string;
  role: string; // inspector, engineering, manager, block_control
  avatar?: string; // URL da foto do usuário
}

// Interface do contexto de autenticação
interface AuthContextType {
  user: User | null; // Dados do usuário logado ou null se não logado
  login: (email: string, password: string) => Promise<void>; // Função para fazer login
  logout: () => void; // Função para fazer logout
  loading: boolean; // Estado de carregamento durante verificação inicial
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
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user); // Token válido, usuário logado
        } else {
          localStorage.removeItem('token'); // Token inválido, remove
        }
      })
      .catch(() => {
        localStorage.removeItem('token'); // Erro na requisição, remove token
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

  // Função para fazer logout - limpa dados do usuário e token
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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

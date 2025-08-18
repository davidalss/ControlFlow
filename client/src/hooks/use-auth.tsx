import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// Interface do usuário logado no sistema
interface User {
  id: string;
  email: string;
  name?: string;
  role?: string; // inspector, engineering, manager, block_control
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

  // Função para buscar dados do perfil do usuário
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('Erro ao buscar perfil do usuário:', profileError);
      }

      return profile;
    } catch (error) {
      console.warn('Erro ao buscar perfil do usuário:', error);
      return null;
    }
  };

  // Função para processar dados do usuário
  const processUserData = async (supabaseUser: any) => {
    const profile = await fetchUserProfile(supabaseUser.id);

    const userData: User = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: profile?.name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || '',
      role: profile?.role || 'inspector',
      photo: profile?.photo || supabaseUser.user_metadata?.avatar_url,
      businessUnit: profile?.business_unit
    };

    console.log('Dados do usuário processados:', userData);
    return userData;
  };

  // Efeito que roda na inicialização para verificar se já existe uma sessão do Supabase
  useEffect(() => {
    // Verifica se há uma sessão ativa do Supabase
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          const userData = await processUserData(session.user);
          setUser(userData);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const userData = await processUserData(session.user);
          setUser(userData);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Função para fazer login usando Supabase Auth
  const login = async (email: string, password: string) => {
    console.log('Iniciando login com Supabase...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('Resposta do Supabase:', { data, error });

    if (error) {
      console.error('Erro do Supabase:', error);
      throw error;
    }

    // O onAuthStateChange vai cuidar de processar os dados do usuário
    console.log('Login realizado com sucesso, aguardando processamento...');
  };

  // Atualiza usuário parcialmente (ex.: foto)
  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  // Função para fazer logout usando Supabase Auth
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

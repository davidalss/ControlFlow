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
    console.log('Buscando perfil do usuário:', userId);
    try {
      // Adiciona timeout para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: profile, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      console.log('Resposta da busca de perfil:', { profile, profileError });

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('Erro ao buscar perfil do usuário:', profileError);
      }

      return profile;
    } catch (error) {
      console.warn('Erro ao buscar perfil do usuário (usando fallback):', error);
      return null;
    }
  };

  // Função para processar dados do usuário
  const processUserData = async (supabaseUser: any) => {
    console.log('Processando dados do usuário:', supabaseUser);
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
    console.log('=== INICIANDO VERIFICAÇÃO DE AUTENTICAÇÃO ===');
    
    // Verifica se há uma sessão ativa do Supabase
    const getSession = async () => {
      try {
        console.log('Verificando sessão existente...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          setLoading(false);
          return;
        }

        console.log('Sessão encontrada:', session);
        
        if (session?.user) {
          console.log('Usuário encontrado na sessão:', session.user);
          const userData = await processUserData(session.user);
          console.log('Dados do usuário processados:', userData);
          setUser(userData);
        } else {
          console.log('Nenhuma sessão ativa encontrada');
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        console.log('Finalizando verificação inicial...');
        setLoading(false);
      }
    };

    getSession();

    // Listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== MUDANÇA DE ESTADO DE AUTENTICAÇÃO ===');
        console.log('Evento:', event);
        console.log('Sessão:', session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('Processando SIGNED_IN...');
          const userData = await processUserData(session.user);
          console.log('Definindo usuário no estado:', userData);
          setUser(userData);
          console.log('Usuário definido com sucesso');
        } else if (event === 'SIGNED_OUT') {
          console.log('Processando SIGNED_OUT...');
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token atualizado, mantendo usuário...');
        }
        
        console.log('Finalizando loading...');
        setLoading(false);
        console.log('Processo de autenticação concluído');
      }
    );

    return () => {
      console.log('Limpando listener de autenticação...');
      subscription.unsubscribe();
    };
  }, []);

  // Função para fazer login usando Supabase Auth
  const login = async (email: string, password: string) => {
    console.log('Iniciando login com Supabase...');
    
    try {
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
    } catch (error) {
      console.error('Erro durante o login:', error);
      throw error;
    }
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

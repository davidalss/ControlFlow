import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// Função para obter URL da foto do perfil do Supabase Storage
const getProfilePhotoUrl = (userId: string): string => {
  const { data } = supabase.storage
    .from('ENSOS')
    .getPublicUrl(`FOTOS_PERFIL/${userId}/avatar.jpg`);
  
  return data.publicUrl || '';
};

// Interface do usuário logado no sistema
interface User {
  id: string;
  email: string;
  name?: string;
  role?: string; // inspector, engineering, manager, block_control
  photo?: string; // URL da foto do usuário
  businessUnit?: string;
  created_at?: string; // Data de criação da conta
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
    
    // Temporariamente desabilitar busca de perfil para evitar erro 404
    console.log('Busca de perfil desabilitada temporariamente');
    return null;
    
    /*
    try {
      console.log('Executando query na tabela users...');
      const { data: profile, error } = await supabase
        .from('users')
        .select('name, role, photo, business_unit')
        .eq('id', userId)
        .maybeSingle();

      console.log('Query executada. Resultado:', { profile, error });

      // 42501 (permission denied) ou 403: tabela protegida por RLS sem policy para usuário
      if (error && (error.code === '42501' || (error as any).status === 403)) {
        console.warn('Sem permissão para ler a tabela users (RLS). Usando dados básicos do auth.');
        return null;
      }

      // PGRST116: No rows returned (usuário não encontrado)
      if (error && error.code === 'PGRST116') {
        console.warn('Usuário não encontrado na tabela users. Usando dados básicos do auth.');
        return null;
      }

      if (error) {
        console.warn('Erro ao buscar perfil do usuário:', error);
        console.warn('Detalhes do erro:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return null;
      }

      console.log('Resposta da busca de perfil:', { profile });
      return profile ?? null;
    } catch (err) {
      console.warn('Erro inesperado ao buscar perfil do usuário. Usando fallback.', err);
      return null;
    }
    */
  };

  // Função para processar dados do usuário
  const processUserData = async (supabaseUser: any) => {
    console.log('Processando dados do usuário:', supabaseUser);
    
    // Usar apenas dados básicos do Supabase Auth
    const userData: User = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuário',
      role: supabaseUser.user_metadata?.role || 'inspector',
      photo: supabaseUser.user_metadata?.avatar_url,
      businessUnit: undefined,
      created_at: supabaseUser.created_at
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
          try {
            const userData = await processUserData(session.user);
            console.log('Dados do usuário processados:', userData);
            setUser(userData);
          } catch (error) {
            console.error('Erro ao processar dados do usuário na sessão:', error);
            // Fallback: criar usuário básico se houver erro
            const photoUrl = getProfilePhotoUrl(session.user.id);
            const fallbackUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
              role: 'inspector',
              photo: photoUrl || session.user.user_metadata?.avatar_url,
              businessUnit: undefined,
              created_at: session.user.created_at
            };
            console.log('Usando usuário fallback na sessão:', fallbackUser);
            setUser(fallbackUser);
          }
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
        console.log('Pathname atual:', window.location.pathname);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('Processando SIGNED_IN...');
          try {
            const userData = await processUserData(session.user);
            console.log('Definindo usuário no estado:', userData);
            setUser(userData);
            console.log('Usuário definido com sucesso');
          } catch (error) {
            console.error('Erro ao processar dados do usuário:', error);
            // Fallback: criar usuário básico se houver erro
            const fallbackUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
              role: 'inspector',
              photo: session.user.user_metadata?.avatar_url,
              businessUnit: undefined,
              created_at: session.user.created_at
            };
            console.log('Usando usuário fallback:', fallbackUser);
            setUser(fallbackUser);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('Processando SIGNED_OUT...');
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token atualizado, mantendo usuário...');
        } else if (event === 'USER_UPDATED') {
          console.log('Usuário atualizado...');
        } else if (event === 'USER_DELETED') {
          console.log('Usuário deletado...');
          setUser(null);
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
    try {
      console.log('Iniciando logout...');
      await supabase.auth.signOut();
      setUser(null);
      console.log('Logout realizado com sucesso');
      
      // Limpar qualquer estado local que possa estar causando problemas
      localStorage.removeItem('enso-user-session');
      sessionStorage.clear();
      
      // Forçar redirecionamento para login
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro durante logout:', error);
      // Mesmo com erro, limpar o estado local
      setUser(null);
      window.location.href = '/login';
    }
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

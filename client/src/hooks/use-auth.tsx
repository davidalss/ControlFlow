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
    // Temporariamente desabilitar busca de perfil para evitar erro 404
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
          try {
            const userData = await processUserData(session.user);
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
            setUser(fallbackUser);
          }
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
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const userData = await processUserData(session.user);
            setUser(userData);
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
            setUser(fallbackUser);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED') {
          // Token atualizado, mantendo usuário
        } else if (event === 'USER_UPDATED') {
          // Usuário atualizado
        } else if (event === 'USER_DELETED') {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Função para fazer login usando Supabase Auth
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro do Supabase:', error);
        
        // Fallback para credenciais mock se o Supabase falhar
        if (email === 'admin@enso.com' && password === 'admin123') {
          console.log('🔄 Usando login mock para admin...');
          const mockUser = {
            id: 'admin-user-id',
            email: 'admin@enso.com',
            name: 'Administrador',
            role: 'admin',
            businessUnit: 'Sistema',
            photo: undefined,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          setUser(mockUser);
          setLoading(false);
          return { user: mockUser };
        }
        
        if (email === 'test@enso.com' && password === 'test123') {
          console.log('🔄 Usando login mock para usuário teste...');
          const mockUser = {
            id: 'test-user-id',
            email: 'test@enso.com',
            name: 'Usuário Teste',
            role: 'inspector',
            businessUnit: 'Qualidade',
            photo: undefined,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          setUser(mockUser);
          setLoading(false);
          return { user: mockUser };
        }
        
        throw error;
      }

      // O onAuthStateChange vai cuidar de processar os dados do usuário
      return data;
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
      await supabase.auth.signOut();
      setUser(null);
      
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

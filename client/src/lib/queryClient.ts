import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { supabase } from './supabaseClient';

// Função para obter o token do Supabase
const getSupabaseToken = async (): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Erro ao obter token do Supabase:', error);
    return null;
  }
};

// Função para verificar se a resposta HTTP está OK, se não, lança um erro
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    
    // 401 = Não autorizado (token inválido/expirado) - redireciona para login
    if (res.status === 401) {
      console.warn(`Erro de autenticação (401): ${text}`);
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        console.log('Redirecionando para login devido a erro de autenticação');
        window.location.href = '/login';
      }
    }
    
    // 403 = Acesso negado (sem permissão) - não redireciona, apenas mostra erro
    if (res.status === 403) {
      console.warn(`Erro de autorização (403): ${text}`);
      // Não redireciona para login, apenas lança o erro para ser tratado pelo componente
    }
    
    throw new Error(`${res.status}: ${text}`);
  }
}

// Função para fazer requisições à API com autenticação Supabase
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Pega o token de autenticação do Supabase
  const token = await getSupabaseToken();
  
  const res = await fetch(url, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      // Adiciona o token do Supabase no cabeçalho Authorization se existir
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// Define como tratar erros 401 (não autorizado)
type UnauthorizedBehavior = "returnNull" | "throw";

// Função para requisições GET do React Query com autenticação Supabase
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Pega o token de autenticação do Supabase
    const token = await getSupabaseToken();
    
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers: {
        // Adiciona o token do Supabase se existir
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      }
    });

    // Se não autorizado e comportamento é returnNull, retorna null
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.warn(`Erro de autenticação (401) em getQueryFn`);
      // Só redireciona se não estiver já na página de login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        console.log('Redirecionando para login devido a erro de autenticação em getQueryFn');
        window.location.href = '/login';
      }
      return null;
    }
    
    // 403 = Acesso negado (sem permissão) - não redireciona, apenas retorna null
    if (unauthorizedBehavior === "returnNull" && res.status === 403) {
      console.warn(`Erro de autorização (403) em getQueryFn - sem permissão para acessar este recurso`);
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Configuração do cliente React Query para gerenciar estado do servidor
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

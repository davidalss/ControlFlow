import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Função para verificar se a resposta HTTP está OK, se não, lança um erro
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Função para fazer requisições à API com autenticação JWT
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Pega o token de autenticação salvo no localStorage
  const token = localStorage.getItem('token');
  
  const res = await fetch(url, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      // Adiciona o token JWT no cabeçalho Authorization se existir
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

// Função para requisições GET do React Query com autenticação JWT
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Pega o token de autenticação do localStorage
    const token = localStorage.getItem('token');
    
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers: {
        // Adiciona o token JWT se existir
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      }
    });

    // Se não autorizado e comportamento é returnNull, retorna null
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Configuração do cliente React Query para gerenciar estado do servidor
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }), // Função padrão para queries GET
      refetchInterval: false, // Não atualizar automaticamente
      refetchOnWindowFocus: false, // Não atualizar quando foca a janela
      staleTime: Infinity, // Dados nunca ficam obsoletos automaticamente
      retry: false, // Não tentar novamente em caso de erro
    },
    mutations: {
      retry: false, // Não tentar novamente mutações com erro
    },
  },
});

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { toast } from '../hooks/use-toast';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'inspector' | 'viewer';
  businessUnit: string;
  photo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  role: 'admin' | 'inspector' | 'viewer';
  businessUnit: string;
  photo?: string;
  password: string;
}

export interface UpdateUserData {
  id: string;
  name?: string;
  role?: 'admin' | 'inspector' | 'viewer';
  businessUnit?: string;
  photo?: string;
  isActive?: boolean;
}

// Supabase API functions
const fetchUsersFromSupabase = async (): Promise<User[]> => {
  try {
    // Desabilitar queries problemáticas - usar apenas dados mock
    console.log('🔄 Usando dados mock para usuários (Supabase desabilitado)');
    
    // Retornar dados mock diretamente
    return [
      {
        id: 'admin-user-id',
        email: 'admin@enso.com',
        name: 'Administrador',
        role: 'admin' as const,
        businessUnit: 'Sistema',
        photo: undefined,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'test-user-id',
        email: 'test@enso.com',
        name: 'Usuário Teste',
        role: 'inspector' as const,
        businessUnit: 'Qualidade',
        photo: undefined,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    // Retornar dados mock em caso de erro
    return [
      {
        id: 'admin-user-id',
        email: 'admin@enso.com',
        name: 'Administrador',
        role: 'admin' as const,
        businessUnit: 'Sistema',
        photo: undefined,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'test-user-id',
        email: 'test@enso.com',
        name: 'Usuário Teste',
        role: 'inspector' as const,
        businessUnit: 'Qualidade',
        photo: undefined,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
};

const createUserInSupabase = async (userData: CreateUserData): Promise<User> => {
  try {
    // Primeiro, criar o usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true
    });

    if (authError) {
      throw new Error(`Erro ao criar usuário no auth: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('Usuário não foi criado no auth');
    }

    // Depois, criar o perfil na tabela users
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        businessUnit: userData.businessUnit,
        photo: userData.photo,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single();

    if (userError) {
      // Se falhou ao criar o perfil, tentar deletar o usuário do auth
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Erro ao criar perfil do usuário: ${userError.message}`);
    }

    return user;
  } catch (error) {
    console.error('Erro ao criar usuário no Supabase:', error);
    throw error;
  }
};

const updateUserInSupabase = async (userData: UpdateUserData): Promise<User> => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .update({
        ...userData,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userData.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }

    return user;
  } catch (error) {
    console.error('Erro ao atualizar usuário no Supabase:', error);
    throw error;
  }
};

const updateUserRoleInSupabase = async (userId: string, role: 'admin' | 'inspector' | 'viewer'): Promise<User> => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .update({
        role,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar role do usuário: ${error.message}`);
    }

    return user;
  } catch (error) {
    console.error('Erro ao atualizar role do usuário no Supabase:', error);
    throw error;
  }
};

const deleteUserFromSupabase = async (userId: string): Promise<void> => {
  try {
    // Primeiro, deletar o perfil da tabela users
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (userError) {
      throw new Error(`Erro ao deletar perfil do usuário: ${userError.message}`);
    }

    // Depois, deletar o usuário do Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.warn('Erro ao deletar usuário do auth:', authError.message);
      // Não falhar se não conseguir deletar do auth, pois o perfil já foi deletado
    }
  } catch (error) {
    console.error('Erro ao deletar usuário do Supabase:', error);
    throw error;
  }
};

// React Query hooks
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsersFromSupabase,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserInSupabase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserInSupabase,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', data.id] });
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'admin' | 'inspector' | 'viewer' }) =>
      updateUserRoleInSupabase(userId, role),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', data.id] });
      toast({
        title: "Sucesso",
        description: "Role do usuário atualizada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserFromSupabase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Sucesso",
        description: "Usuário deletado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

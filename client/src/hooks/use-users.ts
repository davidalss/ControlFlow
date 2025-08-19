import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  businessUnit?: string;
  photo?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: string;
  businessUnit?: string;
  expiresIn?: '1h' | '1d' | 'permanent';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  businessUnit?: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('GET', '/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: CreateUserData): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('POST', '/api/users', userData);
      const data = await response.json();
      const newUser = data.user;
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar usuário';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, userData: UpdateUserData): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('PUT', `/api/users/${userId}`, userData);
      const updatedUser = await response.json();
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ));
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar usuário';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('PATCH', `/api/users/${userId}/role`, { role });
      const updatedUser = await response.json();
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ));
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar função do usuário';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiRequest('DELETE', `/api/users/${userId}`);
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar usuário';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    updateUserRole,
    deleteUser
  };
}

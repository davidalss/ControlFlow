import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

export interface Group {
  id: string;
  name: string;
  description?: string;
  businessUnit?: string;
  createdBy: string;
  createdAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'member' | 'leader' | 'admin';
  joinedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface CreateGroupData {
  name: string;
  description?: string;
  businessUnit?: string;
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
  businessUnit?: string;
}

export interface AddMemberData {
  userId: string;
  role: 'member' | 'leader' | 'admin';
}

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('GET', '/api/groups');
      const data = await response.json();
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (groupData: CreateGroupData): Promise<Group> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('POST', '/api/groups', groupData);
      const newGroup = await response.json();
      setGroups(prev => [...prev, newGroup]);
      return newGroup;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar grupo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateGroup = async (groupId: string, groupData: UpdateGroupData): Promise<Group> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('PUT', `/api/groups/${groupId}`, groupData);
      const updatedGroup = await response.json();
      setGroups(prev => prev.map(group => 
        group.id === groupId ? updatedGroup : group
      ));
      return updatedGroup;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar grupo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (groupId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiRequest('DELETE', `/api/groups/${groupId}`);
      setGroups(prev => prev.filter(group => group.id !== groupId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar grupo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
    try {
      const response = await apiRequest('GET', `/api/groups/${groupId}/members`);
      const data = await response.json();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao carregar membros do grupo');
    }
  };

  const addGroupMember = async (groupId: string, memberData: AddMemberData): Promise<GroupMember> => {
    try {
      const response = await apiRequest('POST', `/api/groups/${groupId}/members`, memberData);
      const newMember = await response.json();
      return newMember;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao adicionar membro ao grupo');
    }
  };

  const removeGroupMember = async (groupId: string, userId: string): Promise<void> => {
    try {
      await apiRequest('DELETE', `/api/groups/${groupId}/members/${userId}`);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao remover membro do grupo');
    }
  };

  const updateGroupMemberRole = async (groupId: string, userId: string, role: string): Promise<GroupMember> => {
    try {
      const response = await apiRequest('PATCH', `/api/groups/${groupId}/members/${userId}`, { role });
      const updatedMember = await response.json();
      return updatedMember;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar função do membro');
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return {
    groups,
    loading,
    error,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupMembers,
    addGroupMember,
    removeGroupMember,
    updateGroupMemberRole
  };
}

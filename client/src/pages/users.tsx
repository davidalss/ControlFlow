import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuthorization } from "@/hooks/use-authorization";
import AuthorizationError from "@/components/AuthorizationError";
import { useUsers } from "@/hooks/use-users-supabase";
import { useGroups } from "@/hooks/use-groups";
import { 
  Users, UserPlus, Shield, Settings, Mail, 
  MoreHorizontal, Edit, Trash2, Eye, UserCheck,
  Group, Plus, Send, Clock, CheckCircle, XCircle,
  Search, Filter, Download, Upload, RefreshCw,
  ExternalLink, UserX, UserCog, Building2
} from "lucide-react";

// Função utilitária para formatar datas
const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error, dateString);
    return 'Data inválida';
  }
};

// Role definitions with permissions and hierarchy
const roleDefinitions = {
  'temporary_viewer': {
    name: 'Visualizador Temporário',
    description: 'Acesso temporário apenas para visualização',
    permissions: ['read:products', 'read:inspections'],
    color: 'bg-gray-100 text-gray-800',
    level: 1,
    canManageGroups: false
  },
  'assistente': {
    name: 'Assistente',
    description: 'Auxiliar em tarefas básicas',
    permissions: ['read:products', 'read:inspections', 'create:inspections'],
    color: 'bg-blue-100 text-blue-800',
    level: 2,
    canManageGroups: false
  },
  'inspector': {
    name: 'Inspetor',
    description: 'Realiza inspeções de qualidade',
    permissions: ['read:products', 'read:inspections', 'create:inspections', 'update:inspections'],
    color: 'bg-green-100 text-green-800',
    level: 3,
    canManageGroups: false
  },
  'block_control': {
    name: 'Controle de Bloqueio',
    description: 'Gerencia bloqueios e liberações',
    permissions: ['read:products', 'read:inspections', 'create:inspections', 'manage:blocks'],
    color: 'bg-yellow-100 text-yellow-800',
    level: 4,
    canManageGroups: false
  },
  'analista': {
    name: 'Analista',
    description: 'Análise de dados e relatórios',
    permissions: ['read:products', 'read:inspections', 'create:inspections', 'read:reports', 'create:reports'],
    color: 'bg-purple-100 text-purple-800',
    level: 5,
    canManageGroups: false
  },
  'engineering': {
    name: 'Engenharia',
    description: 'Engenheiros de qualidade',
    permissions: ['read:products', 'read:inspections', 'create:inspections', 'manage:plans', 'approve:inspections'],
    color: 'bg-indigo-100 text-indigo-800',
    level: 6,
    canManageGroups: true
  },
  'coordenador': {
    name: 'Coordenador',
    description: 'Coordena equipes e processos',
    permissions: ['read:products', 'read:inspections', 'create:inspections', 'manage:teams', 'approve:inspections'],
    color: 'bg-orange-100 text-orange-800',
    level: 7,
    canManageGroups: true
  },
  'admin': {
    name: 'Administrador',
    description: 'Acesso completo ao sistema',
    permissions: ['*'],
    color: 'bg-red-100 text-red-800',
    level: 8,
    canManageGroups: true
  }
};

const businessUnits = [
  { value: 'DIY', label: 'DIY - Faça você mesmo' },
  { value: 'TECH', label: 'TECH - Tecnologia' },
  { value: 'KITCHEN_BEAUTY', label: 'KITCHEN_BEAUTY - Cozinha e Beleza' },
  { value: 'MOTOR_COMFORT', label: 'MOTOR_COMFORT - Motor e Conforto' },
  { value: 'N/A', label: 'N/A - Não aplicável' }
];

export default function UsersPageNew() {
  const { toast } = useToast();
  const { isAuthorized, isLoading, error } = useAuthorization({
    requiredRoles: ['admin', 'coordenador', 'engineering']
  });
  
  const { users, loading: usersLoading, error: usersError, createUser, updateUser, updateUserRole, deleteUser } = useUsers();
  const { groups, loading: groupsLoading, error: groupsError, createGroup, updateGroup, deleteGroup, getGroupMembers, addGroupMember, removeGroupMember, updateGroupMemberRole } = useGroups();
  
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterBusinessUnit, setFilterBusinessUnit] = useState("all");
  
  // User modals
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'inspector',
    businessUnit: 'N/A',
    expiresIn: 'permanent' as '1h' | '1d' | 'permanent'
  });

  // Group modals
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    businessUnit: 'N/A'
  });

  // Delete confirmation modals
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
  const [showDeleteGroupDialog, setShowDeleteGroupDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [groupToDelete, setGroupToDelete] = useState<any>(null);

  // Group members management
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<any>(null);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMember, setNewMember] = useState({
    userId: '',
    role: 'member' as 'member' | 'leader' | 'admin'
  });

  // Se está carregando, mostra loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600"></div>
      </div>
    );
  }

  // Se não está autorizado, mostra erro de autorização
  if (!isAuthorized) {
    return (
      <AuthorizationError 
        title="Acesso Negado"
        message="Você não tem permissão para acessar a página de usuários."
      />
    );
  }

  // User functions
  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({ 
        title: 'Erro', 
        description: 'Nome, email e senha são obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    try {
      await createUser(newUser);
      setNewUser({ name: '', email: '', password: '', role: 'inspector', businessUnit: 'N/A', expiresIn: 'permanent' });
      setIsCreateUserModalOpen(false);
      toast({ title: 'Usuário criado com sucesso!' });
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error instanceof Error ? error.message : 'Erro ao criar usuário',
        variant: 'destructive'
      });
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    
    try {
      await updateUser(selectedUser.id, {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        businessUnit: newUser.businessUnit
      });
      setIsEditUserModalOpen(false);
      setSelectedUser(null);
      toast({ title: 'Usuário atualizado com sucesso!' });
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error instanceof Error ? error.message : 'Erro ao atualizar usuário',
        variant: 'destructive'
      });
    }
  };

  const openDeleteUserDialog = (user: any) => {
    setUserToDelete(user);
    setShowDeleteUserDialog(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUser(userToDelete.id);
      setShowDeleteUserDialog(false);
      setUserToDelete(null);
      toast({ title: 'Usuário deletado com sucesso!' });
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error instanceof Error ? error.message : 'Erro ao deletar usuário',
        variant: 'destructive'
      });
    }
  };

  const handleQuickRoleUpdate = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      toast({ 
        title: 'Função atualizada!', 
        description: `Função alterada para ${roleDefinitions[newRole as keyof typeof roleDefinitions]?.name || newRole}`
      });
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error instanceof Error ? error.message : 'Erro ao atualizar função',
        variant: 'destructive'
      });
    }
  };

  // Group functions
  const handleCreateGroup = async () => {
    if (!newGroup.name) {
      toast({ 
        title: 'Erro', 
        description: 'Nome do grupo é obrigatório',
        variant: 'destructive'
      });
      return;
    }

    try {
      await createGroup(newGroup);
      setNewGroup({ name: '', description: '', businessUnit: 'N/A' });
      setIsCreateGroupModalOpen(false);
      toast({ title: 'Grupo criado com sucesso!' });
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error instanceof Error ? error.message : 'Erro ao criar grupo',
        variant: 'destructive'
      });
    }
  };

  const handleEditGroup = async () => {
    if (!selectedGroup) return;
    
    try {
      await updateGroup(selectedGroup.id, newGroup);
      setIsEditGroupModalOpen(false);
      setSelectedGroup(null);
      toast({ title: 'Grupo atualizado com sucesso!' });
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error instanceof Error ? error.message : 'Erro ao atualizar grupo',
        variant: 'destructive'
      });
    }
  };

  const openDeleteGroupDialog = (group: any) => {
    setGroupToDelete(group);
    setShowDeleteGroupDialog(true);
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;
    
    try {
      await deleteGroup(groupToDelete.id);
      setShowDeleteGroupDialog(false);
      setGroupToDelete(null);
      toast({ title: 'Grupo deletado com sucesso!' });
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error instanceof Error ? error.message : 'Erro ao deletar grupo',
        variant: 'destructive'
      });
    }
  };

  // Group members functions
  const loadGroupMembers = async (groupId: string) => {
    try {
      const members = await getGroupMembers(groupId);
      setGroupMembers(members);
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error instanceof Error ? error.message : 'Erro ao carregar membros do grupo',
        variant: 'destructive'
      });
    }
  };

  const handleAddMember = async () => {
    if (!selectedGroupForMembers || !newMember.userId) return;
    
    try {
      await addGroupMember(selectedGroupForMembers.id, newMember);
      setShowAddMemberModal(false);
      setNewMember({ userId: '', role: 'member' });
      loadGroupMembers(selectedGroupForMembers.id);
      toast({ title: 'Membro adicionado com sucesso!' });
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error instanceof Error ? error.message : 'Erro ao adicionar membro',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedGroupForMembers) return;
    
    try {
      await removeGroupMember(selectedGroupForMembers.id, userId);
      loadGroupMembers(selectedGroupForMembers.id);
      toast({ title: 'Membro removido com sucesso!' });
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error instanceof Error ? error.message : 'Erro ao remover membro',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateMemberRole = async (userId: string, newRole: string) => {
    if (!selectedGroupForMembers) return;
    
    try {
      await updateGroupMemberRole(selectedGroupForMembers.id, userId, newRole);
      loadGroupMembers(selectedGroupForMembers.id);
      toast({ title: 'Função do membro atualizada!' });
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error instanceof Error ? error.message : 'Erro ao atualizar função',
        variant: 'destructive'
      });
    }
  };

  // Filter functions
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesBusinessUnit = filterBusinessUnit === 'all' || user.businessUnit === filterBusinessUnit;
    return matchesSearch && matchesRole && matchesBusinessUnit;
  });

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gestão de Usuários e Permissões</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie usuários, grupos e permissões do sistema</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setIsCreateUserModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Usuário</span>
          </Button>
          <Button
            onClick={() => setIsCreateGroupModalOpen(true)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Group className="w-4 h-4" />
            <span>Novo Grupo</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Group className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Grupos</p>
                <p className="text-2xl font-bold">{groups.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Unidades de Negócio</p>
                <p className="text-2xl font-bold">{new Set(users.map(u => u.businessUnit)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="groups">Grupos</TabsTrigger>
          <TabsTrigger value="members">Membros</TabsTrigger>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar usuários..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filtrar por função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as funções</SelectItem>
                    {Object.entries(roleDefinitions).map(([key, role]) => (
                      <SelectItem key={key} value={key}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterBusinessUnit} onValueChange={setFilterBusinessUnit}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filtrar por unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as unidades</SelectItem>
                    {businessUnits.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Usuários ({filteredUsers.length})</span>
                <Badge variant="secondary">
                  {users.length} total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                  <span className="ml-2">Carregando usuários...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">ID: {user.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-auto p-1">
                                <Badge className={roleDefinitions[user.role as keyof typeof roleDefinitions]?.color || 'bg-gray-100 text-gray-800'}>
                                  {roleDefinitions[user.role as keyof typeof roleDefinitions]?.name || user.role}
                                </Badge>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem className="text-xs font-medium text-gray-500">
                                Alterar função:
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {Object.entries(roleDefinitions).map(([key, role]) => (
                                <DropdownMenuItem 
                                  key={key}
                                  onClick={() => handleQuickRoleUpdate(user.id, key)}
                                  disabled={user.role === key}
                                  className={user.role === key ? 'bg-gray-100' : ''}
                                >
                                  <div className="flex items-center space-x-2">
                                    <Badge className={role.color} variant="outline">
                                      {role.name}
                                    </Badge>
                                    {user.role === key && (
                                      <span className="text-xs text-green-600">✓ Atual</span>
                                    )}
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {businessUnits.find(u => u.value === user.businessUnit)?.label || user.businessUnit}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedUser(user);
                                  setNewUser({
                                    name: user.name,
                                    email: user.email,
                                    password: '',
                                    role: user.role,
                                    businessUnit: user.businessUnit || 'N/A',
                                    expiresIn: 'permanent'
                                  });
                                  setIsEditUserModalOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar Usuário
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  toast({
                                    title: 'Detalhes do Usuário',
                                    description: `Visualizando detalhes de ${user.name}`,
                                  });
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => openDeleteUserDialog(user)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir Usuário
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {filteredUsers.length === 0 && !usersLoading && (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Nenhum usuário encontrado</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando um novo usuário.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-6">
          {/* Groups content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Grupos ({groups.length})</span>
                <Button onClick={() => setIsCreateGroupModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Grupo
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {groupsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                  <span className="ml-2">Carregando grupos...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groups.map((group) => (
                    <Card key={group.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <p className="text-sm text-gray-600">{group.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Badge variant="outline">
                            {businessUnits.find(u => u.value === group.businessUnit)?.label || group.businessUnit}
                          </Badge>
                          <p className="text-xs text-gray-400">
                            Criado em {formatDate(group.createdAt)}
                          </p>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedGroup(group);
                                setNewGroup({
                                  name: group.name,
                                  description: group.description || '',
                                  businessUnit: group.businessUnit || 'N/A'
                                });
                                setIsEditGroupModalOpen(true);
                              }}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteGroupDialog(group)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {groups.length === 0 && !groupsLoading && (
                <div className="text-center py-8">
                  <Group className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Nenhum grupo encontrado</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comece criando um novo grupo para organizar usuários.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Gerenciar Membros dos Grupos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Seleção de Grupo */}
                <div>
                  <Label htmlFor="group-select">Selecionar Grupo</Label>
                  <Select 
                    value={selectedGroupForMembers?.id || ''} 
                    onValueChange={(groupId) => {
                      const group = groups.find(g => g.id === groupId);
                      setSelectedGroupForMembers(group);
                      if (group) {
                        loadGroupMembers(group.id);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um grupo para gerenciar membros" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lista de Membros */}
                {selectedGroupForMembers && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Membros do Grupo: {selectedGroupForMembers.name}</h3>
                      <Button onClick={() => setShowAddMemberModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Membro
                      </Button>
                    </div>
                    
                    {groupMembers.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Nenhum membro encontrado</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Adicione membros ao grupo para começar.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {groupMembers.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div>
                                <p className="font-medium">{member.user?.name || 'Usuário não encontrado'}</p>
                                <p className="text-sm text-gray-500">{member.user?.email}</p>
                              </div>
                              <Badge variant="outline">{member.role}</Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Select 
                                value={member.role} 
                                onValueChange={(newRole) => handleUpdateMemberRole(member.userId, newRole)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="member">Membro</SelectItem>
                                  <SelectItem value="leader">Líder</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveMember(member.userId)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-6">
          {/* Permissions content */}
          <Card>
            <CardHeader>
              <CardTitle>Permissões por Função</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(roleDefinitions).map(([roleKey, role]) => (
                  <Card key={roleKey}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Badge className={role.color}>{role.name}</Badge>
                        <span className="text-sm text-gray-500">Nível {role.level}</span>
                      </CardTitle>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {role.permissions.map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create User Modal */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsCreateUserModalOpen(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">Criar Novo Usuário</h2>
              <button
                onClick={() => setIsCreateUserModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Crie um novo usuário no sistema. O usuário receberá um email de confirmação.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Digite o nome completo"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Digite o email"
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Digite a senha"
                />
              </div>
              <div>
                <Label htmlFor="role">Função</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleDefinitions).map(([key, role]) => (
                      <SelectItem key={key} value={key}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="businessUnit">Unidade de Negócio</Label>
                <Select value={newUser.businessUnit} onValueChange={(value) => setNewUser({ ...newUser, businessUnit: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessUnits.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newUser.role === 'temporary_viewer' && (
                <div>
                  <Label htmlFor="expiresIn">Expira em</Label>
                  <Select value={newUser.expiresIn} onValueChange={(value) => setNewUser({ ...newUser, expiresIn: value as any })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a duração" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hora</SelectItem>
                      <SelectItem value="1d">1 dia</SelectItem>
                      <SelectItem value="permanent">Permanente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setIsCreateUserModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateUser} disabled={usersLoading}>
                {usersLoading ? 'Criando...' : 'Criar Usuário'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsEditUserModalOpen(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">Editar Usuário</h2>
              <button
                onClick={() => setIsEditUserModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Edite as informações do usuário selecionado.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome completo</Label>
                <Input
                  id="edit-name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Digite o nome completo"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Digite o email"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Função</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleDefinitions).map(([key, role]) => (
                      <SelectItem key={key} value={key}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-businessUnit">Unidade de Negócio</Label>
                <Select value={newUser.businessUnit} onValueChange={(value) => setNewUser({ ...newUser, businessUnit: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessUnits.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setIsEditUserModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditUser} disabled={usersLoading}>
                {usersLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {isCreateGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsCreateGroupModalOpen(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">Criar Novo Grupo</h2>
              <button
                onClick={() => setIsCreateGroupModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Crie um novo grupo para organizar usuários.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="group-name">Nome do Grupo</Label>
                <Input
                  id="group-name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="Digite o nome do grupo"
                />
              </div>
              <div>
                <Label htmlFor="group-description">Descrição</Label>
                <Input
                  id="group-description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Digite a descrição do grupo"
                />
              </div>
              <div>
                <Label htmlFor="group-businessUnit">Unidade de Negócio</Label>
                <Select value={newGroup.businessUnit} onValueChange={(value) => setNewGroup({ ...newGroup, businessUnit: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessUnits.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setIsCreateGroupModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateGroup} disabled={groupsLoading}>
                {groupsLoading ? 'Criando...' : 'Criar Grupo'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {isEditGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsEditGroupModalOpen(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">Editar Grupo</h2>
              <button
                onClick={() => setIsEditGroupModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Edite as informações do grupo selecionado.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-group-name">Nome do Grupo</Label>
                <Input
                  id="edit-group-name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="Digite o nome do grupo"
                />
              </div>
              <div>
                <Label htmlFor="edit-group-description">Descrição</Label>
                <Input
                  id="edit-group-description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Digite a descrição do grupo"
                />
              </div>
              <div>
                <Label htmlFor="edit-group-businessUnit">Unidade de Negócio</Label>
                <Select value={newGroup.businessUnit} onValueChange={(value) => setNewGroup({ ...newGroup, businessUnit: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessUnits.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setIsEditGroupModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditGroup} disabled={groupsLoading}>
                {groupsLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddMemberModal(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">Adicionar Membro ao Grupo</h2>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Adicione um usuário ao grupo "{selectedGroupForMembers?.name}".
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="member-user">Usuário</Label>
                <Select 
                  value={newMember.userId} 
                  onValueChange={(userId) => setNewMember({ ...newMember, userId })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter(user => !groupMembers.some(member => member.userId === user.id))
                      .map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="member-role">Função no Grupo</Label>
                <Select 
                  value={newMember.role} 
                  onValueChange={(role) => setNewMember({ ...newMember, role: role as 'member' | 'leader' | 'admin' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Membro</SelectItem>
                    <SelectItem value="leader">Líder</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddMemberModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddMember} disabled={!newMember.userId}>
                Adicionar Membro
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Dialog */}
      {showDeleteUserDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteUserDialog(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-md w-full z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">Confirmar Exclusão</h2>
              <button
                onClick={() => setShowDeleteUserDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o usuário "{userToDelete?.name}" ({userToDelete?.email})?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteUserDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Group Confirmation Dialog */}
      {showDeleteGroupDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteGroupDialog(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-md w-full z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">Confirmar Exclusão</h2>
              <button
                onClick={() => setShowDeleteGroupDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o grupo "{groupToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteGroupDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteGroup}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

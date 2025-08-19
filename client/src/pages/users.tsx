import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuthorization } from "@/hooks/use-authorization";
import AuthorizationError from "@/components/AuthorizationError";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, UserPlus, Shield, Settings, Mail, 
  MoreHorizontal, Edit, Trash2, Eye, UserCheck,
  Group, Plus, Send, Clock, CheckCircle, XCircle,
  Search, Filter, Download, Upload, RefreshCw,
  ExternalLink
} from "lucide-react";

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  businessUnit?: string;
  groupId?: string;
  createdAt: string;
  expiresAt?: string;
  photo?: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  tag: string;
  memberCount: number;
  createdBy: string;
  createdAt: string;
}

interface Solicitation {
  id: string;
  title: string;
  description: string;
  type: 'inspection' | 'approval' | 'block' | 'analysis' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdBy: string;
  assignedTo?: string;
  assignedGroup?: string;
  dueDate?: string;
  createdAt: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

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

const priorityOptions = [
  { value: 'low', label: 'Baixa', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-800' }
];

export default function UsersPage() {
  const { toast } = useToast();
  const { isAuthorized, isLoading, error } = useAuthorization({
    requiredRoles: ['admin', 'coordenador', 'manager']
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
  const [activeTab, setActiveTab] = useState('users');
  const [currentUserRole, setCurrentUserRole] = useState('admin'); // Mock current user role
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState<Set<string>>(new Set());

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'inspector',
    businessUnit: 'N/A',
    groupId: '',
    expiresIn: 'permanent'
  });

  // Groups state
  const [groups, setGroups] = useState<Group[]>([]);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [isManageGroupMembersOpen, setIsManageGroupMembersOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    tag: ''
  });

  // Solicitations state
  const [solicitations, setSolicitations] = useState<Solicitation[]>([]);
  const [isCreateSolicitationModalOpen, setIsCreateSolicitationModalOpen] = useState(false);
  const [newSolicitation, setNewSolicitation] = useState({
    title: '',
    description: '',
    type: 'general',
    priority: 'medium',
    assignedTo: '',
    assignedGroup: '',
    dueDate: ''
  });

  // Permissions state
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  // Load real data from API
  const loadUsers = async () => {
    setIsPageLoading(true);
    try {
      const response = await apiRequest('GET', '/api/users');
      const data = await response.json();
      console.log('Usuários carregados:', data);
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      // Fallback para dados mock
      loadMockData();
    } finally {
      setIsPageLoading(false);
    }
  };

  // Load mock data as fallback
  const loadMockData = () => {
    setUsers([
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@controlflow.com',
        role: 'admin',
        businessUnit: 'N/A',
        createdAt: '2024-01-01'
      },
      {
        id: '2',
        name: 'Inspector Demo',
        email: 'inspector@controlflow.com',
        role: 'inspector',
        businessUnit: 'DIY',
        createdAt: '2024-01-02'
      }
    ]);

    setGroups([
      {
        id: '1',
        name: 'Equipe DIY',
        description: 'Equipe responsável pelo setor DIY',
        tag: 'QUALIDADE DIY',
        memberCount: 5,
        createdBy: 'Admin User',
        createdAt: '2024-01-01'
      }
    ]);

    setSolicitations([
      {
        id: '1',
        title: 'Inspeção Urgente - Produto XYZ',
        description: 'Necessária inspeção urgente do produto XYZ devido a reclamações',
        type: 'inspection',
        priority: 'urgent',
        status: 'pending',
        createdBy: 'Admin User',
        assignedGroup: '1',
        dueDate: '2024-01-15',
        createdAt: '2024-01-10'
      }
    ]);

    setPermissions([
      { id: '1', name: 'Visualizar Produtos', description: 'Pode visualizar produtos', resource: 'products', action: 'read' },
      { id: '2', name: 'Criar Inspeções', description: 'Pode criar inspeções', resource: 'inspections', action: 'create' },
      { id: '3', name: 'Gerenciar Usuários', description: 'Pode gerenciar usuários', resource: 'users', action: 'manage' }
    ]);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // User functions with real API integration
  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({ 
        title: 'Erro', 
        description: 'Nome, email e senha são obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    setIsPageLoading(true);
    try {
      const response = await apiRequest('POST', '/api/users', {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        expiresIn: newUser.expiresIn
      });

      const data = await response.json();
      setUsers([...users, data.user]);
      setNewUser({ name: '', email: '', password: '', role: 'inspector', businessUnit: 'N/A', groupId: '', expiresIn: 'permanent' });
      setIsCreateUserModalOpen(false);
      toast({ title: 'Usuário criado com sucesso!' });
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error instanceof Error ? error.message : 'Erro ao criar usuário',
        variant: 'destructive'
      });
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    
    setIsPageLoading(true);
    try {
      const response = await apiRequest('PUT', `/api/users/${selectedUser.id}`, {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        businessUnit: newUser.businessUnit
      });

      const updatedUser = await response.json();
      setUsers(users.map(user => 
        user.id === selectedUser.id ? updatedUser : user
      ));
      setIsEditUserModalOpen(false);
      setSelectedUser(null);
      toast({ title: 'Usuário atualizado com sucesso!' });
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error instanceof Error ? error.message : 'Erro ao atualizar usuário',
        variant: 'destructive'
      });
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    setLoadingUsers(prev => new Set(prev).add(userId));
    try {
      await apiRequest('DELETE', `/api/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
      toast({ title: 'Usuário deletado com sucesso!' });
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error instanceof Error ? error.message : 'Erro ao deletar usuário',
        variant: 'destructive'
      });
    } finally {
      setLoadingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  // Quick role update function
  const handleQuickRoleUpdate = async (userId: string, newRole: string) => {
    setLoadingUsers(prev => new Set(prev).add(userId));
    try {
      const response = await apiRequest('PATCH', `/api/users/${userId}/role`, { role: newRole });
      const updatedUser = await response.json();
      setUsers(users.map(user => 
        user.id === userId ? updatedUser : user
      ));
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
    } finally {
      setLoadingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  // Group functions (mock for now)
  const handleCreateGroup = () => {
    const group: Group = {
      id: Date.now().toString(),
      name: newGroup.name,
      description: newGroup.description,
      tag: newGroup.tag,
      memberCount: 0,
      createdBy: 'Admin User',
      createdAt: new Date().toISOString()
    };
    setGroups([...groups, group]);
    setNewGroup({ name: '', description: '', tag: '' });
    setIsCreateGroupModalOpen(false);
    toast({ title: 'Grupo criado com sucesso!' });
  };

  const handleEditGroup = () => {
    if (!selectedGroup) return;
    const updatedGroups = groups.map(group => 
      group.id === selectedGroup.id ? { ...group, ...newGroup } : group
    );
    setGroups(updatedGroups);
    setIsEditGroupModalOpen(false);
    setSelectedGroup(null);
    toast({ title: 'Grupo atualizado com sucesso!' });
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter(group => group.id !== groupId));
    toast({ title: 'Grupo deletado com sucesso!' });
  };

  // Solicitation functions (mock for now)
  const handleCreateSolicitation = () => {
    const solicitation: Solicitation = {
      id: Date.now().toString(),
      title: newSolicitation.title,
      description: newSolicitation.description,
      type: newSolicitation.type as any,
      priority: newSolicitation.priority as any,
      status: 'pending',
      createdBy: 'Admin User',
      assignedTo: newSolicitation.assignedTo || undefined,
      assignedGroup: newSolicitation.assignedGroup || undefined,
      dueDate: newSolicitation.dueDate || undefined,
      createdAt: new Date().toISOString()
    };
    setSolicitations([...solicitations, solicitation]);
    setNewSolicitation({ title: '', description: '', type: 'general', priority: 'medium', assignedTo: '', assignedGroup: '', dueDate: '' });
    setIsCreateSolicitationModalOpen(false);
    toast({ title: 'Solicitação criada com sucesso!' });
  };

  const handleEditSolicitation = () => {
    // Implementation for editing solicitations
  };

  const handleDeleteSolicitation = (solicitationId: string) => {
    setSolicitations(solicitations.filter(s => s.id !== solicitationId));
    toast({ title: 'Solicitação deletada com sucesso!' });
  };

  // Filter functions
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSolicitations = solicitations.filter(solicitation => 
    solicitation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    solicitation.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gestão de Usuários</h1>
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
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="groups">Grupos</TabsTrigger>
          <TabsTrigger value="solicitations">Solicitações</TabsTrigger>
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
                <Button
                  variant="outline"
                  onClick={loadUsers}
                  disabled={isLoading}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Atualizar</span>
                </Button>
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
              {isLoading ? (
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
                                {loadingUsers.has(user.id) && (
                                  <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                                )}
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
                                  disabled={user.role === key || loadingUsers.has(user.id)}
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
                        <TableCell>{user.businessUnit || 'N/A'}</TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" disabled={loadingUsers.has(user.id)}>
                                {loadingUsers.has(user.id) ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                ) : (
                                  <MoreHorizontal className="h-4 w-4" />
                                )}
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
                                    groupId: user.groupId || '',
                                    expiresIn: 'permanent'
                                  });
                                  setIsEditUserModalOpen(true);
                                }}
                                disabled={loadingUsers.has(user.id)}
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
                                disabled={loadingUsers.has(user.id)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={loadingUsers.has(user.id)}
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
              {filteredUsers.length === 0 && !isLoading && (
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
          {/* Groups content - similar structure to users */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => (
                  <Card key={group.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <p className="text-sm text-gray-600">{group.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Badge variant="outline">{group.tag}</Badge>
                        <p className="text-sm text-gray-500">
                          {group.memberCount} membros
                        </p>
                        <p className="text-xs text-gray-400">
                          Criado por {group.createdBy}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Solicitations Tab */}
        <TabsContent value="solicitations" className="space-y-6">
          {/* Solicitations content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Solicitações ({solicitations.length})</span>
                <Button onClick={() => setIsCreateSolicitationModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Solicitação
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {solicitations.map((solicitation) => (
                  <Card key={solicitation.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{solicitation.title}</h3>
                          <p className="text-sm text-gray-600">{solicitation.description}</p>
                          <div className="flex space-x-2 mt-2">
                            <Badge className={priorityOptions.find(p => p.value === solicitation.priority)?.color}>
                              {priorityOptions.find(p => p.value === solicitation.priority)?.label}
                            </Badge>
                            <Badge variant="outline">{solicitation.type}</Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDeleteSolicitation(solicitation.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
      <Dialog open={isCreateUserModalOpen} onOpenChange={setIsCreateUserModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription>
              Crie um novo usuário no sistema. O usuário receberá um email de confirmação.
            </DialogDescription>
          </DialogHeader>
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
            {newUser.role === 'temporary_viewer' && (
              <div>
                <Label htmlFor="expiresIn">Expira em</Label>
                <Select value={newUser.expiresIn} onValueChange={(value) => setNewUser({ ...newUser, expiresIn: value })}>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateUserModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditUserModalOpen} onOpenChange={setIsEditUserModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Edite as informações do usuário selecionado.
            </DialogDescription>
          </DialogHeader>
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
              <Input
                id="edit-businessUnit"
                value={newUser.businessUnit}
                onChange={(e) => setNewUser({ ...newUser, businessUnit: e.target.value })}
                placeholder="Digite a unidade de negócio"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditUser} disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Group Modal */}
      <Dialog open={isCreateGroupModalOpen} onOpenChange={setIsCreateGroupModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Grupo</DialogTitle>
            <DialogDescription>
              Crie um novo grupo para organizar usuários.
            </DialogDescription>
          </DialogHeader>
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
              <Textarea
                id="group-description"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                placeholder="Digite a descrição do grupo"
              />
            </div>
            <div>
              <Label htmlFor="group-tag">Tag</Label>
              <Input
                id="group-tag"
                value={newGroup.tag}
                onChange={(e) => setNewGroup({ ...newGroup, tag: e.target.value })}
                placeholder="Digite a tag do grupo"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateGroupModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateGroup}>
              Criar Grupo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Solicitation Modal */}
      <Dialog open={isCreateSolicitationModalOpen} onOpenChange={setIsCreateSolicitationModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Solicitação</DialogTitle>
            <DialogDescription>
              Crie uma nova solicitação para a equipe.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="solicitation-title">Título</Label>
              <Input
                id="solicitation-title"
                value={newSolicitation.title}
                onChange={(e) => setNewSolicitation({ ...newSolicitation, title: e.target.value })}
                placeholder="Digite o título da solicitação"
              />
            </div>
            <div>
              <Label htmlFor="solicitation-description">Descrição</Label>
              <Textarea
                id="solicitation-description"
                value={newSolicitation.description}
                onChange={(e) => setNewSolicitation({ ...newSolicitation, description: e.target.value })}
                placeholder="Digite a descrição da solicitação"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="solicitation-type">Tipo</Label>
                <Select value={newSolicitation.type} onValueChange={(value) => setNewSolicitation({ ...newSolicitation, type: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inspection">Inspeção</SelectItem>
                    <SelectItem value="approval">Aprovação</SelectItem>
                    <SelectItem value="block">Bloqueio</SelectItem>
                    <SelectItem value="analysis">Análise</SelectItem>
                    <SelectItem value="general">Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="solicitation-priority">Prioridade</Label>
                <Select value={newSolicitation.priority} onValueChange={(value) => setNewSolicitation({ ...newSolicitation, priority: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="solicitation-dueDate">Data de Vencimento</Label>
              <Input
                id="solicitation-dueDate"
                type="date"
                value={newSolicitation.dueDate}
                onChange={(e) => setNewSolicitation({ ...newSolicitation, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateSolicitationModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSolicitation}>
              Criar Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

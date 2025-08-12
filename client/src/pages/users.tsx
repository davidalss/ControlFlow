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
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, UserPlus, Shield, Settings, Mail, 
  MoreHorizontal, Edit, Trash2, Eye, UserCheck,
  Group, Plus, Send, Clock, CheckCircle, XCircle,
  Search, Filter, Download, Upload, RefreshCw
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
    description: 'Gerencia bloqueios de produtos',
    permissions: ['read:products', 'read:blocks', 'create:blocks', 'update:blocks'],
    color: 'bg-red-100 text-red-800',
    level: 3,
    canManageGroups: false
  },
  'tecnico': {
    name: 'Técnico',
    description: 'Suporte técnico especializado',
    permissions: ['read:products', 'read:inspections', 'update:inspections', 'read:technical'],
    color: 'bg-orange-100 text-orange-800',
    level: 3,
    canManageGroups: false
  },
  'analista': {
    name: 'Analista',
    description: 'Análise de dados e relatórios',
    permissions: ['read:products', 'read:inspections', 'read:reports', 'create:reports'],
    color: 'bg-indigo-100 text-indigo-800',
    level: 4,
    canManageGroups: false
  },
  'p&d': {
    name: 'P&D',
    description: 'Pesquisa e Desenvolvimento',
    permissions: ['read:products', 'read:inspections', 'create:products', 'update:products'],
    color: 'bg-cyan-100 text-cyan-800',
    level: 4,
    canManageGroups: false
  },
  'engineering': {
    name: 'Engenharia',
    description: 'Aprovações e análises técnicas',
    permissions: ['read:products', 'read:inspections', 'update:inspections', 'create:approvals'],
    color: 'bg-yellow-100 text-yellow-800',
    level: 4,
    canManageGroups: false
  },
  'lider': {
    name: 'Líder',
    description: 'Lidera equipes de inspeção',
    permissions: ['read:products', 'read:inspections', 'create:inspections', 'update:inspections', 'read:users'],
    color: 'bg-purple-100 text-purple-800',
    level: 5,
    canManageGroups: true
  },
  'supervisor': {
    name: 'Supervisor',
    description: 'Supervisão de processos',
    permissions: ['read:products', 'read:inspections', 'read:users', 'update:users'],
    color: 'bg-pink-100 text-pink-800',
    level: 6,
    canManageGroups: true
  },
  'coordenador': {
    name: 'Coordenador',
    description: 'Coordenação de equipes',
    permissions: ['read:products', 'read:inspections', 'read:users', 'update:users', 'create:groups'],
    color: 'bg-teal-100 text-teal-800',
    level: 7,
    canManageGroups: true
  },
  'manager': {
    name: 'Gerente',
    description: 'Gestão de departamento',
    permissions: ['read:products', 'read:inspections', 'read:users', 'update:users', 'create:groups', 'read:reports'],
    color: 'bg-amber-100 text-amber-800',
    level: 8,
    canManageGroups: true
  },
  'admin': {
    name: 'Administrador',
    description: 'Acesso total ao sistema',
    permissions: ['*'],
    color: 'bg-red-100 text-red-800',
    level: 9,
    canManageGroups: true
  }
};

const businessUnits = [
  { value: 'DIY', label: 'DIY' },
  { value: 'TECH', label: 'TECH' },
  { value: 'KITCHEN_BEAUTY', label: 'KITCHEN & BEAUTY' },
  { value: 'MOTOR_COMFORT', label: 'MOTOR & COMFORT' },
  { value: 'N/A', label: 'N/A' }
];

const solicitationTypes = [
  { value: 'inspection', label: 'Inspeção', icon: '🔍' },
  { value: 'approval', label: 'Aprovação', icon: '✅' },
  { value: 'block', label: 'Bloqueio', icon: '🚫' },
  { value: 'analysis', label: 'Análise', icon: '📊' },
  { value: 'general', label: 'Geral', icon: '📝' }
];

const priorities = [
  { value: 'low', label: 'Baixa', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-800' }
];

export default function UsersPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('users');
  const [currentUserRole, setCurrentUserRole] = useState('admin'); // Mock current user role
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // Function to test different roles
  const testRole = (role: string) => {
    setCurrentUserRole(role);
    toast({ 
      title: `Role alterada para: ${roleDefinitions[role as keyof typeof roleDefinitions]?.name}`,
      description: roleDefinitions[role as keyof typeof roleDefinitions]?.canManageGroups ? 
        'Pode gerenciar grupos' : 'Não pode gerenciar grupos'
    });
  };
  
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

  // Load mock data
  useEffect(() => {
    // Mock users
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
      },
      {
        id: '3',
        name: 'Engineering Demo',
        email: 'engineering@controlflow.com',
        role: 'engineering',
        businessUnit: 'TECH',
        groupId: '2',
        createdAt: '2024-01-03'
      },
      {
        id: '4',
        name: 'Inspector DIY',
        email: 'inspector.diy@controlflow.com',
        role: 'inspector',
        businessUnit: 'DIY',
        groupId: '1',
        createdAt: '2024-01-04'
      },
      {
        id: '5',
        name: 'Analista Importação',
        email: 'analista.import@controlflow.com',
        role: 'analista',
        businessUnit: 'N/A',
        groupId: '3',
        createdAt: '2024-01-05'
      }
    ]);

    // Mock groups
    setGroups([
      {
        id: '1',
        name: 'Equipe DIY',
        description: 'Equipe responsável pelo setor DIY',
        tag: 'QUALIDADE DIY',
        memberCount: 5,
        createdBy: 'Admin User',
        createdAt: '2024-01-01'
      },
      {
        id: '2',
        name: 'Equipe TECH',
        description: 'Equipe responsável pelo setor TECH',
        tag: 'QUALIDADE TECH',
        memberCount: 3,
        createdBy: 'Admin User',
        createdAt: '2024-01-02'
      },
      {
        id: '3',
        name: 'Equipe Importação',
        description: 'Equipe responsável pela qualidade de importação',
        tag: 'QUALIDADE IMPORTAÇÃO',
        memberCount: 4,
        createdBy: 'Admin User',
        createdAt: '2024-01-03'
      }
    ]);

    // Mock solicitations
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
      },
      {
        id: '2',
        title: 'Aprovação Técnica - Novo Processo',
        description: 'Aprovação necessária para implementação de novo processo',
        type: 'approval',
        priority: 'high',
        status: 'in_progress',
        createdBy: 'Admin User',
        assignedTo: '3',
        dueDate: '2024-01-20',
        createdAt: '2024-01-08'
      }
    ]);

    // Mock permissions
    setPermissions([
      { id: '1', name: 'Visualizar Produtos', description: 'Pode visualizar produtos', resource: 'products', action: 'read' },
      { id: '2', name: 'Criar Inspeções', description: 'Pode criar inspeções', resource: 'inspections', action: 'create' },
      { id: '3', name: 'Gerenciar Usuários', description: 'Pode gerenciar usuários', resource: 'users', action: 'manage' }
    ]);
  }, []);

  // User functions
  const handleCreateUser = () => {
    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      businessUnit: newUser.businessUnit,
      createdAt: new Date().toISOString()
    };
    setUsers([...users, user]);
    setNewUser({ name: '', email: '', password: '', role: 'inspector', businessUnit: 'N/A', groupId: '', expiresIn: 'permanent' });
    setIsCreateUserModalOpen(false);
    toast({ title: 'Usuário criado com sucesso!' });
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    const updatedUsers = users.map(user => 
      user.id === selectedUser.id ? { ...user, ...newUser } : user
    );
    setUsers(updatedUsers);
    setIsEditUserModalOpen(false);
    setSelectedUser(null);
    toast({ title: 'Usuário atualizado com sucesso!' });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({ title: 'Usuário deletado com sucesso!' });
  };

  // Group functions
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

  // Solicitation functions
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <Settings className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
                <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Gestão de Usuários
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Gerencie usuários, grupos, permissões e solicitações
          </p>
                </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsCreateUserModalOpen(true)} 
            className="shadow-md hover-lift transition-all duration-200"
            style={{
              backgroundColor: 'var(--btn-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)'
            }}
          >
             <UserPlus className="w-4 h-4 mr-2" />
             Novo Usuário
           </Button>
           {roleDefinitions[currentUserRole as keyof typeof roleDefinitions]?.canManageGroups && (
             <Button 
               onClick={() => setIsCreateGroupModalOpen(true)} 
               variant="outline"
               className="shadow-md hover-lift transition-all duration-200"
               style={{
                 backgroundColor: 'var(--btn-bg)',
                 color: 'var(--text-primary)',
                 border: '1px solid var(--border-color)',
                 borderRadius: 'var(--radius-md)'
               }}
             >
               <Group className="w-4 h-4 mr-2" />
               Novo Grupo
             </Button>
           )}
           <Button 
             onClick={() => setIsCreateSolicitationModalOpen(true)} 
             variant="outline"
             className="shadow-md hover-lift transition-all duration-200"
             style={{
               backgroundColor: 'var(--btn-bg)',
               color: 'var(--text-primary)',
               border: '1px solid var(--border-color)',
               borderRadius: 'var(--radius-md)'
             }}
           >
             <Send className="w-4 h-4 mr-2" />
             Nova Solicitação
           </Button>
                </div>
         <div className="flex gap-2 mt-4">
           <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Testar Role:</span>
           <Button 
             size="sm" 
             variant="outline" 
             onClick={() => testRole('inspector')}
             className="transition-all duration-200"
             style={{
               backgroundColor: 'var(--btn-bg)',
               color: 'var(--text-secondary)',
               border: '1px solid var(--border-color)',
               borderRadius: 'var(--radius-sm)'
             }}
           >
             Inspector
           </Button>
           <Button 
             size="sm" 
             variant="outline" 
             onClick={() => testRole('lider')}
             className="transition-all duration-200"
             style={{
               backgroundColor: 'var(--btn-bg)',
               color: 'var(--text-secondary)',
               border: '1px solid var(--border-color)',
               borderRadius: 'var(--radius-sm)'
             }}
           >
             Líder
           </Button>
           <Button 
             size="sm" 
             variant="outline" 
             onClick={() => testRole('admin')}
             className="transition-all duration-200"
             style={{
               backgroundColor: 'var(--btn-bg)',
               color: 'var(--text-secondary)',
               border: '1px solid var(--border-color)',
               borderRadius: 'var(--radius-sm)'
             }}
           >
             Admin
           </Button>
                </div>
                </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <Input
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-md)'
            }}
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-48" style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-md)'
          }}>
            <SelectValue placeholder="Filtrar por role" />
          </SelectTrigger>
          <SelectContent style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)'
          }}>
            <SelectItem value="all">Todos os roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="inspector">Inspetor</SelectItem>
            <SelectItem value="engineering">Engenharia</SelectItem>
            <SelectItem value="temporary_viewer">Visualizador Temporário</SelectItem>
                    </SelectContent>
                  </Select>
        <Button
          variant="outline"
          size="sm"
          className="transition-all duration-200"
          style={{
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
                </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4" style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)'
        }}>
          <TabsTrigger value="users" className="flex items-center gap-2" style={{
            color: 'var(--text-secondary)',
            backgroundColor: 'transparent'
          }}>
            <Users className="w-4 h-4" />
            Usuários ({users.length})
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2" style={{
            color: 'var(--text-secondary)',
            backgroundColor: 'transparent'
          }}>
            <Group className="w-4 h-4" />
            Grupos ({groups.length})
          </TabsTrigger>
          <TabsTrigger value="solicitations" className="flex items-center gap-2" style={{
            color: 'var(--text-secondary)',
            backgroundColor: 'transparent'
          }}>
            <Send className="w-4 h-4" />
            Solicitações ({solicitations.length})
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2" style={{
            color: 'var(--text-secondary)',
            backgroundColor: 'transparent'
          }}>
            <Shield className="w-4 h-4" />
            Permissões
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-secondary border-light shadow-md hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{users.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-secondary border-light shadow-md hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">Ativos</CardTitle>
                <UserCheck className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{users.filter(u => !u.expiresAt || new Date(u.expiresAt) > new Date()).length}</div>
              </CardContent>
            </Card>
            <Card className="bg-secondary border-light shadow-md hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">Administradores</CardTitle>
                <Shield className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{users.filter(u => u.role === 'admin').length}</div>
              </CardContent>
            </Card>
            <Card className="bg-secondary border-light shadow-md hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">Inspetores</CardTitle>
                <Eye className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-info">{users.filter(u => u.role === 'inspector').length}</div>
              </CardContent>
            </Card>
              </div>

          <Card className="bg-secondary border-light shadow-md">
            <CardHeader>
              <CardTitle className="text-primary">Lista de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                                         <TableHead>Nome</TableHead>
                     <TableHead>Email</TableHead>
                     <TableHead>Função</TableHead>
                     <TableHead>Unidade</TableHead>
                     <TableHead>Grupo</TableHead>
                     <TableHead>Criado em</TableHead>
                     <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={roleDefinitions[user.role as keyof typeof roleDefinitions]?.color || 'bg-gray-100 text-gray-800'}>
                          {roleDefinitions[user.role as keyof typeof roleDefinitions]?.name || user.role}
                        </Badge>
                      </TableCell>
                                             <TableCell>{user.businessUnit}</TableCell>
                       <TableCell>
                         {user.groupId ? 
                           groups.find(g => g.id === user.groupId)?.name || 'Grupo não encontrado' :
                           'Sem grupo'
                         }
                       </TableCell>
                       <TableCell>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsEditUserModalOpen(true); }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Deletar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </CardContent>
        </Card>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
        <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Grupos</CardTitle>
                <Group className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
          <CardContent>
                <div className="text-2xl font-bold">{groups.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{groups.reduce((acc, group) => acc + group.memberCount, 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Grupos Ativos</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{groups.filter(g => g.memberCount > 0).length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedGroup(group); setIsEditGroupModalOpen(true); }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteGroup(group.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm text-gray-600">{group.description}</p>
                </CardHeader>
                <CardContent>
              <div className="space-y-2">
                                         <div className="flex justify-between text-sm">
                       <span>Tag:</span>
                       <span className="font-medium">{group.tag}</span>
                      </div>
                    <div className="flex justify-between text-sm">
                      <span>Membros:</span>
                      <span className="font-medium">{group.memberCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Criado por:</span>
                      <span className="font-medium">{group.createdBy}</span>
              </div>
                  </div>
          </CardContent>
        </Card>
            ))}
          </div>
        </TabsContent>

        {/* Solicitations Tab */}
        <TabsContent value="solicitations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
      <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
        <CardContent>
                <div className="text-2xl font-bold">{solicitations.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{solicitations.filter(s => s.status === 'pending').length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{solicitations.filter(s => s.status === 'in_progress').length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{solicitations.filter(s => s.status === 'completed').length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Solicitações</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitations.map((solicitation) => (
                    <TableRow key={solicitation.id}>
                      <TableCell className="font-medium">{solicitation.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {solicitationTypes.find(t => t.value === solicitation.type)?.icon} {solicitationTypes.find(t => t.value === solicitation.type)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorities.find(p => p.value === solicitation.priority)?.color}>
                          {priorities.find(p => p.value === solicitation.priority)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(solicitation.status)}>
                          {getStatusIcon(solicitation.status)}
                          <span className="ml-1">{solicitation.status === 'in_progress' ? 'Em Progresso' : solicitation.status === 'pending' ? 'Pendente' : solicitation.status === 'completed' ? 'Concluída' : 'Cancelada'}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {solicitation.assignedTo ? 
                          users.find(u => u.id === solicitation.assignedTo)?.name :
                          groups.find(g => g.id === solicitation.assignedGroup)?.name || 'Não atribuído'
                        }
                      </TableCell>
                      <TableCell>
                        {solicitation.dueDate ? new Date(solicitation.dueDate).toLocaleDateString('pt-BR') : 'Sem prazo'}
                      </TableCell>
                      <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                              </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
        </CardContent>
      </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Permissões por Função</CardTitle>
              <p className="text-sm text-gray-600">Configure as permissões para cada função no sistema</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(roleDefinitions).map(([roleKey, roleDef]) => (
                  <div key={roleKey} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{roleDef.name}</h3>
                        <p className="text-sm text-gray-600">{roleDef.description}</p>
          </div>
                      <Badge className={roleDef.color}>{roleKey}</Badge>
          </div>
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {roleDef.permissions.map((permission) => (
                        <div key={permission} className="flex items-center space-x-2">
                          <Switch defaultChecked={true} />
                          <Label className="text-sm">{permission}</Label>
    </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create User Modal */}
      <Dialog open={isCreateUserModalOpen} onOpenChange={setIsCreateUserModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
        <DialogDescription>
              Preencha as informações para criar um novo usuário no sistema.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Nome completo"
              />
                </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Senha"
              />
        </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Função</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma função" />
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
                         <div className="grid gap-2">
               <Label htmlFor="businessUnit">Unidade de Negócio</Label>
               <Select value={newUser.businessUnit} onValueChange={(value) => setNewUser({ ...newUser, businessUnit: value })}>
                 <SelectTrigger>
                   <SelectValue placeholder="Selecione uma unidade" />
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
             {roleDefinitions[currentUserRole as keyof typeof roleDefinitions]?.canManageGroups && (
               <div className="grid gap-2">
                 <Label htmlFor="groupId">Grupo (Opcional)</Label>
                 <Select value={newUser.groupId} onValueChange={(value) => setNewUser({ ...newUser, groupId: value })}>
                   <SelectTrigger>
                     <SelectValue placeholder="Selecione um grupo" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="">Sem grupo</SelectItem>
                     {groups.map((group) => (
                       <SelectItem key={group.id} value={group.id}>
                         {group.name} - {group.tag}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
            </div>
          )}
      </div>
      <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateUserModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser}>Criar Usuário</Button>
      </DialogFooter>
    </DialogContent>
      </Dialog>

      {/* Create Group Modal */}
      <Dialog open={isCreateGroupModalOpen} onOpenChange={setIsCreateGroupModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
            <DialogTitle>Criar Novo Grupo</DialogTitle>
        <DialogDescription>
              Crie um novo grupo para organizar usuários e atribuir solicitações.
        </DialogDescription>
      </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="groupName">Nome do Grupo</Label>
              <Input
                id="groupName"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                placeholder="Nome do grupo"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="groupDescription">Descrição</Label>
              <Textarea
                id="groupDescription"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                placeholder="Descrição do grupo"
              />
            </div>
                         <div className="grid gap-2">
               <Label htmlFor="groupTag">Tag do Grupo</Label>
               <Input
                 id="groupTag"
                 value={newGroup.tag}
                 onChange={(e) => setNewGroup({ ...newGroup, tag: e.target.value })}
                 placeholder="Ex: QUALIDADE IMPORTAÇÃO"
               />
             </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateGroupModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateGroup}>Criar Grupo</Button>
          </DialogFooter>
    </DialogContent>
      </Dialog>

      {/* Create Solicitation Modal */}
      <Dialog open={isCreateSolicitationModalOpen} onOpenChange={setIsCreateSolicitationModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
            <DialogTitle>Criar Nova Solicitação</DialogTitle>
        <DialogDescription>
              Crie uma nova solicitação para atribuir a usuários ou grupos específicos.
        </DialogDescription>
      </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="solicitationTitle">Título</Label>
              <Input
                id="solicitationTitle"
                value={newSolicitation.title}
                onChange={(e) => setNewSolicitation({ ...newSolicitation, title: e.target.value })}
                placeholder="Título da solicitação"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="solicitationDescription">Descrição</Label>
              <Textarea
                id="solicitationDescription"
                value={newSolicitation.description}
                onChange={(e) => setNewSolicitation({ ...newSolicitation, description: e.target.value })}
                placeholder="Descrição detalhada da solicitação"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="solicitationType">Tipo</Label>
                <Select value={newSolicitation.type} onValueChange={(value) => setNewSolicitation({ ...newSolicitation, type: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {solicitationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="solicitationPriority">Prioridade</Label>
                <Select value={newSolicitation.priority} onValueChange={(value) => setNewSolicitation({ ...newSolicitation, priority: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="assignedTo">Atribuir para Usuário</Label>
                <Select value={newSolicitation.assignedTo} onValueChange={(value) => setNewSolicitation({ ...newSolicitation, assignedTo: value, assignedGroup: '' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum usuário específico</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assignedGroup">Atribuir para Grupo</Label>
                <Select value={newSolicitation.assignedGroup} onValueChange={(value) => setNewSolicitation({ ...newSolicitation, assignedGroup: value, assignedTo: '' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum grupo específico</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Prazo (Opcional)</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={newSolicitation.dueDate}
                onChange={(e) => setNewSolicitation({ ...newSolicitation, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateSolicitationModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSolicitation}>Criar Solicitação</Button>
          </DialogFooter>
    </DialogContent>
      </Dialog>
    </div>
  );
}

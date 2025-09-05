import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function UsersPage() {
  const { canAccess } = useAuthorization();
  const { toast } = useToast();
  const { users, isLoading, createUser, updateUser, deleteUser, inviteUser, refetch } = useUsers();
  const { groups, isLoading: isLoadingGroups } = useGroups();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Estados para modais e filtros
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Estados do formulário
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'inspector',
    department: '',
    phone: '',
    is_active: true
  });

  const [inviteData, setInviteData] = useState({
    email: '',
    full_name: '',
    role: 'inspector',
    department: ''
  });

  // Verificação de autorização
  if (!canAccess('users', 'read')) {
    return <AuthorizationError action="visualizar usuários" />;
  }

  // Filtrar usuários
  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.is_active) ||
                         (statusFilter === 'inactive' && !user.is_active);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  }) || [];

  // Estatísticas
  const stats = {
    total: users?.length || 0,
    active: users?.filter(u => u.is_active).length || 0,
    inactive: users?.filter(u => !u.is_active).length || 0,
    admins: users?.filter(u => u.role === 'admin').length || 0,
    inspectors: users?.filter(u => u.role === 'inspector').length || 0,
    managers: users?.filter(u => u.role === 'manager').length || 0
  };

  // Funções de manipulação
  const handleCreateUser = async () => {
    try {
      await createUser(formData);
      setShowCreateModal(false);
      setFormData({
        email: '',
        full_name: '',
        role: 'inspector',
        department: '',
        phone: '',
        is_active: true
      });
      toast({
        title: "Usuário criado",
        description: "Usuário criado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar usuário",
        variant: "destructive",
      });
    }
  };

  const handleInviteUser = async () => {
    try {
      await inviteUser(inviteData);
      setShowInviteModal(false);
      setInviteData({
        email: '',
        full_name: '',
        role: 'inspector',
        department: ''
      });
      toast({
        title: "Convite enviado",
        description: "Convite enviado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar convite",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      await updateUser(editingUser.id, formData);
      setShowEditModal(false);
      setEditingUser(null);
      toast({
        title: "Usuário atualizado",
        description: "Usuário atualizado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar usuário",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteUser(userId);
        toast({
          title: "Usuário excluído",
          description: "Usuário excluído com sucesso!",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir usuário",
          variant: "destructive",
        });
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'inspector': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      case 'inspector': return 'Inspetor';
      default: return role;
    }
  };

  return (
    <motion.div 
      className="ds-container max-w-none"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4"
        variants={itemVariants}
      >
        <div>
          <h1 className="ds-heading-1 flex items-center gap-3">
            <Users className="w-8 h-8" />
            Gestão de Usuários
          </h1>
          <p className="ds-text-secondary">
            Gerencie usuários, permissões e grupos de acesso
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={refetch}
            disabled={isLoading}
            className="ds-button-secondary"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          {canAccess('users', 'create') && (
            <>
              <Button 
                variant="outline"
                onClick={() => setShowInviteModal(true)}
                className="ds-button-secondary"
              >
                <Send className="w-4 h-4 mr-2" />
                Convidar
              </Button>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="ds-button-primary"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="ds-grid ds-grid-3 lg:ds-grid-6 mb-8"
        variants={itemVariants}
      >
        <Card className="ds-card">
          <CardContent className="ds-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="ds-text-sm ds-text-secondary">Total</p>
                <p className="ds-heading-3">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="ds-card">
          <CardContent className="ds-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="ds-text-sm ds-text-secondary">Ativos</p>
                <p className="ds-heading-3">{stats.active}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="ds-card">
          <CardContent className="ds-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="ds-text-sm ds-text-secondary">Inativos</p>
                <p className="ds-heading-3">{stats.inactive}</p>
              </div>
              <UserX className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="ds-card">
          <CardContent className="ds-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="ds-text-sm ds-text-secondary">Admins</p>
                <p className="ds-heading-3">{stats.admins}</p>
              </div>
              <Shield className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="ds-card">
          <CardContent className="ds-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="ds-text-sm ds-text-secondary">Gerentes</p>
                <p className="ds-heading-3">{stats.managers}</p>
              </div>
              <UserCog className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="ds-card">
          <CardContent className="ds-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="ds-text-sm ds-text-secondary">Inspetores</p>
                <p className="ds-heading-3">{stats.inspectors}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filtros */}
      <motion.div variants={itemVariants}>
        <Card className="ds-card mb-8">
          <CardHeader className="ds-card-header">
            <CardTitle className="ds-heading-3 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent className="ds-card-content">
            <div className="ds-grid ds-grid-2 lg:ds-grid-4 gap-4">
              <div>
                <label className="ds-label">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Nome, email ou departamento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ds-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="ds-label">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="ds-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="ds-label">Função</label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="ds-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="inspector">Inspetor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="ds-button-secondary w-full"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setRoleFilter('all');
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabela de Usuários */}
      <motion.div variants={itemVariants}>
        <Card className="ds-card">
          <CardHeader className="ds-card-header">
            <CardTitle className="ds-heading-3">
              Usuários ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="ds-card-content p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="ds-text-secondary">Carregando usuários...</p>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="ds-heading-3 mb-2">Nenhum usuário encontrado</h3>
                <p className="ds-text-secondary mb-4">
                  {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece criando seu primeiro usuário'
                  }
                </p>
                {canAccess('users', 'create') && !searchTerm && statusFilter === 'all' && roleFilter === 'all' && (
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="ds-button-primary"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Criar Primeiro Usuário
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Último Acesso</TableHead>
                      <TableHead className="w-[100px] text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredUsers.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                              </div>
                              <div>
                                <div className="font-medium ds-text">
                                  {user.full_name || 'Nome não informado'}
                                </div>
                                {user.phone && (
                                  <div className="ds-text-xs ds-text-muted">
                                    {user.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="ds-text">{user.email}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(user.role)}>
                              {getRoleLabel(user.role)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="ds-text">
                              {user.department || 'Não informado'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.is_active ? "default" : "secondary"}
                              className={user.is_active ? "bg-green-100 text-green-800" : ""}
                            >
                              {user.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="ds-text-sm ds-text-muted">
                              {formatDate(user.last_sign_in_at) || 'Nunca'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="ds-button-ghost h-8 w-8 p-0">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                {canAccess('users', 'update') && (
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setEditingUser(user);
                                      setFormData({
                                        email: user.email,
                                        full_name: user.full_name || '',
                                        role: user.role,
                                        department: user.department || '',
                                        phone: user.phone || '',
                                        is_active: user.is_active
                                      });
                                      setShowEditModal(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {canAccess('users', 'delete') && (
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Modais - Criar Usuário */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription>
              Crie um novo usuário com acesso ao sistema
            </DialogDescription>
          </DialogHeader>
          <div className="ds-grid ds-grid-2 gap-4 py-4">
            <div>
              <Label className="ds-label">Nome Completo</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="ds-input"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label className="ds-label">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="ds-input"
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label className="ds-label">Função</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                <SelectTrigger className="ds-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inspector">Inspetor</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="ds-label">Departamento</Label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="ds-input"
                placeholder="Departamento"
              />
            </div>
            <div>
              <Label className="ds-label">Telefone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="ds-input"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} className="ds-button-primary">
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal - Convidar Usuário */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Convidar Usuário</DialogTitle>
            <DialogDescription>
              Envie um convite por email para um novo usuário
            </DialogDescription>
          </DialogHeader>
          <div className="ds-grid ds-grid-2 gap-4 py-4">
            <div>
              <Label className="ds-label">Nome Completo</Label>
              <Input
                value={inviteData.full_name}
                onChange={(e) => setInviteData({...inviteData, full_name: e.target.value})}
                className="ds-input"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label className="ds-label">Email</Label>
              <Input
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                className="ds-input"
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label className="ds-label">Função</Label>
              <Select value={inviteData.role} onValueChange={(value) => setInviteData({...inviteData, role: value})}>
                <SelectTrigger className="ds-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inspector">Inspetor</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="ds-label">Departamento</Label>
              <Input
                value={inviteData.department}
                onChange={(e) => setInviteData({...inviteData, department: e.target.value})}
                className="ds-input"
                placeholder="Departamento"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInviteUser} className="ds-button-primary">
              <Send className="w-4 h-4 mr-2" />
              Enviar Convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal - Editar Usuário */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário
            </DialogDescription>
          </DialogHeader>
          <div className="ds-grid ds-grid-2 gap-4 py-4">
            <div>
              <Label className="ds-label">Nome Completo</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="ds-input"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label className="ds-label">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="ds-input"
                placeholder="email@exemplo.com"
                disabled
              />
            </div>
            <div>
              <Label className="ds-label">Função</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                <SelectTrigger className="ds-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inspector">Inspetor</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="ds-label">Departamento</Label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="ds-input"
                placeholder="Departamento"
              />
            </div>
            <div>
              <Label className="ds-label">Telefone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="ds-input"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label className="ds-label">Status</Label>
              <Select 
                value={formData.is_active ? 'active' : 'inactive'} 
                onValueChange={(value) => setFormData({...formData, is_active: value === 'active'})}
              >
                <SelectTrigger className="ds-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditModal(false);
              setEditingUser(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser} className="ds-button-primary">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

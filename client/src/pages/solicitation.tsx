import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  FileText,
  MessageSquare,
  Users,
  Tag,
  Priority,
  Target
} from "lucide-react";

interface Solicitation {
  id: string;
  solicitationCode: string;
  title: string;
  description: string;
  type: 'inspection' | 'approval' | 'block' | 'analysis' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdBy: string;
  assignedTo?: string;
  assignedGroup?: string;
  productId?: string;
  productName?: string;
  dueDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  attachments: SolicitationAttachment[];
  comments: SolicitationComment[];
}

interface SolicitationAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'other';
  url: string;
}

interface SolicitationComment {
  id: string;
  text: string;
  createdBy: string;
  createdAt: Date;
}

export default function SolicitationPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [solicitations, setSolicitations] = useState<Solicitation[]>([]);
  const [filteredSolicitations, setFilteredSolicitations] = useState<Solicitation[]>([]);
  const [selectedSolicitation, setSelectedSolicitation] = useState<Solicitation | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Mock data para solicitações
  useEffect(() => {
    const mockSolicitations: Solicitation[] = [
      {
        id: '1',
        solicitationCode: 'SOL-2024-001',
        title: 'Inspeção Urgente - Air Fryer Barbecue',
        description: 'Necessário realizar inspeção urgente do produto Air Fryer Barbecue devido a reclamações de clientes',
        type: 'inspection',
        priority: 'urgent',
        status: 'in_progress',
        createdBy: 'João Silva',
        assignedTo: 'Maria Santos',
        productId: 'PROD-001',
        productName: 'Air Fryer Barbecue',
        dueDate: new Date('2024-01-25'),
        startedAt: new Date('2024-01-20'),
        createdAt: new Date('2024-01-18'),
        attachments: [],
        comments: [
          {
            id: '1',
            text: 'Iniciando inspeção conforme solicitado',
            createdBy: 'Maria Santos',
            createdAt: new Date('2024-01-20')
          }
        ]
      },
      {
        id: '2',
        solicitationCode: 'SOL-2024-002',
        title: 'Aprovação de Plano de Inspeção',
        description: 'Solicitação de aprovação do novo plano de inspeção para o produto Air Fryer Barbecue',
        type: 'approval',
        priority: 'high',
        status: 'pending',
        createdBy: 'Pedro Costa',
        assignedTo: 'Ana Oliveira',
        productId: 'PROD-001',
        productName: 'Air Fryer Barbecue',
        dueDate: new Date('2024-01-30'),
        createdAt: new Date('2024-01-19'),
        attachments: [],
        comments: []
      },
      {
        id: '3',
        solicitationCode: 'SOL-2024-003',
        title: 'Bloqueio de Fornecedor',
        description: 'Solicitação de bloqueio do fornecedor ABC devido a não conformidades',
        type: 'block',
        priority: 'high',
        status: 'completed',
        createdBy: 'Carlos Lima',
        assignedTo: 'Roberto Alves',
        completedAt: new Date('2024-01-22'),
        createdAt: new Date('2024-01-15'),
        attachments: [],
        comments: [
          {
            id: '2',
            text: 'Bloqueio aprovado e implementado',
            createdBy: 'Roberto Alves',
            createdAt: new Date('2024-01-22')
          }
        ]
      },
      {
        id: '4',
        solicitationCode: 'SOL-2024-004',
        title: 'Análise de Qualidade',
        description: 'Análise detalhada dos indicadores de qualidade do último trimestre',
        type: 'analysis',
        priority: 'medium',
        status: 'pending',
        createdBy: 'Fernanda Silva',
        assignedGroup: 'Equipe de Qualidade',
        dueDate: new Date('2024-02-15'),
        createdAt: new Date('2024-01-20'),
        attachments: [],
        comments: []
      }
    ];
    setSolicitations(mockSolicitations);
    setFilteredSolicitations(mockSolicitations);
    setLoading(false);
  }, []);

  // Filtros
  useEffect(() => {
    let filtered = solicitations;
    
    if (searchTerm) {
      filtered = filtered.filter(solicitation => 
        solicitation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        solicitation.solicitationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        solicitation.productName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(solicitation => solicitation.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(solicitation => solicitation.type === typeFilter);
    }
    
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(solicitation => solicitation.priority === priorityFilter);
    }
    
    setFilteredSolicitations(filtered);
  }, [solicitations, searchTerm, statusFilter, typeFilter, priorityFilter]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inspection': return <Target className="h-4 w-4" />;
      case 'approval': return <CheckCircle className="h-4 w-4" />;
      case 'block': return <AlertTriangle className="h-4 w-4" />;
      case 'analysis': return <FileText className="h-4 w-4" />;
      case 'general': return <MessageSquare className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const canCreateSolicitation = user?.role && ['tecnico', 'lider', 'supervisor', 'coordenador', 'engineering', 'manager', 'admin'].includes(user.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Solicitações</h1>
          <p className="text-gray-600 mt-2">
            Gerencie solicitações de inspeção, aprovação, bloqueio e análise
          </p>
        </div>
        {canCreateSolicitation && (
          <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Solicitação
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">2</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">1</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídas (Mês)</p>
                <p className="text-2xl font-bold text-green-600">1</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgentes</p>
                <p className="text-2xl font-bold text-red-600">1</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Código, título ou produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="inspection">Inspeção</SelectItem>
                  <SelectItem value="approval">Aprovação</SelectItem>
                  <SelectItem value="block">Bloqueio</SelectItem>
                  <SelectItem value="analysis">Análise</SelectItem>
                  <SelectItem value="general">Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Solicitações */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Solicitações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
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
              {filteredSolicitations.map((solicitation) => (
                <TableRow key={solicitation.id}>
                  <TableCell className="font-medium">{solicitation.solicitationCode}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{solicitation.title}</p>
                      <p className="text-sm text-gray-500">{solicitation.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(solicitation.type)}
                      <span className="capitalize">{solicitation.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(solicitation.priority)}>
                      {solicitation.priority === 'low' ? 'Baixa' : 
                       solicitation.priority === 'medium' ? 'Média' : 
                       solicitation.priority === 'high' ? 'Alta' : 'Urgente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(solicitation.status)}>
                      {solicitation.status === 'pending' ? 'Pendente' : 
                       solicitation.status === 'in_progress' ? 'Em Andamento' : 
                       solicitation.status === 'completed' ? 'Concluída' : 'Cancelada'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {solicitation.assignedTo || solicitation.assignedGroup || 'Não atribuído'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {solicitation.dueDate ? solicitation.dueDate.toLocaleDateString('pt-BR') : 'Não definido'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSolicitation(solicitation);
                          setShowViewDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canCreateSolicitation && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSolicitation(solicitation);
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Visualização */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
            <DialogDescription>
              Informações completas sobre a solicitação selecionada
            </DialogDescription>
          </DialogHeader>
          {selectedSolicitation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Código</Label>
                  <p className="text-sm text-gray-600">{selectedSolicitation.solicitationCode}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedSolicitation.status)}>
                    {selectedSolicitation.status === 'pending' ? 'Pendente' : 
                     selectedSolicitation.status === 'in_progress' ? 'Em Andamento' : 
                     selectedSolicitation.status === 'completed' ? 'Concluída' : 'Cancelada'}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Título</Label>
                <p className="text-sm text-gray-600">{selectedSolicitation.title}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Descrição</Label>
                <p className="text-sm text-gray-600">{selectedSolicitation.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Tipo</Label>
                  <p className="text-sm text-gray-600 capitalize">{selectedSolicitation.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Prioridade</Label>
                  <Badge className={getPriorityColor(selectedSolicitation.priority)}>
                    {selectedSolicitation.priority === 'low' ? 'Baixa' : 
                     selectedSolicitation.priority === 'medium' ? 'Média' : 
                     selectedSolicitation.priority === 'high' ? 'Alta' : 'Urgente'}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Criado por</Label>
                  <p className="text-sm text-gray-600">{selectedSolicitation.createdBy}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Responsável</Label>
                  <p className="text-sm text-gray-600">
                    {selectedSolicitation.assignedTo || selectedSolicitation.assignedGroup || 'Não atribuído'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Data de criação</Label>
                  <p className="text-sm text-gray-600">
                    {selectedSolicitation.createdAt.toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Prazo</Label>
                  <p className="text-sm text-gray-600">
                    {selectedSolicitation.dueDate ? selectedSolicitation.dueDate.toLocaleDateString('pt-BR') : 'Não definido'}
                  </p>
                </div>
              </div>

              {/* Comentários */}
              {selectedSolicitation.comments.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Comentários</Label>
                  <div className="space-y-2 mt-2">
                    {selectedSolicitation.comments.map((comment) => (
                      <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{comment.createdBy}</span>
                          <span className="text-xs text-gray-500">
                            {comment.createdAt.toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

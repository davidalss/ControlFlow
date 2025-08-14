import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Unlock, 
  Package, 
  Clock, 
  User, 
  Calendar,
  FileText,
  Download,
  Eye,
  Edit,
  Plus,
  Filter,
  Search,
  Bell,
  History,
  Settings,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Block {
  id: string;
  productId: string;
  productCode: string;
  productDescription: string;
  reason: string;
  status: 'active' | 'inactive' | 'pending';
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'product' | 'material' | 'supplier' | 'process';
  responsibleUserId: string;
  responsibleUserName: string;
  createdAt: string;
  updatedAt: string;
  quantity?: number;
  quantityReleased?: number;
  inspectionHistory?: InspectionHistory;
  reworkStatus?: ReworkStatus;
  received?: boolean;
  observations?: string;
  history?: BlockHistory[];
}

interface InspectionHistory {
  status: 'approved' | 'rejected' | 'not_inspected';
  lastInspectionDate?: string;
  inspectorName?: string;
  observations?: string;
}

interface ReworkStatus {
  status: 'pending' | 'in_progress' | 'completed';
  requestedBy?: string;
  requestedAt?: string;
  completedAt?: string;
  team?: string;
}

interface BlockHistory {
  id: string;
  action: 'created' | 'updated' | 'released' | 'rework_requested';
  userId: string;
  userName: string;
  timestamp: string;
  details: any;
}

interface UnlockRequest {
  id: string;
  blockId: string;
  requestedBy: string;
  requestedAt: string;
  quantity: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  observations?: string;
}

export default function BlocksPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isUnlockDialogOpen, setIsUnlockDialogOpen] = useState(false);
  const [isReworkDialogOpen, setIsReworkDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isNewBlockDialogOpen, setIsNewBlockDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    severity: 'all',
    received: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration
  const mockBlocks: Block[] = [
    {
      id: 'block_001',
      productId: 'prod_001',
      productCode: 'FRE-001',
      productDescription: 'Fritadeira Elétrica Air Fryer 4L',
      reason: 'Não conformidade crítica detectada na inspeção inicial',
      status: 'active',
      severity: 'critical',
      type: 'product',
      responsibleUserId: 'user_001',
      responsibleUserName: 'João Silva',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      quantity: 150,
      quantityReleased: 0,
      received: true,
      observations: 'Produto recebido via ERP, bloqueio automático devido a falha crítica',
      inspectionHistory: {
        status: 'rejected',
        lastInspectionDate: '2024-01-15T09:00:00Z',
        inspectorName: 'Maria Santos',
        observations: 'Falha no sistema de segurança, risco de superaquecimento'
      },
      reworkStatus: {
        status: 'pending',
        requestedBy: 'João Silva',
        requestedAt: '2024-01-15T11:00:00Z',
        team: 'thai'
      },
      history: [
        {
          id: 'hist_001',
          action: 'created',
          userId: 'user_001',
          userName: 'João Silva',
          timestamp: '2024-01-15T10:30:00Z',
          details: { reason: 'Não conformidade crítica detectada' }
        }
      ]
    },
    {
      id: 'block_002',
      productId: 'prod_002',
      productCode: 'BAT-002',
      productDescription: 'Bateria Recarregável 2000mAh',
      reason: 'Suspeita de contaminação por metais pesados',
      status: 'active',
      severity: 'high',
      type: 'material',
      responsibleUserId: 'user_002',
      responsibleUserName: 'Ana Costa',
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-14T14:20:00Z',
      quantity: 500,
      quantityReleased: 0,
      received: false,
      observations: 'Produto chegou via e-mail, sem entrada formal no ERP',
      inspectionHistory: {
        status: 'not_inspected',
        lastInspectionDate: null,
        inspectorName: null,
        observations: 'Aguardando inspeção de qualidade'
      },
      reworkStatus: {
        status: 'in_progress',
        requestedBy: 'Ana Costa',
        requestedAt: '2024-01-14T15:00:00Z',
        team: 'quality'
      },
      history: [
        {
          id: 'hist_002',
          action: 'created',
          userId: 'user_002',
          userName: 'Ana Costa',
          timestamp: '2024-01-14T14:20:00Z',
          details: { reason: 'Suspeita de contaminação' }
        },
        {
          id: 'hist_003',
          action: 'rework_requested',
          userId: 'user_002',
          userName: 'Ana Costa',
          timestamp: '2024-01-14T15:00:00Z',
          details: { team: 'quality', reason: 'Análise de metais pesados necessária' }
        }
      ]
    },
    {
      id: 'block_003',
      productId: 'prod_003',
      productCode: 'FOR-003',
      productDescription: 'Fornecedor ABC Eletrônicos',
      reason: 'Histórico de atrasos e não conformidades',
      status: 'active',
      severity: 'medium',
      type: 'supplier',
      responsibleUserId: 'user_003',
      responsibleUserName: 'Carlos Lima',
      createdAt: '2024-01-13T08:45:00Z',
      updatedAt: '2024-01-13T08:45:00Z',
      quantity: null,
      quantityReleased: null,
      received: true,
      observations: 'Bloqueio preventivo devido ao histórico do fornecedor',
      inspectionHistory: {
        status: 'approved',
        lastInspectionDate: '2024-01-12T16:00:00Z',
        inspectorName: 'Pedro Oliveira',
        observations: 'Última inspeção aprovada, mas histórico preocupante'
      },
      reworkStatus: {
        status: 'completed',
        requestedBy: 'Carlos Lima',
        requestedAt: '2024-01-13T09:00:00Z',
        completedAt: '2024-01-13T17:00:00Z',
        team: 'engineering'
      },
      history: [
        {
          id: 'hist_004',
          action: 'created',
          userId: 'user_003',
          userName: 'Carlos Lima',
          timestamp: '2024-01-13T08:45:00Z',
          details: { reason: 'Histórico de atrasos' }
        },
        {
          id: 'hist_005',
          action: 'rework_requested',
          userId: 'user_003',
          userName: 'Carlos Lima',
          timestamp: '2024-01-13T09:00:00Z',
          details: { team: 'engineering', reason: 'Revisão de processos' }
        }
      ]
    },
    {
      id: 'block_004',
      productId: 'prod_004',
      productCode: 'PRO-004',
      productDescription: 'Processo de Montagem Automatizada',
      reason: 'Falha no sistema de controle de qualidade',
      status: 'inactive',
      severity: 'low',
      type: 'process',
      responsibleUserId: 'user_004',
      responsibleUserName: 'Fernanda Rocha',
      createdAt: '2024-01-12T11:15:00Z',
      updatedAt: '2024-01-12T16:30:00Z',
      quantity: null,
      quantityReleased: null,
      received: true,
      observations: 'Bloqueio temporário para manutenção preventiva',
      inspectionHistory: {
        status: 'approved',
        lastInspectionDate: '2024-01-12T10:00:00Z',
        inspectorName: 'Roberto Alves',
        observations: 'Sistema funcionando normalmente após manutenção'
      },
      reworkStatus: {
        status: 'completed',
        requestedBy: 'Fernanda Rocha',
        requestedAt: '2024-01-12T12:00:00Z',
        completedAt: '2024-01-12T16:00:00Z',
        team: 'engineering'
      },
      history: [
        {
          id: 'hist_006',
          action: 'created',
          userId: 'user_004',
          userName: 'Fernanda Rocha',
          timestamp: '2024-01-12T11:15:00Z',
          details: { reason: 'Falha no sistema' }
        },
        {
          id: 'hist_007',
          action: 'updated',
          userId: 'user_004',
          userName: 'Fernanda Rocha',
          timestamp: '2024-01-12T16:30:00Z',
          details: { status: 'inactive', reason: 'Manutenção concluída' }
        }
      ]
    },
    {
      id: 'block_005',
      productId: 'prod_005',
      productCode: 'CAB-005',
      productDescription: 'Cabo de Alimentação 2m',
      reason: 'Teste de resistência elétrica falhou',
      status: 'pending',
      severity: 'high',
      type: 'material',
      responsibleUserId: 'user_005',
      responsibleUserName: 'Lucas Mendes',
      createdAt: '2024-01-16T09:00:00Z',
      updatedAt: '2024-01-16T09:00:00Z',
      quantity: 1000,
      quantityReleased: 0,
      received: true,
      observations: 'Aguardando análise técnica para determinar ação corretiva',
      inspectionHistory: {
        status: 'rejected',
        lastInspectionDate: '2024-01-16T08:30:00Z',
        inspectorName: 'Patrícia Santos',
        observations: 'Resistência elétrica abaixo do especificado'
      },
      reworkStatus: {
        status: 'pending',
        requestedBy: null,
        requestedAt: null,
        team: null
      },
      history: [
        {
          id: 'hist_008',
          action: 'created',
          userId: 'user_005',
          userName: 'Lucas Mendes',
          timestamp: '2024-01-16T09:00:00Z',
          details: { reason: 'Teste de resistência falhou' }
        }
      ]
    }
  ];

  const mockUnlockRequests: UnlockRequest[] = [
    {
      id: 'unlock_001',
      blockId: 'block_001',
      requestedBy: 'João Silva',
      requestedAt: '2024-01-16T10:00:00Z',
      quantity: 50,
      reason: 'Necessidade urgente para produção de teste',
      status: 'pending',
      observations: 'Apenas para testes de validação'
    },
    {
      id: 'unlock_002',
      blockId: 'block_002',
      requestedBy: 'Ana Costa',
      requestedAt: '2024-01-15T16:30:00Z',
      quantity: 100,
      reason: 'Análise laboratorial concluída, produto aprovado',
      status: 'approved',
      approvedBy: 'Carlos Lima',
      approvedAt: '2024-01-16T08:00:00Z',
      observations: 'Relatório de análise anexado'
    },
    {
      id: 'unlock_003',
      blockId: 'block_003',
      requestedBy: 'Pedro Oliveira',
      requestedAt: '2024-01-14T14:00:00Z',
      quantity: 200,
      reason: 'Retrabalho concluído com sucesso',
      status: 'approved',
      approvedBy: 'Fernanda Rocha',
      approvedAt: '2024-01-15T10:00:00Z',
      observations: 'Processo de melhoria implementado'
    },
    {
      id: 'unlock_004',
      blockId: 'block_001',
      requestedBy: 'Maria Santos',
      requestedAt: '2024-01-16T11:00:00Z',
      quantity: 25,
      reason: 'Inspeção de retrabalho aprovada',
      status: 'rejected',
      approvedBy: 'João Silva',
      approvedAt: '2024-01-16T11:30:00Z',
      observations: 'Rejeitado - ainda há riscos de segurança'
    },
    {
      id: 'unlock_005',
      blockId: 'block_005',
      requestedBy: 'Lucas Mendes',
      requestedAt: '2024-01-16T12:00:00Z',
      quantity: 150,
      reason: 'Novo lote com especificações corrigidas',
      status: 'pending',
      observations: 'Fornecedor enviou novo lote com correções'
    }
  ];

  // Fetch blocks data
  const { data: blocks = mockBlocks, isLoading } = useQuery<Block[]>({
    queryKey: ['/api/blocks'],
    enabled: user?.role && ['block_control', 'coordenador', 'admin'].includes(user.role)
  });

  // Fetch unlock requests
  const { data: unlockRequests = mockUnlockRequests } = useQuery<UnlockRequest[]>({
    queryKey: ['/api/unlock-requests'],
    enabled: user?.role && ['block_control', 'coordenador', 'admin'].includes(user.role)
  });

  // Mutations
  const createBlockMutation = useMutation({
    mutationFn: (data: Partial<Block>) => apiRequest('/api/blocks', { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blocks'] });
      toast({ title: 'Bloqueio criado com sucesso!' });
    }
  });

  const updateBlockMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Block> }) => 
      apiRequest(`/api/blocks/${id}`, { method: 'PATCH', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blocks'] });
      toast({ title: 'Bloqueio atualizado com sucesso!' });
    }
  });

  const unlockRequestMutation = useMutation({
    mutationFn: (data: Partial<UnlockRequest>) => 
      apiRequest('/api/unlock-requests', { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/unlock-requests'] });
      toast({ title: 'Solicitação de desbloqueio enviada!' });
      setIsUnlockDialogOpen(false);
    }
  });

  const reworkRequestMutation = useMutation({
    mutationFn: (data: { blockId: string; team: string; reason: string }) => 
      apiRequest('/api/rework-requests', { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blocks'] });
      toast({ title: 'Solicitação de retrabalho enviada para equipe Thai!' });
      setIsReworkDialogOpen(false);
    }
  });

  // Filter blocks based on current filters
  const filteredBlocks = blocks.filter(block => {
    const matchesStatus = filters.status === 'all' || block.status === filters.status;
    const matchesType = filters.type === 'all' || block.type === filters.type;
    const matchesSeverity = filters.severity === 'all' || block.severity === filters.severity;
    const matchesReceived = filters.received === 'all' || 
      (filters.received === 'received' ? block.received : !block.received);
    const matchesSearch = searchTerm === '' || 
      block.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.productDescription.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesType && matchesSeverity && matchesReceived && matchesSearch;
  });

  // Statistics
  const stats = {
    total: blocks.length,
    active: blocks.filter(b => b.status === 'active').length,
    critical: blocks.filter(b => b.severity === 'critical').length,
    notReceived: blocks.filter(b => !b.received).length,
    pendingUnlock: unlockRequests.filter(r => r.status === 'pending').length
  };

  // Alert for critical products not blocked
  const criticalNotBlocked = blocks.filter(b => 
    b.severity === 'critical' && b.status !== 'active'
  );

  // Alert for products not received
  const notReceived = blocks.filter(b => !b.received);

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'destructive',
      inactive: 'secondary',
      pending: 'default'
    };
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return <Badge className={colors[severity as keyof typeof colors]}>{severity}</Badge>;
  };

  const getInspectionStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="secondary">Sem inspeção</Badge>;
    
    const variants = {
      approved: 'default',
      rejected: 'destructive',
      not_inspected: 'secondary'
    };
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getReworkStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="secondary">Pendente</Badge>;
    
    const variants = {
      pending: 'secondary',
      in_progress: 'default',
      completed: 'default'
    };
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const canUnlock = (block: Block) => {
    const hasInspection = block.inspectionHistory?.status === 'approved';
    const hasRework = block.reworkStatus?.status === 'completed';
    return hasInspection || hasRework;
  };

  const handleUnlockRequest = (block: Block, quantity: number, reason: string) => {
    unlockRequestMutation.mutate({
      blockId: block.id,
      quantity,
      reason,
      requestedBy: user?.id || '',
      status: 'pending'
    });
  };

  const handleReworkRequest = (block: Block, team: string, reason: string) => {
    reworkRequestMutation.mutate({
      blockId: block.id,
      team,
      reason
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Bloqueios</h1>
          <p className="text-gray-600">Controle de bloqueios de produtos e insumos</p>
        </div>
                 <Button 
           className="flex items-center gap-2"
           onClick={() => setIsNewBlockDialogOpen(true)}
         >
           <Plus className="h-4 w-4" />
           Novo Bloqueio
         </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-red-600">{stats.active}</p>
              </div>
              <Lock className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Não Recebidos</p>
                <p className="text-2xl font-bold text-orange-600">{stats.notReceived}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes Desbloqueio</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pendingUnlock}</p>
              </div>
              <Unlock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Panel */}
      {(criticalNotBlocked.length > 0 || notReceived.length > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Bell className="h-5 w-5" />
              Alertas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {criticalNotBlocked.length > 0 && (
              <div className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">
                  {criticalNotBlocked.length} produto(s) crítico(s) não estão bloqueados!
                </span>
              </div>
            )}
            {notReceived.length > 0 && (
              <div className="flex items-center gap-2 text-orange-700">
                <Info className="h-4 w-4" />
                <span className="font-medium">
                  {notReceived.length} produto(s) não foram recebidos formalmente!
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por código ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="product">Produto</SelectItem>
                <SelectItem value="material">Material</SelectItem>
                <SelectItem value="supplier">Fornecedor</SelectItem>
                <SelectItem value="process">Processo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.severity} onValueChange={(value) => setFilters({...filters, severity: value})}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.received} onValueChange={(value) => setFilters({...filters, received: value})}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Recebido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="received">Recebido</SelectItem>
                <SelectItem value="not_received">Não Recebido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="blocks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="blocks">Bloqueios ({filteredBlocks.length})</TabsTrigger>
          <TabsTrigger value="unlock-requests">Solicitações de Desbloqueio ({stats.pendingUnlock})</TabsTrigger>
        </TabsList>

        <TabsContent value="blocks">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Bloqueios</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                                 <TableHeader>
                   <TableRow>
                     <TooltipProvider>
                       <TableHead>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">
                             Produto
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Código e descrição do produto bloqueado</p>
                           </TooltipContent>
                         </Tooltip>
                       </TableHead>
                       <TableHead>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">
                             Bloqueado?
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Status atual do bloqueio: Ativo, Inativo ou Pendente</p>
                           </TooltipContent>
                         </Tooltip>
                       </TableHead>
                       <TableHead>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">
                             Recebido?
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Se o produto foi recebido formalmente no sistema ERP</p>
                           </TooltipContent>
                         </Tooltip>
                       </TableHead>
                       <TableHead>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">
                             Histórico de Inspeção
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Resultado da última inspeção: Aprovado, Reprovado ou Sem inspeção</p>
                           </TooltipContent>
                         </Tooltip>
                       </TableHead>
                       <TableHead>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">
                             Status de Retrabalho
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Status do retrabalho solicitado: Pendente, Em andamento ou Concluído</p>
                           </TooltipContent>
                         </Tooltip>
                       </TableHead>
                       <TableHead>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">
                             Severidade
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Nível de criticidade: Crítica, Alta, Média ou Baixa</p>
                           </TooltipContent>
                         </Tooltip>
                       </TableHead>
                       <TableHead>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">
                             Responsável
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Usuário responsável pelo bloqueio e motivo</p>
                           </TooltipContent>
                         </Tooltip>
                       </TableHead>
                       <TableHead>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">
                             Data
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Data e hora de criação do bloqueio</p>
                           </TooltipContent>
                         </Tooltip>
                       </TableHead>
                       <TableHead>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">
                             Ações
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Ações disponíveis: Visualizar, Desbloquear, Solicitar retrabalho e Histórico</p>
                           </TooltipContent>
                         </Tooltip>
                       </TableHead>
                     </TooltipProvider>
                   </TableRow>
                 </TableHeader>
                <TableBody>
                  {filteredBlocks.map((block) => (
                    <TableRow key={block.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{block.productCode}</div>
                          <div className="text-sm text-gray-500">{block.productDescription}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(block.status)}
                      </TableCell>
                      <TableCell>
                        {block.received ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Sim
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Não
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {getInspectionStatusBadge(block.inspectionHistory?.status)}
                      </TableCell>
                      <TableCell>
                        {getReworkStatusBadge(block.reworkStatus?.status)}
                      </TableCell>
                      <TableCell>
                        {getSeverityBadge(block.severity)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{block.responsibleUserName}</div>
                          <div className="text-gray-500">{block.reason}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(block.createdAt).toLocaleDateString()}</div>
                          <div className="text-gray-500">{new Date(block.createdAt).toLocaleTimeString()}</div>
                        </div>
                      </TableCell>
                                             <TableCell>
                         <div className="flex items-center gap-2">
                           <TooltipProvider>
                             <Tooltip>
                               <TooltipTrigger asChild>
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => setSelectedBlock(block)}
                                 >
                                   <Eye className="h-4 w-4" />
                                 </Button>
                               </TooltipTrigger>
                               <TooltipContent>
                                 <p>Visualizar detalhes do bloqueio</p>
                               </TooltipContent>
                             </Tooltip>
                             {block.status === 'active' && canUnlock(block) && (
                               <Tooltip>
                                 <TooltipTrigger asChild>
                                   <Button
                                     variant="outline"
                                     size="sm"
                                     onClick={() => {
                                       setSelectedBlock(block);
                                       setIsUnlockDialogOpen(true);
                                     }}
                                   >
                                     <Unlock className="h-4 w-4" />
                                   </Button>
                                 </TooltipTrigger>
                                 <TooltipContent>
                                   <p>Desbloquear produto (apenas se inspeção aprovada ou retrabalho concluído)</p>
                                 </TooltipContent>
                               </Tooltip>
                             )}
                             {block.status === 'active' && (
                               <Tooltip>
                                 <TooltipTrigger asChild>
                                   <Button
                                     variant="outline"
                                     size="sm"
                                     onClick={() => {
                                       setSelectedBlock(block);
                                       setIsReworkDialogOpen(true);
                                     }}
                                   >
                                     <RefreshCw className="h-4 w-4" />
                                   </Button>
                                 </TooltipTrigger>
                                 <TooltipContent>
                                   <p>Solicitar retrabalho para equipe</p>
                                 </TooltipContent>
                               </Tooltip>
                             )}
                             <Tooltip>
                               <TooltipTrigger asChild>
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => {
                                     setSelectedBlock(block);
                                     setIsHistoryDialogOpen(true);
                                   }}
                                 >
                                   <History className="h-4 w-4" />
                                 </Button>
                               </TooltipTrigger>
                               <TooltipContent>
                                 <p>Ver histórico completo de ações</p>
                               </TooltipContent>
                             </Tooltip>
                           </TooltipProvider>
                         </div>
                       </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unlock-requests">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Desbloqueio</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                                 <TableHeader>
                   <TableRow>
                     <TooltipProvider>
                       <TableHead>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">
                             Produto
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>ID do produto bloqueado</p>
                           </TooltipContent>
                         </Tooltip>
                       </TableHead>
                       <TableHead>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">
                             Solicitante
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Usuário que solicitou o desbloqueio</p>
                           </TooltipContent>
                         </Tooltip>
                       </TableHead>
                       <TableHead>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">
                             Quantidade
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Quantidade solicitada para desbloqueio</p>
                           </TooltipContent>
                         </Tooltip>
                       </TableHead>
                       <TableHead>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">
                             Motivo
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Justificativa para o desbloqueio</p>
                           </TooltipContent>
                         </Tooltip>
                       </TableHead>
                       <TableHead>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">
                             Status
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Status da solicitação: Pendente, Aprovada ou Rejeitada</p>
                           </TooltipContent>
                         </Tooltip>
                       </TableHead>
                       <TableHead>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">
                             Data
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Data da solicitação</p>
                           </TooltipContent>
                         </Tooltip>
                       </TableHead>
                       <TableHead>
                         <Tooltip>
                           <TooltipTrigger className="cursor-help">
                             Ações
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Ações disponíveis: Visualizar, Aprovar ou Rejeitar</p>
                           </TooltipContent>
                         </Tooltip>
                       </TableHead>
                     </TooltipProvider>
                   </TableRow>
                 </TableHeader>
                <TableBody>
                  {unlockRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="font-medium">{request.blockId}</div>
                      </TableCell>
                      <TableCell>{request.requestedBy}</TableCell>
                      <TableCell>{request.quantity}</TableCell>
                      <TableCell>{request.reason}</TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </TableCell>
                                             <TableCell>
                         <div className="flex items-center gap-2">
                           <TooltipProvider>
                             <Tooltip>
                               <TooltipTrigger asChild>
                                 <Button variant="outline" size="sm">
                                   <Eye className="h-4 w-4" />
                                 </Button>
                               </TooltipTrigger>
                               <TooltipContent>
                                 <p>Visualizar detalhes da solicitação</p>
                               </TooltipContent>
                             </Tooltip>
                             {request.status === 'pending' && (
                               <>
                                 <Tooltip>
                                   <TooltipTrigger asChild>
                                     <Button variant="outline" size="sm">
                                       <CheckCircle className="h-4 w-4" />
                                     </Button>
                                   </TooltipTrigger>
                                   <TooltipContent>
                                     <p>Aprovar solicitação de desbloqueio</p>
                                   </TooltipContent>
                                 </Tooltip>
                                 <Tooltip>
                                   <TooltipTrigger asChild>
                                     <Button variant="outline" size="sm">
                                       <XCircle className="h-4 w-4" />
                                     </Button>
                                   </TooltipTrigger>
                                   <TooltipContent>
                                     <p>Rejeitar solicitação de desbloqueio</p>
                                   </TooltipContent>
                                 </Tooltip>
                               </>
                             )}
                           </TooltipProvider>
                         </div>
                       </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Unlock Dialog */}
      <Dialog open={isUnlockDialogOpen} onOpenChange={setIsUnlockDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Desbloquear Produto</DialogTitle>
          </DialogHeader>
          {selectedBlock && (
            <div className="space-y-4">
              <div>
                <Label>Produto</Label>
                <div className="text-sm text-gray-600">
                  {selectedBlock.productCode} - {selectedBlock.productDescription}
                </div>
              </div>
                             <TooltipProvider>
                 <div>
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <Label htmlFor="quantity" className="cursor-help">
                         Quantidade a liberar
                       </Label>
                     </TooltipTrigger>
                     <TooltipContent>
                       <p>Quantidade que será desbloqueada (máximo: {selectedBlock.quantity || 1} unidades)</p>
                     </TooltipContent>
                   </Tooltip>
                   <Input
                     id="quantity"
                     type="number"
                     min="1"
                     max={selectedBlock.quantity || 1}
                     placeholder="Quantidade"
                   />
                 </div>
                 <div>
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <Label htmlFor="reason" className="cursor-help">
                         Motivo do desbloqueio
                       </Label>
                     </TooltipTrigger>
                     <TooltipContent>
                       <p>Justificativa para o desbloqueio (ex: inspeção aprovada, retrabalho concluído, necessidade urgente)</p>
                     </TooltipContent>
                   </Tooltip>
                   <Textarea
                     id="reason"
                     placeholder="Descreva o motivo do desbloqueio..."
                     rows={3}
                   />
                 </div>
               </TooltipProvider>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsUnlockDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  const quantity = (document.getElementById('quantity') as HTMLInputElement)?.value;
                  const reason = (document.getElementById('reason') as HTMLTextAreaElement)?.value;
                  if (quantity && reason) {
                    handleUnlockRequest(selectedBlock, parseInt(quantity), reason);
                  }
                }}>
                  Desbloquear
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rework Dialog */}
      <Dialog open={isReworkDialogOpen} onOpenChange={setIsReworkDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar Retrabalho</DialogTitle>
          </DialogHeader>
          {selectedBlock && (
            <div className="space-y-4">
              <div>
                <Label>Produto</Label>
                <div className="text-sm text-gray-600">
                  {selectedBlock.productCode} - {selectedBlock.productDescription}
                </div>
              </div>
                             <TooltipProvider>
                 <div>
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <Label htmlFor="team" className="cursor-help">
                         Equipe
                       </Label>
                     </TooltipTrigger>
                     <TooltipContent>
                       <p>Selecione a equipe responsável pelo retrabalho: Thai (produção), Qualidade (análises) ou Engenharia (processos)</p>
                     </TooltipContent>
                   </Tooltip>
                   <Select>
                     <SelectTrigger>
                       <SelectValue placeholder="Selecione a equipe" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="thai">Equipe Thai</SelectItem>
                       <SelectItem value="quality">Qualidade</SelectItem>
                       <SelectItem value="engineering">Engenharia</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <div>
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <Label htmlFor="rework-reason" className="cursor-help">
                         Motivo do retrabalho
                       </Label>
                     </TooltipTrigger>
                     <TooltipContent>
                       <p>Descreva o que precisa ser corrigido ou melhorado no produto/material</p>
                     </TooltipContent>
                   </Tooltip>
                   <Textarea
                     id="rework-reason"
                     placeholder="Descreva o motivo do retrabalho..."
                     rows={3}
                   />
                 </div>
               </TooltipProvider>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsReworkDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  const team = 'thai'; // Get from select
                  const reason = (document.getElementById('rework-reason') as HTMLTextAreaElement)?.value;
                  if (reason) {
                    handleReworkRequest(selectedBlock, team, reason);
                  }
                }}>
                  Solicitar Retrabalho
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Histórico Completo</DialogTitle>
          </DialogHeader>
          {selectedBlock && (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-medium">{selectedBlock.productCode}</h3>
                <p className="text-sm text-gray-600">{selectedBlock.productDescription}</p>
              </div>
              <div className="space-y-2">
                {selectedBlock.history?.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entry.userName}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {entry.action === 'created' && 'Bloqueio criado'}
                        {entry.action === 'updated' && 'Bloqueio atualizado'}
                        {entry.action === 'released' && 'Produto desbloqueado'}
                        {entry.action === 'rework_requested' && 'Retrabalho solicitado'}
                      </div>
                      {entry.details && (
                        <div className="text-xs text-gray-500 mt-1">
                          {JSON.stringify(entry.details)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar Histórico
                </Button>
              </div>
            </div>
          )}
                 </DialogContent>
       </Dialog>

       {/* New Block Dialog */}
       <Dialog open={isNewBlockDialogOpen} onOpenChange={setIsNewBlockDialogOpen}>
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle>Criar Novo Bloqueio</DialogTitle>
           </DialogHeader>
                        <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <TooltipProvider>
                   <div>
                     <Tooltip>
                       <TooltipTrigger asChild>
                         <Label htmlFor="productCode" className="cursor-help">
                           Código do Produto
                         </Label>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>Digite o código único do produto (ex: FRE-001, BAT-002)</p>
                       </TooltipContent>
                     </Tooltip>
                     <Input
                       id="productCode"
                       placeholder="Ex: FRE-001"
                     />
                   </div>
                   <div>
                     <Tooltip>
                       <TooltipTrigger asChild>
                         <Label htmlFor="productDescription" className="cursor-help">
                           Descrição do Produto
                         </Label>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>Nome completo e descrição detalhada do produto</p>
                       </TooltipContent>
                     </Tooltip>
                     <Input
                       id="productDescription"
                       placeholder="Ex: Fritadeira Elétrica Air Fryer 4L"
                     />
                   </div>
                 </TooltipProvider>
               </div>
             
                            <div className="grid grid-cols-2 gap-4">
                 <TooltipProvider>
                   <div>
                     <Tooltip>
                       <TooltipTrigger asChild>
                         <Label htmlFor="blockType" className="cursor-help">
                           Tipo de Bloqueio
                         </Label>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>Selecione o tipo: Produto (item final), Material (insumo), Fornecedor (empresa) ou Processo (sistema)</p>
                       </TooltipContent>
                     </Tooltip>
                     <Select>
                       <SelectTrigger>
                         <SelectValue placeholder="Selecione o tipo" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="product">Produto</SelectItem>
                         <SelectItem value="material">Material</SelectItem>
                         <SelectItem value="supplier">Fornecedor</SelectItem>
                         <SelectItem value="process">Processo</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   <div>
                     <Tooltip>
                       <TooltipTrigger asChild>
                         <Label htmlFor="severity" className="cursor-help">
                           Severidade
                         </Label>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>Nível de criticidade: Crítica (risco alto), Alta, Média ou Baixa (risco mínimo)</p>
                       </TooltipContent>
                     </Tooltip>
                     <Select>
                       <SelectTrigger>
                         <SelectValue placeholder="Selecione a severidade" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="critical">Crítica</SelectItem>
                         <SelectItem value="high">Alta</SelectItem>
                         <SelectItem value="medium">Média</SelectItem>
                         <SelectItem value="low">Baixa</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                 </TooltipProvider>
               </div>

                            <div className="grid grid-cols-2 gap-4">
                 <TooltipProvider>
                   <div>
                     <Tooltip>
                       <TooltipTrigger asChild>
                         <Label htmlFor="quantity" className="cursor-help">
                           Quantidade
                         </Label>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>Quantidade total do produto/material bloqueado (deixe vazio para fornecedor/processo)</p>
                       </TooltipContent>
                     </Tooltip>
                     <Input
                       id="quantity"
                       type="number"
                       placeholder="Quantidade bloqueada"
                     />
                   </div>
                   <div>
                     <Tooltip>
                       <TooltipTrigger asChild>
                         <Label htmlFor="received" className="cursor-help">
                           Recebido Formalmente
                         </Label>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>Se o produto foi recebido via ERP (Sim) ou chegou por e-mail/outro meio (Não)</p>
                       </TooltipContent>
                     </Tooltip>
                     <Select>
                       <SelectTrigger>
                         <SelectValue placeholder="Status de recebimento" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="true">Sim</SelectItem>
                         <SelectItem value="false">Não</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                 </TooltipProvider>
               </div>

                            <TooltipProvider>
                 <div>
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <Label htmlFor="reason" className="cursor-help">
                         Motivo do Bloqueio
                       </Label>
                     </TooltipTrigger>
                     <TooltipContent>
                       <p>Descreva detalhadamente o motivo que levou ao bloqueio (ex: falha na inspeção, suspeita de contaminação)</p>
                     </TooltipContent>
                   </Tooltip>
                   <Textarea
                     id="reason"
                     placeholder="Descreva o motivo do bloqueio..."
                     rows={3}
                   />
                 </div>

                 <div>
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <Label htmlFor="observations" className="cursor-help">
                         Observações
                       </Label>
                     </TooltipTrigger>
                     <TooltipContent>
                       <p>Informações adicionais, contexto ou detalhes complementares sobre o bloqueio</p>
                     </TooltipContent>
                   </Tooltip>
                   <Textarea
                     id="observations"
                     placeholder="Observações adicionais..."
                     rows={2}
                   />
                 </div>
               </TooltipProvider>

             <div className="flex justify-end gap-2">
               <Button variant="outline" onClick={() => setIsNewBlockDialogOpen(false)}>
                 Cancelar
               </Button>
               <Button onClick={() => {
                 toast({ title: 'Bloqueio criado com sucesso!' });
                 setIsNewBlockDialogOpen(false);
               }}>
                 Criar Bloqueio
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>
     </div>
   );
 }

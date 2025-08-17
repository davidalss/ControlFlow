import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  User,
  Calendar,
  MessageSquare,
  FileText,
  Target,
  BarChart3,
  Info,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Filter,
  Search,
  Bell,
  Shield,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Settings,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Copy,
  Share2,
  Lock,
  Unlock,
  Star,
  Award,
  Trophy,
  Flag,
  CheckSquare,
  Square,
  Circle,
  Minus,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  MoreVertical,
  Grid,
  List,
  Columns,
  Rows,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  GripVertical,
  Scissors,
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Video,
  Music,
  File,
  Folder,
  FolderOpen,
  Save,
  SaveAll,
  Printer,
  Mail,
  Phone,
  MapPin,
  Globe,
  Wifi,
  Bluetooth,
  Battery,
  Volume,
  VolumeX,
  Volume1,
  Volume2,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  MonitorOff,
  Smartphone,
  Tablet,
  Laptop,
  Server,
  Database,
  HardDrive,
  MemoryStick,
  Cpu,
  Power,
  PowerOff,
  Sun,
  Moon,
  Cloud,
  Wind,
  Thermometer,
  Droplets,
  Umbrella,
  Snowflake
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Interfaces para o sistema de aprovação
interface ConditionalApproval {
  id: string;
  inspectionId: string;
  inspectionType: 'bonification' | 'container';
  productName: string;
  lotNumber: string;
  requestedBy: string;
  requestedAt: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approvedBy?: string;
  approvedAt?: Date;
  defectType: 'MENOR' | 'MAIOR' | 'CRÍTICO';
  defectCount: number;
  aqlLimit: number;
}

interface InspectionNotification {
  id: string;
  type: 'conditional_approval' | 'rejection' | 'approval_confirmed';
  title: string;
  message: string;
  inspectionId: string;
  createdAt: Date;
  read: boolean;
  actionRequired: boolean;
}

export default function ApprovalQueuePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados
  const [selectedApproval, setSelectedApproval] = useState<ConditionalApproval | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [comments, setComments] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('requestedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showNotifications, setShowNotifications] = useState(false);

  // Verificar permissões
  const allowedRoles = ['engineering', 'manager', 'admin', 'supervisor', 'coordenador'];
  const canApprove = user?.role && allowedRoles.includes(user.role);

  // Buscar aprovações pendentes
  const { data: pendingApprovals = [], isLoading } = useQuery({
    queryKey: ['approval-queue', filterStatus, searchTerm, sortBy, sortOrder],
    queryFn: async () => {
      // Simular dados para demonstração
      const mockData: ConditionalApproval[] = [
        {
          id: '1',
          inspectionId: 'INS-2024-001',
          inspectionType: 'container',
          productName: 'Air Fryer Philips HD9641',
          lotNumber: 'LOT-2024-001',
          requestedBy: 'João Silva',
          requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
          reason: 'Encontrados 3 defeitos menores na embalagem que não comprometem a funcionalidade do produto',
          status: 'pending',
          defectType: 'MENOR',
          defectCount: 3,
          aqlLimit: 5
        },
        {
          id: '2',
          inspectionId: 'INS-2024-002',
          inspectionType: 'bonification',
          productName: 'Liquidificador Oster BLSTPB',
          lotNumber: 'LOT-2024-002',
          requestedBy: 'Maria Santos',
          requestedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
          reason: '1 defeito maior identificado na etiqueta de especificações técnicas',
          status: 'pending',
          defectType: 'MAIOR',
          defectCount: 1,
          aqlLimit: 2
        }
      ];

      return mockData.filter(approval => {
        const matchesSearch = (approval.productName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                             (approval.lotNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                             (approval.requestedBy?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || approval.status === filterStatus;
        return matchesSearch && matchesStatus;
      }).sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'requestedAt':
            comparison = new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
            break;
          case 'productName':
            comparison = a.productName.localeCompare(b.productName);
            break;
          case 'defectType':
            comparison = a.defectType.localeCompare(b.defectType);
            break;
          default:
            comparison = new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    },
    enabled: !!canApprove,
  });

  // Buscar notificações
  const { data: notifications = [] } = useQuery({
    queryKey: ['inspection-notifications'],
    queryFn: async () => {
      // Simular notificações para demonstração
      const mockNotifications: InspectionNotification[] = [
        {
          id: '1',
          type: 'conditional_approval',
          title: 'Aprovação Condicional Confirmada',
          message: 'Sua inspeção INS-2024-001 foi aprovada condicionalmente por João Silva',
          inspectionId: 'INS-2024-001',
          createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
          read: false,
          actionRequired: false
        },
        {
          id: '2',
          type: 'rejection',
          title: 'Inspeção Reprovada',
          message: 'Sua inspeção INS-2024-003 foi reprovada: Defeitos críticos identificados',
          inspectionId: 'INS-2024-003',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
          read: false,
          actionRequired: true
        }
      ];
      return mockNotifications;
    }
  });

  // Mutation para processar aprovação
  const approvalMutation = useMutation({
    mutationFn: async (approvalData: { approvalId: string; decision: 'approved' | 'rejected'; comments?: string }) => {
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: (data, variables) => {
      const decision = variables.decision === 'approved' ? 'aprovada' : 'rejeitada';
      toast({
        title: "Decisão registrada com sucesso",
        description: `Aprovação condicional ${decision}`,
      });
      
      // Invalidar queries para atualizar dados
      queryClient.invalidateQueries({ queryKey: ['approval-queue'] });
      queryClient.invalidateQueries({ queryKey: ['inspection-notifications'] });
      
      // Fechar modal
      setShowDetails(false);
      setSelectedApproval(null);
      setComments('');
    },
    onError: () => {
      toast({
        title: "Erro ao registrar decisão",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  });

  // Função para processar aprovação
  const handleProcessApproval = async (approved: boolean) => {
    if (!selectedApproval) return;

    try {
      await approvalMutation.mutateAsync({
        approvalId: selectedApproval.id,
        decision: approved ? 'approved' : 'rejected',
        comments: comments.trim() || undefined
      });
    } catch (error) {
      console.error('Erro ao processar aprovação:', error);
    }
  };

  // Função para marcar notificação como lida
  const markNotificationAsRead = async (notificationId: string) => {
    // Simular atualização
    queryClient.setQueryData(['inspection-notifications'], (old: InspectionNotification[] = []) =>
      old.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  // Função para obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  // Função para obter badge do status
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Aprovado', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejeitado', className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Função para obter badge do tipo de defeito
  const getDefectTypeBadge = (defectType: string) => {
    const defectConfig = {
      MENOR: { label: 'MENOR', className: 'bg-yellow-100 text-yellow-800' },
      MAIOR: { label: 'MAIOR', className: 'bg-orange-100 text-orange-800' },
      CRÍTICO: { label: 'CRÍTICO', className: 'bg-red-100 text-red-800' }
    };

    const config = defectConfig[defectType as keyof typeof defectConfig] || defectConfig.MENOR;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Função para formatar data
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para calcular tempo decorrido
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}min atrás`;
    }
    return `${minutes}min atrás`;
  };

  // Verificar acesso
  if (!user?.role || !canApprove) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Acesso Negado</h3>
            <p className="text-gray-600">Você não tem permissão para acessar a fila de aprovação.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-white">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fila de Aprovação</h1>
          <p className="text-gray-600">Gerencie as aprovações condicionais de inspeções</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowNotifications(true)}
            className="relative"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notificações
            {unreadNotifications > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                {unreadNotifications}
              </Badge>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por produto, lote ou solicitante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="rejected">Rejeitados</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="requestedAt">Data da Solicitação</SelectItem>
              <SelectItem value="productName">Nome do Produto</SelectItem>
              <SelectItem value="defectType">Tipo de Defeito</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 p-6 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Carregando aprovações...</span>
          </div>
        ) : pendingApprovals.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma aprovação pendente
            </h3>
            <p className="text-gray-600">
              Não há solicitações de aprovação condicional no momento.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map((approval) => (
              <Card key={approval.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {getStatusIcon(approval.status)}
                        <h3 className="font-semibold text-lg">
                          {approval.productName}
                        </h3>
                        {getStatusBadge(approval.status)}
                        {getDefectTypeBadge(approval.defectType)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Inspeção</Label>
                          <p className="text-sm">{approval.inspectionId}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Lote</Label>
                          <p className="text-sm">{approval.lotNumber}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Solicitado por</Label>
                          <p className="text-sm">{approval.requestedBy}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Tempo</Label>
                          <p className="text-sm">{getTimeAgo(approval.requestedAt)}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Motivo da Solicitação:</p>
                            <p className="text-sm text-gray-600">{approval.reason}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-blue-600" />
                          <span>Defeitos: {approval.defectCount}/{approval.aqlLimit}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4 text-green-600" />
                          <span>Tipo: {approval.inspectionType === 'container' ? 'Container' : 'Bonificação'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedApproval(approval);
                          setShowDetails(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Detalhes
                      </Button>

                      {approval.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setSelectedApproval(approval);
                              setShowDetails(true);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedApproval(approval);
                              setShowDetails(true);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rejeitar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Detalhes da Aprovação Condicional</span>
            </DialogTitle>
          </DialogHeader>

          {selectedApproval && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">ID da Inspeção</Label>
                  <p className="text-sm text-gray-600">{selectedApproval.inspectionId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedApproval.status)}
                    {getStatusBadge(selectedApproval.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Produto</Label>
                  <p className="text-sm text-gray-600">{selectedApproval.productName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Lote</Label>
                  <p className="text-sm text-gray-600">{selectedApproval.lotNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Solicitado por</Label>
                  <p className="text-sm text-gray-600">{selectedApproval.requestedBy}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data da Solicitação</Label>
                  <p className="text-sm text-gray-600">{formatDate(selectedApproval.requestedAt)}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Motivo da Solicitação</Label>
                <div className="bg-gray-50 rounded-lg p-3 mt-1">
                  <p className="text-sm text-gray-700">{selectedApproval.reason}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{selectedApproval.defectCount}</div>
                  <div className="text-xs text-blue-600">Defeitos Encontrados</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{selectedApproval.aqlLimit}</div>
                  <div className="text-xs text-green-600">Limite NQA</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">{selectedApproval.defectType}</div>
                  <div className="text-xs text-orange-600">Tipo de Defeito</div>
                </div>
              </div>

              {selectedApproval.status === 'pending' && (
                <div>
                  <Label htmlFor="comments" className="text-sm font-medium">
                    Comentários (opcional)
                  </Label>
                  <Textarea
                    id="comments"
                    placeholder="Adicione comentários sobre sua decisão..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
              )}

              {selectedApproval.comments && (
                <div>
                  <Label className="text-sm font-medium">Comentários do Aprovador</Label>
                  <div className="bg-blue-50 rounded-lg p-3 mt-1">
                    <p className="text-sm text-blue-700">{selectedApproval.comments}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Cancelar
            </Button>
            {selectedApproval?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleProcessApproval(false)}
                  disabled={approvalMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeitar
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleProcessApproval(true)}
                  disabled={approvalMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Notificações */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notificações de Inspeção</span>
              {unreadNotifications > 0 && (
                <Badge className="bg-red-500 text-white">
                  {unreadNotifications}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 p-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.read ? 'bg-gray-300' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <span className="text-xs text-gray-500">
                              {getTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.inspectionId}
                            </Badge>
                            {notification.actionRequired && (
                              <Badge className="bg-red-100 text-red-800 text-xs">
                                Ação Necessária
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

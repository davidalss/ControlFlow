import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Tag,
  Eye,
  EyeOff,
  Download,
  Share2,
  Settings,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Save,
  Send,
  FileText,
  Image,
  Video,
  Camera,
  Target,
  Shield,
  Zap,
  Brain,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

// Tipos para o sistema de notificações de NC
export interface NCNotification {
  id: string;
  type: 'nc_detected' | 'nc_approved' | 'nc_rejected' | 'nc_resolved' | 'nc_escalated';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'quality' | 'safety' | 'functional' | 'visual' | 'packaging';
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Dados da NC
  ncId: string;
  stepId: string;
  productId: string;
  productName: string;
  inspectorId: string;
  inspectorName: string;
  
  // Detalhes técnicos
  defectType: 'MENOR' | 'MAIOR' | 'CRÍTICO';
  description: string;
  photos?: string[];
  correctiveAction?: string;
  estimatedResolutionTime?: number;
  
  // Metadados
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  assignedAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  
  // Configurações de notificação
  recipients: string[];
  escalationLevel: number;
  autoEscalate: boolean;
  escalationDelay: number; // em minutos
  
  // Histórico
  history: {
    timestamp: string;
    action: string;
    user: string;
    details: string;
  }[];
}

interface NCNotificationSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onNCResolved: (ncId: string, resolution: any) => void;
  onNCEscalated: (ncId: string, escalationLevel: number) => void;
}

export default function NCNotificationSystem({
  isOpen,
  onClose,
  onNCResolved,
  onNCEscalated
}: NCNotificationSystemProps) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NCNotification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<NCNotification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<NCNotification | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'severity' | 'priority' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Notificações de exemplo
  const mockNotifications: NCNotification[] = [
    {
      id: 'nc-1',
      type: 'nc_detected',
      title: 'Não Conformidade Detectada - Etiqueta',
      message: 'Etiqueta do produto Air Fryer 5L está ilegível',
      severity: 'medium',
      category: 'packaging',
      status: 'pending',
      priority: 'high',
      ncId: 'NC-001-2024',
      stepId: 'step-1',
      productId: 'prod-1',
      productName: 'Air Fryer 5L Digital',
      inspectorId: 'inspector-1',
      inspectorName: 'João Silva',
      defectType: 'MAIOR',
      description: 'A etiqueta do produto está parcialmente danificada, tornando difícil a leitura das especificações técnicas',
      photos: ['/photos/nc-etiqueta-1.jpg', '/photos/nc-etiqueta-2.jpg'],
      correctiveAction: 'Substituir etiqueta danificada por nova etiqueta legível',
      estimatedResolutionTime: 30,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      recipients: ['quality-manager@company.com', 'production-supervisor@company.com'],
      escalationLevel: 1,
      autoEscalate: true,
      escalationDelay: 120, // 2 horas
      history: [
        {
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          action: 'NC Detectada',
          user: 'João Silva',
          details: 'Inspetor detectou etiqueta ilegível durante inspeção'
        }
      ]
    },
    {
      id: 'nc-2',
      type: 'nc_detected',
      title: 'Não Conformidade Crítica - Tensão',
      message: 'Tensão do produto não está dentro da especificação',
      severity: 'critical',
      category: 'safety',
      status: 'in_review',
      priority: 'urgent',
      ncId: 'NC-002-2024',
      stepId: 'step-2',
      productId: 'prod-2',
      productName: 'Liquidificador Profissional',
      inspectorId: 'inspector-2',
      inspectorName: 'Maria Santos',
      defectType: 'CRÍTICO',
      description: 'O produto está configurado para 127V mas a especificação requer 220V',
      photos: ['/photos/nc-tensao-1.jpg'],
      correctiveAction: 'Reconfigurar produto para tensão correta ou substituir por unidade adequada',
      estimatedResolutionTime: 60,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hora atrás
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min atrás
      assignedTo: 'quality-engineer@company.com',
      assignedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      recipients: ['quality-manager@company.com', 'safety-officer@company.com', 'production-manager@company.com'],
      escalationLevel: 2,
      autoEscalate: true,
      escalationDelay: 60, // 1 hora
      history: [
        {
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          action: 'NC Detectada',
          user: 'Maria Santos',
          details: 'Inspetor detectou problema de tensão durante teste funcional'
        },
        {
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          action: 'Atribuída',
          user: 'Sistema',
          details: 'NC atribuída ao engenheiro de qualidade para análise'
        }
      ]
    }
  ];

  // Carregar notificações
  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

  // Filtrar notificações
  useEffect(() => {
    let filtered = notifications;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(nc => 
        nc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nc.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nc.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nc.inspectorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(nc => nc.status === statusFilter);
    }

    // Filtro por severidade
    if (severityFilter !== 'all') {
      filtered = filtered.filter(nc => nc.severity === severityFilter);
    }

    // Filtro por categoria
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(nc => nc.category === categoryFilter);
    }

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'severity':
          const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          comparison = severityOrder[a.severity] - severityOrder[b.severity];
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, statusFilter, severityFilter, categoryFilter, sortBy, sortOrder]);

  // Resolver NC
  const handleResolveNC = async (ncId: string, resolution: any) => {
    try {
      await onNCResolved(ncId, resolution);
      
      // Atualizar notificação local
      setNotifications(prev => prev.map(nc => 
        nc.id === ncId 
          ? { 
              ...nc, 
              status: 'resolved',
              resolvedAt: new Date().toISOString(),
              resolutionNotes: resolution.notes,
              history: [...nc.history, {
                timestamp: new Date().toISOString(),
                action: 'Resolvida',
                user: 'Usuário Atual',
                details: `NC resolvida: ${resolution.notes}`
              }]
            }
          : nc
      ));

      toast({
        title: "NC Resolvida",
        description: "Não conformidade marcada como resolvida"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao resolver NC",
        variant: "destructive"
      });
    }
  };

  // Escalar NC
  const handleEscalateNC = async (ncId: string) => {
    try {
      const notification = notifications.find(nc => nc.id === ncId);
      if (!notification) return;

      const newEscalationLevel = notification.escalationLevel + 1;
      await onNCEscalated(ncId, newEscalationLevel);

      // Atualizar notificação local
      setNotifications(prev => prev.map(nc => 
        nc.id === ncId 
          ? { 
              ...nc, 
              escalationLevel: newEscalationLevel,
              history: [...nc.history, {
                timestamp: new Date().toISOString(),
                action: 'Escalada',
                user: 'Sistema',
                details: `NC escalada para nível ${newEscalationLevel}`
              }]
            }
          : nc
      ));

      toast({
        title: "NC Escalada",
        description: `Não conformidade escalada para nível ${newEscalationLevel}`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao escalar NC",
        variant: "destructive"
      });
    }
  };

  // Renderizar notificação
  const renderNotification = (nc: NCNotification) => {
    const severityColors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200'
    };

    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_review: 'bg-blue-100 text-blue-800 border-blue-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      resolved: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const priorityIcons = {
      low: <Clock className="w-4 h-4" />,
      medium: <AlertTriangle className="w-4 h-4" />,
      high: <AlertTriangle className="w-4 h-4" />,
      urgent: <XCircle className="w-4 h-4" />
    };

    return (
      <Card key={nc.id} className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-lg">{nc.title}</h4>
                <Badge className={severityColors[nc.severity]}>
                  {nc.severity.toUpperCase()}
                </Badge>
                <Badge className={statusColors[nc.status]}>
                  {nc.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-gray-600 mb-2">{nc.message}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>📦 {nc.productName}</span>
                <span>👤 {nc.inspectorName}</span>
                <span>⏰ {new Date(nc.createdAt).toLocaleString('pt-BR')}</span>
                <span>🏷️ {nc.defectType}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  {priorityIcons[nc.priority]}
                  <span>{nc.priority.toUpperCase()}</span>
                </div>
                <div className="text-xs text-gray-400">
                  Nível {nc.escalationLevel}
                </div>
              </div>
            </div>
          </div>

          {nc.photos && nc.photos.length > 0 && (
            <div className="mb-3">
              <div className="flex gap-2">
                {nc.photos.slice(0, 3).map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className="w-16 h-16 object-cover rounded border"
                  />
                ))}
                {nc.photos.length > 3 && (
                  <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                    +{nc.photos.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedNotification(nc)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Ver Detalhes
              </Button>
              {nc.status === 'pending' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEscalateNC(nc.id)}
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Escalar
                </Button>
              )}
            </div>
            <div className="text-xs text-gray-400">
              {nc.autoEscalate && `Auto-escala em ${nc.escalationDelay}min`}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Bell className="w-6 h-6 text-red-500" />
                  {notifications.filter(nc => nc.status === 'pending').length > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                      {notifications.filter(nc => nc.status === 'pending').length}
                    </Badge>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Sistema de Notificações - NCs</h2>
                  <p className="text-sm text-gray-600">Gerencie notificações de não conformidades</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
              </div>
            </div>

            {/* Filtros */}
            <div className="p-4 border-b space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar notificações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in_review">Em Revisão</SelectItem>
                    <SelectItem value="approved">Aprovada</SelectItem>
                    <SelectItem value="rejected">Rejeitada</SelectItem>
                    <SelectItem value="resolved">Resolvida</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Severidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="quality">Qualidade</SelectItem>
                    <SelectItem value="safety">Segurança</SelectItem>
                    <SelectItem value="functional">Funcional</SelectItem>
                    <SelectItem value="visual">Visual</SelectItem>
                    <SelectItem value="packaging">Embalagem</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Data de Criação</SelectItem>
                    <SelectItem value="severity">Severidade</SelectItem>
                    <SelectItem value="priority">Prioridade</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-4">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma notificação encontrada</h3>
                    <p className="text-gray-600">
                      {searchTerm || statusFilter !== 'all' || severityFilter !== 'all' || categoryFilter !== 'all'
                        ? 'Tente ajustar os filtros'
                        : 'Todas as NCs foram resolvidas'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredNotifications.map(renderNotification)}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Status Bar */}
            <div className="border-t p-2 flex items-center justify-between text-sm text-gray-600">
              <span>{filteredNotifications.length} de {notifications.length} notificações</span>
              <span>
                Pendentes: {notifications.filter(nc => nc.status === 'pending').length} | 
                Críticas: {notifications.filter(nc => nc.severity === 'critical').length}
              </span>
            </div>
          </motion.div>

          {/* Modal de Detalhes */}
          <AnimatePresence>
            {selectedNotification && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4"
              >
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">Detalhes da NC</h3>
                    <Button variant="outline" size="sm" onClick={() => setSelectedNotification(null)}>
                      Fechar
                    </Button>
                  </div>
                  
                  <ScrollArea className="max-h-[calc(90vh-80px)]">
                    <div className="p-4 space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Informações Gerais</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">ID:</span> {selectedNotification.ncId}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span> {selectedNotification.status}
                          </div>
                          <div>
                            <span className="font-medium">Severidade:</span> {selectedNotification.severity}
                          </div>
                          <div>
                            <span className="font-medium">Prioridade:</span> {selectedNotification.priority}
                          </div>
                          <div>
                            <span className="font-medium">Categoria:</span> {selectedNotification.category}
                          </div>
                          <div>
                            <span className="font-medium">Tipo de Defeito:</span> {selectedNotification.defectType}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Descrição</h4>
                        <p className="text-sm text-gray-600">{selectedNotification.description}</p>
                      </div>

                      {selectedNotification.correctiveAction && (
                        <div>
                          <h4 className="font-medium mb-2">Ação Corretiva</h4>
                          <p className="text-sm text-gray-600">{selectedNotification.correctiveAction}</p>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium mb-2">Histórico</h4>
                        <div className="space-y-2">
                          {selectedNotification.history.map((entry, index) => (
                            <div key={index} className="text-sm border-l-2 border-gray-200 pl-3">
                              <div className="font-medium">{entry.action}</div>
                              <div className="text-gray-600">{entry.details}</div>
                              <div className="text-xs text-gray-400">
                                {entry.user} - {new Date(entry.timestamp).toLocaleString('pt-BR')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedNotification.status === 'pending' && (
                        <div className="pt-4 border-t">
                          <Button
                            onClick={() => {
                              const resolution = {
                                notes: 'NC resolvida pelo usuário',
                                action: 'Correção aplicada',
                                timestamp: new Date().toISOString()
                              };
                              handleResolveNC(selectedNotification.id, resolution);
                              setSelectedNotification(null);
                            }}
                            className="w-full"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Marcar como Resolvida
                          </Button>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import React, { useState } from 'react';
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
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useApprovalQueue, type ConditionalApproval } from '@/hooks/use-inspection-plans';

interface ApprovalQueueProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApprovalQueue({ isOpen, onClose }: ApprovalQueueProps) {
  const { toast } = useToast();
  const { pendingApprovals, loading, processApproval } = useApprovalQueue();
  const [selectedApproval, setSelectedApproval] = useState<ConditionalApproval | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [comments, setComments] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApprovals = pendingApprovals.filter(approval => {
    const matchesSearch = approval.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || approval.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleProcessApproval = async (approved: boolean) => {
    if (!selectedApproval) return;

    try {
      await processApproval(selectedApproval.id, approved, comments);
      setShowDetails(false);
      setSelectedApproval(null);
      setComments('');
      
      toast({
        title: "Sucesso",
        description: approved ? "Aprovação condicional confirmada" : "Aprovação condicional rejeitada"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao processar aprovação",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Aprovado', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejeitado', className: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Fila de Aprovação Condicional</span>
            <Badge variant="outline">{pendingApprovals.length}</Badge>
          </DialogTitle>
          <DialogDescription>
            Gerencie as solicitações de aprovação condicional de inspeções
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Filtros e Busca */}
          <div className="flex items-center space-x-4 p-4 border-b">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por motivo ou solicitante..."
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
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {/* Lista de Aprovações */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  <span>Carregando aprovações...</span>
                </div>
              ) : filteredApprovals.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma aprovação pendente
                  </h3>
                  <p className="text-gray-600">
                    Não há solicitações de aprovação condicional no momento.
                  </p>
                </div>
              ) : (
                filteredApprovals.map((approval) => (
                  <Card key={approval.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(approval.status)}
                            <h3 className="font-medium text-gray-900">
                              Inspeção #{approval.inspectionId.slice(0, 8)}
                            </h3>
                            {getStatusBadge(approval.status)}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <User className="w-4 h-4" />
                              <span>Solicitado por: {approval.requestedBy}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(approval.requestedAt)}</span>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-start space-x-2">
                                <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700 mb-1">Motivo:</p>
                                  <p className="text-sm text-gray-600">{approval.reason}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
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
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>

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
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeitar
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleProcessApproval(true)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

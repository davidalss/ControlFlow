import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { 
  useTickets, 
  useCreateTicket, 
  useTicketStats,
  useUploadAttachment,
  formatFileSize,
  isImageFile,
  isVideoFile,
  isPdfFile,
  getTicketTypeLabel,
  getTicketPriorityLabel,
  getTicketStatusLabel,
  getTicketStatusColor,
  getTicketPriorityColor,
  type Ticket,
  type TicketFilters
} from '@/hooks/use-tickets';
import TicketMessages from '@/components/TicketMessages';
import { 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Calendar,
  User,
  Tag,
  BarChart3,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Paperclip,
  Image,
  Video,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TicketsPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<TicketFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados dos modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // Estados para upload de arquivos
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: tickets = [], isLoading: ticketsLoading, refetch: refetchTickets } = useTickets(filters);
  const { data: stats } = useTicketStats();
  const createTicketMutation = useCreateTicket();
  const uploadAttachmentMutation = useUploadAttachment();

  // Filter tickets based on active tab
  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === 'all') return true;
    if (activeTab === 'my-tickets') return ticket.createdBy === user?.id;
    if (activeTab === 'assigned') return ticket.assignedTo === user?.id;
    if (activeTab === 'open') return ticket.status === 'open';
    if (activeTab === 'in-progress') return ticket.status === 'in_progress';
    if (activeTab === 'resolved') return ticket.status === 'resolved';
    if (activeTab === 'closed') return ticket.status === 'closed';
    return true;
  });

  // Search filter
  const searchedTickets = filteredTickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTicket = async (formData: FormData) => {
    try {
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const type = formData.get('type') as Ticket['type'];
      const priority = formData.get('priority') as Ticket['priority'];
      const category = formData.get('category') as string;

      // Criar o ticket primeiro
      const newTicket = await createTicketMutation.mutateAsync({
        title,
        description,
        type,
        priority,
        category: category || undefined,
        tags: [],
        isPublic: false,
        allowComments: true
      });

      // Fazer upload dos arquivos se houver
      if (selectedFiles.length > 0) {
        setIsUploading(true);
        try {
          for (const file of selectedFiles) {
            await uploadAttachmentMutation.mutateAsync({
              ticketId: newTicket.id,
              file,
              messageId: undefined
            });
          }
          
          toast({
            title: "Ticket criado com sucesso!",
            description: `Seu ticket foi enviado com ${selectedFiles.length} anexo(s) e será analisado pela equipe.`,
          });
        } catch (uploadError) {
          toast({
            title: "Ticket criado, mas erro no upload",
            description: "O ticket foi criado, mas houve erro ao enviar os anexos. Você pode adicioná-los depois.",
            variant: "destructive",
          });
        } finally {
          setIsUploading(false);
        }
      } else {
        toast({
          title: "Ticket criado com sucesso!",
          description: "Seu ticket foi enviado e será analisado pela equipe.",
        });
      }

      setShowCreateModal(false);
      setSelectedFiles([]);
      refetchTickets();
    } catch (error) {
      toast({
        title: "Erro ao criar ticket",
        description: "Tente novamente ou entre em contato com o suporte.",
        variant: "destructive",
      });
    }
  };

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowViewModal(true);
  };

  const getStatusIcon = (status: Ticket['status']) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (isImageFile(file.type)) return <Image className="h-4 w-4" />;
    if (isVideoFile(file.type)) return <Video className="h-4 w-4" />;
    if (isPdfFile(file.type)) return <FileText className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Tickets</h1>
          <p className="text-muted-foreground">
            Gerencie solicitações, bugs e melhorias do sistema
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTickets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Aberto</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openTickets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgressTickets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolvedTickets}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="feature">Nova Funcionalidade</SelectItem>
                <SelectItem value="improvement">Melhoria</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="question">Dúvida</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
          <CardDescription>
            {searchedTickets.length} ticket(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="my-tickets">Meus</TabsTrigger>
              <TabsTrigger value="assigned">Atribuídos</TabsTrigger>
              <TabsTrigger value="open">Em Aberto</TabsTrigger>
              <TabsTrigger value="in-progress">Em Progresso</TabsTrigger>
              <TabsTrigger value="resolved">Resolvidos</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {ticketsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Carregando tickets...</p>
                </div>
              ) : searchedTickets.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum ticket encontrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchedTickets.map((ticket) => (
                    <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{ticket.title}</h3>
                              <Badge variant={getTicketStatusColor(ticket.status)}>
                                {getStatusIcon(ticket.status)}
                                {getTicketStatusLabel(ticket.status)}
                              </Badge>
                              <Badge variant={getTicketPriorityColor(ticket.priority)}>
                                {getTicketPriorityLabel(ticket.priority)}
                              </Badge>
                              <Badge variant="outline">
                                {getTicketTypeLabel(ticket.type)}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground line-clamp-2">
                              {ticket.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                Criado por {ticket.creator?.name || 'Usuário'}
                              </div>
                              {ticket.category && (
                                <div className="flex items-center gap-1">
                                  <Tag className="h-4 w-4" />
                                  {ticket.category}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewTicket(ticket)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowCreateModal(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">Criar Novo Ticket</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Descreva sua solicitação, bug ou melhoria para nossa equipe
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateTicket(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input id="title" name="title" required placeholder="Título do ticket" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">Bug</SelectItem>
                      <SelectItem value="feature">Nova Funcionalidade</SelectItem>
                      <SelectItem value="improvement">Melhoria</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                      <SelectItem value="question">Dúvida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade *</Label>
                  <Select name="priority" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input id="category" name="category" placeholder="Categoria (opcional)" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  required 
                  placeholder="Descreva detalhadamente sua solicitação..."
                  rows={6}
                />
              </div>
              
              {/* Upload de Arquivos */}
              <div className="space-y-3">
                <Label>Anexos (opcional)</Label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Paperclip className="h-4 w-4 mr-1" />
                    {isUploading ? 'Enviando...' : 'Adicionar Arquivos'}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Máximo 10MB por arquivo
                  </span>
                </div>
                
                {/* Lista de arquivos selecionados */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Arquivos selecionados ({selectedFiles.length}):</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                          {getFileIcon(file)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedFiles([]);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTicketMutation.isPending || isUploading}
                >
                  {createTicketMutation.isPending || isUploading ? 'Criando...' : 'Criar Ticket'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {showViewModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => {
            setShowViewModal(false);
            setSelectedTicket(null);
          }}></div>
          <div className="relative bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">{selectedTicket.title}</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTicket(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Ticket #{selectedTicket.id.slice(0, 8)}
            </p>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={getTicketStatusColor(selectedTicket.status)} className="mt-1">
                    {getStatusIcon(selectedTicket.status)}
                    {getTicketStatusLabel(selectedTicket.status)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Prioridade</Label>
                  <Badge variant={getTicketPriorityColor(selectedTicket.priority)} className="mt-1">
                    {getTicketPriorityLabel(selectedTicket.priority)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tipo</Label>
                  <Badge variant="outline" className="mt-1">
                    {getTicketTypeLabel(selectedTicket.type)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Categoria</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedTicket.category || 'Não definida'}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm font-medium">Descrição</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-sm font-medium">Criado por</Label>
                  <p className="text-muted-foreground mt-1">
                    {selectedTicket.creator?.name || 'Usuário'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data de criação</Label>
                  <p className="text-muted-foreground mt-1">
                    {format(new Date(selectedTicket.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                </div>
                {selectedTicket.assignedTo && (
                  <div>
                    <Label className="text-sm font-medium">Atribuído para</Label>
                    <p className="text-muted-foreground mt-1">
                      {selectedTicket.assignee?.name || 'Usuário'}
                    </p>
                  </div>
                )}
                {selectedTicket.resolvedAt && (
                  <div>
                    <Label className="text-sm font-medium">Resolvido em</Label>
                    <p className="text-muted-foreground mt-1">
                      {format(new Date(selectedTicket.resolvedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                )}
              </div>

              {/* Messages and Attachments */}
              <TicketMessages ticketId={selectedTicket.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsPage;

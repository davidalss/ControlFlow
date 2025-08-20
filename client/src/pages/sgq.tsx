import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuthorization } from '@/hooks/use-authorization';
import { useAuth } from '@/hooks/use-auth';
import AuthorizationError from '@/components/AuthorizationError';
import { supabase } from '@/lib/supabaseClient';
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Package, 
  Truck, 
  Calendar,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Filter,
  Search,
  Download,
  RefreshCw,
  WifiOff,
  AlertCircle
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface RncData {
  id: string;
  rncCode: string;
  date: string;
  inspectorName: string;
  supplier: string;
  productName: string;
  productCode: string;
  totalNonConformities: number;
  type: string;
  status: string;
  sgqStatus: string;
  sgqAssignedToName?: string;
  sgqAuthorization?: string;
}

interface DashboardStats {
  pendingEvaluation: number;
  pendingTreatment: number;
  closed: number;
  blocked: number;
}

export default function SGQPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isAuthorized, isLoading, error } = useAuthorization({
    requiredRoles: ['admin', 'coordenador', 'analista', 'assistente', 'lider', 'supervisor', 'manager']
  });
  const [rncs, setRncs] = useState<RncData[]>([]);
  const [selectedRnc, setSelectedRnc] = useState<RncData | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    pendingEvaluation: 0,
    pendingTreatment: 0,
    closed: 0,
    blocked: 0
  });
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isTreatingRnc, setIsTreatingRnc] = useState(false);
  const [treatmentData, setTreatmentData] = useState({
    sgqNotes: '',
    sgqCorrectiveActions: '',
    sgqAuthorization: '',
    sgqStatus: ''
  });
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Verificar autenticação primeiro
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600"></div>
      </div>
    );
  }

  // Se não está autenticado, mostrar erro
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-800 mb-4">Sessão Expirada</h2>
          <p className="text-stone-600 mb-4">Sua sessão expirou. Por favor, faça login novamente.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Ir para Login
          </Button>
        </div>
      </div>
    );
  }

  // Se está carregando autorização, mostra loading
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
        message="Você não tem permissão para acessar a página de Não Conformidades (SGQ)."
      />
    );
  }

  useEffect(() => {
    console.log('=== SGQ PAGE MOUNTED ===');
    console.log('Carregando dashboard e lista de RNCs...');
    setPageError(null);
    loadDashboard();
    loadRncList();
  }, []);

  const loadDashboard = async () => {
    console.log('Carregando dashboard SGQ...');
    try {
      const response = await apiRequest('GET', '/api/sgq/dashboard');
      console.log('Resposta do dashboard:', response.status);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Dados do dashboard:', data);
      
      if (data && data.statistics) {
        setDashboardStats(data.statistics);
      } else {
        console.warn('Dados do dashboard inválidos:', data);
        setDashboardStats({
          pendingEvaluation: 0,
          pendingTreatment: 0,
          closed: 0,
          blocked: 0
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setPageError('Erro ao carregar dashboard do SGQ');
      // Definir valores padrão em caso de erro
      setDashboardStats({
        pendingEvaluation: 0,
        pendingTreatment: 0,
        closed: 0,
        blocked: 0
      });
    }
  };

  const loadRncList = async () => {
    console.log('Carregando lista de RNCs...');
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('sgqStatus', filterStatus);
      if (filterType) params.append('type', filterType);
      
      const url = `/api/sgq/rnc?${params.toString()}`;
      console.log('Fazendo requisição para:', url);
      
      const response = await apiRequest('GET', url);
      console.log('Resposta da lista de RNCs:', response.status);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Dados das RNCs:', data);
      
      if (data && Array.isArray(data.rncs)) {
        setRncs(data.rncs);
      } else {
        console.warn('Dados das RNCs inválidos:', data);
        setRncs([]);
      }
    } catch (error) {
      console.error('Erro ao carregar RNCs:', error);
      setPageError('Erro ao carregar lista de RNCs');
      setRncs([]);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de RNCs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    setPageError(null);
    
    try {
      await Promise.all([loadDashboard(), loadRncList()]);
      toast({
        title: "Sucesso",
        description: "Dados carregados com sucesso",
      });
    } catch (error) {
      console.error('Erro ao tentar novamente:', error);
      toast({
        title: "Erro",
        description: "Falha ao tentar carregar dados novamente",
        variant: "destructive"
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleViewRnc = async (rncId: string) => {
    try {
      const response = await apiRequest('GET', `/api/sgq/rnc/${rncId}`);
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      const rnc = await response.json();
      setSelectedRnc(rnc);
    } catch (error) {
      console.error('Erro ao carregar RNC:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar detalhes da RNC",
        variant: "destructive"
      });
    }
  };

  const handleTreatRnc = async () => {
    if (!selectedRnc || !treatmentData.sgqAuthorization) {
      toast({
        title: "Dados incompletos",
        description: "Complete todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsTreatingRnc(true);
    try {
      const response = await apiRequest('PATCH', `/api/sgq/rnc/${selectedRnc.id}/treat`, treatmentData);
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      const updatedRnc = await response.json();
      
      toast({
        title: "RNC Tratada",
        description: `RNC ${selectedRnc.rncCode} foi ${treatmentData.sgqAuthorization === 'authorized' ? 'autorizada' : 'negada'}`,
      });

      // Atualizar lista
      setRncs(prev => prev.map(rnc => 
        rnc.id === selectedRnc.id ? { ...rnc, ...updatedRnc } : rnc
      ));
      
      // Resetar dados
      setSelectedRnc(null);
      setTreatmentData({
        sgqNotes: '',
        sgqCorrectiveActions: '',
        sgqAuthorization: '',
        sgqStatus: ''
      });
      
      // Recarregar dashboard
      loadDashboard();
      
    } catch (error) {
      console.error('Erro ao tratar RNC:', error);
      toast({
        title: "Erro",
        description: "Erro ao tratar RNC",
        variant: "destructive"
      });
    } finally {
      setIsTreatingRnc(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_evaluation':
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Aguardando Avaliação</Badge>;
      case 'pending_treatment':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Em Tratamento</Badge>;
      case 'closed':
        return <Badge variant="outline" className="text-green-600 border-green-200">Fechada</Badge>;
      case 'blocked':
        return <Badge variant="destructive">Bloqueada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'registration':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Registro</Badge>;
      case 'corrective_action':
        return <Badge variant="outline" className="text-red-600 border-red-200">Tratativa</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const filteredRncs = rncs.filter(rnc => {
    const matchesSearch = searchTerm === '' || 
      rnc.rncCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rnc.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rnc.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Componente de erro com opção de retry
  const ErrorDisplay = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
      <div className="flex items-start">
        <AlertCircle className="w-6 h-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-red-800 mb-2">Erro de Conexão</h3>
          <p className="text-red-700 mb-4">{message}</p>
          <div className="flex gap-3">
            <Button 
              onClick={onRetry} 
              disabled={isRetrying}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Tentando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </>
              )}
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="border-gray-300"
            >
              Recarregar Página
            </Button>
          </div>
          {retryCount > 0 && (
            <p className="text-sm text-red-600 mt-2">
              Tentativas: {retryCount}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Gestão da Qualidade</h1>
          <p className="text-gray-600 mt-2">Tratamento de RNCs e Gestão da Qualidade</p>
        </div>
        <Button onClick={loadRncList} disabled={loading || isRetrying}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading || isRetrying ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Error Message */}
      {pageError && (
        <ErrorDisplay 
          message={pageError} 
          onRetry={handleRetry}
        />
      )}

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aguardando Avaliação</p>
                  <p className="text-2xl font-bold text-orange-600">{dashboardStats.pendingEvaluation}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Tratamento</p>
                  <p className="text-2xl font-bold text-blue-600">{dashboardStats.pendingTreatment}</p>
                </div>
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fechadas</p>
                  <p className="text-2xl font-bold text-green-600">{dashboardStats.closed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bloqueadas</p>
                  <p className="text-2xl font-bold text-red-600">{dashboardStats.blocked}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Código, produto ou fornecedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status-filter">Status SGQ</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pending_evaluation">Aguardando Avaliação</SelectItem>
                  <SelectItem value="pending_treatment">Em Tratamento</SelectItem>
                  <SelectItem value="closed">Fechada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="type-filter">Tipo</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="registration">Registro</SelectItem>
                  <SelectItem value="corrective_action">Tratativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={loadRncList} className="w-full" disabled={loading || isRetrying}>
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de RNCs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              RNCs para Tratamento
            </div>
            <Badge variant="outline">{filteredRncs.length} RNCs</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span>Carregando RNCs...</span>
            </div>
          ) : filteredRncs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma RNC encontrada</h3>
              <p className="text-gray-600">Não há RNCs para tratamento no momento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRncs.map((rnc) => (
                <div key={rnc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-semibold text-lg">{rnc.rncCode}</h4>
                        <p className="text-sm text-gray-600">{rnc.productName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(rnc.sgqStatus)}
                      {getTypeBadge(rnc.type)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{rnc.productCode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{rnc.supplier}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{rnc.totalNonConformities} não conformidades</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{new Date(rnc.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Inspetor: {rnc.inspectorName}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleViewRnc(rnc.id)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Visualizar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Detalhes da RNC: {rnc.rncCode}</DialogTitle>
                          </DialogHeader>
                          
                          {selectedRnc && (
                            <div className="space-y-6">
                              {/* Informações Básicas */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Produto</Label>
                                  <p className="text-sm">{selectedRnc.productName}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Fornecedor</Label>
                                  <p className="text-sm">{selectedRnc.supplier}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Total de Não Conformidades</Label>
                                  <p className="text-sm">{selectedRnc.totalNonConformities}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Tipo</Label>
                                  <div className="mt-1">{getTypeBadge(selectedRnc.type)}</div>
                                </div>
                              </div>

                              {/* Tratamento SGQ */}
                              <div className="space-y-4">
                                <h4 className="font-medium">Tratamento SGQ</h4>
                                
                                <div>
                                  <Label htmlFor="sgq-notes">Observações do SGQ</Label>
                                  <Textarea
                                    id="sgq-notes"
                                    placeholder="Digite suas observações..."
                                    value={treatmentData.sgqNotes}
                                    onChange={(e) => setTreatmentData(prev => ({ ...prev, sgqNotes: e.target.value }))}
                                    rows={3}
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="sgq-actions">Ações Corretivas Propostas</Label>
                                  <Textarea
                                    id="sgq-actions"
                                    placeholder="Descreva as ações corretivas..."
                                    value={treatmentData.sgqCorrectiveActions}
                                    onChange={(e) => setTreatmentData(prev => ({ ...prev, sgqCorrectiveActions: e.target.value }))}
                                    rows={3}
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="sgq-authorization">Autorização</Label>
                                  <Select 
                                    value={treatmentData.sgqAuthorization} 
                                    onValueChange={(value) => setTreatmentData(prev => ({ 
                                      ...prev, 
                                      sgqAuthorization: value,
                                      sgqStatus: value === 'authorized' ? 'closed' : 'pending_treatment'
                                    }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione a autorização" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="authorized">Autorizar</SelectItem>
                                      <SelectItem value="denied">Negar</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    onClick={handleTreatRnc}
                                    disabled={isTreatingRnc || !treatmentData.sgqAuthorization}
                                  >
                                    {isTreatingRnc ? (
                                      <>
                                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                        Processando...
                                      </>
                                    ) : (
                                      <>
                                        <Shield className="w-4 h-4 mr-2" />
                                        Tratar RNC
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw, 
  Trash2, 
  Download, 
  Search, 
  Filter, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  Activity,
  Shield,
  Bug,
  Clock,
  BarChart3,
  FileText,
  Users,
  Database,
  Server
} from "lucide-react";
import { useSystemLogs, useDefectLogs, useAuditLogs, SystemLog, LogFilter } from '@/hooks/use-logs';
import { useToast } from '@/hooks/use-toast';

export default function LogsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados de filtro
  const [filter, setFilter] = useState<LogFilter>({
    limit: 100
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('system');
  const [isLive, setIsLive] = useState(true);

  // Hooks para diferentes tipos de logs
  const {
    logs: systemLogs,
    stats,
    isLoading: systemLogsLoading,
    refetch: refetchSystemLogs,
    createLog,
    clearLogs,
    exportLogs,
    isClearingLogs,
    isExportingLogs
  } = useSystemLogs(filter);

  const {
    defectLogs,
    isLoading: defectLogsLoading,
    refetch: refetchDefectLogs
  } = useDefectLogs();

  const {
    auditLogs,
    isLoading: auditLogsLoading,
    refetch: refetchAuditLogs
  } = useAuditLogs();

  // Atualização automática quando live está ativo
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      refetchSystemLogs();
      refetchDefectLogs();
      refetchAuditLogs();
    }, 30000); // Atualizar a cada 30 segundos

    return () => clearInterval(interval);
  }, [isLive, refetchSystemLogs, refetchDefectLogs, refetchAuditLogs]);

  // Filtrar logs por termo de busca
  const filterLogsBySearch = (logs: SystemLog[]) => {
    if (!searchTerm) return logs;
    
    return logs.filter(log => 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.correlationId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Obter cor do nível do log
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'SUCCESS': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'DEBUG': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
      default: return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
    }
  };

  // Obter ícone do nível
  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR': return <XCircle className="w-4 h-4" />;
      case 'WARNING': return <AlertTriangle className="w-4 h-4" />;
      case 'SUCCESS': return <CheckCircle className="w-4 h-4" />;
      case 'DEBUG': return <Bug className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  // Obter ícone do módulo
  const getModuleIcon = (module: string) => {
    const moduleLower = module.toLowerCase();
    if (moduleLower.includes('auth') || moduleLower.includes('user')) return <Users className="w-4 h-4" />;
    if (moduleLower.includes('database') || moduleLower.includes('db')) return <Database className="w-4 h-4" />;
    if (moduleLower.includes('api') || moduleLower.includes('server')) return <Server className="w-4 h-4" />;
    if (moduleLower.includes('audit') || moduleLower.includes('security')) return <Shield className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  // Criar log de teste
  const createTestLog = () => {
    createLog({
      level: 'INFO',
      module: 'LogsPage',
      operation: 'TEST_LOG',
      description: `Log de teste criado por ${user?.name || 'Usuário'}`,
      details: {
        action: 'manual_test',
        component: 'LogsPage',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }
    });
  };

  // Limpar logs antigos
  const handleClearLogs = () => {
    if (confirm('Tem certeza que deseja limpar logs antigos? Esta ação não pode ser desfeita.')) {
      clearLogs(30); // Manter logs dos últimos 30 dias
    }
  };

  // Exportar logs
  const handleExportLogs = () => {
    exportLogs(filter);
  };

  // Verificar permissão de administrador
  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-2">Acesso Restrito</h3>
            <p className="text-neutral-600 dark:text-neutral-400">Apenas administradores podem visualizar os logs do sistema.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Obter logs baseado na aba ativa
  const getActiveLogs = () => {
    switch (activeTab) {
      case 'defects':
        return filterLogsBySearch(defectLogs);
      case 'audit':
        return filterLogsBySearch(auditLogs);
      default:
        return filterLogsBySearch(systemLogs);
    }
  };

  const activeLogs = getActiveLogs();
  const isLoading = systemLogsLoading || defectLogsLoading || auditLogsLoading;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">📊 Logs do Sistema</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitoramento em tempo real das atividades e defeitos do sistema</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className="flex items-center space-x-2"
          >
            <Activity className={`w-4 h-4 ${isLive ? 'text-green-500' : 'text-gray-400'}`} />
            <span>{isLive ? 'Ativo' : 'Pausado'}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={createTestLog}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Teste</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportLogs}
            disabled={isExportingLogs}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingLogs ? 'Exportando...' : 'Exportar'}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearLogs}
            disabled={isClearingLogs}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isClearingLogs ? 'Limpando...' : 'Limpar'}</span>
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total de Logs</p>
                  <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Erros (24h)</p>
                  <p className="text-2xl font-bold">{stats.errorsLast24h}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avisos (24h)</p>
                  <p className="text-2xl font-bold">{stats.warningsLast24h}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tempo Médio</p>
                  <p className="text-2xl font-bold">{stats.avgResponseTime.toFixed(1)}ms</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar nos logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select
                value={filter.level || ''}
                onValueChange={(value) => setFilter(prev => ({ ...prev, level: value || undefined }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="ERROR">Erro</SelectItem>
                  <SelectItem value="WARNING">Aviso</SelectItem>
                  <SelectItem value="INFO">Info</SelectItem>
                  <SelectItem value="SUCCESS">Sucesso</SelectItem>
                  <SelectItem value="DEBUG">Debug</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filter.module || ''}
                onValueChange={(value) => setFilter(prev => ({ ...prev, module: value || undefined }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="auth">Autenticação</SelectItem>
                  <SelectItem value="database">Banco de Dados</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="audit">Auditoria</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filter.limit?.toString() || '100'}
                onValueChange={(value) => setFilter(prev => ({ ...prev, limit: parseInt(value) }))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Logs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Server className="w-4 h-4" />
            <span>Sistema</span>
          </TabsTrigger>
          <TabsTrigger value="defects" className="flex items-center space-x-2">
            <Bug className="w-4 h-4" />
            <span>Defeitos</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Auditoria</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          <LogsList 
            logs={activeLogs} 
            isLoading={isLoading} 
            title="Logs do Sistema"
            description="Atividades gerais do sistema"
          />
        </TabsContent>

        <TabsContent value="defects" className="space-y-4">
          <LogsList 
            logs={activeLogs} 
            isLoading={isLoading} 
            title="Logs de Defeitos"
            description="Erros e problemas identificados"
          />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <LogsList 
            logs={activeLogs} 
            isLoading={isLoading} 
            title="Logs de Auditoria"
            description="Atividades de segurança e acesso"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componente para listar logs
interface LogsListProps {
  logs: SystemLog[];
  isLoading: boolean;
  title: string;
  description: string;
}

function LogsList({ logs, isLoading, title, description }: LogsListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Carregando logs...</p>
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Nenhum log encontrado</h3>
          <p className="text-gray-600 dark:text-gray-400">Não há logs para exibir com os filtros atuais.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {logs.length} logs
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {logs.map((log) => (
            <LogItem key={log.id} log={log} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para item de log individual
interface LogItemProps {
  log: SystemLog;
}

function LogItem({ log }: LogItemProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'SUCCESS': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'DEBUG': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
      default: return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR': return <XCircle className="w-4 h-4" />;
      case 'WARNING': return <AlertTriangle className="w-4 h-4" />;
      case 'SUCCESS': return <CheckCircle className="w-4 h-4" />;
      case 'DEBUG': return <Bug className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getModuleIcon = (module: string) => {
    const moduleLower = module.toLowerCase();
    if (moduleLower.includes('auth') || moduleLower.includes('user')) return <Users className="w-4 h-4" />;
    if (moduleLower.includes('database') || moduleLower.includes('db')) return <Database className="w-4 h-4" />;
    if (moduleLower.includes('api') || moduleLower.includes('server')) return <Server className="w-4 h-4" />;
    if (moduleLower.includes('audit') || moduleLower.includes('security')) return <Shield className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  return (
    <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Badge className={getLevelColor(log.level)}>
              {getLevelIcon(log.level)}
              <span className="ml-1">{log.level}</span>
            </Badge>
            
            <Badge variant="outline" className="flex items-center space-x-1">
              {getModuleIcon(log.module)}
              <span>{log.module}</span>
            </Badge>
            
            <Badge variant="outline">
              {log.operation}
            </Badge>
            
            {log.correlationId && (
              <Badge variant="outline" className="text-xs">
                {log.correlationId.slice(0, 8)}...
              </Badge>
            )}
          </div>
          
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            {log.description}
          </p>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span>{log.timestamp.toLocaleString()}</span>
            {log.userName && <span>• {log.userName}</span>}
            {log.duration && <span>• {log.duration}ms</span>}
            {log.status && <span>• Status: {log.status}</span>}
          </div>
          
          {log.details && (
            <details className="mt-2" open={showDetails}>
              <summary 
                className="cursor-pointer text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                onClick={(e) => {
                  e.preventDefault();
                  setShowDetails(!showDetails);
                }}
              >
                {showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

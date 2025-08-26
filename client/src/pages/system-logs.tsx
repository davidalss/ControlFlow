/**
 * Página de Logs do Sistema
 * Exibe logs de testes automatizados com filtros, paginação e exportação
 * 
 * Funcionalidades:
 * - Tabela com logs detalhados
 * - Filtros por período, rota, suite, status, passed
 * - Paginação (50 registros por vez)
 * - Auto-refresh
 * - Exportação CSV/JSON
 * - Layout responsivo
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { 
  RefreshCw, 
  Download, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  BarChart3,
  FileText,
  Settings
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Tipos
interface SystemLog {
  id: string;
  test_suite: string;
  test_name: string;
  route: string;
  status_code: number;
  response_time_ms: number;
  cors_ok: boolean;
  passed: boolean;
  error_message: string | null;
  meta: any;
  created_at: string;
}

interface LogStats {
  total: number;
  passed: number;
  failed: number;
  last24h: number;
  bySuite: Record<string, number>;
  avgResponseTime: number;
  errorCodes: Record<string, number>;
}

interface LogFilters {
  suite?: string;
  route?: string;
  status_code?: number;
  passed?: boolean;
  from?: string;
  to?: string;
  limit?: number;
  page?: number;
}

export default function SystemLogsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  
  // Filtros
  const [filters, setFilters] = useState<LogFilters>({
    limit: 50,
    page: 1
  });
  
  // Opções de filtro
  const [suites, setSuites] = useState<string[]>([]);
  const [routes, setRoutes] = useState<string[]>([]);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Buscar logs
  const fetchLogs = async () => {
    if (!user || user.role !== 'admin') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      // Adicionar filtros
      if (filters.suite) params.append('suite', filters.suite);
      if (filters.route) params.append('route', filters.route);
      if (filters.status_code) params.append('status_code', filters.status_code.toString());
      if (filters.passed !== undefined) params.append('passed', filters.passed.toString());
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.page) params.append('page', filters.page.toString());
      
      const response = await apiRequest('GET', `/api/system-logs?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setLogs(data.data || []);
      setTotalLogs(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / (filters.limit || 50)));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Falha ao carregar logs do sistema",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Buscar estatísticas
  const fetchStats = async () => {
    if (!user || user.role !== 'admin') return;
    
    try {
      const response = await apiRequest('GET', '/api/system-logs/stats');
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStats(data.data);
      
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  };

  // Buscar opções de filtro
  const fetchFilterOptions = async () => {
    if (!user || user.role !== 'admin') return;
    
    try {
      // Buscar suítes
      const suitesResponse = await apiRequest('GET', '/api/system-logs/suites');
      if (suitesResponse.ok) {
        const suitesData = await suitesResponse.json();
        setSuites(suitesData.data || []);
      }
      
      // Buscar rotas
      const routesResponse = await apiRequest('GET', '/api/system-logs/routes');
      if (routesResponse.ok) {
        const routesData = await routesResponse.json();
        setRoutes(routesData.data || []);
      }
      
    } catch (err) {
      console.error('Erro ao buscar opções de filtro:', err);
    }
  };

  // Exportar logs
  const exportLogs = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const params = new URLSearchParams();
      
      // Adicionar filtros atuais
      if (filters.suite) params.append('suite', filters.suite);
      if (filters.route) params.append('route', filters.route);
      if (filters.status_code) params.append('status_code', filters.status_code.toString());
      if (filters.passed !== undefined) params.append('passed', filters.passed.toString());
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      params.append('format', format);
      
      const response = await apiRequest('GET', `/api/system-logs/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
      toast({
        title: "Sucesso",
        description: `Logs exportados em ${format.toUpperCase()}`
      });
      
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao exportar logs",
        variant: "destructive"
      });
    }
  };

  // Atualização automática
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      fetchLogs();
      fetchStats();
    }, 30000); // Atualizar a cada 30 segundos

    return () => clearInterval(interval);
  }, [isLive, filters]);

  // Carregamento inicial
  useEffect(() => {
    fetchLogs();
    fetchStats();
    fetchFilterOptions();
  }, []);

  // Verificar permissão
  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Settings className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-2">Acesso Restrito</h3>
            <p className="text-neutral-600 dark:text-neutral-400">Apenas administradores podem visualizar os logs do sistema.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Obter cor do status
  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    if (statusCode >= 400 && statusCode < 500) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    if (statusCode >= 500) return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  // Obter ícone do status
  const getStatusIcon = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return <CheckCircle className="w-4 h-4" />;
    if (statusCode >= 400 && statusCode < 500) return <AlertTriangle className="w-4 h-4" />;
    if (statusCode >= 500) return <XCircle className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">📊 Logs do Sistema</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitoramento de testes automatizados e healthchecks</p>
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
            onClick={() => { fetchLogs(); fetchStats(); }}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportLogs('csv')}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportLogs('json')}
            className="flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Exportar JSON</span>
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
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Testes Passaram</p>
                  <p className="text-2xl font-bold">{stats.passed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Testes Falharam</p>
                  <p className="text-2xl font-bold">{stats.failed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Últimas 24h</p>
                  <p className="text-2xl font-bold">{stats.last24h}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Suíte</label>
              <Select
                value={filters.suite || ''}
                onValueChange={(value) => setFilters(prev => ({ ...prev, suite: value || undefined, page: 1 }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as suítes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as suítes</SelectItem>
                  {suites.map(suite => (
                    <SelectItem key={suite} value={suite}>{suite}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Rota</label>
              <Select
                value={filters.route || ''}
                onValueChange={(value) => setFilters(prev => ({ ...prev, route: value || undefined, page: 1 }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as rotas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as rotas</SelectItem>
                  {routes.map(route => (
                    <SelectItem key={route} value={route}>{route}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Status</label>
              <Select
                value={filters.passed?.toString() || ''}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  passed: value === '' ? undefined : value === 'true', 
                  page: 1 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="true">Passou</SelectItem>
                  <SelectItem value="false">Falhou</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Período</label>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={filters.from || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, from: e.target.value || undefined, page: 1 }))}
                  className="flex-1"
                />
                <Input
                  type="date"
                  value={filters.to || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value || undefined, page: 1 }))}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Logs de Testes</CardTitle>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isLive ? 'Ativo' : 'Pausado'} • {totalLogs} logs • Página {currentPage} de {totalPages}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">Carregando logs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Nenhum log encontrado</h3>
              <p className="text-gray-600 dark:text-gray-400">Não há logs para exibir com os filtros atuais.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Suíte</TableHead>
                      <TableHead>Teste</TableHead>
                      <TableHead>Rota</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tempo(ms)</TableHead>
                      <TableHead>CORS</TableHead>
                      <TableHead>Resultado</TableHead>
                      <TableHead>Erro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.test_suite}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={log.test_name}>
                          {log.test_name}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={log.route}>
                          {log.route}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(log.status_code)}>
                            {getStatusIcon(log.status_code)}
                            <span className="ml-1">{log.status_code}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.response_time_ms || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.cors_ok ? "default" : "destructive"}>
                            {log.cors_ok ? '✅' : '❌'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.passed ? "default" : "destructive"}>
                            {log.passed ? '✅ Passou' : '❌ Falhou'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={log.error_message || ''}>
                          {log.error_message || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                          className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setFilters(prev => ({ ...prev, page }))}
                              isActive={page === currentPage}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setFilters(prev => ({ ...prev, page: Math.min(totalPages, (prev.page || 1) + 1) }))}
                          className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

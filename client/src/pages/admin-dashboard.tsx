import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Shield, 
  Database, 
  HardDrive, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Server,
  Cpu,
  Memory,
  HardDriveIcon,
  Network,
  Clock,
  BarChart3,
  Settings,
  Play,
  Square,
  Trash2,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    load: number;
  };
  database: {
    status: 'connected' | 'disconnected' | 'error';
    responseTime: number;
    lastCheck: string;
  };
  storage: {
    status: 'available' | 'warning' | 'error';
    freeSpace: number;
    totalSpace: number;
    percentage: number;
  };
  api: {
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
    activeConnections: number;
  };
  websocket: {
    status: 'connected' | 'disconnected' | 'error';
    activeConnections: number;
    lastHeartbeat: string;
  };
}

interface SecurityEvent {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  ip: string;
  path: string;
  method: string;
}

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  memoryUsage: number;
  averageAccessTime: number;
}

interface BackupInfo {
  id: string;
  timestamp: string;
  size: number;
  type: 'FULL' | 'INCREMENTAL' | 'DATABASE_ONLY';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  duration: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Atualizar a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Carregar dados de saúde
      const healthResponse = await apiRequest('/api/admin/health');
      if (healthResponse.success) {
        setHealthStatus(healthResponse.data.health);
      }
      
      // Carregar eventos de segurança
      const securityResponse = await apiRequest('/api/admin/security');
      if (securityResponse.success) {
        setSecurityEvents(securityResponse.data.events);
      }
      
      // Carregar estatísticas do cache
      const cacheResponse = await apiRequest('/api/admin/cache');
      if (cacheResponse.success) {
        setCacheStats(cacheResponse.data.stats);
      }
      
      // Carregar informações de backup
      const backupResponse = await apiRequest('/api/admin/backup');
      if (backupResponse.success) {
        setBackups(backupResponse.data.backups);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do dashboard",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const forceHealthCheck = async () => {
    try {
      await apiRequest('/api/admin/health/check', { method: 'POST' });
      toast({
        title: "Sucesso",
        description: "Verificação de saúde forçada com sucesso"
      });
      await loadDashboardData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao forçar verificação de saúde",
        variant: "destructive"
      });
    }
  };

  const clearCache = async (tags?: string[]) => {
    try {
      await apiRequest('/api/admin/cache/clear', { 
        method: 'POST',
        body: tags ? { tags } : {}
      });
      toast({
        title: "Sucesso",
        description: "Cache limpo com sucesso"
      });
      await loadDashboardData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao limpar cache",
        variant: "destructive"
      });
    }
  };

  const createBackup = async (type: 'FULL' | 'INCREMENTAL' | 'DATABASE_ONLY') => {
    try {
      await apiRequest('/api/admin/backup/create', { 
        method: 'POST',
        body: { type }
      });
      toast({
        title: "Sucesso",
        description: `Backup ${type} iniciado com sucesso`
      });
      await loadDashboardData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar backup",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'degraded':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy':
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'unhealthy':
      case 'error':
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Carregando dashboard administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-gray-600">Monitoramento e gerenciamento dos sistemas críticos</p>
        </div>
        <Button onClick={loadDashboardData} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="health">Saúde</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Status Geral */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(healthStatus?.status || 'unknown')}
                  <Badge className={getStatusColor(healthStatus?.status || 'unknown')}>
                    {healthStatus?.status || 'Desconhecido'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Última verificação: {healthStatus?.timestamp ? new Date(healthStatus.timestamp).toLocaleString('pt-BR') : 'N/A'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {healthStatus?.uptime ? Math.round(healthStatus.uptime / 3600) : 0}h
                </div>
                <p className="text-xs text-muted-foreground">
                  Tempo de atividade
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memória</CardTitle>
                <Memory className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {healthStatus?.memory?.percentage || 0}%
                </div>
                <Progress value={healthStatus?.memory?.percentage || 0} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {healthStatus?.memory?.used || 0}MB / {healthStatus?.memory?.total || 0}MB
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {healthStatus?.cpu?.load || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Load average
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Gerenciar sistemas críticos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={forceHealthCheck} variant="outline" className="h-20">
                  <div className="text-center">
                    <Activity className="w-6 h-6 mx-auto mb-2" />
                    <div>Verificação de Saúde</div>
                  </div>
                </Button>
                
                <Button onClick={() => clearCache()} variant="outline" className="h-20">
                  <div className="text-center">
                    <Database className="w-6 h-6 mx-auto mb-2" />
                    <div>Limpar Cache</div>
                  </div>
                </Button>
                
                <Button onClick={() => createBackup('FULL')} variant="outline" className="h-20">
                  <div className="text-center">
                    <HardDrive className="w-6 h-6 mx-auto mb-2" />
                    <div>Backup Completo</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status de Saúde do Sistema</CardTitle>
              <CardDescription>Monitoramento em tempo real</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {healthStatus && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Banco de Dados</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className={getStatusColor(healthStatus.database.status)}>
                            {healthStatus.database.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Tempo de Resposta:</span>
                          <span>{healthStatus.database.responseTime}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Última Verificação:</span>
                          <span>{new Date(healthStatus.database.lastCheck).toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">WebSocket</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className={getStatusColor(healthStatus.websocket.status)}>
                            {healthStatus.websocket.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Conexões Ativas:</span>
                          <span>{healthStatus.websocket.activeConnections}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Último Heartbeat:</span>
                          <span>{new Date(healthStatus.websocket.lastHeartbeat).toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Métricas da API</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{healthStatus.api.requestsPerMinute}</div>
                        <div className="text-sm text-muted-foreground">Requests/min</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{healthStatus.api.averageResponseTime}ms</div>
                        <div className="text-sm text-muted-foreground">Tempo Médio</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{healthStatus.api.errorRate}%</div>
                        <div className="text-sm text-muted-foreground">Taxa de Erro</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{healthStatus.api.activeConnections}</div>
                        <div className="text-sm text-muted-foreground">Conexões Ativas</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eventos de Segurança</CardTitle>
              <CardDescription>Monitoramento de ameaças e atividades suspeitas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(event.level)}>
                          {event.level.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{event.message}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <div>IP: {event.ip}</div>
                      <div>Rota: {event.method} {event.path}</div>
                    </div>
                  </div>
                ))}
                {securityEvents.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum evento de segurança encontrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas do Cache</CardTitle>
              <CardDescription>Performance e utilização do sistema de cache</CardDescription>
            </CardHeader>
            <CardContent>
              {cacheStats && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{cacheStats.totalEntries}</div>
                      <div className="text-sm text-muted-foreground">Entradas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{cacheStats.hitRate.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Taxa de Hit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{cacheStats.memoryUsage.toFixed(1)}MB</div>
                      <div className="text-sm text-muted-foreground">Uso de Memória</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Taxa de Hit</span>
                        <span>{cacheStats.hitRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={cacheStats.hitRate} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Taxa de Miss</span>
                        <span>{cacheStats.missRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={cacheStats.missRate} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button onClick={() => clearCache()} variant="outline" className="w-full">
                      <Database className="w-4 h-4 mr-2" />
                      Limpar Cache Completo
                    </Button>
                    <Button onClick={() => clearCache(['products'])} variant="outline" className="w-full">
                      <Database className="w-4 h-4 mr-2" />
                      Limpar Cache de Produtos
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Backup</CardTitle>
              <CardDescription>Gerenciar backups automáticos e manuais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={() => createBackup('FULL')} className="h-20">
                  <div className="text-center">
                    <HardDrive className="w-6 h-6 mx-auto mb-2" />
                    <div>Backup Completo</div>
                  </div>
                </Button>
                
                <Button onClick={() => createBackup('INCREMENTAL')} variant="outline" className="h-20">
                  <div className="text-center">
                    <HardDrive className="w-6 h-6 mx-auto mb-2" />
                    <div>Backup Incremental</div>
                  </div>
                </Button>
                
                <Button onClick={() => createBackup('DATABASE_ONLY')} variant="outline" className="h-20">
                  <div className="text-center">
                    <Database className="w-6 h-6 mx-auto mb-2" />
                    <div>Backup do Banco</div>
                  </div>
                </Button>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Backups Recentes</h3>
                <div className="space-y-3">
                  {backups.map((backup) => (
                    <div key={backup.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(backup.status)}>
                            {backup.status}
                          </Badge>
                          <span className="font-medium">{backup.type}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {new Date(backup.timestamp).toLocaleString('pt-BR')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {backup.duration}ms • {Math.round(backup.size / 1024 / 1024)}MB
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {backups.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum backup encontrado
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

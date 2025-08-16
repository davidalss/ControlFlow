import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, Play, Pause } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  category: string;
  message: string;
  user?: string;
  details?: any;
  source: 'system' | 'user' | 'test';
}

export default function LogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [filter, setFilter] = useState<'all' | 'system' | 'user' | 'test'>('all');

  // Simular logs em tempo real
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        level: ['info', 'warning', 'error', 'success'][Math.floor(Math.random() * 4)] as any,
        category: ['API', 'Database', 'Frontend', 'Authentication', 'Navigation'][Math.floor(Math.random() * 5)],
        message: `Log de teste ${Date.now()}`,
        user: user?.name || 'Sistema',
        source: 'test',
        details: {
          action: 'test_action',
          component: 'LogsPage',
          timestamp: new Date().toISOString()
        }
      };

      setLogs(prev => [newLog, ...prev.slice(0, 99)]); // Manter apenas os últimos 100 logs
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive, user?.name]);

  // Adicionar logs de navegação
  useEffect(() => {
    const navigationLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      level: 'info',
      category: 'Navigation',
      message: `Usuário ${user?.name || 'Anônimo'} acessou a página de Logs`,
      user: user?.name || 'Sistema',
      source: 'user',
      details: {
        page: '/logs',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    };

    setLogs(prev => [navigationLog, ...prev]);
  }, [user?.name]);

  // Filtrar logs
  const filteredLogs = logs.filter(log => 
    filter === 'all' || log.source === filter
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'system': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'user': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'test': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const addTestLog = () => {
    const testLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      level: 'info',
      category: 'Test',
      message: `Log de teste manual criado por ${user?.name || 'Usuário'}`,
      user: user?.name || 'Usuário',
      source: 'test',
      details: {
        action: 'manual_test',
        component: 'LogsPage',
        timestamp: new Date().toISOString()
      }
    };

    setLogs(prev => [testLog, ...prev]);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <span className="material-icons text-6xl text-neutral-300 mb-4 block">lock</span>
            <h3 className="text-lg font-medium text-neutral-800 mb-2">Acesso Restrito</h3>
            <p className="text-neutral-600">Apenas administradores podem visualizar os logs.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🔍 LOGS TESTE 🔍</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitoramento em tempo real das atividades do sistema</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className="flex items-center space-x-2"
          >
            {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isLive ? 'Pausar' : 'Iniciar'} Logs</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={addTestLog}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Adicionar Teste</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={clearLogs}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpar</span>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por:</span>
            {(['all', 'system', 'user', 'test'] as const).map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterType)}
              >
                {filterType === 'all' && 'Todos'}
                {filterType === 'system' && 'Sistema'}
                {filterType === 'user' && 'Usuário'}
                {filterType === 'test' && 'Teste'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Logs em Tempo Real</CardTitle>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isLive ? 'Ativo' : 'Pausado'} • {filteredLogs.length} logs
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLogs.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getLevelColor(log.level)}>
                          {log.level.toUpperCase()}
                        </Badge>
                        <Badge className={getSourceColor(log.source)}>
                          {log.source.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {log.category}
                        </Badge>
                      </div>
                      
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {log.message}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{log.timestamp.toLocaleString()}</span>
                        {log.user && <span>• Usuário: {log.user}</span>}
                      </div>
                      
                      {log.details && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                            Ver detalhes
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="material-icons text-6xl text-neutral-300 mb-4 block">info</span>
              <h3 className="text-lg font-medium text-neutral-800 mb-2">Nenhum log encontrado</h3>
              <p className="text-neutral-600">O sistema ainda não registrou nenhuma atividade.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

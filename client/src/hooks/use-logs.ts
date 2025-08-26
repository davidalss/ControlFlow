import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from './use-toast';
import { useAuth } from './use-auth';

// Tipos de logs do sistema
export interface SystemLog {
  id: string;
  timestamp: Date;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'DEBUG';
  module: string;
  operation: string;
  description: string;
  details?: any;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
  duration?: number;
  status?: number;
}

export interface LogFilter {
  level?: string;
  module?: string;
  operation?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface LogStats {
  total: number;
  byLevel: Record<string, number>;
  byModule: Record<string, number>;
  byOperation: Record<string, number>;
  errorsLast24h: number;
  warningsLast24h: number;
  avgResponseTime: number;
}

// Hook principal para logs do sistema
export function useSystemLogs(filter: LogFilter = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar logs
  const {
    data: logs = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['system-logs', filter],
    queryFn: async (): Promise<SystemLog[]> => {
      const params = new URLSearchParams();
      
      if (filter.level) params.append('level', filter.level);
      if (filter.module) params.append('module', filter.module);
      if (filter.operation) params.append('operation', filter.operation);
      if (filter.userId) params.append('userId', filter.userId);
      if (filter.startDate) params.append('startDate', filter.startDate.toISOString());
      if (filter.endDate) params.append('endDate', filter.endDate.toISOString());
      if (filter.limit) params.append('limit', filter.limit.toString());
      
      const response = await apiRequest('GET', `/api/logs?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar logs: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.logs.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
    },
    enabled: !!user && user.role === 'admin',
    refetchInterval: 30000, // Atualizar a cada 30 segundos
    staleTime: 10000 // Considerar dados frescos por 10 segundos
  });

  // Buscar estatísticas
  const {
    data: stats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['system-logs-stats'],
    queryFn: async (): Promise<LogStats> => {
      const response = await apiRequest('GET', '/api/logs/stats');
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar estatísticas: ${response.statusText}`);
      }
      
      return await response.json();
    },
    enabled: !!user && user.role === 'admin',
    refetchInterval: 60000 // Atualizar a cada 1 minuto
  });

  // Criar log manual
  const createLogMutation = useMutation({
    mutationFn: async (logData: {
      level: SystemLog['level'];
      module: string;
      operation: string;
      description: string;
      details?: any;
    }) => {
      const response = await apiRequest('POST', '/api/logs', {
        ...logData,
        userId: user?.id,
        userName: user?.name,
        ipAddress: 'client-side',
        userAgent: navigator.userAgent
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao criar log: ${response.statusText}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-logs'] });
      queryClient.invalidateQueries({ queryKey: ['system-logs-stats'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao criar log do sistema",
        variant: "destructive"
      });
    }
  });

  // Limpar logs antigos
  const clearLogsMutation = useMutation({
    mutationFn: async (daysToKeep: number = 30) => {
      const response = await apiRequest('DELETE', `/api/logs/clear?days=${daysToKeep}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao limpar logs: ${response.statusText}`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['system-logs'] });
      queryClient.invalidateQueries({ queryKey: ['system-logs-stats'] });
      
      toast({
        title: "Sucesso",
        description: `${data.deletedCount} logs foram removidos`
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao limpar logs antigos",
        variant: "destructive"
      });
    }
  });

  // Exportar logs
  const exportLogsMutation = useMutation({
    mutationFn: async (exportFilter: LogFilter) => {
      const params = new URLSearchParams();
      
      if (exportFilter.level) params.append('level', exportFilter.level);
      if (exportFilter.module) params.append('module', exportFilter.module);
      if (exportFilter.operation) params.append('operation', exportFilter.operation);
      if (exportFilter.startDate) params.append('startDate', exportFilter.startDate.toISOString());
      if (exportFilter.endDate) params.append('endDate', exportFilter.endDate.toISOString());
      params.append('format', 'csv');
      
      const response = await apiRequest('GET', `/api/logs/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao exportar logs: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao exportar logs",
        variant: "destructive"
      });
    }
  });

  return {
    // Dados
    logs,
    stats,
    
    // Estados
    isLoading,
    statsLoading,
    error,
    
    // Ações
    refetch,
    createLog: createLogMutation.mutate,
    clearLogs: clearLogsMutation.mutate,
    exportLogs: exportLogsMutation.mutate,
    
    // Estados das mutações
    isCreatingLog: createLogMutation.isPending,
    isClearingLogs: clearLogsMutation.isPending,
    isExportingLogs: exportLogsMutation.isPending
  };
}

// Hook para logs de defeitos específicos
export function useDefectLogs() {
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    data: defectLogs = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['defect-logs'],
    queryFn: async (): Promise<SystemLog[]> => {
      const response = await apiRequest('GET', '/api/logs/defects');
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar logs de defeitos: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.logs.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
    },
    enabled: !!user && user.role === 'admin',
    refetchInterval: 15000 // Atualizar a cada 15 segundos para defeitos
  });

  return {
    defectLogs,
    isLoading,
    error,
    refetch
  };
}

// Hook para logs de auditoria
export function useAuditLogs(userId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    data: auditLogs = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['audit-logs', userId],
    queryFn: async (): Promise<SystemLog[]> => {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      
      const response = await apiRequest('GET', `/api/logs/audit?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar logs de auditoria: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.logs.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
    },
    enabled: !!user && user.role === 'admin',
    refetchInterval: 60000 // Atualizar a cada 1 minuto
  });

  return {
    auditLogs,
    isLoading,
    error,
    refetch
  };
}

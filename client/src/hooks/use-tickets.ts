import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseToken } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  type: 'bug' | 'feature' | 'improvement' | 'maintenance' | 'question';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'pending';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  tags: string[];
  category?: string;
  isPublic: boolean;
  allowComments: boolean;
  creator: {
    id: string;
    name: string;
    email: string;
    role: string;
    photo?: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
    role: string;
    photo?: string;
  };
}

export interface TicketMessage {
  id: string;
  content: string;
  messageType: 'text' | 'system' | 'status_change';
  systemAction?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
    photo?: string;
  };
}

export interface TicketAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  width?: number;
  height?: number;
  uploadedAt: string;
  uploader: {
    id: string;
    name: string;
    email: string;
    role: string;
    photo?: string;
  };
}

export interface TicketStats {
  total: number;
  recent: number;
  byStatus: Array<{ status: string; count: number }>;
  byType: Array<{ type: string; count: number }>;
  byPriority: Array<{ priority: string; count: number }>;
}

export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  priority?: string;
  assignedTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTicketData {
  title: string;
  description: string;
  type: Ticket['type'];
  priority?: Ticket['priority'];
  category?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface CreateMessageData {
  content: string;
  messageType?: 'text' | 'system' | 'status_change';
}

// API functions
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getSupabaseToken();
  
  const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro na requisição');
  }

  return response.json();
};

const uploadFile = async (ticketId: string, file: File, messageId?: string) => {
  const token = await getSupabaseToken();
  const formData = new FormData();
  formData.append('file', file);
  if (messageId) {
    formData.append('messageId', messageId);
  }

  const response = await fetch(`${import.meta.env.VITE_API_URL}/tickets/${ticketId}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro no upload');
  }

  return response.json();
};

// Queries
export const useTickets = (filters: TicketFilters = {}) => {
  const queryString = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryString.append(key, String(value));
    }
  });

  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => apiCall(`/tickets?${queryString}`),
  });
};

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => apiCall(`/tickets/${id}`),
    enabled: !!id,
  });
};

export const useTicketMessages = (ticketId: string, page = 1, limit = 50) => {
  return useQuery({
    queryKey: ['ticket-messages', ticketId, page, limit],
    queryFn: () => apiCall(`/tickets/${ticketId}/messages?page=${page}&limit=${limit}`),
    enabled: !!ticketId,
  });
};

export const useTicketAttachments = (ticketId: string) => {
  return useQuery({
    queryKey: ['ticket-attachments', ticketId],
    queryFn: () => apiCall(`/tickets/${ticketId}/attachments`),
    enabled: !!ticketId,
  });
};

export const useTicketStats = () => {
  return useQuery({
    queryKey: ['ticket-stats'],
    queryFn: () => apiCall('/tickets/stats/overview'),
  });
};

// Mutations
export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateTicketData) => apiCall('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
      toast({
        title: 'Sucesso',
        description: 'Ticket criado com sucesso!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Ticket> }) =>
      apiCall(`/tickets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
      toast({
        title: 'Sucesso',
        description: 'Ticket atualizado com sucesso!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => apiCall(`/tickets/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
      toast({
        title: 'Sucesso',
        description: 'Ticket deletado com sucesso!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useCreateMessage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: string; data: CreateMessageData }) =>
      apiCall(`/tickets/${ticketId}/messages`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      toast({
        title: 'Sucesso',
        description: 'Mensagem enviada com sucesso!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUploadAttachment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ ticketId, file, messageId }: { ticketId: string; file: File; messageId?: string }) =>
      uploadFile(ticketId, file, messageId),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['ticket-attachments', ticketId] });
      toast({
        title: 'Sucesso',
        description: 'Arquivo enviado com sucesso!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ ticketId, attachmentId }: { ticketId: string; attachmentId: string }) =>
      apiCall(`/tickets/${ticketId}/attachments/${attachmentId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['ticket-attachments', ticketId] });
      toast({
        title: 'Sucesso',
        description: 'Anexo deletado com sucesso!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Utility functions
export const getTicketTypeLabel = (type: Ticket['type']) => {
  const labels = {
    bug: 'Bug',
    feature: 'Nova Funcionalidade',
    improvement: 'Melhoria',
    maintenance: 'Manutenção',
    question: 'Dúvida',
  };
  return labels[type];
};

export const getTicketPriorityLabel = (priority: Ticket['priority']) => {
  const labels = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    critical: 'Crítica',
  };
  return labels[priority];
};

export const getTicketStatusLabel = (status: Ticket['status']) => {
  const labels = {
    open: 'Aberto',
    in_progress: 'Em Andamento',
    resolved: 'Resolvido',
    closed: 'Fechado',
    pending: 'Pendente',
  };
  return labels[status];
};

export const getTicketStatusColor = (status: Ticket['status']) => {
  const colors = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    pending: 'bg-orange-100 text-orange-800',
  };
  return colors[status];
};

export const getTicketPriorityColor = (priority: Ticket['priority']) => {
  const colors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };
  return colors[priority];
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isImageFile = (fileType: string) => {
  return fileType.startsWith('image/');
};

export const isVideoFile = (fileType: string) => {
  return fileType.startsWith('video/');
};

export const isPdfFile = (fileType: string) => {
  return fileType === 'application/pdf';
};

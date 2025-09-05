import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { toast } from '../hooks/use-toast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  userId: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  userId: string;
}

export interface UpdateNotificationData {
  id: string;
  isRead?: boolean;
}

// Supabase API functions
const fetchNotificationsFromSupabase = async (userId?: string): Promise<Notification[]> => {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: notifications, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar notificações: ${error.message}`);
    }

    return notifications || [];
  } catch (error) {
    console.error('Erro ao buscar notificações do Supabase:', error);
    throw error;
  }
};

const fetchUnreadNotificationsFromSupabase = async (userId?: string): Promise<Notification[]> => {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: notifications, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar notificações não lidas: ${error.message}`);
    }

    return notifications || [];
  } catch (error) {
    console.error('Erro ao buscar notificações não lidas do Supabase:', error);
    throw error;
  }
};

const createNotificationInSupabase = async (notificationData: CreateNotificationData): Promise<Notification> => {
  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert([{
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        user_id: notificationData.userId,
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar notificação: ${error.message}`);
    }

    return notification;
  } catch (error) {
    console.error('Erro ao criar notificação no Supabase:', error);
    throw error;
  }
};

const updateNotificationInSupabase = async (notificationData: UpdateNotificationData): Promise<Notification> => {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (notificationData.isRead !== undefined) {
      updateData.is_read = notificationData.isRead;
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('id', notificationData.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar notificação: ${error.message}`);
    }

    return notification;
  } catch (error) {
    console.error('Erro ao atualizar notificação no Supabase:', error);
    throw error;
  }
};

const markAllNotificationsAsReadInSupabase = async (userId?: string): Promise<void> => {
  try {
    let query = supabase
      .from('notifications')
      .update({
        is_read: true,
        updated_at: new Date().toISOString()
      })
      .eq('is_read', false);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;

    if (error) {
      throw new Error(`Erro ao marcar notificações como lidas: ${error.message}`);
    }
  } catch (error) {
    console.error('Erro ao marcar notificações como lidas no Supabase:', error);
    throw error;
  }
};

const deleteNotificationFromSupabase = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar notificação: ${error.message}`);
    }
  } catch (error) {
    console.error('Erro ao deletar notificação do Supabase:', error);
    throw error;
  }
};

// React Query hooks
export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => fetchNotificationsFromSupabase(userId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useUnreadNotifications(userId?: string) {
  return useQuery({
    queryKey: ['notifications', 'unread', userId],
    queryFn: () => fetchUnreadNotificationsFromSupabase(userId),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNotificationInSupabase,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      toast({
        title: "Sucesso",
        description: "Notificação criada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNotificationInSupabase,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', data.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsReadInSupabase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotificationFromSupabase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      toast({
        title: "Sucesso",
        description: "Notificação deletada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

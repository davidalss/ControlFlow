import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export type AppNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string | number | Date;
};

export function useNotifications() {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isFetching } = useQuery<AppNotification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 15000,
    staleTime: 0,
  });

  const notifications = data ?? [];

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  async function markAsRead(id: string) {
    await apiRequest("PATCH", `/api/notifications/${id}/read`);
    queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
  }

  async function markAllAsRead() {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    await Promise.all(
      unread.map((n) => apiRequest("PATCH", `/api/notifications/${n.id}/read`))
    );
    queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
  }

  return { notifications, unreadCount, isLoading, isFetching, refetch, markAsRead, markAllAsRead };
}



# Componente Admin de Notificações

```typescript
// components/AdminNotificationCenter.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Users, Search, Filter } from 'lucide-react';

interface AdminNotificationProps {
  showUserInfo?: boolean;
  enableFilters?: boolean;
}

export const AdminNotificationCenter: React.FC<AdminNotificationProps> = ({
  showUserInfo = true,
  enableFilters = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [filters, setFilters] = useState({
    userId: '',
    type: '',
    category: '',
    dateRange: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const notificationService = new NotificationService();

  useEffect(() => {
    loadNotifications();
    setupRealtimeSubscription();
  }, [filters]);

  const loadNotifications = async () => {
    const data = await notificationService.fetchNotifications({
      isAdminView: true,
      ...filters,
    });
    setNotifications(data);
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .from('admin_notifications_view')
      .on('*', payload => {
        handleRealtimeUpdate(payload);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Users className="h-6 w-6" />
        {notifications.some(n => !n.read) && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full"
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed right-4 top-16 w-96 bg-white rounded-lg shadow-xl border border-gray-200"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Notificações do Sistema</h2>
            </div>

            {/* Filtros */}
            {enableFilters && (
              <div className="p-4 border-b border-gray-200">
                <div className="space-y-2">
                  {/* Busca */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar notificações..."
                      className="w-full pl-10 pr-4 py-2 border rounded-md"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Filtros */}
                  <div className="flex gap-2">
                    <select
                      className="flex-1 p-2 border rounded-md"
                      value={filters.type}
                      onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
                    >
                      <option value="">Todos os tipos</option>
                      <option value="info">Info</option>
                      <option value="success">Sucesso</option>
                      <option value="warning">Aviso</option>
                      <option value="error">Erro</option>
                    </select>

                    <select
                      className="flex-1 p-2 border rounded-md"
                      value={filters.category}
                      onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
                    >
                      <option value="">Todas categorias</option>
                      <option value="sgq">SGQ</option>
                      <option value="training">Treinamento</option>
                      <option value="process">Processo</option>
                      <option value="severino">Severino</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Notificações */}
            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.map(notification => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-4 border-b hover:bg-gray-50"
                >
                  {/* Informações do Usuário */}
                  {showUserInfo && (
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                      <span>{notification.user_name || notification.user_email}</span>
                      <span className="text-gray-300">•</span>
                      <span>{notification.user_role}</span>
                    </div>
                  )}

                  {/* Conteúdo da Notificação */}
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  
                  {/* Metadados */}
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <span>{new Date(notification.created_at).toLocaleString()}</span>
                    <span className="text-gray-300">•</span>
                    <span className="capitalize">{notification.type}</span>
                    <span className="text-gray-300">•</span>
                    <span className="capitalize">{notification.category}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {notifications.length} notificações
                </span>
                <button
                  onClick={loadNotifications}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Atualizar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
```

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Eye,
  Search
} from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface NotificationCenterProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onToggle,
  className
}) => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navegar para a página correspondente
    if (notification.link) {
      window.location.href = notification.link;
    }
    
    console.log('Navegando para:', notification);
  };

  const notificationContent = (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed right-4 top-20 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-[99999] max-h-[80vh] overflow-hidden"
            style={{ 
              zIndex: 99999,
              position: 'fixed',
              top: '5rem',
              right: '1rem'
            }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Notificações
                </h3>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Barra de Busca */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar notificações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Lista de Notificações */}
            <ScrollArea className="max-h-96">
              <div className="p-4 space-y-3">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchTerm ? 'Nenhuma notificação encontrada' : 'Nenhuma notificação'}
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all duration-200",
                        notification.read
                          ? "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                          : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {notification.type === 'success' && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          {notification.type === 'warning' && (
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          )}
                          {notification.type === 'info' && (
                            <Info className="w-5 h-5 text-blue-600" />
                          )}
                          {notification.type === 'error' && (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={cn(
                              "text-sm font-medium truncate",
                              notification.read
                                ? "text-gray-900 dark:text-gray-100"
                                : "text-blue-900 dark:text-blue-100"
                            )}>
                              {notification.title}
                            </p>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {notification.timestamp}
                            </span>
                          </div>
                          <p className={cn(
                            "text-sm mt-1 line-clamp-2",
                            notification.read
                              ? "text-gray-600 dark:text-gray-400"
                              : "text-blue-800 dark:text-blue-200"
                          )}>
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    // Marcar todas como lidas
                    filteredNotifications.forEach(notification => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                    });
                  }}
                >
                  Marcar todas como lidas
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Renderizar o dropdown de notificações usando portal para garantir que apareça na frente
  return (
    <>
      {notificationContent}
      {isOpen && createPortal(
        <div 
          className="fixed inset-0 z-[99998]"
          onClick={onToggle}
          style={{ pointerEvents: 'auto' }}
        />,
        document.body
      )}
    </>
  );
};

export default NotificationCenter;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  FileText, 
  User, 
  Calendar,
  AlertTriangle,
  Eye,
  Edit
} from 'lucide-react';

export interface SGQNotificationData {
  id: string;
  type: 'approval' | 'rejection' | 'document_assigned';
  title: string;
  message: string;
  planId: string;
  planName: string;
  productName: string;
  reviewer: string;
  reviewerRole: string;
  documentNumber?: string;
  rejectionReason?: string;
  approvalComments?: string;
  timestamp: string;
  read: boolean;
}

interface SGQNotificationProps {
  notification: SGQNotificationData;
  onMarkAsRead: (id: string) => void;
  onViewPlan: (planId: string) => void;
  onEditPlan?: (planId: string) => void;
}

export default function SGQNotification({
  notification,
  onMarkAsRead,
  onViewPlan,
  onEditPlan
}: SGQNotificationProps) {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'approval':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejection':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'document_assigned':
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationBadge = () => {
    switch (notification.type) {
      case 'approval':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'rejection':
        return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
      case 'document_assigned':
        return <Badge className="bg-blue-100 text-blue-800">Documento Atribuído</Badge>;
      default:
        return <Badge variant="outline">Notificação</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMarkAsRead = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <Card className={`transition-all duration-200 ${!notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/10' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getNotificationIcon()}
            <div>
              <CardTitle className="text-lg">{notification.title}</CardTitle>
              <p className="text-sm text-gray-600">
                {formatDate(notification.timestamp)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getNotificationBadge()}
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-700">{notification.message}</p>
        
        {/* Informações do Plano */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="font-medium">Plano: {notification.planName}</span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Produto: {notification.productName}</div>
            <div>Revisor: {notification.reviewer} ({notification.reviewerRole})</div>
            {notification.documentNumber && (
              <div>Documento: {notification.documentNumber}</div>
            )}
          </div>
        </div>

        {/* Detalhes específicos */}
        {notification.type === 'rejection' && notification.rejectionReason && (
          <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="font-medium text-red-800 dark:text-red-200">Motivo da Rejeição</span>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300">
              {notification.rejectionReason}
            </p>
          </div>
        )}

        {notification.type === 'approval' && notification.approvalComments && (
          <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-200">Comentários de Aprovação</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              {notification.approvalComments}
            </p>
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewPlan(notification.planId)}
            >
              <Eye className="w-4 h-4 mr-1" />
              Ver Plano
            </Button>
            
            {notification.type === 'rejection' && onEditPlan && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditPlan(notification.planId)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
            )}
          </div>
          
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAsRead}
            >
              Marcar como lida
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para lista de notificações
export function SGQNotificationList({ 
  notifications, 
  onMarkAsRead, 
  onViewPlan, 
  onEditPlan 
}: {
  notifications: SGQNotificationData[];
  onMarkAsRead: (id: string) => void;
  onViewPlan: (planId: string) => void;
  onEditPlan?: (planId: string) => void;
}) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-800 dark:text-blue-200">
              {unreadCount} notificação{unreadCount > 1 ? 's' : ''} não lida{unreadCount > 1 ? 's' : ''}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => notifications.forEach(n => !n.read && onMarkAsRead(n.id))}
          >
            Marcar todas como lidas
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Nenhuma notificação</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <SGQNotification
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onViewPlan={onViewPlan}
              onEditPlan={onEditPlan}
            />
          ))}
        </div>
      )}
    </div>
  );
}

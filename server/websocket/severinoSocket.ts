import { WebSocketServer, WebSocket } from 'ws';
import { WebSocketMessage, WebSocketConnection, SeverinoNotification } from '../types/severino';

class SeverinoWebSocket {
  private wss: WebSocketServer;
  private connections: Map<string, WebSocketConnection> = new Map();
  private userConnections: Map<string, string[]> = new Map(); // userId -> connectionIds[]

  constructor(server: any) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/severino' // Path específico para evitar conflito com HMR
    });
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', (ws: WebSocket, request: any) => {
      const connectionId = this.generateConnectionId();
      const ipAddress = request.socket.remoteAddress;
      const userAgent = request.headers['user-agent'] || 'Unknown';

      console.log(`🔌 Nova conexão WebSocket: ${connectionId}`);

      // Extrair userId do token ou query params
      const url = new URL(request.url, `http://${request.headers.host}`);
      const userId = url.searchParams.get('userId') || 'anonymous';

      const connection: WebSocketConnection = {
        id: connectionId,
        userId,
        connectedAt: new Date(),
        lastActivity: new Date(),
        userAgent,
        ipAddress
      };

      this.connections.set(connectionId, connection);
      
      // Mapear usuário para conexões
      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, []);
      }
      this.userConnections.get(userId)!.push(connectionId);

      // Enviar mensagem de boas-vindas
      this.sendToConnection(connectionId, {
        type: 'status_update',
        data: {
          status: 'connected',
                              message: 'Conectado ao Severino Assistant',
          timestamp: new Date()
        },
        timestamp: new Date(),
        userId
      });

      // Configurar handlers de mensagem
      ws.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(connectionId, message);
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
          this.sendToConnection(connectionId, {
            type: 'error',
            data: {
              error: 'Mensagem inválida',
              details: error instanceof Error ? error.message : 'Unknown error'
            },
            timestamp: new Date()
          });
        }
      });

      // Configurar handler de desconexão
      ws.on('close', () => {
        this.handleDisconnection(connectionId);
      });

      // Configurar handler de erro
      ws.on('error', (error) => {
        console.error(`Erro na conexão WebSocket ${connectionId}:`, error);
        this.handleDisconnection(connectionId);
      });

      // Armazenar referência do WebSocket
      (ws as any).connectionId = connectionId;
    });
  }

  private handleMessage(connectionId: string, message: WebSocketMessage) {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      console.error(`Conexão não encontrada: ${connectionId}`);
      return;
    }

    // Atualizar última atividade
    connection.lastActivity = new Date();

    console.log(`📨 Mensagem recebida de ${connection.userId}:`, message.type);

    switch (message.type) {
      case 'message':
        this.handleChatMessage(connectionId, message);
        break;
      case 'action':
        this.handleActionRequest(connectionId, message);
        break;
      case 'notification':
        this.handleNotificationAck(connectionId, message);
        break;
      case 'status_update':
        this.handleStatusUpdate(connectionId, message);
        break;
      default:
        console.warn(`Tipo de mensagem desconhecido: ${message.type}`);
    }
  }

  private handleChatMessage(connectionId: string, message: WebSocketMessage) {
    // Aqui você pode integrar com o Gemini Service
    // Por enquanto, vamos simular uma resposta
    setTimeout(() => {
      this.sendToConnection(connectionId, {
        type: 'message',
        data: {
          role: 'assistant',
                              content: 'Olá! Sou o Severino. Como posso ajudar você hoje?',
          timestamp: new Date()
        },
        timestamp: new Date(),
        userId: message.userId
      });
    }, 1000);
  }

  private handleActionRequest(connectionId: string, message: WebSocketMessage) {
    // Processar ações solicitadas pelo usuário
    const action = message.data;
    
    // Simular processamento de ação
    this.sendToConnection(connectionId, {
      type: 'action',
      data: {
        status: 'processing',
        action: action.type,
        message: 'Processando sua solicitação...'
      },
      timestamp: new Date(),
      userId: message.userId
    });

    // Aqui você pode integrar com os scripts Python de automação
    setTimeout(() => {
      this.sendToConnection(connectionId, {
        type: 'action',
        data: {
          status: 'completed',
          action: action.type,
          result: 'Ação executada com sucesso!'
        },
        timestamp: new Date(),
        userId: message.userId
      });
    }, 2000);
  }

  private handleNotificationAck(connectionId: string, message: WebSocketMessage) {
    // Marcar notificação como lida
    const notificationId = message.data.notificationId;
    console.log(`Notificação ${notificationId} marcada como lida por ${connectionId}`);
  }

  private handleStatusUpdate(connectionId: string, message: WebSocketMessage) {
    // Atualizar status da conexão
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastActivity = new Date();
    }
  }

  private handleDisconnection(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      console.log(`🔌 Desconexão: ${connectionId} (${connection.userId})`);
      
      // Remover da lista de conexões
      this.connections.delete(connectionId);
      
      // Remover do mapeamento de usuário
      const userConnections = this.userConnections.get(connection.userId);
      if (userConnections) {
        const index = userConnections.indexOf(connectionId);
        if (index > -1) {
          userConnections.splice(index, 1);
          if (userConnections.length === 0) {
            this.userConnections.delete(connection.userId);
          }
        }
      }
    }
  }

  // Métodos públicos para envio de mensagens

  public sendToUser(userId: string, message: WebSocketMessage) {
    const userConnections = this.userConnections.get(userId);
    if (userConnections) {
      userConnections.forEach(connectionId => {
        this.sendToConnection(connectionId, message);
      });
    }
  }

  public sendToAll(message: WebSocketMessage) {
    this.wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  public sendToConnection(connectionId: string, message: WebSocketMessage) {
    this.wss.clients.forEach((client: WebSocket) => {
      if ((client as any).connectionId === connectionId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  public sendNotification(userId: string, notification: SeverinoNotification) {
    this.sendToUser(userId, {
      type: 'notification',
      data: notification,
      timestamp: new Date(),
      userId
    });
  }

  public sendProactiveHelp(userId: string, helpData: any) {
    this.sendToUser(userId, {
      type: 'message',
      data: {
        role: 'assistant',
        content: helpData.message,
        suggestions: helpData.suggestions,
        timestamp: new Date()
      },
      timestamp: new Date(),
      userId
    });
  }

  public sendAutomationStatus(userId: string, taskId: string, status: string, result?: any) {
    this.sendToUser(userId, {
      type: 'action',
      data: {
        taskId,
        status,
        result,
        timestamp: new Date()
      },
      timestamp: new Date(),
      userId
    });
  }

  // Métodos de utilidade

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getConnectionStats() {
    return {
      totalConnections: this.connections.size,
      activeUsers: this.userConnections.size,
      connectionsByUser: Object.fromEntries(
        Array.from(this.userConnections.entries()).map(([userId, connections]) => [
          userId,
          connections.length
        ])
      )
    };
  }

  public cleanupInactiveConnections(timeoutMinutes: number = 30) {
    const now = new Date();
    const timeoutMs = timeoutMinutes * 60 * 1000;

    this.connections.forEach((connection, connectionId) => {
      if (now.getTime() - connection.lastActivity.getTime() > timeoutMs) {
        console.log(`Limpeza: Removendo conexão inativa ${connectionId}`);
        this.handleDisconnection(connectionId);
      }
    });
  }

  // Método para integração com o Gemini Service
  public async processSeverinoResponse(userId: string, userInput: string, response: string) {
    this.sendToUser(userId, {
      type: 'message',
      data: {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      },
      timestamp: new Date(),
      userId
    });
  }

  // Método para enviar alertas críticos
  public sendCriticalAlert(userIds: string[], alert: {
    title: string;
    message: string;
    priority: 'high' | 'critical';
    action?: any;
  }) {
    const message: WebSocketMessage = {
      type: 'notification',
      data: {
        id: `alert_${Date.now()}`,
        type: alert.priority === 'critical' ? 'error' : 'warning',
        title: alert.title,
        message: alert.message,
        timestamp: new Date(),
        read: false,
        action: alert.action,
        priority: alert.priority
      },
      timestamp: new Date()
    };

    userIds.forEach(userId => {
      this.sendToUser(userId, message);
    });
  }
}

export default SeverinoWebSocket;

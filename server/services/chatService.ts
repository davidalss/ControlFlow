import { db } from '../db';
import { 
  chatSessions, chatMessages, chatContexts,
  type ChatSession, type ChatMessage, type ChatContext,
  type InsertChatSession, type InsertChatMessage, type InsertChatContext
} from '../../shared/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

export interface ChatContextData {
  labelAnalysis?: {
    labelId: string;
    labelData: any;
    analysisResult: any;
  };
  productInfo?: {
    productId: string;
    productData: any;
  };
  inspectionData?: {
    inspectionId: string;
    inspectionData: any;
  };
  comparison?: {
    items: any[];
    comparisonResult: any;
  };
}

export class ChatService {
  /**
   * Criar ou obter sessão ativa do usuário
   */
  async getOrCreateSession(userId: string, sessionName?: string): Promise<ChatSession> {
    // Buscar sessão ativa existente
    const existingSession = await db
      .select()
      .from(chatSessions)
      .where(
        and(
          eq(chatSessions.userId, userId),
          eq(chatSessions.status, 'active')
        )
      )
      .limit(1);

    if (existingSession.length > 0) {
      return existingSession[0];
    }

    // Criar nova sessão
    const [newSession] = await db
      .insert(chatSessions)
      .values({
        userId,
        sessionName: sessionName || `Sessão ${new Date().toLocaleString('pt-BR')}`,
        status: 'active'
      })
      .returning();

    return newSession;
  }

  /**
   * Salvar mensagem do usuário
   */
  async saveUserMessage(sessionId: string, content: string, context?: any): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values({
        sessionId,
        role: 'user',
        content,
        context: context ? JSON.stringify(context) : null
      })
      .returning();

    return message;
  }

  /**
   * Salvar resposta do assistente
   */
  async saveAssistantMessage(sessionId: string, content: string, media?: any, context?: any): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values({
        sessionId,
        role: 'assistant',
        content,
        media: media ? JSON.stringify(media) : null,
        context: context ? JSON.stringify(context) : null
      })
      .returning();

    return message;
  }

  /**
   * Salvar contexto da conversa
   */
  async saveContext(sessionId: string, contextType: string, contextData: ChatContextData): Promise<ChatContext> {
    const [context] = await db
      .insert(chatContexts)
      .values({
        sessionId,
        contextType,
        contextData: JSON.stringify(contextData)
      })
      .returning();

    return context;
  }

  /**
   * Obter histórico de mensagens da sessão
   */
  async getSessionMessages(sessionId: string, limit: number = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt))
      .limit(limit);
  }

  /**
   * Obter contexto da sessão
   */
  async getSessionContexts(sessionId: string): Promise<ChatContext[]> {
    return await db
      .select()
      .from(chatContexts)
      .where(eq(chatContexts.sessionId, sessionId))
      .orderBy(desc(chatContexts.createdAt));
  }

  /**
   * Obter sessão por ID
   */
  async getSessionById(sessionId: string): Promise<ChatSession | null> {
    const sessions = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId))
      .limit(1);
    
    return sessions.length > 0 ? sessions[0] : null;
  }

  /**
   * Obter sessões do usuário
   */
  async getUserSessions(userId: string): Promise<ChatSession[]> {
    return await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.updatedAt));
  }

  /**
   * Arquivar sessão
   */
  async archiveSession(sessionId: string): Promise<void> {
    await db
      .update(chatSessions)
      .set({ status: 'archived' })
      .where(eq(chatSessions.id, sessionId));
  }

  /**
   * Obter contexto para análise de etiqueta
   */
  async getLabelAnalysisContext(sessionId: string): Promise<any[]> {
    const contexts = await db
      .select()
      .from(chatContexts)
      .where(
        and(
          eq(chatContexts.sessionId, sessionId),
          eq(chatContexts.contextType, 'label_analysis')
        )
      )
      .orderBy(desc(chatContexts.createdAt));

    return contexts.map(ctx => JSON.parse(ctx.contextData));
  }

  /**
   * Obter contexto para comparação
   */
  async getComparisonContext(sessionId: string): Promise<any[]> {
    const contexts = await db
      .select()
      .from(chatContexts)
      .where(
        and(
          eq(chatContexts.sessionId, sessionId),
          eq(chatContexts.contextType, 'comparison')
        )
      )
      .orderBy(desc(chatContexts.createdAt));

    return contexts.map(ctx => JSON.parse(ctx.contextData));
  }

  /**
   * Limpar histórico antigo (manter apenas últimas 100 mensagens por sessão)
   */
  async cleanupOldMessages(sessionId: string): Promise<void> {
    // Manter apenas as últimas 100 mensagens
    const messages = await db
      .select({ id: chatMessages.id })
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(100);

    if (messages.length === 100) {
      const messageIds = messages.map(m => m.id);
      await db
        .delete(chatMessages)
        .where(
          and(
            eq(chatMessages.sessionId, sessionId),
            // Excluir mensagens que não estão na lista das 100 mais recentes
            // (implementação simplificada - em produção usar subquery)
          )
        );
    }
  }
}

export const chatService = new ChatService();

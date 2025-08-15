import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';

export interface ChatSession {
  id: string;
  userId: string;
  sessionName: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  media?: any;
  context?: any;
  metadata?: any;
  createdAt: string;
}

export interface ChatContext {
  id: string;
  sessionId: string;
  contextType: string;
  contextData: any;
  createdAt: string;
}

export const useChatHistory = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obter ou criar sessão ativa
  const getOrCreateSession = useCallback(async (sessionName?: string) => {
    console.log('🔄 getOrCreateSession chamado');
    console.log('👤 User ID:', user?.id);
    
    if (!user?.id) {
      console.log('❌ Usuário não disponível');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📡 Fazendo requisição para /api/chat/sessions');
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ sessionName })
      });

      console.log('📋 Status da resposta:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);
        throw new Error('Erro ao criar/obter sessão');
      }

      const { data } = await response.json();
      console.log('✅ Sessão obtida:', data);
      setCurrentSession(data);
      return data;
    } catch (err) {
      console.error('❌ Erro em getOrCreateSession:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Carregar sessões do usuário
  const loadSessions = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/chat/sessions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar sessões');
      }

      const { data } = await response.json();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Carregar mensagens de uma sessão
  const loadMessages = useCallback(async (sessionId: string, limit: number = 50) => {
    console.log('🔄 loadMessages chamado para sessionId:', sessionId);
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/chat/sessions/${sessionId}/messages?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('📋 Status da resposta loadMessages:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro ao carregar mensagens:', errorText);
        throw new Error('Erro ao carregar mensagens');
      }

      const { data } = await response.json();
      console.log('✅ Mensagens carregadas:', data.length);
      setMessages(data);
      return data;
    } catch (err) {
      console.error('❌ Erro em loadMessages:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar contextos de uma sessão
  const loadContexts = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/contexts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar contextos');
      }

      const { data } = await response.json();
      return data;
    } catch (err) {
      console.error('Erro ao carregar contextos:', err);
      return [];
    }
  }, []);

  // Arquivar sessão
  const archiveSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/archive`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao arquivar sessão');
      }

      // Recarregar sessões
      await loadSessions();
      
      // Se a sessão arquivada era a atual, limpar
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }, [currentSession?.id, loadSessions]);

  // Carregar contexto de análise de etiquetas
  const loadLabelAnalysisContext = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/label-analysis`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar contexto de análise');
      }

      const { data } = await response.json();
      return data;
    } catch (err) {
      console.error('Erro ao carregar contexto de análise:', err);
      return [];
    }
  }, []);

  // Carregar contexto de comparações
  const loadComparisonContext = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/comparison`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar contexto de comparação');
      }

      const { data } = await response.json();
      return data;
    } catch (err) {
      console.error('Erro ao carregar contexto de comparação:', err);
      return [];
    }
  }, []);

  // Carregar sessões quando o usuário mudar
  useEffect(() => {
    if (user?.id) {
      loadSessions();
    }
  }, [user?.id, loadSessions]);

  return {
    sessions,
    currentSession,
    messages,
    loading,
    error,
    getOrCreateSession,
    loadSessions,
    loadMessages,
    loadContexts,
    archiveSession,
    loadLabelAnalysisContext,
    loadComparisonContext,
    setCurrentSession,
    setMessages
  };
};

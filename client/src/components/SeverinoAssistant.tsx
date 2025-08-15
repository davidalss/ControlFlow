import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  MicOff,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Importar novos componentes e serviços
import VisualChart from './VisualChart';
import VisualFlowchart from './VisualFlowchart';
import { severinoAI } from '@/services/severinoAI';
import { severinoActions } from '@/services/severinoActions';
import { searchKnowledge, getCategories } from '@/data/severinoKnowledge';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isRead: boolean;
  metadata?: {
    suggestions?: string[];
    confidence?: number;
    category?: string;
    action?: string;
    data?: any;
  };
}

interface SeverinoAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPage?: string;
  currentContext?: any;
  onAction?: (action: string, data: any) => void;
}

const SeverinoAssistant: React.FC<SeverinoAssistantProps> = ({
  isOpen,
  onToggle,
  currentPage = '/',
  currentContext,
  onAction
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const [shouldScrollToTop, setShouldScrollToTop] = useState(false);

  // Estados para modal visual
  const [visualModal, setVisualModal] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
    type: 'chart' | 'kpi' | 'flowchart' | 'document' | 'dashboard';
    data?: any;
  }>({
    isOpen: false,
    title: '',
    content: '',
    type: 'chart'
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Configurar contexto do AI
  useEffect(() => {
    severinoAI.setContext(currentPage);
    severinoActions.setContext(currentPage, currentContext);
  }, [currentPage, currentContext]);

  // Função para obter saudação contextual
  const getContextualGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = '';
    if (hour < 12) timeGreeting = 'Bom dia';
    else if (hour < 18) timeGreeting = 'Boa tarde';
    else timeGreeting = 'Boa noite';

    return {
      greeting: `${timeGreeting}! Sou o Guru Severino, seu assistente de qualidade.

Posso ajudá-lo com:
• Navegação no sistema
• Criação de gráficos e relatórios
• Explicações sobre qualidade
• Ações automáticas

Como posso ajudá-lo hoje?`,
      suggestions: [
        'Ir para inspeções',
        'Criar gráfico',
        'Explicar AQL',
        'Ver mais opções'
      ]
    };
  };

  // Função para resposta offline com IA avançada
  const getOfflineResponse = async (input: string) => {
    const lowerInput = input.toLowerCase();

    // Verificar se é pedido para ver mais opções
    if (lowerInput.includes('ver mais') || lowerInput.includes('mais opções') || lowerInput.includes('outras opções')) {
      const categories = getCategories();
      const categoryList = categories.map(cat => `• ${cat}`).join('\n');
      
      return {
        content: `Aqui estão todas as minhas capacidades:

Navegação Inteligente:
• "Ir para inspeções" - Acessar módulo de inspeções
• "Navegar para treinamentos" - Acessar módulo de treinamentos
• "Filtrar em andamento" - Aplicar filtros automáticos
• "Criar nova inspeção" - Criar inspeção automaticamente

Criação de Elementos Visuais:
• "Criar gráfico de barras" - Gráficos interativos
• "Gerar KPI de qualidade" - Indicadores personalizados
• "Criar fluxograma" - Processos visuais
• "Gerar relatório" - Documentos estruturados

Conhecimento Especializado:
${categoryList}

Exemplos de Comandos:
• "Explicar o que é AQL"
• "Como implementar 5S"
• "Criar gráfico de tendências"
• "Ir para inspeções em andamento"

Posso ajudá-lo com qualquer uma dessas funcionalidades!`,
        metadata: {
          suggestions: [
            'Ir para inspeções',
            'Criar gráfico',
            'Explicar AQL',
            'Implementar 5S'
          ]
        }
      };
    }

    // Verificar se é comando de ação
    if (lowerInput.includes('ir para') || lowerInput.includes('navegar') || 
        lowerInput.includes('filtrar') || lowerInput.includes('criar') ||
        lowerInput.includes('mostrar')) {
      
      const actionResult = await severinoActions.executeCommand(input);
      
      if (actionResult.success) {
        return {
          content: `✅ ${actionResult.message}

Ação executada com sucesso!`,
          metadata: {
            suggestions: [
              'Ver resultados',
              'Aplicar mais filtros',
              'Criar novo item',
              'Voltar ao início'
            ],
            action: 'system_action',
            data: actionResult.data
          }
        };
      } else {
        return {
          content: `❌ Erro na execução

${actionResult.message}

Tente comandos como:
• "Ir para inspeções"
• "Filtrar em andamento"
• "Criar nova inspeção"`,
          metadata: {
            suggestions: [
              'Ir para inspeções',
              'Filtrar em andamento',
              'Criar nova inspeção',
              'Ver ajuda'
            ]
          }
        };
      }
    }

    // Verificar se é pergunta sobre conhecimento
    if (lowerInput.includes('o que é') || lowerInput.includes('explicar') || 
        lowerInput.includes('como') || lowerInput.includes('quando') ||
        lowerInput.includes('por que') || lowerInput.includes('definir')) {
      
      const aiResponse = await severinoAI.processQuestion(input);
      
      return {
        content: aiResponse.content,
        metadata: {
          suggestions: aiResponse.suggestions,
          confidence: aiResponse.confidence,
          category: aiResponse.category,
          data: aiResponse.metadata
        }
      };
    }

    // KPIs Personalizados com gráficos interativos
    if (lowerInput.includes('kpi') || lowerInput.includes('indicador') || lowerInput.includes('métrica')) {
      setTimeout(() => {
        setVisualModal({
          isOpen: true,
          title: 'KPI - Taxa de Aceitação',
          content: 'Criando indicador visual personalizado...',
          type: 'kpi',
          data: {
            value: '95.2%',
            label: 'Taxa de Aceitação',
            trend: '+2.1%',
            color: 'green'
          }
        });
      }, 1000);

      return {
        content: `🎯 **Criando KPI Personalizado!**

Vou criar um indicador visual personalizado para você.

**Tipos de KPIs disponíveis:**
• **Taxa de Aceitação**: % de lotes aprovados
• **Eficiência de Inspeção**: Tempo médio por inspeção
• **Conformidade**: % de produtos em conformidade
• **Treinamentos**: % de treinamentos concluídos
• **Não-Conformidades**: Quantidade de NCs abertas

**Funcionalidades:**
• Cores dinâmicas baseadas no valor
• Comparação com período anterior
• Alertas automáticos
• Exportação para relatórios

Aguarde um momento enquanto crio o KPI para você...`,
        metadata: {
          suggestions: [
            'Criar KPI de taxa de aceitação',
            'Criar KPI de eficiência',
            'Criar KPI de conformidade',
            'Criar dashboard de KPIs'
          ]
        }
      };
    }

    // Gráficos Interativos
    if (lowerInput.includes('gráfico') || lowerInput.includes('grafico') || lowerInput.includes('chart')) {
      setTimeout(() => {
        setVisualModal({
          isOpen: true,
          title: 'Gráfico - Taxa de Aceitação por Mês',
          content: 'Criando gráfico visual personalizado...',
          type: 'chart',
          data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
            datasets: [{
              label: 'Taxa de Aceitação (%)',
              data: [92, 94, 91, 95, 93],
              backgroundColor: 'rgba(54, 162, 235, 0.8)'
            }]
          }
        });
      }, 1000);

      return {
        content: `📊 **Criando Gráfico Interativo!**

Vou criar um gráfico visual personalizado para você.

**Tipos de gráficos disponíveis:**
• **Gráfico de Barras**: Comparação entre categorias
• **Gráfico de Linha**: Evolução temporal
• **Gráfico de Pizza**: Distribuição percentual
• **Gráfico de Dispersão**: Correlação entre variáveis
• **Histograma**: Distribuição de frequências

**Funcionalidades:**
• Interatividade completa
• Tooltips informativos
• Zoom e pan
• Exportação em PNG/PDF
• Animações suaves

Aguarde um momento enquanto crio o gráfico para você...`,
        metadata: {
          suggestions: [
            'Criar gráfico de tendências',
            'Criar gráfico de comparação',
            'Criar gráfico de distribuição',
            'Criar dashboard de gráficos'
          ]
        }
      };
    }

    // Fluxogramas Dinâmicos
    if (lowerInput.includes('fluxograma') || lowerInput.includes('diagrama') || lowerInput.includes('processo')) {
      setTimeout(() => {
        setVisualModal({
          isOpen: true,
          title: 'Fluxograma - Processo de Inspeção AQL',
          content: 'Criando fluxograma visual...',
          type: 'flowchart',
          data: {
            nodes: [
              { id: 'A', label: 'Receber Material', type: 'start', x: 400, y: 50 },
              { id: 'B', label: 'Verificar Documentação', type: 'process', x: 400, y: 150 },
              { id: 'C', label: 'Documentação OK?', type: 'decision', x: 400, y: 250 },
              { id: 'D', label: 'Selecionar Amostra AQL', type: 'process', x: 400, y: 350 },
              { id: 'E', label: 'Rejeitar Lote', type: 'end', x: 200, y: 250 },
              { id: 'F', label: 'Inspecionar Amostra', type: 'process', x: 400, y: 450 },
              { id: 'G', label: 'Defeitos ≤ AQL?', type: 'decision', x: 400, y: 550 },
              { id: 'H', label: 'Aceitar Lote', type: 'end', x: 600, y: 550 },
              { id: 'I', label: 'Rejeitar Lote', type: 'end', x: 200, y: 550 }
            ],
            edges: [
              { from: 'A', to: 'B' },
              { from: 'B', to: 'C' },
              { from: 'C', to: 'D', label: 'Sim' },
              { from: 'C', to: 'E', label: 'Não' },
              { from: 'D', to: 'F' },
              { from: 'F', to: 'G' },
              { from: 'G', to: 'H', label: 'Sim' },
              { from: 'G', to: 'I', label: 'Não' }
            ]
          }
        });
      }, 1000);

      return {
        content: `🔄 **Criando Fluxograma Dinâmico!**

Vou criar um fluxograma visual para documentar processos.

**Tipos de fluxogramas:**
• **Processo de Inspeção**: Fluxo AQL completo
• **Gestão de Não-Conformidades**: Processo de correção
• **Treinamento**: Fluxo de capacitação
• **Controle de Qualidade**: Processo de verificação

**Funcionalidades:**
• Símbolos padrão de fluxograma
• Cores por tipo de decisão
• Exportação em SVG/PNG
• Edição colaborativa
• Versionamento

Aguarde um momento enquanto crio o fluxograma para você...`,
        metadata: {
          suggestions: [
            'Criar fluxograma de inspeção',
            'Criar fluxograma de não-conformidades',
            'Criar fluxograma de treinamento',
            'Criar documentação de processos'
          ]
        }
      };
    }

    return null;
  };

  // Função para processar input do usuário
  const processUserInput = async (userInput: string) => {
    // Registrar atividade
    setLastActivityTime(Date.now());
    setShouldScrollToTop(false);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date(),
      isRead: false
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    // Verificar resposta offline primeiro
    const offlineResponse = await getOfflineResponse(userInput);
    
    if (offlineResponse) {
      // Simular delay de processamento
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: offlineResponse.content,
          timestamp: new Date(),
          isRead: false,
          metadata: offlineResponse.metadata
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsProcessing(false);
      }, 1000);
    } else {
      // Resposta padrão se não encontrar resposta offline
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `Entendi sua solicitação: "${userInput}". Como posso ajudá-lo com isso?`,
          timestamp: new Date(),
          isRead: false,
          metadata: {
            suggestions: [
              'Explicar mais detalhes',
              'Criar um exemplo',
              'Navegar para página relacionada'
            ]
          }
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsProcessing(false);
      }, 1000);
    }
  };

  // Função para enviar mensagem
  const handleSendMessage = () => {
    if (input.trim() && !isProcessing) {
      processUserInput(input.trim());
    }
  };

  // Função para marcar como lido
  const markAsRead = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      )
    );
  };

  // Efeito para scroll automático inteligente
  useEffect(() => {
    if (messages.length > 0) {
      const timeSinceLastActivity = Date.now() - lastActivityTime;
      const tenMinutes = 10 * 60 * 1000; // 10 minutos em millisegundos
      
      // Se passou mais de 10 minutos desde a última atividade, ir para o topo
      if (timeSinceLastActivity > tenMinutes) {
        setShouldScrollToTop(true);
      }
      
      if (shouldScrollToTop || (messages.length === 1 && messages[0].id === 'welcome')) {
        // Ir para o topo
        const scrollArea = document.querySelector('.severino-chat-container .scroll-area-viewport');
        if (scrollArea) {
          scrollArea.scrollTop = 0;
        }
      } else {
        // Manter posição atual ou ir para o final se for nova mensagem
        const isNewMessage = messages[messages.length - 1].timestamp.getTime() > lastActivityTime - 5000;
        if (isNewMessage) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [messages, lastActivityTime, shouldScrollToTop]);

  // Efeito para monitorar inatividade
  useEffect(() => {
    const checkInactivity = () => {
      const timeSinceLastActivity = Date.now() - lastActivityTime;
      const tenMinutes = 10 * 60 * 1000; // 10 minutos
      
      if (timeSinceLastActivity > tenMinutes && !shouldScrollToTop) {
        setShouldScrollToTop(true);
      }
    };

    const interval = setInterval(checkInactivity, 60000); // Verificar a cada minuto
    
    return () => clearInterval(interval);
  }, [lastActivityTime, shouldScrollToTop]);

  // Efeito para mensagem inicial
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const context = getContextualGreeting();
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'assistant',
        content: context.greeting,
        timestamp: new Date(),
        isRead: true,
        metadata: { suggestions: context.suggestions }
      };
      setMessages([welcomeMessage]);
      setLastActivityTime(Date.now());
      setShouldScrollToTop(true);
    }
  }, [isOpen, currentPage]);

  // Efeito para foco no input
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "severino-chat-container fixed bottom-4 right-4 z-50 flex flex-col bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700",
              isMinimized ? "w-80 h-16" : "w-80 h-[500px]"
            )}
          >
            {/* Header */}
            <div className="severino-header flex items-center justify-between p-4 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white shadow-lg rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/severino-avatar.png" alt="Guru Severino" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold">
                    GS
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <h3 className="severino-header-title text-white font-bold truncate" style={{ fontSize: '1rem' }}>Guru Severino</h3>
                  <p className="severino-header-subtitle text-xs opacity-80" style={{ fontSize: '1rem' }}>Assistente Inteligente</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="text-purple-200 hover:text-white hover:bg-purple-600/50 h-9 w-9 p-0 rounded-lg transition-all duration-200"
                      >
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isMinimized ? 'Expandir' : 'Minimizar'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggle}
                        className="text-purple-200 hover:text-white hover:bg-red-600/50 h-9 w-9 p-0 rounded-lg transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Fechar
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <ScrollArea className="flex-1 p-4 h-full">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            "flex",
                            message.type === 'user' ? "justify-end" : "justify-start"
                          )}
                          onClick={() => !message.isRead && markAsRead(message.id)}
                        >
                          <div
                            className={cn(
                              "max-w-[85%] rounded-2xl p-4 relative shadow-sm",
                              message.type === 'user'
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            )}
                          >
                            <div className="severino-message whitespace-pre-wrap leading-relaxed" style={{ fontSize: '1rem', lineHeight: '1.3' }}>
                              {message.content}
                            </div>
                            
                            <div className={cn(
                              "severino-timestamp mt-3 flex items-center justify-end",
                              message.type === 'user' ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                            )} style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                              {message.timestamp.toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                            
                            {message.metadata?.suggestions && (
                              <div className="mt-4 space-y-2">
                                {message.metadata.suggestions.map((suggestion, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => processUserInput(suggestion)}
                                    className={cn(
                                      "severino-suggestion w-full text-left justify-start h-auto p-3 rounded-lg",
                                      message.type === 'user' 
                                        ? "bg-white/10 hover:bg-white/20 border-white/20 text-white" 
                                        : "bg-white/50 hover:bg-white/70 dark:bg-gray-600/50 dark:hover:bg-gray-600/70"
                                    )}
                                    style={{ fontSize: '1rem', padding: '0.4rem 0.8rem' }}
                                  >
                                    {suggestion}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      
                      {isProcessing && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-start"
                        >
                          <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 max-w-[85%]">
                            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-sm" style={{ fontSize: '1rem' }}>Severino está digitando...</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    <div ref={messagesEndRef} />
                  </ScrollArea>
                </div>

                {/* Input Area */}
                <div className="severino-input-area flex items-center space-x-2 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Digite sua mensagem..."
                    className="severino-input flex-1"
                    style={{ fontSize: '1rem' }}
                    disabled={isProcessing}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isProcessing}
                    className="severino-button"
                    size="sm"
                    style={{ fontSize: '1rem' }}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Visual */}
      <AnimatePresence>
        {visualModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setVisualModal(prev => ({ ...prev, isOpen: false }))}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do Modal */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    {visualModal.type === 'kpi' && <span className="text-white text-lg">📊</span>}
                    {visualModal.type === 'chart' && <span className="text-white text-lg">📈</span>}
                    {visualModal.type === 'flowchart' && <span className="text-white text-lg">🔄</span>}
                    {visualModal.type === 'document' && <span className="text-white text-lg">📄</span>}
                    {visualModal.type === 'dashboard' && <span className="text-white text-lg">🎛️</span>}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {visualModal.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Criado pelo Guru Severino
                    </p>
                  </div>
                </div>
                
                {/* Botões de Ação */}
                <div className="flex items-center space-x-2">
                  {/* Zoom */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Zoom</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Download */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                          onClick={() => {
                            console.log('Downloading visual element...');
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Imprimir */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                          onClick={() => {
                            window.print();
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Imprimir</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Fechar */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setVisualModal(prev => ({ ...prev, isOpen: false }))}
                          className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Fechar</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
                {/* KPI */}
                {visualModal.type === 'kpi' && (
                  <div className="flex justify-center">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
                      <div className="text-center">
                        <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                          {visualModal.data?.value || '95.2%'}
                        </div>
                        <div className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {visualModal.data?.label || 'Taxa de Aceitação'}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                          {visualModal.data?.trend || '+2.1%'} vs mês anterior
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gráfico Interativo */}
                {visualModal.type === 'chart' && (
                  <div className="flex justify-center">
                    <VisualChart
                      type="bar"
                      data={{
                        labels: visualModal.data?.labels || ['Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
                        datasets: visualModal.data?.datasets || [{
                          label: 'Taxa de Aceitação (%)',
                          data: [92, 94, 91, 95, 93],
                          backgroundColor: 'rgba(54, 162, 235, 0.8)'
                        }]
                      }}
                      title="Taxa de Aceitação por Mês"
                      height={400}
                      width={600}
                    />
                  </div>
                )}

                {/* Fluxograma Dinâmico */}
                {visualModal.type === 'flowchart' && (
                  <div className="flex justify-center">
                    <VisualFlowchart
                      nodes={visualModal.data?.nodes || []}
                      edges={visualModal.data?.edges || []}
                      title="Processo de Inspeção AQL"
                      height={500}
                      width={800}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SeverinoAssistant;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Brain,
  Wifi,
  WifiOff,
  Maximize2,
  Image,
  Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import MermaidDiagram from './MermaidDiagram';
import { useChatHistory } from '@/hooks/use-chat-history';
import { useAuth } from '@/hooks/use-auth';
import { useApiStatus } from '@/hooks/use-api-status';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'action' | 'notification';
  content: string;
  timestamp: Date;
  isRead: boolean;
  metadata?: {
    action?: string;
    data?: any;
    confidence?: number;
    suggestions?: string[];
    relatedFields?: string[];
    notificationType?: 'info' | 'success' | 'warning' | 'error';
    priority?: 'low' | 'medium' | 'high';
    // Novos campos para mídia
    media?: {
      type: 'image' | 'chart' | 'diagram' | 'file';
      url?: string;
      alt?: string;
      caption?: string;
      width?: number;
      height?: number;
    }[];
    // Para gráficos e diagramas gerados
    chart?: {
      type: 'bar' | 'line' | 'pie' | 'scatter' | 'flowchart' | 'mindmap';
      data?: any;
      options?: any;
    };
  };
}



interface SeverinoAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  isMinimized?: boolean;
  onMinimizeChange?: (minimized: boolean) => void;
  currentPage?: string;
  currentContext?: any;
  onAction?: (action: string, data: any) => void;
}

export const SeverinoAssistantNew: React.FC<SeverinoAssistantProps> = ({
  isOpen,
  onToggle,
  isMinimized = false,
  onMinimizeChange,
  currentPage,
  currentContext,
  onAction
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Hook para gerenciar histórico de chat
  const {
    currentSession,
    getOrCreateSession,
    loadMessages,
    setCurrentSession
  } = useChatHistory();

  // Hook para autenticação
  const { user } = useAuth();


  // Hook para verificar status da API
  const { status: apiStatus, isOnline, isOffline, isConnecting, hasError } = useApiStatus({
    checkInterval: 5000 // Verificar a cada 5 segundos
  });
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    file: File;
    name: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // WebSocket connection for real-time chat (mantido para funcionalidade de chat)
  useEffect(() => {
    if (!isOnline) return; // Só conectar WebSocket se API estiver online
    
    const wsUrl = import.meta.env.VITE_API_URL 
      ? `${import.meta.env.VITE_API_URL.replace('https://', 'wss://').replace('http://', 'ws://')}/ws/severino`
      : 'wss://enso-backend-0aa1.onrender.com/ws/severino';
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('Severino WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        addMessage(data.message);
      }
    };
    
    ws.onclose = () => {
      console.log('Severino WebSocket disconnected');
    };
    
    return () => {
      ws.close();
    };
  }, [isOnline]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);



  // Initialize Severino with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0 && user) {
      initializeChatSession();
    }
  }, [isOpen, user]);

  // Função para inicializar sessão de chat
  const initializeChatSession = async () => {
    try {
      console.log('🔄 Inicializando sessão de chat...');
      console.log('👤 Usuário atual:', user?.id);
      
      // Obter ou criar sessão ativa
      const session = await getOrCreateSession();
      console.log('📋 Sessão obtida:', session?.id);
      
      if (session) {
        // Carregar mensagens da sessão
        const sessionMessages = await loadMessages(session.id);
        console.log('📨 Mensagens carregadas:', sessionMessages.length);
        
        if (sessionMessages.length > 0) {
          console.log('📨 Primeira mensagem:', sessionMessages[0]);
          // Converter mensagens do histórico para o formato do componente
          const convertedMessages: Message[] = sessionMessages.map(msg => ({
            id: msg.id,
            type: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
            timestamp: new Date(msg.createdAt),
            isRead: true,
            metadata: {
              media: msg.media ? JSON.parse(msg.media) : undefined,
              context: msg.context ? JSON.parse(msg.context) : undefined
            }
          }));
          
          console.log('✅ Definindo mensagens convertidas:', convertedMessages.length);
          setMessages(convertedMessages);
        } else {
          // Se não há mensagens, mostrar mensagem de boas-vindas baseada no status
          const welcomeMessage: Message = {
            id: 'welcome',
            type: 'assistant',
            content: isOnline 
              ? `Oi! 😊 Sou o Severino, seu assistente virtual!

Posso conversar com você de forma natural, tirar dúvidas e ajudar no uso do sistema ControlFlow.

Também consigo analisar o conteúdo de etiquetas e PDFs, desde que sejam texto legível.
⚠️ Não consigo interpretar fotos ou imagens.

O que você gostaria de saber hoje?`
              : `Oi! 😊 Infelizmente estou offline no momento. 

Quando eu estiver online novamente, posso conversar sobre qualquer assunto de forma natural e ajudar no uso do sistema ControlFlow!

Status atual: ${apiStatus}`,
            timestamp: new Date(),
            isRead: true,
            metadata: {
              suggestions: isOnline ? [
                'Como criar uma inspeção?',
                'Explicar conceitos de qualidade',
                'Conversar sobre tecnologia',
                'Falar sobre qualquer assunto'
              ] : [
                'Verificar status da conexão',
                'Tentar novamente em alguns segundos'
              ]
            }
          };
          setMessages([welcomeMessage]);
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar sessão de chat:', error);
      // Fallback para mensagem de boas-vindas
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'assistant',
        content: `Oi! 😊 Sou o Severino, seu assistente virtual!`,
        timestamp: new Date(),
        isRead: true
      };
      setMessages([welcomeMessage]);
    }
  };



  // Add message function
  const addMessage = (message: Omit<Message, 'timestamp' | 'isRead'>) => {
    const newMessage: Message = {
      ...message,
      timestamp: new Date(),
      isRead: false
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Mark message as read
  const markAsRead = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      )
    );
  };





  // Process user input and generate response using real API
  const processUserInput = async (input: string) => {
    // Verificar se a API está online antes de processar
    if (!isOnline) {
      const offlineMessage: Message = {
        id: Date.now().toString(),
        type: 'notification',
        content: `⚠️ Estou offline no momento. Não posso processar sua mensagem agora. Status: ${apiStatus}`,
        timestamp: new Date(),
        isRead: true,
        metadata: {
          notificationType: 'warning',
          priority: 'medium'
        }
      };
      setMessages(prev => [...prev, offlineMessage]);
      return;
    }

    setIsProcessing(true);
    
    // Preparar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
      isRead: true
    };
    
    // Se há uma imagem selecionada, adicionar à mensagem
    if (selectedImage) {
      userMessage.metadata = {
        media: [{
          type: 'image',
          url: selectedImage.url,
          alt: selectedImage.name,
          caption: selectedImage.name
        }]
      };
    }
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      // Preparar dados da requisição
      const requestData: any = {
        message: input,
        context: {
          currentPage,
          pageData: currentContext
        },
        sessionId: currentSession?.id // Incluir sessionId na requisição
      };

      // Adicionar mídia se houver (antes de limpar selectedImage)
      if (selectedImage) {
        requestData.media = [{
          type: 'image',
          url: selectedImage.url,
          alt: selectedImage.name,
          caption: selectedImage.name
        }];
        console.log('🖼️ Enviando imagem:', selectedImage.name);
        console.log('📋 Dados da requisição:', JSON.stringify(requestData, null, 2));
      }

       // Call real Severino API
       const response = await fetch('/api/severino/chat', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'x-user-id': user?.id || 'anonymous'
         },
         body: JSON.stringify(requestData)
       });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Resposta do servidor:', data);
        console.log('📋 Tipo da resposta:', typeof data);
        console.log('📋 Tem propriedade data?', 'data' in data);
        if ('data' in data) {
          console.log('📋 Tipo do data:', typeof data.data);
          console.log('📋 Tem propriedade message?', 'message' in data.data);
          console.log('📋 Tem propriedade media?', 'media' in data.data);
          if ('message' in data.data) {
            console.log('📋 Conteúdo da message:', data.data.message);
          }
          if ('media' in data.data) {
            console.log('📋 Conteúdo da media:', data.data.media);
            console.log('📋 Tipo da media:', typeof data.data.media);
            console.log('📋 É array?', Array.isArray(data.data.media));
            if (Array.isArray(data.data.media)) {
              console.log('📋 Tamanho do array media:', data.data.media.length);
              data.data.media.forEach((item, index) => {
                console.log(`📋 Media ${index}:`, item);
              });
            }
          }
        }
        
        if (data.success) {
          // Garantir que content seja sempre uma string
          let content = '';
          if (typeof data.data.message === 'string') {
            content = data.data.message;
          } else if (data.data.message && typeof data.data.message === 'object') {
            content = data.data.message.message || 'Resposta processada com sucesso';
          } else {
            content = 'Resposta processada com sucesso';
          }

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: content,
            timestamp: new Date(),
            isRead: false,
            metadata: {
              action: data.data.action,
              data: data.data.data,
              confidence: data.data.confidence,
              suggestions: data.data.suggestions || data.data.message?.suggestions || [],
              media: data.data.media || []
            }
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          
          // Limpar imagem selecionada após sucesso
          setSelectedImage(null);
          
          // Execute actions if any
          if (data.data.action && onAction) {
            onAction(data.data.action, data.data.data);
          }
        } else {
          throw new Error(data.error || 'Erro na API');
        }
      } else {
        throw new Error('Erro na comunicação com o servidor');
      }
      
    } catch (error) {
      console.error('Error processing input:', error);
      
      // Resposta simples de erro
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Oi! 😊 Infelizmente estou offline no momento. Quando eu estiver online novamente, posso conversar sobre qualquer assunto de forma natural!`,
        timestamp: new Date(),
        isRead: false,
        metadata: {
          suggestions: [
            'Tentar novamente',
            'Verificar conexão',
            'Usar funcionalidades básicas do sistema'
          ]
        }
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Severino Offline",
        description: "Tentando reconectar...",
        variant: "destructive"
      });
          } finally {
        setIsProcessing(false);
      }
  };

  // Handle voice recording with hold-to-record
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setIsRecording(false);
        setRecordingTime(0);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Process audio (simulate speech-to-text)
        setTimeout(() => {
          const simulatedText = "Criar inspeção para produto AFB002";
          setInputValue(simulatedText);
          toast({
            title: "Áudio Processado",
            description: `Transcrição: "${simulatedText}"`,
          });
        }, 1000);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Gravando...",
        description: "Segure para gravar, solte para enviar",
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Erro de Microfone",
        description: "Não foi possível acessar o microfone",
        variant: "destructive"
      });
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      // Stop all tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      toast({
        title: "Gravação Cancelada",
        description: "Áudio descartado",
      });
    }
  }, [isRecording]);



  // Format recording time
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar se é uma imagem
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        
        // Armazenar a imagem temporariamente (não enviar ainda)
        setSelectedImage({
          url: imageUrl,
          file: file,
          name: file.name
        });
        
        toast({
          title: "Imagem Selecionada",
          description: `Imagem "${file.name}" pronta para envio. Digite sua mensagem e clique em enviar.`,
        });
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Tipo de Arquivo Não Suportado",
        description: "Por favor, envie apenas imagens",
        variant: "destructive"
      });
    }
    
    // Limpar o input
    event.target.value = '';
  };

           return (
        <AnimatePresence>
          {isOpen && !isMinimized && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                width: 384,
                height: 600
              }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed bottom-4 right-4 z-50 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden"
            >
              {/* Header */}
              <motion.div 
                className="flex items-center justify-between p-4 text-white border-b border-stone-600 relative overflow-hidden"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                  background: 'linear-gradient(90deg, #1c1917 0%, #44403c 25%, #78716c 50%, #44403c 75%, #1c1917 100%)',
                  backgroundSize: '200% 100%'
                }}
              >

              <div className="relative z-10 flex items-center justify-between w-full">
                           <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              >
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                                     <Avatar className="w-10 h-10 bg-slate-600 border-2 border-slate-500">
                     <AvatarImage src="/severino-avatar.svg" />
                     <AvatarFallback>
                       <Brain className="w-6 h-6" />
                     </AvatarFallback>
                   </Avatar>
                   {/* Indicador de status removido */}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                >
                  <motion.h3 
                    className="font-bold text-lg text-slate-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    Severino
                  </motion.h3>
                                     {/* Status de conexão removido */}
                </motion.div>
              </motion.div>
             
                           <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              >
                {/* Minimize/Maximize */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMinimizeChange?.(!isMinimized)}
                    className="text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <span className="text-lg font-bold">−</span>}
                  </Button>
                </motion.div>
                
                {/* Close */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className="text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                                </motion.div>
              </motion.div>
            </div>
          </motion.div>

                     {(
            <>
              

              

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" style={{ height: '350px' }}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex",
                        message.type === 'user' ? "justify-end" : "justify-start"
                      )}
                      onClick={() => !message.isRead && markAsRead(message.id)}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl p-4 relative",
                          message.type === 'user'
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                            : message.type === 'notification'
                            ? "bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 border-l-4 border-orange-500"
                            : "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-900 dark:text-gray-100"
                        )}
                      >
                        {/* Unread indicator */}
                        {!message.isRead && message.type !== 'user' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                        )}
                        
                                                 <div className="whitespace-pre-wrap text-sm">
                           {typeof message.content === 'string' ? message.content : String(message.content || '')}
                         </div>
                         
                         {/* Media Content */}
                         {message.metadata?.media && message.metadata.media.length > 0 && (
                           <div className="mt-3 space-y-2">
                             {message.metadata.media.map((media, mediaIndex) => (
                               <div key={mediaIndex} className="relative">
                                 {media.type === 'image' && media.url && (
                                   <motion.div
                                     initial={{ opacity: 0, scale: 0.9 }}
                                     animate={{ opacity: 1, scale: 1 }}
                                     transition={{ duration: 0.3 }}
                                     className="relative group"
                                   >
                                     <img
                                       src={media.url}
                                       alt={media.alt || 'Imagem do Severino'}
                                       className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:shadow-lg transition-shadow"
                                       style={{
                                         maxHeight: media.height ? `${media.height}px` : '300px',
                                         width: media.width ? `${media.width}px` : 'auto'
                                       }}
                                       onClick={() => {
                                         // Abrir imagem em modal ou nova aba
                                         window.open(media.url, '_blank');
                                       }}
                                     />
                                     {media.caption && (
                                       <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                                         {media.caption}
                                       </div>
                                     )}
                                     <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                                       <motion.div
                                         initial={{ opacity: 0 }}
                                         whileHover={{ opacity: 1 }}
                                         className="bg-white bg-opacity-90 rounded-full p-2 shadow-lg"
                                       >
                                         <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                         </svg>
                                       </motion.div>
                                     </div>
                                   </motion.div>
                                 )}
                                 
                                 {media.type === 'chart' && (
                                   <motion.div
                                     initial={{ opacity: 0, y: 10 }}
                                     animate={{ opacity: 1, y: 0 }}
                                     transition={{ duration: 0.4 }}
                                     className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4"
                                   >
                                     <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                                       📊 Gráfico Gerado
                                     </div>
                                     <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                                       <div className="text-center">
                                         <div className="text-2xl mb-2">📈</div>
                                         <div className="text-xs text-gray-500">Gráfico interativo</div>
                                       </div>
                                     </div>
                                   </motion.div>
                                 )}
                                 
                                 {media.type === 'diagram' && (
                                   <motion.div
                                     initial={{ opacity: 0, y: 10 }}
                                     animate={{ opacity: 1, y: 0 }}
                                     transition={{ duration: 0.4 }}
                                     className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4"
                                   >
                                     <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                                       🎯 Diagrama Gerado
                                     </div>
                                     {media.url ? (
                                       <div className="relative group">
                                         <MermaidDiagram 
                                           chart={media.url}
                                           className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600"
                                           onError={(error) => {
                                             console.error('Erro no diagrama Mermaid:', error);
                                           }}
                                         />
                                         {media.caption && (
                                           <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                                             {media.caption}
                                           </div>
                                         )}
                                       </div>
                                     ) : (
                                       <div className="h-48 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg flex items-center justify-center">
                                         <div className="text-center">
                                           <div className="text-2xl mb-2">🔗</div>
                                           <div className="text-xs text-gray-500">Diagrama de fluxo</div>
                                         </div>
                                       </div>
                                     )}
                                   </motion.div>
                                 )}
                                 
                                 {media.type === 'file' && (
                                   <motion.div
                                     initial={{ opacity: 0, y: 10 }}
                                     animate={{ opacity: 1, y: 0 }}
                                     transition={{ duration: 0.4 }}
                                     className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-3"
                                   >
                                     <div className="flex items-center space-x-3">
                                       <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                         <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                         </svg>
                                       </div>
                                       <div className="flex-1">
                                         <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                           {media.caption || 'Arquivo'}
                                         </div>
                                         <div className="text-xs text-gray-500 dark:text-gray-400">
                                           Clique para baixar
                                         </div>
                                       </div>
                                       <Button
                                         variant="outline"
                                         size="sm"
                                         onClick={() => media.url && window.open(media.url, '_blank')}
                                         className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                       >
                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                         </svg>
                                       </Button>
                                     </div>
                                   </motion.div>
                                 )}
                               </div>
                             ))}
                           </div>
                         )}
                        
                        {/* Message timestamp */}
                        <div className={cn(
                          "text-xs mt-2",
                          message.type === 'user' ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                        )}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                        
                        {/* Suggestions */}
                        {message.metadata?.suggestions && (
                          <div className="mt-3 space-y-2">
                            {message.metadata.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => processUserInput(suggestion)}
                                className="w-full text-left justify-start text-xs bg-white/10 hover:bg-white/20"
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
                      <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Severino está processando...
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              

                             {/* Input */}
               <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                 {/* Selected image indicator */}
                 {selectedImage && (
                   <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-3">
                         <img
                           src={selectedImage.url}
                           alt={selectedImage.name}
                           className="w-12 h-12 object-cover rounded-lg border border-blue-200 dark:border-blue-700"
                         />
                         <div>
                           <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                             {selectedImage.name}
                           </div>
                           <div className="text-xs text-blue-600 dark:text-blue-400">
                             Imagem pronta para envio
                           </div>
                         </div>
                       </div>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => setSelectedImage(null)}
                         className="text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                       >
                         <X className="w-4 h-4" />
                       </Button>
                     </div>
                   </div>
                 )}
                 
                 {/* Recording indicator */}
                 {isRecording && (
                  <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-red-700 dark:text-red-300">
                          Gravando... {formatRecordingTime(recordingTime)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelRecording}
                        className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
                
                                 <div className="flex space-x-2">
                   <Input
                     ref={inputRef}
                     value={inputValue}
                     onChange={(e) => setInputValue(e.target.value)}
                     onKeyPress={(e) => {
                       if (e.key === 'Enter' && inputValue.trim()) {
                         processUserInput(inputValue.trim());
                       }
                     }}
                     placeholder={selectedImage 
                       ? `Digite sua mensagem sobre a imagem "${selectedImage.name}"...` 
                       : "Digite sua pergunta ou comando..."
                     }
                     className="flex-1"
                     disabled={isProcessing || isRecording}
                   />
                   
                   {/* Hidden file input */}
                   <input
                     ref={fileInputRef}
                     type="file"
                     accept="image/*"
                     onChange={handleFileUpload}
                     className="hidden"
                     aria-label="Upload de imagem"
                   />
                   
                   {/* Image upload button */}
                   <TooltipProvider>
                     <Tooltip>
                       <TooltipTrigger asChild>
                         <Button
                           variant="outline"
                           size="icon"
                           onClick={() => fileInputRef.current?.click()}
                           className="hover:bg-blue-50 hover:border-blue-300"
                           disabled={isProcessing || isRecording}
                         >
                           <Image className="w-4 h-4" />
                         </Button>
                       </TooltipTrigger>
                       <TooltipContent>
                         Enviar imagem
                       </TooltipContent>
                     </Tooltip>
                   </TooltipProvider>
                  
                  {/* Voice recording button with hold-to-record */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onMouseDown={startRecording}
                          onMouseUp={stopRecording}
                          onMouseLeave={stopRecording}
                          onTouchStart={startRecording}
                          onTouchEnd={stopRecording}
                          className={cn(
                            "transition-all duration-200",
                            isRecording 
                              ? "bg-red-100 border-red-300 text-red-600 scale-110" 
                              : "hover:bg-stone-50 hover:border-stone-300"
                          )}
                          disabled={isProcessing}
                        >
                          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isRecording ? "Solte para enviar" : "Segure para gravar"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <Button
                    onClick={() => inputValue.trim() && processUserInput(inputValue.trim())}
                    disabled={!inputValue.trim() || isProcessing || isRecording}
                    className="bg-gradient-to-r from-stone-600 to-stone-800 hover:from-stone-700 hover:to-stone-900 dark:from-stone-500 dark:to-stone-700 dark:hover:from-stone-600 dark:hover:to-stone-800"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SeverinoAssistantNew;

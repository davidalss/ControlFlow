import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Bot, 
  MessageSquare, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  HelpCircle,
  TrendingUp,
  Bell,
  Brain,
  Wifi,
  WifiOff,
  Minimize2,
  Maximize2,
  Lightbulb,
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Settings,
  Eye,
  Edit,
  Trash,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Target,
  Shield,
  BookOpen,
  GraduationCap,
  Award,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  RotateCcw,
  Sparkles,
  BarChart3,
  Database,
  Cpu,
  Network,
  Check,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Copy,
  Share,
  Bookmark,
  History,
  Star as StarIcon,
  MessageCircle,
  Phone,
  Video,
  Image,
  File,
  Link,
  Smile,
  Frown,
  Meh,
  Coffee,
  Rocket,
  Target as TargetIcon,
  Award as AwardIcon,
  Trophy,
  Medal,
  Crown,
  Gem,
  Diamond,
  Zap as ZapIcon,
  Flash,
  Thunder,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  Activity,
  Pulse,
  Heart as HeartIcon,
  Battery,
  BatteryCharging,
  Power,
  PowerOff,
  Lock,
  Unlock,
  Key,
  Shield as ShieldIcon,
  Eye as EyeIcon,
  EyeOff,
  UserCheck,
  Users,
  UserPlus,
  UserMinus,
  UserX,
  UserCog,
  UserEdit,
  UserSearch,
  UserVoice,
  UserMusic,
  UserVideo,
  UserPhoto,
  UserStar,
  UserHeart,
  UserSmile,
  UserFrown,
  UserMeh,
  UserCheck as UserCheckIcon,
  UserX as UserXIcon,
  UserPlus as UserPlusIcon,
  UserMinus as UserMinusIcon,
  UserCog as UserCogIcon,
  UserEdit as UserEditIcon,
  UserSearch as UserSearchIcon,
  UserVoice as UserVoiceIcon,
  UserMusic as UserMusicIcon,
  UserVideo as UserVideoIcon,
  UserPhoto as UserPhotoIcon,
  UserStar as UserStarIcon,
  UserHeart as UserHeartIcon,
  UserSmile as UserSmileIcon,
  UserFrown as UserFrownIcon,
  UserMeh as UserMehIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  action?: {
    label: string;
    url: string;
  };
}

interface SeverinoAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPage?: string;
  currentContext?: any;
  onAction?: (action: string, data: any) => void;
}

export const SeverinoAssistantNew: React.FC<SeverinoAssistantProps> = ({
  isOpen,
  onToggle,
  currentPage,
  currentContext,
  onAction
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [assistantMode, setAssistantMode] = useState<'chat' | 'assist' | 'analyze'>('chat');
  const [contextualHelp, setContextualHelp] = useState<string[]>([]);
  const [quickActions, setQuickActions] = useState<string[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // WebSocket connection for real-time notifications
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5001/ws/severino');
    
    ws.onopen = () => {
      setIsConnected(true);
      console.log('Severino WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'notification') {
        addNotification(data.notification);
      } else if (data.type === 'message') {
        addMessage(data.message);
      }
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      console.log('Severino WebSocket disconnected');
    };
    
    return () => {
      ws.close();
    };
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update unread count
  useEffect(() => {
    const unread = messages.filter(m => !m.isRead && m.type === 'notification').length;
    setUnreadCount(unread);
  }, [messages]);

  // Initialize Severino with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'assistant',
        content: `🎯 **Olá! Sou o Severino, seu guru virtual de qualidade!**

Estou aqui para revolucionar sua experiência de controle de qualidade com IA avançada. Posso:

🚀 **Automação Inteligente**
• Criar inspeções automaticamente
• Analisar dados em tempo real
• Detectar anomalias e tendências
• Executar ações complexas

💡 **Assistência Contextual**
• Ajudar em formulários
• Explicar procedimentos
• Sugerir melhorias
• Fornecer treinamento

📊 **Análise Avançada**
• Dashboards interativos
• Relatórios automáticos
• Insights preditivos
• Recomendações personalizadas

Como posso ajudá-lo hoje?`,
        timestamp: new Date(),
        isRead: true,
        metadata: {
          suggestions: [
            'Criar plano de inspeção para linha A',
            'Analisar dados de qualidade do mês',
            'Verificar treinamentos pendentes',
            'Gerar relatório de não conformidades'
          ]
        }
      };
      setMessages([welcomeMessage]);
      analyzeCurrentContext();
      
      // Add sample notifications
      addNotification({
        id: '1',
        title: 'Inspeção Pendente',
        message: 'Lote AFB002 aguarda inspeção há 2 horas',
        type: 'warning',
        priority: 'medium',
        action: {
          label: 'Ver Detalhes',
          url: '/inspections'
        }
      });
      
      addNotification({
        id: '2',
        title: 'Treinamento Vencendo',
        message: 'Certificado de João Silva vence em 3 dias',
        type: 'warning',
        priority: 'high'
      });
    }
  }, [isOpen]);

  // Add notification function
  const addNotification = (notification: Omit<Notification, 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      timestamp: new Date(),
      isRead: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Add as message
    const notificationMessage: Message = {
      id: `notification-${notification.id}`,
      type: 'notification',
      content: `🔔 **${notification.title}**\n\n${notification.message}`,
      timestamp: new Date(),
      isRead: false,
      metadata: {
        notificationType: notification.type,
        priority: notification.priority
      }
    };
    
    setMessages(prev => [notificationMessage, ...prev]);
    
    // Show toast
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.type === 'error' ? 'destructive' : 'default'
    });
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

  // Mark all as read
  const markAllAsRead = () => {
    setMessages(prev => 
      prev.map(msg => ({ ...msg, isRead: true }))
    );
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  // Analyze current page context and provide contextual help
  const analyzeCurrentContext = () => {
    if (!currentPage) return;

    const contextMap: Record<string, { help: string[], actions: string[] }> = {
      'inspection-plans': {
        help: [
          'Criação de planos de inspeção',
          'Configuração de critérios AQL',
          'Definição de etapas de inspeção',
          'Aprovação de planos'
        ],
        actions: [
          'Criar novo plano',
          'Duplicar plano existente',
          'Validar critérios AQL',
          'Gerar relatório de plano'
        ]
      },
      'inspections': {
        help: [
          'Execução de inspeções',
          'Captura de fotos',
          'Registro de não conformidades',
          'Aprovação/rejeição de lotes'
        ],
        actions: [
          'Iniciar nova inspeção',
          'Continuar inspeção pendente',
          'Analisar resultados',
          'Gerar relatório'
        ]
      },
      'products': {
        help: [
          'Cadastro de produtos',
          'Configuração de parâmetros',
          'Gestão de categorias',
          'Upload de documentação'
        ],
        actions: [
          'Cadastrar novo produto',
          'Importar produtos em massa',
          'Validar dados',
          'Exportar catálogo'
        ]
      },
      'training': {
        help: [
          'Matrícula em cursos',
          'Acompanhamento de progresso',
          'Emissão de certificados',
          'Relatórios de treinamento'
        ],
        actions: [
          'Matricular em curso',
          'Verificar progresso',
          'Emitir certificado',
          'Gerar relatório'
        ]
      }
    };

    const context = contextMap[currentPage];
    if (context) {
      setContextualHelp(context.help);
      setQuickActions(context.actions);
    }
  };

  // Process user input and generate response using real API
  const processUserInput = async (input: string) => {
    setIsProcessing(true);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
      isRead: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      // Call real Severino API
      const response = await fetch('/api/severino/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user_' + Date.now()
        },
        body: JSON.stringify({
          message: input,
          context: {
            currentPage,
            pageData: currentContext,
            mode: assistantMode
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: data.data.message,
            timestamp: new Date(),
            isRead: false,
            metadata: {
              action: data.data.action,
              data: data.data.data,
              confidence: data.data.confidence,
              suggestions: data.data.suggestions
            }
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          
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
      
      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente ou use uma das opções abaixo.`,
        timestamp: new Date(),
        isRead: false,
        metadata: {
          suggestions: [
            'Como criar um plano de inspeção?',
            'Explicar critérios AQL',
            'Analisar dados de qualidade',
            'Sugerir melhorias no processo'
          ]
        }
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      
      toast({
        title: "Erro de Conexão",
        description: "Severino está temporariamente indisponível. Usando modo offline.",
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

  // Handle mode-specific actions
  const handleModeAction = async (mode: 'chat' | 'assist' | 'analyze') => {
    setAssistantMode(mode);
    
    let action = '';
    switch (mode) {
      case 'chat':
        action = 'Iniciar conversa contextual';
        break;
      case 'assist':
        action = 'Ativar modo assistência';
        break;
      case 'analyze':
        action = 'Iniciar análise de dados';
        break;
    }
    
    await processUserInput(action);
  };

  // Quick action handler
  const handleQuickAction = (action: string) => {
    processUserInput(`Execute: ${action}`);
  };

  // Contextual help handler
  const handleContextualHelp = (help: string) => {
    processUserInput(`Ajuda: ${help}`);
  };

  // Format recording time
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className={cn(
            "fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden",
            isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-10 h-10 bg-white/20 border-2 border-white/30">
                  <AvatarImage src="/severino-avatar.png" />
                  <AvatarFallback>
                    <Brain className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white",
                  isConnected ? "bg-green-400" : "bg-red-400"
                )} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Severino</h3>
                <p className="text-sm text-blue-100 flex items-center">
                  {isConnected ? (
                    <>
                      <Wifi className="w-3 h-3 mr-1" />
                      Conectado
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 mr-1" />
                      Offline
                    </>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-white hover:bg-white/20 relative"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-red-500">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </div>
              
              {/* Minimize/Maximize */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              
              {/* Close */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Notifications Panel */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-50 dark:bg-gray-800 border-b"
                  >
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold">Notificações</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-xs"
                        >
                          Marcar todas como lidas
                        </Button>
                      </div>
                      <ScrollArea className="h-32">
                        <div className="space-y-2">
                          {notifications.slice(0, 5).map((notification) => (
                            <div
                              key={notification.id}
                              className={cn(
                                "p-2 rounded-lg text-sm cursor-pointer transition-colors",
                                notification.isRead 
                                  ? "bg-gray-100 dark:bg-gray-700" 
                                  : "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                              )}
                              onClick={() => {
                                setNotifications(prev => 
                                  prev.map(n => 
                                    n.id === notification.id ? { ...n, isRead: true } : n
                                  )
                                );
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-xs">{notification.title}</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {notification.message}
                                  </p>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs",
                                    notification.priority === 'high' ? "border-red-500 text-red-600" :
                                    notification.priority === 'medium' ? "border-yellow-500 text-yellow-600" :
                                    "border-green-500 text-green-600"
                                  )}
                                >
                                  {notification.priority}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mode Selector */}
              <div className="flex p-2 bg-gray-50 dark:bg-gray-800 border-b">
                <Button
                  variant={assistantMode === 'chat' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleModeAction('chat')}
                  className="flex-1"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Chat
                </Button>
                <Button
                  variant={assistantMode === 'assist' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleModeAction('assist')}
                  className="flex-1"
                >
                  <HelpCircle className="w-4 h-4 mr-1" />
                  Assistir
                </Button>
                <Button
                  variant={assistantMode === 'analyze' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleModeAction('analyze')}
                  className="flex-1"
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Analisar
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" style={{ height: '400px' }}>
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
                          {message.content}
                        </div>
                        
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

              {/* Contextual Help */}
              {assistantMode === 'assist' && contextualHelp.length > 0 && (
                <div className="p-4 border-t bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <h4 className="text-sm font-semibold mb-2 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-1 text-yellow-600" />
                    Ajuda Contextual
                  </h4>
                  <div className="space-y-1">
                    {contextualHelp.map((help, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleContextualHelp(help)}
                        className="w-full text-left justify-start text-xs h-auto p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      >
                        {help}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {assistantMode === 'analyze' && quickActions.length > 0 && (
                <div className="p-4 border-t bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <h4 className="text-sm font-semibold mb-2 flex items-center">
                    <Zap className="w-4 h-4 mr-1 text-green-600" />
                    Ações Rápidas
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction(action)}
                        className="text-xs h-auto p-2 hover:bg-green-100 dark:hover:bg-green-900/30"
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
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
                    placeholder="Digite sua pergunta ou comando..."
                    className="flex-1"
                    disabled={isProcessing || isRecording}
                  />
                  
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
                              : "hover:bg-blue-50 hover:border-blue-300"
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
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Camera, 
  FileText, 
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Settings,
  Zap,
  Eye,
  Edit,
  Trash,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Brain,
  Target,
  TrendingUp,
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
  Wifi,
  WifiOff,
  Check,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
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
import { useNotifications } from '@/hooks/use-notifications';
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

interface SeverinoAssistantModernProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPage?: string;
  currentContext?: any;
  onAction?: (action: string, data: any) => void;
}

export const SeverinoAssistantModern: React.FC<SeverinoAssistantModernProps> = ({
  isOpen,
  onToggle,
  currentPage,
  currentContext,
  onAction
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [assistantMode, setAssistantMode] = useState<'chat' | 'assist' | 'analyze'>('chat');
  const [contextualHelp, setContextualHelp] = useState<string[]>([]);
  const [quickActions, setQuickActions] = useState<string[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // Start recording audio
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "🎤 Gravação iniciada",
        description: "Solte o botão para enviar ou arraste para cancelar",
      });

    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível acessar o microfone",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Stop recording audio
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      // If not dragging, send the audio
      if (!isDragging) {
        sendAudioMessage();
      } else {
        setAudioBlob(null);
        setRecordingTime(0);
      }
    }
  }, [isRecording, isDragging]);

  // Send audio message
  const sendAudioMessage = useCallback(async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    
    try {
      // Convert audio to text using Web Speech API
      const recognition = new (window.SpeechRecognition || (window as any).webkitSpeechRecognition)();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        processUserInput(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Erro no reconhecimento de voz:', event.error);
        toast({
          title: "❌ Erro",
          description: "Não foi possível converter o áudio em texto",
          variant: "destructive",
        });
        setIsProcessing(false);
      };

      recognition.start();

    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao processar mensagem de áudio",
        variant: "destructive",
      });
      setIsProcessing(false);
    }

    setAudioBlob(null);
    setRecordingTime(0);
  }, [audioBlob, toast]);

  // Handle mouse/touch events for drag to cancel
  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setDragDirection(null);
    startRecording();
  }, [startRecording]);

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isRecording) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const buttonRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const centerX = buttonRect.left + buttonRect.width / 2;
      
      const deltaX = clientX - centerX;
      
      if (Math.abs(deltaX) > 50) {
        setIsDragging(true);
        setDragDirection(deltaX > 0 ? 'right' : 'left');
      } else {
        setIsDragging(false);
        setDragDirection(null);
      }
    }
  }, [isRecording]);

  const handleMouseUp = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  // Process user input and generate response
  const processUserInput = async (input: string) => {
    if (!input.trim()) return;

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
      // Call Severino API
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
           
           // Adicionar notificação se necessário
           if (data.data.notification) {
             addNotification({
               title: 'Severino',
               message: data.data.notification,
               type: 'info'
             });
           }
        } else {
          throw new Error(data.error || 'Erro na API');
        }
      } else {
        throw new Error('Erro na comunicação com o servidor');
      }
      
    } catch (error) {
      console.error('Error processing input:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date(),
        isRead: false,
        metadata: {
          notificationType: 'error'
        }
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processUserInput(inputValue);
  };

  // Quick action buttons
  const quickActionButtons = [
    { icon: Target, label: 'Criar Inspeção', action: 'create_inspection' },
    { icon: BarChart3, label: 'Analisar Dados', action: 'analyze_data' },
    { icon: BookOpen, label: 'Ver Treinamentos', action: 'check_training' },
    { icon: HelpCircle, label: 'Ajuda', action: 'help' }
  ];

  const handleQuickAction = (action: string) => {
    const actionMessages = {
      create_inspection: 'Vou ajudá-lo a criar uma nova inspeção. Qual produto você gostaria de inspecionar?',
      analyze_data: 'Vou analisar os dados do sistema. Que tipo de análise você precisa?',
      check_training: 'Vou verificar seus treinamentos. Qual área você gostaria de verificar?',
      help: 'Como posso ajudá-lo hoje? Você pode me perguntar sobre inspeções, qualidade, treinamentos ou qualquer outro assunto relacionado ao sistema.'
    };

    const message: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: actionMessages[action as keyof typeof actionMessages] || 'Como posso ajudá-lo?',
      timestamp: new Date(),
      isRead: false
    };

    setMessages(prev => [...prev, message]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-24 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Severino</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Assistente de Qualidade</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  IA
                </Badge>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                
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

            {/* Mode Selector */}
            {!isMinimized && (
              <div className="flex items-center space-x-1 mt-3">
                {(['chat', 'assist', 'analyze'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={assistantMode === mode ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setAssistantMode(mode)}
                    className={cn(
                      "text-xs h-7",
                      assistantMode === mode 
                        ? "bg-white text-blue-600" 
                        : "text-white hover:bg-white/20"
                    )}
                  >
                    {mode === 'chat' && <MessageSquare className="w-3 h-3 mr-1" />}
                    {mode === 'assist' && <Target className="w-3 h-3 mr-1" />}
                    {mode === 'analyze' && <BarChart3 className="w-3 h-3 mr-1" />}
                    {mode === 'chat' && 'Chat'}
                    {mode === 'assist' && 'Assistir'}
                    {mode === 'analyze' && 'Analisar'}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {!isMinimized && (
            <>
              {/* Quick Actions */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-2">
                  {quickActionButtons.map((button) => (
                    <Button
                      key={button.action}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(button.action)}
                      className="h-8 text-xs justify-start"
                    >
                      <button.icon className="w-3 h-3 mr-2" />
                      {button.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4 h-80">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-500 text-sm">
                        Olá! Sou o Severino, seu assistente de qualidade. Como posso ajudá-lo hoje?
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex",
                          message.type === 'user' ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-2",
                            message.type === 'user'
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                  {isProcessing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      className="pr-12"
                      disabled={isProcessing}
                    />
                    
                    {/* Audio Recording Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0",
                              isRecording && "text-red-500 animate-pulse"
                            )}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleMouseDown}
                            onTouchMove={handleMouseMove}
                            onTouchEnd={handleMouseUp}
                            disabled={isProcessing}
                          >
                            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isRecording 
                            ? `Gravando... ${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`
                            : "Pressione e segure para gravar áudio"
                          }
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!inputValue.trim() || isProcessing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>

                {/* Recording Status */}
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-700 dark:text-red-300">
                          Gravando... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      {isDragging && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <Trash className="w-4 h-4" />
                          <span className="text-xs">Arraste para cancelar</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SeverinoAssistantModern;

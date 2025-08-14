import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Maximize,
  Minimize,
  Download,
  BookOpen,
  FileText,
  Video,
  Image,
  Link,
  CheckCircle,
  Clock,
  Users,
  Star,
  MessageSquare,
  Bookmark,
  Share2,
  Settings,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  FileCheck,
  AlertCircle
} from 'lucide-react';

interface TrainingContent {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'pdf' | 'slides' | 'image' | 'scorm' | 'link';
  url: string;
  thumbnail?: string;
  duration?: number; // em segundos
  required: boolean;
  order: number;
  completed: boolean;
  progress: number; // 0-100
  notes?: string;
  bookmarked: boolean;
}

interface Training {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: string;
  duration: number; // em minutos
  progress: number; // 0-100
  totalContent: number;
  completedContent: number;
  certificate: boolean;
  deadline?: string;
  content: TrainingContent[];
}

export default function TrainingPlayerPage() {
  const [currentTraining, setCurrentTraining] = useState<Training | null>(null);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mock data
  const mockTraining: Training = {
    id: '1',
    title: 'Normas ISO 9001:2015 - Implementação Completa',
    description: 'Treinamento abrangente sobre implementação e manutenção do sistema de gestão da qualidade conforme ISO 9001:2015',
    thumbnail: '/images/training/iso-9001.jpg',
    category: 'Normas e Certificações',
    duration: 480, // 8 horas
    progress: 65,
    totalContent: 5,
    completedContent: 3,
    certificate: true,
    deadline: '2024-02-15',
    content: [
      {
        id: '1',
        title: 'Introdução à ISO 9001:2015',
        description: 'Visão geral da norma e seus princípios fundamentais',
        type: 'video',
        url: '/materials/iso-9001-intro.mp4',
        thumbnail: '/images/materials/iso-intro.jpg',
        duration: 2700, // 45 minutos
        required: true,
        order: 1,
        completed: true,
        progress: 100,
        notes: 'Excelente introdução aos conceitos básicos',
        bookmarked: true
      },
      {
        id: '2',
        title: 'Manual ISO 9001:2015',
        description: 'Documento oficial da norma com todas as seções',
        type: 'pdf',
        url: '/materials/iso-9001-manual.pdf',
        required: true,
        order: 2,
        completed: true,
        progress: 100,
        notes: 'Material de referência essencial',
        bookmarked: false
      },
      {
        id: '3',
        title: 'Implementação Prática',
        description: 'Passo a passo para implementar o sistema',
        type: 'video',
        url: '/materials/iso-9001-implementation.mp4',
        thumbnail: '/images/materials/iso-implementation.jpg',
        duration: 3600, // 60 minutos
        required: true,
        order: 3,
        completed: false,
        progress: 65,
        bookmarked: true
      },
      {
        id: '4',
        title: 'Slides - Auditoria Interna',
        description: 'Apresentação sobre procedimentos de auditoria',
        type: 'slides',
        url: '/materials/audit-slides.pptx',
        required: false,
        order: 4,
        completed: false,
        progress: 0,
        bookmarked: false
      },
      {
        id: '5',
        title: 'Teste Final',
        description: 'Avaliação de conhecimento sobre ISO 9001:2015',
        type: 'scorm',
        url: '/materials/iso-9001-test.scorm',
        required: true,
        order: 5,
        completed: false,
        progress: 0,
        bookmarked: false
      }
    ]
  };

  // Inicializar com o treinamento mock
  React.useEffect(() => {
    setCurrentTraining(mockTraining);
  }, []);

  const currentContent = currentTraining?.content[currentContentIndex];

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getContentIcon = (type: TrainingContent['type']) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'pdf': return <FileText className="w-5 h-5" />;
      case 'slides': return <FileText className="w-5 h-5" />;
      case 'image': return <Image className="w-5 h-5" />;
      case 'scorm': return <FileCheck className="w-5 h-5" />;
      case 'link': return <Link className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getContentBadge = (type: TrainingContent['type']) => {
    switch (type) {
      case 'video': return <Badge className="bg-red-100 text-red-800">Vídeo</Badge>;
      case 'pdf': return <Badge className="bg-blue-100 text-blue-800">PDF</Badge>;
      case 'slides': return <Badge className="bg-green-100 text-green-800">Slides</Badge>;
      case 'image': return <Badge className="bg-purple-100 text-purple-800">Imagem</Badge>;
      case 'scorm': return <Badge className="bg-orange-100 text-orange-800">Teste</Badge>;
      case 'link': return <Badge className="bg-gray-100 text-gray-800">Link</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  if (!currentTraining) {
    return (
      <div className="p-6">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Carregando treinamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {currentTraining.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentTraining.category} • {Math.floor(currentTraining.duration / 60)}h {currentTraining.duration % 60}min
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Progress value={currentTraining.progress} className="w-32" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentTraining.progress}%
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Player Principal */}
        <div className="flex-1 flex flex-col">
          {/* Área do Player */}
          <div className="flex-1 bg-black relative">
            {currentContent?.type === 'video' ? (
              <div className="relative h-full">
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  src={currentContent.url}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                {/* Controles do Vídeo */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="space-y-2">
                    {/* Barra de Progresso */}
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    />
                    
                    {/* Controles */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handlePlayPause}
                          className="text-white hover:bg-white/20"
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </Button>
                        
                        <div className="flex items-center space-x-2 text-white text-sm">
                          <span>{formatTime(currentTime)}</span>
                          <span>/</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleMute}
                            className="text-white hover:bg-white/20"
                          >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </Button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleFullscreen}
                          className="text-white hover:bg-white/20"
                        >
                          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">
                    {getContentIcon(currentContent?.type || 'pdf')}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{currentContent?.title}</h2>
                  <p className="text-gray-300 mb-4">{currentContent?.description}</p>
                  <Button size="lg">
                    <Eye className="w-5 h-5 mr-2" />
                    Visualizar Conteúdo
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Informações do Conteúdo */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getContentIcon(currentContent?.type || 'pdf')}
                  {getContentBadge(currentContent?.type || 'pdf')}
                  {currentContent?.required && (
                    <Badge className="bg-red-100 text-red-800">Obrigatório</Badge>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {currentContent?.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentContent?.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Progress value={currentContent?.progress || 0} className="w-24" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {currentContent?.progress || 0}%
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Lista de Conteúdo */}
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Conteúdo do Treinamento
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{currentTraining.completedContent} de {currentTraining.totalContent} concluídos</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-2">
              {currentTraining.content.map((content, index) => (
                <div
                  key={content.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    index === currentContentIndex
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setCurrentContentIndex(index)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {content.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          <span className="text-xs text-gray-500">{index + 1}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {getContentIcon(content.type)}
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {content.title}
                        </h4>
                        {content.bookmarked && (
                          <Bookmark className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {content.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getContentBadge(content.type)}
                          {content.required && (
                            <Badge className="bg-red-100 text-red-800 text-xs">Obrigatório</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          {content.duration && (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>{Math.floor(content.duration / 60)}min</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {content.progress > 0 && (
                        <div className="mt-2">
                          <Progress value={content.progress} className="h-1" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Notas */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Minhas Notas</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotes(!showNotes)}
              >
                {showNotes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            
            {showNotes && (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione suas notas aqui..."
                className="w-full h-20 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Calendar,
  Search,
  Filter,
  Grid,
  List,
  TrendingUp,
  Award,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
  Share2,
  Lock,
  Unlock,
  Video,
  FileText,
  Presentation,
  BarChart3,
  Target,
  UserCheck,
  Bell,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLogger } from '@/lib/logger';
import { useNotifications } from '@/lib/notifications';
import { useAnalytics } from '@/lib/analytics';
import { useComments } from '@/lib/comments';

// Mock data para treinamentos
const mockTrainings = [
  {
    id: 1,
    title: 'Gestão da Qualidade ISO 9001:2015',
    description: 'Aprenda os fundamentos da gestão da qualidade e implementação da ISO 9001:2015. Este curso abrange todos os requisitos da norma, documentação, auditoria interna e melhoria contínua.',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
    category: 'Gestão da Qualidade',
    duration: '4h 30min',
    participants: 156,
    rating: 4.8,
    progress: 0,
    status: 'not_started',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    isUrgent: false,
    instructor: 'Dr. Maria Silva',
    level: 'Intermediário',
    prerequisites: ['Conhecimento básico em gestão'],
    targetAudience: 'Gestores, Coordenadores, Auditores',
    hasTest: true,
    testDuration: 30,
    passingScore: 70,
    certificate: true,
    downloadableContent: ['PDF', 'Slides', 'Vídeos'],
    accessType: 'public',
    maxAttempts: 3,
    completionDeadline: '2024-12-31',
    tags: ['ISO 9001', 'Qualidade', 'Gestão', 'Auditoria'],
    modules: [
      { title: 'Introdução à ISO 9001', duration: '45min', type: 'video' },
      { title: 'Requisitos da Norma', duration: '1h 15min', type: 'video' },
      { title: 'Documentação do SGC', duration: '1h', type: 'slides' },
      { title: 'Auditoria Interna', duration: '1h 30min', type: 'video' },
      { title: 'Melhoria Contínua', duration: '1h', type: 'text' }
    ]
  },
  {
    id: 2,
    title: 'Controle Estatístico de Processo (SPC)',
    description: 'Domine as técnicas de controle estatístico para monitoramento de processos industriais. Aprenda a interpretar gráficos de controle, calcular limites e identificar causas especiais.',
    thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=225&fit=crop',
    category: 'Análise de Dados',
    duration: '6h 15min',
    participants: 89,
    rating: 4.9,
    progress: 65,
    status: 'in_progress',
    startDate: '2024-02-01',
    endDate: '2024-12-31',
    isUrgent: true,
    instructor: 'Prof. João Santos',
    level: 'Avançado',
    prerequisites: ['Estatística básica', 'Excel intermediário'],
    targetAudience: 'Engenheiros, Analistas de Qualidade, Supervisores',
    hasTest: true,
    testDuration: 45,
    passingScore: 75,
    certificate: true,
    downloadableContent: ['PDF', 'Planilhas Excel', 'Vídeos'],
    accessType: 'restricted',
    maxAttempts: 2,
    completionDeadline: '2024-11-30',
    tags: ['SPC', 'Estatística', 'Controle', 'Processos'],
    modules: [
      { title: 'Fundamentos do SPC', duration: '1h', type: 'video' },
      { title: 'Gráficos de Controle', duration: '1h 30min', type: 'video' },
      { title: 'Capabilidade de Processo', duration: '1h 45min', type: 'slides' },
      { title: 'Análise de Tendências', duration: '1h', type: 'video' },
      { title: 'Implementação Prática', duration: '1h', type: 'text' }
    ]
  },
  {
    id: 3,
    title: 'Auditoria Interna de Qualidade',
    description: 'Desenvolva habilidades para conduzir auditorias internas eficazes. Aprenda técnicas de entrevista, coleta de evidências e elaboração de relatórios de auditoria.',
    thumbnail: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=225&fit=crop',
    category: 'Auditoria',
    duration: '3h 45min',
    participants: 234,
    rating: 4.7,
    progress: 100,
    status: 'completed',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    isUrgent: false,
    instructor: 'Auditor Carlos Lima',
    level: 'Intermediário',
    prerequisites: ['Conhecimento em ISO 9001'],
    targetAudience: 'Auditores Internos, Coordenadores de Qualidade',
    hasTest: true,
    testDuration: 25,
    passingScore: 80,
    certificate: true,
    downloadableContent: ['PDF', 'Checklists', 'Vídeos'],
    accessType: 'public',
    maxAttempts: 3,
    completionDeadline: '2024-12-31',
    tags: ['Auditoria', 'Qualidade', 'ISO', 'Checklist'],
    modules: [
      { title: 'Princípios da Auditoria', duration: '45min', type: 'video' },
      { title: 'Planejamento da Auditoria', duration: '1h', type: 'slides' },
      { title: 'Técnicas de Entrevista', duration: '1h', type: 'video' },
      { title: 'Coleta de Evidências', duration: '45min', type: 'video' },
      { title: 'Relatório de Auditoria', duration: '15min', type: 'text' }
    ]
  },
  {
    id: 4,
    title: 'Gestão de Fornecedores e Qualidade',
    description: 'Aprenda a gerenciar relacionamentos com fornecedores de forma estratégica, avaliar performance e implementar programas de desenvolvimento de fornecedores.',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop',
    category: 'Gestão de Fornecedores',
    duration: '5h 20min',
    participants: 67,
    rating: 4.6,
    progress: 0,
    status: 'not_started',
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    isUrgent: false,
    instructor: 'Eng. Ana Costa',
    level: 'Intermediário',
    prerequisites: ['Gestão básica'],
    targetAudience: 'Compradores, Gestores de Qualidade, Supervisores',
    hasTest: true,
    testDuration: 35,
    passingScore: 70,
    certificate: true,
    downloadableContent: ['PDF', 'Templates', 'Vídeos'],
    accessType: 'restricted',
    maxAttempts: 3,
    completionDeadline: '2024-12-31',
    tags: ['Fornecedores', 'Qualidade', 'Gestão', 'Avaliação'],
    modules: [
      { title: 'Seleção de Fornecedores', duration: '1h 15min', type: 'video' },
      { title: 'Avaliação de Performance', duration: '1h 30min', type: 'slides' },
      { title: 'Desenvolvimento de Fornecedores', duration: '1h 15min', type: 'video' },
      { title: 'Gestão de Riscos', duration: '1h', type: 'video' },
      { title: 'Melhoria Contínua', duration: '20min', type: 'text' }
    ]
  },
  {
    id: 5,
    title: 'Análise de Riscos em Qualidade',
    description: 'Identifique e gerencie riscos relacionados à qualidade de produtos e processos. Aprenda metodologias como FMEA, HACCP e análise de riscos operacionais.',
    thumbnail: 'https://images.unsplash.com/photo-1556761175-4f9a5eb9e4b5?w=400&h=225&fit=crop',
    category: 'Gestão de Riscos',
    duration: '4h 10min',
    participants: 123,
    rating: 4.8,
    progress: 30,
    status: 'in_progress',
    startDate: '2024-02-15',
    endDate: '2024-12-31',
    isUrgent: false,
    instructor: 'Dr. Pedro Oliveira',
    level: 'Avançado',
    prerequisites: ['Gestão da qualidade', 'Processos industriais'],
    targetAudience: 'Engenheiros, Gestores de Qualidade, Supervisores',
    hasTest: true,
    testDuration: 40,
    passingScore: 75,
    certificate: true,
    downloadableContent: ['PDF', 'Templates FMEA', 'Vídeos'],
    accessType: 'restricted',
    maxAttempts: 2,
    completionDeadline: '2024-11-15',
    tags: ['Riscos', 'FMEA', 'Qualidade', 'Análise'],
    modules: [
      { title: 'Fundamentos de Gestão de Riscos', duration: '1h', type: 'video' },
      { title: 'Metodologia FMEA', duration: '1h 30min', type: 'slides' },
      { title: 'HACCP na Prática', duration: '1h', type: 'video' },
      { title: 'Análise de Riscos Operacionais', duration: '45min', type: 'video' },
      { title: 'Plano de Contingência', duration: '15min', type: 'text' }
    ]
  },
  {
    id: 6,
    title: 'Inspeção de Qualidade Avançada',
    description: 'Técnicas avançadas de inspeção visual e dimensional para controle de qualidade. Aprenda a usar instrumentos de medição e interpretar especificações técnicas.',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=225&fit=crop',
    category: 'Inspeção',
    duration: '7h 30min',
    participants: 198,
    rating: 4.9,
    progress: 0,
    status: 'not_started',
    startDate: '2024-04-01',
    endDate: '2024-12-31',
    isUrgent: true,
    instructor: 'Téc. Roberto Silva',
    level: 'Básico',
    prerequisites: ['Ensino médio completo'],
    targetAudience: 'Inspetores, Operadores, Técnicos',
    hasTest: true,
    testDuration: 50,
    passingScore: 70,
    certificate: true,
    downloadableContent: ['PDF', 'Manuais', 'Vídeos'],
    accessType: 'public',
    maxAttempts: 3,
    completionDeadline: '2024-12-31',
    tags: ['Inspeção', 'Medição', 'Qualidade', 'Técnicas'],
    modules: [
      { title: 'Fundamentos da Inspeção', duration: '1h 30min', type: 'video' },
      { title: 'Instrumentos de Medição', duration: '2h', type: 'video' },
      { title: 'Interpretação de Desenhos', duration: '1h 30min', type: 'slides' },
      { title: 'Técnicas de Inspeção Visual', duration: '1h 30min', type: 'video' },
      { title: 'Relatórios de Inspeção', duration: '1h', type: 'text' }
    ]
  }
];

export default function TrainingList() {
  const logger = useLogger('TrainingList');
  const notifications = useNotifications();
  const analytics = useAnalytics();
  const comments = useComments();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [userPerformance, setUserPerformance] = useState<any>(null);

  useEffect(() => {
    logger.info('component_mount', 'TrainingList component mounted');
    
    // Carregar performance do usuário
    const performance = analytics.getUserPerformance();
    setUserPerformance(performance);

    // Verificar treinamentos urgentes
    const urgentTrainings = mockTrainings.filter(t => t.isUrgent);
    if (urgentTrainings.length > 0) {
      urgentTrainings.forEach(training => {
        notifications.createTrainingNotification(
          training.id.toString(),
          training.title,
          'urgent'
        );
      });
    }

    // Log de analytics
    analytics.trackProgress({
      trainingId: 'list_view',
      trainingTitle: 'Lista de Treinamentos',
      progress: 0,
      timeSpent: 0,
      status: 'not_started'
    });

  }, []);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'not_started':
        return { label: 'Não Iniciado', color: 'bg-slate-100 text-slate-700' };
      case 'in_progress':
        return { label: 'Em Andamento', color: 'bg-blue-100 text-blue-700' };
      case 'completed':
        return { label: 'Concluído', color: 'bg-green-100 text-green-700' };
      default:
        return { label: 'Desconhecido', color: 'bg-gray-100 text-gray-700' };
    }
  };

  const getLevelInfo = (level: string) => {
    switch (level) {
      case 'Básico':
        return { color: 'bg-green-100 text-green-700' };
      case 'Intermediário':
        return { color: 'bg-yellow-100 text-yellow-700' };
      case 'Avançado':
        return { color: 'bg-red-100 text-red-700' };
      default:
        return { color: 'bg-gray-100 text-gray-700' };
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'slides':
        return <Presentation className="w-4 h-4" />;
      case 'text':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleStartTraining = (training: any) => {
    logger.info('start_training', `User started training: ${training.title}`, { trainingId: training.id });
    
    // Track progress
    analytics.trackProgress({
      trainingId: training.id.toString(),
      trainingTitle: training.title,
      progress: 0,
      timeSpent: 0,
      status: 'in_progress'
    });

    // Create notification
    notifications.createTrainingNotification(
      training.id.toString(),
      training.title,
      'reminder'
    );

    // Log action
    logger.info('training_action', 'Training started successfully');
  };

  const handleContinueTraining = (training: any) => {
    logger.info('continue_training', `User continued training: ${training.title}`, { trainingId: training.id });
    
    // Track progress
    analytics.trackProgress({
      trainingId: training.id.toString(),
      trainingTitle: training.title,
      progress: training.progress,
      timeSpent: 0,
      status: 'in_progress'
    });
  };

  const handleViewCertificate = (training: any) => {
    logger.info('view_certificate', `User viewed certificate for: ${training.title}`, { trainingId: training.id });
    
    // Create achievement notification
    notifications.createAchievementNotification(
      'Certificado Visualizado',
      `Você visualizou o certificado do treinamento "${training.title}"`,
      {
        label: 'Ver Certificado',
        url: `/training/certificates/${training.id}`
      }
    );
  };

  const handleViewDetails = (training: any) => {
    logger.info('view_details', `User viewed details for: ${training.title}`, { trainingId: training.id });
    setSelectedTraining(training);
    setIsDetailModalOpen(true);
  };

  const filteredTrainings = mockTrainings.filter(training => {
    const matchesSearch = training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || !selectedCategory || training.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || !selectedStatus || training.status === selectedStatus;
    const matchesLevel = selectedLevel === 'all' || !selectedLevel || training.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesStatus && matchesLevel;
  });

  const categories = Array.from(new Set(mockTrainings.map(training => training.category)));
  const statuses = ['not_started', 'in_progress', 'completed'];
  const levels = ['Básico', 'Intermediário', 'Avançado'];

  // Estatísticas
  const totalTrainings = mockTrainings.length;
  const completedTrainings = mockTrainings.filter(training => training.status === 'completed').length;
  const inProgressTrainings = mockTrainings.filter(training => training.status === 'in_progress').length;
  const notStartedTrainings = mockTrainings.filter(training => training.status === 'not_started').length;
  const urgentTrainings = mockTrainings.filter(training => training.isUrgent).length;
  const averageRating = Math.round(mockTrainings.reduce((acc, training) => acc + training.rating, 0) / totalTrainings * 10) / 10;
  const totalParticipants = mockTrainings.reduce((acc, training) => acc + training.participants, 0);

  return (
    <div className="space-y-6">
      {/* Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total de Treinamentos</p>
                <p className="text-2xl font-bold text-slate-900">{totalTrainings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Concluídos</p>
                <p className="text-2xl font-bold text-slate-900">{completedTrainings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Em Andamento</p>
                <p className="text-2xl font-bold text-slate-900">{inProgressTrainings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Participantes</p>
                <p className="text-2xl font-bold text-slate-900">{totalParticipants}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avaliação Média</p>
                <p className="text-2xl font-bold text-slate-900">{averageRating}</p>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="text-sm text-slate-600">/ 5.0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Urgentes</p>
                <p className="text-2xl font-bold text-slate-900">{urgentTrainings}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.round((completedTrainings / totalTrainings) * 100)}%
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance do Usuário */}
      {userPerformance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Sua Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{userPerformance.completedTrainings}</p>
                <p className="text-sm text-slate-600">Treinamentos Concluídos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{userPerformance.averageScore}%</p>
                <p className="text-sm text-slate-600">Média de Pontuação</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{userPerformance.streakDays}</p>
                <p className="text-sm text-slate-600">Dias de Sequência</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{userPerformance.certificatesEarned}</p>
                <p className="text-sm text-slate-600">Certificados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros e Controles */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar treinamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {statuses.map(status => {
                  const statusInfo = getStatusInfo(status);
                  return (
                    <SelectItem key={status} value={status}>
                      {statusInfo.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis</SelectItem>
                {levels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">
                {filteredTrainings.length} treinamento{filteredTrainings.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Treinamentos */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        : "space-y-4"
      }>
        {filteredTrainings.map((training) => {
          const statusInfo = getStatusInfo(training.status);
          const levelInfo = getLevelInfo(training.level);
          const rating = comments.getTrainingRating(training.id.toString());
          
          return (
            <motion.div
              key={training.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
                training.isUrgent ? 'ring-2 ring-yellow-400' : ''
              }`}>
                <div className="relative">
                  <img
                    src={training.thumbnail}
                    alt={training.title}
                    className="w-full h-48 object-cover"
                  />
                  {training.isUrgent && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-yellow-500 text-white">
                        <Bell className="w-3 h-3 mr-1" />
                        Urgente
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <Badge className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>
                    <Badge className={levelInfo.color}>
                      {training.level}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="secondary" className="bg-white/90 text-slate-700">
                      {rating?.averageRating || training.rating} <Star className="w-3 h-3 ml-1 fill-current" />
                    </Badge>
                  </div>
                  {training.accessType === 'restricted' && (
                    <div className="absolute bottom-3 right-3">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                    {training.title}
                  </h3>
                  
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {training.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{training.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{training.participants}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <UserCheck className="w-4 h-4" />
                      <span>{training.instructor}</span>
                    </div>

                    {training.progress > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Progresso</span>
                          <span className="font-medium">{training.progress}%</span>
                        </div>
                        <Progress value={training.progress} className="h-2" />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {training.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {training.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{training.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {training.status === 'not_started' && (
                          <Button 
                            size="sm" 
                            className="flex items-center space-x-1"
                            onClick={() => handleStartTraining(training)}
                          >
                            <Play className="w-3 h-3" />
                            <span>Iniciar</span>
                          </Button>
                        )}
                        {training.status === 'in_progress' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center space-x-1"
                            onClick={() => handleContinueTraining(training)}
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>Continuar</span>
                          </Button>
                        )}
                        {training.status === 'completed' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center space-x-1"
                            onClick={() => handleViewCertificate(training)}
                          >
                            <Award className="w-3 h-3" />
                            <span>Ver Certificado</span>
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(training)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredTrainings.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum treinamento encontrado</h3>
          <p className="text-slate-600">Tente ajustar os filtros ou aguarde novos treinamentos.</p>
        </div>
      )}

      {/* Modal de Detalhes */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Treinamento</DialogTitle>
          </DialogHeader>
          
          {selectedTraining && (
            <div className="space-y-6">
              <div className="relative">
                <img
                  src={selectedTraining.thumbnail}
                  alt={selectedTraining.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Badge className={getStatusInfo(selectedTraining.status).color}>
                    {getStatusInfo(selectedTraining.status).label}
                  </Badge>
                  <Badge className={getLevelInfo(selectedTraining.level).color}>
                    {selectedTraining.level}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {selectedTraining.title}
                  </h3>
                  <p className="text-slate-600">{selectedTraining.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Informações Gerais</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Instrutor:</span>
                          <span className="font-medium">{selectedTraining.instructor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Duração:</span>
                          <span className="font-medium">{selectedTraining.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Participantes:</span>
                          <span className="font-medium">{selectedTraining.participants}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Avaliação:</span>
                          <span className="font-medium">{selectedTraining.rating}/5.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Categoria:</span>
                          <span className="font-medium">{selectedTraining.category}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Pré-requisitos</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {selectedTraining.prerequisites.map((prereq: string, index: number) => (
                          <li key={index} className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                            <span>{prereq}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Público-alvo</h4>
                      <p className="text-sm text-slate-600">{selectedTraining.targetAudience}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Configurações do Teste</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Duração do teste:</span>
                          <span className="font-medium">{selectedTraining.testDuration} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Nota mínima:</span>
                          <span className="font-medium">{selectedTraining.passingScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Tentativas:</span>
                          <span className="font-medium">{selectedTraining.maxAttempts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Certificado:</span>
                          <span className="font-medium">{selectedTraining.certificate ? 'Sim' : 'Não'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Conteúdo para Download</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTraining.downloadableContent.map((content: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {content}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTraining.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Módulos do Curso</h4>
                  <div className="space-y-2">
                    {selectedTraining.modules.map((module: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white rounded-lg">
                            {getContentTypeIcon(module.type)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{module.title}</p>
                            <p className="text-xs text-slate-500">{module.duration}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {module.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
                <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                  Fechar
                </Button>
                {selectedTraining.status === 'not_started' && (
                  <Button onClick={() => {
                    handleStartTraining(selectedTraining);
                    setIsDetailModalOpen(false);
                  }}>
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar Treinamento
                  </Button>
                )}
                {selectedTraining.status === 'in_progress' && (
                  <Button onClick={() => {
                    handleContinueTraining(selectedTraining);
                    setIsDetailModalOpen(false);
                  }}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Continuar Treinamento
                  </Button>
                )}
                {selectedTraining.status === 'completed' && (
                  <Button onClick={() => {
                    handleViewCertificate(selectedTraining);
                    setIsDetailModalOpen(false);
                  }}>
                    <Award className="w-4 h-4 mr-2" />
                    Ver Certificado
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

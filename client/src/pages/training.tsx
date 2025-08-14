import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, Download, Upload, Eye, Edit, Trash2, 
  BookOpen, Users, Calendar, Clock, CheckCircle, XCircle, 
  Play, Pause, Star, History, Copy, Share2, Settings,
  ChevronDown, ChevronRight, FileText, Video, Image,
  BarChart3, TrendingUp, Award, Target, Zap, MoreHorizontal,
  Grid, List, GraduationCap, BookMarked, FileCheck, UserX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

interface Training {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number; // em minutos
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'active' | 'draft' | 'archived';
  thumbnail: string;
  videoUrl?: string;
  materials: TrainingMaterial[];
  tests: TrainingTest[];
  assignedUsers: string[];
  completionDeadline?: Date;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  stats: {
    totalEnrolled: number;
    completedCount: number;
    averageScore: number;
    averageTime: number;
  };
}

interface TrainingMaterial {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'link' | 'image';
  url: string;
  description: string;
}

interface TrainingTest {
  id: string;
  title: string;
  questions: TestQuestion[];
  passingScore: number;
  timeLimit?: number;
}

interface TestQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'text';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
}

interface UserTraining {
  userId: string;
  userName: string;
  trainingId: string;
  trainingTitle: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  score?: number;
  startedAt?: Date;
  completedAt?: Date;
  deadline?: Date;
}

interface TrainingSettings {
  automaticCertificate: boolean;
  notifications: boolean;
  reAttempts: number;
  requireApproval: boolean;
  allowDownload: boolean;
  showProgress: boolean;
}

interface TrainingList {
  id: string;
  name: string;
  type: 'general' | 'user_specific';
  userId?: string;
  filters: {
    category?: string;
    status?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
  createdAt: string;
}

export default function TrainingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [userTrainings, setUserTrainings] = useState<UserTraining[]>([]);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUserList, setShowUserList] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserListModal, setShowUserListModal] = useState(false);
  const [showTrainingListsModal, setShowTrainingListsModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);

  // Dados simulados
  const mockTrainings: Training[] = [
    {
      id: '1',
      title: 'ISO 9001:2015 - Fundamentos',
      description: 'Curso completo sobre os fundamentos da norma ISO 9001:2015',
      category: 'Qualidade',
      duration: 120,
      difficulty: 'intermediate',
      status: 'active',
      thumbnail: '/thumbnails/iso-9001.jpg',
      videoUrl: '/videos/iso-9001-intro.mp4',
      materials: [
        {
          id: '1',
          name: 'Manual ISO 9001:2015',
          type: 'pdf',
          url: '/materials/iso-9001-manual.pdf',
          description: 'Manual completo da norma'
        },
        {
          id: '2',
          name: 'Apresentação Slides',
          type: 'pdf',
          url: '/materials/iso-9001-slides.pdf',
          description: 'Slides da apresentação'
        }
      ],
      tests: [
        {
          id: '1',
          title: 'Teste Final - ISO 9001',
          passingScore: 70,
          timeLimit: 60,
          questions: [
            {
              id: '1',
              question: 'Qual é o objetivo principal da ISO 9001?',
              type: 'multiple_choice',
              options: [
                'Reduzir custos',
                'Melhorar a satisfação do cliente',
                'Aumentar a produtividade',
                'Todas as alternativas'
              ],
              correctAnswer: 'Melhorar a satisfação do cliente',
              points: 10
            }
          ]
        }
      ],
      assignedUsers: ['user1', 'user2', 'user3'],
      createdBy: 'João Silva',
      createdAt: new Date('2024-01-15'),
      updatedBy: 'Maria Santos',
      updatedAt: new Date('2024-08-10'),
      stats: {
        totalEnrolled: 45,
        completedCount: 32,
        averageScore: 85.5,
        averageTime: 95
      }
    }
  ];

  const mockUserTrainings: UserTraining[] = [
    {
      userId: 'user1',
      userName: 'João Silva',
      trainingId: '1',
      trainingTitle: 'ISO 9001:2015 - Fundamentos',
      status: 'completed',
      progress: 100,
      score: 88,
      startedAt: new Date('2024-07-01'),
      completedAt: new Date('2024-07-15'),
      deadline: new Date('2024-08-01')
    },
    {
      userId: 'user2',
      userName: 'Maria Santos',
      trainingId: '1',
      trainingTitle: 'ISO 9001:2015 - Fundamentos',
      status: 'in_progress',
      progress: 65,
      startedAt: new Date('2024-07-10'),
      deadline: new Date('2024-08-15')
    }
  ];

  useEffect(() => {
    setTrainings(mockTrainings);
    setUserTrainings(mockUserTrainings);
  }, []);

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || training.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || training.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredUserTrainings = userTrainings.filter(ut => {
    if (selectedUser !== 'all') {
      return ut.userId === selectedUser;
    }
    return true;
  });

  const handleCreateTraining = () => {
    setIsCreating(true);
  };

  const handleEditTraining = (training: Training) => {
    setSelectedTraining(training);
    setIsEditing(true);
  };

  const handleViewUserList = (training: Training) => {
    setSelectedTraining(training);
    setShowUserList(true);
  };

  const handleDownloadUserList = (trainingId: string, filter?: string) => {
    toast({
      title: "Download iniciado",
      description: `Lista de usuários do treinamento ${trainingId} está sendo baixada.`,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'archived': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Lista de Treinamentos</h1>
          <p className="text-gray-600 dark:text-gray-400">Visualize e gerencie seus treinamentos disponíveis</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowTrainingListsModal(true)}
          >
            <FileText className="w-4 h-4 mr-2" />
            Listas de Treinamentos
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/training/admin'}
          >
            <Settings className="w-4 h-4 mr-2" />
            Administração
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar treinamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="Qualidade">Qualidade</SelectItem>
                <SelectItem value="Segurança">Segurança</SelectItem>
                <SelectItem value="Processos">Processos</SelectItem>
                <SelectItem value="Tecnologia">Tecnologia</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center justify-center">
              <Filter className="w-4 h-4 mr-2" />
              Mais Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Treinamentos</p>
                <p className="text-2xl font-bold text-gray-900">{trainings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Usuários Enrolados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {trainings.reduce((acc, t) => acc + t.stats.totalEnrolled, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-gray-900">78.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Nota Média</p>
                <p className="text-2xl font-bold text-gray-900">85.2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Treinamentos */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainings.map((training) => (
            <motion.div
              key={training.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                        {training.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge className={getStatusColor(training.status)}>
                          {getStatusIcon(training.status)}
                          <span className="ml-1 capitalize">{training.status}</span>
                        </Badge>
                        <Badge className={getDifficultyColor(training.difficulty)}>
                          {training.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {training.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{training.duration} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{training.stats.totalEnrolled} inscritos</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditTraining(training)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewUserList(training)}>
                          <Users className="w-4 h-4 mr-2" />
                          Ver Usuários
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadUserList(training.id)}>
                          <Download className="w-4 h-4 mr-2" />
                          Baixar Lista
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progresso:</span>
                      <span className="font-medium">
                        {Math.round((training.stats.completedCount / training.stats.totalEnrolled) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(training.stats.completedCount / training.stats.totalEnrolled) * 100} 
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Nota Média:</span>
                      <span className="font-medium">{training.stats.averageScore}%</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {training.materials.slice(0, 2).map((material, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {material.type.toUpperCase()}
                          </Badge>
                        ))}
                        {training.materials.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{training.materials.length - 2}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-500">
                          {training.tests.length} teste{training.tests.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Treinamento</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Inscritos</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainings.map((training) => (
                  <TableRow key={training.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{training.title}</div>
                        <div className="text-sm text-gray-500">{training.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{training.category}</Badge>
                    </TableCell>
                    <TableCell>{training.duration} min</TableCell>
                    <TableCell>{training.stats.totalEnrolled}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={(training.stats.completedCount / training.stats.totalEnrolled) * 100} 
                          className="w-20"
                        />
                        <span className="text-sm">
                          {Math.round((training.stats.completedCount / training.stats.totalEnrolled) * 100)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(training.status)}>
                        {getStatusIcon(training.status)}
                        <span className="ml-1 capitalize">{training.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTraining(training)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUserList(training)}
                        >
                          <Users className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownloadUserList(training.id)}>
                              <Download className="w-4 h-4 mr-2" />
                              Baixar Lista
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Modal de Lista de Usuários */}
      <Dialog open={showUserList} onOpenChange={setShowUserList}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Usuários do Treinamento - {selectedTraining?.title}</DialogTitle>
            <DialogDescription>
              Visualize e gerencie usuários inscritos no treinamento
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="all" className="h-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="in_progress">Em Andamento</TabsTrigger>
                <TabsTrigger value="completed">Concluídos</TabsTrigger>
                <TabsTrigger value="overdue">Atrasados</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar por usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Usuários</SelectItem>
                        <SelectItem value="user1">João Silva</SelectItem>
                        <SelectItem value="user2">Maria Santos</SelectItem>
                        <SelectItem value="user3">Carlos Lima</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => handleDownloadUserList(selectedTraining?.id || '', selectedUser)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Lista
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progresso</TableHead>
                        <TableHead>Nota</TableHead>
                        <TableHead>Prazo</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUserTrainings.map((userTraining) => (
                        <TableRow key={`${userTraining.userId}-${userTraining.trainingId}`}>
                          <TableCell>
                            <div className="font-medium">{userTraining.userName}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              userTraining.status === 'completed' ? 'bg-green-100 text-green-800' :
                              userTraining.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              userTraining.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {userTraining.status === 'completed' ? 'Concluído' :
                               userTraining.status === 'in_progress' ? 'Em Andamento' :
                               userTraining.status === 'failed' ? 'Reprovado' :
                               'Não Iniciado'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress value={userTraining.progress} className="w-20" />
                              <span className="text-sm">{userTraining.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {userTraining.score ? `${userTraining.score}%` : '-'}
                          </TableCell>
                          <TableCell>
                            {userTraining.deadline ? (
                              <span className={
                                userTraining.deadline < new Date() ? 'text-red-600' : 'text-green-600'
                              }>
                                {userTraining.deadline.toLocaleDateString()}
                              </span>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Criação/Edição */}
      <Dialog open={isCreating || isEditing} onOpenChange={() => {
        setIsCreating(false);
        setIsEditing(false);
        setSelectedTraining(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Novo Treinamento' : 'Editar Treinamento'}
            </DialogTitle>
            <DialogDescription>
              Configure o treinamento com materiais, testes e prazo de conclusão
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="basic" className="h-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="materials">Materiais</TabsTrigger>
                <TabsTrigger value="tests">Testes</TabsTrigger>
                <TabsTrigger value="users">Usuários</TabsTrigger>
                <TabsTrigger value="settings">Configurações</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="h-full">
                <ScrollArea className="h-[600px]">
                  <div className="p-4 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Título do Treinamento</Label>
                        <Input id="title" placeholder="Ex: ISO 9001:2015 - Fundamentos" />
                      </div>
                      <div>
                        <Label htmlFor="category">Categoria</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Qualidade">Qualidade</SelectItem>
                            <SelectItem value="Segurança">Segurança</SelectItem>
                            <SelectItem value="Processos">Processos</SelectItem>
                            <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Descreva o conteúdo e objetivos do treinamento"
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="duration">Duração (minutos)</Label>
                        <Input id="duration" type="number" placeholder="120" />
                      </div>
                      <div>
                        <Label htmlFor="difficulty">Dificuldade</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a dificuldade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Iniciante</SelectItem>
                            <SelectItem value="intermediate">Intermediário</SelectItem>
                            <SelectItem value="advanced">Avançado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="deadline">Prazo de Conclusão (para usuários)</Label>
                      <Input id="deadline" type="date" />
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="materials" className="h-full">
                <ScrollArea className="h-[600px]">
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Materiais do Treinamento</h3>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Material
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {selectedTraining?.materials.map((material) => (
                        <Card key={material.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <div>
                                  <p className="font-medium">{material.name}</p>
                                  <p className="text-sm text-gray-600">{material.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{material.type.toUpperCase()}</Badge>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="tests" className="h-full">
                <ScrollArea className="h-[600px]">
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Testes e Avaliações</h3>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Teste
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {selectedTraining?.tests.map((test) => (
                        <Card key={test.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{test.title}</CardTitle>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">Nota mínima: {test.passingScore}%</Badge>
                                {test.timeLimit && (
                                  <Badge variant="outline">{test.timeLimit} min</Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 mb-3">
                              {test.questions.length} questão{test.questions.length > 1 ? 'ões' : 'ão'}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                Visualizar
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="users" className="h-full">
                <ScrollArea className="h-[600px]">
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Usuários Atribuídos</h3>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Usuários
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {['João Silva', 'Maria Santos', 'Carlos Lima'].map((user, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Checkbox id={`user-${index}`} defaultChecked />
                            <Label htmlFor={`user-${index}`} className="font-medium">{user}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Input 
                              type="date" 
                              className="w-40" 
                              placeholder="Prazo personalizado"
                            />
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="settings" className="h-full">
                <ScrollArea className="h-[600px]">
                  <div className="p-4 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Configurações Avançadas</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Certificado Automático</Label>
                            <p className="text-sm text-gray-600">Emitir certificado após conclusão</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Notificações</Label>
                            <p className="text-sm text-gray-600">Enviar lembretes de prazo</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Reprovação</Label>
                            <p className="text-sm text-gray-600">Permitir nova tentativa</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreating(false);
              setIsEditing(false);
              setSelectedTraining(null);
            }}>
              Cancelar
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              Salvar Treinamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

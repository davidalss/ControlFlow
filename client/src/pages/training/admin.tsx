import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  BookOpen, 
  Settings, 
  Upload, 
  Image, 
  Video, 
  FileText, 
  Link, 
  Play,
  Download,
  Users,
  Calendar,
  Clock,
  Award,
  Bell,
  Lock,
  Eye,
  Edit,
  Copy,
  Trash2,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  ArrowUpDown,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

interface Training {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail?: string;
  status: 'draft' | 'published' | 'archived';
  modality: 'online' | 'hybrid' | 'in_person';
  duration: number; // em minutos
  targetAudience: string;
  prerequisites: string[];
  releaseDate: string;
  expirationDate?: string;
  accessControl: 'public' | 'restricted';
  certificate: boolean;
  notifications: boolean;
  reminders: boolean;
  materials: TrainingMaterial[];
  createdAt: string;
  updatedAt: string;
}

interface TrainingMaterial {
  id: string;
  type: 'video' | 'pdf' | 'slides' | 'image' | 'scorm' | 'link';
  title: string;
  url: string;
  thumbnail?: string;
  duration?: number;
  required: boolean;
  order: number;
  downloadEnabled: boolean;
  watermark: boolean;
}

export default function TrainingAdminPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);

  // Mock data
  const mockTrainings: Training[] = [
    {
      id: '1',
      title: 'Normas ISO 9001:2015 - Implementação Completa',
      description: 'Treinamento abrangente sobre implementação e manutenção do sistema de gestão da qualidade conforme ISO 9001:2015',
      category: 'Normas e Certificações',
      tags: ['ISO', 'Qualidade', 'Sistema de Gestão'],
      thumbnail: '/images/training/iso-9001.jpg',
      status: 'published',
      modality: 'online',
      duration: 480, // 8 horas
      targetAudience: 'Engenheiros de Qualidade, Coordenadores, Gerentes',
      prerequisites: ['Conhecimento básico em gestão da qualidade'],
      releaseDate: '2024-01-15',
      expirationDate: '2024-12-31',
      accessControl: 'restricted',
      certificate: true,
      notifications: true,
      reminders: true,
      materials: [
        {
          id: '1',
          type: 'video',
          title: 'Introdução à ISO 9001:2015',
          url: '/materials/iso-9001-intro.mp4',
          thumbnail: '/images/materials/iso-intro.jpg',
          duration: 45,
          required: true,
          order: 1,
          downloadEnabled: false,
          watermark: true
        },
        {
          id: '2',
          type: 'pdf',
          title: 'Manual ISO 9001:2015',
          url: '/materials/iso-9001-manual.pdf',
          required: true,
          order: 2,
          downloadEnabled: true,
          watermark: false
        }
      ],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Inspeção de Qualidade - Procedimentos Avançados',
      description: 'Procedimentos e técnicas avançadas para inspeção de produtos e controle de qualidade',
      category: 'Inspeção e Controle',
      tags: ['Inspeção', 'Controle', 'Procedimentos'],
      status: 'draft',
      modality: 'hybrid',
      duration: 360, // 6 horas
      targetAudience: 'Inspetores, Técnicos de Qualidade',
      prerequisites: ['Experiência básica em inspeção'],
      releaseDate: '2024-02-01',
      accessControl: 'public',
      certificate: true,
      notifications: false,
      reminders: true,
      materials: [],
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20'
    }
  ];

  const filteredTrainings = mockTrainings.filter(training => {
    const matchesCategory = selectedCategory === 'all' || training.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || training.status === selectedStatus;
    const matchesSearch = training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: Training['status']) => {
    switch (status) {
      case 'published': return <Badge className="bg-green-100 text-green-800">Publicado</Badge>;
      case 'draft': return <Badge className="bg-yellow-100 text-yellow-800">Rascunho</Badge>;
      case 'archived': return <Badge className="bg-gray-100 text-gray-800">Arquivado</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getModalityBadge = (modality: Training['modality']) => {
    switch (modality) {
      case 'online': return <Badge className="bg-blue-100 text-blue-800">Online</Badge>;
      case 'hybrid': return <Badge className="bg-purple-100 text-purple-800">Híbrido</Badge>;
      case 'in_person': return <Badge className="bg-orange-100 text-orange-800">Presencial</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Administração de Treinamentos</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie treinamentos, materiais e configurações</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Treinamento
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Buscar treinamentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="w-full sm:w-48">
                <Label htmlFor="category">Categoria</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    <SelectItem value="Normas e Certificações">Normas e Certificações</SelectItem>
                    <SelectItem value="Inspeção e Controle">Inspeção e Controle</SelectItem>
                    <SelectItem value="Processos">Processos</SelectItem>
                    <SelectItem value="Segurança">Segurança</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-48">
                <Label htmlFor="status">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
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
          </div>
        </CardContent>
      </Card>

      {/* Lista de Treinamentos */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainings.map((training) => (
            <Card key={training.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{training.title}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {training.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(training.status)}
                    {getModalityBadge(training.modality)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(training.duration)}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{training.targetAudience}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Liberação: {new Date(training.releaseDate).toLocaleDateString('pt-BR')}</span>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingTraining(training);
                        setShowCreateModal(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-1" />
                      Duplicar
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4 font-medium">Treinamento</th>
                    <th className="text-left p-4 font-medium">Categoria</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Duração</th>
                    <th className="text-left p-4 font-medium">Liberação</th>
                    <th className="text-left p-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrainings.map((training) => (
                    <tr key={training.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{training.title}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {training.description}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{training.category}</Badge>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(training.status)}
                      </td>
                      <td className="p-4">
                        {formatDuration(training.duration)}
                      </td>
                      <td className="p-4">
                        {new Date(training.releaseDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingTraining(training);
                              setShowCreateModal(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Criação/Edição */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTraining ? 'Editar Treinamento' : 'Novo Treinamento'}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="thumbnail">Thumbnail</TabsTrigger>
              <TabsTrigger value="materials">Materiais</TabsTrigger>
              <TabsTrigger value="access">Acesso</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título do Treinamento</Label>
                  <Input 
                    id="title" 
                    placeholder="Ex: Normas ISO 9001:2015"
                    defaultValue={editingTraining?.title}
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select defaultValue={editingTraining?.category || 'Normas e Certificações'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normas e Certificações">Normas e Certificações</SelectItem>
                      <SelectItem value="Inspeção e Controle">Inspeção e Controle</SelectItem>
                      <SelectItem value="Processos">Processos</SelectItem>
                      <SelectItem value="Segurança">Segurança</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  placeholder="Descreva o conteúdo e objetivos do treinamento..."
                  rows={4}
                  defaultValue={editingTraining?.description}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="modality">Modalidade</Label>
                  <Select defaultValue={editingTraining?.modality || 'online'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="hybrid">Híbrido</SelectItem>
                      <SelectItem value="in_person">Presencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="duration">Duração (minutos)</Label>
                  <Input 
                    id="duration" 
                    type="number"
                    defaultValue={editingTraining?.duration || 60}
                    min="1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="releaseDate">Data de Liberação</Label>
                  <Input 
                    id="releaseDate" 
                    type="date"
                    defaultValue={editingTraining?.releaseDate}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="targetAudience">Público-Alvo</Label>
                <Input 
                  id="targetAudience" 
                  placeholder="Ex: Engenheiros, Técnicos, Coordenadores"
                  defaultValue={editingTraining?.targetAudience}
                />
              </div>
              
              <div>
                <Label htmlFor="prerequisites">Pré-requisitos</Label>
                <Textarea 
                  id="prerequisites" 
                  placeholder="Liste os pré-requisitos necessários..."
                  rows={2}
                  defaultValue={editingTraining?.prerequisites?.join(', ')}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="thumbnail" className="space-y-4">
              <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Upload de Thumbnail</p>
                <p className="text-gray-600 mb-4">
                  Arraste uma imagem ou clique para selecionar
                </p>
                <Button>
                  <Image className="w-4 h-4 mr-2" />
                  Selecionar Imagem
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Filtros e Efeitos</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="brightness" />
                      <Label htmlFor="brightness">Ajustar Brilho</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="contrast" />
                      <Label htmlFor="contrast">Ajustar Contraste</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="blur" />
                      <Label htmlFor="blur">Efeito Blur</Label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Texto e Overlay</Label>
                  <Input placeholder="Texto sobre a imagem" />
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="watermark" />
                      <Label htmlFor="watermark">Marca d'água</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="logo" />
                      <Label htmlFor="logo">Logo da empresa</Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="materials" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Materiais Didáticos</h3>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Material
                </Button>
              </div>
              
              <div className="space-y-4">
                {editingTraining?.materials.map((material, index) => (
                  <Card key={material.id}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Tipo</Label>
                          <Select defaultValue={material.type}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">Vídeo</SelectItem>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="slides">Slides</SelectItem>
                              <SelectItem value="image">Imagem</SelectItem>
                              <SelectItem value="scorm">SCORM</SelectItem>
                              <SelectItem value="link">Link</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Título</Label>
                          <Input defaultValue={material.title} />
                        </div>
                        
                        <div>
                          <Label>URL/Arquivo</Label>
                          <Input defaultValue={material.url} />
                        </div>
                        
                        <div>
                          <Label>Ordem</Label>
                          <Input 
                            type="number" 
                            defaultValue={material.order}
                            min="1"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id={`required-${material.id}`} 
                            defaultChecked={material.required}
                          />
                          <Label htmlFor={`required-${material.id}`}>Obrigatório</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id={`download-${material.id}`} 
                            defaultChecked={material.downloadEnabled}
                          />
                          <Label htmlFor={`download-${material.id}`}>Download Permitido</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id={`watermark-${material.id}`} 
                            defaultChecked={material.watermark}
                          />
                          <Label htmlFor={`watermark-${material.id}`}>Marca d'água</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="access" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Controle de Acesso</h3>
                  
                  <div>
                    <Label htmlFor="accessControl">Tipo de Acesso</Label>
                    <Select defaultValue={editingTraining?.accessControl || 'public'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Público</SelectItem>
                        <SelectItem value="restricted">Restrito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="certificate" 
                        defaultChecked={editingTraining?.certificate}
                      />
                      <Label htmlFor="certificate">Emitir Certificado</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="notifications" 
                        defaultChecked={editingTraining?.notifications}
                      />
                      <Label htmlFor="notifications">Notificações</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="reminders" 
                        defaultChecked={editingTraining?.reminders}
                      />
                      <Label htmlFor="reminders">Lembretes</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Configurações Avançadas</h3>
                  
                  <div>
                    <Label htmlFor="expirationDate">Data de Expiração (opcional)</Label>
                    <Input 
                      id="expirationDate" 
                      type="date"
                      defaultValue={editingTraining?.expirationDate}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input 
                      id="tags" 
                      placeholder="Ex: ISO, Qualidade, Sistema"
                      defaultValue={editingTraining?.tags?.join(', ')}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4">
              <h3 className="text-lg font-medium">Visualização do Treinamento</h3>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      {editingTraining?.thumbnail ? (
                        <img 
                          src={editingTraining.thumbnail} 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <BookOpen className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-2">
                      {editingTraining?.title || 'Título do Treinamento'}
                    </h2>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {editingTraining?.description || 'Descrição do treinamento...'}
                    </p>
                    
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{editingTraining ? formatDuration(editingTraining.duration) : '1h 0min'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{editingTraining?.targetAudience || 'Público-Alvo'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Award className="w-4 h-4" />
                        <span>{editingTraining?.certificate ? 'Com Certificado' : 'Sem Certificado'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end space-x-3 pt-6">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button>
              {editingTraining ? 'Salvar Alterações' : 'Criar Treinamento'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

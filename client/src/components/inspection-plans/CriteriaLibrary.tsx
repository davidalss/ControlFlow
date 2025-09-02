import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save,
  Search,
  Filter,
  Tag,
  Settings,
  Copy,
  Star,
  BookOpen,
  CheckSquare,
  Camera,
  FileText,
  BarChart3,
  AlertCircle,
  Target,
  Zap,
  Brain,
  Sparkles,
  Upload,
  Download,
  Share2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  MoreHorizontal,
  Grid,
  List,
  SortAsc,
  SortDesc
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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

// Tipos para a Biblioteca de Critérios
export interface CriteriaBlock {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  questionType: 'yes_no' | 'multiple_choice' | 'text' | 'number' | 'photo' | 'checklist' | 'scale_1_5' | 'scale_1_10';
  options?: string[];
  defectType: 'MENOR' | 'MAIOR' | 'CRÍTICO';
  mediaHelp?: {
    type: 'image' | 'video' | 'document';
    url: string;
    description: string;
  };
  dynamicVariables?: string[];
  conditionalLogic?: {
    condition: string;
    nextStep: string;
    label: string;
  }[];
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  usageCount: number;
  rating: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: string;
}

interface CriteriaLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCriteria: (criteria: CriteriaBlock) => void;
  onCreateCriteria: (criteria: Omit<CriteriaBlock, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => void;
}

export default function CriteriaLibrary({ 
  isOpen, 
  onClose, 
  onSelectCriteria, 
  onCreateCriteria 
}: CriteriaLibraryProps) {
  const { toast } = useToast();
  const [criteria, setCriteria] = useState<CriteriaBlock[]>([]);
  const [filteredCriteria, setFilteredCriteria] = useState<CriteriaBlock[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'rating' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<CriteriaBlock | null>(null);

  // Critérios padrão da biblioteca
  const defaultCriteria: CriteriaBlock[] = [
    {
      id: '1',
      title: 'Verificação de Etiqueta',
      description: 'Verificar se a etiqueta está presente e legível',
      category: 'packaging',
      tags: ['etiqueta', 'embalagem', 'identificação'],
      questionType: 'yes_no',
      defectType: 'MAIOR',
      mediaHelp: {
        type: 'image',
        url: '/images/etiqueta-exemplo.jpg',
        description: 'Exemplo de etiqueta correta'
      },
      dynamicVariables: ['{Produto.Código}', '{Produto.Nome}'],
      conditionalLogic: [
        {
          condition: 'answer === "NÃO"',
          nextStep: 'nc_etiqueta',
          label: 'Registrar NC de Etiqueta'
        }
      ],
      estimatedTime: 5,
      difficulty: 'easy',
      usageCount: 45,
      rating: 4.8,
      isPublic: true,
      createdBy: 'Sistema',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      version: '1.0'
    },
    {
      id: '2',
      title: 'Verificação de Tensão',
      description: 'Confirmar se a tensão está dentro da especificação',
      category: 'electrical',
      tags: ['tensão', 'elétrico', 'especificação'],
      questionType: 'multiple_choice',
      options: ['127V', '220V', 'Bivolt'],
      defectType: 'CRÍTICO',
      mediaHelp: {
        type: 'image',
        url: '/images/tensao-especificacao.jpg',
        description: 'Especificação de tensão do produto'
      },
      dynamicVariables: ['{Produto.Tensão_Nominal}', '{Produto.Tipo_Tensão}'],
      conditionalLogic: [
        {
          condition: 'answer !== expectedVoltage',
          nextStep: 'nc_tensao',
          label: 'Registrar NC de Tensão'
        }
      ],
      estimatedTime: 8,
      difficulty: 'medium',
      usageCount: 32,
      rating: 4.6,
      isPublic: true,
      createdBy: 'Sistema',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      version: '1.0'
    },
    {
      id: '3',
      title: 'Inspeção Visual Geral',
      description: 'Verificação visual completa do produto',
      category: 'visual',
      tags: ['visual', 'aparência', 'qualidade'],
      questionType: 'checklist',
      defectType: 'MAIOR',
      mediaHelp: {
        type: 'image',
        url: '/images/inspecao-visual.jpg',
        description: 'Guia de inspeção visual'
      },
      dynamicVariables: ['{Produto.Categoria}', '{Produto.Padrão_Qualidade}'],
      conditionalLogic: [
        {
          condition: 'defects.length > 0',
          nextStep: 'registrar_defeitos',
          label: 'Registrar Defeitos Encontrados'
        }
      ],
      estimatedTime: 15,
      difficulty: 'easy',
      usageCount: 67,
      rating: 4.9,
      isPublic: true,
      createdBy: 'Sistema',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      version: '1.0'
    },
    {
      id: '4',
      title: 'Teste Funcional Básico',
      description: 'Teste básico de funcionamento do produto',
      category: 'functional',
      tags: ['funcional', 'teste', 'operacional'],
      questionType: 'yes_no',
      defectType: 'CRÍTICO',
      mediaHelp: {
        type: 'video',
        url: '/videos/teste-funcional.mp4',
        description: 'Demonstração do teste funcional'
      },
      dynamicVariables: ['{Produto.Tipo_Teste}', '{Produto.Critérios_Aceitação}'],
      conditionalLogic: [
        {
          condition: 'answer === "NÃO"',
          nextStep: 'nc_funcional',
          label: 'Registrar NC Funcional'
        }
      ],
      estimatedTime: 20,
      difficulty: 'medium',
      usageCount: 28,
      rating: 4.7,
      isPublic: true,
      createdBy: 'Sistema',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      version: '1.0'
    }
  ];

  // Carregar critérios
  useEffect(() => {
    setCriteria(defaultCriteria);
  }, []);

  // Filtrar critérios
  useEffect(() => {
    let filtered = criteria;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    // Filtro por tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(c => 
        selectedTags.some(tag => c.tags.includes(tag))
      );
    }

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'usage':
          comparison = a.usageCount - b.usageCount;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredCriteria(filtered);
  }, [criteria, searchTerm, selectedCategory, selectedTags, sortBy, sortOrder]);

  // Categorias disponíveis
  const categories = [
    { id: 'all', name: 'Todas', count: criteria.length },
    { id: 'packaging', name: 'Embalagem', count: criteria.filter(c => c.category === 'packaging').length },
    { id: 'electrical', name: 'Elétrico', count: criteria.filter(c => c.category === 'electrical').length },
    { id: 'visual', name: 'Visual', count: criteria.filter(c => c.category === 'visual').length },
    { id: 'functional', name: 'Funcional', count: criteria.filter(c => c.category === 'functional').length },
    { id: 'dimensional', name: 'Dimensional', count: criteria.filter(c => c.category === 'dimensional').length }
  ];

  // Tags disponíveis
  const availableTags = Array.from(new Set(criteria.flatMap(c => c.tags)));

  // Renderizar critério em modo grid
  const renderCriteriaGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredCriteria.map(criteriaItem => (
        <Card key={criteriaItem.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-sm font-medium line-clamp-2">
                  {criteriaItem.title}
                </CardTitle>
                <Badge variant="outline" className="mt-2 text-xs">
                  {criteriaItem.category}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-xs">{criteriaItem.rating}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-600 line-clamp-2 mb-3">
              {criteriaItem.description}
            </p>
            
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={criteriaItem.defectType === 'CRÍTICO' ? 'destructive' : criteriaItem.defectType === 'MAIOR' ? 'default' : 'secondary'}>
                {criteriaItem.defectType}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {criteriaItem.estimatedTime}min
              </Badge>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {criteriaItem.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
              {criteriaItem.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{criteriaItem.tags.length - 3}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <BookOpen className="w-3 h-3" />
                {criteriaItem.usageCount} usos
              </div>
              <Button
                size="sm"
                onClick={() => onSelectCriteria(criteriaItem)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Usar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Renderizar critério em modo lista
  const renderCriteriaList = () => (
    <div className="space-y-2">
      {filteredCriteria.map(criteriaItem => (
        <Card key={criteriaItem.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium">{criteriaItem.title}</h4>
                  <Badge variant="outline">{criteriaItem.category}</Badge>
                  <Badge variant={criteriaItem.defectType === 'CRÍTICO' ? 'destructive' : criteriaItem.defectType === 'MAIOR' ? 'default' : 'secondary'}>
                    {criteriaItem.defectType}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{criteriaItem.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>⏱️ {criteriaItem.estimatedTime}min</span>
                  <span>⭐ {criteriaItem.rating}</span>
                  <span>📚 {criteriaItem.usageCount} usos</span>
                  <span>🏷️ {criteriaItem.tags.slice(0, 2).join(', ')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingCriteria(criteriaItem)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => onSelectCriteria(criteriaItem)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Usar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-4">
                <BookOpen className="w-6 h-6 text-blue-500" />
                <div>
                  <h2 className="text-xl font-semibold">Biblioteca de Critérios</h2>
                  <p className="text-sm text-gray-600">Critérios reutilizáveis para planos de inspeção</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Critério
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
              </div>
            </div>

            {/* Filtros e Controles */}
            <div className="p-4 border-b space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar critérios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nome</SelectItem>
                    <SelectItem value="usage">Mais Usados</SelectItem>
                    <SelectItem value="rating">Melhor Avaliados</SelectItem>
                    <SelectItem value="createdAt">Mais Recentes</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
                <div className="flex items-center gap-1 border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Tags:</span>
                {availableTags.slice(0, 10).map(tag => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTags(prev => 
                      prev.includes(tag) 
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    )}
                  >
                    {tag}
                  </Button>
                ))}
                {availableTags.length > 10 && (
                  <span className="text-sm text-gray-500">+{availableTags.length - 10} mais</span>
                )}
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-4">
                {filteredCriteria.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum critério encontrado</h3>
                    <p className="text-gray-600 mb-4">
                      Tente ajustar os filtros ou criar um novo critério
                    </p>
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Critério
                    </Button>
                  </div>
                ) : (
                  viewMode === 'grid' ? renderCriteriaGrid() : renderCriteriaList()
                )}
              </ScrollArea>
            </div>

            {/* Status Bar */}
            <div className="border-t p-2 flex items-center justify-between text-sm text-gray-600">
              <span>{filteredCriteria.length} de {criteria.length} critérios</span>
              <span>Total de uso: {criteria.reduce((sum, c) => sum + c.usageCount, 0)}</span>
            </div>
          </motion.div>

          {/* Modal de Criação/Edição */}
          <AnimatePresence>
            {showCreateForm && (
              <CreateCriteriaModal
                criteria={editingCriteria}
                onClose={() => {
                  setShowCreateForm(false);
                  setEditingCriteria(null);
                }}
                onSave={(criteriaData) => {
                  if (editingCriteria) {
                    // Atualizar critério existente
                    setCriteria(prev => prev.map(c => 
                      c.id === editingCriteria.id 
                        ? { ...c, ...criteriaData, updatedAt: new Date().toISOString() }
                        : c
                    ));
                    toast({
                      title: "Critério atualizado",
                      description: "Critério atualizado com sucesso"
                    });
                  } else {
                    // Criar novo critério
                    onCreateCriteria(criteriaData);
                    toast({
                      title: "Critério criado",
                      description: "Novo critério adicionado à biblioteca"
                    });
                  }
                  setShowCreateForm(false);
                  setEditingCriteria(null);
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Modal de Criação/Edição de Critérios
interface CreateCriteriaModalProps {
  criteria?: CriteriaBlock | null;
  onClose: () => void;
  onSave: (criteria: Omit<CriteriaBlock, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => void;
}

function CreateCriteriaModal({ criteria, onClose, onSave }: CreateCriteriaModalProps) {
  const [formData, setFormData] = useState({
    title: criteria?.title || '',
    description: criteria?.description || '',
    category: criteria?.category || 'packaging',
    tags: criteria?.tags || [],
    questionType: criteria?.questionType || 'yes_no',
    options: criteria?.options || [],
    defectType: criteria?.defectType || 'MAIOR',
    estimatedTime: criteria?.estimatedTime || 5,
    difficulty: criteria?.difficulty || 'easy',
    isPublic: criteria?.isPublic || true,
    version: criteria?.version || '1.0'
  });

  const [newTag, setNewTag] = useState('');
  const [newOption, setNewOption] = useState('');

  const handleSave = () => {
    if (!formData.title || !formData.description) {
      return;
    }

    onSave({
      ...formData,
      createdBy: 'Usuário Atual'
    });
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const addOption = () => {
    if (newOption && !formData.options?.includes(newOption)) {
      setFormData(prev => ({ 
        ...prev, 
        options: [...(prev.options || []), newOption] 
      }));
      setNewOption('');
    }
  };

  const removeOption = (optionToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      options: prev.options?.filter(option => option !== optionToRemove) || [] 
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            {criteria ? 'Editar Critério' : 'Novo Critério'}
          </h3>
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
        
        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="p-4 space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nome do critério"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição detalhada do critério"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="packaging">Embalagem</SelectItem>
                    <SelectItem value="electrical">Elétrico</SelectItem>
                    <SelectItem value="visual">Visual</SelectItem>
                    <SelectItem value="functional">Funcional</SelectItem>
                    <SelectItem value="dimensional">Dimensional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="defectType">Tipo de Defeito</Label>
                <Select value={formData.defectType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, defectType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MENOR">Menor</SelectItem>
                    <SelectItem value="MAIOR">Maior</SelectItem>
                    <SelectItem value="CRÍTICO">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="questionType">Tipo de Pergunta</Label>
                <Select value={formData.questionType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, questionType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes_no">Sim/Não</SelectItem>
                    <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="number">Número</SelectItem>
                    <SelectItem value="photo">Foto</SelectItem>
                    <SelectItem value="checklist">Checklist</SelectItem>
                    <SelectItem value="scale_1_5">Escala 1-5</SelectItem>
                    <SelectItem value="scale_1_10">Escala 1-10</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estimatedTime">Tempo Estimado (min)</Label>
                <Input
                  id="estimatedTime"
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 0 }))}
                  min="1"
                  max="120"
                />
              </div>
            </div>

            {/* Opções para múltipla escolha */}
            {(formData.questionType === 'multiple_choice' || formData.questionType === 'checklist') && (
              <div>
                <Label>Opções</Label>
                <div className="space-y-2">
                  {formData.options?.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(formData.options || [])];
                          newOptions[index] = e.target.value;
                          setFormData(prev => ({ ...prev, options: newOptions }));
                        }}
                        placeholder={`Opção ${index + 1}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(option)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      placeholder="Nova opção"
                      onKeyPress={(e) => e.key === 'Enter' && addOption()}
                    />
                    <Button variant="outline" size="sm" onClick={addOption}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Nova tag"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button variant="outline" size="sm" onClick={addTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
              />
              <Label htmlFor="isPublic">Critério público</Label>
            </div>
          </div>
        </ScrollArea>

        <div className="border-t p-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            {criteria ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

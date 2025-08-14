import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Save, 
  Settings, 
  FileText, 
  Image, 
  CheckCircle, 
  X, 
  GripVertical,
  Search,
  Filter,
  Download,
  Upload,
  BarChart3,
  Clock,
  Target,
  Users,
  Award,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  HelpCircle,
  List,
  Grid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

// Mock data para treinamentos
const mockTrainings = [
  { id: 1, title: 'Gestão da Qualidade ISO 9001:2015' },
  { id: 2, title: 'Controle Estatístico de Processo (SPC)' },
  { id: 3, title: 'Auditoria Interna de Qualidade' },
  { id: 4, title: 'Gestão de Fornecedores e Qualidade' },
  { id: 5, title: 'Análise de Riscos em Qualidade' }
];

// Mock data para questões existentes
const mockQuestions = [
  {
    id: 1,
    type: 'multiple_choice',
    question: 'Qual é o objetivo principal da ISO 9001:2015?',
    alternatives: [
      { id: 1, text: 'Melhorar a satisfação do cliente', correct: true },
      { id: 2, text: 'Reduzir custos de produção', correct: false },
      { id: 3, text: 'Aumentar a velocidade de produção', correct: false },
      { id: 4, text: 'Diminuir o número de funcionários', correct: false }
    ],
    weight: 10,
    feedback: 'A ISO 9001:2015 tem como foco principal a satisfação do cliente através da melhoria contínua.',
    category: 'Gestão da Qualidade',
    difficulty: 'Intermediário',
    tags: ['ISO 9001', 'Satisfação do Cliente']
  },
  {
    id: 2,
    type: 'true_false',
    question: 'O controle estatístico de processo (SPC) é usado apenas para produtos finais.',
    alternatives: [
      { id: 1, text: 'Verdadeiro', correct: false },
      { id: 2, text: 'Falso', correct: true }
    ],
    weight: 5,
    feedback: 'O SPC pode ser aplicado em qualquer processo, não apenas produtos finais.',
    category: 'Análise de Dados',
    difficulty: 'Básico',
    tags: ['SPC', 'Processos']
  },
  {
    id: 3,
    type: 'essay',
    question: 'Explique os benefícios da implementação de um sistema de gestão da qualidade.',
    alternatives: [],
    weight: 15,
    feedback: 'Resposta deve incluir: melhoria da qualidade, satisfação do cliente, redução de custos, conformidade regulatória.',
    category: 'Gestão da Qualidade',
    difficulty: 'Avançado',
    tags: ['SGC', 'Benefícios', 'Qualidade']
  }
];

// Mock data para banco de questões
const mockQuestionBank = [
  ...mockQuestions,
  {
    id: 4,
    type: 'multiple_choice',
    question: 'Qual ferramenta é mais adequada para identificar a causa raiz de um problema?',
    alternatives: [
      { id: 1, text: 'Diagrama de Pareto', correct: false },
      { id: 2, text: 'Diagrama de Ishikawa (Espinha de Peixe)', correct: true },
      { id: 3, text: 'Gráfico de Controle', correct: false },
      { id: 4, text: 'Histograma', correct: false }
    ],
    weight: 8,
    feedback: 'O Diagrama de Ishikawa é especificamente projetado para identificar causas raiz.',
    category: 'Análise de Dados',
    difficulty: 'Intermediário',
    tags: ['Causa Raiz', 'Ishikawa', 'Ferramentas']
  },
  {
    id: 5,
    type: 'image',
    question: 'Identifique o tipo de gráfico de controle mostrado na imagem abaixo.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
    alternatives: [
      { id: 1, text: 'Gráfico X-R', correct: false },
      { id: 2, text: 'Gráfico p', correct: true },
      { id: 3, text: 'Gráfico c', correct: false },
      { id: 4, text: 'Gráfico u', correct: false }
    ],
    weight: 12,
    feedback: 'Este é um gráfico p, usado para controlar a proporção de itens defeituosos.',
    category: 'Análise de Dados',
    difficulty: 'Avançado',
    tags: ['Gráficos de Controle', 'SPC', 'Proporção']
  }
];

export default function TestConfig() {
  const [activeTab, setActiveTab] = useState('general');
  const [selectedTraining, setSelectedTraining] = useState('');
  const [questions, setQuestions] = useState(mockQuestions);
  const [questionBank, setQuestionBank] = useState(mockQuestionBank);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Configurações gerais
  const [generalConfig, setGeneralConfig] = useState({
    questionCount: 20,
    duration: 30,
    maxAttempts: 3,
    passingScore: 70,
    autoGrade: true,
    shuffleQuestions: true,
    showFeedback: true,
    allowReview: true
  });

  // Novo questionário
  const [newQuestion, setNewQuestion] = useState({
    type: 'multiple_choice',
    question: '',
    alternatives: [
      { id: 1, text: '', correct: false },
      { id: 2, text: '', correct: false },
      { id: 3, text: '', correct: false },
      { id: 4, text: '', correct: false }
    ],
    weight: 10,
    feedback: '',
    category: '',
    difficulty: 'Intermediário',
    tags: '',
    imageUrl: ''
  });

  const questionTypes = [
    { value: 'multiple_choice', label: 'Múltipla Escolha', icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'true_false', label: 'Verdadeiro/Falso', icon: <X className="w-4 h-4" /> },
    { value: 'essay', label: 'Dissertativa', icon: <FileText className="w-4 h-4" /> },
    { value: 'image', label: 'Com Imagem', icon: <Image className="w-4 h-4" /> }
  ];

  const difficulties = ['Básico', 'Intermediário', 'Avançado'];
  const categories = ['Gestão da Qualidade', 'Análise de Dados', 'Auditoria', 'Gestão de Fornecedores', 'Gestão de Riscos'];

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setNewQuestion({
      type: 'multiple_choice',
      question: '',
      alternatives: [
        { id: 1, text: '', correct: false },
        { id: 2, text: '', correct: false },
        { id: 3, text: '', correct: false },
        { id: 4, text: '', correct: false }
      ],
      weight: 10,
      feedback: '',
      category: '',
      difficulty: 'Intermediário',
      tags: '',
      imageUrl: ''
    });
    setIsQuestionModalOpen(true);
  };

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
    setNewQuestion({
      type: question.type,
      question: question.question,
      alternatives: question.alternatives,
      weight: question.weight,
      feedback: question.feedback,
      category: question.category,
      difficulty: question.difficulty,
      tags: question.tags.join(', '),
      imageUrl: question.imageUrl || ''
    });
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = () => {
    if (editingQuestion) {
      // Editar questão existente
      const updatedQuestions = questions.map(q => 
        q.id === editingQuestion.id 
          ? { ...editingQuestion, ...newQuestion, tags: newQuestion.tags.split(',').map(tag => tag.trim()) }
          : q
      );
      setQuestions(updatedQuestions);
    } else {
      // Adicionar nova questão
      const newQuestionWithId = {
        ...newQuestion,
        id: Math.max(...questions.map(q => q.id)) + 1,
        tags: newQuestion.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      setQuestions([...questions, newQuestionWithId]);
    }
    setIsQuestionModalOpen(false);
  };

  const handleDeleteQuestion = (questionId: number) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleDuplicateQuestion = (question: any) => {
    const duplicatedQuestion = {
      ...question,
      id: Math.max(...questions.map(q => q.id)) + 1,
      question: `${question.question} (Cópia)`
    };
    setQuestions([...questions, duplicatedQuestion]);
  };

  const handleAddAlternative = () => {
    setNewQuestion(prev => ({
      ...prev,
      alternatives: [...prev.alternatives, { id: prev.alternatives.length + 1, text: '', correct: false }]
    }));
  };

  const handleRemoveAlternative = (index: number) => {
    setNewQuestion(prev => ({
      ...prev,
      alternatives: prev.alternatives.filter((_, i) => i !== index)
    }));
  };

  const handleAlternativeChange = (index: number, field: string, value: any) => {
    setNewQuestion(prev => ({
      ...prev,
      alternatives: prev.alternatives.map((alt, i) => 
        i === index ? { ...alt, [field]: value } : alt
      )
    }));
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || !selectedCategory || q.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || !selectedDifficulty || q.difficulty === selectedDifficulty;
    const matchesType = selectedType === 'all' || !selectedType || q.type === selectedType;
    return matchesSearch && matchesCategory && matchesDifficulty && matchesType;
  });

  const filteredQuestionBank = questionBank.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || !selectedCategory || q.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || !selectedDifficulty || q.difficulty === selectedDifficulty;
    const matchesType = selectedType === 'all' || !selectedType || q.type === selectedType;
    return matchesSearch && matchesCategory && matchesDifficulty && matchesType;
  });

  const getQuestionTypeLabel = (type: string) => {
    return questionTypes.find(t => t.value === type)?.label || type;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Básico': return 'bg-green-100 text-green-700';
      case 'Intermediário': return 'bg-yellow-100 text-yellow-700';
      case 'Avançado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Configurar Testes</h2>
          <p className="text-slate-600 mt-1">Configure testes e questões para seus treinamentos</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Configurações Gerais</TabsTrigger>
          <TabsTrigger value="questions">Criador de Questões</TabsTrigger>
          <TabsTrigger value="bank">Banco de Questões</TabsTrigger>
        </TabsList>

        {/* Configurações Gerais */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Configurações Gerais do Teste</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="training">Treinamento Associado</Label>
                    <Select value={selectedTraining} onValueChange={setSelectedTraining}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um treinamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockTrainings.map(training => (
                          <SelectItem key={training.id} value={training.id.toString()}>
                            {training.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="questionCount">Quantidade de Questões</Label>
                    <Input
                      id="questionCount"
                      type="number"
                      value={generalConfig.questionCount}
                      onChange={(e) => setGeneralConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                      min="1"
                      max="100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração (minutos)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={generalConfig.duration}
                      onChange={(e) => setGeneralConfig(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      min="5"
                      max="180"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxAttempts">Tentativas Permitidas</Label>
                    <Input
                      id="maxAttempts"
                      type="number"
                      value={generalConfig.maxAttempts}
                      onChange={(e) => setGeneralConfig(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) }))}
                      min="1"
                      max="5"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="passingScore">Nota Mínima para Aprovação (%)</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      value={generalConfig.passingScore}
                      onChange={(e) => setGeneralConfig(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                      min="50"
                      max="100"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="autoGrade"
                        checked={generalConfig.autoGrade}
                        onCheckedChange={(checked) => setGeneralConfig(prev => ({ ...prev, autoGrade: checked }))}
                      />
                      <Label htmlFor="autoGrade">Correção Automática</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="shuffleQuestions"
                        checked={generalConfig.shuffleQuestions}
                        onCheckedChange={(checked) => setGeneralConfig(prev => ({ ...prev, shuffleQuestions: checked }))}
                      />
                      <Label htmlFor="shuffleQuestions">Embaralhar Questões</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="showFeedback"
                        checked={generalConfig.showFeedback}
                        onCheckedChange={(checked) => setGeneralConfig(prev => ({ ...prev, showFeedback: checked }))}
                      />
                      <Label htmlFor="showFeedback">Mostrar Feedback</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allowReview"
                        checked={generalConfig.allowReview}
                        onCheckedChange={(checked) => setGeneralConfig(prev => ({ ...prev, allowReview: checked }))}
                      />
                      <Label htmlFor="allowReview">Permitir Revisão</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
                <Button variant="outline">Cancelar</Button>
                <Button>Salvar Configurações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Criador de Questões */}
        <TabsContent value="questions" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Questões do Teste</h3>
              <p className="text-sm text-slate-600">Gerencie as questões do teste selecionado</p>
            </div>
            <Button onClick={handleAddQuestion} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Nova Questão</span>
            </Button>
          </div>

          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar questões..."
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

                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as dificuldades</SelectItem>
                    {difficulties.map(difficulty => (
                      <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {questionTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Questões */}
          <div className="space-y-4">
            {filteredQuestions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                                                 <div className="flex items-center space-x-3">
                           <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
                          <Badge variant="outline" className="text-xs">
                            {getQuestionTypeLabel(question.type)}
                          </Badge>
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Peso: {question.weight}
                          </Badge>
                        </div>
                        
                        <div>
                          <p className="font-medium text-slate-900 mb-2">{question.question}</p>
                          {question.type === 'multiple_choice' && (
                            <div className="space-y-1">
                              {question.alternatives.map((alt, altIndex) => (
                                <div key={alt.id} className="flex items-center space-x-2 text-sm">
                                  <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">
                                    {String.fromCharCode(65 + altIndex)}
                                  </span>
                                  <span className={alt.correct ? "text-green-600 font-medium" : "text-slate-600"}>
                                    {alt.text}
                                  </span>
                                  {alt.correct && <CheckCircle className="w-4 h-4 text-green-600" />}
                                </div>
                              ))}
                            </div>
                          )}
                          {question.type === 'true_false' && (
                            <div className="space-y-1">
                              {question.alternatives.map((alt, altIndex) => (
                                <div key={alt.id} className="flex items-center space-x-2 text-sm">
                                  <span className={alt.correct ? "text-green-600 font-medium" : "text-slate-600"}>
                                    {alt.text}
                                  </span>
                                  {alt.correct && <CheckCircle className="w-4 h-4 text-green-600" />}
                                </div>
                              ))}
                            </div>
                          )}
                          {question.type === 'essay' && (
                            <p className="text-sm text-slate-500 italic">Questão dissertativa</p>
                          )}
                                                     {question.type === 'image' && (question as any).imageUrl && (
                             <img src={(question as any).imageUrl} alt="Questão" className="w-32 h-20 object-cover rounded mt-2" />
                           )}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {question.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditQuestion(question)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicateQuestion(question)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredQuestions.length === 0 && (
                         <div className="text-center py-12">
               <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
               <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma questão encontrada</h3>
               <p className="text-slate-600">Crie sua primeira questão ou ajuste os filtros.</p>
             </div>
          )}
        </TabsContent>

        {/* Banco de Questões */}
        <TabsContent value="bank" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Banco de Questões</h3>
              <p className="text-sm text-slate-600">Biblioteca com todas as questões criadas</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Importar</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </Button>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                                 <div className="flex items-center space-x-3">
                   <div className="p-2 bg-blue-100 rounded-lg">
                     <HelpCircle className="w-6 h-6 text-blue-600" />
                   </div>
                  <div>
                    <p className="text-sm text-slate-600">Total de Questões</p>
                    <p className="text-2xl font-bold text-slate-900">{questionBank.length}</p>
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
                    <p className="text-sm text-slate-600">Múltipla Escolha</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {questionBank.filter(q => q.type === 'multiple_choice').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FileText className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Dissertativas</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {questionBank.filter(q => q.type === 'essay').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Image className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Com Imagem</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {questionBank.filter(q => q.type === 'image').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista do Banco */}
          <div className="space-y-4">
            {filteredQuestionBank.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="text-xs">
                            {getQuestionTypeLabel(question.type)}
                          </Badge>
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {question.category}
                          </Badge>
                        </div>
                        
                        <div>
                          <p className="font-medium text-slate-900 mb-2">{question.question}</p>
                          {question.type === 'multiple_choice' && (
                            <div className="space-y-1">
                              {question.alternatives.slice(0, 2).map((alt, altIndex) => (
                                <div key={alt.id} className="flex items-center space-x-2 text-sm">
                                  <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">
                                    {String.fromCharCode(65 + altIndex)}
                                  </span>
                                  <span className={alt.correct ? "text-green-600 font-medium" : "text-slate-600"}>
                                    {alt.text}
                                  </span>
                                  {alt.correct && <CheckCircle className="w-4 h-4 text-green-600" />}
                                </div>
                              ))}
                              {question.alternatives.length > 2 && (
                                <p className="text-xs text-slate-500">
                                  +{question.alternatives.length - 2} alternativas
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {question.tags.slice(0, 3).map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {question.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{question.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditQuestion(question)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicateQuestion(question)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Questão */}
      <Dialog open={isQuestionModalOpen} onOpenChange={setIsQuestionModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Editar Questão' : 'Nova Questão'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="questionType">Tipo de Questão</Label>
                <Select value={newQuestion.type} onValueChange={(value) => setNewQuestion(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          {type.icon}
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Dificuldade</Label>
                <Select value={newQuestion.difficulty} onValueChange={(value) => setNewQuestion(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map(difficulty => (
                      <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question">Enunciado da Questão *</Label>
              <Textarea
                id="question"
                value={newQuestion.question}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Digite o enunciado da questão..."
                rows={3}
              />
            </div>

            {newQuestion.type === 'image' && (
              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL da Imagem</Label>
                <Input
                  id="imageUrl"
                  value={newQuestion.imageUrl}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
            )}

            {(newQuestion.type === 'multiple_choice' || newQuestion.type === 'true_false' || newQuestion.type === 'image') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Alternativas</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddAlternative}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Alternativa
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {newQuestion.alternatives.map((alt, index) => (
                    <div key={alt.id} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="correct"
                        checked={alt.correct}
                        onChange={() => {
                          setNewQuestion(prev => ({
                            ...prev,
                            alternatives: prev.alternatives.map((a, i) => ({
                              ...a,
                              correct: i === index
                            }))
                          }));
                        }}
                      />
                      <Input
                        value={alt.text}
                        onChange={(e) => handleAlternativeChange(index, 'text', e.target.value)}
                        placeholder={`Alternativa ${index + 1}`}
                      />
                      {newQuestion.alternatives.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAlternative(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Peso da Questão</Label>
                <Input
                  id="weight"
                  type="number"
                  value={newQuestion.weight}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, weight: parseInt(e.target.value) }))}
                  min="1"
                  max="20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={newQuestion.category} onValueChange={(value) => setNewQuestion(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback (Opcional)</Label>
              <Textarea
                id="feedback"
                value={newQuestion.feedback}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, feedback: e.target.value }))}
                placeholder="Feedback que será mostrado após responder a questão..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <Input
                id="tags"
                value={newQuestion.tags}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="Ex: ISO 9001, Qualidade, Auditoria"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={() => setIsQuestionModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveQuestion}>
              {editingQuestion ? 'Atualizar Questão' : 'Criar Questão'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

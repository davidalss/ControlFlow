import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  Star, 
  HelpCircle, 
  Package,
  Tag,
  Palette,
  Settings,
  FileText,
  AlertCircle,
  Info,
  Zap,
  Layers,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { InspectionField, InspectionStep } from '@/hooks/use-inspection-plans';
import { STANDARD_QUESTIONS } from '@/hooks/use-inspection-plans';

interface QuestionManagerProps {
  questions: InspectionField[];
  onQuestionsChange: (questions: InspectionField[]) => void;
  steps: InspectionStep[];
  onStepsChange: (steps: InspectionStep[]) => void;
  onAddToStep?: (question: InspectionField) => void;
}

// Agrupar perguntas por categoria
const QUESTIONS_BY_CATEGORY = STANDARD_QUESTIONS.reduce((acc, question) => {
  const category = question.category || 'Outros';
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(question);
  return acc;
}, {} as Record<string, typeof STANDARD_QUESTIONS>);

export default function QuestionManager({ questions, onQuestionsChange, steps, onStepsChange, onAddToStep }: QuestionManagerProps) {
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Função para adicionar pergunta padrão
  const addStandardQuestion = (questionInfo: typeof STANDARD_QUESTIONS[0]) => {
    const newQuestion: InspectionField = {
      id: `question-${Date.now()}-${questionInfo.id}`,
      name: questionInfo.name,
      type: 'question',
      required: true,
      description: questionInfo.description,
      questionConfig: {
        questionType: questionInfo.type,
        options: questionInfo.type === 'scale_1_5' 
          ? ['1 - Muito Ruim', '2 - Ruim', '3 - Regular', '4 - Bom', '5 - Excelente']
          : questionInfo.type === 'yes_no'
          ? ['Sim', 'Não']
          : undefined
      }
    };
    
    // Adicionar pergunta à lista
    onQuestionsChange([...questions, newQuestion]);
    
    // Adicionar também à etapa se a função estiver disponível
    if (onAddToStep) {
      onAddToStep(newQuestion);
    }
  };

  // Função para remover pergunta
  const removeQuestion = (questionId: string) => {
    onQuestionsChange(questions.filter(question => question.id !== questionId));
    
    // Remover também das etapas
    const updatedSteps = steps.map(step => ({
      ...step,
      fields: step.fields.filter(field => field.id !== questionId)
    }));
    onStepsChange(updatedSteps);
  };

  // Função para atualizar configuração da pergunta
  const updateQuestionConfig = (questionId: string, updates: Partial<InspectionField>) => {
    onQuestionsChange(questions.map(question => 
      question.id === questionId 
        ? { ...question, ...updates }
        : question
    ));
    
    // Atualizar também nas etapas
    const updatedSteps = steps.map(step => ({
      ...step,
      fields: step.fields.map(field => 
        field.id === questionId 
          ? { ...field, ...updates }
          : field
      )
    }));
    onStepsChange(updatedSteps);
  };

  // Função para obter ícone do tipo de pergunta
  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'yes_no': return <CheckCircle className="w-4 h-4" />;
      case 'scale_1_5': return <Star className="w-4 h-4" />;
      case 'text': return <Edit className="w-4 h-4" />;
      case 'multiple_choice': return <HelpCircle className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  // Função para obter texto do tipo de pergunta
  const getQuestionTypeText = (type: string) => {
    switch (type) {
      case 'yes_no': return 'Sim/Não';
      case 'scale_1_5': return 'Escala 1-5';
      case 'text': return 'Texto';
      case 'multiple_choice': return 'Múltipla Escolha';
      default: return 'Texto';
    }
  };

  // Função para obter ícone da categoria
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Embalagem': return <Package className="w-4 h-4" />;
      case 'Etiquetas': return <Tag className="w-4 h-4" />;
      case 'Impressão e Aparência': return <Palette className="w-4 h-4" />;
      case 'Produto e Componentes': return <Settings className="w-4 h-4" />;
      case 'Documentação': return <FileText className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const filteredQuestions = selectedCategory === 'all' 
    ? STANDARD_QUESTIONS 
    : QUESTIONS_BY_CATEGORY[selectedCategory] || [];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="predefined" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="predefined" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Perguntas Pré-definidas</span>
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>Perguntas Personalizadas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predefined" className="space-y-6">
          {/* Filtro por categoria */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Layers className="w-5 h-5" />
                <span>Filtrar por Categoria</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                  className="flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Todas</span>
                </Button>
                {Object.keys(QUESTIONS_BY_CATEGORY).map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="flex items-center space-x-2"
                  >
                    {getCategoryIcon(category)}
                    <span>{category}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lista de perguntas pré-definidas */}
          <div className="grid gap-4">
            {filteredQuestions.map((questionInfo) => {
              const isAdded = questions.some(q => q.name === questionInfo.name);
              
              return (
                <Card key={questionInfo.id} className={`transition-all ${isAdded ? 'bg-green-50 border-green-200' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getCategoryIcon(questionInfo.category)}
                          <div>
                            <h4 className="font-semibold text-gray-900">{questionInfo.name}</h4>
                            <p className="text-sm text-gray-600">{questionInfo.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className="text-xs">
                            {getQuestionTypeText(questionInfo.type)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {questionInfo.category}
                          </Badge>
                          {isAdded && (
                            <Badge variant="default" className="text-xs bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Adicionada
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!isAdded ? (
                          <Button
                            size="sm"
                            onClick={() => addStandardQuestion(questionInfo)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeQuestion(questions.find(q => q.name === questionInfo.name)?.id || '')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remover
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          {/* Lista de perguntas personalizadas */}
          <div className="space-y-4">
            {questions.filter(q => !STANDARD_QUESTIONS.some(sq => sq.name === q.name)).map((question) => (
              <Card key={question.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getQuestionTypeIcon(question.questionConfig?.questionType || 'text')}
                      <div>
                        <h4 className="font-semibold">{question.name}</h4>
                        <p className="text-sm text-gray-600">{question.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {getQuestionTypeText(question.questionConfig?.questionType || 'text')}
                      </Badge>
                      {question.required && (
                        <Badge variant="destructive" className="text-xs">
                          Obrigatória
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Resumo */}
      {questions.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2 text-blue-900">
              <Info className="w-5 h-5" />
              <span>Resumo das Perguntas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                <div className="text-sm text-blue-700">Total de Perguntas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {questions.filter(q => q.required).length}
                </div>
                <div className="text-sm text-green-700">Obrigatórias</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {steps.filter(step => step.fields.some(field => field.type === 'question')).length}
                </div>
                <div className="text-sm text-purple-700">Etapas com Perguntas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão para adicionar todas as perguntas à etapa gráfica */}
      {questions.length > 0 && onAddToStep && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Integração com Etapas</h4>
                <p className="text-sm text-gray-600">
                  Adicionar todas as perguntas à etapa "INSPEÇÃO MATERIAL GRÁFICO"
                </p>
              </div>
              <Button 
                onClick={() => {
                  questions.forEach(question => onAddToStep!(question));
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Todas à Etapa
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

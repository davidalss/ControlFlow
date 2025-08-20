import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Hash,
  Minus,
  Plus as PlusIcon,
  Settings,
  Info
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useQuestionRecipes, type QuestionRecipe, type CreateQuestionRecipeData } from '@/hooks/use-question-recipes';
import { type InspectionPlan, type InspectionStep } from '@/hooks/use-inspection-plans-simple';

interface QuestionRecipeManagerProps {
  plan: InspectionPlan;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuestionRecipeManager({
  plan,
  isOpen,
  onClose
}: QuestionRecipeManagerProps) {
  const { toast } = useToast();
  const { 
    recipes, 
    loading, 
    loadRecipesByPlan, 
    createRecipe, 
    updateRecipe, 
    deleteRecipe,
    createBulkRecipes 
  } = useQuestionRecipes();
  
  // Estados para criação/edição
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<QuestionRecipe | null>(null);
  
  // Estados do formulário
  const [formData, setFormData] = useState<CreateQuestionRecipeData>({
    planId: plan.id,
    questionId: '',
    questionName: '',
    questionType: 'number',
    defectType: 'MAIOR',
    isRequired: true
  });

  // Estados para valores numéricos
  const [minValue, setMinValue] = useState<string>('');
  const [maxValue, setMaxValue] = useState<string>('');
  const [expectedValue, setExpectedValue] = useState<string>('');
  const [tolerance, setTolerance] = useState<string>('');
  const [unit, setUnit] = useState<string>('');

  // Estados para opções
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState<string>('');

  // Estados para perguntas disponíveis
  const [availableQuestions, setAvailableQuestions] = useState<Array<{
    id: string;
    name: string;
    stepName: string;
  }>>([]);

  // Carregar receitas quando o modal abrir
  useEffect(() => {
    if (isOpen && plan.id) {
      loadRecipesByPlan(plan.id);
      extractAvailableQuestions();
    }
  }, [isOpen, plan.id]);

  // Extrair perguntas disponíveis do plano
  const extractAvailableQuestions = () => {
    const questions: Array<{ id: string; name: string; stepName: string }> = [];
    
    try {
      const steps = JSON.parse(plan.inspectionSteps || '[]') as InspectionStep[];
      
      steps.forEach(step => {
        step.questions?.forEach(question => {
          questions.push({
            id: question.id,
            name: question.name,
            stepName: step.name
          });
        });
      });
    } catch (error) {
      console.error('Erro ao extrair perguntas do plano:', error);
    }
    
    setAvailableQuestions(questions);
  };

  // Função para abrir modal de criação
  const handleCreate = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedRecipe(null);
    resetForm();
  };

  // Função para abrir modal de edição
  const handleEdit = (recipe: QuestionRecipe) => {
    setIsEditing(true);
    setIsCreating(false);
    setSelectedRecipe(recipe);
    
    // Preencher formulário com dados da receita
    setFormData({
      planId: recipe.planId,
      questionId: recipe.questionId,
      questionName: recipe.questionName,
      questionType: recipe.questionType,
      defectType: recipe.defectType,
      isRequired: recipe.isRequired,
      description: recipe.description
    });
    
    setMinValue(recipe.minValue?.toString() || '');
    setMaxValue(recipe.maxValue?.toString() || '');
    setExpectedValue(recipe.expectedValue || '');
    setTolerance(recipe.tolerance?.toString() || '');
    setUnit(recipe.unit || '');
    setOptions(recipe.options || []);
  };

  // Função para resetar formulário
  const resetForm = () => {
    setFormData({
      planId: plan.id,
      questionId: '',
      questionName: '',
      questionType: 'number',
      defectType: 'MAIOR',
      isRequired: true
    });
    setMinValue('');
    setMaxValue('');
    setExpectedValue('');
    setTolerance('');
    setUnit('');
    setOptions([]);
    setNewOption('');
  };

  // Função para adicionar opção
  const addOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions(prev => [...prev, newOption.trim()]);
      setNewOption('');
    }
  };

  // Função para remover opção
  const removeOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  // Função para selecionar pergunta
  const handleQuestionSelect = (questionId: string) => {
    const question = availableQuestions.find(q => q.id === questionId);
    if (question) {
      setFormData(prev => ({
        ...prev,
        questionId,
        questionName: question.name
      }));
    }
  };

  // Função para salvar receita
  const handleSave = async () => {
    try {
      // Validar dados obrigatórios
      if (!formData.questionId || !formData.questionName) {
        toast({
          title: "Erro",
          description: "Selecione uma pergunta",
          variant: "destructive"
        });
        return;
      }

      // Preparar dados para envio
      const recipeData: CreateQuestionRecipeData = {
        ...formData,
        minValue: minValue ? parseFloat(minValue) : undefined,
        maxValue: maxValue ? parseFloat(maxValue) : undefined,
        expectedValue: expectedValue || undefined,
        tolerance: tolerance ? parseFloat(tolerance) : undefined,
        unit: unit || undefined,
        options: options.length > 0 ? options : undefined
      };

      if (isEditing && selectedRecipe) {
        await updateRecipe(selectedRecipe.id, recipeData);
      } else {
        await createRecipe(recipeData);
      }

      setIsCreating(false);
      setIsEditing(false);
      setSelectedRecipe(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
    }
  };

  // Função para excluir receita
  const handleDelete = async (recipeId: string) => {
    try {
      await deleteRecipe(recipeId);
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
    }
  };

  // Função para criar receitas em lote baseadas nas perguntas do plano
  const handleCreateBulkFromPlan = async () => {
    try {
      const recipesToCreate: CreateQuestionRecipeData[] = availableQuestions.map(question => ({
        planId: plan.id,
        questionId: question.id,
        questionName: question.name,
        questionType: 'ok_nok', // Tipo padrão
        defectType: 'MAIOR', // Defeito padrão
        isRequired: true
      }));

      await createBulkRecipes(plan.id, recipesToCreate);
    } catch (error) {
      console.error('Erro ao criar receitas em lote:', error);
    }
  };

  const getDefectTypeColor = (defectType: string) => {
    switch (defectType) {
      case 'CRÍTICO': return 'bg-red-100 text-red-800';
      case 'MAIOR': return 'bg-orange-100 text-orange-800';
      case 'MENOR': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'number': 'Número',
      'text': 'Texto',
      'yes_no': 'Sim/Não',
      'ok_nok': 'OK/NOK',
      'scale_1_5': 'Escala 1-5',
      'scale_1_10': 'Escala 1-10',
      'multiple_choice': 'Múltipla Escolha',
      'true_false': 'Verdadeiro/Falso',
      'checklist': 'Lista de Verificação',
      'photo': 'Foto'
    };
    return labels[type] || type;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Gerenciar Receitas de Perguntas</span>
            </DialogTitle>
            <DialogDescription>
              Configure as receitas (critérios de aceitação) para as perguntas do plano "{plan.planName}"
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col min-h-0">
            {/* Header com ações */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-medium">Receitas Configuradas</h3>
                <p className="text-sm text-gray-600">
                  {recipes.length} receita{recipes.length !== 1 ? 's' : ''} configurada{recipes.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCreateBulkFromPlan}
                  disabled={loading || availableQuestions.length === 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar do Plano
                </Button>
                <Button onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Receita
                </Button>
              </div>
            </div>

            {/* Lista de receitas */}
            <ScrollArea className="flex-1 p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Carregando receitas...</span>
                </div>
              ) : recipes.length === 0 ? (
                <div className="text-center py-12">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma receita configurada
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Configure receitas para definir critérios de aceitação das perguntas
                  </p>
                  <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Receita
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recipes.map((recipe) => (
                    <Card key={recipe.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium">{recipe.questionName}</h4>
                              <Badge variant="outline" className="text-xs">
                                {getQuestionTypeLabel(recipe.questionType)}
                              </Badge>
                              <Badge className={`text-xs ${getDefectTypeColor(recipe.defectType)}`}>
                                {recipe.defectType}
                              </Badge>
                              {recipe.isRequired && (
                                <Badge className="bg-red-100 text-red-800 text-xs">
                                  Obrigatória
                                </Badge>
                              )}
                            </div>
                            
                            {/* Critérios específicos */}
                            {recipe.questionType === 'number' && (
                              <div className="text-sm text-gray-600 space-y-1">
                                {recipe.minValue !== undefined && (
                                  <div>Mínimo: {recipe.minValue}{recipe.unit ? ` ${recipe.unit}` : ''}</div>
                                )}
                                {recipe.maxValue !== undefined && (
                                  <div>Máximo: {recipe.maxValue}{recipe.unit ? ` ${recipe.unit}` : ''}</div>
                                )}
                                {recipe.expectedValue && (
                                  <div>Esperado: {recipe.expectedValue}{recipe.unit ? ` ${recipe.unit}` : ''}</div>
                                )}
                                {recipe.tolerance !== undefined && (
                                  <div>Tolerância: ±{recipe.tolerance}{recipe.unit ? ` ${recipe.unit}` : ''}</div>
                                )}
                              </div>
                            )}
                            
                            {recipe.options && recipe.options.length > 0 && (
                              <div className="text-sm text-gray-600 mt-2">
                                <div>Opções: {recipe.options.join(', ')}</div>
                              </div>
                            )}
                            
                            {recipe.description && (
                              <div className="text-sm text-gray-600 mt-2">
                                {recipe.description}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(recipe)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(recipe.id)}
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
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de criação/edição */}
      <Dialog open={isCreating || isEditing} onOpenChange={() => {
        setIsCreating(false);
        setIsEditing(false);
        setSelectedRecipe(null);
        resetForm();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {isEditing ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              <span>{isEditing ? 'Editar' : 'Nova'} Receita de Pergunta</span>
            </DialogTitle>
            <DialogDescription>
              Configure os critérios de aceitação para a pergunta selecionada
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Seleção da pergunta */}
            <div>
              <Label htmlFor="question">Pergunta *</Label>
              <Select 
                value={formData.questionId} 
                onValueChange={handleQuestionSelect}
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma pergunta" />
                </SelectTrigger>
                <SelectContent>
                  {availableQuestions.map((question) => (
                    <SelectItem key={question.id} value={question.id}>
                      <div>
                        <div className="font-medium">{question.name}</div>
                        <div className="text-xs text-gray-500">{question.stepName}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de pergunta */}
            <div>
              <Label htmlFor="questionType">Tipo de Pergunta</Label>
              <Select 
                value={formData.questionType} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, questionType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">Número</SelectItem>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="yes_no">Sim/Não</SelectItem>
                  <SelectItem value="ok_nok">OK/NOK</SelectItem>
                  <SelectItem value="scale_1_5">Escala 1-5</SelectItem>
                  <SelectItem value="scale_1_10">Escala 1-10</SelectItem>
                  <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                  <SelectItem value="true_false">Verdadeiro/Falso</SelectItem>
                  <SelectItem value="checklist">Lista de Verificação</SelectItem>
                  <SelectItem value="photo">Foto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Critérios para perguntas numéricas */}
            {formData.questionType === 'number' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Critérios Numéricos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minValue">Valor Mínimo</Label>
                      <Input
                        id="minValue"
                        type="number"
                        placeholder="Ex: 110"
                        value={minValue}
                        onChange={(e) => setMinValue(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxValue">Valor Máximo</Label>
                      <Input
                        id="maxValue"
                        type="number"
                        placeholder="Ex: 128"
                        value={maxValue}
                        onChange={(e) => setMaxValue(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expectedValue">Valor Esperado</Label>
                      <Input
                        id="expectedValue"
                        type="number"
                        placeholder="Ex: 120"
                        value={expectedValue}
                        onChange={(e) => setExpectedValue(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tolerance">Tolerância (±)</Label>
                      <Input
                        id="tolerance"
                        type="number"
                        placeholder="Ex: 5"
                        value={tolerance}
                        onChange={(e) => setTolerance(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="unit">Unidade</Label>
                    <Input
                      id="unit"
                      placeholder="Ex: V, A, mm, kg"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Opções para múltipla escolha */}
            {(formData.questionType === 'multiple_choice' || formData.questionType === 'checklist') && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Opções de Resposta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...options];
                            newOptions[index] = e.target.value;
                            setOptions(newOptions);
                          }}
                          placeholder="Digite a opção..."
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Nova opção..."
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addOption()}
                    />
                    <Button size="sm" onClick={addOption} disabled={!newOption.trim()}>
                      <PlusIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tipo de defeito */}
            <div>
              <Label htmlFor="defectType">Tipo de Defeito *</Label>
              <Select 
                value={formData.defectType} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, defectType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MENOR">MENOR</SelectItem>
                  <SelectItem value="MAIOR">MAIOR</SelectItem>
                  <SelectItem value="CRÍTICO">CRÍTICO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descrição adicional da receita..."
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Obrigatória */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isRequired" 
                checked={formData.isRequired}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRequired: checked as boolean }))}
              />
              <Label htmlFor="isRequired">Pergunta obrigatória</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreating(false);
              setIsEditing(false);
              setSelectedRecipe(null);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Atualizar' : 'Criar'} Receita
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

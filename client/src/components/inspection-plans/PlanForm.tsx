import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save,
  ChevronUp,
  GripVertical,
  Camera,
  FileText,
  CheckSquare,
  BarChart3,
  Upload,
  Download,
  Settings,
  Users,
  Shield,
  Calendar,
  Tag,
  Info,
  AlertCircle,
  Layers,
  Eye,
  Search,
  Zap,
  HelpCircle,
  ExternalLink,
  ChevronDown
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
import FieldEditor from './FieldEditor';
import LabelManager from './LabelManager';
import QuestionManager from './QuestionManager';
import StepManager from './StepManager';
import type { InspectionField, InspectionStep, InspectionPlan } from '@/hooks/use-inspection-plans';
import { useProducts } from '@/hooks/use-products';

interface PlanFormProps {
  plan?: InspectionPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: Omit<InspectionPlan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  isLoading?: boolean;
}

export default function PlanForm({ plan, isOpen, onClose, onSave, isLoading }: PlanFormProps) {
  const { toast } = useToast();
  const { products, loading: productsLoading } = useProducts();
  const [productSearch, setProductSearch] = useState('');
  const [formData, setFormData] = useState<Omit<InspectionPlan, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    productId: '',
    productName: '',
    products: [], // Array para múltiplos produtos
    revision: 1,
    validUntil: new Date(),
    status: 'draft',
    steps: [],
    createdBy: '',
    updatedBy: '',
    tags: [],
    efficiency: {
      avgInspectionTime: 0,
      rejectionRate: 0,
      topRejectionCauses: []
    },
    accessControl: {
      roles: ['inspector'],
      permissions: {
        view: ['inspector'],
        edit: ['technician'],
        delete: ['engineer'],
        execute: ['inspector', 'assistant'],
        approve: ['technician', 'engineer', 'supervisor']
      }
    }
  });


  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [currentField, setCurrentField] = useState<InspectionField | null>(null);
  const [currentStepId, setCurrentStepId] = useState<string>('');
  const [isProductSelectOpen, setIsProductSelectOpen] = useState(false);
  const [labels, setLabels] = useState<InspectionField[]>([]);
  const [questions, setQuestions] = useState<InspectionField[]>([]);

  // Função para adicionar etiqueta à etapa gráfica
  const addLabelToGraphicStep = (label: InspectionField) => {
    const graphicStep = formData.steps.find(step => step.name === 'INSPEÇÃO MATERIAL GRÁFICO');
    if (graphicStep) {
      setFormData(prev => ({
        ...prev,
        steps: prev.steps.map(step => 
          step.id === graphicStep.id 
            ? { ...step, fields: [...step.fields, label] }
            : step
        )
      }));
      toast({
        title: "Etiqueta adicionada!",
        description: "Etiqueta foi adicionada à etapa de inspeção gráfica.",
      });
    } else {
      toast({
        title: "Atenção!",
        description: "Crie primeiro a etapa 'INSPEÇÃO MATERIAL GRÁFICO' para adicionar etiquetas.",
        variant: "destructive",
      });
    }
  };

  // Função para adicionar pergunta à etapa gráfica
  const addQuestionToGraphicStep = (question: InspectionField) => {
    const graphicStep = formData.steps.find(step => step.name === 'INSPEÇÃO MATERIAL GRÁFICO');
    if (graphicStep) {
      setFormData(prev => ({
        ...prev,
        steps: prev.steps.map(step => 
          step.id === graphicStep.id 
            ? { ...step, fields: [...step.fields, question] }
            : step
        )
      }));
      toast({
        title: "Pergunta adicionada!",
        description: "Pergunta foi adicionada à etapa de inspeção gráfica.",
      });
    } else {
      toast({
        title: "Atenção!",
        description: "Crie primeiro a etapa 'INSPEÇÃO MATERIAL GRÁFICO' para adicionar perguntas.",
        variant: "destructive",
      });
    }
  };

  // Função para obter ícone do tipo de campo
  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return FileText;
      case 'number': return BarChart3;
      case 'select': return ChevronDown;
      case 'checkbox': return CheckSquare;
      case 'photo': return Camera;
      case 'file': return Upload;
      case 'textarea': return FileText;
      case 'label': return Tag;
      case 'question': return HelpCircle;
      default: return FileText;
    }
  };

  // Função para adicionar campo a uma etapa
  const addField = (stepId: string) => {
    // Verificar se existe etapa de material gráfico
    const graphicStep = formData.steps.find(step => step.name === 'INSPEÇÃO MATERIAL GRÁFICO');
    
    // Se existe etapa gráfica e não estamos nela, redirecionar para ela
    if (graphicStep && stepId !== graphicStep.id) {
      setCurrentStepId(graphicStep.id);
      setCurrentField(null);
      setShowFieldEditor(true);
    } else {
      setCurrentStepId(stepId);
      setCurrentField(null);
      setShowFieldEditor(true);
    }
  };

  // Função para editar campo existente
  const editField = (stepId: string, field: InspectionField) => {
    setCurrentStepId(stepId);
    setCurrentField(field);
    setShowFieldEditor(true);
  };

  // Função para atualizar campo
  const updateField = (stepId: string, fieldId: string, updatedField: InspectionField) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId 
          ? { 
              ...step, 
              fields: step.fields.map(field => 
                field.id === fieldId ? updatedField : field
              )
            }
          : step
      )
    }));
  };

  // Função para remover campo
  const removeField = (stepId: string, fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId 
          ? { 
              ...step, 
              fields: step.fields.filter(field => field.id !== fieldId)
            }
          : step
      )
    }));
  };

  const handleFieldSave = (field: InspectionField) => {
    if (currentStepId) {
      if (currentField) {
        // Editando campo existente
        updateField(currentStepId, field.id, field);
      } else {
        // Adicionando novo campo
        setFormData(prev => ({
          ...prev,
          steps: prev.steps.map(step => 
            step.id === currentStepId 
              ? { ...step, fields: [...step.fields, field] }
              : step
          )
        }));
      }
    }
    setShowFieldEditor(false);
    setCurrentField(null);
    setCurrentStepId('');
  };

  useEffect(() => {
    if (plan) {
      setFormData({
        ...plan,
        validUntil: new Date(plan.validUntil)
      });
    } else {
      setFormData({
        name: '',
        productId: '',
        productName: '',
        products: [],
        revision: 1,
        validUntil: new Date(),
        status: 'draft',
        steps: [],
        createdBy: '',
        updatedBy: '',
        tags: [],
        efficiency: {
          avgInspectionTime: 0,
          rejectionRate: 0,
          topRejectionCauses: []
        },
        accessControl: {
          roles: ['inspector'],
          permissions: {
            view: ['inspector'],
            edit: ['technician'],
            delete: ['engineer'],
            execute: ['inspector', 'assistant'],
            approve: ['technician', 'engineer', 'supervisor']
          }
        }
      });
    }
  }, [plan]);

  // Função utilitária para obter voltagem com fallback seguro
  const getVoltage = useCallback((product: any) => {
    return product?.technicalParameters?.voltagem ? formatVoltage(product.technicalParameters.voltagem) || 'N/A' : 'N/A';
  }, []);

  // Função para formatar voltagem
  const formatVoltage = useCallback((voltage: string | undefined) => {
    if (!voltage) return null;
    
    // Se contém múltiplas voltagens (ex: "127V/220V" ou "110V-220V")
    if (voltage.includes('/') || voltage.includes('-') || voltage.includes(',')) {
      return voltage.split(/[\/\-,]/).map(v => v.trim()).join(' / ');
    }
    
    return voltage;
  }, []);

  // Função para gerar nome do plano baseado nos produtos selecionados
  const generatePlanName = useCallback(() => {
    if (formData.products.length === 0) return '';
    
    const baseProduct = formData.products[0];
    const voltages = formData.products.map(p => p.voltage).filter(v => v !== 'N/A');
    
    if (formData.products.length === 1) {
      return `PLANO DE INSPEÇÃO - ${baseProduct.description}`;
    } else {
      const voltageText = voltages.length > 0 ? ` (${voltages.join(' / ')})` : '';
      return `PLANO DE INSPEÇÃO - ${baseProduct.description}${voltageText}`;
    }
  }, [formData.products]);

  // Atualizar nome do plano quando produtos mudarem
  useEffect(() => {
    if (formData.products.length > 0) {
      const newName = generatePlanName();
      setFormData(prev => ({ ...prev, name: newName }));
    }
  }, [formData.products, generatePlanName]);

  // Usar useMemo para produtos filtrados
  const filteredProducts = useMemo(() => {
    if (!productSearch) return products;
    const searchLower = productSearch.toLowerCase();
    return products.filter(product =>
      (product.code?.toLowerCase() || '').includes(searchLower) ||
      (product.description?.toLowerCase() || '').includes(searchLower)
    );
  }, [products, productSearch]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };



  // Função para adicionar produto à lista de produtos do plano
  const addProductToPlan = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct && !formData.products.find(p => p.id === productId)) {
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, {
          id: selectedProduct.id,
          code: selectedProduct.code,
          description: selectedProduct.description,
          voltage: getVoltage(selectedProduct)
        }]
      }));
    }
  };

  // Função para remover produto da lista
  const removeProductFromPlan = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId)
    }));
  };





  const handleSave = async () => {
    try {
      await onSave(formData);
      onClose();
      toast({
        title: "Sucesso!",
        description: "Plano de inspeção salvo com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast({
        title: "Erro!",
        description: "Erro ao salvar o plano de inspeção.",
        variant: "destructive",
      });
    }
  };



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh] flex flex-col p-0 modal-responsive overflow-hidden">
        <DialogHeader className="p-6 pb-4 shrink-0 modal-header">
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>{plan ? 'Editar Plano de Inspeção' : 'Criar Novo Plano de Inspeção'}</span>
          </DialogTitle>
          <DialogDescription>
            Configure todos os detalhes do plano de inspeção incluindo etapas, campos e permissões
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <Tabs defaultValue="basic" className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 shrink-0 mx-6 mb-4 tabs-list">
               <TabsTrigger value="basic" className="flex items-center space-x-2 text-xs md:text-sm">
                 <Info className="w-3 h-3 md:w-4 md:h-4" />
                 <span className="hidden sm:inline">Básico</span>
                 <span className="sm:hidden">Básico</span>
               </TabsTrigger>
               <TabsTrigger value="labels" className="flex items-center space-x-2 text-xs md:text-sm">
                 <Tag className="w-3 h-3 md:w-4 md:h-4" />
                 <span className="hidden sm:inline">Etiquetas</span>
                 <span className="sm:hidden">Etiquetas</span>
               </TabsTrigger>
               <TabsTrigger value="questions" className="flex items-center space-x-2 text-xs md:text-sm">
                 <HelpCircle className="w-3 h-3 md:w-4 md:h-4" />
                 <span className="hidden sm:inline">Perguntas</span>
                 <span className="sm:hidden">Perguntas</span>
               </TabsTrigger>
               <TabsTrigger value="steps" className="flex items-center space-x-2 text-xs md:text-sm">
                 <Layers className="w-3 h-3 md:w-4 md:h-4" />
                 <span className="hidden sm:inline">Etapas</span>
                 <span className="sm:hidden">Etapas</span>
               </TabsTrigger>
               <TabsTrigger value="fields" className="flex items-center space-x-2 text-xs md:text-sm">
                 <FileText className="w-3 h-3 md:w-4 md:h-4" />
                 <span className="hidden sm:inline">Campos</span>
                 <span className="sm:hidden">Campos</span>
               </TabsTrigger>
               <TabsTrigger value="access" className="flex items-center space-x-2 text-xs md:text-sm">
                 <Shield className="w-3 h-3 md:w-4 md:h-4" />
                 <span className="hidden sm:inline">Acesso</span>
                 <span className="sm:hidden">Acesso</span>
               </TabsTrigger>
               <TabsTrigger value="preview" className="flex items-center space-x-2 text-xs md:text-sm">
                 <Eye className="w-3 h-3 md:w-4 md:h-4" />
                 <span className="hidden sm:inline">Preview</span>
                 <span className="sm:hidden">Preview</span>
               </TabsTrigger>
             </TabsList>

            <div className="flex-1 overflow-hidden px-6 pb-6">
              <TabsContent value="basic" className="h-full m-0 tabs-content">
                <ScrollArea className="h-full scroll-area">
                  <div className="space-y-6 pb-6">
                  <Card className="modal-card">
                    <CardHeader className="modal-card-header">
                      <CardTitle className="flex items-center space-x-2">
                        <Info className="w-5 h-5" />
                        <span>Informações do Plano</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-sm font-medium">Nome do Plano *</Label>
                          <Input 
                            id="name" 
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Ex: Plano de Inspeção - Air Fryer Premium" 
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="product" className="text-sm font-medium">Produtos do Plano *</Label>
                          <div className="space-y-2">
                            {/* Lista de produtos selecionados */}
                            {formData.products.length > 0 && (
                              <div className="space-y-2">
                                {formData.products.map((product) => (
                                  <div key={product.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg product-card">
                                                                          <div className="flex items-center space-x-3 product-info">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <div>
                                          <div className="flex items-center space-x-2 product-badges">
                                          <span className="text-sm font-medium">{product.description}</span>
                                          {product.voltage !== 'N/A' && (
                                            <Badge variant="outline" className="text-xs">
                                              <Zap className="w-3 h-3 mr-1" />
                                                {product.voltage}
                                            </Badge>
                                          )}
                                        </div>
                                        <span className="text-xs text-gray-500">Código: {product.code}</span>
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeProductFromPlan(product.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Select para adicionar produtos */}
                            <Select 
                              onValueChange={addProductToPlan}
                              disabled={productsLoading}
                              open={isProductSelectOpen}
                              onOpenChange={(open) => {
                                setIsProductSelectOpen(open);
                                if (!open) {
                                  setProductSearch(''); // Limpar busca quando fechar
                                }
                              }}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder={productsLoading ? "Carregando produtos..." : "Adicionar produto ao plano"} />
                              </SelectTrigger>
                              <SelectContent className="max-h-[300px]">
                                {/* Campo de busca */}
                                <div className="p-2 border-b">
                                  <div className="relative">
                                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                      placeholder="Buscar por código ou nome..."
                                      value={productSearch}
                                      onChange={(e) => setProductSearch(e.target.value)}
                                      className="pl-8 h-8 text-sm"
                                    />
                                  </div>
                                </div>
                                
                                {/* Lista de produtos filtrados */}
                                <div className="max-h-[250px] overflow-y-auto">
                                  {filteredProducts.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-gray-500">
                                      {productSearch ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
                                    </div>
                                  ) : (
                                    filteredProducts
                                      .filter(product => !formData.products.find(p => p.id === product.id)) // Não mostrar produtos já adicionados
                                      .map((product) => (
                                        <SelectItem key={product.id} value={product.id} className="py-2">
                                          <div className="flex items-center justify-between w-full">
                                            <span className="font-medium">{product.description}</span>
                                            <span className="text-sm text-muted-foreground">{product.code}</span>
                                          </div>
                                        </SelectItem>
                                      ))
                                  )}
                                </div>
                                
                                {/* Contador de resultados */}
                                {productSearch && (
                                  <div className="p-2 border-t text-xs text-gray-500 text-center">
                                    {filteredProducts.filter(p => !formData.products.find(added => added.id === p.id)).length} produtos disponíveis
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Informações dos produtos selecionados */}
                      {formData.products.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-3">
                            <Info className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">
                              Produtos do Plano ({formData.products.length})
                            </span>
                          </div>
                          <div className="space-y-2">
                            {formData.products.map((product, index) => {
                              const fullProduct = products.find(p => p.id === product.id);
                              const weight = fullProduct?.technicalParameters?.peso_bruto;
                              const category = fullProduct?.category;
                              
                              return (
                                <div key={product.id} className="bg-white rounded p-2 border border-blue-100 product-card">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-blue-900">
                                      {index + 1}. {product.description}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {product.code}
                                    </Badge>
                                  </div>
                                                                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                    {product.voltage !== 'N/A' && (
                                      <div>
                                        <span className="text-blue-700 font-medium">Voltagem:</span>
                                        <div className="flex items-center space-x-1">
                                          <Zap className="w-3 h-3 text-blue-600" />
                                          <span>{product.voltage}</span>
                                        </div>
                                      </div>
                                    )}
                                    {weight && (
                                      <div>
                                        <span className="text-blue-700 font-medium">Peso:</span>
                                        <span>{weight} kg</span>
                                      </div>
                                    )}
                                    <div>
                                      <span className="text-blue-700 font-medium">Categoria:</span>
                                      <span>{category}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 form-grid-2">
                        <div>
                          <Label htmlFor="validity" className="text-sm font-medium">Data de Validade *</Label>
                          <Input 
                            id="validity" 
                            type="date"
                            value={formData.validUntil.toISOString().split('T')[0]}
                            onChange={(e) => handleInputChange('validUntil', new Date(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="status" className="text-sm font-medium">Status do Plano</Label>
                          <Select 
                            value={formData.status}
                            onValueChange={(value) => handleInputChange('status', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Rascunho</SelectItem>
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="archived">Arquivado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="tags" className="text-sm font-medium">Tags de Categorização</Label>
                        <Input 
                          id="tags" 
                          value={formData.tags.join(', ')}
                          onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(t => t.trim()))}
                          placeholder="Eletrônicos, Cozinha, Premium, Qualidade" 
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-sm font-medium">Descrição Detalhada</Label>
                        <Textarea 
                          id="description" 
                          placeholder="Descreva o objetivo, escopo e critérios específicos do plano de inspeção"
                          rows={4}
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
                         </TabsContent>

              <TabsContent value="labels" className="h-full m-0 tabs-content">
                <ScrollArea className="h-full scroll-area">
                  <div className="pb-6">
                   <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                     <div className="flex items-center space-x-2 mb-2">
                       <Info className="w-4 h-4 text-blue-600" />
                       <span className="font-medium text-blue-900">Etiquetas de Verificação</span>
                     </div>
                     <p className="text-sm text-blue-700">
                       As etiquetas criadas aqui serão automaticamente adicionadas à etapa "INSPEÇÃO MATERIAL GRÁFICO".
                     </p>
                   </div>
                   <LabelManager 
                     labels={labels}
                     onLabelsChange={setLabels}
                     onAddToStep={addLabelToGraphicStep}
                   />
                 </div>
               </ScrollArea>
             </TabsContent>

              <TabsContent value="questions" className="h-full m-0 tabs-content">
                <ScrollArea className="h-full scroll-area">
                  <div className="pb-6">
                   <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                     <div className="flex items-center space-x-2 mb-2">
                       <Info className="w-4 h-4 text-green-600" />
                       <span className="font-medium text-green-900">Perguntas de Verificação</span>
                     </div>
                     <p className="text-sm text-green-700">
                       As perguntas criadas aqui serão automaticamente adicionadas à etapa "INSPEÇÃO MATERIAL GRÁFICO".
                     </p>
                   </div>
                   <QuestionManager 
                     questions={questions}
                     onQuestionsChange={setQuestions}
                     steps={formData.steps}
                     onStepsChange={(steps) => setFormData(prev => ({ ...prev, steps }))}
                     onAddToStep={addQuestionToGraphicStep}
                   />
                 </div>
               </ScrollArea>
             </TabsContent>

              <TabsContent value="steps" className="h-full m-0 tabs-content">
                <ScrollArea className="h-full scroll-area">
                  <div className="pb-6">
                                     <StepManager 
                     steps={formData.steps}
                     onStepsChange={(steps) => setFormData(prev => ({ ...prev, steps }))}
                     onAddField={addField}
                     onEditField={editField}
                     onRemoveField={removeField}
                   />
                </div>
              </ScrollArea>
            </TabsContent>

              <TabsContent value="fields" className="h-full m-0 tabs-content">
                <ScrollArea className="h-full scroll-area">
                  <div className="pb-6">
                  <Card className="modal-card">
                    <CardHeader className="modal-card-header">
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>Configuração Avançada de Campos</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Editor de Campos Avançado
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Clique em "Editar" em qualquer campo para acessar configurações avançadas
                        </p>

                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

              <TabsContent value="access" className="h-full m-0 tabs-content">
                <ScrollArea className="h-full scroll-area">
                  <div className="space-y-6 pb-6">
                  <Card className="modal-card">
                    <CardHeader className="modal-card-header">
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="w-5 h-5" />
                        <span>Controle de Acesso e Permissões</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                                             <div>
                         <Label className="text-sm font-medium">Funções com Acesso</Label>
                         <div className="mt-2 space-y-2">
                           {[
                             { id: 'inspector', name: 'Inspetor', description: 'Pode visualizar e executar inspeções' },
                             { id: 'assistant', name: 'Assistente', description: 'Pode visualizar e executar inspeções' },
                             { id: 'technician', name: 'Técnico', description: 'Pode criar, editar e executar inspeções' },
                             { id: 'engineer', name: 'Engenheiro', description: 'Acesso completo ao sistema' },
                             { id: 'supervisor', name: 'Supervisor', description: 'Pode gerenciar planos e usuários' }
                           ].map((role) => (
                             <div key={role.id} className="flex items-center space-x-2">
                               <Checkbox
                                 id={role.id}
                                 checked={formData.accessControl.roles.includes(role.id)}
                                 onCheckedChange={(checked) => {
                                   const newRoles = checked 
                                     ? [...formData.accessControl.roles, role.id]
                                     : formData.accessControl.roles.filter(r => r !== role.id);
                                   handleInputChange('accessControl', {
                                     ...formData.accessControl,
                                     roles: newRoles
                                   });
                                 }}
                               />
                               <div className="flex-1">
                                 <Label htmlFor={role.id} className="text-sm font-medium">{role.name}</Label>
                                 <p className="text-xs text-gray-500">{role.description}</p>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>

                      <Separator />

                                             <div>
                         <Label className="text-sm font-medium">Permissões Específicas</Label>
                         <div className="mt-2 space-y-3">
                           {[
                             { key: 'view', name: 'Visualizar', description: 'Pode visualizar o plano' },
                             { key: 'edit', name: 'Editar', description: 'Pode modificar o plano' },
                             { key: 'delete', name: 'Excluir', description: 'Pode remover o plano' },
                             { key: 'execute', name: 'Executar', description: 'Pode realizar inspeções' },
                             { key: 'approve', name: 'Aprovar', description: 'Pode aprovar resultados' }
                           ].map((permission) => (
                             <div key={permission.key} className="space-y-2">
                               <div>
                                 <Label className="text-sm font-medium">{permission.name}</Label>
                                 <p className="text-xs text-gray-500">{permission.description}</p>
                               </div>
                               <div className="flex flex-wrap gap-2 product-badges">
                                 {[
                                   { id: 'inspector', name: 'Inspetor' },
                                   { id: 'assistant', name: 'Assistente' },
                                   { id: 'technician', name: 'Técnico' },
                                   { id: 'engineer', name: 'Engenheiro' },
                                   { id: 'supervisor', name: 'Supervisor' }
                                 ].map((role) => (
                                   <Badge
                                     key={role.id}
                                     variant={formData.accessControl.permissions[permission.key as keyof typeof formData.accessControl.permissions]?.includes(role.id) ? "default" : "outline"}
                                     className="cursor-pointer"
                                     onClick={() => {
                                       const currentRoles = formData.accessControl.permissions[permission.key as keyof typeof formData.accessControl.permissions] || [];
                                       const newRoles = currentRoles.includes(role.id)
                                         ? currentRoles.filter(r => r !== role.id)
                                         : [...currentRoles, role.id];
                                       handleInputChange('accessControl', {
                                         ...formData.accessControl,
                                         permissions: {
                                           ...formData.accessControl.permissions,
                                           [permission.key]: newRoles
                                         }
                                       });
                                     }}
                                   >
                                     {role.name}
                                   </Badge>
                                 ))}
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

              <TabsContent value="preview" className="h-full m-0 tabs-content">
                <ScrollArea className="h-full scroll-area">
                  <div className="pb-6">
                  <Card className="modal-card">
                    <CardHeader className="modal-card-header">
                      <CardTitle className="flex items-center space-x-2">
                        <Eye className="w-5 h-5" />
                        <span>Visualização do Plano de Inspeção</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="mb-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{formData.name || 'Nome do Plano'}</h3>
                                                     <div className="flex items-center space-x-4 text-sm text-gray-600">
                             <span className="flex items-center space-x-1">
                               <Tag className="w-4 h-4" />
                               <span>
                                 {formData.products.length > 0 
                                   ? `${formData.products.length} produto${formData.products.length > 1 ? 's' : ''}`
                                   : 'Nenhum produto'
                                 }
                               </span>
                             </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Válido até: {formData.validUntil.toLocaleDateString()}</span>
                            </span>
                            <Badge variant={formData.status === 'active' ? 'default' : 'secondary'}>
                              {formData.status}
                            </Badge>
                          </div>
                                                 </div>

                                                   {/* Lista de produtos */}
                          {formData.products.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-3">Produtos do Plano</h4>
                                                             <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                                {formData.products.map((product, index) => (
                                  <div key={product.id} className="bg-white rounded-lg p-3 border border-gray-200 product-card">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                                          {index + 1}
                                        </div>
                                        <div>
                                          <h5 className="font-medium text-gray-900">{product.description}</h5>
                                          <p className="text-sm text-gray-500">Código: {product.code}</p>
                                        </div>
                                      </div>
                                      {product.voltage !== 'N/A' && (
                                        <Badge variant="outline" className="text-xs">
                                          <Zap className="w-3 h-3 mr-1" />
                                          {product.voltage}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Lista de etiquetas */}
                          {labels.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                                <Tag className="w-5 h-5" />
                                <span>Etiquetas de Verificação ({labels.length})</span>
                              </h4>
                                                             <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                                {labels.map((label, index) => (
                                  <div key={label.id} className="bg-white rounded-lg p-3 border border-gray-200 product-card">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-bold">
                                          {index + 1}
                                        </div>
                                        <div>
                                          <h5 className="font-medium text-gray-900">{label.name}</h5>
                                          <p className="text-sm text-gray-500">{label.description}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Badge variant={label.labelConfig?.isEnabled ? "default" : "secondary"}>
                                          {label.labelConfig?.isEnabled ? "Ativa" : "Desativada"}
                                        </Badge>
                                        {label.labelConfig?.pdfUrl && (
                                          <Badge variant="outline" className="flex items-center space-x-1">
                                            <ExternalLink className="w-3 h-3" />
                                            <span>PDF</span>
                                          </Badge>
                                        )}
                                        {label.labelConfig?.requiresPhoto && (
                                          <Badge variant="outline" className="flex items-center space-x-1">
                                            <Camera className="w-3 h-3" />
                                            <span>Foto</span>
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Lista de perguntas */}
                          {questions.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                                <HelpCircle className="w-5 h-5" />
                                <span>Perguntas de Verificação ({questions.length})</span>
                              </h4>
                                                             <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                                {questions.map((question, index) => (
                                  <div key={question.id} className="bg-white rounded-lg p-3 border border-gray-200 product-card">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold">
                                          {index + 1}
                                        </div>
                                        <div>
                                          <h5 className="font-medium text-gray-900">{question.name}</h5>
                                          <p className="text-sm text-gray-500">{question.description}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Badge variant="outline" className="text-xs">
                                          {question.questionConfig?.questionType === 'yes_no' ? 'Sim/Não' :
                                           question.questionConfig?.questionType === 'scale_1_5' ? 'Escala 1-5' :
                                           question.questionConfig?.questionType === 'text' ? 'Texto' :
                                           question.questionConfig?.questionType === 'multiple_choice' ? 'Múltipla Escolha' : 'Texto'}
                                        </Badge>
                                        {question.required && (
                                          <Badge variant="destructive" className="text-xs">
                                            Obrigatória
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                         <div className="space-y-4">
                          {formData.steps.map((step, index) => (
                            <div key={step.id} className="bg-white rounded-lg p-4 border">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="font-semibold">{step.name}</h4>
                                  <p className="text-sm text-gray-600">{step.description}</p>
                                </div>
                                <Badge variant="outline" className="ml-auto">
                                  {step.estimatedTime} min
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                {step.fields.map((field) => {
                                  const FieldIcon = getFieldTypeIcon(field.type);
                                  return (
                                    <div key={field.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                                      <FieldIcon className="w-4 h-4 text-blue-600" />
                                      <span className="text-sm">{field.name}</span>
                                      {field.required && (
                                        <Badge variant="destructive" className="text-xs">
                                          *
                                        </Badge>
                                      )}
                                      {field.conditional && (
                                        <Badge variant="secondary" className="text-xs">
                                          Condicional
                                        </Badge>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="p-6 pt-4 shrink-0 modal-footer">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar Plano de Inspeção'}
          </Button>
        </DialogFooter>
      </DialogContent>

      <FieldEditor
        field={currentField}
        isOpen={showFieldEditor}
        onClose={() => {
          setShowFieldEditor(false);
          setCurrentField(null);
          setCurrentStepId('');
        }}
        onSave={handleFieldSave}
      />
    </Dialog>
  );
}

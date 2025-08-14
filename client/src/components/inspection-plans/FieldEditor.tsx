import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  FileText, 
  CheckSquare, 
  BarChart3, 
  Upload, 
  ChevronDown,
  Settings,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Star,
  HelpCircle,
  Zap,
  Palette,
  Type,
  Hash,
  List,
  ToggleLeft,
  Image,
  File,
  MessageSquare,
  CheckCircle,
  AlertCircle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { InspectionField } from '@/hooks/use-inspection-plans';

interface FieldEditorProps {
  field: InspectionField | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: InspectionField) => void;
}

const fieldTypes = [
  { 
    value: 'text', 
    label: 'Texto', 
    icon: Type, 
    description: 'Campo de texto simples',
    color: 'bg-blue-100 text-blue-600',
    examples: ['Nome do produto', 'Descrição', 'Observações']
  },
  { 
    value: 'number', 
    label: 'Número', 
    icon: Hash, 
    description: 'Campo numérico',
    color: 'bg-green-100 text-green-600',
    examples: ['Quantidade', 'Peso', 'Dimensões']
  },
  { 
    value: 'select', 
    label: 'Lista', 
    icon: List, 
    description: 'Lista de opções',
    color: 'bg-purple-100 text-purple-600',
    examples: ['Status', 'Categoria', 'Prioridade']
  },
  { 
    value: 'checkbox', 
    label: 'Checkbox', 
    icon: CheckSquare, 
    description: 'Caixa de seleção',
    color: 'bg-orange-100 text-orange-600',
    examples: ['Aprovado', 'Verificado', 'Conforme']
  },
  { 
    value: 'photo', 
    label: 'Foto', 
    icon: Camera, 
    description: 'Captura de imagem',
    color: 'bg-pink-100 text-pink-600',
    examples: ['Foto do produto', 'Evidência', 'Documento']
  },
  { 
    value: 'file', 
    label: 'Arquivo', 
    icon: File, 
    description: 'Upload de arquivo',
    color: 'bg-indigo-100 text-indigo-600',
    examples: ['PDF', 'Documento', 'Certificado']
  },
  { 
    value: 'textarea', 
    label: 'Texto Longo', 
    icon: MessageSquare, 
    description: 'Área de texto extensa',
    color: 'bg-teal-100 text-teal-600',
    examples: ['Descrição detalhada', 'Relatório', 'Comentários']
  }
];

export default function FieldEditor({ field, isOpen, onClose, onSave }: FieldEditorProps) {
  const [formData, setFormData] = useState<InspectionField>({
    id: '',
    name: '',
    type: 'text',
    required: false,
    description: ''
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (field) {
      setFormData(field);
      setShowAdvanced(!!field.conditional || !!field.photoConfig);
    } else {
      setFormData({
        id: `field-${Date.now()}`,
        name: '',
        type: 'text',
        required: false,
        description: ''
      });
      setShowAdvanced(false);
    }
  }, [field]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({ 
      ...prev, 
      type: type as InspectionField['type'],
      photoConfig: type === 'photo' ? {
        required: true,
        quantity: 1,
        allowAnnotations: false,
        compareWithStandard: false
      } : undefined
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Por favor, insira um nome para o campo');
      return;
    }
    onSave(formData);
    onClose();
  };

  const addOption = () => {
    const newOptions = [...(formData.options || []), ''];
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const removeOption = (index: number) => {
    const newOptions = (formData.options || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const selectedType = fieldTypes.find(t => t.value === formData.type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span>{field ? 'Editar Campo' : 'Criar Novo Campo'}</span>
          </DialogTitle>
          <DialogDescription>
            Configure seu campo de forma simples e intuitiva
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" className="flex items-center space-x-2">
                <Palette className="w-4 h-4" />
                <span>Básico</span>
              </TabsTrigger>
              <TabsTrigger value="options" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Opções</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Avançado</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 h-[calc(100%-60px)]">
              <TabsContent value="basic" className="h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-6">
                    {/* Tipo de Campo */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Type className="w-5 h-5" />
                          <span>1. Escolha o Tipo de Campo</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {fieldTypes.map((type) => (
                            <div
                              key={type.value}
                              onClick={() => handleTypeChange(type.value)}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                formData.type === type.value
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${type.color}`}>
                                  <type.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{type.label}</h4>
                                  <p className="text-sm text-gray-600">{type.description}</p>
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-500 font-medium">Exemplos:</p>
                                    <p className="text-xs text-gray-400">{type.examples.join(', ')}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Configuração Básica */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Info className="w-5 h-5" />
                          <span>2. Configure o Campo</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fieldName" className="text-sm font-medium">
                              Nome do Campo *
                            </Label>
                            <Input
                              id="fieldName"
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              placeholder="Ex: Nome do produto"
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center space-x-2">
                              <span>Campo Obrigatório</span>
                              {formData.required ? (
                                <Star className="w-4 h-4 text-red-500" />
                              ) : (
                                <Star className="w-4 h-4 text-gray-300" />
                              )}
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={formData.required}
                                onCheckedChange={(checked) => handleInputChange('required', checked)}
                              />
                              <span className="text-sm text-gray-600">
                                {formData.required ? 'Sim' : 'Não'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="fieldDescription" className="text-sm font-medium">
                            Descrição (Opcional)
                          </Label>
                          <Textarea
                            id="fieldDescription"
                            value={formData.description || ''}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Descreva o que este campo deve verificar..."
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Preview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Eye className="w-5 h-5" />
                          <span>3. Visualização</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center space-x-2">
                              <span>{formData.name || 'Nome do Campo'}</span>
                              {formData.required && <span className="text-red-500">*</span>}
                            </Label>
                            <div className="flex items-center space-x-2">
                              {selectedType && (
                                <div className={`p-1 rounded ${selectedType.color}`}>
                                  <selectedType.icon className="w-4 h-4" />
                                </div>
                              )}
                              <span className="text-sm text-gray-600">
                                {selectedType?.label || 'Tipo'}
                              </span>
                            </div>
                            {formData.description && (
                              <p className="text-xs text-gray-500">{formData.description}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="options" className="h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-6">
                    {/* Opções para campos de seleção */}
                    {(formData.type === 'select' || formData.type === 'checkbox') && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <List className="w-5 h-5" />
                            <span>Opções de Seleção</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {(formData.options || []).map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Input
                                  value={option}
                                  onChange={(e) => updateOption(index, e.target.value)}
                                  placeholder={`Opção ${index + 1}`}
                                  className="flex-1"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeOption(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              onClick={addOption}
                              className="w-full"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Adicionar Opção
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Configurações específicas para foto */}
                    {formData.type === 'photo' && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Camera className="w-5 h-5" />
                            <span>Configurações de Foto</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Quantidade de Fotos</Label>
                              <Select
                                value={formData.photoConfig?.quantity?.toString() || '1'}
                                onValueChange={(value) => handleInputChange('photoConfig', {
                                  ...formData.photoConfig,
                                  quantity: parseInt(value)
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 foto</SelectItem>
                                  <SelectItem value="2">2 fotos</SelectItem>
                                  <SelectItem value="3">3 fotos</SelectItem>
                                  <SelectItem value="4">4 fotos</SelectItem>
                                  <SelectItem value="5">5 fotos</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Permitir Anotações</Label>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={formData.photoConfig?.allowAnnotations || false}
                                  onCheckedChange={(checked) => handleInputChange('photoConfig', {
                                    ...formData.photoConfig,
                                    allowAnnotations: checked
                                  })}
                                />
                                <span className="text-sm text-gray-600">
                                  {formData.photoConfig?.allowAnnotations ? 'Sim' : 'Não'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="advanced" className="h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Settings className="w-5 h-5" />
                          <span>Configurações Avançadas</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Valor Padrão</Label>
                          <Input
                            value={formData.defaultValue || ''}
                            onChange={(e) => handleInputChange('defaultValue', e.target.value)}
                            placeholder="Valor padrão para o campo"
                          />
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Campo Condicional</Label>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={!!formData.conditional}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleInputChange('conditional', {
                                    dependsOn: '',
                                    condition: 'any'
                                  });
                                } else {
                                  handleInputChange('conditional', undefined);
                                }
                              }}
                            />
                            <span className="text-sm text-gray-600">
                              {formData.conditional ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                        </div>

                        {formData.conditional && (
                          <div className="pl-6 space-y-3 border-l-2 border-gray-200">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Depende do Campo</Label>
                              <Input
                                value={formData.conditional.dependsOn}
                                onChange={(e) => handleInputChange('conditional', {
                                  ...formData.conditional,
                                  dependsOn: e.target.value
                                })}
                                placeholder="Nome do campo dependente"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Condição</Label>
                              <Select
                                value={formData.conditional.condition}
                                onValueChange={(value) => handleInputChange('conditional', {
                                  ...formData.conditional,
                                  condition: value as any
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="any">Qualquer valor</SelectItem>
                                  <SelectItem value="approved">Aprovado</SelectItem>
                                  <SelectItem value="rejected">Rejeitado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Zap className="w-4 h-4 mr-2" />
            {field ? 'Atualizar Campo' : 'Criar Campo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

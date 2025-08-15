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
      // Configurações específicas por tipo
      photoConfig: type === 'photo' ? {
        required: true,
        quantity: 1,
        allowAnnotations: false,
        compareWithStandard: false
      } : undefined,
      // Limpar opções se não for select/checkbox
      options: (type === 'select' || type === 'checkbox') ? prev.options : [],
      // Configurar valor padrão baseado no tipo
      defaultValue: type === 'checkbox' ? 'false' : 
                   type === 'number' ? '0' : 
                   type === 'select' ? '' : 
                   prev.defaultValue || ''
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

  // Função para obter placeholder baseado no tipo
  const getPlaceholderByType = (type: string) => {
    switch (type) {
      case 'text': return 'Nome do produto';
      case 'number': return 'Quantidade';
      case 'select': return 'Status do produto';
      case 'checkbox': return 'Verificações';
      case 'photo': return 'Foto do produto';
      case 'file': return 'Documento';
      case 'textarea': return 'Descrição detalhada';
      default: return 'Nome do campo';
    }
  };

  return (
         <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] flex flex-col p-0 modal-responsive fieldeditor-modal overflow-hidden">
        <DialogHeader className="p-6 pb-4 shrink-0 modal-header">
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span>{field ? 'Editar Campo' : 'Criar Novo Campo'}</span>
          </DialogTitle>
          <DialogDescription>
            Configure seu campo de forma simples e intuitiva
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                         <TabsList className="grid w-full grid-cols-1 shrink-0 mx-6 mb-4 tabs-list fieldeditor-tabs-list">
               <TabsTrigger value="basic" className="flex items-center space-x-2">
                 <Palette className="w-4 h-4" />
                 <span>Configurar Campo</span>
               </TabsTrigger>
             </TabsList>

            <div className="flex-1 overflow-hidden px-6 pb-6">
              <TabsContent value="basic" className="h-full m-0 tabs-content">
                <ScrollArea className="h-full scroll-area">
                  <div className="space-y-6 pb-6">
                    {/* Tipo de Campo */}
                    <Card className="modal-card">
                      <CardHeader className="modal-card-header">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Type className="w-5 h-5" />
                          <span>1. Escolha o Tipo de Campo</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="modal-card-content">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 form-grid-3 field-types-grid">
                          {fieldTypes.map((type) => (
                            <div
                              key={type.value}
                              onClick={() => handleTypeChange(type.value)}
                              className={`p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md field-type-card ${
                                formData.type === type.value
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-lg ${type.color} shrink-0 field-type-icon`}>
                                  <type.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 text-sm">{type.label}</h4>
                                  <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-500 font-medium">Exemplos:</p>
                                    <p className="text-xs text-gray-400 truncate">{type.examples.join(', ')}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                                         {/* Configuração Básica */}
                     <Card className="modal-card">
                       <CardHeader className="modal-card-header">
                         <CardTitle className="text-lg flex items-center space-x-2">
                           <Info className="w-5 h-5" />
                           <span>2. Configure o Campo</span>
                         </CardTitle>
                       </CardHeader>
                       <CardContent className="space-y-4 modal-card-content">
                         {/* Nome e Obrigatório - Sempre visível */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 form-grid-2">
                           <div className="space-y-2">
                             <Label htmlFor="fieldName" className="text-sm font-medium">
                               Nome do Campo *
                             </Label>
                             <Input
                               id="fieldName"
                               value={formData.name}
                               onChange={(e) => handleInputChange('name', e.target.value)}
                               placeholder={`Ex: ${getPlaceholderByType(formData.type)}`}
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
                         
                         {/* Descrição - Sempre visível */}
                         <div className="space-y-2">
                           <Label htmlFor="fieldDescription" className="text-sm font-medium">
                             Descrição (Opcional)
                           </Label>
                           <Textarea
                             id="fieldDescription"
                             value={formData.description || ''}
                             onChange={(e) => handleInputChange('description', e.target.value)}
                             placeholder={`Descreva o que este campo deve verificar...`}
                             rows={3}
                           />
                         </div>

                         {/* Configurações específicas por tipo */}
                         {formData.type === 'select' && (
                           <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200 field-config-section">
                             <div className="flex items-center space-x-2">
                               <List className="w-4 h-4 text-blue-600" />
                               <Label className="text-sm font-medium text-blue-900">
                                 Opções da Lista
                               </Label>
                             </div>
                             <p className="text-xs text-blue-700 mb-3">
                               Adicione as opções que aparecerão na lista de seleção
                             </p>
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
                         )}

                         {formData.type === 'checkbox' && (
                           <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200 field-config-section">
                             <div className="flex items-center space-x-2">
                               <CheckSquare className="w-4 h-4 text-green-600" />
                               <Label className="text-sm font-medium text-green-900">
                                 Opções do Checkbox
                               </Label>
                             </div>
                             <p className="text-xs text-green-700 mb-3">
                               Adicione as opções que aparecerão como checkboxes
                             </p>
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
                         )}

                         {formData.type === 'photo' && (
                           <div className="space-y-3 p-4 bg-pink-50 rounded-lg border border-pink-200 field-config-section">
                             <div className="flex items-center space-x-2">
                               <Camera className="w-4 h-4 text-pink-600" />
                               <Label className="text-sm font-medium text-pink-900">
                                 Configurações de Foto
                               </Label>
                             </div>
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
                           </div>
                         )}

                         {formData.type === 'number' && (
                           <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200 field-config-section">
                             <div className="flex items-center space-x-2">
                               <Hash className="w-4 h-4 text-green-600" />
                               <Label className="text-sm font-medium text-green-900">
                                 Configurações de Número
                               </Label>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="space-y-2">
                                 <Label className="text-sm font-medium">Valor Mínimo</Label>
                                 <Input
                                   type="number"
                                   value={formData.minValue || ''}
                                   onChange={(e) => handleInputChange('minValue', e.target.value)}
                                   placeholder="Ex: 0"
                                 />
                               </div>
                               <div className="space-y-2">
                                 <Label className="text-sm font-medium">Valor Máximo</Label>
                                 <Input
                                   type="number"
                                   value={formData.maxValue || ''}
                                   onChange={(e) => handleInputChange('maxValue', e.target.value)}
                                   placeholder="Ex: 100"
                                 />
                               </div>
                             </div>
                           </div>
                         )}
                       </CardContent>
                     </Card>

                                         {/* Preview */}
                     <Card className="modal-card">
                       <CardHeader className="modal-card-header">
                         <CardTitle className="text-lg flex items-center space-x-2">
                           <Eye className="w-5 h-5" />
                           <span>3. Como ficará o campo</span>
                         </CardTitle>
                       </CardHeader>
                       <CardContent className="modal-card-content">
                         <div className="bg-gray-50 p-4 rounded-lg border field-preview">
                           <div className="space-y-3">
                             <div className="flex items-center justify-between">
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
                                 <span className="text-xs text-gray-600">
                                   {selectedType?.label || 'Tipo'}
                                 </span>
                               </div>
                             </div>
                             
                             {formData.description && (
                               <p className="text-xs text-gray-500">{formData.description}</p>
                             )}

                             {/* Preview do campo baseado no tipo */}
                             <div className="mt-3">
                               {formData.type === 'text' && (
                                 <Input placeholder="Digite aqui..." disabled />
                               )}
                               {formData.type === 'number' && (
                                 <Input type="number" placeholder="0" disabled />
                               )}
                               {formData.type === 'select' && (
                                 <Select disabled>
                                   <SelectTrigger>
                                     <SelectValue placeholder="Selecione uma opção" />
                                   </SelectTrigger>
                                   <SelectContent>
                                     {(formData.options || []).map((option, index) => (
                                       <SelectItem key={index} value={option}>
                                         {option}
                                       </SelectItem>
                                     ))}
                                   </SelectContent>
                                 </Select>
                               )}
                               {formData.type === 'checkbox' && (
                                 <div className="space-y-2">
                                   {(formData.options || []).map((option, index) => (
                                     <div key={index} className="flex items-center space-x-2">
                                       <Checkbox disabled />
                                       <Label className="text-sm">{option}</Label>
                                     </div>
                                   ))}
                                 </div>
                               )}
                               {formData.type === 'photo' && (
                                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                   <Camera className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                   <p className="text-sm text-gray-500">Clique para tirar foto</p>
                                   {formData.photoConfig?.quantity && formData.photoConfig.quantity > 1 && (
                                     <p className="text-xs text-gray-400 mt-1">
                                       {formData.photoConfig.quantity} fotos necessárias
                                     </p>
                                   )}
                                 </div>
                               )}
                               {formData.type === 'file' && (
                                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                   <File className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                   <p className="text-sm text-gray-500">Clique para selecionar arquivo</p>
                                 </div>
                               )}
                               {formData.type === 'textarea' && (
                                 <Textarea placeholder="Digite aqui..." rows={3} disabled />
                               )}
                             </div>
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
          <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Zap className="w-4 h-4 mr-2" />
            {field ? 'Atualizar Campo' : 'Criar Campo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

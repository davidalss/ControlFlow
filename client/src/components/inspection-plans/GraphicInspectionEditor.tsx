import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  FileText, 
  CheckSquare, 
  Trash2,
  Eye,
  Settings,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  Tag,
  Image,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { InspectionStep, InspectionField } from '@/hooks/use-inspection-plans';

interface GraphicInspectionEditorProps {
  step: InspectionStep | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedStep: InspectionStep) => void;
}

// Campos padrão da etapa "INSPEÇÃO MATERIAL GRÁFICO"
const defaultGraphicFields: InspectionField[] = [
  // Campos de Foto
  {
    id: 'etiqueta_principal',
    name: 'Etiqueta Principal',
    type: 'photo',
    required: true,
    description: 'Foto da etiqueta principal do produto',
    photoConfig: {
      required: true,
      quantity: 1,
      allowAnnotations: true,
      compareWithStandard: false
    }
  },
  {
    id: 'etiqueta_secundaria',
    name: 'Etiqueta Secundária',
    type: 'photo',
    required: true,
    description: 'Foto da etiqueta secundária ou complementar',
    photoConfig: {
      required: true,
      quantity: 1,
      allowAnnotations: true,
      compareWithStandard: false
    }
  },
  {
    id: 'rotulo_produto',
    name: 'Rótulo do Produto',
    type: 'photo',
    required: true,
    description: 'Foto do rótulo principal do produto',
    photoConfig: {
      required: true,
      quantity: 1,
      allowAnnotations: true,
      compareWithStandard: false
    }
  },
  {
    id: 'embalagem',
    name: 'Embalagem',
    type: 'photo',
    required: true,
    description: 'Foto da embalagem do produto',
    photoConfig: {
      required: true,
      quantity: 1,
      allowAnnotations: true,
      compareWithStandard: false
    }
  },
  {
    id: 'manual_instrucoes',
    name: 'Manual/Instruções',
    type: 'photo',
    required: false,
    description: 'Foto do manual ou instruções',
    photoConfig: {
      required: false,
      quantity: 1,
      allowAnnotations: true,
      compareWithStandard: false
    }
  },
  // Campos de Checkbox
  {
    id: 'material_conforme',
    name: 'Material está conforme?',
    type: 'checkbox',
    required: true,
    description: 'Verificar se o material gráfico está conforme especificação'
  },
  {
    id: 'cores_corretas',
    name: 'Cores estão corretas?',
    type: 'checkbox',
    required: true,
    description: 'Verificar se as cores estão conforme padrão'
  },
  {
    id: 'texto_legivel',
    name: 'Texto está legível?',
    type: 'checkbox',
    required: true,
    description: 'Verificar se todos os textos estão legíveis'
  },
  {
    id: 'informacoes_completas',
    name: 'Informações estão completas?',
    type: 'checkbox',
    required: true,
    description: 'Verificar se todas as informações obrigatórias estão presentes'
  },
  {
    id: 'acabamento_adequado',
    name: 'Acabamento está adequado?',
    type: 'checkbox',
    required: true,
    description: 'Verificar se o acabamento gráfico está adequado'
  },
  // Campo de Texto
  {
    id: 'observacoes_graficas',
    name: 'Observações',
    type: 'text',
    required: false,
    description: 'Observações sobre o material gráfico'
  }
];

export default function GraphicInspectionEditor({ step, isOpen, onClose, onSave }: GraphicInspectionEditorProps) {
  const { toast } = useToast();
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('photos');

  // Inicializar campos selecionados
  useEffect(() => {
    if (step) {
      const fieldIds = step.fields.map(field => field.id);
      setSelectedFields(new Set(fieldIds));
    } else {
      // Se não há etapa, selecionar todos os campos padrão
      const allFieldIds = defaultGraphicFields.map(field => field.id);
      setSelectedFields(new Set(allFieldIds));
    }
  }, [step]);

  const handleFieldToggle = (fieldId: string) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(fieldId)) {
      newSelected.delete(fieldId);
    } else {
      newSelected.add(fieldId);
    }
    setSelectedFields(newSelected);
  };

  const handleSave = () => {
    if (selectedFields.size === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um campo para a etapa de inspeção gráfica.",
        variant: "destructive"
      });
      return;
    }

    const selectedFieldsList = defaultGraphicFields.filter(field => 
      selectedFields.has(field.id)
    );

    const updatedStep: InspectionStep = {
      id: step?.id || `step_graphic_${Date.now()}`,
      name: 'INSPEÇÃO MATERIAL GRÁFICO',
      description: 'Inspeção de etiquetas, rótulos e material gráfico do produto',
      fields: selectedFieldsList,
      order: step?.order || 1,
      required: true,
      estimatedTime: 10,
      isGraphicInspection: true
    };

    onSave(updatedStep);
    toast({
      title: "Sucesso",
      description: "Etapa de inspeção gráfica atualizada com sucesso!",
    });
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'photo': return <Camera className="w-4 h-4" />;
      case 'checkbox': return <CheckSquare className="w-4 h-4" />;
      case 'text': return <FileText className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getFieldColor = (type: string) => {
    switch (type) {
      case 'photo': return 'bg-blue-100 text-blue-600';
      case 'checkbox': return 'bg-green-100 text-green-600';
      case 'text': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const photoFields = defaultGraphicFields.filter(field => field.type === 'photo');
  const checkboxFields = defaultGraphicFields.filter(field => field.type === 'checkbox');
  const textFields = defaultGraphicFields.filter(field => field.type === 'text');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center space-x-2">
            <Image className="w-6 h-6 text-purple-600" />
            <span>Editar Etapa: INSPEÇÃO MATERIAL GRÁFICO</span>
          </DialogTitle>
          <DialogDescription>
            Selecione os campos que deseja manter na etapa de inspeção gráfica. 
            Você pode remover campos desmarcando-os, mas não pode adicionar novos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 shrink-0">
              <TabsTrigger value="photos" className="flex items-center space-x-2">
                <Camera className="w-4 h-4" />
                <span>Fotos ({photoFields.filter(f => selectedFields.has(f.id)).length})</span>
              </TabsTrigger>
              <TabsTrigger value="checkboxes" className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4" />
                <span>Verificações ({checkboxFields.filter(f => selectedFields.has(f.id)).length})</span>
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Texto ({textFields.filter(f => selectedFields.has(f.id)).length})</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 flex-1">
              <TabsContent value="photos" className="h-full">
                <ScrollArea className="h-full max-h-[60vh]">
                  <div className="space-y-4 p-1">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Info className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Campos de Foto</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Estes campos capturam imagens de etiquetas, rótulos e material gráfico do produto.
                      </p>
                    </div>

                    <div className="grid gap-3">
                      {photoFields.map((field) => (
                        <Card key={field.id} className={`transition-all ${
                          selectedFields.has(field.id) 
                            ? 'border-blue-200 bg-blue-50' 
                            : 'border-gray-200 opacity-60'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                checked={selectedFields.has(field.id)}
                                onCheckedChange={() => handleFieldToggle(field.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className={`p-1 rounded ${getFieldColor(field.type)}`}>
                                    {getFieldIcon(field.type)}
                                  </div>
                                  <h4 className="font-semibold text-gray-900">{field.name}</h4>
                                  {field.required && (
                                    <Badge variant="destructive" className="text-xs">
                                      Obrigatório
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{field.description}</p>
                                {field.photoConfig && (
                                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                                    <Camera className="w-3 h-3" />
                                    <span>{field.photoConfig.quantity} foto(s)</span>
                                    {field.photoConfig.allowAnnotations && (
                                      <Badge variant="secondary" className="text-xs">
                                        Anotações
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="checkboxes" className="h-full">
                <ScrollArea className="h-full max-h-[60vh]">
                  <div className="space-y-4 p-1">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Info className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-900">Campos de Verificação</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Estes campos permitem verificar se o material gráfico está conforme especificação.
                      </p>
                    </div>

                    <div className="grid gap-3">
                      {checkboxFields.map((field) => (
                        <Card key={field.id} className={`transition-all ${
                          selectedFields.has(field.id) 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 opacity-60'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                checked={selectedFields.has(field.id)}
                                onCheckedChange={() => handleFieldToggle(field.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className={`p-1 rounded ${getFieldColor(field.type)}`}>
                                    {getFieldIcon(field.type)}
                                  </div>
                                  <h4 className="font-semibold text-gray-900">{field.name}</h4>
                                  {field.required && (
                                    <Badge variant="destructive" className="text-xs">
                                      Obrigatório
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{field.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="text" className="h-full">
                <ScrollArea className="h-full max-h-[60vh]">
                  <div className="space-y-4 p-1">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Info className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-purple-900">Campos de Texto</span>
                      </div>
                      <p className="text-sm text-purple-700">
                        Estes campos permitem adicionar observações e comentários sobre o material gráfico.
                      </p>
                    </div>

                    <div className="grid gap-3">
                      {textFields.map((field) => (
                        <Card key={field.id} className={`transition-all ${
                          selectedFields.has(field.id) 
                            ? 'border-purple-200 bg-purple-50' 
                            : 'border-gray-200 opacity-60'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                checked={selectedFields.has(field.id)}
                                onCheckedChange={() => handleFieldToggle(field.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className={`p-1 rounded ${getFieldColor(field.type)}`}>
                                    {getFieldIcon(field.type)}
                                  </div>
                                  <h4 className="font-semibold text-gray-900">{field.name}</h4>
                                  {field.required && (
                                    <Badge variant="destructive" className="text-xs">
                                      Obrigatório
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{field.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-blue-600">
            <Save className="w-4 h-4 mr-2" />
            Salvar Etapa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

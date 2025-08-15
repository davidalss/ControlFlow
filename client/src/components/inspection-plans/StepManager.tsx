import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical, Plus, Trash2, Edit, Eye, Settings,
  ChevronDown, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { InspectionStep, InspectionField } from '@/hooks/use-inspection-plans';
import GraphicInspectionEditor from './GraphicInspectionEditor';

interface StepManagerProps {
  steps: InspectionStep[];
  onStepsChange: (steps: InspectionStep[]) => void;
  onAddField?: (stepId: string) => void;
  onEditField?: (stepId: string, field: InspectionField) => void;
  onRemoveField?: (stepId: string, fieldId: string) => void;
}

interface SortableStepItemProps {
  step: InspectionStep;
  onUpdate: (step: InspectionStep) => void;
  onDelete: (stepId: string) => void;
  onToggleExpand: (stepId: string) => void;
  isExpanded: boolean;
  onAddField?: (stepId: string) => void;
  onEditField?: (stepId: string, field: InspectionField) => void;
  onRemoveField?: (stepId: string, fieldId: string) => void;
  onEditGraphicStep?: (step: InspectionStep) => void;
}

function SortableStepItem({ 
  step, 
  onUpdate, 
  onDelete, 
  onToggleExpand, 
  isExpanded,
  onAddField,
  onEditField,
  onRemoveField
}: SortableStepItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(step);

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(step);
    setIsEditing(false);
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`mb-4 transition-all duration-200 ${isDragging ? 'shadow-lg' : ''}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab hover:bg-gray-100 p-1 rounded"
            >
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    placeholder="Nome da etapa"
                    className="font-semibold"
                  />
                  <Textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    placeholder="Descrição da etapa"
                    rows={2}
                  />
                </div>
              ) : (
                <div>
                                     <CardTitle className="text-lg flex items-center gap-2">
                     {step.name}
                     {step.name === 'INSPEÇÃO MATERIAL GRÁFICO' && (
                       <Badge variant="destructive" className="text-xs">
                         ESPECIAL
                       </Badge>
                     )}
                     <Badge variant={step.required ? "default" : "secondary"}>
                       {step.required ? "Obrigatória" : "Opcional"}
                     </Badge>
                     <Badge variant="outline">
                       {step.fields.length} campo{step.fields.length !== 1 ? 's' : ''}
                     </Badge>
                   </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave} variant="default">
                  Salvar
                </Button>
                <Button size="sm" onClick={handleCancel} variant="outline">
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onToggleExpand(step.id)}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                {step.name === 'INSPEÇÃO MATERIAL GRÁFICO' ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEditGraphicStep?.(step)}
                    title="Editar etapa especial"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                                 {step.name !== 'INSPEÇÃO MATERIAL GRÁFICO' ? (
                   <Button
                     size="sm"
                     variant="ghost"
                     onClick={() => onDelete(step.id)}
                     className="text-red-600 hover:text-red-700"
                   >
                     <Trash2 className="h-4 w-4" />
                   </Button>
                 ) : (
                   <Button
                     size="sm"
                     variant="ghost"
                     disabled
                     className="text-gray-400 cursor-not-allowed"
                     title="Esta etapa não pode ser excluída"
                   >
                     <Trash2 className="h-4 w-4" />
                   </Button>
                 )}
              </>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Configurações da etapa */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tempo estimado (minutos)</Label>
                <Input
                  type="number"
                  value={editData.estimatedTime}
                  onChange={(e) => setEditData({ ...editData, estimatedTime: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id={`required-${step.id}`}
                  checked={editData.required}
                  onCheckedChange={(checked) => setEditData({ ...editData, required: checked })}
                />
                <Label htmlFor={`required-${step.id}`} className="text-sm">
                  Etapa obrigatória
                </Label>
              </div>
            </div>

                         {/* Lista de campos */}
             <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <Label className="text-sm font-medium">Campos da etapa</Label>
                 {onAddField && (
                   <Button 
                     size="sm" 
                     variant="outline"
                     onClick={() => onAddField(step.id)}
                     className="shrink-0"
                   >
                     <Plus className="h-4 w-4 mr-1" />
                     Adicionar Campo
                   </Button>
                 )}
               </div>
               
               {step.fields.length === 0 ? (
                 <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                   <Settings className="h-6 w-6 mx-auto mb-2 opacity-50" />
                   <p className="text-sm">Nenhum campo adicionado</p>
                   <p className="text-xs text-gray-400">Clique em "Adicionar Campo" para começar</p>
                 </div>
                             ) : (
                                   <ScrollArea className="h-60 max-h-60">
                   <div className="space-y-2 pr-2">
                     {step.fields.map((field, index) => (
                       <div
                         key={field.id}
                         className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                       >
                         <div className="flex items-center gap-2 min-w-0 flex-1">
                           <Badge variant="outline" className="text-xs shrink-0">
                             {field.type}
                           </Badge>
                           <span className="text-sm font-medium truncate">{field.name}</span>
                           {field.required && (
                             <Badge variant="destructive" className="text-xs shrink-0">
                               Obrigatório
                             </Badge>
                           )}
                         </div>
                         <div className="flex items-center gap-1 shrink-0 ml-2">
                           {onEditField && (
                             <Button 
                               size="sm" 
                               variant="ghost"
                               onClick={() => onEditField(step.id, field)}
                               className="h-8 w-8 p-0"
                             >
                               <Edit className="h-3 w-3" />
                             </Button>
                           )}
                           {onRemoveField && (
                             <Button 
                               size="sm" 
                               variant="ghost" 
                               className="text-red-600 h-8 w-8 p-0"
                               onClick={() => onRemoveField(step.id, field.id)}
                             >
                               <Trash2 className="h-3 w-3" />
                             </Button>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                 </ScrollArea>
               )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function StepManager({ steps, onStepsChange, onAddField, onEditField, onRemoveField }: StepManagerProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [showGraphicEditor, setShowGraphicEditor] = useState(false);
  const [editingGraphicStep, setEditingGraphicStep] = useState<InspectionStep | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = steps.findIndex(step => step.id === active.id);
      const newIndex = steps.findIndex(step => step.id === over?.id);

      const newSteps = arrayMove(steps, oldIndex, newIndex);
      onStepsChange(newSteps);
    }
  };

  const handleUpdateStep = (updatedStep: InspectionStep) => {
    const newSteps = steps.map(step => 
      step.id === updatedStep.id ? updatedStep : step
    );
    onStepsChange(newSteps);
  };

  const handleDeleteStep = (stepId: string) => {
    const newSteps = steps.filter(step => step.id !== stepId);
    onStepsChange(newSteps);
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(stepId);
      return newSet;
    });
  };

  const handleToggleExpand = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const handleEditGraphicStep = (step: InspectionStep) => {
    setEditingGraphicStep(step);
    setShowGraphicEditor(true);
  };

  const handleSaveGraphicStep = (updatedStep: InspectionStep) => {
    const newSteps = steps.map(step => 
      step.id === updatedStep.id ? updatedStep : step
    );
    onStepsChange(newSteps);
    setShowGraphicEditor(false);
    setEditingGraphicStep(null);
  };

  const handleAddStep = () => {
    // Verificar se já existe a etapa de material gráfico
    const hasGraphicStep = steps.some(step => step.name === 'INSPEÇÃO MATERIAL GRÁFICO');
    
    let newStep: InspectionStep;
    
    if (!hasGraphicStep) {
      // Criar etapa de material gráfico com campos pré-configurados
      newStep = {
        id: `step_graphic_${Date.now()}`,
        name: 'INSPEÇÃO MATERIAL GRÁFICO',
        description: 'Inspeção de etiquetas, rótulos e material gráfico do produto',
        fields: [
          {
            id: `field_etiqueta_principal_${Date.now()}`,
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
            id: `field_etiqueta_secundaria_${Date.now()}`,
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
            id: `field_rotulo_produto_${Date.now()}`,
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
            id: `field_material_conforme_${Date.now()}`,
            name: 'Material está conforme?',
            type: 'checkbox',
            required: true,
            description: 'Verificar se o material gráfico está conforme especificação'
          },
          {
            id: `field_cores_corretas_${Date.now()}`,
            name: 'Cores estão corretas?',
            type: 'checkbox',
            required: true,
            description: 'Verificar se as cores estão conforme padrão'
          },
          {
            id: `field_texto_legivel_${Date.now()}`,
            name: 'Texto está legível?',
            type: 'checkbox',
            required: true,
            description: 'Verificar se todos os textos estão legíveis'
          },
          {
            id: `field_observacoes_graficas_${Date.now()}`,
            name: 'Observações',
            type: 'text',
            required: false,
            description: 'Observações sobre o material gráfico'
          }
        ],
        order: 1, // Sempre primeira etapa
        required: true,
        estimatedTime: 10,
        isGraphicInspection: true // Flag especial
      };
    } else {
      // Criar etapa normal
      newStep = {
        id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `Nova Etapa ${steps.length + 1}`,
        description: 'Descrição da nova etapa',
        fields: [],
        order: steps.length + 1,
        required: true,
        estimatedTime: 5
      };
    }
    
    const newSteps = [...steps, newStep];
    onStepsChange(newSteps);
    setExpandedSteps(prev => new Set([...prev, newStep.id]));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Etapas do Plano</h3>
          <p className="text-sm text-gray-600">
            Organize as etapas de inspeção. Arraste para reordenar.
          </p>
        </div>
        <Button onClick={handleAddStep} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Etapa
        </Button>
      </div>

      {steps.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma etapa criada
          </h3>
          <p className="text-gray-600 mb-4">
            Comece criando a primeira etapa do seu plano de inspeção
          </p>
          <Button onClick={handleAddStep} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Criar Primeira Etapa
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={steps.map(step => step.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {steps.map((step, index) => (
                <SortableStepItem
                  key={step.id}
                  step={step}
                  onUpdate={handleUpdateStep}
                  onDelete={handleDeleteStep}
                  onToggleExpand={handleToggleExpand}
                  isExpanded={expandedSteps.has(step.id)}
                  onAddField={onAddField}
                  onEditField={onEditField}
                  onRemoveField={onRemoveField}
                  onEditGraphicStep={handleEditGraphicStep}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {steps.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Dicas de uso:</span>
          </div>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Arraste as etapas para reordenar a sequência de inspeção</li>
            <li>• Clique no ícone de seta para expandir/contrair os detalhes</li>
            <li>• Use o ícone de edição para modificar nome e descrição</li>
            <li>• Configure campos obrigatórios e tempo estimado</li>
          </ul>
        </div>
      )}

      {/* Editor especial para etapa de inspeção gráfica */}
      <GraphicInspectionEditor
        step={editingGraphicStep}
        isOpen={showGraphicEditor}
        onClose={() => {
          setShowGraphicEditor(false);
          setEditingGraphicStep(null);
        }}
        onSave={handleSaveGraphicStep}
      />
    </div>
  );
}

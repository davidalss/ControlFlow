import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, X, GripVertical, FileText, Link } from "lucide-react";

interface InspectionPlanManagerProps {
  productId?: string;
  onSave?: (plan: any) => void;
  onCancel?: () => void;
}

export default function InspectionPlanManager({ productId, onSave, onCancel }: InspectionPlanManagerProps) {
  const { toast } = useToast();
  
  const [plan, setPlan] = useState({
    id: '',
    version: '1.0',
    productId: productId || '',
    steps: [
      {
        id: 'step-1',
        name: 'Materiais Gráficos',
        type: 'non-functional',
        description: 'Verificação de materiais gráficos e impressão',
        order: 1,
        samplePercentage: 30,
        items: [
          { id: 'item-1', description: 'Qualidade da impressão', required: true },
          { id: 'item-2', description: 'Cores conforme padrão', required: true },
          { id: 'item-3', description: 'Textos legíveis', required: true }
        ]
      },
      {
        id: 'step-2',
        name: 'Medições',
        type: 'non-functional',
        description: 'Verificação de dimensões e medidas',
        order: 2,
        samplePercentage: 30,
        items: [
          { id: 'item-4', description: 'Dimensões conforme especificação', required: true },
          { id: 'item-5', description: 'Peso do produto', required: true }
        ]
      },
      {
        id: 'step-3',
        name: 'Parâmetros Elétricos',
        type: 'functional',
        description: 'Teste de parâmetros elétricos',
        order: 3,
        samplePercentage: 100,
        items: [
          { id: 'item-6', description: 'Tensão de operação', required: true, parameter: { min: 110, max: 127, unit: 'V' } },
          { id: 'item-7', description: 'Corrente de consumo', required: true, parameter: { min: 0.5, max: 2.0, unit: 'A' } },
          { id: 'item-8', description: 'Potência nominal', required: true, parameter: { min: 50, max: 200, unit: 'W' } }
        ]
      },
      {
        id: 'step-4',
        name: 'Etiquetas',
        type: 'non-functional',
        description: 'Conferência de etiquetas obrigatórias',
        order: 4,
        samplePercentage: 30,
        items: [
          { id: 'item-9', description: 'EAN', required: true, label: { type: 'EAN', file: 'label-ean.pdf', url: 'https://sharepoint.com/label-ean.pdf' } },
          { id: 'item-10', description: 'DUN', required: true, label: { type: 'DUN', file: 'label-dun.pdf', url: 'https://sharepoint.com/label-dun.pdf' } },
          { id: 'item-11', description: 'Selo ANATEL', required: true, label: { type: 'ANATEL', file: 'label-anatel.pdf', url: 'https://sharepoint.com/label-anatel.pdf' } }
        ]
      },
      {
        id: 'step-5',
        name: 'Integridade',
        type: 'non-functional',
        description: 'Verificação de integridade física',
        order: 5,
        samplePercentage: 30,
        items: [
          { id: 'item-12', description: 'Embalagem intacta', required: true },
          { id: 'item-13', description: 'Produto sem danos', required: true }
        ]
      }
    ],
    labels: [
      { type: 'EAN', required: true, file: 'label-ean.pdf', url: 'https://sharepoint.com/label-ean.pdf' },
      { type: 'DUN', required: true, file: 'label-dun.pdf', url: 'https://sharepoint.com/label-dun.pdf' },
      { type: 'ANATEL', required: true, file: 'label-anatel.pdf', url: 'https://sharepoint.com/label-anatel.pdf' }
    ],
    documents: [
      { name: 'Manual do Usuário', type: 'manual', url: 'https://sharepoint.com/manual.pdf' },
      { name: 'Arte da Embalagem', type: 'art', url: 'https://sharepoint.com/art.pdf' }
    ]
  });

  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [showAddStep, setShowAddStep] = useState(false);

  const stepTypes = [
    { value: 'non-functional', label: 'Não Funcional (30% da amostra)' },
    { value: 'functional', label: 'Funcional (100% da amostra)' }
  ];

  const labelTypes = [
    { value: 'EAN', label: 'EAN' },
    { value: 'DUN', label: 'DUN' },
    { value: 'ANATEL', label: 'Selo ANATEL' },
    { value: 'INMETRO', label: 'Selo INMETRO' },
    { value: 'ENERGY_STAR', label: 'Energy Star' }
  ];

  const addStep = () => {
    const newStep = {
      id: `step-${Date.now()}`,
      name: '',
      type: 'non-functional',
      description: '',
      order: plan.steps.length + 1,
      samplePercentage: 30,
      items: []
    };
    
    setPlan(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
    
    setEditingStep(newStep.id);
    setShowAddStep(false);
  };

  const updateStep = (stepId: string, updates: any) => {
    setPlan(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));
  };

  const removeStep = (stepId: string) => {
    setPlan(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  const addItem = (stepId: string) => {
    const newItem = {
      id: `item-${Date.now()}`,
      description: '',
      required: true
    };
    
    updateStep(stepId, {
      items: [...plan.steps.find(s => s.id === stepId)!.items, newItem]
    });
  };

  const updateItem = (stepId: string, itemId: string, updates: any) => {
    updateStep(stepId, {
      items: plan.steps.find(s => s.id === stepId)!.items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    });
  };

  const removeItem = (stepId: string, itemId: string) => {
    updateStep(stepId, {
      items: plan.steps.find(s => s.id === stepId)!.items.filter(item => item.id !== itemId)
    });
  };

  const addLabel = () => {
    const newLabel = {
      type: 'EAN',
      required: true,
      file: '',
      url: ''
    };
    
    setPlan(prev => ({
      ...prev,
      labels: [...prev.labels, newLabel]
    }));
  };

  const updateLabel = (index: number, updates: any) => {
    setPlan(prev => ({
      ...prev,
      labels: prev.labels.map((label, i) => 
        i === index ? { ...label, ...updates } : label
      )
    }));
  };

  const removeLabel = (index: number) => {
    setPlan(prev => ({
      ...prev,
      labels: prev.labels.filter((_, i) => i !== index)
    }));
  };

  const addDocument = () => {
    const newDocument = {
      name: '',
      type: 'manual',
      url: ''
    };
    
    setPlan(prev => ({
      ...prev,
      documents: [...prev.documents, newDocument]
    }));
  };

  const updateDocument = (index: number, updates: any) => {
    setPlan(prev => ({
      ...prev,
      documents: prev.documents.map((doc, i) => 
        i === index ? { ...doc, ...updates } : doc
      )
    }));
  };

  const removeDocument = (index: number) => {
    setPlan(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (!plan.productId) {
      toast({
        title: "Produto obrigatório",
        description: "Selecione um produto para o plano",
        variant: "destructive",
      });
      return;
    }

    if (plan.steps.length === 0) {
      toast({
        title: "Etapas obrigatórias",
        description: "Adicione pelo menos uma etapa ao plano",
        variant: "destructive",
      });
      return;
    }

    if (onSave) {
      onSave(plan);
    }
    
    toast({
      title: "Plano salvo",
      description: "Plano de inspeção salvo com sucesso",
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciador de Planos de Inspeção</h2>
        <p className="text-gray-600 mt-2">Crie e configure planos de inspeção personalizados</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuração Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Configuração Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-id">Produto</Label>
              <Input
                id="product-id"
                placeholder="Selecione o produto"
                value={plan.productId}
                onChange={(e) => setPlan(prev => ({ ...prev, productId: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Versão</Label>
              <Input
                id="version"
                placeholder="1.0"
                value={plan.version}
                onChange={(e) => setPlan(prev => ({ ...prev, version: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Etiquetas Obrigatórias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Etiquetas Obrigatórias
              <Button size="sm" onClick={addLabel}>
                <Plus className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(plan.labels || []).map((label, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Select
                    value={label.type}
                    onValueChange={(value) => updateLabel(index, { type: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {labelTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={label.required}
                      onCheckedChange={(checked) => updateLabel(index, { required: checked })}
                    />
                    <span className="text-sm">Obrigatória</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeLabel(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Nome do arquivo"
                    value={label.file}
                    onChange={(e) => updateLabel(index, { file: e.target.value })}
                  />
                  <Input
                    placeholder="URL do SharePoint"
                    value={label.url}
                    onChange={(e) => updateLabel(index, { url: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Documentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Documentos
              <Button size="sm" onClick={addDocument}>
                <Plus className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(plan.documents || []).map((doc, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Input
                    placeholder="Nome do documento"
                    value={doc.name}
                    onChange={(e) => updateDocument(index, { name: e.target.value })}
                    className="flex-1 mr-2"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeDocument(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Input
                  placeholder="URL do SharePoint"
                  value={doc.url}
                  onChange={(e) => updateDocument(index, { url: e.target.value })}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Etapas da Inspeção */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Etapas da Inspeção
            <Button onClick={addStep}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Etapa
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(plan.steps || []).map((step, stepIndex) => (
              <div key={step.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <Badge variant="outline">Etapa {step.order}</Badge>
                    <Select
                      value={step.type}
                      onValueChange={(value) => updateStep(step.id, { type: value })}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {stepTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingStep(editingStep === step.id ? null : step.id)}
                    >
                      {editingStep === step.id ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeStep(step.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {editingStep === step.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome da Etapa</Label>
                        <Input
                          value={step.name}
                          onChange={(e) => updateStep(step.id, { name: e.target.value })}
                          placeholder="Ex: Materiais Gráficos"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Porcentagem da Amostra</Label>
                        <Input
                          type="number"
                          value={step.samplePercentage}
                          onChange={(e) => updateStep(step.id, { samplePercentage: Number(e.target.value) })}
                          min="1"
                          max="100"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Textarea
                        value={step.description}
                        onChange={(e) => updateStep(step.id, { description: e.target.value })}
                        placeholder="Descreva o objetivo desta etapa..."
                        rows={2}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Itens de Verificação</Label>
                        <Button size="sm" onClick={() => addItem(step.id)}>
                          <Plus className="w-4 h-4 mr-1" />
                          Adicionar Item
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {(step.items || []).map((item, itemIndex) => (
                          <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                            <Checkbox
                              checked={item.required}
                              onCheckedChange={(checked) => updateItem(step.id, item.id, { required: checked })}
                            />
                            <Input
                              value={item.description}
                              onChange={(e) => updateItem(step.id, item.id, { description: e.target.value })}
                              placeholder="Descrição do item"
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeItem(step.id, item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-medium">{step.name}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        {(step.items || []).length} itens
                      </Badge>
                      <Badge variant="outline">
                        {step.samplePercentage}% da amostra
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Salvar Plano
        </Button>
      </div>
    </div>
  );
}

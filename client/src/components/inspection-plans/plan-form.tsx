import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface PlanFormProps {
  products: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: any;
}

export default function PlanForm({ products, onSubmit, onCancel, isLoading = false, initialData }: PlanFormProps) {
  const [formData, setFormData] = useState({
    productId: initialData?.productId || "",
    version: initialData?.version || "1.0",
    steps: initialData?.steps || [{ title: "", description: "", items: [""] }],
    checklists: initialData?.checklists || [{ category: "", items: [""] }],
    requiredParameters: initialData?.requiredParameters || {}
  });

  const [parameters, setParameters] = useState([
    { key: "", min: "", max: "", unit: "", critical: false, required: true }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert parameters array to object
    const parameterObj: Record<string, any> = {};
    parameters.forEach(param => {
      if (param.key && param.min && param.max) {
        parameterObj[param.key] = {
          min: Number(param.min),
          max: Number(param.max),
          unit: param.unit,
          critical: param.critical,
          required: param.required
        };
      }
    });

    onSubmit({
      ...formData,
      requiredParameters: parameterObj,
      isActive: true
    });
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { title: "", description: "", items: [""] }]
    });
  };

  const removeStep = (index: number) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index)
    });
  };

  const updateStep = (index: number, field: string, value: any) => {
    const updated = [...formData.steps];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, steps: updated });
  };

  const addStepItem = (stepIndex: number) => {
    const updated = [...formData.steps];
    updated[stepIndex].items.push("");
    setFormData({ ...formData, steps: updated });
  };

  const removeStepItem = (stepIndex: number, itemIndex: number) => {
    const updated = [...formData.steps];
    updated[stepIndex].items = updated[stepIndex].items.filter((_, i) => i !== itemIndex);
    setFormData({ ...formData, steps: updated });
  };

  const updateStepItem = (stepIndex: number, itemIndex: number, value: string) => {
    const updated = [...formData.steps];
    updated[stepIndex].items[itemIndex] = value;
    setFormData({ ...formData, steps: updated });
  };

  const addChecklist = () => {
    setFormData({
      ...formData,
      checklists: [...formData.checklists, { category: "", items: [""] }]
    });
  };

  const removeChecklist = (index: number) => {
    setFormData({
      ...formData,
      checklists: formData.checklists.filter((_, i) => i !== index)
    });
  };

  const updateChecklist = (index: number, field: string, value: any) => {
    const updated = [...formData.checklists];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, checklists: updated });
  };

  const addChecklistItem = (checklistIndex: number) => {
    const updated = [...formData.checklists];
    updated[checklistIndex].items.push("");
    setFormData({ ...formData, checklists: updated });
  };

  const removeChecklistItem = (checklistIndex: number, itemIndex: number) => {
    const updated = [...formData.checklists];
    updated[checklistIndex].items = updated[checklistIndex].items.filter((_, i) => i !== itemIndex);
    setFormData({ ...formData, checklists: updated });
  };

  const updateChecklistItem = (checklistIndex: number, itemIndex: number, value: string) => {
    const updated = [...formData.checklists];
    updated[checklistIndex].items[itemIndex] = value;
    setFormData({ ...formData, checklists: updated });
  };

  const addParameter = () => {
    setParameters([...parameters, { key: "", min: "", max: "", unit: "", critical: false, required: true }]);
  };

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const updateParameter = (index: number, field: string, value: any) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    setParameters(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Informações Básicas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="productId">Produto*</Label>
              <Select 
                value={formData.productId} 
                onValueChange={(value) => setFormData({ ...formData, productId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.code} - {product.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="version">Versão*</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="Ex: 1.0, 2.1"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inspection Steps */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-800">Etapas de Inspeção</h3>
            <Button type="button" variant="outline" size="sm" onClick={addStep}>
              <span className="material-icons mr-1 text-sm">add</span>
              Adicionar Etapa
            </Button>
          </div>

          <div className="space-y-4">
            {formData.steps.map((step, stepIndex) => (
              <div key={stepIndex} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-neutral-700">Etapa {stepIndex + 1}</h4>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeStep(stepIndex)}
                    disabled={formData.steps.length === 1}
                  >
                    <span className="material-icons text-sm">remove</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Título da Etapa</Label>
                    <Input
                      value={step.title}
                      onChange={(e) => updateStep(stepIndex, 'title', e.target.value)}
                      placeholder="Ex: Preparação Inicial"
                    />
                  </div>

                  <div>
                    <Label>Descrição</Label>
                    <Textarea
                      value={step.description}
                      onChange={(e) => updateStep(stepIndex, 'description', e.target.value)}
                      placeholder="Descrição detalhada da etapa"
                      rows={2}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Itens da Etapa</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => addStepItem(stepIndex)}
                      >
                        <span className="material-icons mr-1 text-xs">add</span>
                        Item
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {step.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-2">
                          <Input
                            value={item}
                            onChange={(e) => updateStepItem(stepIndex, itemIndex, e.target.value)}
                            placeholder="Descreva o item da etapa"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeStepItem(stepIndex, itemIndex)}
                            disabled={step.items.length === 1}
                          >
                            <span className="material-icons text-sm">remove</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Checklists */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-800">Listas de Verificação</h3>
            <Button type="button" variant="outline" size="sm" onClick={addChecklist}>
              <span className="material-icons mr-1 text-sm">add</span>
              Adicionar Lista
            </Button>
          </div>

          <div className="space-y-4">
            {formData.checklists.map((checklist, checklistIndex) => (
              <div key={checklistIndex} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-neutral-700">Lista {checklistIndex + 1}</h4>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeChecklist(checklistIndex)}
                    disabled={formData.checklists.length === 1}
                  >
                    <span className="material-icons text-sm">remove</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Categoria</Label>
                    <Input
                      value={checklist.category}
                      onChange={(e) => updateChecklist(checklistIndex, 'category', e.target.value)}
                      placeholder="Ex: Verificação Visual, Testes Funcionais"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Itens de Verificação</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => addChecklistItem(checklistIndex)}
                      >
                        <span className="material-icons mr-1 text-xs">add</span>
                        Item
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {checklist.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-2">
                          <Input
                            value={item}
                            onChange={(e) => updateChecklistItem(checklistIndex, itemIndex, e.target.value)}
                            placeholder="Item de verificação"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeChecklistItem(checklistIndex, itemIndex)}
                            disabled={checklist.items.length === 1}
                          >
                            <span className="material-icons text-sm">remove</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Required Parameters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-800">Parâmetros Obrigatórios</h3>
            <Button type="button" variant="outline" size="sm" onClick={addParameter}>
              <span className="material-icons mr-1 text-sm">add</span>
              Adicionar Parâmetro
            </Button>
          </div>

          <div className="space-y-3">
            {parameters.map((param, index) => (
              <div key={index} className="flex items-end gap-3 p-3 border border-neutral-200 rounded-lg">
                <div className="flex-1">
                  <Label>Parâmetro</Label>
                  <Input
                    value={param.key}
                    onChange={(e) => updateParameter(index, 'key', e.target.value)}
                    placeholder="Ex: Vácuo, RPM"
                  />
                </div>
                <div className="w-24">
                  <Label>Mín.</Label>
                  <Input
                    type="number"
                    value={param.min}
                    onChange={(e) => updateParameter(index, 'min', e.target.value)}
                    placeholder="160"
                  />
                </div>
                <div className="w-24">
                  <Label>Máx.</Label>
                  <Input
                    type="number"
                    value={param.max}
                    onChange={(e) => updateParameter(index, 'max', e.target.value)}
                    placeholder="200"
                  />
                </div>
                <div className="w-20">
                  <Label>Unidade</Label>
                  <Input
                    value={param.unit}
                    onChange={(e) => updateParameter(index, 'unit', e.target.value)}
                    placeholder="mBar"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="flex items-center">
                    <Checkbox
                      checked={param.critical}
                      onCheckedChange={(checked) => updateParameter(index, 'critical', checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Crítico</span>
                  </Label>
                  <Label className="flex items-center">
                    <Checkbox
                      checked={param.required}
                      onCheckedChange={(checked) => updateParameter(index, 'required', checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Obrigatório</span>
                  </Label>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeParameter(index)}
                  disabled={parameters.length === 1}
                >
                  <span className="material-icons text-sm">remove</span>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar Plano"}
        </Button>
      </div>
    </form>
  );
}

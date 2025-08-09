import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { BUSINESS_UNITS } from "@/lib/constants";

interface ProductFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: any;
}

export default function ProductForm({ onSubmit, onCancel, isLoading = false, initialData }: ProductFormProps) {
  const [formData, setFormData] = useState({
    code: initialData?.code || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    businessUnit: initialData?.businessUnit || "",
    technicalParameters: initialData?.technicalParameters || {}
  });

  const [technicalParams, setTechnicalParams] = useState([
    { key: "", value: "", unit: "" }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert technical parameters array to object
    const parameters: Record<string, any> = {};
    technicalParams.forEach(param => {
      if (param.key && param.value) {
        parameters[param.key] = {
          value: param.value,
          unit: param.unit || ""
        };
      }
    });

    onSubmit({
      ...formData,
      technicalParameters: Object.keys(parameters).length > 0 ? parameters : null
    });
  };

  const addTechnicalParam = () => {
    setTechnicalParams([...technicalParams, { key: "", value: "", unit: "" }]);
  };

  const removeTechnicalParam = (index: number) => {
    setTechnicalParams(technicalParams.filter((_, i) => i !== index));
  };

  const updateTechnicalParam = (index: number, field: string, value: string) => {
    const updated = [...technicalParams];
    updated[index] = { ...updated[index], [field]: value };
    setTechnicalParams(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Informações Básicas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Código do Produto*</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ex: FW009547"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="category">Categoria*</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Aspirador Pó/Água"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="description">Descrição*</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Aspirador WAP GTW Inox 20L"
              rows={3}
              required
            />
          </div>

          <div className="mt-4">
            <Label htmlFor="businessUnit">Unidade de Negócio*</Label>
            <Select 
              value={formData.businessUnit} 
              onValueChange={(value) => setFormData({ ...formData, businessUnit: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a unidade de negócio" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BUSINESS_UNITS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Technical Parameters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-800">Parâmetros Técnicos</h3>
            <Button type="button" variant="outline" size="sm" onClick={addTechnicalParam}>
              <span className="material-icons mr-1 text-sm">add</span>
              Adicionar
            </Button>
          </div>

          <div className="space-y-3">
            {technicalParams.map((param, index) => (
              <div key={index} className="flex items-end gap-3">
                <div className="flex-1">
                  <Label>Nome do Parâmetro</Label>
                  <Input
                    value={param.key}
                    onChange={(e) => updateTechnicalParam(index, 'key', e.target.value)}
                    placeholder="Ex: Vácuo, RPM, Potência"
                  />
                </div>
                <div className="flex-1">
                  <Label>Valor/Faixa</Label>
                  <Input
                    value={param.value}
                    onChange={(e) => updateTechnicalParam(index, 'value', e.target.value)}
                    placeholder="Ex: 180, 1400-1600"
                  />
                </div>
                <div className="w-24">
                  <Label>Unidade</Label>
                  <Input
                    value={param.unit}
                    onChange={(e) => updateTechnicalParam(index, 'unit', e.target.value)}
                    placeholder="Ex: mBar, W"
                  />
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeTechnicalParam(index)}
                  disabled={technicalParams.length === 1}
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
          {isLoading ? "Salvando..." : "Salvar Produto"}
        </Button>
      </div>
    </form>
  );
}

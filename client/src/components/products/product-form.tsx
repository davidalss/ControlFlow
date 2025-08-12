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
    ean: initialData?.ean || "", // New field
    description: initialData?.description || "",
    category: initialData?.category || "",
    businessUnit: initialData?.businessUnit || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
              <Label htmlFor="ean">EAN</Label>
              <Input
                id="ean"
                value={formData.ean}
                onChange={(e) => setFormData({ ...formData, ean: e.target.value })}
                placeholder="Ex: 7891234567890"
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

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export interface ProductFormData {
  code: string;
  description: string;
  ean?: string;
  category: string;
  family?: string;
  businessUnit: 'DIY' | 'TECH' | 'KITCHEN_BEAUTY' | 'MOTOR_COMFORT' | 'N/A';
  technicalParameters?: {
    voltagem?: string;
    familia_grupos?: string;
    peso_bruto?: string;
    tipo_exclusividade?: string;
    origem?: string;
    familia_comercial?: string;
    classificacao_fiscal?: string;
    aliquota_ipi?: number;
    multiplo_pedido?: number;
    dt_implant?: string;
  };
}

interface ProductFormProps {
  product?: ProductFormData;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const categories = [
  "Ar e Climatização",
  "Cozinha", 
  "Robô Aspirador",
  "Limpeza",
  "Ferramentas",
  "Jardinagem",
  "Áudio e Vídeo",
  "Eletroportáteis",
  "Vaporizadores",
  "Outros"
];

const businessUnits = [
  { value: 'DIY', label: 'DIY' },
  { value: 'TECH', label: 'TECH' },
  { value: 'KITCHEN_BEAUTY', label: 'Cozinha & Beleza' },
  { value: 'MOTOR_COMFORT', label: 'Motores & Conforto' },
  { value: 'N/A', label: 'Não Classificado' }
];

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    code: '',
    description: '',
    ean: '',
    category: '',
    family: '',
    businessUnit: 'N/A',
    technicalParameters: {}
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (product) {
        // Update existing product
        await apiRequest('PATCH', `/api/products/${product.code}`, formData);
        toast({
          title: "Produto atualizado",
          description: "O produto foi atualizado com sucesso.",
        });
      } else {
        // Create new product
        await apiRequest('POST', '/api/products', formData);
        toast({
          title: "Produto criado",
          description: "O produto foi criado com sucesso.",
        });
      }
      
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar o produto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateTechnicalParameter = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      technicalParameters: {
        ...prev.technicalParameters,
        [field]: value
      }
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {product ? 'Editar Produto' : 'Novo Produto'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código do Produto *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => updateFormData('code', e.target.value)}
                placeholder="Ex: FW011424"
                required
                disabled={!!product} // Cannot change code when editing
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ean">Código EAN</Label>
              <Input
                id="ean"
                value={formData.ean || ''}
                onChange={(e) => updateFormData('ean', e.target.value)}
                placeholder="Ex: 7899831343843"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Ex: WAP WL 6100 ULTRA 220V"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="family">Família</Label>
              <Input
                id="family"
                value={formData.family || ''}
                onChange={(e) => updateFormData('family', e.target.value)}
                placeholder="Ex: lavadora - intensivo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessUnit">Business Unit *</Label>
              <Select value={formData.businessUnit} onValueChange={(value: any) => updateFormData('businessUnit', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma BU" />
                </SelectTrigger>
                <SelectContent>
                  {businessUnits.map(bu => (
                    <SelectItem key={bu.value} value={bu.value}>
                      {bu.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Technical Parameters */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Parâmetros Técnicos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="voltagem">Voltagem</Label>
                <Input
                  id="voltagem"
                  value={formData.technicalParameters?.voltagem || ''}
                  onChange={(e) => updateTechnicalParameter('voltagem', e.target.value)}
                  placeholder="Ex: 220V"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="peso_bruto">Peso Bruto (kg)</Label>
                <Input
                  id="peso_bruto"
                  value={formData.technicalParameters?.peso_bruto || ''}
                  onChange={(e) => updateTechnicalParameter('peso_bruto', e.target.value)}
                  placeholder="Ex: 24.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="familia_grupos">Família (Grupos)</Label>
                <Input
                  id="familia_grupos"
                  value={formData.technicalParameters?.familia_grupos || ''}
                  onChange={(e) => updateTechnicalParameter('familia_grupos', e.target.value)}
                  placeholder="Ex: Lavadoras"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_exclusividade">Tipo de Exclusividade</Label>
                <Input
                  id="tipo_exclusividade"
                  value={formData.technicalParameters?.tipo_exclusividade || ''}
                  onChange={(e) => updateTechnicalParameter('tipo_exclusividade', e.target.value)}
                  placeholder="Ex: CATALOGO ABERTO"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origem">Origem</Label>
                <Input
                  id="origem"
                  value={formData.technicalParameters?.origem || ''}
                  onChange={(e) => updateTechnicalParameter('origem', e.target.value)}
                  placeholder="Ex: Estrangeira"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="familia_comercial">Família Comercial</Label>
                <Input
                  id="familia_comercial"
                  value={formData.technicalParameters?.familia_comercial || ''}
                  onChange={(e) => updateTechnicalParameter('familia_comercial', e.target.value)}
                  placeholder="Ex: lavadora - intensivo"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="classificacao_fiscal">Classificação Fiscal</Label>
                <Input
                  id="classificacao_fiscal"
                  value={formData.technicalParameters?.classificacao_fiscal || ''}
                  onChange={(e) => updateTechnicalParameter('classificacao_fiscal', e.target.value)}
                  placeholder="Ex: 84243010"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aliquota_ipi">Alíquota IPI (%)</Label>
                <Input
                  id="aliquota_ipi"
                  type="number"
                  step="0.01"
                  value={formData.technicalParameters?.aliquota_ipi || ''}
                  onChange={(e) => updateTechnicalParameter('aliquota_ipi', parseFloat(e.target.value) || null)}
                  placeholder="Ex: 0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="multiplo_pedido">Múltiplo do Pedido</Label>
                <Input
                  id="multiplo_pedido"
                  type="number"
                  value={formData.technicalParameters?.multiplo_pedido || ''}
                  onChange={(e) => updateTechnicalParameter('multiplo_pedido', parseInt(e.target.value) || null)}
                  placeholder="Ex: 1"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Salvando...' : (product ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

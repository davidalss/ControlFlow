import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, X } from 'lucide-react';
import { Product, CreateProductData, UpdateProductData } from '@/hooks/use-products';

interface ProductFormProps {
  product?: Product;
  onSave: (data: CreateProductData | UpdateProductData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const CATEGORIES = [
  'Ventiladores',
  'Ferramentas',
  'Lavadoras',
  'Cozinha',
  'Jardinagem',
  'Soluções de Limpeza'
];

const BUSINESS_UNITS = [
  'MOTOR_COMFORT',
  'DIY',
  'KITCHEN_BEAUTY',
  'N/A'
];

const FAMILIES = [
  'Ventiladores de Mesa',
  'Ventiladores de Parede',
  'Ventiladores de Teto',
  'Ferramentas Manuais',
  'Ferramentas Elétricas',
  'Lavadoras de Roupas',
  'Lavadoras de Louças',
  'Eletrodomésticos de Cozinha',
  'Utensílios de Cozinha',
  'Ferramentas de Jardinagem',
  'Produtos de Limpeza'
];

export function ProductForm({ product, onSave, onCancel, isLoading = false }: ProductFormProps) {
  const [formData, setFormData] = useState<CreateProductData>({
    code: '',
    description: '',
    ean: '',
    category: '',
    family: '',
    businessUnit: '',
    technicalParameters: {}
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preencher formulário quando editar produto existente
  useEffect(() => {
    if (product) {
      setFormData({
        code: product.code || '',
        description: product.description || '',
        ean: product.ean || '',
        category: product.category || '',
        family: product.family || '',
        businessUnit: product.businessUnit || '',
        technicalParameters: product.technicalParameters || {}
      });
    }
  }, [product]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Código é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const dataToSave = product 
      ? { ...formData, id: product.id } as UpdateProductData
      : formData as CreateProductData;

    onSave(dataToSave);
  };

  const handleInputChange = (field: keyof CreateProductData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTechnicalParametersChange = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      setFormData(prev => ({ ...prev, technicalParameters: parsed }));
    } catch (error) {
      // Se não for JSON válido, manter como string
      setFormData(prev => ({ ...prev, technicalParameters: { raw: value } }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {product ? 'Editar Produto' : 'Novo Produto'}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Código */}
          <div className="space-y-2">
            <Label htmlFor="code">Código *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              placeholder="Digite o código do produto"
              className={errors.code ? 'border-red-500' : ''}
            />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Digite a descrição do produto"
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* EAN */}
          <div className="space-y-2">
            <Label htmlFor="ean">EAN</Label>
            <Input
              id="ean"
              value={formData.ean}
              onChange={(e) => handleInputChange('ean', e.target.value)}
              placeholder="Digite o código EAN"
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Família */}
          <div className="space-y-2">
            <Label htmlFor="family">Família</Label>
            <Select
              value={formData.family}
              onValueChange={(value) => handleInputChange('family', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma família" />
              </SelectTrigger>
              <SelectContent>
                {FAMILIES.map((family) => (
                  <SelectItem key={family} value={family}>
                    {family}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Business Unit */}
          <div className="space-y-2">
            <Label htmlFor="businessUnit">Business Unit</Label>
            <Select
              value={formData.businessUnit}
              onValueChange={(value) => handleInputChange('businessUnit', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma Business Unit" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_UNITS.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Parâmetros Técnicos */}
          <div className="space-y-2">
            <Label htmlFor="technicalParameters">Parâmetros Técnicos (JSON)</Label>
            <Textarea
              id="technicalParameters"
              value={JSON.stringify(formData.technicalParameters, null, 2)}
              onChange={(e) => handleTechnicalParametersChange(e.target.value)}
              placeholder='{"parametro1": "valor1", "parametro2": "valor2"}'
              rows={4}
            />
            <p className="text-xs text-gray-500">
              Digite os parâmetros técnicos em formato JSON
            </p>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {product ? 'Atualizar' : 'Criar'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, X } from 'lucide-react';
import { Product, CreateProductData, UpdateProductData } from '@/hooks/use-products';
import { useLogger } from '@/lib/logger';

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



export function ProductForm({ product, onSave, onCancel, isLoading = false }: ProductFormProps) {
  const logger = useLogger('ProductForm');
  const [formData, setFormData] = useState<CreateProductData>({
    code: '',
    description: '',
    ean: '',
    category: '',
    businessUnit: ''
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
        businessUnit: product.businessUnit || ''
      });
      logger.info('form_populated', 'Formulário preenchido com dados do produto', { 
        productId: product.id, 
        productCode: product.code 
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
    
    const isValid = Object.keys(newErrors).length === 0;
    
    if (!isValid) {
      logger.warn('form_validation_failed', 'Validação do formulário falhou', { errors: newErrors });
    }
    
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const dataToSave = product 
      ? { ...formData, id: product.id } as UpdateProductData
      : formData as CreateProductData;

    logger.info('form_submit', 'Enviando formulário', { 
      isEdit: !!product, 
      productId: product?.id,
      formData: dataToSave 
    });

    onSave(dataToSave);
  };

  const handleInputChange = (field: keyof CreateProductData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
              disabled={isLoading}
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



          {/* Business Unit */}
          <div className="space-y-2">
            <Label htmlFor="businessUnit">Business Unit</Label>
            <Select
              value={formData.businessUnit}
              onValueChange={(value) => handleInputChange('businessUnit', value)}
              disabled={isLoading}
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
                  {product ? 'Atualizando...' : 'Criando...'}
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

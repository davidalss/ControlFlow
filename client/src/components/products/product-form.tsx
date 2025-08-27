import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Textarea } from '@/components/ui/textarea';

import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, X, Plus, Trash2, Zap, Package } from 'lucide-react';
import { Product, CreateProductData, UpdateProductData, VoltageVariant } from '@/hooks/use-products-supabase';
import { logger } from '@/lib/logger';

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
  const [formData, setFormData] = useState<CreateProductData>({
    code: '',
    description: '',
    ean: '',
    category: '',
    business_unit: 'N/A'
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
        business_unit: product.business_unit || ''
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

    if (!formData.business_unit) {
      newErrors.business_unit = 'Business Unit é obrigatória';
    }

    setErrors(newErrors);
    
    const isValid = Object.keys(newErrors).length === 0;
    
    if (!isValid) {
      // Validação falhou
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
     <div className="w-full max-w-2xl mx-auto">
       <div className="flex items-center justify-between mb-4">
         <h2 className="text-lg font-semibold">
           {product ? 'Editar Produto' : 'Novo Produto'}
         </h2>
         <Button
           variant="ghost"
           size="sm"
           onClick={onCancel}
           disabled={isLoading}
         >
           <X className="h-4 w-4" />
         </Button>
       </div>
       <div>
         <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                     {/* Código */}
           <div className="space-y-1 sm:space-y-2">
             <Label htmlFor="code" className="text-sm sm:text-base">Código *</Label>
             <Input
               id="code"
               value={formData.code}
               onChange={(e) => handleInputChange('code', e.target.value)}
               placeholder="Digite o código do produto"
               className={`${errors.code ? 'border-red-500' : ''} text-sm sm:text-base`}
               disabled={isLoading}
             />
             {errors.code && (
               <p className="text-xs sm:text-sm text-red-500">{errors.code}</p>
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
           <div className="space-y-1 sm:space-y-2">
             <Label htmlFor="category" className="text-sm sm:text-base">Categoria *</Label>
             <select
               id="category"
               value={formData.category}
               onChange={(e) => handleInputChange('category', e.target.value)}
               disabled={isLoading}
               className={`w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.category ? 'border-red-500' : ''}`}
             >
               <option value="">Selecione uma categoria</option>
               {CATEGORIES.map((category) => (
                 <option key={category} value={category}>
                   {category}
                 </option>
               ))}
             </select>
             {errors.category && (
               <p className="text-xs sm:text-sm text-red-500">{errors.category}</p>
             )}
           </div>

                     {/* Business Unit */}
           <div className="space-y-1 sm:space-y-2">
             <Label htmlFor="business_unit" className="text-sm sm:text-base">Business Unit *</Label>
             <select
               id="business_unit"
               value={formData.business_unit}
               onChange={(e) => handleInputChange('business_unit', e.target.value)}
               disabled={isLoading}
               className={`w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.business_unit ? 'border-red-500' : ''}`}
             >
               <option value="">Selecione uma Business Unit</option>
               {BUSINESS_UNITS.map((unit) => (
                 <option key={unit} value={unit}>
                   {unit}
                 </option>
               ))}
             </select>
             {errors.business_unit && (
               <p className="text-xs sm:text-sm text-red-500">{errors.business_unit}</p>
             )}
           </div>

                     {/* Botões */}
           <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
             <Button
               type="button"
               variant="outline"
               onClick={onCancel}
               disabled={isLoading}
               className="w-full sm:w-auto"
             >
               Cancelar
             </Button>
             <Button
               type="submit"
               disabled={isLoading}
               className="w-full sm:w-auto min-w-[100px]"
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
      </div>
    </div>
  );
}

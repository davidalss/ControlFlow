import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { Supplier, CreateSupplierData, UpdateSupplierData } from '@/hooks/use-suppliers-supabase';

interface SupplierFormProps {
  supplier?: Supplier;
  onSave: (data: CreateSupplierData | UpdateSupplierData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  products?: any[];
}

export function SupplierForm({ supplier, onSave, onCancel, isLoading = false, products = [] }: SupplierFormProps) {
  const [formData, setFormData] = useState<CreateSupplierData>({
    code: '',
    name: '',
    type: 'national',
    country: '',
    category: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    observations: '',
    productIds: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [productSearchTerm, setProductSearchTerm] = useState('');

  // Preencher formulário quando editar fornecedor existente
  useEffect(() => {
    if (supplier) {
      setFormData({
        code: supplier.code || '',
        name: supplier.name || '',
        type: supplier.type || 'national',
        country: supplier.country || '',
        category: supplier.category || '',
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        website: supplier.website || '',
        observations: supplier.observations || '',
        productIds: [],
      });
    }
  }, [supplier]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Código é obrigatório';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'País é obrigatório';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contato é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
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

    const dataToSave = supplier 
      ? { ...formData, id: supplier.id } as UpdateSupplierData
      : formData as CreateSupplierData;

    onSave(dataToSave);
  };

  const handleInputChange = (field: keyof CreateSupplierData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleProductToggle = (productId: string) => {
    const currentProducts = formData.productIds || [];
    if (currentProducts.includes(productId)) {
      setFormData(prev => ({
        ...prev,
        productIds: currentProducts.filter(id => id !== productId)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        productIds: [...currentProducts, productId]
      }));
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Código */}
          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm">Código *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              placeholder="SUP001"
              className={`${errors.code ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {errors.code && (
              <p className="text-xs text-red-500">{errors.code}</p>
            )}
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nome do fornecedor"
              className={`${errors.name ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm">Tipo *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleInputChange('type', value)}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="national">Nacional</SelectItem>
                <SelectItem value="imported">Importado</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-xs text-red-500">{errors.type}</p>
            )}
          </div>

          {/* País */}
          <div className="space-y-2">
            <Label htmlFor="country" className="text-sm">País *</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              placeholder="Brasil"
              className={`${errors.country ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {errors.country && (
              <p className="text-xs text-red-500">{errors.country}</p>
            )}
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm">Categoria *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleInputChange('category', value)}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Componentes Eletrônicos">Componentes Eletrônicos</SelectItem>
                <SelectItem value="Motores e Bombas">Motores e Bombas</SelectItem>
                <SelectItem value="Componentes Mecânicos">Componentes Mecânicos</SelectItem>
                <SelectItem value="WAP WL 6100 ULTRA">WAP WL 6100 ULTRA</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Contato */}
          <div className="space-y-2">
            <Label htmlFor="contactPerson" className="text-sm">Contato *</Label>
            <Input
              id="contactPerson"
              value={formData.contactPerson}
              onChange={(e) => handleInputChange('contactPerson', e.target.value)}
              placeholder="Nome do contato"
              className={`${errors.contactPerson ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {errors.contactPerson && (
              <p className="text-xs text-red-500">{errors.contactPerson}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="contato@fornecedor.com"
              className={`${errors.email ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm">Telefone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+55 11 99999-9999"
              className={`${errors.phone ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Endereço completo"
              disabled={isLoading}
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website" className="text-sm">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://www.fornecedor.com"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-2">
          <Label htmlFor="observations" className="text-sm">Observações</Label>
          <Textarea
            id="observations"
            value={formData.observations}
            onChange={(e) => handleInputChange('observations', e.target.value)}
            placeholder="Observações adicionais"
            rows={3}
            disabled={isLoading}
          />
        </div>

        {/* Produtos Vinculados */}
        <div className="space-y-2">
          <Label className="text-sm">Produtos Vinculados</Label>
          
          {/* Campo de busca */}
          <div className="mb-3">
            <Input
              placeholder="Buscar por código ou nome do produto..."
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              className="text-sm"
              disabled={isLoading}
            />
          </div>
          
          <div className="border rounded-lg p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
            {products && products.length > 0 ? (
              <div className="space-y-2">
                {products
                  .filter(product => 
                    productSearchTerm === '' || 
                    product.code.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                    product.description.toLowerCase().includes(productSearchTerm.toLowerCase())
                  )
                  .slice(0, 15)
                  .map((product) => (
                    <div key={product.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        id={`product-${product.id}`}
                        className="rounded"
                        checked={formData.productIds?.includes(product.id) || false}
                        onChange={() => handleProductToggle(product.id)}
                        disabled={isLoading}
                      />
                      <label htmlFor={`product-${product.id}`} className="text-sm cursor-pointer flex-1">
                        <span className="font-medium text-blue-600">{product.code}</span>
                        <span className="text-gray-600 ml-2">- {product.description}</span>
                      </label>
                      {formData.productIds?.includes(product.id) && (
                        <span className="text-xs text-green-600 font-medium">Vinculado</span>
                      )}
                    </div>
                  ))}
                {products.filter(product => 
                  productSearchTerm === '' || 
                  product.code.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                  product.description.toLowerCase().includes(productSearchTerm.toLowerCase())
                ).length === 0 && productSearchTerm !== '' && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum produto encontrado para "{productSearchTerm}"
                  </p>
                )}
                {products.filter(product => 
                  productSearchTerm === '' || 
                  product.code.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                  product.description.toLowerCase().includes(productSearchTerm.toLowerCase())
                ).length > 15 && (
                  <p className="text-xs text-gray-500 text-center">
                    Mostrando 15 de {products.filter(product => 
                      productSearchTerm === '' || 
                      product.code.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                      product.description.toLowerCase().includes(productSearchTerm.toLowerCase())
                    ).length} produtos encontrados.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhum produto disponível</p>
            )}
          </div>
          
          {/* Resumo dos produtos vinculados */}
          {formData.productIds && formData.productIds.length > 0 && (
            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-700 font-medium mb-1">
                Produtos Vinculados ({formData.productIds.length}):
              </p>
              <div className="flex flex-wrap gap-1">
                {formData.productIds.map(productId => {
                  const product = products.find(p => p.id === productId);
                  return product ? (
                    <span key={productId} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {product.code}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : (supplier ? 'Salvar Alterações' : 'Criar Fornecedor')}
          </Button>
        </div>
      </form>
    </div>
  );
}

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Zap, Package, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DuplicatePlanModalProps {
  plan: any;
  onDuplicate: (newPlan: any) => void;
  trigger?: React.ReactNode;
}

export function DuplicatePlanModal({ plan, onDuplicate, trigger }: DuplicatePlanModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    newPlanCode: `${plan?.planCode || 'PLAN'}-COPY`,
    newProductCode: plan?.productCode || '',
    newProductName: plan?.productName || '',
    newVoltage: '',
    modifications: {
      planName: `${plan?.planName || 'Plano'} - Cópia`,
      observations: plan?.observations || '',
      specialInstructions: plan?.specialInstructions || ''
    }
  });

  const voltageOptions = [
    { value: '127V', label: '127V' },
    { value: '220V', label: '220V' },
    { value: '110V', label: '110V' },
    { value: '240V', label: '240V' },
    { value: '380V', label: '380V' }
  ];

  const handleDuplicate = async () => {
    if (!formData.newPlanCode || !formData.newProductCode || !formData.newProductName) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/inspection-plans/${plan.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erro ao duplicar plano');
      }

      const result = await response.json();
      
      toast({
        title: "Plano duplicado!",
        description: "O plano foi duplicado com sucesso",
      });

      onDuplicate(result.newPlan);
      setOpen(false);
    } catch (error) {
      console.error('Erro ao duplicar plano:', error);
      toast({
        title: "Erro",
        description: "Erro ao duplicar o plano de inspeção",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('modifications.')) {
      const subField = field.replace('modifications.', '');
      setFormData(prev => ({
        ...prev,
        modifications: {
          ...prev.modifications,
          [subField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Duplicar Plano
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Duplicar Plano de Inspeção
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Plano Original */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Plano Original</CardTitle>
              <CardDescription>Informações do plano que será duplicado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Código</Label>
                  <p className="font-medium">{plan?.planCode}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Nome</Label>
                  <p className="font-medium">{plan?.planName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Produto</Label>
                  <p className="font-medium">{plan?.productName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Versão</Label>
                  <Badge variant="secondary">{plan?.version}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações do Novo Plano */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Novo Plano</CardTitle>
              <CardDescription>Configure as informações do novo plano</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPlanCode">Código do Plano *</Label>
                  <Input
                    id="newPlanCode"
                    value={formData.newPlanCode}
                    onChange={(e) => handleInputChange('newPlanCode', e.target.value)}
                    placeholder="Ex: PCG02.050"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newProductCode">Código do Produto *</Label>
                  <Input
                    id="newProductCode"
                    value={formData.newProductCode}
                    onChange={(e) => handleInputChange('newProductCode', e.target.value)}
                    placeholder="Ex: PROD001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newProductName">Nome do Produto *</Label>
                <Input
                  id="newProductName"
                  value={formData.newProductName}
                  onChange={(e) => handleInputChange('newProductName', e.target.value)}
                  placeholder="Ex: Air Fryer Barbecue 220V"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newVoltage">Voltagem</Label>
                <Select value={formData.newVoltage} onValueChange={(value) => handleInputChange('newVoltage', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a voltagem" />
                  </SelectTrigger>
                  <SelectContent>
                    {voltageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPlanName">Nome do Plano</Label>
                <Input
                  id="newPlanName"
                  value={formData.modifications.planName}
                  onChange={(e) => handleInputChange('modifications.planName', e.target.value)}
                  placeholder="Nome do novo plano"
                />
              </div>
            </CardContent>
          </Card>

          {/* Modificações Automáticas */}
          {formData.newVoltage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Modificações Automáticas
                </CardTitle>
                <CardDescription>
                  As seguintes modificações serão aplicadas automaticamente:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-blue-500" />
                    <span>Substituir referências de voltagem nos passos de inspeção</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-green-500" />
                    <span>Atualizar checklists com nova voltagem</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span>Modificar parâmetros técnicos relacionados à voltagem</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.modifications.observations}
                onChange={(e) => handleInputChange('modifications.observations', e.target.value)}
                placeholder="Observações sobre o novo plano..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Instruções Especiais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Instruções Especiais</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.modifications.specialInstructions}
                onChange={(e) => handleInputChange('modifications.specialInstructions', e.target.value)}
                placeholder="Instruções especiais para o novo plano..."
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleDuplicate} disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Duplicando...
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Duplicar Plano
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

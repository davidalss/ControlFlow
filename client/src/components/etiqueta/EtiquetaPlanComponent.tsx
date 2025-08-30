import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EtiquetaService } from '@/lib/etiqueta/service';
import { toast } from '@/components/ui/use-toast';

const TIPOS_ETIQUETA = [
  { value: 'EAN', label: 'EAN' },
  { value: 'DUN', label: 'DUN' },
  { value: 'ENCE', label: 'ENCE' },
  { value: 'ANATEL', label: 'ANATEL' },
  { value: 'INMETRO', label: 'INMETRO' },
  { value: 'ENERGY', label: 'ENERGY' },
  { value: 'QR_CODE', label: 'QR Code' }
];

interface EtiquetaPlanProps {
  inspectionPlanId: string;
  stepId: string;
  onSuccess?: () => void;
}

export function EtiquetaPlanComponent({ 
  inspectionPlanId,
  stepId,
  onSuccess
}: EtiquetaPlanProps) {
  const [selectedType, setSelectedType] = useState('');
  const [limiteSimilaridade, setLimiteSimilaridade] = useState(90);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const etiquetaService = new EtiquetaService();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setArquivo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivo) return;

    setLoading(true);
    try {
      await etiquetaService.createEtiquetaQuestion({
        inspection_plan_id: inspectionPlanId,
        step_id: stepId,
        tipo_etiqueta: selectedType as any,
        arquivo_referencia: arquivo,
        limite_aprovacao: limiteSimilaridade / 100
      });

      toast({
        title: "Sucesso",
        description: "Pergunta de etiqueta criada com sucesso",
      });

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao criar pergunta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a pergunta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Tipo de Etiqueta</Label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_ETIQUETA.map((tipo) => (
                <SelectItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Percentual Mínimo de Similaridade (%)</Label>
          <Input
            type="number"
            min="1"
            max="100"
            value={limiteSimilaridade}
            onChange={(e) => setLimiteSimilaridade(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label>Arquivo de Referência</Label>
          <Input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
          />
          <p className="text-sm text-gray-500">
            Aceita PDF, PNG, JPG ou JPEG
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={loading || !arquivo || !selectedType}>
          {loading ? 'Salvando...' : 'Salvar Etiqueta'}
        </Button>
      </form>
    </Card>
  );
}

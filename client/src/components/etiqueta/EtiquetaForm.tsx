import { useState } from 'react';
import { useEtiquetas } from '@/hooks/use-etiquetas';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { uploadEtiquetaReferencia } from '@/lib/etiqueta/storage';

const TIPOS_ETIQUETA = [
  { value: 'EAN', label: 'EAN' },
  { value: 'DUN', label: 'DUN' },
  { value: 'ENCE', label: 'ENCE' },
  { value: 'ANATEL', label: 'ANATEL' },
  { value: 'INMETRO', label: 'INMETRO' },
  { value: 'ENERGY', label: 'ENERGY' },
  { value: 'QR_CODE', label: 'QR Code' }
];

interface EtiquetaFormProps {
  planId: string;
  stepId: string;
  onSuccess?: () => void;
}

export function EtiquetaForm({
  planId,
  stepId,
  onSuccess
}: EtiquetaFormProps) {
  const [selectedType, setSelectedType] = useState('');
  const [limiteSimilaridade, setLimiteSimilaridade] = useState(90);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const { addEtiqueta } = useEtiquetas(planId);

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
      // 1. Upload do arquivo
      const etiquetaId = crypto.randomUUID();
      const fileUrl = await uploadEtiquetaReferencia(arquivo, etiquetaId);

      // 2. Criar pergunta
      await addEtiqueta({
        inspection_plan_id: planId,
        step_id: stepId,
        tipo_etiqueta: selectedType as any,
        arquivo_referencia: fileUrl,
        limite_aprovacao: limiteSimilaridade / 100
      });

      toast({
        title: 'Sucesso',
        description: 'Etiqueta adicionada ao plano'
      });

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao criar etiqueta:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a etiqueta',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Tipo de Etiqueta</Label>
          <Select 
            value={selectedType}
            onValueChange={setSelectedType}
            placeholder="Selecione o tipo"
          >
            {TIPOS_ETIQUETA.map(tipo => (
              <Select.Option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div>
          <Label>Percentual Mínimo de Similaridade (%)</Label>
          <Input
            type="number"
            min="1"
            max="100"
            value={limiteSimilaridade}
            onChange={(e) => setLimiteSimilaridade(Number(e.target.value))}
          />
          <p className="text-xs text-gray-500 mt-1">
            Define o % mínimo de similaridade para aprovação
          </p>
        </div>

        <div>
          <Label>Arquivo de Referência</Label>
          <Input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload da etiqueta de referência (PDF, PNG, JPG)
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={loading || !arquivo || !selectedType}
        >
          {loading ? 'Salvando...' : 'Adicionar Etiqueta'}
        </Button>
      </form>
    </Card>
  );
}

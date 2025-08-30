import { useState } from 'react';
import { useEtiquetas } from '@/hooks/use-etiquetas';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Camera } from 'lucide-react';
import { uploadEtiquetaInspecao } from '@/lib/etiqueta/storage';

interface EtiquetaInspectionProps {
  questionId: string;
  inspectionSessionId: string;
  onResult?: (result: any) => void;
}

export function EtiquetaInspection({
  questionId,
  inspectionSessionId,
  onResult
}: EtiquetaInspectionProps) {
  const [foto, setFoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);

  const { toast } = useToast();
  const { registerInspection } = useEtiquetas();

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foto) return;

    setLoading(true);
    try {
      // 1. Upload da foto
      const fotoUrl = await uploadEtiquetaInspecao(foto, inspectionSessionId);

      // 2. Simular OCR (implementação real será feita no backend)
      // Esta é uma simulação - o backend fará a análise real
      const mockResult = {
        percentual_similaridade: Math.random() * 0.3 + 0.7, // 70-100%
        resultado_final: Math.random() > 0.3 ? 'APROVADO' : 'REPROVADO',
        detalhes_comparacao: {
          texto_referencia: 'Texto da etiqueta de referência',
          texto_enviado: 'Texto da etiqueta capturada',
          diferencas_encontradas: ['Diferença 1', 'Diferença 2'],
          score_percentage: 85
        }
      };

      // 3. Registrar resultado
      const result = await registerInspection({
        etiqueta_question_id: questionId,
        inspection_session_id: inspectionSessionId,
        foto_enviada: fotoUrl,
        ...mockResult
      });

      setResultado(result);
      onResult?.(result);

      toast({
        title: mockResult.resultado_final === 'APROVADO' 
          ? 'Etiqueta Aprovada!' 
          : 'Etiqueta Reprovada',
        description: `Similaridade: ${(mockResult.percentual_similaridade * 100).toFixed(2)}%`,
        variant: mockResult.resultado_final === 'APROVADO' ? 'default' : 'destructive'
      });
    } catch (error) {
      console.error('Erro na inspeção:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível realizar a inspeção',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('foto-upload')?.click()}
              className="w-full max-w-sm"
            >
              <Camera className="mr-2 h-4 w-4" />
              Capturar Foto da Etiqueta
            </Button>
            <input
              id="foto-upload"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCapture}
              className="hidden"
            />
          </div>

          {previewUrl && (
            <div className="mt-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading || !foto}
        >
          {loading ? 'Analisando...' : 'Analisar Etiqueta'}
        </Button>

        {resultado && (
          <div className={`mt-6 p-4 rounded-lg ${
            resultado.resultado_final === 'APROVADO' 
              ? 'bg-green-50' 
              : 'bg-red-50'
          }`}>
            <h3 className="font-medium mb-2">
              Resultado da Análise
            </h3>
            <p className="text-sm">
              Similaridade: {(resultado.percentual_similaridade * 100).toFixed(2)}%
            </p>
            <p className="text-sm font-medium mt-1">
              Status: {resultado.resultado_final}
            </p>
            {resultado.detalhes_comparacao && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-1">Detalhes:</h4>
                <pre className="text-xs bg-white p-2 rounded">
                  {JSON.stringify(resultado.detalhes_comparacao, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </form>
    </Card>
  );
}

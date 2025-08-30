import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { EtiquetaService } from '@/lib/etiqueta/service';
import { Camera } from 'lucide-react';

interface EtiquetaInspectionProps {
  questionId: string;
  inspectionSessionId: string;
  onResult?: (result: any) => void;
}

export function EtiquetaInspectionComponent({
  questionId,
  inspectionSessionId,
  onResult
}: EtiquetaInspectionProps) {
  const [foto, setFoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  
  const etiquetaService = new EtiquetaService();

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
      const result = await etiquetaService.inspectEtiqueta({
        etiquetaQuestionId: questionId,
        inspectionSessionId,
        testPhoto: foto,
      });

      setResultado(result);
      onResult?.(result);

      toast({
        title: result.approved ? 'Etiqueta Aprovada!' : 'Etiqueta Reprovada',
        description: `Similaridade: ${result.similarity_percentage.toFixed(2)}%`,
        variant: result.approved ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Erro na inspeção:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível realizar a inspeção',
        variant: 'destructive',
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
            resultado.approved ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <h3 className="font-medium mb-2">
              Resultado da Análise
            </h3>
            <p className="text-sm">
              Similaridade: {resultado.similarity_percentage.toFixed(2)}%
            </p>
            <p className="text-sm font-medium mt-1">
              Status: {resultado.approved ? 'APROVADO' : 'REPROVADO'}
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

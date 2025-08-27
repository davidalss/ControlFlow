import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, CheckCircle, XCircle, Image, FileText } from 'lucide-react';

interface EtiquetaInspectionProps {
  question: {
    id: string;
    titulo: string;
    descricao?: string;
    arquivoReferencia: string;
    limiteAprovacao: number;
  };
  onComplete: (result: any) => void;
  onCancel: () => void;
}

export default function EtiquetaInspection({
  question,
  onComplete,
  onCancel
}: EtiquetaInspectionProps) {
  const { toast } = useToast();
  
  const [testPhoto, setTestPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setTestPhoto(file);
        
        // Criar preview
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        toast({
          title: "Erro",
          description: "Apenas arquivos de imagem são permitidos",
          variant: "destructive"
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!testPhoto) {
      toast({
        title: "Erro",
        description: "Foto de teste é obrigatória",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('test_photo', testPhoto);
      formData.append('inspection_session_id', `session_${Date.now()}`);

      const response = await fetch(`/api/etiqueta-questions/${question.id}/inspect`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao executar inspeção');
      }

      const inspectionResult = await response.json();
      setResult(inspectionResult);
      
      toast({
        title: "Inspeção Concluída",
        description: `Resultado: ${inspectionResult.approved ? 'APROVADO' : 'REPROVADO'} (${inspectionResult.similarity_percentage}% similaridade)`,
        variant: inspectionResult.approved ? "default" : "destructive"
      });

      onComplete(inspectionResult);
      
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao executar inspeção",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    onCancel();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Inspeção de Etiqueta</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-lg">{question.titulo}</h3>
            {question.descricao && (
              <p className="text-gray-600 mt-1">{question.descricao}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Imagem de Referência */}
            <div>
              <Label>Imagem de Referência</Label>
              <div className="mt-2 border rounded-lg p-4 bg-gray-50">
                <img
                  src={question.arquivoReferencia}
                  alt="Referência"
                  className="w-full h-48 object-contain rounded"
                />
              </div>
            </div>

            {/* Foto de Teste */}
            <div>
              <Label>Foto de Teste *</Label>
              <div className="mt-2">
                {previewUrl ? (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <img
                      src={previewUrl}
                      alt="Teste"
                      className="w-full h-48 object-contain rounded"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-green-600">
                        ✓ Foto selecionada
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTestPhoto(null);
                          URL.revokeObjectURL(previewUrl);
                          setPreviewUrl(null);
                        }}
                        disabled={isLoading}
                      >
                        Trocar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                      <Camera className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Clique para tirar foto</span>
                      </p>
                      <p className="text-xs text-gray-500">JPG, PNG (máx. 10MB)</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        disabled={isLoading}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Limite de Aprovação */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Limite de Aprovação:</span>
            <Badge variant="outline">
              {Math.round(question.limiteAprovacao * 100)}%
            </Badge>
          </div>

          {/* Resultado (se disponível) */}
          {result && (
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {result.approved ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {result.approved ? 'APROVADO' : 'REPROVADO'}
                    </span>
                  </div>
                  <Badge variant={result.approved ? "default" : "destructive"}>
                    {result.similarity_percentage}% similaridade
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Método: {result.comparison.method}</p>
                  <p>Score: {result.similarity_score.toFixed(4)}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !testPhoto}
        >
          {isLoading ? 'Processando...' : 'Executar Inspeção'}
        </Button>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, CheckCircle, XCircle, Image, FileText, Eye, EyeOff, Tag } from 'lucide-react';

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
  const [showDetails, setShowDetails] = useState(false);

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
        description: `Resultado: ${inspectionResult.approved ? 'APROVADO' : 'REPROVADO'} (${inspectionResult.similarity_percentage.toFixed(2)}% similaridade)`,
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
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Inspeção de Etiqueta: {question.titulo}
          </CardTitle>
          {question.descricao && (
            <p className="text-sm text-muted-foreground">{question.descricao}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Etiqueta de Referência */}
          <div>
            <Label className="text-sm font-medium">Etiqueta de Referência (MÃE)</Label>
            <div className="mt-2 p-3 bg-muted rounded-md">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                <span className="text-sm">Arquivo salvo no plano de inspeção</span>
              </div>
              <div className="mt-2">
                <Badge variant="outline">
                  Limite de Aprovação: {question.limiteAprovacao}%
                </Badge>
              </div>
            </div>
          </div>

          {/* Upload da Foto de Teste */}
          <div>
            <Label className="text-sm font-medium">Foto da Etiqueta para Comparação</Label>
            <div className="mt-2">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  {testPhoto ? 'Trocar Foto' : 'Tirar/Selecionar Foto'}
                </Button>
                
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>
              
              {previewUrl && (
                <div className="mt-4">
                  <Label className="text-sm font-medium">Preview da Foto:</Label>
                  <div className="mt-2 max-w-xs">
                    <img
                      src={previewUrl}
                      alt="Preview da foto"
                      className="w-full h-auto rounded-md border"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!testPhoto || isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Executar Inspeção
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultado da Inspeção */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resultado da Inspeção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status do Resultado */}
            <div className="flex items-center gap-4">
              <Badge 
                variant={result.approved ? "default" : "destructive"}
                className="text-sm"
              >
                {result.approved ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    APROVADO
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    REPROVADO
                  </>
                )}
              </Badge>
              
              <div className="text-sm">
                <span className="font-medium">Similaridade:</span> {result.similarity_percentage.toFixed(2)}%
              </div>
              
              <div className="text-sm">
                <span className="font-medium">Limite:</span> {question.limiteAprovacao}%
              </div>
            </div>

            {/* Detalhes do OCR */}
            {result.detalhes_comparacao && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-1"
                  >
                    {showDetails ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {showDetails ? 'Ocultar' : 'Mostrar'} Detalhes do OCR
                  </Button>
                </div>

                {showDetails && (
                  <div className="space-y-3 p-3 bg-muted rounded-md">
                    {/* Texto de Referência */}
                    <div>
                      <Label className="text-sm font-medium">Texto Extraído da Etiqueta de Referência:</Label>
                      <div className="mt-1 p-2 bg-background rounded border text-sm font-mono">
                        {result.detalhes_comparacao.texto_referencia || 'Nenhum texto encontrado'}
                      </div>
                    </div>

                    {/* Texto da Foto de Teste */}
                    <div>
                      <Label className="text-sm font-medium">Texto Extraído da Foto de Teste:</Label>
                      <div className="mt-1 p-2 bg-background rounded border text-sm font-mono">
                        {result.detalhes_comparacao.texto_enviado || 'Nenhum texto encontrado'}
                      </div>
                    </div>

                    {/* Diferenças Encontradas */}
                    <div>
                      <Label className="text-sm font-medium">Diferenças Encontradas:</Label>
                      <div className="mt-1">
                        {result.detalhes_comparacao.diferencas_encontradas?.map((diff: string, index: number) => (
                          <div key={index} className="p-2 bg-background rounded border text-sm text-muted-foreground">
                            • {diff}
                          </div>
                        )) || (
                          <div className="p-2 bg-background rounded border text-sm text-green-600">
                            ✓ Nenhuma diferença encontrada
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

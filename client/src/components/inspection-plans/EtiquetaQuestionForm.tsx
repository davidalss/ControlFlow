import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Image, X } from 'lucide-react';

interface EtiquetaQuestionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questionData: any) => Promise<void>;
  inspectionPlanId: string;
  stepId: string;
  questionId: string;
}

export default function EtiquetaQuestionForm({
  isOpen,
  onClose,
  onSave,
  inspectionPlanId,
  stepId,
  questionId
}: EtiquetaQuestionFormProps) {
  const { toast } = useToast();
  
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [limiteAprovacao, setLimiteAprovacao] = useState('0.9');
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Aceitar PDF e imagens (JPEG, PNG, etc.)
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/webp'
      ];
      
      if (allowedTypes.includes(file.type)) {
        setReferenceFile(file);
        
        // Se for uma imagem, criar preview
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file);
          setPreviewImage(url);
        } else {
          // Se for PDF, limpar preview
          setPreviewImage(null);
        }
      } else {
        toast({
          title: "Erro",
          description: "Formato de arquivo não suportado. Use PDF ou imagens (JPEG, PNG, etc.)",
          variant: "destructive"
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo.trim()) {
      toast({
        title: "Erro",
        description: "Título é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!referenceFile) {
      toast({
        title: "Erro",
        description: "Arquivo de referência é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const limite = parseFloat(limiteAprovacao);
    if (isNaN(limite) || limite < 0 || limite > 1) {
      toast({
        title: "Erro",
        description: "Limite de aprovação deve ser entre 0 e 1",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('titulo', titulo.trim());
      formData.append('descricao', descricao.trim());
      formData.append('limite_aprovacao', limiteAprovacao);
      formData.append('inspection_plan_id', inspectionPlanId);
      formData.append('step_id', stepId);
      formData.append('question_id', questionId);
      formData.append('arquivo_referencia', referenceFile);

      const response = await fetch('/api/etiqueta-questions', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar pergunta de etiqueta');
      }

      const result = await response.json();
      
      toast({
        title: "Sucesso",
        description: "Pergunta de etiqueta criada com sucesso"
      });

      // Resetar formulário
      setTitulo('');
      setDescricao('');
      setLimiteAprovacao('0.9');
      setReferenceFile(null);
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
        setPreviewImage(null);
      }
      
      onClose();
      
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar pergunta de etiqueta",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTitulo('');
      setDescricao('');
      setLimiteAprovacao('0.9');
      setReferenceFile(null);
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
        setPreviewImage(null);
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Nova Pergunta de Etiqueta</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título da Pergunta *</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Verificar etiqueta de segurança"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o que deve ser verificado na etiqueta..."
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="limite_aprovacao">Limite de Aprovação (%) *</Label>
              <Input
                id="limite_aprovacao"
                type="number"
                min="0"
                max="100"
                step="1"
                value={Math.round(parseFloat(limiteAprovacao) * 100)}
                onChange={(e) => {
                  const value = parseInt(e.target.value) / 100;
                  setLimiteAprovacao(value.toString());
                }}
                placeholder="90"
                required
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500 mt-1">
                Percentual mínimo de similaridade para aprovação (0-100%)
              </p>
            </div>

            <div>
              <Label htmlFor="arquivo_referencia">Arquivo de Referência (Etiqueta MÃE) *</Label>
              <div className="mt-2">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="arquivo_referencia"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {referenceFile ? (
                        <div className="flex items-center space-x-2">
                          {referenceFile.type.startsWith('image/') ? (
                            <Image className="w-8 h-8 text-green-500" />
                          ) : (
                            <FileText className="w-8 h-8 text-blue-500" />
                          )}
                          <span className="text-sm text-gray-600">{referenceFile.name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                          </p>
                          <p className="text-xs text-gray-500">PDF ou Imagens (JPEG, PNG, etc.) - máx. 10MB</p>
                        </>
                      )}
                    </div>
                    <input
                      id="arquivo_referencia"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                </div>
              </div>
              
              {/* Preview da imagem */}
              {previewImage && (
                <div className="mt-4">
                  <Label className="text-sm font-medium">Preview da Imagem:</Label>
                  <div className="mt-2 max-w-xs">
                    <img
                      src={previewImage}
                      alt="Preview da etiqueta de referência"
                      className="w-full h-auto rounded-md border"
                    />
                  </div>
                </div>
              )}
              
              {referenceFile && (
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-sm text-green-600">
                    ✓ Arquivo selecionado: {referenceFile.name} 
                    ({referenceFile.type.startsWith('image/') ? 'Imagem' : 'PDF'})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setReferenceFile(null);
                      if (previewImage) {
                        URL.revokeObjectURL(previewImage);
                        setPreviewImage(null);
                      }
                    }}
                    disabled={isLoading}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              <p className="text-sm text-gray-500 mt-2">
                <strong>Dica:</strong> Para melhor precisão do OCR, use imagens nítidas da etiqueta. 
                O sistema funciona com PDF e imagens (JPEG, PNG, etc.).
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !titulo.trim() || !referenceFile}
            >
              {isLoading ? 'Criando...' : 'Criar Pergunta'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

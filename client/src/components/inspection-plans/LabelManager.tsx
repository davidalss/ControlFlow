import React, { useState } from 'react';
import { 
  Tag, 
  FileText, 
  Eye, 
  Camera, 
  Link, 
  Trash2, 
  Plus,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { STANDARD_LABELS } from '@/hooks/use-inspection-plans';
import type { InspectionField } from '@/hooks/use-inspection-plans';

interface LabelManagerProps {
  labels: InspectionField[];
  onLabelsChange: (labels: InspectionField[]) => void;
}

export default function LabelManager({ labels, onLabelsChange }: LabelManagerProps) {
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState('');
  const [currentPdfTitle, setCurrentPdfTitle] = useState('');

  // Função para adicionar etiqueta padrão
  const addStandardLabel = (labelInfo: typeof STANDARD_LABELS[0]) => {
    const newLabel: InspectionField = {
      id: `label-${Date.now()}-${labelInfo.id}`,
      name: labelInfo.name,
      type: 'label',
      required: true,
      description: labelInfo.description,
      labelConfig: {
        pdfUrl: '',
        isEnabled: true,
        requiresPhoto: false,
        comparisonType: 'exact'
      }
    };
    
    onLabelsChange([...labels, newLabel]);
  };

  // Função para remover etiqueta
  const removeLabel = (labelId: string) => {
    onLabelsChange(labels.filter(label => label.id !== labelId));
  };

  // Função para atualizar configuração da etiqueta
  const updateLabelConfig = (labelId: string, updates: Partial<InspectionField['labelConfig']>) => {
    onLabelsChange(labels.map(label => 
      label.id === labelId 
        ? { 
            ...label, 
            labelConfig: { 
              ...label.labelConfig, 
              ...updates 
            } 
          }
        : label
    ));
  };

  // Função para visualizar PDF
  const viewPdf = (pdfUrl: string, title: string) => {
    setCurrentPdfUrl(pdfUrl);
    setCurrentPdfTitle(title);
    setShowPdfViewer(true);
  };

  // Etiquetas padrão que ainda não foram adicionadas
  const availableLabels = STANDARD_LABELS.filter(
    standardLabel => !labels.some(label => label.name === standardLabel.name)
  );

  return (
    <div className="space-y-6">
      {/* Seção de etiquetas padrão disponíveis */}
      {availableLabels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Tag className="w-5 h-5" />
              <span>Etiquetas Padrão Disponíveis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableLabels.map((labelInfo) => (
                <div key={labelInfo.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{labelInfo.name}</div>
                    <div className="text-xs text-gray-500">{labelInfo.description}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addStandardLabel(labelInfo)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de etiquetas configuradas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tag className="w-5 h-5" />
            <span>Etiquetas Configuradas ({labels.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {labels.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Tag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma etiqueta configurada</p>
                  <p className="text-sm">Adicione etiquetas padrão acima para começar</p>
                </div>
              ) : (
                labels.map((label) => (
                  <div key={label.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Tag className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">{label.name}</h4>
                          <p className="text-sm text-gray-600">{label.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={label.labelConfig?.isEnabled ?? true}
                          onCheckedChange={(checked) => 
                            updateLabelConfig(label.id, { isEnabled: checked })
                          }
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeLabel(label.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Campo para URL do PDF */}
                      <div>
                        <Label className="text-sm font-medium">Link do PDF (SharePoint)</Label>
                        <div className="flex space-x-2 mt-1">
                          <Input
                            placeholder="https://sharepoint.com/..."
                            value={label.labelConfig?.pdfUrl || ''}
                            onChange={(e) => 
                              updateLabelConfig(label.id, { pdfUrl: e.target.value })
                            }
                            className="flex-1"
                          />
                          {label.labelConfig?.pdfUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewPdf(label.labelConfig!.pdfUrl!, label.name)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Configurações adicionais */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={label.labelConfig?.requiresPhoto ?? false}
                            onCheckedChange={(checked) => 
                              updateLabelConfig(label.id, { requiresPhoto: checked })
                            }
                          />
                          <Label className="text-sm">Requer foto</Label>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Tipo de Comparação</Label>
                          <select
                            value={label.labelConfig?.comparisonType || 'exact'}
                            onChange={(e) => 
                              updateLabelConfig(label.id, { 
                                comparisonType: e.target.value as 'exact' | 'similar' | 'presence' 
                              })
                            }
                            className="mt-1 w-full p-2 border rounded-md text-sm"
                          >
                            <option value="exact">Exata</option>
                            <option value="similar">Similar</option>
                            <option value="presence">Presença</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Status da etiqueta */}
                    <div className="flex items-center space-x-2">
                      <Badge variant={label.labelConfig?.isEnabled ? "default" : "secondary"}>
                        {label.labelConfig?.isEnabled ? "Ativa" : "Desativada"}
                      </Badge>
                      {label.labelConfig?.pdfUrl && (
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <ExternalLink className="w-3 h-3" />
                          <span>PDF Vinculado</span>
                        </Badge>
                      )}
                      {label.labelConfig?.requiresPhoto && (
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <Camera className="w-3 h-3" />
                          <span>Foto Obrigatória</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Modal para visualizar PDF */}
      <Dialog open={showPdfViewer} onOpenChange={setShowPdfViewer}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Visualizar PDF - {currentPdfTitle}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="h-[600px] border rounded-lg">
            <iframe
              src={currentPdfUrl}
              className="w-full h-full"
              title={`PDF - ${currentPdfTitle}`}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPdfViewer(false)}>
              Fechar
            </Button>
            <Button onClick={() => window.open(currentPdfUrl, '_blank')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir em Nova Aba
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

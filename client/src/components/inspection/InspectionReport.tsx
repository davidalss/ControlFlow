import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Package,
  Calendar,
  User,
  Camera,
  MessageSquare
} from 'lucide-react';

interface InspectionReportProps {
  inspectionData: any;
  onClose: () => void;
}

export default function InspectionReport({ inspectionData, onClose }: InspectionReportProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel'>('pdf');

  // ✅ Função de cálculo de resultados e criticidade
  const calcularResultados = useCallback(() => {
    let resultados = { critico: 0, menor: 0, total: 0, ok: 0, nok: 0 };
    
    if (!inspectionData.samples) return resultados;
    
    // Percorrer todas as amostras e etapas
    Object.keys(inspectionData.samples).forEach(sampleId => {
      const sampleData = inspectionData.samples[Number(sampleId)];
      Object.keys(sampleData).forEach(stepId => {
        const stepData = sampleData[stepId];
        const currentStep = inspectionData.steps?.find((step: any) => step.id === stepId);
        
        if (!currentStep) return;
        
        Object.keys(stepData).forEach(itemId => {
          const itemData = stepData[itemId];
          const currentItem = currentStep.items.find((item: any) => item.id === itemId);
          
          if (!currentItem || !itemData.status) return;
          
          resultados.total++;
          
          if (itemData.status === 'OK') {
            resultados.ok++;
          } else if (itemData.status === 'NOK') {
            resultados.nok++;
            
            // Aplicar regras de criticidade
            if (currentStep.type === 'functional') {
              // Todos os itens funcionais → sempre crítico
              resultados.critico++;
            } else if (currentStep.type === 'non-functional') {
              // Itens gráficos → menor critério, exceto quando forem informações de manual ou faltar algum item
              if (itemId.includes('manual') || itemId.includes('missing') || itemId.includes('completeness')) {
                resultados.critico++;
              } else {
                resultados.menor++;
              }
            } else if (currentStep.type === 'compliance') {
              // Etiqueta de identificação → sempre crítico
              resultados.critico++;
            }
          }
        });
      });
    });
    
    return resultados;
  }, [inspectionData]);

  const resultados = calcularResultados();

  // ✅ Função para exportar relatório
  const exportReport = (format: 'pdf' | 'excel') => {
    const reportData = {
      inspection: inspectionData,
      results: resultados,
      timestamp: new Date().toISOString()
    };
    
    if (format === 'pdf') {
      // Simular exportação PDF
      console.log('Exportando PDF:', reportData);
      alert('Relatório PDF exportado com sucesso!');
    } else {
      // Simular exportação Excel
      console.log('Exportando Excel:', reportData);
      alert('Relatório Excel exportado com sucesso!');
    }
  };

  // ✅ Função para contar fotos
  const contarFotos = useCallback(() => {
    let totalFotos = 0;
    
    if (!inspectionData.samples) return totalFotos;
    
    Object.keys(inspectionData.samples).forEach(sampleId => {
      const sampleData = inspectionData.samples[Number(sampleId)];
      Object.keys(sampleData).forEach(stepId => {
        const stepData = sampleData[stepId];
        Object.keys(stepData).forEach(itemId => {
          const itemData = stepData[itemId];
          if (itemData.photos) {
            totalFotos += itemData.photos.length;
          }
        });
      });
    });
    
    return totalFotos;
  }, [inspectionData]);

  const totalFotos = contarFotos();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <CardTitle>Relatório de Inspeção</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportReport('pdf')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportReport('excel')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* ✅ Informações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="h-4 w-4" />
                    Produto
                  </div>
                  <div className="font-medium">{inspectionData.product?.description || 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    FRES/NF
                  </div>
                  <div className="font-mono font-medium">{inspectionData.fresNf || 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    Data
                  </div>
                  <div className="font-medium">
                    {inspectionData.startTime ? new Date(inspectionData.startTime).toLocaleDateString('pt-BR') : 'N/A'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    Inspetor
                  </div>
                  <div className="font-medium">{inspectionData.inspector?.name || 'N/A'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ✅ Resumo dos Resultados */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo dos Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{resultados.total}</div>
                  <div className="text-sm text-blue-700">Total</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{resultados.ok}</div>
                  <div className="text-sm text-green-700">OK</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{resultados.nok}</div>
                  <div className="text-sm text-red-700">N/OK</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{resultados.critico}</div>
                  <div className="text-sm text-orange-700">Crítico</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{resultados.menor}</div>
                  <div className="text-sm text-yellow-700">Menor</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{totalFotos}</div>
                  <div className="text-sm text-purple-700">Fotos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ✅ Detalhamento por Etapa */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalhamento por Etapa</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>OK</TableHead>
                    <TableHead>N/OK</TableHead>
                    <TableHead>Crítico</TableHead>
                    <TableHead>Menor</TableHead>
                    <TableHead>Fotos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inspectionData.steps?.map((step: any) => {
                    const stepResults = {
                      total: 0,
                      ok: 0,
                      nok: 0,
                      critico: 0,
                      menor: 0,
                      fotos: 0
                    };

                    // Calcular resultados da etapa
                    if (inspectionData.samples) {
                      Object.keys(inspectionData.samples).forEach(sampleId => {
                        const sampleData = inspectionData.samples[Number(sampleId)];
                        const stepData = sampleData[step.id];
                        
                        if (stepData) {
                          Object.keys(stepData).forEach(itemId => {
                            const itemData = stepData[itemId];
                            if (itemData.status) {
                              stepResults.total++;
                              
                              if (itemData.status === 'OK') {
                                stepResults.ok++;
                              } else if (itemData.status === 'NOK') {
                                stepResults.nok++;
                                
                                // Aplicar criticidade
                                if (step.type === 'functional') {
                                  stepResults.critico++;
                                } else if (step.type === 'non-functional') {
                                  if (itemId.includes('manual') || itemId.includes('missing') || itemId.includes('completeness')) {
                                    stepResults.critico++;
                                  } else {
                                    stepResults.menor++;
                                  }
                                } else if (step.type === 'compliance') {
                                  stepResults.critico++;
                                }
                              }
                              
                              if (itemData.photos) {
                                stepResults.fotos += itemData.photos.length;
                              }
                            }
                          });
                        }
                      });
                    }

                    return (
                      <TableRow key={step.id}>
                        <TableCell className="font-medium">{step.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {step.type === 'functional' ? 'Funcional' : 
                             step.type === 'non-functional' ? 'Não-Funcional' : 
                             step.type === 'compliance' ? 'Conformidade' : step.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{stepResults.total}</TableCell>
                        <TableCell className="text-green-600">{stepResults.ok}</TableCell>
                        <TableCell className="text-red-600">{stepResults.nok}</TableCell>
                        <TableCell className="text-orange-600">{stepResults.critico}</TableCell>
                        <TableCell className="text-yellow-600">{stepResults.menor}</TableCell>
                        <TableCell className="text-purple-600">{stepResults.fotos}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* ✅ Observações e Fotos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Observações e Fotos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inspectionData.samples && Object.keys(inspectionData.samples).map(sampleId => {
                  const sampleData = inspectionData.samples[Number(sampleId)];
                  return Object.keys(sampleData).map(stepId => {
                    const stepData = sampleData[stepId];
                    const currentStep = inspectionData.steps?.find((step: any) => step.id === stepId);
                    
                    return Object.keys(stepData).map(itemId => {
                      const itemData = stepData[itemId];
                      const currentItem = currentStep?.items.find((item: any) => item.id === itemId);
                      
                      if (!itemData.observation && (!itemData.photos || itemData.photos.length === 0)) {
                        return null;
                      }
                      
                      return (
                        <div key={`${sampleId}-${stepId}-${itemId}`} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={itemData.status === 'OK' ? 'default' : 'destructive'}>
                              {itemData.status === 'OK' ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                              {itemData.status}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              Amostra {sampleId} - {currentStep?.name} - {currentItem?.name}
                            </span>
                          </div>
                          
                          {itemData.observation && (
                            <div className="flex items-start gap-2 mb-2">
                              <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                              <p className="text-sm text-gray-700">{itemData.observation}</p>
                            </div>
                          )}
                          
                          {itemData.photos && itemData.photos.length > 0 && (
                            <div className="flex items-start gap-2">
                              <Camera className="h-4 w-4 text-gray-500 mt-0.5" />
                              <div className="flex gap-2 flex-wrap">
                                {itemData.photos.map((photo: string, index: number) => (
                                  <div key={index} className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                                    <Camera className="h-6 w-6 text-gray-500" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  });
                })}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </div>
    </div>
  );
}

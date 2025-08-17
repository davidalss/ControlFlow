import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Shield, 
  Zap,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  Package,
  Truck,
  Calendar
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface AutoAnalysisProps {
  inspectionData: any;
  inspectionResults: any;
  onComplete: (decision: string, rncData?: any) => void;
}

interface DefectSummary {
  type: 'minor' | 'major' | 'critical';
  count: number;
  description: string;
  questions: string[];
}

export default function AutoAnalysis({ inspectionData, inspectionResults, onComplete }: AutoAnalysisProps) {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<any>(null);
  const [inspectorDecision, setInspectorDecision] = useState<string>('');
  const [rncType, setRncType] = useState<string>('');
  const [containmentMeasures, setContainmentMeasures] = useState<string>('');
  const [isGeneratingRnc, setIsGeneratingRnc] = useState(false);
  const [defectSummary, setDefectSummary] = useState<DefectSummary[]>([]);

  useEffect(() => {
    performAutoAnalysis();
  }, [inspectionResults]);

  const performAutoAnalysis = () => {
    if (!inspectionResults || !inspectionData) return;

    // Contar defeitos por tipo
    const defects = {
      minor: 0,
      major: 0,
      critical: 0
    };

    const defectDetails: DefectSummary[] = [];

    // Analisar resultados da inspeção
    Object.values(inspectionResults).forEach((sample: any) => {
      Object.values(sample).forEach((step: any) => {
        Object.values(step).forEach((item: any) => {
          if (item.status === 'NOK' && item.defectType) {
            defects[item.defectType as keyof typeof defects]++;
            
            // Adicionar detalhes do defeito
            const existingDefect = defectDetails.find(d => d.type === item.defectType);
            if (existingDefect) {
              existingDefect.count++;
              if (!existingDefect.questions.includes(item.name)) {
                existingDefect.questions.push(item.name);
              }
            } else {
              defectDetails.push({
                type: item.defectType,
                count: 1,
                description: item.observation || `Defeito ${item.defectType}`,
                questions: [item.name]
              });
            }
          }
        });
      });
    });

    const totalDefects = defects.minor + defects.major + defects.critical;
    
    // Obter limites NQA da inspeção
    const { acceptanceNumber, rejectionNumber } = inspectionData;
    
    // Análise automática
    let autoDecision = '';
    let requiresRnc = false;
    let rncType = '';

    if (totalDefects === 0) {
      autoDecision = 'auto_approved';
      requiresRnc = false;
    } else if (totalDefects <= acceptanceNumber) {
      autoDecision = 'manual_review';
      requiresRnc = true;
      rncType = 'registration';
    } else if (totalDefects >= rejectionNumber || defects.critical > 0) {
      autoDecision = 'auto_rejected';
      requiresRnc = true;
      rncType = 'corrective_action';
    } else {
      autoDecision = 'manual_review';
      requiresRnc = true;
      rncType = 'registration';
    }

    setAnalysis({
      totalDefects,
      defects,
      defectDetails,
      autoDecision,
      requiresRnc,
      rncType,
      acceptanceNumber,
      rejectionNumber
    });

    setDefectSummary(defectDetails);
    setRncType(rncType);
  };

  const handleInspectorDecision = (decision: string) => {
    setInspectorDecision(decision);
    
    // Se for defeito crítico acima do índice, bloquear opção "Registro"
    if (analysis?.defects.critical > 0 && analysis?.totalDefects >= analysis?.rejectionNumber) {
      if (decision === 'registration') {
        toast({
          title: "Opção não permitida",
          description: "Defeitos críticos acima do índice não permitem apenas registro. Deve ser tratativa.",
          variant: "destructive"
        });
        setInspectorDecision('');
        return;
      }
    }
  };

  const generateRnc = async () => {
    if (!analysis?.requiresRnc || !inspectorDecision) {
      toast({
        title: "Dados incompletos",
        description: "Complete a decisão do inspetor para gerar a RNC",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingRnc(true);

    try {
      const rncData = {
        inspectionId: inspectionData.id,
        supplier: inspectionData.supplier,
        fresNf: inspectionData.fresNf,
        productCode: inspectionData.productCode,
        productName: inspectionData.productName,
        lotSize: inspectionData.lotSize,
        inspectionDate: inspectionData.inspectionDate,
        inspectedQuantity: inspectionData.sampleSize,
        totalNonConformities: analysis.totalDefects,
        defectDetails: defectSummary.map(defect => ({
          type: defect.type,
          count: defect.count,
          description: defect.description,
          questions: defect.questions
        })),
        evidencePhotos: inspectionData.photos || [],
        containmentMeasures,
        type: inspectorDecision
      };

      const response = await apiRequest('POST', '/api/rnc', rncData);
      const rnc = await response.json();

      toast({
        title: "RNC Gerada",
        description: `RNC ${rnc.rncCode} criada com sucesso`,
      });

      onComplete(inspectorDecision, rnc);

    } catch (error) {
      console.error('Erro ao gerar RNC:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar RNC",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingRnc(false);
    }
  };

  const handleComplete = () => {
    if (analysis?.requiresRnc && !inspectorDecision) {
      toast({
        title: "Decisão obrigatória",
        description: "É necessário definir o tipo de RNC para continuar",
        variant: "destructive"
      });
      return;
    }

    if (analysis?.requiresRnc) {
      generateRnc();
    } else {
      onComplete('approved');
    }
  };

  if (!analysis) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Analisando resultados...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Análise Automática</h2>
        <p className="text-gray-600 mt-2">Sistema analisou os resultados e tomou uma decisão automática</p>
      </div>

      {/* Resumo da Inspeção */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Resumo da Inspeção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{inspectionData.sampleSize}</div>
              <div className="text-sm text-blue-700">Amostras Inspecionadas</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{analysis.totalDefects}</div>
              <div className="text-sm text-red-700">Total de Defeitos</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analysis.acceptanceNumber}</div>
              <div className="text-sm text-green-700">Limite de Aceitação</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{analysis.rejectionNumber}</div>
              <div className="text-sm text-orange-700">Limite de Rejeição</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhes dos Defeitos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Detalhes dos Defeitos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{analysis.defects.minor}</div>
              <div className="text-sm text-yellow-700">Defeitos Menores</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{analysis.defects.major}</div>
              <div className="text-sm text-orange-700">Defeitos Maiores</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{analysis.defects.critical}</div>
              <div className="text-sm text-red-700">Defeitos Críticos</div>
            </div>
          </div>

          {defectSummary.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Detalhamento dos Defeitos:</h4>
              {defectSummary.map((defect, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={
                      defect.type === 'critical' ? 'destructive' : 
                      defect.type === 'major' ? 'secondary' : 'outline'
                    }>
                      {defect.type.toUpperCase()}
                    </Badge>
                    <span className="font-medium">{defect.count} ocorrência(s)</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{defect.description}</p>
                  <div className="text-xs text-gray-500">
                    <strong>Perguntas afetadas:</strong> {defect.questions.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Decisão Automática */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Decisão Automática do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
            {analysis.autoDecision === 'auto_approved' && (
              <>
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <div className="font-medium text-green-700">Produto Aprovado Automaticamente</div>
                  <div className="text-sm text-gray-600">Nenhum defeito encontrado</div>
                </div>
              </>
            )}
            {analysis.autoDecision === 'auto_rejected' && (
              <>
                <XCircle className="w-8 h-8 text-red-500" />
                <div>
                  <div className="font-medium text-red-700">Produto Rejeitado Automaticamente</div>
                  <div className="text-sm text-gray-600">
                    {analysis.defects.critical > 0 ? 'Defeitos críticos encontrados' : 'Limite de rejeição ultrapassado'}
                  </div>
                </div>
              </>
            )}
            {analysis.autoDecision === 'manual_review' && (
              <>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
                <div>
                  <div className="font-medium text-orange-700">Requer Decisão do Inspetor</div>
                  <div className="text-sm text-gray-600">Defeitos encontrados, mas dentro dos limites aceitáveis</div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Decisão do Inspetor */}
      {analysis.requiresRnc && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Decisão do Inspetor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="rnc-type">Tipo de RNC</Label>
              <Select value={inspectorDecision} onValueChange={handleInspectorDecision}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de RNC" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registration">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      RNC - Registro
                    </div>
                  </SelectItem>
                  <SelectItem value="corrective_action">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      RNC - Tratativa SGQ
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                <strong>Registro:</strong> Apenas para histórico, sem bloqueio do lote
                <br />
                <strong>Tratativa SGQ:</strong> Requer tratamento e pode bloquear o lote
              </p>
            </div>

            {inspectorDecision === 'corrective_action' && (
              <div>
                <Label htmlFor="containment-measures">Medidas de Contenção Interna</Label>
                <Textarea
                  id="containment-measures"
                  placeholder="Descreva as medidas de contenção aplicadas..."
                  value={containmentMeasures}
                  onChange={(e) => setContainmentMeasures(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <div className="flex justify-end gap-4">
        <Button
          onClick={handleComplete}
          disabled={isGeneratingRnc || (analysis.requiresRnc && !inspectorDecision)}
          className="px-8"
        >
          {isGeneratingRnc ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Gerando RNC...
            </>
          ) : analysis.requiresRnc ? (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Finalizar e Gerar RNC
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Finalizar Inspeção
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

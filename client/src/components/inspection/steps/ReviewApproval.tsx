import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertTriangle, FileText, Camera, User, Calendar, Download } from "lucide-react";

interface ReviewApprovalProps {
  data: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
  onPrev: () => void;
}

export default function ReviewApproval({ data, onUpdate, onComplete, onPrev }: ReviewApprovalProps) {
  const { toast } = useToast();
  
  const [observations, setObservations] = useState(data.observations || '');
  const [finalDecision, setFinalDecision] = useState(data.finalDecision || null);
  const [requiresReview, setRequiresReview] = useState(false);
  const [reviewReason, setReviewReason] = useState('');

  const getDefectCount = (type: string) => {
    return data.defects?.filter((d: any) => d.type === type).length || 0;
  };

  const checkAqlLimits = () => {
    const criticalDefects = getDefectCount('critical');
    const majorDefects = getDefectCount('major');
    const minorDefects = getDefectCount('minor');

    const criticalLimit = data.aqlTable.critical.acceptance;
    const majorLimit = data.aqlTable.major.acceptance;
    const minorLimit = data.aqlTable.minor.acceptance;

    return {
      critical: criticalDefects <= criticalLimit,
      major: majorDefects <= majorLimit,
      minor: minorDefects <= minorLimit,
      criticalDefects,
      majorDefects,
      minorDefects
    };
  };

  const aqlStatus = checkAqlLimits();

  // Determinar se precisa de revisão hierárquica
  const needsHierarchicalReview = () => {
    return !aqlStatus.critical || !aqlStatus.major || !aqlStatus.minor;
  };

  const getInspectionStatus = () => {
    if (!aqlStatus.critical) {
      return { status: 'rejected', label: 'Reprovado', color: 'destructive' };
    }
    if (!aqlStatus.major || !aqlStatus.minor) {
      return { status: 'pending_review', label: 'Pendente Revisão', color: 'default' };
    }
    return { status: 'approved', label: 'Aprovado', color: 'default' };
  };

  const inspectionStatus = getInspectionStatus();

  const handleDecision = (decision: string) => {
    setFinalDecision(decision);
    
    if (decision === 'approved') {
      toast({
        title: "Inspeção aprovada",
        description: "A inspeção foi aprovada com sucesso",
      });
    } else if (decision === 'conditionally_approved') {
      toast({
        title: "Aprovação condicional",
        description: "A inspeção foi aprovada com condições",
      });
    } else {
      toast({
        title: "Inspeção reprovada",
        description: "A inspeção foi reprovada",
        variant: "destructive",
      });
    }
  };

  const handleComplete = () => {
    if (!finalDecision) {
      toast({
        title: "Decisão obrigatória",
        description: "Selecione uma decisão final para a inspeção",
        variant: "destructive",
      });
      return;
    }

    // Atualizar dados da inspeção
    const updatedData = {
      ...data,
      observations,
      finalDecision,
      status: finalDecision,
      completedAt: new Date().toISOString()
    };

    onUpdate(updatedData);
    onComplete();
  };

  const generateReport = () => {
    toast({
      title: "Relatório gerado",
      description: "Relatório de inspeção disponível para download",
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Revisão e Aprovação</h2>
        <p className="text-gray-600 mt-2">Análise final e decisão da inspeção</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status da Inspeção */}
        <Card>
          <CardHeader>
            <CardTitle>Status da Inspeção</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge 
                variant={inspectionStatus.color as any}
                className="text-lg px-4 py-2"
              >
                {inspectionStatus.label}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Defeitos Críticos:</span>
                <Badge variant={aqlStatus.critical ? "outline" : "destructive"}>
                  {aqlStatus.criticalDefects} / {data.aqlTable.critical.acceptance}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Defeitos Maiores:</span>
                <Badge variant={aqlStatus.major ? "outline" : "destructive"}>
                  {aqlStatus.majorDefects} / {data.aqlTable.major.acceptance}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Defeitos Menores:</span>
                <Badge variant={aqlStatus.minor ? "outline" : "destructive"}>
                  {aqlStatus.minorDefects} / {data.aqlTable.minor.acceptance}
                </Badge>
              </div>
            </div>

            {needsHierarchicalReview() && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    Revisão Hierárquica Necessária
                  </span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  A inspeção ultrapassou os limites AQL e requer aprovação superior
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações do Produto */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Produto:</span>
              <span className="text-sm font-medium">{data.product?.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Código:</span>
              <span className="text-sm font-medium">{data.product?.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">EAN:</span>
              <span className="text-sm font-medium">{data.product?.ean}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Inspetor:</span>
              <span className="text-sm font-medium">{data.inspector?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Data:</span>
              <span className="text-sm font-medium">
                {new Date().toLocaleDateString('pt-BR')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              onClick={generateReport}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              Visualizar Evidências
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Resumo dos Defeitos */}
      {data.defects && data.defects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo dos Defeitos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Inspetor</TableHead>
                  <TableHead>Data/Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.defects.map((defect: any) => (
                  <TableRow key={defect.id}>
                    <TableCell>
                      <Badge
                        variant={
                          defect.type === 'critical' ? 'destructive' :
                          defect.type === 'major' ? 'default' : 'secondary'
                        }
                      >
                        {defect.type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{defect.description}</TableCell>
                    <TableCell>{defect.stepId}</TableCell>
                    <TableCell>{defect.inspector}</TableCell>
                    <TableCell>
                      {new Date(defect.timestamp).toLocaleString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Decisão Final */}
      <Card>
        <CardHeader>
          <CardTitle>Decisão Final</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant={finalDecision === 'approved' ? 'default' : 'outline'}
              onClick={() => handleDecision('approved')}
              disabled={!aqlStatus.critical}
              className="h-20 flex flex-col items-center justify-center"
            >
              <CheckCircle className="w-6 h-6 mb-2" />
              <span>Aprovar</span>
            </Button>
            
            <Button
              variant={finalDecision === 'conditionally_approved' ? 'default' : 'outline'}
              onClick={() => handleDecision('conditionally_approved')}
              className="h-20 flex flex-col items-center justify-center"
            >
              <AlertTriangle className="w-6 h-6 mb-2" />
              <span>Aprovação Condicional</span>
            </Button>
            
            <Button
              variant={finalDecision === 'rejected' ? 'destructive' : 'outline'}
              onClick={() => handleDecision('rejected')}
              className="h-20 flex flex-col items-center justify-center"
            >
              <XCircle className="w-6 h-6 mb-2" />
              <span>Reprovar</span>
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              placeholder="Adicione observações sobre a inspeção..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={4}
            />
          </div>

          {needsHierarchicalReview() && (
            <div className="space-y-2">
              <Label htmlFor="review-reason">Motivo da Revisão Hierárquica</Label>
              <Textarea
                id="review-reason"
                placeholder="Descreva o motivo da revisão hierárquica..."
                value={reviewReason}
                onChange={(e) => setReviewReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Decisões */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Decisões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{data.inspector?.name}</p>
                  <p className="text-xs text-gray-500">Inspetor</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Inspeção Iniciada</p>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            {finalDecision && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">{data.inspector?.name}</p>
                    <p className="text-xs text-blue-500">Decisão Final</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">
                    {finalDecision === 'approved' ? 'Aprovado' :
                     finalDecision === 'conditionally_approved' ? 'Aprovação Condicional' : 'Reprovado'}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date().toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Voltar
        </Button>
        <Button 
          onClick={handleComplete}
          disabled={!finalDecision}
          className="px-8"
        >
          Finalizar Inspeção
        </Button>
      </div>
    </div>
  );
}

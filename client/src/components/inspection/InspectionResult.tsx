import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Download,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  InspectionResult as InspectionResultType, 
  InspectionValidation 
} from "@/hooks/use-inspection-plans";

interface InspectionResultProps {
  inspection: InspectionResultType;
  onConditionalApproval: (data: { inspectionId: string; reason: string; defects: any }) => void;
  onFinalize: (inspection: InspectionResultType) => void;
}

export default function InspectionResult({ 
  inspection, 
  onConditionalApproval, 
  onFinalize 
}: InspectionResultProps) {
  const { toast } = useToast();
  const [showConditionalModal, setShowConditionalModal] = useState(false);
  const [conditionalReason, setConditionalReason] = useState('');
  
  const validation = inspection.validation;
  const defects = inspection.defects;
  const aqlLimits = inspection.aqlLimits;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-600 bg-green-50';
      case 'REJECTED': return 'text-red-600 bg-red-50';
      case 'CONDITIONAL_APPROVAL': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'REJECTED': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'CONDITIONAL_APPROVAL': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getStatusTitle = (status: string) => {
    switch (status) {
      case 'APPROVED': return '✅ INSPEÇÃO APROVADA';
      case 'REJECTED': return '❌ INSPEÇÃO REPROVADA';
      case 'CONDITIONAL_APPROVAL': return '⚠️ APROVAÇÃO CONDICIONAL NECESSÁRIA';
      default: return '⏳ AGUARDANDO RESULTADO';
    }
  };
  
  const canRequestConditionalApproval = () => {
    return validation.overall === 'CONDITIONAL_APPROVAL' && validation.critical === 'PASS';
  };
  
  const handleConditionalApproval = () => {
    if (!conditionalReason.trim()) {
      toast({
        title: "Justificativa obrigatória",
        description: "Por favor, descreva o motivo da solicitação de aprovação condicional.",
        variant: "destructive",
      });
      return;
    }
    
    onConditionalApproval({
      inspectionId: inspection.id,
      reason: conditionalReason,
      defects: defects
    });
    
    setShowConditionalModal(false);
    setConditionalReason('');
    
    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação de aprovação condicional foi enviada para análise.",
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Cabeçalho do Resultado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getStatusIcon(validation.overall)}
            <span>Resultado da Inspeção</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`p-4 rounded-lg ${getStatusColor(validation.overall)}`}>
            <h3 className="font-bold text-lg">
              {getStatusTitle(validation.overall)}
            </h3>
            <p className="text-sm mt-1">
              Código: {inspection.inspectionCode} | Voltagem: {inspection.voltage}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Estatísticas de Defeitos */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Defeitos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {/* Defeitos Críticos */}
            <div className={`p-4 rounded-lg border-2 ${
              validation.critical === 'PASS' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="text-center">
                <div className="text-2xl font-bold">{defects.critical}</div>
                <div className="text-sm text-gray-600">Críticos</div>
                <div className="text-xs text-gray-500">Limite: {aqlLimits.critical}</div>
                <div className="mt-1">
                  {validation.critical === 'PASS' ? 
                    <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> :
                    <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                  }
                </div>
              </div>
            </div>
            
            {/* Defeitos Maiores */}
            <div className={`p-4 rounded-lg border-2 ${
              validation.major === 'PASS' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
            }`}>
              <div className="text-center">
                <div className="text-2xl font-bold">{defects.major}</div>
                <div className="text-sm text-gray-600">Maiores</div>
                <div className="text-xs text-gray-500">Limite: {aqlLimits.major}</div>
                <div className="mt-1">
                  {validation.major === 'PASS' ? 
                    <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> :
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mx-auto" />
                  }
                </div>
              </div>
            </div>
            
            {/* Defeitos Menores */}
            <div className={`p-4 rounded-lg border-2 ${
              validation.minor === 'PASS' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
            }`}>
              <div className="text-center">
                <div className="text-2xl font-bold">{defects.minor}</div>
                <div className="text-sm text-gray-600">Menores</div>
                <div className="text-xs text-gray-500">Limite: {aqlLimits.minor}</div>
                <div className="mt-1">
                  {validation.minor === 'PASS' ? 
                    <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> :
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mx-auto" />
                  }
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Resumo da Validação */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Validação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded">
              <span>Defeitos Críticos</span>
              <div className="flex items-center space-x-2">
                <span>{defects.critical}/{aqlLimits.critical}</span>
                {validation.critical === 'PASS' ? 
                  <Badge variant="default" className="bg-green-100 text-green-800">PASSOU</Badge> :
                  <Badge variant="destructive">FALHOU - REJEIÇÃO AUTOMÁTICA</Badge>
                }
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded">
              <span>Defeitos Maiores</span>
              <div className="flex items-center space-x-2">
                <span>{defects.major}/{aqlLimits.major}</span>
                {validation.major === 'PASS' ? 
                  <Badge variant="default" className="bg-green-100 text-green-800">PASSOU</Badge> :
                  <Badge variant="secondary">FALHOU - APROVAÇÃO CONDICIONAL</Badge>
                }
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded">
              <span>Defeitos Menores</span>
              <div className="flex items-center space-x-2">
                <span>{defects.minor}/{aqlLimits.minor}</span>
                {validation.minor === 'PASS' ? 
                  <Badge variant="default" className="bg-green-100 text-green-800">PASSOU</Badge> :
                  <Badge variant="secondary">FALHOU - APROVAÇÃO CONDICIONAL</Badge>
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Regras Aplicadas */}
      <Card>
        <CardHeader>
          <CardTitle>Regras Aplicadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>Críticos > 0 = REJEIÇÃO AUTOMÁTICA</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span>Maiores > {aqlLimits.major} = APROVAÇÃO CONDICIONAL</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span>Menores > {aqlLimits.minor} = APROVAÇÃO CONDICIONAL</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Todos OK = APROVAÇÃO AUTOMÁTICA</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Ações */}
      <div className="flex justify-end space-x-2">
        {canRequestConditionalApproval() && (
          <Button 
            variant="outline" 
            onClick={() => setShowConditionalModal(true)}
          >
            <Send className="h-4 w-4 mr-2" />
            Solicitar Aprovação Condicional
          </Button>
        )}
        
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Visualizar Relatório
        </Button>
        
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
        
        <Button 
          variant={validation.overall === 'APPROVED' ? 'default' : 'destructive'}
          onClick={() => onFinalize(inspection)}
        >
          {validation.overall === 'APPROVED' ? 'Finalizar Inspeção' : 'Confirmar Resultado'}
        </Button>
      </div>
      
      {/* Modal de Aprovação Condicional */}
      <Dialog open={showConditionalModal} onOpenChange={setShowConditionalModal}>
        <DialogContent aria-describedby="conditional-approval-description">
          <DialogHeader>
            <DialogTitle>Solicitar Aprovação Condicional</DialogTitle>
            <DialogDescription id="conditional-approval-description">
              Solicite aprovação condicional para esta inspeção. Descreva o motivo da solicitação.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-medium text-yellow-800">Motivo da Solicitação:</h4>
              <p className="text-sm text-yellow-700 mt-1">
                {validation.major === 'FAIL' && `• Defeitos maiores: ${defects.major}/${aqlLimits.major}`}
                {validation.minor === 'FAIL' && `• Defeitos menores: ${defects.minor}/${aqlLimits.minor}`}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Justificativa para aprovação condicional:</Label>
              <Textarea
                value={conditionalReason}
                onChange={(e) => setConditionalReason(e.target.value)}
                placeholder="Descreva o motivo da solicitação de aprovação condicional..."
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowConditionalModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConditionalApproval}>
                <Send className="h-4 w-4 mr-2" />
                Solicitar Aprovação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

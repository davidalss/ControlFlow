import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ApprovalItemProps {
  inspection: any;
  onApproval: (inspectionId: string, decision: string, justification: string, evidence?: any) => void;
  isProcessing: boolean;
}

export default function ApprovalItem({ inspection, onApproval, isProcessing }: ApprovalItemProps) {
  const [justification, setJustification] = useState("");
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState("");

  const handleDecision = (decision: string) => {
    setSelectedDecision(decision);
    setShowDecisionForm(true);
  };

  const submitDecision = () => {
    if (!justification.trim()) return;
    
    onApproval(inspection.id, selectedDecision, justification);
    setJustification("");
    setShowDecisionForm(false);
    setSelectedDecision("");
  };

  const getOutOfLimitParameters = () => {
    if (!inspection.technicalParameters || !inspection.recipe?.parameters) return [];
    
    const outOfLimit = [];
    for (const [param, value] of Object.entries(inspection.technicalParameters)) {
      const config = inspection.recipe.parameters[param];
      if (config && typeof value === 'number') {
        if (value < config.min || value > config.max) {
          outOfLimit.push({
            param,
            value,
            config,
            isCritical: config.critical
          });
        }
      }
    }
    return outOfLimit;
  };

  const outOfLimitParams = getOutOfLimitParameters();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-accent/10 text-accent w-12 h-12 rounded-lg flex items-center justify-center">
              <span className="material-icons">pending</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-800">
                {inspection.product?.code} - {inspection.product?.description}
              </h3>
              <p className="text-sm text-neutral-600">
                Inspeção: {inspection.inspectionId}
              </p>
              <p className="text-xs text-neutral-500">
                Inspetor: {inspection.inspector?.name} • {new Date(inspection.startedAt).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-accent/10 text-accent">
              Aguardando Aprovação
            </Badge>
          </div>
        </div>

        {/* Parameter Issues */}
        {outOfLimitParams.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-neutral-800 mb-2">Parâmetros Fora do Limite</h4>
            <div className="space-y-2">
              {outOfLimitParams.map((item, index) => (
                <div key={index} className={`flex items-center justify-between p-3 border rounded-lg ${
                  item.isCritical 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div>
                    <p className={`font-medium ${
                      item.isCritical ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      {item.param}
                    </p>
                    <p className={`text-sm ${
                      item.isCritical ? 'text-red-700' : 'text-yellow-700'
                    }`}>
                      Valor medido: {item.value} • Limite: {item.config.min}-{item.config.max} {item.config.unit}
                    </p>
                  </div>
                  <Badge 
                    variant="outline"
                    className={
                      item.isCritical 
                        ? 'border-red-300 text-red-700 bg-red-100' 
                        : 'border-yellow-300 text-yellow-700 bg-yellow-100'
                    }
                  >
                    {item.isCritical ? 'Crítico' : 'Não Crítico'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inspector Notes */}
        {inspection.observations && (
          <div className="mb-4">
            <h4 className="font-medium text-neutral-800 mb-2">Observações do Inspetor</h4>
            <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg">
              {inspection.observations}
            </p>
          </div>
        )}

        {/* Technical Parameters Summary */}
        {inspection.technicalParameters && Object.keys(inspection.technicalParameters).length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-neutral-800 mb-2">Todos os Parâmetros Técnicos</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(inspection.technicalParameters).map(([param, value]) => (
                <div key={param} className="text-sm p-2 bg-neutral-50 rounded">
                  <span className="text-neutral-500 block">{param}:</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photos Summary */}
        {inspection.photos && Object.keys(inspection.photos).length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-neutral-800 mb-2">Fotos da Inspeção</h4>
            <div className="flex items-center space-x-4 text-sm text-neutral-600">
              <span className="flex items-center">
                <span className="material-icons mr-1 text-sm">photo_camera</span>
                {Object.values(inspection.photos).flat().length} foto(s) anexada(s)
              </span>
              <Button variant="outline" size="sm">
                <span className="material-icons mr-1 text-sm">visibility</span>
                Ver Fotos
              </Button>
            </div>
          </div>
        )}

        {/* Approval Actions */}
        {!showDecisionForm ? (
          <div className="border-t border-neutral-200 pt-4">
            <h4 className="font-medium text-neutral-800 mb-3">Decisão da Engenharia</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button 
                onClick={() => handleDecision('approve')}
                disabled={isProcessing}
                className="flex items-center justify-center bg-secondary hover:bg-secondary/90"
              >
                <span className="material-icons mr-2">check_circle</span>
                Aprovar
              </Button>
              <Button 
                onClick={() => handleDecision('approve_conditional')}
                disabled={isProcessing}
                className="flex items-center justify-center bg-accent hover:bg-accent/90"
              >
                <span className="material-icons mr-2">warning</span>
                Aprovar Condicional
              </Button>
              <Button 
                onClick={() => handleDecision('reject')}
                disabled={isProcessing}
                variant="destructive"
                className="flex items-center justify-center"
              >
                <span className="material-icons mr-2">cancel</span>
                Reprovar
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-t border-neutral-200 pt-4">
            <h4 className="font-medium text-neutral-800 mb-3">
              Confirmação da Decisão: {
                selectedDecision === 'approve' ? 'Aprovação' :
                selectedDecision === 'approve_conditional' ? 'Aprovação Condicional' :
                'Reprovação'
              }
            </h4>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="justification">Justificativa*</Label>
                <Textarea
                  id="justification"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  rows={3}
                  placeholder="Descreva a justificativa para sua decisão..."
                  required
                />
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  onClick={submitDecision}
                  disabled={!justification.trim() || isProcessing}
                  className={
                    selectedDecision === 'approve' ? 'bg-secondary hover:bg-secondary/90' :
                    selectedDecision === 'approve_conditional' ? 'bg-accent hover:bg-accent/90' :
                    'bg-red-500 hover:bg-red-600'
                  }
                >
                  {isProcessing ? "Processando..." : `Confirmar ${
                    selectedDecision === 'approve' ? 'Aprovação' :
                    selectedDecision === 'approve_conditional' ? 'Aprovação Condicional' :
                    'Reprovação'
                  }`}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDecisionForm(false);
                    setSelectedDecision("");
                    setJustification("");
                  }}
                  disabled={isProcessing}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

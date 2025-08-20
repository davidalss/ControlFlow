import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Camera, QrCode, FileText, CheckCircle, AlertCircle, Clock, Calculator } from "lucide-react";
import ProductIdentification from "./steps/ProductIdentification";
import SamplingSetup from "./steps/SamplingSetup";
import InspectionExecution from "./steps/InspectionExecution";
import ReviewApproval from "./steps/ReviewApproval";

interface InspectionWizardProps {
  onComplete?: (inspectionData: any) => void;
  onCancel?: () => void;
}

export default function InspectionWizard({ onComplete, onCancel }: InspectionWizardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [inspectionData, setInspectionData] = useState({
    // Step 1: Product Identification
    product: null,
    fresNf: '',
    inspectionType: '', // 'bonification' ou 'container'
    quantity: 1, // Para bonificação
    inspector: user,
    
    // Step 2: NQA Configuration (apenas para container)
    lotSize: 0,
    inspectionLevel: 'II',
    sampleSize: 0,
    aqlTable: {
      critical: { aql: 0, acceptance: 0, rejection: 1 },
      major: { aql: 2.5, acceptance: 0, rejection: 1 },
      minor: { aql: 4.0, acceptance: 0, rejection: 1 }
    },
    
    // Step 3: Inspection Execution
    inspectionPlan: null,
    currentStep: 0,
    steps: [],
    results: {},
    photos: [],
    defects: [],
    
    // Step 4: Review & Approval
    status: 'draft',
    observations: '',
    finalDecision: null
  });

  // Determinar os passos baseado no tipo de inspeção
  const getSteps = () => {
    const baseSteps = [
      { id: 1, title: 'Identificação do Produto', icon: QrCode, description: 'FRES/NF e identificação do produto' },
      { id: 2, title: 'Configuração NQA', icon: Calculator, description: 'Tamanho do lote e números de aceite/rejeição' },
      { id: 3, title: 'Execução da Inspeção', icon: Camera, description: 'Execução do plano de inspeção' },
      { id: 4, title: 'Revisão e Aprovação', icon: CheckCircle, description: 'Análise final e decisão' }
    ];

    // Se for bonificação, remover a etapa de amostragem
    if (inspectionData.inspectionType === 'bonification') {
      return baseSteps.filter(step => step.id !== 2).map((step, index) => ({
        ...step,
        id: index + 1 // Reajustar IDs
      }));
    }

    return baseSteps;
  };

  const steps = getSteps();

  const updateInspectionData = (newData: any) => {
    setInspectionData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(inspectionData);
    }
  };

  const getStepContent = () => {
    // Ajustar o número do passo baseado no tipo de inspeção
    const isBonification = inspectionData.inspectionType === 'bonification';
    
    // Para bonificação: 1=Identificação, 2=Execução, 3=Revisão
    // Para container: 1=Identificação, 2=Amostragem, 3=Execução, 4=Revisão
    
    if (isBonification) {
      switch (currentStep) {
        case 1:
          return (
            <ProductIdentification
              data={inspectionData}
              onUpdate={updateInspectionData}
              onNext={nextStep}
            />
          );
        case 2:
          return (
            <InspectionExecution
              data={inspectionData}
              onUpdate={updateInspectionData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          );
        case 3:
          return (
            <ReviewApproval
              data={inspectionData}
              onUpdate={updateInspectionData}
              onComplete={handleComplete}
              onPrev={prevStep}
            />
          );
        default:
          return null;
      }
    } else {
      // Fluxo normal para container
      switch (currentStep) {
        case 1:
          return (
            <ProductIdentification
              data={inspectionData}
              onUpdate={updateInspectionData}
              onNext={nextStep}
            />
          );
        case 2:
          return (
            <SamplingSetup
              data={inspectionData}
              onUpdate={updateInspectionData}
              onNext={nextStep}
            />
          );
        case 3:
          return (
            <InspectionExecution
              data={inspectionData}
              onUpdate={updateInspectionData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          );
        case 4:
          return (
            <ReviewApproval
              data={inspectionData}
              onUpdate={updateInspectionData}
              onComplete={handleComplete}
              onPrev={prevStep}
            />
          );
        default:
          return null;
      }
    }
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'upcoming';
  };

  const getStepIcon = (step: any, status: string) => {
    const IconComponent = step.icon;
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'current':
        return <IconComponent className="w-5 h-5 text-blue-600" />;
      default:
        return <IconComponent className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="inspection-wizard flex flex-col h-full">
      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const isLast = index === steps.length - 1;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2
                    ${status === 'completed' ? 'bg-green-50 border-green-600' : ''}
                    ${status === 'current' ? 'bg-blue-50 border-blue-600' : ''}
                    ${status === 'upcoming' ? 'bg-gray-50 border-gray-300' : ''}
                  `}>
                    {getStepIcon(step, status)}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`
                      text-xs font-medium
                      ${status === 'completed' ? 'text-green-600' : ''}
                      ${status === 'current' ? 'text-blue-600' : ''}
                      ${status === 'upcoming' ? 'text-gray-500' : ''}
                    `}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {step.description}
                    </div>
                  </div>
                </div>
                
                {!isLast && (
                  <div className={`
                    w-16 h-0.5 mx-4
                    ${status === 'completed' ? 'bg-green-600' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {getStepContent()}
        </div>
      </div>
    </div>
  );
}

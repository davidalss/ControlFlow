import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Camera, QrCode, FileText, CheckCircle, AlertCircle, Clock } from "lucide-react";
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
    lotNumber: '',
    inspectionType: '',
    quantity: 1,
    inspector: user,
    productPhoto: null,
    
    // Step 2: Sampling Setup (pode ser pulado para bonificação)
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
      { id: 1, title: 'Identificação do Produto', icon: QrCode, description: 'Leitura do código EAN e dados básicos' },
      { id: 2, title: 'Configuração da Amostragem', icon: FileText, description: 'Setup AQL conforme NBR 5426' },
      { id: 3, title: 'Execução da Inspeção', icon: Camera, description: 'Inspeção por etapas com controle AQL' },
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
              onPrev={prevStep}
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
    return 'pending';
  };

  const getStepIcon = (step: any) => {
    const IconComponent = step.icon;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 min-h-full">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Nova Inspeção de Qualidade
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Sistema de Controle de Qualidade - NBR 5426
              </p>
            </div>
            <Button 
              onClick={onCancel}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium border-yellow-500 hover:border-yellow-600 shadow-sm"
            >
              Cancelar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              const isLast = index === steps.length - 1;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        status === 'completed'
                          ? 'bg-green-500 border-green-500 text-white'
                          : status === 'current'
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-gray-100 border-gray-300 text-gray-500'
                      }`}
                    >
                      {status === 'completed' ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        getStepIcon(step)
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-sm font-medium ${
                        status === 'completed'
                          ? 'text-green-600'
                          : status === 'current'
                          ? 'text-blue-600'
                          : 'text-gray-500'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  
                  {!isLast && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Progress Bar */}
          <Progress 
            value={(currentStep / steps.length) * 100} 
            className="h-2"
          />
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="min-h-[600px]">
        {getStepContent()}
      </div>
    </div>
  );
}

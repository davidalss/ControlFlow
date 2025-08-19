import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, AlertTriangle, AlertCircle, Info, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  VoltageConfiguration, 
  InspectionQuestion 
} from "@/hooks/use-inspection-plans";
import QuestionForm from "./QuestionForm";

interface VoltageQuestionManagerProps {
  voltageConfig: VoltageConfiguration;
  onQuestionsChange: (questions: VoltageConfiguration['questionsByVoltage']) => void;
}

export default function VoltageQuestionManager({ 
  voltageConfig, 
  onQuestionsChange 
}: VoltageQuestionManagerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'both' | '127V' | '220V'>('both');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<InspectionQuestion | null>(null);
  
  const getDefectColor = (defectType: string) => {
    switch (defectType) {
      case 'CRITICAL': return 'border-red-500 bg-red-50';
      case 'MAJOR': return 'border-yellow-500 bg-yellow-50';
      case 'MINOR': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-200';
    }
  };
  
  const getDefectIcon = (defectType: string) => {
    switch (defectType) {
      case 'CRITICAL': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'MAJOR': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'MINOR': return <Info className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };
  
  const getDefectBadgeVariant = (defectType: string) => {
    switch (defectType) {
      case 'CRITICAL': return 'destructive' as const;
      case 'MAJOR': return 'secondary' as const;
      case 'MINOR': return 'outline' as const;
      default: return 'outline' as const;
    }
  };
  
  const addQuestion = (question: InspectionQuestion) => {
    const currentQuestions = voltageConfig.questionsByVoltage[activeTab] || [];
    const newQuestions = [...currentQuestions, question];
    
    onQuestionsChange({
      ...voltageConfig.questionsByVoltage,
      [activeTab]: newQuestions
    });
    
    setShowQuestionForm(false);
    setEditingQuestion(null);
    
    toast({
      title: "Pergunta adicionada",
      description: `Pergunta adicionada à seção ${activeTab}.`,
    });
  };
  
  const editQuestion = (questionId: string) => {
    const questions = voltageConfig.questionsByVoltage[activeTab] || [];
    const question = questions.find(q => q.id === questionId);
    if (question) {
      setEditingQuestion(question);
      setShowQuestionForm(true);
    }
  };
  
  const updateQuestion = (updatedQuestion: InspectionQuestion) => {
    const questions = voltageConfig.questionsByVoltage[activeTab] || [];
    const updatedQuestions = questions.map(q => 
      q.id === updatedQuestion.id ? updatedQuestion : q
    );
    
    onQuestionsChange({
      ...voltageConfig.questionsByVoltage,
      [activeTab]: updatedQuestions
    });
    
    setShowQuestionForm(false);
    setEditingQuestion(null);
    
    toast({
      title: "Pergunta atualizada",
      description: "Pergunta foi atualizada com sucesso.",
    });
  };
  
  const removeQuestion = (questionId: string) => {
    const questions = voltageConfig.questionsByVoltage[activeTab] || [];
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    
    onQuestionsChange({
      ...voltageConfig.questionsByVoltage,
      [activeTab]: updatedQuestions
    });
    
    toast({
      title: "Pergunta removida",
      description: "Pergunta foi removida da seção.",
    });
  };
  
  const getQuestionsForTab = (tab: string) => {
    return voltageConfig.questionsByVoltage[tab as keyof typeof voltageConfig.questionsByVoltage] || [];
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>Perguntas de Inspeção</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Abas baseadas na configuração */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="both">Ambas Voltagens</TabsTrigger>
            {voltageConfig.supports127V && (
              <TabsTrigger value="127V">127V</TabsTrigger>
            )}
            {voltageConfig.supports220V && (
              <TabsTrigger value="220V">220V</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="both" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Perguntas para ambas as voltagens</h3>
              <Button
                size="sm"
                onClick={() => {
                  setEditingQuestion(null);
                  setShowQuestionForm(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Pergunta
              </Button>
            </div>
            
            <QuestionsList
              questions={getQuestionsForTab('both')}
              onEdit={editQuestion}
              onRemove={removeQuestion}
              getDefectColor={getDefectColor}
              getDefectIcon={getDefectIcon}
              getDefectBadgeVariant={getDefectBadgeVariant}
            />
          </TabsContent>
          
          {voltageConfig.supports127V && (
            <TabsContent value="127V" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Perguntas específicas 127V</h3>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingQuestion(null);
                    setShowQuestionForm(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Pergunta
                </Button>
              </div>
              
              <QuestionsList
                questions={getQuestionsForTab('127V')}
                onEdit={editQuestion}
                onRemove={removeQuestion}
                getDefectColor={getDefectColor}
                getDefectIcon={getDefectIcon}
                getDefectBadgeVariant={getDefectBadgeVariant}
              />
            </TabsContent>
          )}
          
          {voltageConfig.supports220V && (
            <TabsContent value="220V" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Perguntas específicas 220V</h3>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingQuestion(null);
                    setShowQuestionForm(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Pergunta
                </Button>
              </div>
              
              <QuestionsList
                questions={getQuestionsForTab('220V')}
                onEdit={editQuestion}
                onRemove={removeQuestion}
                getDefectColor={getDefectColor}
                getDefectIcon={getDefectIcon}
                getDefectBadgeVariant={getDefectBadgeVariant}
              />
            </TabsContent>
          )}
        </Tabs>
        
        {/* Resumo das perguntas */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Resumo das Perguntas:</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-700">Ambas voltagens:</div>
              <div className="text-gray-600">{getQuestionsForTab('both').length} perguntas</div>
            </div>
            {voltageConfig.supports127V && (
              <div>
                <div className="font-medium text-gray-700">127V:</div>
                <div className="text-gray-600">{getQuestionsForTab('127V').length} perguntas</div>
              </div>
            )}
            {voltageConfig.supports220V && (
              <div>
                <div className="font-medium text-gray-700">220V:</div>
                <div className="text-gray-600">{getQuestionsForTab('220V').length} perguntas</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Modal de formulário de pergunta */}
        {showQuestionForm && (
          <QuestionForm
            question={editingQuestion}
            onSave={editingQuestion ? updateQuestion : addQuestion}
            onCancel={() => {
              setShowQuestionForm(false);
              setEditingQuestion(null);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

// Componente auxiliar para listar perguntas
interface QuestionsListProps {
  questions: InspectionQuestion[];
  onEdit: (questionId: string) => void;
  onRemove: (questionId: string) => void;
  getDefectColor: (defectType: string) => string;
  getDefectIcon: (defectType: string) => React.ReactNode;
  getDefectBadgeVariant: (defectType: string) => any;
}

function QuestionsList({ 
  questions, 
  onEdit, 
  onRemove, 
  getDefectColor, 
  getDefectIcon, 
  getDefectBadgeVariant 
}: QuestionsListProps) {
  
  if (questions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Zap className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>Nenhuma pergunta cadastrada</p>
        <p className="text-sm">Clique em "Adicionar Pergunta" para começar</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {questions.map(question => (
        <div key={question.id} className={`p-4 border-2 rounded-lg ${getDefectColor(question.defectType)}`}>
          <div className="flex items-start space-x-3">
            {getDefectIcon(question.defectType)}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium">{question.question}</span>
                <Badge variant={getDefectBadgeVariant(question.defectType)}>
                  {question.defectType}
                </Badge>
                {question.required && <Badge variant="outline">OBRIGATÓRIA</Badge>}
                <Badge variant="outline">{question.type.toUpperCase()}</Badge>
              </div>
              
              {/* Configurações específicas */}
              {question.defectConfig && (
                <div className="text-sm text-gray-600 mt-2">
                  {question.defectConfig.numeric && (
                    <div>Faixa: {question.defectConfig.numeric.min} - {question.defectConfig.numeric.max} {question.defectConfig.numeric.unit}</div>
                  )}
                  {question.defectConfig.ok_nok && (
                    <div>OK: "{question.defectConfig.ok_nok.okValue}" | NOK: "{question.defectConfig.ok_nok.nokValue}"</div>
                  )}
                  {question.defectConfig.scale && (
                    <div>Escala: {question.defectConfig.scale.min}-{question.defectConfig.scale.max} (Aprovado ≥ {question.defectConfig.scale.passThreshold})</div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(question.id)}
              >
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(question.id)}
                className="text-red-500 hover:text-red-700"
              >
                Remover
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

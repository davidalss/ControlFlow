import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { InspectionQuestion } from "@/hooks/use-inspection-plans";

interface QuestionFormProps {
  question?: InspectionQuestion | null;
  onSave: (question: InspectionQuestion) => void;
  onCancel: () => void;
}

export default function QuestionForm({ question, onSave, onCancel }: QuestionFormProps) {
  const [formData, setFormData] = useState<Partial<InspectionQuestion>>({
    question: '',
    type: 'ok_nok',
    required: true,
    defectType: 'MINOR',
    defectConfig: {}
  });
  
  // Carregar dados da pergunta se estiver editando
  useEffect(() => {
    if (question) {
      setFormData({
        id: question.id,
        question: question.question,
        type: question.type,
        required: question.required,
        defectType: question.defectType,
        defectConfig: question.defectConfig || {}
      });
    }
  }, [question]);
  
  const handleSave = () => {
    if (!formData.question?.trim()) {
      alert('A pergunta é obrigatória');
      return;
    }
    
    const newQuestion: InspectionQuestion = {
      id: formData.id || `question-${Date.now()}`,
      question: formData.question!,
      type: formData.type!,
      required: formData.required!,
      defectType: formData.defectType!,
      defectConfig: formData.defectConfig
    };
    
    onSave(newQuestion);
  };
  
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
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{question ? 'Editar Pergunta' : 'Nova Pergunta'}</span>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Texto da Pergunta */}
          <div className="space-y-2">
            <Label>Pergunta:</Label>
            <Textarea
              value={formData.question || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Ex: A embalagem está intacta?"
              rows={3}
            />
          </div>
          
          {/* Tipo de Pergunta */}
          <div className="space-y-2">
            <Label>Tipo de resposta:</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ok_nok">OK/NOK</SelectItem>
                <SelectItem value="yes_no">Sim/Não</SelectItem>
                <SelectItem value="number">Número</SelectItem>
                <SelectItem value="scale_1_5">Escala 1-5</SelectItem>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="photo">Foto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Classificação do Defeito */}
          <div className="space-y-2">
            <Label>Classificação do defeito:</Label>
            <div className="grid grid-cols-3 gap-2">
              <div 
                className={`p-3 border-2 rounded-lg cursor-pointer ${
                  formData.defectType === 'CRITICAL' ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, defectType: 'CRITICAL' }))}
              >
                <div className="text-center">
                  <div className="font-bold text-red-600">CRÍTICO</div>
                  <div className="text-xs text-gray-500">Rejeição automática</div>
                </div>
              </div>
              
              <div 
                className={`p-3 border-2 rounded-lg cursor-pointer ${
                  formData.defectType === 'MAJOR' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, defectType: 'MAJOR' }))}
              >
                <div className="text-center">
                  <div className="font-bold text-yellow-600">MAIOR</div>
                  <div className="text-xs text-gray-500">Aprovação condicional</div>
                </div>
              </div>
              
              <div 
                className={`p-3 border-2 rounded-lg cursor-pointer ${
                  formData.defectType === 'MINOR' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, defectType: 'MINOR' }))}
              >
                <div className="text-center">
                  <div className="font-bold text-blue-600">MENOR</div>
                  <div className="text-xs text-gray-500">Aprovação condicional</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Obrigatória */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              checked={formData.required}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, required: checked as boolean }))}
            />
            <Label htmlFor="required">Pergunta obrigatória</Label>
          </div>
          
          {/* Configurações específicas por tipo */}
          {formData.type === 'ok_nok' && (
            <div className="space-y-2">
              <Label>Configurações OK/NOK:</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm">Valor OK:</Label>
                  <Input
                    value={formData.defectConfig?.ok_nok?.okValue || 'OK'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      defectConfig: {
                        ...prev.defectConfig,
                        ok_nok: { 
                          ...prev.defectConfig?.ok_nok, 
                          okValue: e.target.value 
                        }
                      }
                    }))}
                    placeholder="OK"
                  />
                </div>
                <div>
                  <Label className="text-sm">Valor NOK:</Label>
                  <Input
                    value={formData.defectConfig?.ok_nok?.nokValue || 'NOK'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      defectConfig: {
                        ...prev.defectConfig,
                        ok_nok: { 
                          ...prev.defectConfig?.ok_nok, 
                          nokValue: e.target.value 
                        }
                      }
                    }))}
                    placeholder="NOK"
                  />
                </div>
              </div>
            </div>
          )}
          
          {formData.type === 'number' && (
            <div className="space-y-2">
              <Label>Configurações numéricas:</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-sm">Valor mínimo:</Label>
                  <Input
                    type="number"
                    value={formData.defectConfig?.numeric?.min || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      defectConfig: {
                        ...prev.defectConfig,
                        numeric: { 
                          ...prev.defectConfig?.numeric, 
                          min: Number(e.target.value) 
                        }
                      }
                    }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="text-sm">Valor máximo:</Label>
                  <Input
                    type="number"
                    value={formData.defectConfig?.numeric?.max || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      defectConfig: {
                        ...prev.defectConfig,
                        numeric: { 
                          ...prev.defectConfig?.numeric, 
                          max: Number(e.target.value) 
                        }
                      }
                    }))}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label className="text-sm">Unidade:</Label>
                  <Input
                    value={formData.defectConfig?.numeric?.unit || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      defectConfig: {
                        ...prev.defectConfig,
                        numeric: { 
                          ...prev.defectConfig?.numeric, 
                          unit: e.target.value 
                        }
                      }
                    }))}
                    placeholder="V, A, W, etc."
                  />
                </div>
              </div>
            </div>
          )}
          
          {formData.type === 'scale_1_5' && (
            <div className="space-y-2">
              <Label>Configurações de escala:</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm">Valor mínimo para aprovação:</Label>
                  <Select
                    value={String(formData.defectConfig?.scale?.passThreshold || 4)}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      defectConfig: {
                        ...prev.defectConfig,
                        scale: { 
                          min: 1,
                          max: 5,
                          passThreshold: Number(value)
                        }
                      }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 (Qualquer valor)</SelectItem>
                      <SelectItem value="2">2 (≥ 2)</SelectItem>
                      <SelectItem value="3">3 (≥ 3)</SelectItem>
                      <SelectItem value="4">4 (≥ 4)</SelectItem>
                      <SelectItem value="5">5 (Apenas 5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          {/* Preview da pergunta */}
          <div className={`p-4 border-2 rounded-lg ${getDefectColor(formData.defectType || 'MINOR')}`}>
            <div className="flex items-start space-x-3">
              {getDefectIcon(formData.defectType || 'MINOR')}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium">{formData.question || 'Pergunta exemplo'}</span>
                  <Badge variant={
                    formData.defectType === 'CRITICAL' ? 'destructive' :
                    formData.defectType === 'MAJOR' ? 'secondary' : 'outline'
                  }>
                    {formData.defectType}
                  </Badge>
                  {formData.required && <Badge variant="outline">OBRIGATÓRIA</Badge>}
                  <Badge variant="outline">{formData.type?.toUpperCase()}</Badge>
                </div>
                
                {formData.defectConfig && (
                  <div className="text-sm text-gray-600">
                    {formData.defectConfig.numeric && (
                      <div>Faixa: {formData.defectConfig.numeric.min} - {formData.defectConfig.numeric.max} {formData.defectConfig.numeric.unit}</div>
                    )}
                    {formData.defectConfig.ok_nok && (
                      <div>OK: "{formData.defectConfig.ok_nok.okValue}" | NOK: "{formData.defectConfig.ok_nok.nokValue}"</div>
                    )}
                    {formData.defectConfig.scale && (
                      <div>Escala: 1-5 (Aprovado ≥ {formData.defectConfig.scale.passThreshold})</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Ações */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {question ? 'Atualizar' : 'Adicionar'} Pergunta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, X, AlertTriangle, CheckCircle } from "lucide-react";

interface TechnicalRecipeManagerProps {
  productId?: string;
  onSave?: (recipe: any) => void;
  onCancel?: () => void;
}

export default function TechnicalRecipeManager({ productId, onSave, onCancel }: TechnicalRecipeManagerProps) {
  const { toast } = useToast();
  
  const [recipe, setRecipe] = useState({
    id: '',
    version: '1.0',
    productId: productId || '',
    name: 'Receita Técnica Padrão',
    description: 'Parâmetros técnicos para inspeção de qualidade',
    parameters: [
      {
        id: 'param-1',
        name: 'Tensão de Operação',
        unit: 'V',
        min: 110,
        max: 127,
        target: 120,
        tolerance: 5,
        critical: true,
        description: 'Tensão elétrica de operação do produto'
      },
      {
        id: 'param-2',
        name: 'Corrente de Consumo',
        unit: 'A',
        min: 0.5,
        max: 2.0,
        target: 1.2,
        tolerance: 10,
        critical: true,
        description: 'Corrente elétrica consumida pelo produto'
      },
      {
        id: 'param-3',
        name: 'Potência Nominal',
        unit: 'W',
        min: 50,
        max: 200,
        target: 120,
        tolerance: 15,
        critical: false,
        description: 'Potência nominal do produto'
      },
      {
        id: 'param-4',
        name: 'Frequência',
        unit: 'Hz',
        min: 59,
        max: 61,
        target: 60,
        tolerance: 2,
        critical: true,
        description: 'Frequência de operação'
      },
      {
        id: 'param-5',
        name: 'Fator de Potência',
        unit: '',
        min: 0.85,
        max: 1.0,
        target: 0.95,
        tolerance: 5,
        critical: false,
        description: 'Fator de potência do produto'
      }
    ],
    testConditions: {
      temperature: { min: 20, max: 25, unit: '°C' },
      humidity: { min: 45, max: 65, unit: '%' },
      voltage: { min: 110, max: 127, unit: 'V' },
      frequency: { min: 59, max: 61, unit: 'Hz' }
    },
    defectClassification: {
      critical: {
        description: 'Defeitos que comprometem a segurança ou funcionalidade básica',
        examples: ['Tensão fora da faixa crítica', 'Corrente excessiva', 'Frequência incorreta']
      },
      major: {
        description: 'Defeitos que afetam significativamente a qualidade',
        examples: ['Potência fora da faixa', 'Fator de potência baixo']
      },
      minor: {
        description: 'Defeitos que afetam levemente a qualidade',
        examples: ['Variações pequenas nos parâmetros']
      }
    }
  });

  const [editingParameter, setEditingParameter] = useState<string | null>(null);

  const units = [
    { value: 'V', label: 'Volts (V)' },
    { value: 'A', label: 'Amperes (A)' },
    { value: 'W', label: 'Watts (W)' },
    { value: 'Hz', label: 'Hertz (Hz)' },
    { value: '%', label: 'Porcentagem (%)' },
    { value: '°C', label: 'Celsius (°C)' },
    { value: 'kg', label: 'Quilogramas (kg)' },
    { value: 'mm', label: 'Milímetros (mm)' },
    { value: 'cm', label: 'Centímetros (cm)' },
    { value: 'm', label: 'Metros (m)' },
    { value: '', label: 'Sem unidade' }
  ];

  const addParameter = () => {
    const newParameter = {
      id: `param-${Date.now()}`,
      name: '',
      unit: 'V',
      min: 0,
      max: 100,
      target: 50,
      tolerance: 5,
      critical: false,
      description: ''
    };
    
    setRecipe(prev => ({
      ...prev,
      parameters: [...prev.parameters, newParameter]
    }));
    
    setEditingParameter(newParameter.id);
  };

  const updateParameter = (parameterId: string, updates: any) => {
    setRecipe(prev => ({
      ...prev,
      parameters: prev.parameters.map(param => 
        param.id === parameterId ? { ...param, ...updates } : param
      )
    }));
  };

  const removeParameter = (parameterId: string) => {
    setRecipe(prev => ({
      ...prev,
      parameters: prev.parameters.filter(param => param.id !== parameterId)
    }));
  };

  const updateTestCondition = (condition: string, updates: any) => {
    setRecipe(prev => ({
      ...prev,
      testConditions: {
        ...prev.testConditions,
        [condition]: { ...prev.testConditions[condition], ...updates }
      }
    }));
  };

  const validateParameter = (parameter: any) => {
    const errors = [];
    
    if (parameter.min >= parameter.max) {
      errors.push('Valor mínimo deve ser menor que o máximo');
    }
    
    if (parameter.target < parameter.min || parameter.target > parameter.max) {
      errors.push('Valor alvo deve estar entre mínimo e máximo');
    }
    
    if (parameter.tolerance < 0 || parameter.tolerance > 100) {
      errors.push('Tolerância deve estar entre 0% e 100%');
    }
    
    return errors;
  };

  const getParameterStatus = (parameter: any) => {
    const errors = validateParameter(parameter);
    if (errors.length > 0) {
      return { status: 'error', message: errors[0] };
    }
    return { status: 'valid', message: 'Parâmetro válido' };
  };

  const handleSave = () => {
    if (!recipe.productId) {
      toast({
        title: "Produto obrigatório",
        description: "Selecione um produto para a receita",
        variant: "destructive",
      });
      return;
    }

    if (recipe.parameters.length === 0) {
      toast({
        title: "Parâmetros obrigatórios",
        description: "Adicione pelo menos um parâmetro à receita",
        variant: "destructive",
      });
      return;
    }

    // Validar todos os parâmetros
    const invalidParameters = recipe.parameters.filter(param => validateParameter(param).length > 0);
    if (invalidParameters.length > 0) {
      toast({
        title: "Parâmetros inválidos",
        description: `${invalidParameters.length} parâmetro(s) com configuração inválida`,
        variant: "destructive",
      });
      return;
    }

    if (onSave) {
      onSave(recipe);
    }
    
    toast({
      title: "Receita salva",
      description: "Receita técnica salva com sucesso",
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciador de Receitas Técnicas</h2>
        <p className="text-gray-600 mt-2">Configure parâmetros técnicos e faixas aceitáveis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuração Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Configuração Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-id">Produto</Label>
              <Input
                id="product-id"
                placeholder="Selecione o produto"
                value={recipe.productId}
                onChange={(e) => setRecipe(prev => ({ ...prev, productId: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipe-name">Nome da Receita</Label>
              <Input
                id="recipe-name"
                placeholder="Ex: Receita Técnica Padrão"
                value={recipe.name}
                onChange={(e) => setRecipe(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Versão</Label>
              <Input
                id="version"
                placeholder="1.0"
                value={recipe.version}
                onChange={(e) => setRecipe(prev => ({ ...prev, version: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva a receita técnica..."
                value={recipe.description}
                onChange={(e) => setRecipe(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Condições de Teste */}
        <Card>
          <CardHeader>
            <CardTitle>Condições de Teste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Temperatura</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={recipe.testConditions.temperature.min}
                    onChange={(e) => updateTestCondition('temperature', { min: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={recipe.testConditions.temperature.max}
                    onChange={(e) => updateTestCondition('temperature', { max: Number(e.target.value) })}
                  />
                  <span className="flex items-center text-sm text-gray-500">
                    {recipe.testConditions.temperature.unit}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Umidade</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={recipe.testConditions.humidity.min}
                    onChange={(e) => updateTestCondition('humidity', { min: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={recipe.testConditions.humidity.max}
                    onChange={(e) => updateTestCondition('humidity', { max: Number(e.target.value) })}
                  />
                  <span className="flex items-center text-sm text-gray-500">
                    {recipe.testConditions.humidity.unit}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tensão</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={recipe.testConditions.voltage.min}
                    onChange={(e) => updateTestCondition('voltage', { min: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={recipe.testConditions.voltage.max}
                    onChange={(e) => updateTestCondition('voltage', { max: Number(e.target.value) })}
                  />
                  <span className="flex items-center text-sm text-gray-500">
                    {recipe.testConditions.voltage.unit}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Frequência</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={recipe.testConditions.frequency.min}
                    onChange={(e) => updateTestCondition('frequency', { min: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={recipe.testConditions.frequency.max}
                    onChange={(e) => updateTestCondition('frequency', { max: Number(e.target.value) })}
                  />
                  <span className="flex items-center text-sm text-gray-500">
                    {recipe.testConditions.frequency.unit}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parâmetros Técnicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Parâmetros Técnicos
            <Button onClick={addParameter}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Parâmetro
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recipe.parameters.map((parameter) => {
              const status = getParameterStatus(parameter);
              const isEditing = editingParameter === parameter.id;
              
              return (
                <div key={parameter.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={parameter.critical ? "destructive" : "outline"}>
                        {parameter.critical ? 'Crítico' : 'Normal'}
                      </Badge>
                      {status.status === 'error' ? (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-sm text-gray-500">{status.message}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingParameter(isEditing ? null : parameter.id)}
                      >
                        {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeParameter(parameter.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nome do Parâmetro</Label>
                          <Input
                            value={parameter.name}
                            onChange={(e) => updateParameter(parameter.id, { name: e.target.value })}
                            placeholder="Ex: Tensão de Operação"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Unidade</Label>
                          <Select
                            value={parameter.unit}
                            onValueChange={(value) => updateParameter(parameter.id, { unit: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {units.map(unit => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Valor Mínimo</Label>
                          <Input
                            type="number"
                            value={parameter.min}
                            onChange={(e) => updateParameter(parameter.id, { min: Number(e.target.value) })}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Valor Máximo</Label>
                          <Input
                            type="number"
                            value={parameter.max}
                            onChange={(e) => updateParameter(parameter.id, { max: Number(e.target.value) })}
                            placeholder="100"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Valor Alvo</Label>
                          <Input
                            type="number"
                            value={parameter.target}
                            onChange={(e) => updateParameter(parameter.id, { target: Number(e.target.value) })}
                            placeholder="50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tolerância (%)</Label>
                          <Input
                            type="number"
                            value={parameter.tolerance}
                            onChange={(e) => updateParameter(parameter.id, { tolerance: Number(e.target.value) })}
                            placeholder="5"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Textarea
                          value={parameter.description}
                          onChange={(e) => updateParameter(parameter.id, { description: e.target.value })}
                          placeholder="Descreva o parâmetro..."
                          rows={2}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={parameter.critical}
                          onCheckedChange={(checked) => updateParameter(parameter.id, { critical: checked })}
                        />
                        <Label>Parâmetro Crítico</Label>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-medium">{parameter.name}</h4>
                      <p className="text-sm text-gray-600">{parameter.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm">
                          <strong>Faixa:</strong> {parameter.min} - {parameter.max} {parameter.unit}
                        </span>
                        <span className="text-sm">
                          <strong>Alvo:</strong> {parameter.target} {parameter.unit}
                        </span>
                        <span className="text-sm">
                          <strong>Tolerância:</strong> ±{parameter.tolerance}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Classificação de Defeitos */}
      <Card>
        <CardHeader>
          <CardTitle>Classificação de Defeitos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <h4 className="font-medium text-red-700">Defeitos Críticos</h4>
              </div>
              <p className="text-sm text-gray-600">
                {recipe.defectClassification.critical.description}
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                {recipe.defectClassification.critical.examples.map((example, index) => (
                  <li key={index}>• {example}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <h4 className="font-medium text-orange-700">Defeitos Maiores</h4>
              </div>
              <p className="text-sm text-gray-600">
                {recipe.defectClassification.major.description}
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                {recipe.defectClassification.major.examples.map((example, index) => (
                  <li key={index}>• {example}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <h4 className="font-medium text-yellow-700">Defeitos Menores</h4>
              </div>
              <p className="text-sm text-gray-600">
                {recipe.defectClassification.minor.description}
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                {recipe.defectClassification.minor.examples.map((example, index) => (
                  <li key={index}>• {example}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Salvar Receita
        </Button>
      </div>
    </div>
  );
}

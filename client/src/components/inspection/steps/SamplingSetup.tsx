import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Calculator, AlertTriangle, CheckCircle, XCircle, HelpCircle } from "lucide-react";

interface SamplingSetupProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function SamplingSetup({ data, onUpdate, onNext, onPrev }: SamplingSetupProps) {
  const { toast } = useToast();
  
  // Verificar se é inspeção de bonificação
  const isBonification = data.inspectionType === 'bonification';
  
  const [lotSize, setLotSize] = useState(data.lotSize || '');
  const [inspectionLevel, setInspectionLevel] = useState(data.inspectionLevel || 'II');
  const [sampleSize, setSampleSize] = useState(data.sampleSize || 0);
  const [aqlTable, setAqlTable] = useState(data.aqlTable || {
    critical: { aql: 0, acceptance: 0, rejection: 1 },
    major: { aql: 2.5, acceptance: 0, rejection: 0 },
    minor: { aql: 4.0, acceptance: 0, rejection: 0 }
  });

  // Tabelas NBR 5426
  const lotSizeToCode = [
    { range: [2, 8], I: 'A', II: 'B', III: 'C' },
    { range: [9, 15], I: 'B', II: 'C', III: 'D' },
    { range: [16, 25], I: 'C', II: 'D', III: 'E' },
    { range: [26, 50], I: 'D', II: 'E', III: 'F' },
    { range: [51, 90], I: 'E', II: 'F', III: 'G' },
    { range: [91, 150], I: 'F', II: 'G', III: 'H' },
    { range: [151, 280], I: 'G', II: 'H', III: 'J' },
    { range: [281, 500], I: 'H', II: 'J', III: 'K' },
    { range: [501, 1200], I: 'J', II: 'K', III: 'L' },
    { range: [1201, 3200], I: 'K', II: 'L', III: 'M' },
    { range: [3201, 10000], I: 'L', II: 'M', III: 'N' },
    { range: [10001, 35000], I: 'M', II: 'N', III: 'P' },
    { range: [35001, 150000], I: 'N', II: 'P', III: 'Q' },
    { range: [150001, 500000], I: 'P', II: 'Q', III: 'R' },
    { range: [500001, Infinity], I: 'Q', II: 'R', III: 'S' }
  ];

  const codeToSampleSize = {
    'A': 2, 'B': 3, 'C': 5, 'D': 8, 'E': 13, 'F': 20, 'G': 32, 'H': 50,
    'J': 80, 'K': 125, 'L': 200, 'M': 315, 'N': 500, 'P': 800, 'Q': 1250,
    'R': 2000, 'S': 3150
  };

  const aqlData = {
    2: { '0': { Ac: 0, Re: 1 }, '1.0': { Ac: 0, Re: 1 }, '1.5': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 }, '6.5': { Ac: 0, Re: 1 }, '10': { Ac: 0, Re: 1 } },
    3: { '0': { Ac: 0, Re: 1 }, '1.0': { Ac: 0, Re: 1 }, '1.5': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 }, '6.5': { Ac: 0, Re: 1 }, '10': { Ac: 0, Re: 1 } },
    5: { '0': { Ac: 0, Re: 1 }, '1.0': { Ac: 0, Re: 1 }, '1.5': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 }, '6.5': { Ac: 0, Re: 1 }, '10': { Ac: 0, Re: 1 } },
    8: { '0': { Ac: 0, Re: 1 }, '1.0': { Ac: 0, Re: 1 }, '1.5': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 }, '6.5': { Ac: 0, Re: 1 }, '10': { Ac: 0, Re: 1 } },
    13: { '0': { Ac: 0, Re: 1 }, '1.0': { Ac: 0, Re: 1 }, '1.5': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 }, '6.5': { Ac: 0, Re: 1 }, '10': { Ac: 0, Re: 1 } },
    20: { '0': { Ac: 0, Re: 1 }, '1.0': { Ac: 0, Re: 1 }, '1.5': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 }, '6.5': { Ac: 0, Re: 1 }, '10': { Ac: 0, Re: 1 } },
    32: { '0': { Ac: 0, Re: 1 }, '1.0': { Ac: 0, Re: 1 }, '1.5': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 }, '6.5': { Ac: 0, Re: 1 }, '10': { Ac: 0, Re: 1 } },
    50: { '0': { Ac: 0, Re: 1 }, '1.0': { Ac: 0, Re: 1 }, '1.5': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 }, '6.5': { Ac: 0, Re: 1 }, '10': { Ac: 0, Re: 1 } },
    80: { '0': { Ac: 0, Re: 1 }, '1.0': { Ac: 0, Re: 1 }, '1.5': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 }, '6.5': { Ac: 0, Re: 1 }, '10': { Ac: 0, Re: 1 } },
    125: { '0': { Ac: 0, Re: 1 }, '1.0': { Ac: 0, Re: 1 }, '1.5': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 }, '6.5': { Ac: 0, Re: 1 }, '10': { Ac: 0, Re: 1 } },
    200: { '0': { Ac: 0, Re: 1 }, '1.0': { Ac: 0, Re: 1 }, '1.5': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 }, '6.5': { Ac: 0, Re: 1 }, '10': { Ac: 0, Re: 1 } },
    315: { '0': { Ac: 0, Re: 1 }, '1.0': { Ac: 0, Re: 1 }, '1.5': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 }, '6.5': { Ac: 0, Re: 1 }, '10': { Ac: 0, Re: 1 } },
    500: { '0': { Ac: 0, Re: 1 }, '1.0': { Ac: 0, Re: 1 }, '1.5': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 }, '6.5': { Ac: 0, Re: 1 }, '10': { Ac: 0, Re: 1 } },
    800: { '0': { Ac: 0, Re: 1 }, '1.0': { Ac: 0, Re: 1 }, '1.5': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 }, '6.5': { Ac: 0, Re: 1 }, '10': { Ac: 0, Re: 1 } },
    1250: { '0': { Ac: 0, Re: 1 }, '1.0': { Ac: 0, Re: 1 }, '1.5': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 }, '6.5': { Ac: 0, Re: 1 }, '10': { Ac: 0, Re: 1 } },
    2000: { '0': { Ac: 0, Re: 1 }, '1.0': { Ac: 0, Re: 1 }, '1.5': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 }, '6.5': { Ac: 0, Re: 1 }, '10': { Ac: 0, Re: 1 } },
    3150: { '0': { Ac: 0, Re: 1 }, '1.0': { Ac: 0, Re: 1 }, '1.5': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 }, '6.5': { Ac: 0, Re: 1 }, '10': { Ac: 0, Re: 1 } }
  };

  const getInspectionLevelDescription = (level: string) => {
    switch (level) {
      case 'I': return 'Menos rigoroso - Para lotes pequenos ou produtos simples';
      case 'II': return 'Padrão - Recomendado para a maioria dos casos';
      case 'III': return 'Mais rigoroso - Para produtos críticos ou lotes grandes';
      default: return '';
    }
  };

  const calculateSampleSize = useCallback((lotSize: number, level: string) => {
    if (lotSize <= 0) return 0;
    
    const codeEntry = lotSizeToCode.find(entry => 
      lotSize >= entry.range[0] && lotSize <= entry.range[1]
    );
    
    if (!codeEntry) return 0;
    
    const code = codeEntry[level as keyof typeof codeEntry];
    return codeToSampleSize[code as keyof typeof codeToSampleSize] || 0;
  }, []);

  const calculateAQLPoints = useCallback((sampleSize: number, aql: number) => {
    if (sampleSize <= 0 || aql < 0) return { acceptance: 0, rejection: 0 };
    
    const sampleData = aqlData[sampleSize as keyof typeof aqlData];
    if (!sampleData) return { acceptance: 0, rejection: 0 };
    
    const aqlKey = aql.toString();
    const points = sampleData[aqlKey as keyof typeof sampleData];
    
    return points || { acceptance: 0, rejection: 0 };
  }, []);

  const updateAQLTable = useCallback((newAqlTable: any) => {
    setAqlTable(newAqlTable);
    onUpdate({ 
      ...data,
      aqlTable: newAqlTable 
    });
  }, [onUpdate, data]);

  const handleLotSizeChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setLotSize(value);
    
    if (numValue > 0) {
      const newSampleSize = calculateSampleSize(numValue, inspectionLevel);
      setSampleSize(newSampleSize);
      
      const newAqlTable = {
        critical: { ...aqlTable.critical, ...calculateAQLPoints(newSampleSize, aqlTable.critical.aql) },
        major: { ...aqlTable.major, ...calculateAQLPoints(newSampleSize, aqlTable.major.aql) },
        minor: { ...aqlTable.minor, ...calculateAQLPoints(newSampleSize, aqlTable.minor.aql) }
      };
      
      updateAQLTable(newAqlTable);
      onUpdate({ 
        ...data,
        lotSize: numValue, 
        sampleSize: newSampleSize 
      });
    } else {
      setSampleSize(0);
      onUpdate({ lotSize: 0, sampleSize: 0 });
    }
  };

  const handleInspectionLevelChange = (level: string) => {
    setInspectionLevel(level);
    
    if (lotSize > 0) {
      const newSampleSize = calculateSampleSize(lotSize, level);
      setSampleSize(newSampleSize);
      
      const newAqlTable = {
        critical: { ...aqlTable.critical, ...calculateAQLPoints(newSampleSize, aqlTable.critical.aql) },
        major: { ...aqlTable.major, ...calculateAQLPoints(newSampleSize, aqlTable.major.aql) },
        minor: { ...aqlTable.minor, ...calculateAQLPoints(newSampleSize, aqlTable.minor.aql) }
      };
      
      updateAQLTable(newAqlTable);
      onUpdate({ 
        ...data,
        inspectionLevel: level, 
        sampleSize: newSampleSize 
      });
    } else {
      onUpdate({ 
        ...data,
        inspectionLevel: level 
      });
    }
  };

  const handleAQLChange = (defectType: string, aql: number) => {
    const newAqlTable = { ...aqlTable };
    newAqlTable[defectType as keyof typeof aqlTable] = {
      ...newAqlTable[defectType as keyof typeof aqlTable],
      aql: aql,
      ...calculateAQLPoints(sampleSize, aql)
    };
    
    setAqlTable(newAqlTable);
    onUpdate({
      ...data,
      aqlTable: newAqlTable
    });
  };

  const handleNext = () => {
    if (isBonification) {
      // Para bonificação, definir amostragem 100%
      const bonificationData = {
        lotSize: parseInt(lotSize) || 0,
        sampleSize: parseInt(lotSize) || 0, // 100% da amostra
        inspectionLevel: 'II',
        aqlTable: {
          critical: { aql: 0, acceptance: 0, rejection: 1 },
          major: { aql: 2.5, acceptance: 0, rejection: 0 },
          minor: { aql: 4.0, acceptance: 0, rejection: 0 }
        }
      };
      onUpdate(bonificationData);
    } else {
      // Validação normal
      if (!lotSize || parseInt(lotSize) <= 0) {
        toast({
          title: "Quantidade inválida",
          description: "Por favor, informe uma quantidade válida para o lote",
          variant: "destructive",
        });
        return;
      }
    }
    
    onNext();
  };

  // Se for bonificação, mostrar tela simplificada
  if (isBonification) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Inspeção de Bonificação</h2>
          <p className="text-gray-600 mt-2">Inspeção 100% - Todos os produtos serão verificados</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Configuração para Bonificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Inspeção 100%</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Na inspeção de bonificação, todos os produtos do lote são verificados individualmente.
                Não há amostragem - cada item é inspecionado completamente.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonification-lot-size">Quantidade Total da NF (Lote)</Label>
              <Input
                id="bonification-lot-size"
                type="number"
                placeholder="Ex: 1000"
                value={lotSize}
                onChange={(e) => handleLotSizeChange(e.target.value)}
                min="1"
              />
              <p className="text-sm text-gray-500">
                Informe a quantidade total de produtos no lote para bonificação
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <HelpCircle className="w-4 h-4" />
                <span className="font-medium">Como funciona a Bonificação</span>
              </div>
              <ul className="text-sm text-blue-600 mt-2 space-y-1">
                <li>• Todos os produtos são inspecionados (100%)</li>
                <li>• Não há amostragem estatística</li>
                <li>• Cada item é verificado individualmente</li>
                <li>• Critérios de aceitação são aplicados a cada produto</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrev}>
            Anterior
          </Button>
          <Button onClick={handleNext} disabled={!lotSize || parseInt(lotSize) <= 0}>
            Próximo Passo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Configuração da Amostragem</h2>
        <p className="text-gray-600 mt-2">Setup AQL conforme NBR 5426 - Controle de Qualidade</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuração Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Configuração da Amostragem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lot-size">Quantidade Total da NF (Lote)</Label>
              <Input
                id="lot-size"
                type="number"
                placeholder="Ex: 1000"
                value={lotSize}
                onChange={(e) => handleLotSizeChange(e.target.value)}
                min="1"
              />
              <p className="text-sm text-gray-500">
                Informe a quantidade total de produtos na nota fiscal
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inspection-level">Nível de Inspeção</Label>
              <Select value={inspectionLevel} onValueChange={handleInspectionLevelChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="I">Nível I - Menos rigoroso</SelectItem>
                  <SelectItem value="II">Nível II - Padrão (recomendado)</SelectItem>
                  <SelectItem value="III">Nível III - Mais rigoroso</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                {getInspectionLevelDescription(inspectionLevel)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Tamanho da Amostra</Label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                <Calculator className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">{sampleSize} produtos</span>
                {sampleSize > 0 && (
                  <Badge variant="outline" className="ml-auto">
                    {((sampleSize / parseInt(lotSize)) * 100).toFixed(1)}% do lote
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela AQL */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Tabela AQL - Níveis de Aceitação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de Defeito</TableHead>
                  <TableHead>AQL (%)</TableHead>
                  <TableHead>Aceitação</TableHead>
                  <TableHead>Rejeição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      Críticos
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={aqlTable.critical.aql.toString()} 
                      onValueChange={(value) => handleAQLChange('critical', parseFloat(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {aqlTable.critical.acceptance}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      {aqlTable.critical.rejection}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      Maiores
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={aqlTable.major.aql.toString()} 
                      onValueChange={(value) => handleAQLChange('major', parseFloat(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="1.0">1.0</SelectItem>
                        <SelectItem value="1.5">1.5</SelectItem>
                        <SelectItem value="2.5">2.5</SelectItem>
                        <SelectItem value="4.0">4.0</SelectItem>
                        <SelectItem value="6.5">6.5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {aqlTable.major.acceptance}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      {aqlTable.major.rejection}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      Menores
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={aqlTable.minor.aql.toString()} 
                      onValueChange={(value) => handleAQLChange('minor', parseFloat(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="1.0">1.0</SelectItem>
                        <SelectItem value="1.5">1.5</SelectItem>
                        <SelectItem value="2.5">2.5</SelectItem>
                        <SelectItem value="4.0">4.0</SelectItem>
                        <SelectItem value="6.5">6.5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {aqlTable.minor.acceptance}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      {aqlTable.minor.rejection}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <HelpCircle className="w-4 h-4" />
                <span className="font-medium">Como interpretar a tabela AQL</span>
              </div>
              <ul className="text-sm text-blue-600 mt-2 space-y-1">
                <li>• <strong>Aceitação:</strong> Máximo de defeitos aceitos</li>
                <li>• <strong>Rejeição:</strong> Mínimo de defeitos para rejeitar</li>
                <li>• <strong>Críticos:</strong> Sempre AQL 0% (zero defeitos aceitos)</li>
                <li>• <strong>Maiores:</strong> Padrão 2,5% (ajustável conforme necessidade)</li>
                <li>• <strong>Menores:</strong> Padrão 4,0% (ajustável conforme necessidade)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Anterior
        </Button>
        <Button onClick={handleNext} disabled={!lotSize || parseInt(lotSize) <= 0}>
          Próximo Passo
        </Button>
      </div>
    </div>
  );
}

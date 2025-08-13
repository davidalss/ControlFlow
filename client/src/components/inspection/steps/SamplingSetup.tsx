import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Calculator, Info, CheckCircle, XCircle } from 'lucide-react';

interface SamplingSetupData {
  lotSize: number;
  sampleSize: number;
  inspectionLevel: string;
  aqlTable: {
    critical: { aql: number; acceptance: number; rejection: number };
    major: { aql: number; acceptance: number; rejection: number };
    minor: { aql: number; acceptance: number; rejection: number };
  };
}

interface SamplingSetupProps {
  data: SamplingSetupData;
  onUpdate: (data: SamplingSetupData) => void;
  onNext: () => void;
}

export default function SamplingSetup({ data, onUpdate, onNext }: SamplingSetupProps) {
  const [lotSize, setLotSize] = useState(data.lotSize?.toString() || '');
  const [sampleSize, setSampleSize] = useState(data.sampleSize || 0);
  const [inspectionLevel, setInspectionLevel] = useState(data.inspectionLevel || 'II');
  const [aqlTable, setAqlTable] = useState(data.aqlTable || {
    critical: { aql: 0, acceptance: 0, rejection: 1 },
    major: { aql: 2.5, acceptance: 0, rejection: 1 },
    minor: { aql: 4.0, acceptance: 0, rejection: 1 }
  });

  // Tabela de códigos de amostragem baseada na NBR 5426 - Estrutura correta
  // (lote_min, lote_max, S1, S2, S3, S4, I, II, III)
  const lotSizeToCode = [
    { range: [2, 8], S1: 'A', S2: 'A', S3: 'A', S4: 'A', I: 'A', II: 'A', III: 'B' },
    { range: [9, 15], S1: 'A', S2: 'A', S3: 'A', S4: 'B', I: 'A', II: 'B', III: 'C' },
    { range: [16, 25], S1: 'A', S2: 'A', S3: 'B', S4: 'C', I: 'B', II: 'C', III: 'D' },
    { range: [26, 50], S1: 'A', S2: 'B', S3: 'C', S4: 'D', I: 'C', II: 'D', III: 'E' },
    { range: [51, 90], S1: 'B', S2: 'C', S3: 'C', S4: 'E', I: 'C', II: 'E', III: 'F' },
    { range: [91, 150], S1: 'B', S2: 'C', S3: 'D', S4: 'F', I: 'D', II: 'F', III: 'G' },
    { range: [151, 280], S1: 'B', S2: 'D', S3: 'E', S4: 'G', I: 'E', II: 'G', III: 'H' },
    { range: [281, 500], S1: 'B', S2: 'E', S3: 'F', S4: 'H', I: 'F', II: 'H', III: 'J' },
    { range: [501, 1200], S1: 'C', S2: 'F', S3: 'G', S4: 'J', I: 'G', II: 'J', III: 'K' },
    { range: [1201, 3200], S1: 'C', S2: 'G', S3: 'J', S4: 'L', I: 'H', II: 'K', III: 'L' },
    { range: [3201, 10000], S1: 'D', S2: 'G', S3: 'K', S4: 'M', I: 'J', II: 'L', III: 'M' },
    { range: [10001, 15000], S1: 'D', S2: 'G', S3: 'L', S4: 'N', I: 'K', II: 'M', III: 'N' }
  ];

  // Mapeamento de código para tamanho da amostra
  const codeToSampleSize: { [key: string]: number } = {
    'A': 2, 'B': 3, 'C': 5, 'D': 8, 'E': 13, 'F': 20, 'G': 32, 'H': 50,
    'J': 80, 'K': 125, 'L': 200, 'M': 315, 'N': 500
  };

  // Tabela AQL baseada na NBR 5426 - Valores REAIS da norma
  const aqlData: { [key: number]: { [key: string]: { Ac: number; Re: number } } } = {
    2: { '0': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 1, Re: 2 } },
    3: { '0': { Ac: 0, Re: 1 }, '2.5': { Ac: 1, Re: 2 }, '4.0': { Ac: 1, Re: 2 } },
    5: { '0': { Ac: 0, Re: 1 }, '2.5': { Ac: 1, Re: 2 }, '4.0': { Ac: 2, Re: 3 } },
    8: { '0': { Ac: 0, Re: 1 }, '2.5': { Ac: 2, Re: 3 }, '4.0': { Ac: 3, Re: 4 } },
    13: { '0': { Ac: 0, Re: 1 }, '2.5': { Ac: 2, Re: 3 }, '4.0': { Ac: 3, Re: 4 } },
    20: { '0': { Ac: 0, Re: 1 }, '2.5': { Ac: 2, Re: 3 }, '4.0': { Ac: 3, Re: 4 } },
    32: { '0': { Ac: 0, Re: 1 }, '2.5': { Ac: 3, Re: 4 }, '4.0': { Ac: 5, Re: 6 } },
    50: { '0': { Ac: 0, Re: 1 }, '2.5': { Ac: 5, Re: 6 }, '4.0': { Ac: 7, Re: 8 } },
    80: { '0': { Ac: 0, Re: 1 }, '2.5': { Ac: 7, Re: 8 }, '4.0': { Ac: 10, Re: 11 } },
    125: { '0': { Ac: 0, Re: 1 }, '2.5': { Ac: 10, Re: 11 }, '4.0': { Ac: 14, Re: 15 } },
    200: { '0': { Ac: 0, Re: 1 }, '2.5': { Ac: 14, Re: 15 }, '4.0': { Ac: 21, Re: 22 } },
    315: { '0': { Ac: 0, Re: 1 }, '2.5': { Ac: 21, Re: 22 }, '4.0': { Ac: 21, Re: 22 } },
    500: { '0': { Ac: 0, Re: 1 }, '2.5': { Ac: 21, Re: 22 }, '4.0': { Ac: 21, Re: 22 } }
  };

  // Debug: Verificar se a tabela está correta
  console.log('=== AQL DATA DEBUG ===');
  console.log('Available sample sizes:', Object.keys(aqlData));
  console.log('Sample size 80 data:', aqlData[80]);
  console.log('Sample size 125 data:', aqlData[125]);
  console.log('========================');

  const getInspectionLevelDescription = (level: string) => {
    switch (level) {
      case 'I': return 'Menos rigoroso - Para lotes pequenos ou produtos simples';
      case 'II': return 'Padrão - Recomendado para a maioria dos casos';
      case 'III': return 'Mais rigoroso - Para produtos críticos ou lotes grandes';
      default: return '';
    }
  };

  const calculateSampleSize = (lotSize: number, level: string) => {
    if (lotSize <= 0) return 0;
    
    const codeEntry = lotSizeToCode.find(entry => 
      lotSize >= entry.range[0] && lotSize <= entry.range[1]
    );
    
    if (!codeEntry) return 0;
    
    // Mapeamento correto dos níveis
    let code: string;
    if (level === 'I') {
      code = codeEntry.II; // Nível I usa código II (normal)
    } else if (level === 'II') {
      code = codeEntry.II; // Nível II usa código II (normal)
    } else if (level === 'III') {
      code = codeEntry.III; // Nível III usa código III (apertado)
    } else {
      code = codeEntry.II; // Padrão
    }
    
    console.log(`Lot size: ${lotSize}, Level: ${level}, Code: ${code}`);
    return codeToSampleSize[code] || 0;
  };

  const calculateAQLPoints = (sampleSize: number, aql: number) => {
    if (sampleSize <= 0 || aql < 0) return { acceptance: 0, rejection: 1 };
    
    console.log(`Calculating AQL for sample size: ${sampleSize}, AQL: ${aql}`);
    console.log('Available sample sizes:', Object.keys(aqlData));
    
    const sampleData = aqlData[sampleSize];
    if (!sampleData) {
      console.log(`Sample size ${sampleSize} not found in aqlData`);
      return { acceptance: 0, rejection: 1 };
    }
    
    const aqlKey = aql.toString();
    console.log('Available AQL keys for this sample size:', Object.keys(sampleData));
    const points = sampleData[aqlKey];
    
    if (!points) {
      console.log(`AQL ${aqlKey} not found for sample size ${sampleSize}`);
      return { acceptance: 0, rejection: 1 };
    }
    
    console.log(`Found AQL points for sample ${sampleSize}, AQL ${aqlKey}:`, points);
    return { acceptance: points.Ac, rejection: points.Re };
  };

  const updateAQLTable = (newAqlTable: any) => {
    setAqlTable(newAqlTable);
    onUpdate({ 
      ...data,
      aqlTable: newAqlTable 
    });
  };

  const calculateAndUpdateAQL = (lotSizeNum: number, level: string) => {
    const newSampleSize = calculateSampleSize(lotSizeNum, level);
    console.log(`Lot size: ${lotSizeNum}, Level: ${level}, Sample size: ${newSampleSize}`);
    setSampleSize(newSampleSize);
    
    // TESTE DIRETO - Verificar se a tabela está correta
    console.log('=== TESTE DIRETO ===');
    console.log('Sample size:', newSampleSize);
    console.log('AQL data keys:', Object.keys(aqlData));
    console.log('AQL data for this sample:', aqlData[newSampleSize]);
    
    if (aqlData[newSampleSize]) {
      console.log('4.0 AQL data:', aqlData[newSampleSize]['4.0']);
    }
    console.log('===================');
    
    const criticalPoints = calculateAQLPoints(newSampleSize, 0);
    const majorPoints = calculateAQLPoints(newSampleSize, 2.5);
    const minorPoints = calculateAQLPoints(newSampleSize, 4.0);
    
    console.log('=== DEBUG AQL POINTS ===');
    console.log('Critical points:', criticalPoints);
    console.log('Major points:', majorPoints);
    console.log('Minor points:', minorPoints);
    console.log('Sample size for minor:', newSampleSize);
    console.log('AQL data for this sample size:', aqlData[newSampleSize]);
    console.log('========================');
    
    const newAqlTable = {
      critical: { aql: 0, acceptance: criticalPoints.acceptance, rejection: criticalPoints.rejection },
      major: { aql: 2.5, acceptance: majorPoints.acceptance, rejection: majorPoints.rejection },
      minor: { aql: 4.0, acceptance: minorPoints.acceptance, rejection: minorPoints.rejection }
    };
    
    console.log('Final AQL table:', newAqlTable);
    updateAQLTable(newAqlTable);
    
    onUpdate({ 
      ...data,
      lotSize: lotSizeNum, 
      sampleSize: newSampleSize,
      inspectionLevel: level
    });
  };

  const handleLotSizeChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setLotSize(value);
    
    if (numValue > 0) {
      calculateAndUpdateAQL(numValue, inspectionLevel);
    } else {
      setSampleSize(0);
      const defaultAqlTable = {
        critical: { aql: 0, acceptance: 0, rejection: 1 },
        major: { aql: 2.5, acceptance: 0, rejection: 1 },
        minor: { aql: 4.0, acceptance: 0, rejection: 1 }
      };
      setAqlTable(defaultAqlTable);
      onUpdate({ 
        ...data,
        lotSize: 0, 
        sampleSize: 0,
        inspectionLevel: data.inspectionLevel || 'II',
        aqlTable: defaultAqlTable
      });
    }
  };

  const handleInspectionLevelChange = (level: string) => {
    setInspectionLevel(level);
    
    if (parseInt(lotSize) > 0) {
      calculateAndUpdateAQL(parseInt(lotSize), level);
    } else {
      onUpdate({ ...data, inspectionLevel: level });
    }
  };

  const canProceed = parseInt(lotSize) > 0 && sampleSize > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Configuração de Amostragem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tamanho do Lote */}
          <div className="space-y-2">
            <Label htmlFor="lotSize">Tamanho do Lote (NF)</Label>
            <Input
              id="lotSize"
              type="number"
              placeholder="Ex: 1000"
              value={lotSize}
              onChange={(e) => handleLotSizeChange(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {/* Nível de Inspeção */}
          <div className="space-y-2">
            <Label htmlFor="inspectionLevel">Nível de Inspeção</Label>
            <Select value={inspectionLevel} onValueChange={handleInspectionLevelChange}>
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="I">Nível I - Menos rigoroso</SelectItem>
                <SelectItem value="II">Nível II - Padrão</SelectItem>
                <SelectItem value="III">Nível III - Mais rigoroso</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">
              {getInspectionLevelDescription(inspectionLevel)}
            </p>
          </div>

          {/* Tamanho da Amostra */}
          {sampleSize > 0 && (
            <div className="space-y-2">
              <Label>Tamanho da Amostra</Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {sampleSize} unidades
                </Badge>
                <Info className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Baseado no tamanho do lote e nível de inspeção
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela AQL */}
      {sampleSize > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Tabela de Aceitação por Qualidade (AQL)
            </CardTitle>
            <p className="text-sm text-gray-600">
              Valores de aceitação e rejeição baseados na NBR 5426 - Nível {inspectionLevel}
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Tipo de Defeito</th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-semibold">AQL (%)</th>
                    <th className="border border-gray-200 px-4 py-2 text-center font-semibold">Aceitar</th>
                    <th className="border border-gray-200 px-4 py-2 text-center font-semibold">Rejeitar</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Crítico
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <span className="text-sm font-medium text-gray-900">0</span>
                      <Badge variant="secondary" className="ml-2">Fixo</Badge>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {aqlTable.critical.acceptance}
                      </Badge>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        {aqlTable.critical.rejection}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-orange-500" />
                        Maior
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <span className="text-sm font-medium text-gray-900">2.5</span>
                      <Badge variant="secondary" className="ml-2">Padrão</Badge>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {aqlTable.major.acceptance}
                      </Badge>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        {aqlTable.major.rejection}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-yellow-500" />
                        Menor
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <span className="text-sm font-medium text-gray-900">4.0</span>
                      <Badge variant="secondary" className="ml-2">Padrão</Badge>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {aqlTable.minor.acceptance}
                      </Badge>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        {aqlTable.minor.rejection}
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Como interpretar os resultados:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Aceitar:</strong> Número máximo de defeitos aceitáveis na amostra</li>
                <li>• <strong>Rejeitar:</strong> Número mínimo de defeitos para rejeitar o lote</li>
                <li>• <strong>Crítico:</strong> AQL sempre 0% - Zero defeitos aceitos</li>
                <li>• Se encontrar defeitos entre "Aceitar" e "Rejeitar", inspecionar amostra adicional</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão Próximo */}
      <div className="flex justify-end">
        <Button 
          onClick={onNext} 
          disabled={!canProceed}
          className="px-6"
        >
          Próximo Passo
          <CheckCircle className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

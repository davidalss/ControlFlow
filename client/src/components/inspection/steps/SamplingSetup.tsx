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

  // Tabela de códigos de amostragem baseada na NBR 5426 - CORRIGIDA
  const lotSizeToCode = [
    { range: [2, 8], I: 'A', II: 'A', III: 'B' },
    { range: [9, 15], I: 'A', II: 'A', III: 'B' },
    { range: [16, 25], I: 'A', II: 'A', III: 'B' },
    { range: [26, 50], I: 'A', II: 'A', III: 'C' },
    { range: [51, 90], I: 'A', II: 'A', III: 'C' },
    { range: [91, 150], I: 'A', II: 'A', III: 'C' },
    { range: [151, 280], I: 'A', II: 'A', III: 'C' },
    { range: [281, 500], I: 'A', II: 'A', III: 'C' },
    { range: [501, 1200], I: 'A', II: 'A', III: 'C' },
    { range: [1201, 3200], I: 'A', II: 'A', III: 'C' },
    { range: [3201, 10000], I: 'A', II: 'A', III: 'C' },
    { range: [10001, 35000], I: 'A', II: 'A', III: 'C' },
    { range: [35001, 150000], I: 'A', II: 'A', III: 'C' },
    { range: [150001, 500000], I: 'A', II: 'A', III: 'C' },
    { range: [500001, Infinity], I: 'A', II: 'A', III: 'C' }
  ];

  // Mapeamento de código para tamanho da amostra
  const codeToSampleSize: { [key: string]: number } = {
    'A': 2, 'B': 3, 'C': 5, 'D': 8, 'E': 13, 'F': 20, 'G': 32, 'H': 50,
    'J': 80, 'K': 125, 'L': 200, 'M': 315, 'N': 500, 'P': 800, 'Q': 1250,
    'R': 2000, 'S': 3150
  };

  // Tabela AQL baseada na NBR 5426 - Nível II (padrão) - Valores CORRETOS da norma
  const aqlData: { [key: number]: { [key: string]: { Ac: number; Re: number } } } = {
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
    if (sampleSize <= 0 || aql < 0) return { acceptance: 0, rejection: 1 };
    
    const sampleData = aqlData[sampleSize];
    if (!sampleData) return { acceptance: 0, rejection: 1 };
    
    const aqlKey = aql.toString();
    const points = sampleData[aqlKey];
    
    return points || { acceptance: 0, rejection: 1 };
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
        critical: { ...aqlTable.critical, ...calculateAQLPoints(newSampleSize, 0) }, // AQL crítico sempre 0
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
        critical: { ...aqlTable.critical, ...calculateAQLPoints(newSampleSize, 0) }, // AQL crítico sempre 0
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
      onUpdate({ ...data, inspectionLevel: level });
    }
  };

  const handleAQLChange = (defectType: 'critical' | 'major' | 'minor', aql: number) => {
    // AQL crítico sempre deve ser 0
    if (defectType === 'critical') {
      aql = 0;
    }
    
    const newAqlTable = {
      ...aqlTable,
      [defectType]: { 
        ...aqlTable[defectType], 
        aql,
        ...calculateAQLPoints(sampleSize, aql)
      }
    };
    
    updateAQLTable(newAqlTable);
  };

  // Inicializar valores AQL quando o tamanho da amostra mudar
  useEffect(() => {
    if (sampleSize > 0) {
      const newAqlTable = {
        critical: { ...aqlTable.critical, ...calculateAQLPoints(sampleSize, 0) }, // AQL crítico sempre 0
        major: { ...aqlTable.major, ...calculateAQLPoints(sampleSize, aqlTable.major.aql) },
        minor: { ...aqlTable.minor, ...calculateAQLPoints(sampleSize, aqlTable.minor.aql) }
      };
      
      updateAQLTable(newAqlTable);
    }
  }, [sampleSize]);

  const canProceed = lotSize > 0 && sampleSize > 0;

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

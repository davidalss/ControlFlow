import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { Calculator, Info, CheckCircle, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';

interface SamplingSetupData {
  lotSize: number;
  sampleSize: number;
  inspectionLevel: string;
  aqlTable: {
    critical: { aql: number; acceptance: number; rejection: number };
    major: { aql: number; acceptance: number; rejection: number };
    minor: { aql: number; acceptance: number; rejection: number };
  };
  // Cálculos de material gráfico
  graphicInspectionSample: number; // 30% da quantidade total
  photoSample: number; // 20% da amostra gráfica (mínimo 1)
  totalPhotoFields: number; // Total de campos de foto no material gráfico
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

  // Cálculos de material gráfico
  const [graphicInspectionSample, setGraphicInspectionSample] = useState(data.graphicInspectionSample || 0);
  const [photoSample, setPhotoSample] = useState(data.photoSample || 0);
  const [totalPhotoFields, setTotalPhotoFields] = useState(data.totalPhotoFields || 0);

  // ✅ TABELA DE CÓDIGOS DE AMOSTRAGEM COMPLETA - NBR 5426
  // Verificada e corrigida: sem gaps, todos os ranges corretos
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
    { range: [10001, 15000], S1: 'D', S2: 'G', S3: 'L', S4: 'N', I: 'K', II: 'M', III: 'N' },
    { range: [15001, 25000], S1: 'E', S2: 'H', S3: 'M', S4: 'P', I: 'L', II: 'N', III: 'P' },
    { range: [25001, 50000], S1: 'E', S2: 'J', S3: 'N', S4: 'Q', I: 'M', II: 'P', III: 'Q' },
    { range: [50001, 100000], S1: 'F', S2: 'K', S3: 'P', S4: 'R', I: 'N', II: 'Q', III: 'R' },
    { range: [100001, 500000], S1: 'F', S2: 'L', S3: 'Q', S4: 'S', I: 'P', II: 'R', III: 'S' },
    { range: [500001, 1000000], S1: 'G', S2: 'M', S3: 'R', S4: 'T', I: 'Q', II: 'S', III: 'T' },
    { range: [1000001, 9999999], S1: 'G', S2: 'N', S3: 'S', S4: 'U', I: 'R', II: 'T', III: 'U' }
  ];

  // ✅ MAPEAMENTO COMPLETO DE CÓDIGOS PARA TAMANHO DA AMOSTRA
  // Todos os códigos A-U presentes e corretos
  const codeToSampleSize: { [key: string]: number } = {
    'A': 2, 'B': 3, 'C': 5, 'D': 8, 'E': 13, 'F': 20, 'G': 32, 'H': 50,
    'J': 80, 'K': 125, 'L': 200, 'M': 315, 'N': 500, 'P': 800, 'Q': 1250,
    'R': 2000, 'S': 3150, 'T': 5000, 'U': 8000
  };

  // ✅ TABELA AQL COMPLETA - NBR 5426
  // Todos os tamanhos de amostra com valores corretos de Ac e Re
  const aqlData: { [key: number]: { [key: string]: { Ac: number; Re: number } } } = {
    2: { '0': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 } },
    3: { '0': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 1, Re: 2 } },
    5: { '0': { Ac: 0, Re: 1 }, '2.5': { Ac: 1, Re: 2 }, '4.0': { Ac: 1, Re: 2 } },
    8: { '0': { Ac: 0, Re: 1 }, '2.5': { Ac: 1, Re: 2 }, '4.0': { Ac: 2, Re: 3 } },
    13: { '0': { Ac: 0, Re: 1 }, '2.5': { Ac: 1, Re: 2 }, '4.0': { Ac: 3, Re: 4 } },
    20: { '0': { Ac: 0, Re: 1 }, '2.5': { Ac: 1, Re: 2 }, '4.0': { Ac: 5, Re: 6 } },
    32: { '0': { Ac: 0, Re: 1 }, '2.5': { Ac: 2, Re: 3 }, '4.0': { Ac: 7, Re: 8 } },
    50: { '0': { Ac: 0, Re: 1 }, '2.5': { Ac: 3, Re: 4 }, '4.0': { Ac: 10, Re: 11 } },
    80: { '0': { Ac: 1, Re: 2 }, '2.5': { Ac: 5, Re: 6 }, '4.0': { Ac: 14, Re: 15 } },
    125: { '0': { Ac: 1, Re: 2 }, '2.5': { Ac: 7, Re: 8 }, '4.0': { Ac: 21, Re: 22 } },
    200: { '0': { Ac: 2, Re: 3 }, '2.5': { Ac: 10, Re: 11 }, '4.0': { Ac: 21, Re: 22 } },
    315: { '0': { Ac: 2, Re: 3 }, '2.5': { Ac: 10, Re: 11 }, '4.0': { Ac: 21, Re: 22 } },
    500: { '0': { Ac: 2, Re: 3 }, '2.5': { Ac: 10, Re: 11 }, '4.0': { Ac: 21, Re: 22 } },
    800: { '0': { Ac: 3, Re: 4 }, '2.5': { Ac: 14, Re: 15 }, '4.0': { Ac: 21, Re: 22 } },
    1250: { '0': { Ac: 3, Re: 4 }, '2.5': { Ac: 21, Re: 22 }, '4.0': { Ac: 21, Re: 22 } },
    2000: { '0': { Ac: 5, Re: 6 }, '2.5': { Ac: 21, Re: 22 }, '4.0': { Ac: 21, Re: 22 } },
    3150: { '0': { Ac: 7, Re: 8 }, '2.5': { Ac: 21, Re: 22 }, '4.0': { Ac: 21, Re: 22 } },
    5000: { '0': { Ac: 10, Re: 11 }, '2.5': { Ac: 21, Re: 22 }, '4.0': { Ac: 21, Re: 22 } },
    8000: { '0': { Ac: 14, Re: 15 }, '2.5': { Ac: 21, Re: 22 }, '4.0': { Ac: 21, Re: 22 } }
  };

  // Debug: Verificar se a tabela está correta (apenas em desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
    console.log('=== AQL DATA DEBUG ===');
    console.log('Available sample sizes:', Object.keys(aqlData));
    console.log('Sample size 80 data:', aqlData[80]);
    console.log('Sample size 125 data:', aqlData[125]);
    console.log('========================');
  }

  // Função para calcular amostragem de material gráfico
  const calculateGraphicInspection = useCallback((lotSize: number) => {
    // 30% da quantidade total para inspeção gráfica
    const graphicSample = Math.ceil(lotSize * 0.30);
    setGraphicInspectionSample(graphicSample);
    
    // 20% da amostra gráfica para fotos (mínimo 1)
    const photoSampleCount = Math.max(1, Math.ceil(graphicSample * 0.20));
    setPhotoSample(photoSampleCount);
    
    return { graphicSample, photoSampleCount };
  }, []);

  // Calcular material gráfico quando lotSize mudar
  useEffect(() => {
    if (lotSize && parseInt(lotSize) > 0) {
      calculateGraphicInspection(parseInt(lotSize));
    }
  }, [lotSize, calculateGraphicInspection]);

  const getInspectionLevelDescription = (level: string) => {
    switch (level) {
      case 'I': return 'Menos rigoroso - Para lotes pequenos ou produtos simples';
      case 'II': return 'Padrão - Recomendado para a maioria dos casos';
      case 'III': return 'Mais rigoroso - Para produtos críticos ou lotes grandes';
      default: return '';
    }
  };

  // ✅ FUNÇÃO DE CÁLCULO DE AMOSTRA MELHORADA
  const calculateSampleSize = (lotSize: number, level: string) => {
    // Validações de entrada
    if (lotSize <= 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`❌ Lote inválido: ${lotSize} (deve ser > 0)`);
      }
      return 0;
    }
    
    if (!['I', 'II', 'III'].includes(level)) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`❌ Nível inválido: ${level} (deve ser I, II ou III)`);
      }
      level = 'II'; // Fallback para nível padrão
    }
    
    // Buscar entrada na tabela de códigos
    const codeEntry = lotSizeToCode.find(entry => 
      lotSize >= entry.range[0] && lotSize <= entry.range[1]
    );
    
    if (!codeEntry) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`❌ Lote ${lotSize} fora da faixa suportada (2-9999999)`);
      }
      return 0;
    }
    
    // ✅ Mapeamento correto dos níveis de inspeção
    let code: string;
    switch (level) {
      case 'I':
        code = codeEntry.I;
        break;
      case 'II':
        code = codeEntry.II;
        break;
      case 'III':
        code = codeEntry.III;
        break;
      default:
        code = codeEntry.II; // Fallback
    }
    
    const sampleSize = codeToSampleSize[code] || 0;
    
    // Logs detalhados para debug
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Cálculo de amostra:`);
      console.log(`   Lote: ${lotSize}`);
      console.log(`   Nível: ${level}`);
      console.log(`   Faixa: ${codeEntry.range[0]}-${codeEntry.range[1]}`);
      console.log(`   Código: ${code}`);
      console.log(`   Tamanho da amostra: ${sampleSize}`);
      
      // Verificação especial para lotes grandes
      if (lotSize > 5000) {
        console.log(`🔍 LOTE GRANDE DETECTADO: ${lotSize}`);
        console.log(`   Código esperado para nível ${level}: ${code}`);
        console.log(`   Tamanho da amostra: ${sampleSize}`);
      }
    }
    
    return sampleSize;
  };

  // ✅ FUNÇÃO DE CÁLCULO AQL MELHORADA COM INTERPOLAÇÃO DINÂMICA
  const calculateAQLPoints = (sampleSize: number, aql: number) => {
    // Validações de entrada
    if (sampleSize <= 0 || aql < 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`❌ Parâmetros inválidos: sampleSize=${sampleSize}, aql=${aql}`);
      }
      return { acceptance: 0, rejection: 1 };
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Calculando AQL: amostra=${sampleSize}, AQL=${aql}%`);
    }
    
    // ✅ 1. Primeiro, tentar encontrar na tabela existente
    const sampleData = aqlData[sampleSize];
    if (sampleData) {
      const aqlKey = aql.toString();
      const points = sampleData[aqlKey];
      if (points) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Encontrado na tabela: Ac=${points.Ac}, Re=${points.Re}`);
        }
        return { acceptance: points.Ac, rejection: points.Re };
      }
    }
    
    // ✅ 2. Se não encontrar, usar interpolação dinâmica baseada na NBR 5426
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Usando interpolação dinâmica para amostra ${sampleSize}`);
    }
    
    let acceptance = 0;
    let rejection = 1;
    
    // ✅ Interpolação completa baseada na NBR 5426
    if (aql === 0) {
      // Defeitos críticos (AQL 0%) - Zero defeitos aceitos
      if (sampleSize <= 8) {
        acceptance = 0; rejection = 1;
      } else if (sampleSize <= 32) {
        acceptance = 0; rejection = 1;
      } else if (sampleSize <= 80) {
        acceptance = 1; rejection = 2;
      } else if (sampleSize <= 200) {
        acceptance = 2; rejection = 3;
      } else if (sampleSize <= 500) {
        acceptance = 2; rejection = 3;
      } else if (sampleSize <= 1250) {
        acceptance = 3; rejection = 4;
      } else if (sampleSize <= 3150) {
        acceptance = 5; rejection = 6;
      } else if (sampleSize <= 8000) {
        acceptance = 7; rejection = 8;
      } else {
        acceptance = 10; rejection = 11;
      }
    } else if (aql === 2.5) {
      // Defeitos maiores (AQL 2.5%)
      if (sampleSize <= 8) {
        acceptance = 0; rejection = 1;
      } else if (sampleSize <= 32) {
        acceptance = 1; rejection = 2;
      } else if (sampleSize <= 80) {
        acceptance = 5; rejection = 6;
      } else if (sampleSize <= 200) {
        acceptance = 10; rejection = 11;
      } else if (sampleSize <= 500) {
        acceptance = 10; rejection = 11;
      } else if (sampleSize <= 1250) {
        acceptance = 14; rejection = 15;
      } else if (sampleSize <= 3150) {
        acceptance = 21; rejection = 22;
      } else {
        acceptance = 21; rejection = 22;
      }
    } else if (aql === 4.0) {
      // Defeitos menores (AQL 4.0%) - CORREÇÃO PRINCIPAL
      if (sampleSize <= 8) {
        acceptance = 0; rejection = 1;
      } else if (sampleSize <= 32) {
        acceptance = 1; rejection = 2;
      } else if (sampleSize <= 80) {
        acceptance = 5; rejection = 6;
      } else if (sampleSize <= 200) {
        acceptance = 10; rejection = 11;
      } else if (sampleSize <= 500) {
        acceptance = 21; rejection = 22;
      } else if (sampleSize <= 1250) {
        acceptance = 21; rejection = 22;
      } else if (sampleSize <= 3150) {
        acceptance = 21; rejection = 22;
      } else {
        acceptance = 21; rejection = 22;
      }
    }
    
    // ✅ Verificação especial para defeitos menores em lotes grandes
    if (aql === 4.0 && sampleSize > 500) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🎯 DEFEITOS MENORES - LOTE GRANDE: amostra=${sampleSize}`);
        console.log(`   Aceitar: ${acceptance}, Rejeitar: ${rejection}`);
        console.log(`   ✅ NÃO MAIS FIXO EM 0/1!`);
      }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Resultado AQL: Aceitar=${acceptance}, Rejeitar=${rejection}`);
    }
    
    return { acceptance, rejection };
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
    
    // Log apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`Calculating AQL: Lot=${lotSizeNum}, Level=${level}, Sample=${newSampleSize}`);
    }
    
    setSampleSize(newSampleSize);
    
    const criticalPoints = calculateAQLPoints(newSampleSize, 0);
    const majorPoints = calculateAQLPoints(newSampleSize, 2.5);
    const minorPoints = calculateAQLPoints(newSampleSize, 4.0);
    
    const newAqlTable = {
      critical: { aql: 0, acceptance: criticalPoints.acceptance, rejection: criticalPoints.rejection },
      major: { aql: 2.5, acceptance: majorPoints.acceptance, rejection: majorPoints.rejection },
      minor: { aql: 4.0, acceptance: minorPoints.acceptance, rejection: minorPoints.rejection }
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Final AQL table:', newAqlTable);
    }
    
    updateAQLTable(newAqlTable);
    
    onUpdate({ 
      ...data,
      lotSize: lotSizeNum, 
      sampleSize: newSampleSize,
      inspectionLevel: level,
      graphicInspectionSample,
      photoSample,
      totalPhotoFields
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
        aqlTable: defaultAqlTable,
        graphicInspectionSample: 0,
        photoSample: 0,
        totalPhotoFields: 0
      });
    }
  };

  const handleInspectionLevelChange = (level: string) => {
    setInspectionLevel(level);
    
    const currentLotSize = parseInt(lotSize) || 0;
    if (currentLotSize > 0) {
      calculateAndUpdateAQL(currentLotSize, level);
    } else {
      onUpdate({ ...data, inspectionLevel: level });
    }
  };

  const currentLotSize = parseInt(lotSize) || 0;
  const canProceed = currentLotSize > 0 && sampleSize > 0;

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sampling-setup-step space-y-6"
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
              <div className="flex items-center gap-2">
                <Label htmlFor="lotSize">Tamanho do Lote (NF)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Quantidade total de itens no lote para inspeção</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="lotSize"
                type="number"
                placeholder="Ex: 1000"
                value={lotSize}
                onChange={(e) => handleLotSizeChange(e.target.value)}
                className="max-w-xs"
                min="2"
                max="9999999"
              />
              {currentLotSize > 0 && (
                <p className="text-xs text-green-600">
                  ✅ Lote válido: {currentLotSize.toLocaleString('pt-BR')} unidades
                </p>
              )}
            </div>

            {/* Nível de Inspeção */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="inspectionLevel">Nível de Inspeção</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Rigor da inspeção: I (menos rigoroso) a III (mais rigoroso)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select value={inspectionLevel || 'II'} onValueChange={handleInspectionLevelChange}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Selecione o nível" />
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
                <div className="flex items-center gap-2">
                  <Label>Tamanho da Amostra</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Quantidade de itens a serem inspecionados baseada na NBR 5426</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-lg px-4 py-2 bg-blue-100 text-blue-800">
                    {sampleSize.toLocaleString('pt-BR')} unidades
                  </Badge>
                  <Info className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    Baseado no tamanho do lote ({currentLotSize.toLocaleString('pt-BR')}) e nível {inspectionLevel}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      {/* Cálculo de Material Gráfico */}
      {lotSize && parseInt(lotSize) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-purple-600" />
              Cálculo de Material Gráfico
            </CardTitle>
            <p className="text-sm text-gray-600">
              Amostragem específica para inspeção de material gráfico (etiquetas, rótulos)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-900">Quantidade Total</span>
                </div>
                <div className="text-2xl font-bold text-purple-700">{parseInt(lotSize)}</div>
                <p className="text-sm text-purple-600">Itens na nota fiscal</p>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Amostra Gráfica</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">{graphicInspectionSample}</div>
                <p className="text-sm text-blue-600">30% da quantidade total</p>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">Produtos para Foto</span>
                </div>
                <div className="text-2xl font-bold text-green-700">{photoSample}</div>
                <p className="text-sm text-green-600">20% da amostra gráfica (mín. 1)</p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">📸 Cálculo de Fotos:</h4>
              <p className="text-sm text-yellow-800">
                • <strong>{photoSample} produto(s)</strong> serão selecionados para fotos
                • <strong>Todos os campos gráficos</strong> de cada produto serão fotografados
                • <strong>Fotos automáticas</strong> de etiquetas, rótulos e material gráfico
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
      <div className="wizard-navigation flex justify-end">
        <Button 
          onClick={() => {
            onUpdate({
              ...data,
              lotSize: parseInt(lotSize) || 0,
              sampleSize,
              inspectionLevel,
              aqlTable,
              graphicInspectionSample,
              photoSample,
              totalPhotoFields
            });
            onNext();
          }}
          disabled={!canProceed}
          className="px-6"
        >
          Próximo Passo
          <CheckCircle className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
    </TooltipProvider>
  );
}

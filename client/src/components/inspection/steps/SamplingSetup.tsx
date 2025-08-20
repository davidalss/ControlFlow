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
  graphicInspectionSample: number; // 30% da amostra
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
  const codeToSampleSize: { [key: string]: number } = {
    'A': 2, 'B': 3, 'C': 5, 'D': 8, 'E': 13, 'F': 20, 'G': 32, 'H': 50,
    'J': 80, 'K': 125, 'L': 200, 'M': 315, 'N': 500, 'P': 800, 'Q': 1250,
    'R': 2000, 'S': 3150, 'T': 5000, 'U': 8000
  };

  // ✅ TABELA AQL COMPLETA - NBR 5426
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

  // Função para encontrar o código de amostragem baseado no tamanho do lote e nível
  const getSamplingCode = useCallback((lotSize: number, level: string): string => {
    const entry = lotSizeToCode.find(item => 
      lotSize >= item.range[0] && lotSize <= item.range[1]
    );
    return entry ? entry[level as keyof typeof entry] : 'A';
  }, []);

  // Função para calcular o tamanho da amostra
  const calculateSampleSize = useCallback((lotSize: number, level: string): number => {
    const code = getSamplingCode(lotSize, level);
    return codeToSampleSize[code] || 2;
  }, [getSamplingCode]);

  // Função para calcular os números AQL
  const calculateAQL = useCallback((sampleSize: number) => {
    const sampleData = aqlData[sampleSize];
    if (!sampleData) return aqlTable;

    return {
      critical: {
        aql: 0,
        acceptance: sampleData['0']?.Ac || 0,
        rejection: sampleData['0']?.Re || 1
      },
      major: {
        aql: 2.5,
        acceptance: sampleData['2.5']?.Ac || 0,
        rejection: sampleData['2.5']?.Re || 1
      },
      minor: {
        aql: 4.0,
        acceptance: sampleData['4.0']?.Ac || 0,
        rejection: sampleData['4.0']?.Re || 1
      }
    };
  }, [aqlTable]);

  // Função para calcular amostragem de material gráfico
  const calculateGraphicInspection = useCallback((sampleSize: number) => {
    // 30% da amostra para inspeção gráfica
    const graphicSample = Math.ceil(sampleSize * 0.30);
    setGraphicInspectionSample(graphicSample);
    
    // 20% da amostra gráfica para fotos (mínimo 1)
    const photoSampleCount = Math.max(1, Math.ceil(graphicSample * 0.20));
    setPhotoSample(photoSampleCount);
    
    return { graphicSample, photoSampleCount };
  }, []);

  // Atualizar cálculos quando o tamanho do lote ou nível mudar
  useEffect(() => {
    const currentLotSize = parseInt(lotSize) || 0;
    if (currentLotSize > 0) {
      const newSampleSize = calculateSampleSize(currentLotSize, inspectionLevel);
      const newAqlTable = calculateAQL(newSampleSize);
      
      setSampleSize(newSampleSize);
      setAqlTable(newAqlTable);
      
      // Calcular material gráfico baseado na amostra
      const { graphicSample, photoSampleCount } = calculateGraphicInspection(newSampleSize);
      
      // Atualizar dados do componente pai
      onUpdate({
        ...data,
        lotSize: currentLotSize,
        sampleSize: newSampleSize,
        inspectionLevel,
        aqlTable: newAqlTable,
        graphicInspectionSample: graphicSample,
        photoSample: photoSampleCount,
        totalPhotoFields: photoSampleCount * 3 // 3 campos de foto por produto (mínimo)
      });
    }
  }, [lotSize, inspectionLevel, calculateSampleSize, calculateAQL, calculateGraphicInspection, onUpdate, data]);

  const handleLotSizeChange = (value: string) => {
    setLotSize(value);
  };

  const handleInspectionLevelChange = (level: string) => {
    setInspectionLevel(level);
  };

  const getInspectionLevelDescription = (level: string) => {
    switch (level) {
      case 'I': return 'Menos rigoroso - Para lotes grandes ou inspeção reduzida';
      case 'II': return 'Padrão - Nível normal de inspeção';
      case 'III': return 'Mais rigoroso - Para lotes pequenos ou inspeção intensificada';
      default: return '';
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
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Configuração NQA</h2>
          <p className="text-gray-600 mt-2">Configure o tamanho do lote e nível de inspeção para calcular os números de aceite e rejeição</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Configuração de Amostragem - NBR 5426
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tamanho do Lote */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="lotSize">Tamanho do Lote (NF) *</Label>
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
                    Código: {getSamplingCode(currentLotSize, inspectionLevel)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cálculo de Material Gráfico */}
        {sampleSize > 0 && (
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
                    <span className="font-medium text-purple-900">Amostra Total</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-700">{sampleSize}</div>
                  <p className="text-sm text-purple-600">Itens para inspeção</p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Amostra Gráfica</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-700">{graphicInspectionSample}</div>
                  <p className="text-sm text-blue-600">30% da amostra</p>
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

        {/* Tabela NQA */}
        {sampleSize > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Números de Aceite e Rejeição (NQA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left">Tipo de Defeito</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">AQL (%)</th>
                      <th className="border border-gray-200 px-4 py-2 text-center">Aceitar</th>
                      <th className="border border-gray-200 px-4 py-2 text-center">Rejeitar</th>
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
                        <Badge variant="secondary" className="ml-2">Zero tolerância</Badge>
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

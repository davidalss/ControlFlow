import React, { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AqlCalculatorProps {
  // No props needed for now, as inputs are internal
}

export const AqlCalculatorComponent: React.FC<AqlCalculatorProps> = () => {
  const { toast = () => {} } = useToast(); // Added default empty function for toast to prevent potential errors if useToast is not fully initialized or returns undefined in some contexts.

  useEffect(() => {
    console.log('AqlCalculatorComponent mounted!');
  }, []);

  // Define AQL tables
  const lotSizeToCode = [
    { range: [2, 8], I: 'A', II: 'B', III: 'C' },
    { range: [9, 15], I: 'B', II: 'C', III: 'D' },
    { range: [16, 25], I: 'C', II: 'D', III: 'E' },
    { range: [26, 50], I: 'D', II: 'E', III: 'F' },
    { range: [51, 90], I: 'E', II: 'F', III: 'G' },
    { range: [91, 150], I: 'F', II: 'G', III: 'H' },
    { range: [151, 280], I: 'G', II: 'H', III: 'J' },
    { range: [281, 500], I: 'H', II: 'J', III: 'K' },    { range: [501, 1200], I: 'J', II: 'K', III: 'L' },
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
    2: { '1.0': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 } },
    3: { '1.0': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 } },
    5: { '1.0': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 } },
    8: { '1.0': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 } },
    13: { '1.0': { Ac: 0, Re: 1 }, '2.5': { Ac: 1, Re: 2 }, '4.0': { Ac: 1, Re: 2 } },
    20: { '1.0': { Ac: 0, Re: 1 }, '2.5': { Ac: 1, Re: 2 }, '4.0': { Ac: 2, Re: 3 } },
    32: { '1.0': { Ac: 1, Re: 2 }, '2.5': { Ac: 2, Re: 3 }, '4.0': { Ac: 3, Re: 4 } },
    50: { '1.0': { Ac: 1, Re: 2 }, '2.5': { Ac: 3, Re: 4 }, '4.0': { Ac: 5, Re: 6 } },
    80: { '1.0': { Ac: 2, Re: 3 }, '2.5': { Ac: 5, Re: 6 }, '4.0': { Ac: 7, Re: 8 } },
    125: { '1.0': { Ac: 3, Re: 4 }, '2.5': { Ac: 7, Re: 8 }, '4.0': { Ac: 10, Re: 11 } },
    200: { '1.0': { Ac: 5, Re: 6 }, '2.5': { Ac: 10, Re: 11 }, '4.0': { Ac: 14, Re: 15 } },
    315: { '1.0': { Ac: 7, Re: 8 }, '2.5': { Ac: 14, Re: 15 }, '4.0': { Ac: 21, Re: 22 } },
    500: { '1.0': { Ac: 10, Re: 11 }, '2.5': { Ac: 21, Re: 22 }, '4.0': { Ac: 21, Re: 22 } },
    800: { '1.0': { Ac: 14, Re: 15 }, '2.5': { Ac: 21, Re: 22 }, '4.0': { Ac: 21, Re: 22 } },
    1250: { '1.0': { Ac: 21, Re: 22 }, '2.5': { Ac: 21, Re: 22 }, '4.0': { Ac: 21, Re: 22 } },
    2000: { '1.0': { Ac: 21, Re: 22 }, '2.5': { Ac: 21, Re: 22 }, '4.0': { Ac: 21, Re: 22 } },
    3150: { '1.0': { Ac: 21, Re: 22 }, '2.5': { Ac: 21, Re: 22 }, '4.0': { Ac: 21, Re: 22 } }
  };

  const [lotSize, setLotSize] = useState<number>(100);
  const [inspectionLevel, setInspectionLevel] = useState<string>('II');
  const [calculatedSampleSize, setCalculatedSampleSize] = useState<number>(0);
  const [aqlResults, setAqlResults] = useState<any>(null);
  const [actualInspectionQuantity, setActualInspectionQuantity] = useState<number>(0);
  const [inspectionStatusMessage, setInspectionStatusMessage] = useState<string>('');
  const [inspectionStatusClass, setInspectionStatusClass] = useState<string>('');

  const calculateAQL = useCallback(() => {
    if (isNaN(lotSize) || lotSize <= 0) {
      toast({
        title: "Erro de Entrada",
        description: "Por favor, insira um Tamanho do Lote válido (número inteiro positivo).",
        variant: "destructive",
      });
      setCalculatedSampleSize(0);
      setAqlResults(null);
      return;
    }

    let sampleSizeCode = '';
    for (const entry of lotSizeToCode) {
      if (lotSize >= entry.range[0] && lotSize <= entry.range[1]) {
        sampleSizeCode = (entry as any)[inspectionLevel];
        break;
      }
    }

    if (!sampleSizeCode) {
      setAqlResults(<p className="text-red-500">Não foi possível determinar o Código do Tamanho da Amostra para o Tamanho do Lote e Nível de Inspeção fornecidos.</p>);
      setCalculatedSampleSize(0);
      return;
    }

    const sampleSize = (codeToSampleSize as any)[sampleSizeCode];
    setCalculatedSampleSize(sampleSize);

    if (!sampleSize) {
      setAqlResults(<p className="text-red-500">Não foi possível determinar o Tamanho da Amostra para o Código de Tamanho da Amostra: {sampleSizeCode}</p>);
      return;
    }

    const aql1_0 = (aqlData as any)[sampleSize] ? (aqlData as any)[sampleSize]['1.0'] : { Ac: '-', Re: '-' };
    const aql2_5 = (aqlData as any)[sampleSize] ? (aqlData as any)[sampleSize]['2.5'] : { Ac: '-', Re: '-' };
    const aql4_0 = (aqlData as any)[sampleSize] ? (aqlData as any)[sampleSize]['4.0'] : { Ac: '-', Re: '-' };

    setAqlResults({
      sampleSize,
      aql1_0,
      aql2_5,
      aql4_0,
    });
  }, [lotSize, inspectionLevel, toast]);

  const updateInspectionStatus = useCallback(() => {
    if (calculatedSampleSize === 0) {
      setInspectionStatusMessage('Calcule o AQL primeiro.');
      setInspectionStatusClass('');
      return;
    }

    if (isNaN(actualInspectionQuantity) || actualInspectionQuantity < 0) {
      setInspectionStatusMessage('Por favor, insira uma quantidade válida.');
      setInspectionStatusClass('');
      return;
    }

    if (actualInspectionQuantity === calculatedSampleSize) {
      setInspectionStatusClass('bg-green-100 text-green-800');
      setInspectionStatusMessage(`Quantidade inspecionada (${actualInspectionQuantity}) é igual ao tamanho da amostra (${calculatedSampleSize}). OK!`);
    } else if (actualInspectionQuantity < calculatedSampleSize) {
      setInspectionStatusClass('bg-red-100 text-red-800');
      setInspectionStatusMessage(`Quantidade inspecionada (${actualInspectionQuantity}) é MENOR que o tamanho da amostra (${calculatedSampleSize}).`);
      if (window.confirm(`A quantidade inspecionada (${actualInspectionQuantity}) é menor que o tamanho da amostra (${calculatedSampleSize}). Tem certeza que deseja continuar?`)) {
        setInspectionStatusMessage(prev => prev + ' Usuário confirmou continuar.');
      } else {
        setActualInspectionQuantity(calculatedSampleSize);
      }
    } else { // actualInspectionQuantity > calculatedSampleSize
      setInspectionStatusClass('bg-green-100 text-green-800');
      setInspectionStatusMessage(`Quantidade inspecionada (${actualInspectionQuantity}) é MAIOR que o tamanho da amostra (${calculatedSampleSize}). OK!`);
    }
  }, [actualInspectionQuantity, calculatedSampleSize]);

  // Recalculate AQL when lotSize or inspectionLevel changes
  useEffect(() => {
    calculateAQL();
  }, [lotSize, inspectionLevel, calculateAQL]);

  // Update inspection status when actualInspectionQuantity or calculatedSampleSize changes
  useEffect(() => {
    updateInspectionStatus();
  }, [actualInspectionQuantity, calculatedSampleSize, updateInspectionStatus]);

  return (
    <div className="p-6 border rounded-lg shadow-sm bg-white mb-6">
      <h3 className="text-xl font-semibold text-neutral-800 mb-4">Cálculo de NQA (AQL)</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="lotSize">Tamanho do Lote:</Label>
          <Input
            id="lotSize"
            type="number"
            min="1"
            value={lotSize}
            onChange={(e) => setLotSize(parseInt(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="inspectionLevel">Nível de Inspeção:</Label>
          <Select
            value={inspectionLevel}
            onValueChange={(value) => setInspectionLevel(value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione o nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Selecione o nível</SelectItem> {/* Added this line */}
              <SelectItem value="I">Nível I</SelectItem>
              <SelectItem value="II">Nível II</SelectItem>
              <SelectItem value="III">Nível III</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {aqlResults && typeof aqlResults === 'object' && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-neutral-700 mb-3">Resultados AQL:</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-auto">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="border px-4 py-2 text-left">Tamanho da Amostra</th>
                  <th className="border px-4 py-2 text-center">AQL 1,0% (Críticos)</th>
                  <th className="border px-4 py-2 text-center">AQL 2,5% (Maiores)</th>
                  <th className="border px-4 py-2 text-center">AQL 4,0% (Menores)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2">{aqlResults.sampleSize}</td>
                  <td className="border px-4 py-2 text-center">Ac: {aqlResults.aql1_0.Ac} / Re: {aqlResults.aql1_0.Re}</td>
                  <td className="border px-4 py-2 text-center">Ac: {aqlResults.aql2_5.Ac} / Re: {aqlResults.aql2_5.Re}</td>
                  <td className="border px-4 py-2 text-center">Ac: {aqlResults.aql4_0.Ac} / Re: {aqlResults.aql4_0.Re}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      {typeof aqlResults === 'object' && !aqlResults && (
        <div className="mb-6">
          {aqlResults}
        </div>
      )}

      <div className="mb-6">
        <h4 className="text-lg font-medium text-neutral-700 mb-3">Verificação da Inspeção:</h4>
        <div>
          <Label htmlFor="actualInspectionQuantity">Quantidade de Produtos Inspecionados:</Label>
          <Input
            id="actualInspectionQuantity"
            type="number"
            min="0"
            value={actualInspectionQuantity}
            onChange={(e) => setActualInspectionQuantity(parseInt(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
        <div className={`mt-3 p-3 rounded-md text-sm font-medium ${inspectionStatusClass}`}>
          {inspectionStatusMessage}
        </div>
      </div>

      <div className="p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-md">
        <h4 className="font-semibold mb-2">Legenda AQL:</h4>
        <p><strong>AQL 1,0%:</strong> Defeitos críticos (afetam segurança, função ou conformidade regulatória)</p>
        <p><strong>AQL 2,5%:</strong> Defeitos maiores (afetam funcionalidade ou aparência significativa)</p>
        <p><strong>AQL 4,0%:</strong> Defeitos menores (afetam aparência, mas não funcionalidade)</p>
        <p><strong>Ac = Aceitável | Re = Rejeitável</strong></p>
      </div>
    </div>
  );
};
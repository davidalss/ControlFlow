// Teste específico para lote de 10.000 com nível III
console.log('=== TESTE LOTE 10.000 NÍVEL III ===');

// Tabela de códigos de amostragem
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
const codeToSampleSize = {
  'A': 2, 'B': 3, 'C': 5, 'D': 8, 'E': 13, 'F': 20, 'G': 32, 'H': 50,
  'J': 80, 'K': 125, 'L': 200, 'M': 315, 'N': 500
};

// Tabela AQL corrigida
const aqlData = {
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
  500: { '0': { Ac: 2, Re: 3 }, '2.5': { Ac: 10, Re: 11 }, '4.0': { Ac: 21, Re: 22 } }
};

function calculateSampleSize(lotSize, level) {
  if (lotSize <= 0) return 0;
  
  const codeEntry = lotSizeToCode.find(entry => 
    lotSize >= entry.range[0] && lotSize <= entry.range[1]
  );
  
  if (!codeEntry) return 0;
  
  // CORREÇÃO: Mapeamento correto dos níveis
  let code;
  if (level === 'I') {
    code = codeEntry.I; // ✅ CORRIGIDO: Nível I usa código I
  } else if (level === 'II') {
    code = codeEntry.II; // ✅ CORRETO: Nível II usa código II
  } else if (level === 'III') {
    code = codeEntry.III; // ✅ CORRETO: Nível III usa código III
  } else {
    code = codeEntry.II; // Padrão
  }
  
  console.log(`Lote: ${lotSize}, Nível: ${level}, Código: ${code}`);
  return codeToSampleSize[code] || 0;
}

function calculateAQLPoints(sampleSize, aql) {
  if (sampleSize <= 0 || aql < 0) return { acceptance: 0, rejection: 1 };
  
  console.log(`Calculando AQL para amostra: ${sampleSize}, AQL: ${aql}`);
  
  const sampleData = aqlData[sampleSize];
  if (!sampleData) {
    console.log(`Amostra ${sampleSize} não encontrada na tabela AQL`);
    // Procurar o tamanho mais próximo
    const availableSizes = Object.keys(aqlData).map(Number).sort((a, b) => a - b);
    const closestSize = availableSizes.reduce((prev, curr) => 
      Math.abs(curr - sampleSize) < Math.abs(prev - sampleSize) ? curr : prev
    );
    console.log(`Usando amostra mais próxima: ${closestSize}`);
    const closestData = aqlData[closestSize];
    const aqlKey = aql.toString();
    const points = closestData[aqlKey];
    if (points) {
      console.log(`Encontrados pontos AQL para amostra ${closestSize}, AQL ${aqlKey}:`, points);
      return { acceptance: points.Ac, rejection: points.Re };
    }
    return { acceptance: 0, rejection: 1 };
  }
  
  const aqlKey = aql.toString();
  const points = sampleData[aqlKey];
  
  if (!points) {
    console.log(`AQL ${aqlKey} não encontrado para amostra ${sampleSize}`);
    return { acceptance: 0, rejection: 1 };
  }
  
  console.log(`Encontrados pontos AQL para amostra ${sampleSize}, AQL ${aqlKey}:`, points);
  return { acceptance: points.Ac, rejection: points.Re };
}

// Teste específico
const lotSize = 10000;
const level = 'III';

console.log(`\n=== TESTE: Lote ${lotSize}, Nível ${level} ===`);

const sampleSize = calculateSampleSize(lotSize, level);
console.log(`Tamanho da amostra calculado: ${sampleSize}`);

const criticalPoints = calculateAQLPoints(sampleSize, 0);
const majorPoints = calculateAQLPoints(sampleSize, 2.5);
const minorPoints = calculateAQLPoints(sampleSize, 4.0);

console.log('\n=== RESULTADOS ===');
console.log(`Críticos: Aceitar ${criticalPoints.acceptance}, Rejeitar ${criticalPoints.rejection}`);
console.log(`Maiores: Aceitar ${majorPoints.acceptance}, Rejeitar ${majorPoints.rejection}`);
console.log(`Menores: Aceitar ${minorPoints.acceptance}, Rejeitar ${minorPoints.rejection}`);

if (minorPoints.acceptance === 0 && minorPoints.rejection === 1) {
  console.log('\n❌ PROBLEMA: Defeitos menores ainda fixos em 0/1!');
} else {
  console.log('\n✅ CORRETO: Defeitos menores com valores dinâmicos!');
}

console.log('\n=== FIM DO TESTE ===');

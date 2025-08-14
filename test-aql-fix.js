// Teste da correção da tabela AQL
// Verificar se os defeitos menores não estão mais fixos em 1 e 0

// Tabela AQL corrigida baseada na NBR 5426
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

function calculateAQLPoints(sampleSize, aql) {
  if (sampleSize <= 0 || aql < 0) return { acceptance: 0, rejection: 1 };
  
  const sampleData = aqlData[sampleSize];
  if (!sampleData) {
    console.log(`Sample size ${sampleSize} not found in aqlData`);
    return { acceptance: 0, rejection: 1 };
  }
  
  const aqlKey = aql.toString();
  const points = sampleData[aqlKey];
  
  if (!points) {
    console.log(`AQL ${aqlKey} not found for sample size ${sampleSize}`);
    return { acceptance: 0, rejection: 1 };
  }
  
  return { acceptance: points.Ac, rejection: points.Re };
}

// Teste com diferentes tamanhos de amostra
console.log('=== TESTE DA CORREÇÃO AQL ===');
console.log('Verificando se os defeitos menores não estão mais fixos em 1 e 0\n');

const testCases = [
  { lotSize: 100, sampleSize: 20 },
  { lotSize: 500, sampleSize: 50 },
  { lotSize: 1000, sampleSize: 80 },
  { lotSize: 2000, sampleSize: 125 },
  { lotSize: 5000, sampleSize: 200 }
];

testCases.forEach(test => {
  console.log(`Lote: ${test.lotSize}, Amostra: ${test.sampleSize}`);
  
  const criticalPoints = calculateAQLPoints(test.sampleSize, 0);
  const majorPoints = calculateAQLPoints(test.sampleSize, 2.5);
  const minorPoints = calculateAQLPoints(test.sampleSize, 4.0);
  
  console.log(`  Críticos: Aceitar ${criticalPoints.acceptance}, Rejeitar ${criticalPoints.rejection}`);
  console.log(`  Maiores: Aceitar ${majorPoints.acceptance}, Rejeitar ${majorPoints.rejection}`);
  console.log(`  Menores: Aceitar ${minorPoints.acceptance}, Rejeitar ${minorPoints.rejection}`);
  
  // Verificar se os defeitos menores não estão fixos em 1 e 0
  if (minorPoints.acceptance === 0 && minorPoints.rejection === 1) {
    console.log(`  ❌ PROBLEMA: Defeitos menores ainda fixos em 0/1 para amostra ${test.sampleSize}`);
  } else {
    console.log(`  ✅ CORRETO: Defeitos menores com valores dinâmicos para amostra ${test.sampleSize}`);
  }
  console.log('');
});

console.log('=== FIM DO TESTE ===');

const fs = require('fs');
const path = require('path');

// Mapping for Business Units
const businessUnitMapping = {
  "SDA - COOKING & BEAUTY": "KITCHEN_BEAUTY",
  "SDA - MOTORS & COMFORT": "MOTOR_COMFORT",
  "DIY": "DIY",
  "TECH": "TECH",
  "SEM CLASSIFICAÇÃO": "N/A",
  "": "N/A",
};

// Mapping for Categories
const categoryMapping = {
  "ventilador - de teto": "Ar e Climatização",
  "ventilador - de coluna": "Ar e Climatização",
  "ventilador - de mesa": "Ar e Climatização",
  "ventilador - de parede": "Ar e Climatização",
  "aquecedores": "Ar e Climatização",
  "umidificador/ar condicionado": "Ar e Climatização",
  "cozinha": "Cozinha",
  "aspirador - robo": "Robô Aspirador",
  "lavadora - intensivo": "Limpeza",
  "lavadora - semi intensivo": "Limpeza",
  "lavadora - ocasional": "Limpeza",
  "extratora - portátil": "Limpeza",
  "extratora - barril": "Limpeza",
  "extratora - sem fio": "Limpeza",
  "aspirador - vertical": "Limpeza",
  "aspirador - automotivo": "Limpeza",
  "aspirador - portátil": "Limpeza",
  "aspirador - barril": "Limpeza",
  "soluções de limpeza": "Limpeza",
  "ferramentas": "Ferramentas",
  "ferramentas manuais": "Ferramentas",
  "ferramenta - pintura/soprador": "Ferramentas",
  "ferramenta - serra/lixa/desbas": "Ferramentas",
  "ferramenta - paraf/furad/mart": "Ferramentas",
  "ferramenta - solda": "Ferramentas",
  "jardinagem elétrica": "Jardinagem",
  "garden manual - pulverização": "Jardinagem",
  "garden manual - irrigação": "Jardinagem",
  "speaker": "Áudio e Vídeo",
  "headphone": "Áudio e Vídeo",
  "earphone": "Áudio e Vídeo",
  "câmeras": "Áudio e Vídeo",
  "polidoras": "Eletroportáteis",
  "vaporizador": "Vaporizadores",
  "produtos revendidos": "Outros",
};

function sanitizeString(str) {
  return str ? str.trim().replace(/[^\w\s\-\.]/g, '') : '';
}

function parseDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

function parseNumber(numStr) {
  if (!numStr || numStr.trim() === '') return null;
  const num = parseFloat(numStr.replace(',', '.'));
  return isNaN(num) ? null : num;
}

function validateProductData(data) {
  return data.code && data.description && data.code.trim() !== '' && data.description.trim() !== '';
}

async function importProducts() {
  console.log('🚀 Iniciando importação de produtos...');
  
  try {
    const filePath = path.resolve(__dirname, 'dados.csv');
    console.log(`📁 Arquivo: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Arquivo dados.csv não encontrado!');
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');

    const productsToImport = [];
    const uniqueProductCodes = new Set();
    const errors = [];
    const warnings = [];

    console.log(`📊 Total de linhas no arquivo: ${lines.length}`);

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line.split(';');

      // Ensure we have enough columns
      if (columns.length < 17) {
        warnings.push(`Linha ${i + 1}: Colunas insuficientes (${columns.length}/17)`);
        continue;
      }

      const code = sanitizeString(columns[1]); // cd_item
      const description = sanitizeString(columns[4]); // ds_item
      const ean = sanitizeString(columns[8]); // cd_ean
      const familiaComercial = sanitizeString(columns[16]); // Familia_Comercial
      const rawCategory = familiaComercial;
      const category = categoryMapping[rawCategory] || rawCategory;
      const buRaw = sanitizeString(columns[15]); // BU
      const dsVoltagem = sanitizeString(columns[5]); // ds_voltagem
      const familiaGrupos = sanitizeString(columns[6]); // Família (grupos)
      const pesoBruto = sanitizeString(columns[11]); // peso_bruto
      const tipoExclusividade = sanitizeString(columns[13]); // tipo_exclusividade
      const origem = sanitizeString(columns[14]); // Origem
      const dtImplant = parseDate(columns[0]); // dt_implant
      const classificacaoFiscal = sanitizeString(columns[7]); // classificacao_fiscal
      const aliquotaIpi = parseNumber(columns[12]); // aliquota_ipi
      const multiploPedido = parseNumber(columns[10]); // Múltiplo_Pedido

      // Skip if product code is empty or already processed
      if (!code || uniqueProductCodes.has(code)) {
        if (!code) {
          warnings.push(`Linha ${i + 1}: Código do produto vazio`);
        } else {
          warnings.push(`Linha ${i + 1}: Código duplicado: ${code}`);
        }
        continue;
      }

      // Validate required fields
      if (!validateProductData({ code, description })) {
        errors.push(`Linha ${i + 1}: Dados inválidos - código: "${code}", descrição: "${description}"`);
        continue;
      }

      uniqueProductCodes.add(code);

      const businessUnit = businessUnitMapping[buRaw] || "N/A";

      const technicalParameters = {};
      if (dsVoltagem) technicalParameters.voltagem = dsVoltagem;
      if (familiaGrupos) technicalParameters.familia_grupos = familiaGrupos;
      if (pesoBruto) technicalParameters.peso_bruto = pesoBruto;
      if (tipoExclusividade) technicalParameters.tipo_exclusividade = tipoExclusividade;
      if (origem) technicalParameters.origem = origem;
      if (familiaComercial) technicalParameters.familia_comercial = familiaComercial;
      if (classificacaoFiscal) technicalParameters.classificacao_fiscal = classificacaoFiscal;
      if (aliquotaIpi !== null) technicalParameters.aliquota_ipi = aliquotaIpi;
      if (multiploPedido !== null) technicalParameters.multiplo_pedido = multiploPedido;
      if (dtImplant) technicalParameters.dt_implant = dtImplant.toISOString();

      productsToImport.push({
        code,
        description,
        ean: ean || null,
        category,
        businessUnit,
        technicalParameters: Object.keys(technicalParameters).length > 0 ? technicalParameters : null,
      });
    }

    console.log(`✅ Produtos válidos encontrados: ${productsToImport.length}`);
    console.log(`⚠️  Avisos: ${warnings.length}`);
    console.log(`❌ Erros: ${errors.length}`);

    if (warnings.length > 0) {
      console.log('\n⚠️  Avisos:');
      warnings.slice(0, 10).forEach(warning => console.log(`  - ${warning}`));
      if (warnings.length > 10) console.log(`  ... e mais ${warnings.length - 10} avisos`);
    }

    if (errors.length > 0) {
      console.log('\n❌ Erros:');
      errors.slice(0, 10).forEach(error => console.log(`  - ${error}`));
      if (errors.length > 10) console.log(`  ... e mais ${errors.length - 10} erros`);
    }

    // Save to JSON file for manual import
    const outputPath = path.resolve(__dirname, 'products-import.json');
    fs.writeFileSync(outputPath, JSON.stringify(productsToImport, null, 2));
    console.log(`\n💾 Dados salvos em: ${outputPath}`);

    // Show category distribution
    const categoryStats = productsToImport.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📈 Distribuição por categoria:');
    Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`  - ${category}: ${count} produtos`);
      });

    // Show business unit distribution
    const buStats = productsToImport.reduce((acc, product) => {
      acc[product.businessUnit] = (acc[product.businessUnit] || 0) + 1;
      return acc;
    }, {});

    console.log('\n🏢 Distribuição por Business Unit:');
    Object.entries(buStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([bu, count]) => {
        console.log(`  - ${bu}: ${count} produtos`);
      });

    console.log('\n🎉 Processamento concluído!');
    console.log('📝 Para importar no banco, use o arquivo products-import.json gerado.');

  } catch (error) {
    console.error('❌ Erro durante a importação:', error.message);
    process.exit(1);
  }
}

// Run import
importProducts();

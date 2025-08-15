import { db } from './server/db.ts';
import { products } from './shared/schema.ts';

async function insertTestProduct() {
  try {
    const testProduct = {
      code: "MIX001",
      ean: "7891234567893",
      description: "Mixer Profissional - Liquidificador de Imersão 300W",
      category: "Eletrodomésticos",
      businessUnit: "KITCHEN_BEAUTY",
      technicalParameters: JSON.stringify({
        potencia: "300W",
        velocidade: "2 velocidades",
        funcoes: ["Bater", "Triturar", "Emulsionar"],
        dimensoes: "35 x 8 cm",
        peso: "0.8 kg",
        voltagem: "220V",
        garantia: "12 meses",
        material: "Aço inox",
        acessorios: ["Lâmina de aço", "Copo medidor"]
      })
    };

    const result = await db.insert(products).values(testProduct);
    console.log("✅ Produto de teste criado com sucesso!");
    console.log("Produto:", testProduct.description);
    console.log("Código:", testProduct.code);
    console.log("EAN:", testProduct.ean);
    
    return result;
  } catch (error) {
    console.error("❌ Erro ao criar produto:", error);
    throw error;
  }
}

// Executar se chamado diretamente
insertTestProduct()
  .then(() => {
    console.log("✅ Script executado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });

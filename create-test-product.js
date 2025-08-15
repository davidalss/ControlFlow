// Script para criar produto de teste - Air Fryer Barbecue
const testProduct = {
  code: "AFB001",
  ean: "7891234567890",
  description: "Air Fryer Barbecue - Fritadeira Elétrica com Função Churrasco",
  category: "Eletrodomésticos",
  businessUnit: "KITCHEN_BEAUTY",
  technicalParameters: JSON.stringify({
    potencia: "1500W",
    capacidade: "5.5L",
    temperatura: "80-200°C",
    timer: "60 minutos",
    funcoes: ["Fritar", "Assar", "Grelhar", "Churrasco"],
    dimensoes: "35 x 30 x 35 cm",
    peso: "4.2 kg",
    voltagem: "220V",
    garantia: "12 meses"
  })
};

console.log("Produto de teste criado:", testProduct);

// Dados para inserção no banco
const insertQuery = `
INSERT INTO products (code, ean, description, category, business_unit, technical_parameters, created_at)
VALUES (
  '${testProduct.code}',
  '${testProduct.ean}',
  '${testProduct.description}',
  '${testProduct.category}',
  '${testProduct.businessUnit}',
  '${testProduct.technicalParameters}',
  NOW()
);
`;

console.log("\nQuery SQL para inserção:");
console.log(insertQuery);

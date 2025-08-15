import { db } from './server/db.ts';
import { products } from './shared/schema.ts';

async function checkProducts() {
  try {
    const allProducts = await db.select().from(products);
    
    console.log("📦 Produtos cadastrados no sistema:");
    console.log("=" .repeat(60));
    
    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. Código: ${product.code}`);
      console.log(`   EAN: ${product.ean}`);
      console.log(`   Descrição: ${product.description}`);
      console.log(`   Categoria: ${product.category}`);
      console.log(`   Business Unit: ${product.businessUnit}`);
      console.log(`   ID: ${product.id}`);
      console.log("-".repeat(40));
    });
    
    console.log(`\n✅ Total de produtos: ${allProducts.length}`);
    
    // Mostrar EANs para teste
    console.log("\n🎯 EANs disponíveis para teste do módulo de inspeção:");
    allProducts.forEach(product => {
      console.log(`   • ${product.ean} - ${product.description}`);
    });
    
  } catch (error) {
    console.error("❌ Erro ao consultar produtos:", error);
  }
}

checkProducts()
  .then(() => {
    console.log("\n✅ Consulta concluída!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });

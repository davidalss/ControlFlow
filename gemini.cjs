const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configurar a API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE');

async function askGemini(prompt) {
  try {
    // Para texto simples
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Resposta do Gemini:');
    console.log(text);
  } catch (error) {
    console.error('Erro:', error.message);
    console.log('\nPara usar este script:');
    console.log('1. Obtenha uma API key em: https://makersuite.google.com/app/apikey');
    console.log('2. Configure a variável de ambiente: set GEMINI_API_KEY=sua_chave_aqui');
    console.log('3. Execute: node gemini.js "sua pergunta aqui"');
  }
}

// Pegar a pergunta dos argumentos da linha de comando
const question = process.argv[2] || 'Olá, como você pode me ajudar?';

console.log('Pergunta:', question);
console.log('---');
askGemini(question);

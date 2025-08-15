# 🚀 GUIA DE MIGRAÇÃO PARA OPENROUTER API

## 📋 RESUMO DA SITUAÇÃO

O problema com as APIs anteriores (Gemini e DeepSeek) é que elas requerem:
- Cartão de crédito para liberar o free-tier
- Limites muito restritivos (2 req/min na Gemini)
- Saldo insuficiente mesmo para modelos "gratuitos"

## 🎯 SOLUÇÃO: OPENROUTER API

A **OpenRouter** oferece:
- ✅ Modelos gratuitos sem cartão de crédito
- ✅ Limites generosos (1000 req/dia)
- ✅ Múltiplos provedores de IA
- ✅ Fácil configuração

## 🔗 PASSO 1: CRIAR CONTA

1. Acesse: https://openrouter.ai
2. Clique em "Sign Up" ou "Get Started"
3. Crie uma conta gratuita (não precisa de cartão)
4. Faça login na plataforma

## 🔑 PASSO 2: OBTER CHAVE API

1. No dashboard da OpenRouter, vá em "API Keys"
2. Clique em "Create API Key"
3. Dê um nome como "ControlFlow"
4. Copie a chave gerada (formato: `sk-or-v1-...`)

## 📝 PASSO 3: MODELOS GRATUITOS DISPONÍVEIS

### Modelos Recomendados:
- `meta-llama/llama-3.1-8b-instruct` (Melhor performance)
- `mistralai/mistral-7b-instruct` (Boa performance)
- `google/gemma-2-9b-it` (Google)
- `microsoft/phi-3-mini-4k-instruct` (Microsoft)

### Limites Gratuitos:
- **1000 requisições por dia**
- **Tokens ilimitados** (dentro do limite de req/dia)
- **Sem cartão de crédito necessário**

## ⚙️ PASSO 4: CONFIGURAR O SISTEMA

### 4.1 Atualizar o arquivo .env
```bash
# Remover a chave antiga
# GEMINI_API_KEY=...
# DEEPSEEK_API_KEY=...

# Adicionar a nova chave
OPENROUTER_API_KEY="sua-chave-aqui"
```

### 4.2 Modificar o serviço
O arquivo `server/services/geminiService.ts` precisa ser atualizado para usar a OpenRouter.

### 4.3 Testar a configuração
```bash
node testar-openrouter.cjs
```

## 🧪 PASSO 5: TESTE RÁPIDO

Execute o script de teste com sua chave real:
```bash
# Edite o arquivo testar-openrouter.cjs
# Substitua a chave de exemplo pela sua chave real
# Execute:
node testar-openrouter.cjs
```

## ✅ BENEFÍCIOS DA MIGRAÇÃO

1. **Sem problemas de quota**: 1000 req/dia é mais que suficiente
2. **Sem cartão de crédito**: Totalmente gratuito
3. **Múltiplos modelos**: Escolha o melhor para seu caso
4. **Estabilidade**: Menos problemas de rate limiting
5. **Performance**: Modelos de alta qualidade

## 🚨 IMPORTANTE

- A chave da OpenRouter é gratuita e não expira
- Você pode usar até 1000 requisições por dia
- Os modelos são de alta qualidade
- Não há necessidade de cartão de crédito

## 📞 PRÓXIMOS PASSOS

1. Crie sua conta na OpenRouter
2. Obtenha sua chave API
3. Me informe a chave para eu atualizar o código
4. Testaremos o Severino com IA ativa

---

**🎉 RESULTADO ESPERADO:**
O Severino funcionará com IA inteligente, respondendo como uma IA real em vez do modo offline!

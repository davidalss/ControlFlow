# 🔧 CONFIGURAR API GEMINI - Severino Assistant

## 🎯 Problema Identificado

O Severino está funcionando em **modo offline** porque a API do Gemini não está configurada:

```
⚠️ GEMINI_API_KEY não configurada. Severino funcionará apenas em modo offline.
```

## 🚀 Solução: Configurar API Gemini

### Opção 1: Script Automático (Recomendado)

Execute um dos scripts criados:

```bash
# Opção 1: Script Batch (Windows)
configurar-gemini-api.bat

# Opção 2: Script PowerShell (Windows)
.\configurar-gemini-api.ps1
```

### Opção 2: Manual

#### Passo 1: Obter Chave da API Gemini

1. **Acesse:** https://makersuite.google.com/app/apikey
2. **Faça login** com sua conta Google
3. **Clique em "Create API Key"**
4. **Copie a chave gerada** (exemplo: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

#### Passo 2: Configurar Arquivo .env

1. **Crie o arquivo `.env`** na raiz do projeto:
   ```bash
   copy env.example .env
   ```

2. **Edite o arquivo `.env`** e configure:
   ```env
   # Configurações do Gemini AI (Severino)
   GEMINI_API_KEY="SUA_CHAVE_AQUI"
   ```

#### Passo 3: Reiniciar Servidor

```bash
# Parar servidor atual
taskkill /f /im node.exe

# Iniciar servidor
npm run dev
```

## ✅ Verificação

Após configurar, o servidor deve mostrar:

```
✅ GEMINI_API_KEY configurada. Severino funcionando com IA.
Admin user already exists. Email: admin@controlflow.com
6:40:52 PM [express] serving on port 5001
```

**Sem mais a mensagem de aviso!**

## 🔍 Funcionalidades do Severino com IA

Com a API configurada, o Severino oferece:

- **Análise inteligente** de dados de qualidade
- **Sugestões automáticas** para melhorias
- **Respostas contextuais** sobre processos
- **Assistência avançada** em inspeções
- **Recomendações** baseadas em IA

## 🚨 Troubleshooting

### Se a chave não funcionar:

1. **Verifique se a chave está correta**
2. **Confirme se tem créditos na conta Google**
3. **Teste a chave no Google AI Studio**

### Se o servidor não reconhecer:

1. **Verifique se o arquivo `.env` está na raiz**
2. **Confirme se não há espaços extras**
3. **Reinicie o servidor completamente**

## 📋 Checklist de Configuração

- [ ] Chave da API Gemini obtida
- [ ] Arquivo `.env` criado
- [ ] `GEMINI_API_KEY` configurada
- [ ] Servidor reiniciado
- [ ] Sem mensagem de aviso no log
- [ ] Severino funcionando com IA

## 🎯 Resultado Esperado

**Antes:**
```
⚠️ GEMINI_API_KEY não configurada. Severino funcionará apenas em modo offline.
```

**Depois:**
```
✅ GEMINI_API_KEY configurada. Severino funcionando com IA.
```

## 🔗 Links Úteis

- **Google AI Studio:** https://makersuite.google.com/app/apikey
- **Documentação Gemini:** https://ai.google.dev/
- **Quotas e Limites:** https://ai.google.dev/pricing

---

**Execute o script `configurar-gemini-api.bat` para configurar automaticamente!**

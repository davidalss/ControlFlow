# 🔧 Configuração Manual do Deploy no Render

## ❌ Problema Identificado
O Render não consegue acessar o repositório GitHub automaticamente.

## ✅ Soluções

### **Opção 1: Tornar o repositório público (Recomendado)**

1. Acesse: https://github.com/davidalss/ControlFlow/settings
2. Role até "Danger Zone"
3. Clique em "Change repository visibility"
4. Selecione "Make public"
5. Confirme a mudança

### **Opção 2: Configurar deploy manual**

#### **Passo 1: Criar serviço no Render**

1. Acesse: https://dashboard.render.com/
2. Clique em "New +" → "Static Site"
3. Configure:

```
Name: enso-frontend
Environment: Static Site
Region: Oregon (US West)
Branch: main
Root Directory: client
Build Command: npm install && npm run build:render
Publish Directory: dist
```

#### **Passo 2: Conectar repositório**

1. Clique em "Connect a repository"
2. Selecione "GitHub"
3. Autorize o Render
4. Selecione o repositório: `davidalss/ControlFlow`

#### **Passo 3: Configurar variáveis de ambiente**

Na seção "Environment Variables", adicione:

```
VITE_API_URL=https://enso-backend-0aa1.onrender.com
VITE_SUPABASE_URL=https://smvohmdytczfouslcaju.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U
```

#### **Passo 4: Configurar headers**

Na seção "Headers", adicione:

```
Path: /*
Name: Cache-Control
Value: public, max-age=31536000, immutable

Path: /assets/*
Name: Cache-Control
Value: public, max-age=31536000, immutable

Path: /index.html
Name: Cache-Control
Value: public, max-age=0, must-revalidate
```

#### **Passo 5: Ativar auto-deploy**

1. Ative "Auto-Deploy"
2. Configure para branch `main`
3. Clique em "Create Static Site"

### **Opção 3: Deploy via Blueprint (render.yaml)**

Se o repositório estiver público, você pode usar o `render.yaml`:

1. Acesse: https://dashboard.render.com/
2. Clique em "New +" → "Blueprint"
3. Conecte o repositório
4. O Render detectará automaticamente o `render.yaml`

## 🔍 **Verificação**

Após o deploy, verifique:

1. **URL do frontend**: `https://enso-frontend.onrender.com`
2. **Health check**: Acesse a URL
3. **Logs**: Verifique se não há erros de build

## 🚨 **Se ainda houver problemas**

### **Verificar permissões do GitHub:**
1. Acesse: https://github.com/settings/applications
2. Procure por "Render"
3. Verifique se tem acesso ao repositório

### **Testar acesso manual:**
```bash
# Testar se o repositório é acessível
curl -I https://github.com/davidalss/ControlFlow
```

### **Alternativa: Deploy via CLI**
```bash
# Instalar Render CLI
npm install -g @render/cli

# Fazer login
render login

# Deploy manual
render deploy
```

## 📞 **Suporte**

Se nenhuma solução funcionar:
- Render Support: https://render.com/docs/help
- GitHub Support: https://support.github.com/

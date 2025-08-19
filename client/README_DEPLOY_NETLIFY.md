# 🚀 Deploy no Netlify - Frontend ENSO

## 📋 Pré-requisitos

- Conta no [Netlify](https://netlify.com)
- Repositório no GitHub/GitLab/Bitbucket
- Node.js 18+ instalado localmente

## 🔧 Configuração

### 1. **Preparar o Repositório**

Certifique-se de que os seguintes arquivos estão na pasta `client/`:

- ✅ `netlify.toml` - Configuração do Netlify
- ✅ `public/_redirects` - Redirecionamentos para SPA
- ✅ `.nvmrc` - Versão do Node.js
- ✅ `package.json` - Scripts de build
- ✅ `vite.config.ts` - Configuração do Vite

### 2. **Deploy via Netlify Dashboard**

#### **Opção A: Deploy via Git (Recomendado)**

1. Acesse [app.netlify.com](https://app.netlify.com)
2. Clique em **"New site from Git"**
3. Conecte seu repositório (GitHub/GitLab/Bitbucket)
4. Configure as seguintes opções:

```
Repository: seu-usuario/ControlFlow
Base directory: client
Build command: npm run build
Publish directory: dist
```

#### **Opção B: Deploy via Drag & Drop**

1. Execute localmente: `npm run build`
2. Arraste a pasta `dist` para o Netlify

### 3. **Configurar Variáveis de Ambiente**

No painel do Netlify, vá em **Site settings > Environment variables** e adicione:

```bash
NODE_ENV=production
VITE_API_URL=https://enso-backend-0aa1.onrender.com
VITE_SUPABASE_URL=https://smvohmdytczfouslcaju.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NzE5NzgsImV4cCI6MjA3MDM0Nzk3OH0.Izj29QPPWrlhUIcLQ_840CVw5sLWuPFdpK7SL9wb92Y
VITE_WEBSOCKET_URL=wss://enso-backend-0aa1.onrender.com
VITE_ANALYTICS_ENABLED=true
VITE_DEBUG_MODE=false
```

### 4. **Configurar Domínio Personalizado (Opcional)**

1. Vá em **Site settings > Domain management**
2. Clique em **"Add custom domain"**
3. Configure seu domínio (ex: `app.enso.com`)

## 🔄 Deploy Automático

### **Configurar Webhooks**

1. No Netlify, vá em **Site settings > Build & deploy**
2. Em **"Build hooks"**, crie um novo hook
3. Use o URL gerado para deploys manuais

### **Deploy Manual via CLI**

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login no Netlify
netlify login

# Deploy manual
cd client
npm run build
netlify deploy --prod --dir=dist
```

## 🛠️ Troubleshooting

### **Erro de Build**

```bash
# Verificar logs
netlify logs

# Build local para testar
npm run build
```

### **Problemas de CORS**

Adicione no `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization"
```

### **Problemas de Roteamento**

Verifique se o arquivo `public/_redirects` está correto:

```
/*    /index.html   200
```

## 📊 Monitoramento

### **Analytics**

1. Vá em **Site settings > Analytics**
2. Ative o **"Netlify Analytics"**
3. Configure eventos customizados se necessário

### **Logs**

- **Build logs**: Disponível no painel do Netlify
- **Function logs**: Se usar Netlify Functions
- **Deploy logs**: Histórico completo de deploys

## 🔒 Segurança

### **Headers de Segurança**

Já configurados no `netlify.toml`:

- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

### **HTTPS**

- Automático no Netlify
- Certificados SSL gratuitos
- Redirecionamento automático HTTP → HTTPS

## 🚀 Otimizações

### **Performance**

- ✅ Build otimizado com Vite
- ✅ Minificação automática
- ✅ Compressão de imagens
- ✅ Cache de assets estáticos

### **SEO**

- ✅ Meta tags configuradas
- ✅ Sitemap automático (se necessário)
- ✅ Open Graph tags

## 📱 PWA (Progressive Web App)

Para habilitar PWA, adicione no `public/`:

- `manifest.json`
- `sw.js` (Service Worker)
- Ícones em diferentes tamanhos

## 🔄 CI/CD

### **GitHub Actions**

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Netlify
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd client && npm install
      - run: cd client && npm run build
      - uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './client/dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 📞 Suporte

- **Documentação**: [docs.netlify.com](https://docs.netlify.com)
- **Comunidade**: [community.netlify.com](https://community.netlify.com)
- **Status**: [status.netlify.com](https://status.netlify.com)

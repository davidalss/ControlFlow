# 🚀 Guia Completo: Deploy no Render

## 📋 Visão Geral

Este guia explica como fazer deploy da aplicação ControlFlow no Render, incluindo backend e frontend.

## 🏗️ Arquitetura

- **Backend**: Node.js/Express (já no Render)
- **Frontend**: React/Vite (novo no Render)
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth

## 🔧 1. Configuração do Backend

### 1.1 Verificar Serviço Existente

O backend já está rodando em: `https://enso-backend-0aa1.onrender.com`

### 1.2 Configurar Variáveis de Ambiente

No dashboard do Render, configure as seguintes variáveis para o serviço `enso-backend`:

```bash
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://smvohmdytczfouslcaju.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U
SUPABASE_SERVICE_ROLE_KEY=[PEGAR DO DASHBOARD DO SUPABASE]
DATABASE_URL=postgresql://postgres.smvohmdytczfouslcaju:ExieAFZE1Xb3oyfh@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
JWT_SECRET=1e2652b8cd149780e3d1d8cad9c578faf252089d8cac2722caa9d6c36bcd1d8e
CORS_ORIGIN=https://enso-frontend.onrender.com
```

## 🌐 2. Configuração do Frontend

### 2.1 Criar Novo Serviço no Render

1. Acesse o dashboard do Render
2. Clique em "New +" → "Static Site"
3. Conecte o repositório GitHub: `https://github.com/davidalss/ControlFlow`
4. Configure:

```yaml
Name: enso-frontend
Branch: main
Root Directory: client
Build Command: npm install && npm run build:render
Publish Directory: dist
```

### 2.2 Configurar Variáveis de Ambiente do Frontend

```bash
VITE_API_URL=https://enso-backend-0aa1.onrender.com
VITE_SUPABASE_URL=https://smvohmdytczfouslcaju.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U
```

## 🔄 3. Deploy Automático

### 3.1 Configurar Auto-Deploy

1. No dashboard do Render, ative "Auto-Deploy"
2. Configure para branch `main`
3. O deploy será automático a cada push

### 3.2 GitHub Actions (Opcional)

O workflow `.github/workflows/render-deploy.yml` já está configurado para:
- Testes automáticos
- Build de validação
- Deploy automático

## 📊 4. Monitoramento e Escalabilidade

### 4.1 Configurações de Escala

**Backend:**
- Min Instances: 1
- Max Instances: 3
- Plan: Starter (512MB RAM, 0.1 CPU)

**Frontend:**
- Static Site (sem escalabilidade necessária)
- CDN automático

### 4.2 Monitoramento

Execute o script de monitoramento:

```bash
node scripts/monitor-performance.js
```

### 4.3 Health Checks

- Backend: `https://enso-backend-0aa1.onrender.com/api/health`
- Frontend: `https://enso-frontend.onrender.com`

## 🔐 5. Configurações de Segurança

### 5.1 CORS

O backend já está configurado para aceitar requisições do frontend.

### 5.2 Headers de Segurança

Configurados automaticamente pelo Render.

### 5.3 Variáveis Sensíveis

- `SUPABASE_SERVICE_ROLE_KEY`: Configurar no dashboard do Render
- `JWT_SECRET`: Gerado automaticamente

## 🚀 6. Deploy Manual (se necessário)

### 6.1 Backend

```bash
# Build local para teste
npm run build:production

# Deploy via Render CLI (se configurado)
render deploy enso-backend
```

### 6.2 Frontend

```bash
# Build local
cd client
npm run build:render

# Deploy via Render CLI (se configurado)
render deploy enso-frontend
```

## 📈 7. Otimizações de Performance

### 7.1 Frontend

- Code splitting configurado
- Lazy loading de componentes
- Cache de assets otimizado
- Bundle analysis disponível

### 7.2 Backend

- Connection pooling configurado
- Query optimization
- Caching de respostas
- Rate limiting implementado

## 🔍 8. Troubleshooting

### 8.1 Problemas Comuns

**Build falha:**
- Verificar dependências no package.json
- Verificar Node.js version
- Verificar variáveis de ambiente

**CORS errors:**
- Verificar CORS_ORIGIN no backend
- Verificar VITE_API_URL no frontend

**Auth não funciona:**
- Verificar SUPABASE_ANON_KEY
- Verificar SUPABASE_SERVICE_ROLE_KEY
- Verificar URLs do Supabase

### 8.2 Logs

Acesse os logs no dashboard do Render:
- Backend: Logs em tempo real
- Frontend: Build logs

## 📞 9. Suporte

- Render Documentation: https://render.com/docs
- Supabase Documentation: https://supabase.com/docs
- GitHub Issues: Para problemas específicos do código

## ✅ 10. Checklist de Deploy

- [ ] Backend configurado e funcionando
- [ ] Frontend criado no Render
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado
- [ ] Auto-deploy ativado
- [ ] Health checks passando
- [ ] Testes funcionando
- [ ] Monitoramento ativo

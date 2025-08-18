# 🚀 Deploy Rápido - Enso

## ⚡ Deploy Automático

```bash
# 1. Preparar ambiente
npm install
cp env.local.example .env
# Configure as variáveis no .env

# 2. Deploy automático
npm run deploy:production
```

## 📋 Checklist Pré-Deploy

- [ ] `.env` configurado com todas as variáveis
- [ ] Branch `main` atualizada
- [ ] Todas as mudanças commitadas
- [ ] Supabase configurado e testado
- [ ] Build local funcionando

## 🔧 Configuração Manual

### Backend (Render)
1. Acesse [render.com](https://render.com)
2. **New Web Service** → Conecte GitHub
3. Configure:
   - **Name**: `enso-backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Health Check**: `/health`

### Frontend (Vercel)
1. Acesse [vercel.com](https://vercel.com)
2. **New Project** → Conecte GitHub
3. Configure:
   - **Framework**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`

## 🔑 Variáveis de Ambiente

### Render (Backend)
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres.smvohmdytczfouslcaju:ExieAFZE1Xb3oyfh@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://smvohmdytczfouslcaju.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUxOTUzNCwiZXhwIjoyMDcxMDk1NTM0fQ.UWuEALzLAlQoYQrWGOKuPbWUWxAmMNAHJ9IUtE-qiAE
JWT_SECRET=enso-jwt-secret-key-2024-production
SESSION_SECRET=enso-session-secret-2024-production
```

### Vercel (Frontend)
```env
VITE_API_URL=https://enso-backend.onrender.com
REACT_APP_SUPABASE_URL=https://smvohmdytczfouslcaju.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U
```

## 🧪 Testes Pós-Deploy

```bash
# Testar backend
curl https://enso-backend.onrender.com/health

# Testar frontend
open https://enso.vercel.app
```

## 📊 Monitoramento

- **Render**: https://dashboard.render.com
- **Vercel**: https://vercel.com/dashboard  
- **Supabase**: https://supabase.com/dashboard

## 🆘 Troubleshooting

### Build falha
```bash
# Testar build local
npm run build
```

### Backend não inicia
- Verificar logs no Render
- Verificar variáveis de ambiente
- Testar health check

### Frontend não carrega
- Verificar logs no Vercel
- Verificar se API_URL está correto
- Testar build do client

## 💰 Custos

- **Render**: $7/mês (backend)
- **Vercel**: $20/mês (frontend)
- **Supabase**: $25/mês (database)
- **Total**: $52/mês

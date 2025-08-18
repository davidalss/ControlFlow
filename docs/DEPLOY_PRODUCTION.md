# 🚀 Deploy em Produção - Enso

## 📋 Estrutura de Deploy

- **Backend**: Render (Node.js + Express)
- **Frontend**: Vercel (React + Vite)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## 🔧 Backend no Render

### 1. Preparação
```bash
# Build local para testar
npm run build
```

### 2. Deploy no Render
1. Acesse [render.com](https://render.com)
2. Conecte seu repositório GitHub
3. Crie um novo **Web Service**
4. Configure:
   - **Name**: `enso-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`

### 3. Variáveis de Ambiente no Render
Configure estas variáveis no painel do Render:

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres.smvohmdytczfouslcaju:ExieAFZE1Xb3oyfh@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://smvohmdytczfouslcaju.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUxOTUzNCwiZXhwIjoyMDcxMDk1NTM0fQ.UWuEALzLAlQoYQrWGOKuPbWUWxAmMNAHJ9IUtE-qiAE
JWT_SECRET=enso-jwt-secret-key-2024-production
SESSION_SECRET=enso-session-secret-2024-production
GEMINI_API_KEY=your-gemini-api-key-here
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
```

### 4. URL do Backend
Após o deploy, você terá uma URL como:
`https://enso-backend.onrender.com`

## 🎨 Frontend no Vercel

### 1. Preparação
```bash
# Instalar dependências do frontend
cd client
npm install
```

### 2. Deploy no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Conecte seu repositório GitHub
3. Configure o projeto:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3. Variáveis de Ambiente no Vercel
Configure estas variáveis no painel do Vercel:

```env
VITE_API_URL=https://enso-backend.onrender.com
REACT_APP_SUPABASE_URL=https://smvohmdytczfouslcaju.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U
```

### 4. URL do Frontend
Após o deploy, você terá uma URL como:
`https://enso.vercel.app`

## 🔄 Fluxo de Deploy

### Backend (Render)
1. Push para `main` branch
2. Render detecta mudanças
3. Executa `npm run build`
4. Executa `npm start`
5. Health check em `/health`

### Frontend (Vercel)
1. Push para `main` branch
2. Vercel detecta mudanças
3. Executa `npm run build` na pasta `client`
4. Deploy automático

## 🧪 Testes Pós-Deploy

### 1. Testar Backend
```bash
# Health check
curl https://enso-backend.onrender.com/health

# Testar API
curl https://enso-backend.onrender.com/api/auth/me
```

### 2. Testar Frontend
- Acesse a URL do Vercel
- Teste login/logout
- Teste funcionalidades principais

### 3. Testar Integração
```bash
# Testar comunicação frontend -> backend
curl -H "Origin: https://enso.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     https://enso-backend.onrender.com/api/auth/me
```

## 🔧 Troubleshooting

### Backend não inicia
1. Verificar logs no Render
2. Verificar variáveis de ambiente
3. Testar build local: `npm run build`

### Frontend não carrega
1. Verificar logs no Vercel
2. Verificar variáveis de ambiente
3. Verificar se API_URL está correto

### CORS Errors
1. Verificar se backend está configurado para aceitar origem do Vercel
2. Verificar headers de CORS

### Database Connection
1. Verificar DATABASE_URL no Supabase
2. Verificar se IP do Render está liberado no Supabase

## 📊 Monitoramento

### Render
- Logs em tempo real
- Métricas de performance
- Health checks automáticos

### Vercel
- Analytics de performance
- Logs de build
- Deploy previews

### Supabase
- Database logs
- Auth logs
- Performance metrics

## 🔒 Segurança

### Variáveis Sensíveis
- Nunca commitar `.env` files
- Usar variáveis de ambiente nos serviços
- Rotacionar chaves regularmente

### CORS
- Configurar apenas origens permitidas
- Usar HTTPS em produção

### Rate Limiting
- Implementar rate limiting no backend
- Monitorar requests suspeitos

## 💰 Custos Estimados

### Render
- Free tier: $0/mês (com limitações)
- Paid tier: $7/mês (recomendado)

### Vercel
- Free tier: $0/mês (com limitações)
- Paid tier: $20/mês (recomendado)

### Supabase
- Free tier: $0/mês (com limitações)
- Paid tier: $25/mês (recomendado)

**Total estimado: $52/mês**

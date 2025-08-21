# 🔧 Configuração de Variáveis de Ambiente

## 📋 Visão Geral

Este documento explica como configurar as variáveis de ambiente necessárias para o funcionamento correto do sistema ControlFlow, incluindo verificações automáticas no pipeline de CI/CD.

## 🚨 Variáveis Críticas (Obrigatórias)

### Frontend (Client)

| Variável | Descrição | Exemplo | Obrigatória |
|----------|-----------|---------|-------------|
| `VITE_API_URL` | URL da API do backend | `https://enso-backend-0aa1.onrender.com` | ✅ |
| `VITE_SUPABASE_URL` | URL do Supabase | `https://smvohmdytczfouslcaju.supabase.co` | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima do Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ |
| `VITE_WEBSOCKET_URL` | URL do WebSocket | `wss://enso-backend-0aa1.onrender.com` | ⚠️ |

### Backend (Server)

| Variável | Descrição | Exemplo | Obrigatória |
|----------|-----------|---------|-------------|
| `SUPABASE_URL` | URL do Supabase | `https://smvohmdytczfouslcaju.supabase.co` | ✅ |
| `SUPABASE_ANON_KEY` | Chave anônima do Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço do Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ |
| `DATABASE_URL` | URL do banco de dados | `postgresql://...` | ✅ |
| `JWT_SECRET` | Chave secreta para JWT | `sua-chave-secreta-aqui` | ✅ |
| `GEMINI_API_KEY` | Chave da API Gemini | `AIzaSy...` | ✅ |

## 📝 Variáveis Recomendadas

### Frontend

| Variável | Descrição | Valor Padrão | Recomendado |
|----------|-----------|--------------|-------------|
| `VITE_ENABLE_ANALYTICS` | Habilitar analytics | `false` | `true` (produção) |
| `VITE_ENABLE_DEBUG` | Habilitar modo debug | `false` | `false` (produção) |
| `VITE_ENABLE_SOURCE_MAPS` | Habilitar source maps | `false` | `false` (produção) |

## 🔍 Verificação Automática

### Script de Verificação

O projeto inclui um script automático para verificar variáveis de ambiente:

```bash
# Verificar variáveis de ambiente
cd client
npm run check-env

# Build com verificação automática
npm run build:safe
npm run build:netlify:safe
npm run build:render:safe
```

### Saída do Script

```
🔧 VERIFICADOR DE VARIÁVEIS DE AMBIENTE
============================================================

🏗️  VERIFICANDO AMBIENTE DE BUILD
============================================================
Ambiente: production

🔍 VERIFICANDO ARQUIVO .env
============================================================
✅ Arquivo de ambiente encontrado: .env

🚨 VERIFICANDO VARIÁVEIS CRÍTICAS
============================================================
✅ VITE_API_URL: https://enso-backend-0aa1.onrender.com
✅ VITE_SUPABASE_URL: https://smvohmdytczfouslcaju.supabase.co
✅ VITE_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
⚠️  VITE_WEBSOCKET_URL: AUSENTE (opcional)
   Descrição: URL do WebSocket (opcional, pode ser derivada do VITE_API_URL)
💡 VITE_WEBSOCKET_URL pode ser derivada: wss://enso-backend-0aa1.onrender.com

📊 RESUMO DA VERIFICAÇÃO
============================================================
✅ Todas as variáveis críticas estão presentes!
📁 Arquivo usado: .env
🔢 Variáveis críticas: 3/4
🚀 Pronto para build de produção!
```

## 📁 Arquivos de Configuração

### Desenvolvimento Local

Crie um arquivo `.env` na pasta `client/`:

```env
# Configurações de Ambiente
NODE_ENV=development
VITE_NODE_ENV=development

# URLs das APIs (OBRIGATÓRIO)
VITE_API_URL=https://enso-backend-0aa1.onrender.com

# Configurações do Supabase (OBRIGATÓRIO)
VITE_SUPABASE_URL=https://smvohmdytczfouslcaju.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Configurações do WebSocket (OPCIONAL)
VITE_WEBSOCKET_URL=wss://enso-backend-0aa1.onrender.com

# Configurações de Performance (RECOMENDADO)
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
VITE_ENABLE_SOURCE_MAPS=false
```

### Produção

Para produção, use o arquivo `env.production`:

```env
# Configurações de Produção
NODE_ENV=production
VITE_NODE_ENV=production

# URLs das APIs
VITE_API_URL=https://enso-backend-0aa1.onrender.com
VITE_SUPABASE_URL=https://smvohmdytczfouslcaju.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_WEBSOCKET_URL=wss://enso-backend-0aa1.onrender.com

# Performance
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
VITE_ENABLE_SOURCE_MAPS=false
```

## 🚀 Configuração em Plataformas

### GitHub Actions (CI/CD)

Configure os secrets no repositório GitHub:

1. Vá para **Settings** > **Secrets and variables** > **Actions**
2. Adicione os seguintes secrets:
   - `VITE_API_URL`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_WEBSOCKET_URL`

### Netlify

1. Vá para **Site settings** > **Environment variables**
2. Adicione as variáveis de ambiente
3. O build usará automaticamente `npm run build:netlify:safe`

### Render

1. Vá para **Environment** > **Environment Variables**
2. Adicione as variáveis de ambiente
3. O build usará automaticamente `npm run build:render:safe`

## 🔧 Troubleshooting

### Erro: "Variáveis críticas ausentes"

**Sintoma:**
```
❌ Variáveis críticas ausentes!
❌ Ausentes: VITE_API_URL, VITE_SUPABASE_URL
```

**Solução:**
1. Verifique se o arquivo `.env` existe na pasta `client/`
2. Confirme se as variáveis estão definidas corretamente
3. Execute `npm run check-env` para diagnóstico

### Erro: "Build de produção bloqueado"

**Sintoma:**
```
🚫 Build de produção bloqueado!
   Defina todas as variáveis críticas antes de fazer deploy.
```

**Solução:**
1. Configure todas as variáveis críticas na plataforma de deploy
2. Verifique se os secrets estão configurados no GitHub Actions
3. Teste localmente com `NODE_ENV=production npm run check-env`

### Erro: "WebSocket não conecta"

**Sintoma:**
```
WebSocket connection to 'wss://enso-backend-0aa1.onrender.com/ws/severino' failed
```

**Solução:**
1. Verifique se `VITE_WEBSOCKET_URL` está definida
2. Confirme se a URL está correta (wss:// em vez de https://)
3. Teste se o backend está respondendo no endpoint `/ws/severino`

## 📊 Monitoramento

### Logs de Verificação

O script de verificação gera logs detalhados:

```bash
# Verificar com logs detalhados
npm run check-env

# Verificar em modo silencioso (apenas erro/sucesso)
npm run check-env 2>/dev/null
```

### Integração com CI/CD

O pipeline de CI/CD inclui verificação automática:

```yaml
# .github/workflows/ci-cd.yml
- name: Check environment variables
  run: |
    cd client
    npm run check-env
  env:
    NODE_ENV: production
    VITE_API_URL: ${{ secrets.VITE_API_URL }}
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

## ✅ Checklist de Configuração

- [ ] Arquivo `.env` criado na pasta `client/`
- [ ] Todas as variáveis críticas definidas
- [ ] Script de verificação executado com sucesso
- [ ] Build local funcionando
- [ ] Variáveis configuradas na plataforma de deploy
- [ ] CI/CD configurado com secrets
- [ ] Teste de produção realizado

## 🔒 Segurança

### Variáveis Sensíveis

Nunca commite variáveis sensíveis no repositório:

```bash
# .gitignore
.env
.env.local
.env.production
```

### Rotação de Chaves

- Rotacione as chaves do Supabase regularmente
- Use variáveis de ambiente diferentes para cada ambiente
- Monitore logs de acesso para detectar uso não autorizado

## 📞 Suporte

Se encontrar problemas com a configuração:

1. Execute `npm run check-env` para diagnóstico
2. Verifique os logs de erro
3. Confirme se todas as variáveis estão definidas
4. Teste em ambiente local antes de fazer deploy

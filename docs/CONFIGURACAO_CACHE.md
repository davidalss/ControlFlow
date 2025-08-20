# Configuração de Cache - ENSO

Este documento explica a configuração de cache implementada para evitar problemas após novos deploys.

## 🎯 Objetivo

Garantir que após cada deploy, os usuários sempre carreguem a versão mais recente do aplicativo, evitando erros causados por cache antigo.

## 📋 Configurações Implementadas

### 1. Versionamento de Assets (Vite)

**Arquivo:** `client/vite.config.ts`

- **Hash nos nomes dos arquivos:** Todos os assets (.js, .css, .png, etc.) recebem hash único no nome
- **Estrutura de pastas organizada:**
  - `/js/[name]-[hash].js` - JavaScript
  - `/css/[name]-[hash].css` - CSS
  - `/images/[name]-[hash][extname]` - Imagens
  - `/fonts/[name]-[hash][extname]` - Fontes
  - `/assets/[name]-[hash][extname]` - Outros assets

### 2. Headers de Cache

#### Render (render.yaml)
```yaml
headers:
  # index.html - nunca cachear
  - path: /index.html
    name: Cache-Control
    value: "no-cache, no-store, must-revalidate"
  
  # Assets versionados - cache por 1 ano
  - path: /js/*
    name: Cache-Control
    value: "public, max-age=31536000, immutable"
```

#### Netlify (_headers)
```apache
# index.html - nunca cachear
/index.html
  Cache-Control: no-cache, no-store, must-revalidate

# Assets versionados - cache por 1 ano
/js/*
  Cache-Control: public, max-age=31536000, immutable
```

### 3. Service Worker

**Arquivo:** `client/public/sw.js`

**Estratégias de Cache:**
- **Network First:** Para HTML e APIs (sempre busca versão nova)
- **Cache First:** Para assets estáticos (usa cache se disponível)

**Funcionalidades:**
- Cache automático de assets estáticos
- Limpeza de caches antigos
- Verificação periódica de atualizações
- Notificação de novas versões disponíveis

### 4. Manifest Dinâmico

**Arquivo:** `client/public/site.webmanifest`

- Versão atualizada automaticamente durante o build
- Timestamp de build incluído
- Configuração PWA otimizada

### 5. Script de Atualização Automática

**Arquivo:** `client/scripts/update-manifest-version.js`

**Executado automaticamente:**
- Antes de cada build (`prebuild` script)
- Atualiza versão do manifest
- Atualiza versão do service worker
- Gera timestamp único para cada deploy

## 🔄 Fluxo de Deploy

1. **Build inicia**
2. **Script `prebuild` executa:**
   - Atualiza versão do manifest
   - Atualiza versão do service worker
   - Gera timestamp único
3. **Vite build:**
   - Gera assets com hash único
   - Cria manifest.json com referências corretas
4. **Deploy:**
   - Headers de cache configurados automaticamente
   - Service worker registrado no cliente

## 📱 Comportamento no Cliente

### Primeira Visita
1. Cliente baixa `index.html` (não cacheado)
2. Cliente baixa assets versionados
3. Service worker registrado
4. Assets cacheados localmente

### Visitas Subsequentes
1. Cliente verifica `index.html` (sempre busca nova versão)
2. Se há mudanças, novos assets são baixados
3. Service worker detecta atualizações
4. Usuário é notificado sobre nova versão

### Após Deploy
1. `index.html` sempre carrega versão nova
2. Assets antigos continuam funcionando (hash diferente)
3. Novos assets são baixados automaticamente
4. Service worker limpa caches antigos

## 🛠️ Comandos Úteis

```bash
# Build com atualização automática de versão
npm run build

# Build para Render
npm run build:render

# Build para Netlify
npm run build:netlify

# Atualizar versão manualmente
npm run update-version
```

## 🔍 Verificação

### Verificar Headers
```bash
# Verificar headers do index.html
curl -I https://seu-dominio.com/index.html

# Verificar headers de assets
curl -I https://seu-dominio.com/js/app-abc123.js
```

### Verificar Service Worker
1. Abrir DevTools > Application > Service Workers
2. Verificar se está registrado
3. Verificar versão atual

### Verificar Cache
1. Abrir DevTools > Application > Storage
2. Verificar Cache Storage
3. Verificar se caches antigos foram limpos

## 🚨 Troubleshooting

### Problema: Cache não está sendo limpo
**Solução:**
- Verificar se service worker está registrado
- Verificar se headers estão configurados corretamente
- Limpar cache manualmente: `npm run clear-cache`

### Problema: Assets não estão sendo atualizados
**Solução:**
- Verificar se hash está sendo gerado corretamente
- Verificar se manifest.json está atualizado
- Verificar se build está usando versão correta

### Problema: Service worker não detecta atualizações
**Solução:**
- Verificar se versão do service worker foi atualizada
- Verificar se cache names estão corretos
- Verificar se periodic check está funcionando

## 📊 Benefícios

1. **Performance:** Assets cacheados por 1 ano
2. **Confiabilidade:** Sempre carrega versão mais recente
3. **UX:** Notificações de atualização
4. **Offline:** Funciona sem conexão
5. **Automatização:** Zero configuração manual

## 🔮 Próximos Passos

- [ ] Implementar cache de API responses
- [ ] Adicionar métricas de performance
- [ ] Implementar cache warming
- [ ] Adicionar fallback offline
- [ ] Implementar cache de imagens otimizado

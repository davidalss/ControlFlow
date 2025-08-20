# 📋 Sistema de Logs Detalhados - Planos de Inspeção

Este documento explica como usar o sistema de logging instrumentado no sistema ENSO, especificamente para a página de Planos de Inspeção.

## 🎯 Objetivo

O sistema foi projetado para fornecer **observabilidade completa** de todas as operações CRUD (Create, Read, Update, Delete), conexões de rede, e fluxos de dados na página de Planos de Inspeção.

## 🔧 Configuração

### Ativando os Logs

Para ativar o sistema de logs, defina a variável de ambiente:

```bash
VITE_APP_DEBUG_LOGS=true
```

**Para desativar** (padrão):
```bash
VITE_APP_DEBUG_LOGS=false
# ou simplesmente não definir a variável
```

### Arquivo .env.local (exemplo)

```env
VITE_APP_DEBUG_LOGS=true
VITE_API_URL=https://enso-backend-0aa1.onrender.com
```

## 📊 O que é Logado

### 1. **Carregamento da Página**
```console
🚀 inspection-plans/page-mount
ℹ️ {
  "ts": "2024-01-15T10:30:00.000Z",
  "level": "info", 
  "feature": "inspection-plans",
  "action": "mount",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "details": {
    "hasUser": true,
    "userId": "user-123",
    "plansCount": 15,
    "loading": false
  }
}
```

### 2. **Requisições HTTP**
```console
📡 GET /api/inspection-plans — inspection-plans/list
ℹ️ {
  "ts": "2024-01-15T10:30:01.000Z",
  "level": "info",
  "feature": "inspection-plans", 
  "action": "list:request",
  "correlationId": "550e8400-e29b-41d4-a716-446655440001",
  "details": {
    "url": "https://api.example.com/inspection-plans",
    "method": "GET",
    "headers": {
      "Accept": "application/json",
      "Authorization": "***REDACTED***"
    },
    "durationMs": 245,
    "status": 200
  }
}
```

### 3. **Operações CRUD**
```console
✍️ create-plan
ℹ️ {
  "feature": "inspection-plans",
  "action": "create-intent", 
  "correlationId": "550e8400-e29b-41d4-a716-446655440002",
  "details": {
    "newPlanData": {
      "name": "Plano Teste",
      "businessUnit": "TECH",
      "linkedProductsCount": 3
    },
    "userId": "user-123"
  }
}
```

### 4. **Diffs de Alterações**
```console
💾 update-plan
ℹ️ {
  "action": "update-diff",
  "details": {
    "diff": {
      "planName": {
        "from": "Plano Original",
        "to": "Plano Modificado"
      },
      "aqlCritical": {
        "from": 0.1,
        "to": 0.15
      }
    }
  }
}
```

### 5. **Erros com Diagnóstico**
```console
🛑 inspection-plans/create-error
🛑 {
  "action": "create-error",
  "correlationId": "550e8400-e29b-41d4-a716-446655440003",
  "details": {
    "error": {
      "message": "HTTP 502 Bad Gateway",
      "status": 502,
      "correlationId": "550e8400-e29b-41d4-a716-446655440003"
    },
    "recommendation": "Verificar conectividade e status do servidor"
  }
}
```

## 🔍 Tipos de Logs

### Níveis de Log
- **🐛 DEBUG**: Detalhes técnicos e fluxo de dados
- **ℹ️ INFO**: Operações normais e sucessos
- **⚠️ WARN**: Situações que requerem atenção
- **🛑 ERROR**: Falhas e erros

### Emojis por Funcionalidade
- **🚀** Inicialização de página/app
- **📡** Requisições HTTP
- **✍️** Criação de registros
- **✏️** Edição de registros  
- **👁️** Visualização de registros
- **🗑️** Exclusão de registros
- **📋** Duplicação de registros
- **🔄** Tentativas de retry
- **🔌** Conexões WebSocket
- **🚨** Erros globais

## 🛠️ Componentes do Sistema

### 1. **Logger Utilitário** (`/lib/logger.ts`)
```typescript
import { log, useLogging } from '@/lib/logger';

// Uso básico
log.info({
  feature: 'inspection-plans',
  action: 'list-success',
  correlationId: '...',
  details: { count: 10 }
});

// Hook para componentes React
const { log: pageLog } = useLogging('inspection-plans');
pageLog.info('operation-completed', { result: data });
```

### 2. **HTTP Client** (`/lib/http.ts`)
```typescript
import { http } from '@/lib/http';

// Todas as requisições são automaticamente logadas
const data = await http.get('/api/plans', {
  feature: 'inspection-plans',
  action: 'list'
});
```

### 3. **ErrorBoundary** (`/components/ErrorBoundary.tsx`)
```typescript
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary feature="inspection-plans">
  <ComponenteQuePodevFalhar />
</ErrorBoundary>
```

### 4. **WebSocket Logger** (`/lib/wsLogger.ts`)
```typescript
import { logWebSocket } from '@/lib/wsLogger';

const ws = new WebSocket('wss://api.example.com/ws');
const logger = logWebSocket(ws, {
  feature: 'severino-chat',
  action: 'connection'
});
```

## 🔧 Personalização

### Configurando Diferentes Níveis
```typescript
// Só erros
log.error({ feature: 'auth', action: 'login-failed', details: error });

// Informações detalhadas
log.debug({ 
  feature: 'inspection-plans', 
  action: 'form-validation',
  details: { 
    validFields: ['name', 'type'],
    invalidFields: ['aql'],
    formData: sanitizedData
  }
});
```

### Adicionando Correlation IDs Customizados
```typescript
const correlationId = generateCorrelationId();

// Usar o mesmo ID em uma operação multi-step
log.info({ feature: 'plans', action: 'validation', correlationId });
log.info({ feature: 'plans', action: 'save', correlationId });
log.info({ feature: 'plans', action: 'notification', correlationId });
```

## 🔍 Investigando Problemas

### 1. **Encontrar Erros por ID**
Quando um erro ocorre, o sistema mostra um correlation ID no toast:
```
"Erro ao criar plano. ID: 550e8400-e29b-41d4-a716-446655440003"
```

No console, procure por este ID:
```console
🛑 inspection-plans/create-error
correlationId: "550e8400-e29b-41d4-a716-446655440003"
```

### 2. **Rastrear Fluxo Completo**
Use o correlation ID para seguir toda a operação:
```console
// 1. Início da operação
✍️ create-plan-intent (correlationId: abc-123)

// 2. Requisição HTTP  
📡 POST /api/plans (correlationId: abc-123)

// 3. Resultado
🛑 create-error (correlationId: abc-123)
```

### 3. **Identificar Tipos de Erro**

**CORS:**
```console
"diagnosis": "Possível erro de CORS ou conectividade de rede"
```

**4xx (Cliente):**
```console
"recommendation": "Verificar dados do formulário e permissões"
```

**5xx (Servidor):**
```console  
"recommendation": "Verificar conectividade e status do servidor"
```

**Network/Timeout:**
```console
"isNetworkError": true,
"isTimeoutError": true
```

## 📈 Métricas e Performance

O sistema automaticamente coleta:

- **Duração de requisições** (`durationMs`)
- **Tamanho de payloads** (`bodySize`, `messageSize`)
- **Contadores de operações** (sucessos/falhas por tipo)
- **Tempo de vida de conexões WebSocket**
- **Tentativas de reconexão**

## 🚨 Tratamento de Erros

### Hierarquia de Captura
1. **ErrorBoundary** - Erros de rendering React
2. **HTTP interceptors** - Erros de API/rede  
3. **Global handlers** - Erros JavaScript não capturados
4. **Promise rejections** - Promises rejeitadas

### Informações de Contexto
Cada erro inclui:
- **Correlation ID** único
- **Stack trace** completo
- **Estado da aplicação** no momento do erro
- **Informações do navegador** (user agent, URL)
- **Recomendações de solução**

## 🎮 Exemplo Prático

Para testar o sistema:

1. **Ativar logs**: `VITE_APP_DEBUG_LOGS=true`
2. **Abrir página** de Planos de Inspeção
3. **Abrir DevTools** (F12) → Console
4. **Executar operações**:
   - Criar plano ✍️
   - Editar plano ✏️  
   - Deletar plano 🗑️
   - Tentar operação com erro de rede 🚨

5. **Observar logs agrupados** no console com emojis e correlation IDs

## 🔒 Segurança

### Dados Sanitizados
- Headers de autenticação são mascarados (`***REDACTED***`)
- Campos sensíveis (passwords, tokens) são removidos
- Payloads são truncados se muito grandes

### Somente em Desenvolvimento
- Logs só aparecem quando `VITE_APP_DEBUG_LOGS=true`
- Em produção, dados sensíveis nunca são expostos no console

---

**🎉 Com este sistema, você tem visibilidade completa sobre o que está acontecendo na página de Planos de Inspeção, facilitando debug, manutenção e monitoramento da aplicação!**

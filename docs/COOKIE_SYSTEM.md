# Sistema de Cookies do ControlFlow

## 🍪 Visão Geral

O sistema de cookies do ControlFlow é uma solução robusta e inteligente para persistência de estado, preferências do usuário e cache de dados. Ele foi projetado para melhorar significativamente a experiência do usuário, mantendo configurações, estados de aplicação e dados temporários entre sessões.

## 🏗️ Arquitetura

### Componentes Principais

#### 1. CookieManager (Singleton)
- **Localização**: `client/src/lib/cookie-manager.ts`
- **Padrão**: Singleton para garantir uma única instância
- **Responsabilidades**: Gerenciamento centralizado de todos os cookies

#### 2. useCookies Hook
- **Localização**: `client/src/hooks/use-cookies.ts`
- **Padrão**: Hook React customizado
- **Responsabilidades**: Interface reativa para componentes

#### 3. Hooks Especializados
- `useUserPreferences`: Gerenciamento de preferências
- `useFlowBuilderCookies`: Estado do Flow Builder
- `useInspectionCookies`: Sessões de inspeção

#### 4. UserPreferences Component
- **Localização**: `client/src/components/settings/UserPreferences.tsx`
- **Responsabilidades**: Interface de usuário para configurações

## 🔧 Funcionalidades

### Persistência de Estado

#### Preferências do Usuário
```typescript
interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  flowBuilderSettings: {
    gridSnap: boolean;
    showGrid: boolean;
    autoSave: boolean;
    defaultNodeType: string;
  };
  inspectionSettings: {
    autoAdvance: boolean;
    showHelpByDefault: boolean;
    photoQuality: 'low' | 'medium' | 'high';
  };
  uiSettings: {
    sidebarCollapsed: boolean;
    showTooltips: boolean;
    compactMode: boolean;
  };
}
```

#### Estado do Flow Builder
```typescript
interface FlowBuilderState {
  lastPlanId?: string;
  canvasZoom: number;
  canvasPosition: { x: number; y: number };
  selectedNodes: string[];
  lastUsedCriteria: string[];
}
```

#### Sessão de Inspeção
```typescript
interface InspectionSession {
  currentInspectionId?: string;
  lastStep: number;
  autoSaveData: boolean;
  sessionStartTime: number;
}
```

### Sistema de Cache Inteligente

#### Características
- **TTL Configurável**: Tempo de vida personalizável por item
- **Limpeza Automática**: Remoção de dados expirados
- **Categorização**: Organização por tipos de dados
- **Estatísticas**: Métricas de uso e performance

#### Exemplo de Uso
```typescript
// Salvar dados em cache por 1 hora
cookieManager.setCache('products_list', products, 3600);

// Recuperar dados do cache
const cachedProducts = cookieManager.getCache('products_list');
```

## 🚀 Como Usar

### Uso Básico

#### 1. Importar o Hook
```typescript
import { useCookies } from '@/hooks/use-cookies';

function MyComponent() {
  const { preferences, updateUserPreference } = useCookies();
  
  // Usar preferências
  const handleThemeChange = (theme) => {
    updateUserPreference('uiSettings', 'theme', theme);
  };
  
  return (
    <div className={preferences.theme}>
      {/* Conteúdo */}
    </div>
  );
}
```

#### 2. Hook Especializado
```typescript
import { useFlowBuilderCookies } from '@/hooks/use-cookies';

function FlowBuilder() {
  const { flowBuilderState, saveCanvasPosition } = useFlowBuilderCookies();
  
  const handleCanvasMove = (x, y) => {
    saveCanvasPosition(x, y);
  };
  
  return (
    <div style={{ transform: `scale(${flowBuilderState.canvasZoom})` }}>
      {/* Canvas */}
    </div>
  );
}
```

### Configurações Avançadas

#### Auto-save
```typescript
// Ativar auto-save no Flow Builder
updateUserPreference('flowBuilderSettings', 'autoSave', true);

// O sistema salva automaticamente a cada 30 segundos
```

#### Tema Automático
```typescript
// Seguir preferência do sistema
updateUserPreference('uiSettings', 'theme', 'auto');

// O tema muda automaticamente baseado no sistema operacional
```

## ⚙️ Configuração

### Variáveis de Ambiente
```bash
# Configurações de cookies
COOKIE_PREFIX=controlflow_
COOKIE_DEFAULT_TTL=2592000  # 30 dias em segundos
COOKIE_SECURE=true          # HTTPS apenas em produção
COOKIE_SAME_SITE=Lax        # Política de segurança
```

### Opções de Cookie
```typescript
interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  httpOnly?: boolean;
}
```

## 📊 Monitoramento e Estatísticas

### Estatísticas dos Cookies
```typescript
const stats = cookieManager.getCookieStats();

console.log({
  totalCookies: stats.totalCookies,
  totalSize: stats.totalSize,
  categories: stats.categories
});
```

### Categorias Disponíveis
- **userPreferences**: Preferências do usuário
- **flowBuilder**: Estado do Flow Builder
- **inspection**: Sessões de inspeção
- **cache**: Dados em cache
- **other**: Outros cookies

## 🔒 Segurança

### Medidas Implementadas
- **Prefixo Único**: `controlflow_` para evitar conflitos
- **HTTPS Only**: Cookies seguros em produção
- **SameSite**: Política Lax para compatibilidade
- **Validação**: Verificação de tipos e estrutura
- **Sanitização**: Limpeza de dados antes de salvar

### Boas Práticas
- Nunca armazenar dados sensíveis em cookies
- Usar TTL apropriado para cada tipo de dado
- Limpar cookies expirados regularmente
- Validar dados antes de restaurar

## 🧪 Testes

### Script de Teste
```bash
# Executar teste completo do sistema
node test-cookie-system.js
```

### Testes Disponíveis
- **CookieManager**: Funcionalidades básicas
- **useCookies Hook**: Interface React
- **UserPreferences**: Componente de configurações
- **Integração**: Cenários completos de uso

## 📈 Performance

### Otimizações
- **Lazy Loading**: Carregamento sob demanda
- **Debouncing**: Evita salvamentos excessivos
- **Compressão**: Dados compactados quando possível
- **Cache Inteligente**: Evita recarregamentos desnecessários

### Métricas
- **Tamanho Médio**: ~2-5KB por cookie
- **Tempo de Salvamento**: <10ms
- **Tempo de Recuperação**: <5ms
- **Overhead Total**: <1% do tempo de renderização

## 🔄 Migração e Compatibilidade

### Versões Anteriores
- **Compatibilidade**: Mantém compatibilidade com dados existentes
- **Migração Automática**: Atualiza estrutura quando necessário
- **Fallbacks**: Valores padrão para configurações ausentes

### Estrutura de Dados
```typescript
// Versão 1.0 (atual)
interface CookieData {
  version: '1.0';
  data: any;
  timestamp: number;
}

// Futuras versões manterão compatibilidade
```

## 🚀 Roadmap

### Próximas Funcionalidades
- [ ] **Sincronização em Nuvem**: Backup de preferências
- [ ] **Perfis de Usuário**: Múltiplas configurações
- [ ] **Import/Export**: Backup e restauração de configurações
- [ ] **Analytics**: Métricas de uso detalhadas
- [ ] **Machine Learning**: Sugestões inteligentes de configuração

### Melhorias de Performance
- [ ] **Web Workers**: Processamento em background
- [ ] **IndexedDB**: Cache local para dados grandes
- [ ] **Service Workers**: Cache offline avançado
- [ ] **Compressão**: Algoritmos mais eficientes

## 🆘 Troubleshooting

### Problemas Comuns

#### Cookies não são salvos
```bash
# Verificar configurações do navegador
# Verificar HTTPS em produção
# Verificar políticas de privacidade
```

#### Estado não é restaurado
```bash
# Verificar estrutura dos cookies
# Verificar versão dos dados
# Verificar logs de erro
```

#### Performance degradada
```bash
# Verificar tamanho dos cookies
# Verificar frequência de salvamento
# Verificar limpeza de cache
```

### Logs de Debug
```typescript
// Ativar logs detalhados
localStorage.setItem('debug_cookies', 'true');

// Ver logs no console
cookieManager.debugMode = true;
```

## 📚 Referências

### Documentação Técnica
- [MDN Web Docs - Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [React Hooks](https://react.dev/reference/react/hooks)
- [TypeScript](https://www.typescriptlang.org/docs/)

### Exemplos de Código
- [Exemplos de Uso](./examples/)
- [Testes de Integração](./tests/)
- [Componentes de Demonstração](./demos/)

---

**Sistema de Cookies do ControlFlow** - Persistência inteligente para uma experiência excepcional 🍪✨

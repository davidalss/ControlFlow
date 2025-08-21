# Correção da Sidebar - Tema Claro

## Problema Identificado

A sidebar estava com cores incorretas no tema claro, mantendo o fundo escuro mesmo quando o tema claro estava ativo, dificultando a leitura do texto.

## Correções Implementadas

### 1. Arquivo `client/src/styles/globals.css`

#### Problema:
- A classe `.ds-sidebar` tinha um background escuro fixo que não respeitava o tema
- O scroll da sidebar também estava com cores fixas para tema escuro

#### Solução:
```css
/* Antes - Background escuro fixo */
.ds-sidebar {
  background: linear-gradient(180deg, #374151 0%, #1f2937 100%) !important;
}

/* Depois - Background dinâmico baseado no tema */
.ds-sidebar {
  background-color: var(--color-sidebar) !important;
}

/* Tema claro - sidebar com cores claras */
:root .ds-sidebar {
  background: linear-gradient(180deg, #ffffff 0%, #f7f7f8 100%) !important;
  border-right: 1px solid #ececf1 !important;
  color: #0d0d0d !important;
}

/* Tema escuro - sidebar com cores escuras */
[data-theme="dark"] .ds-sidebar,
.dark .ds-sidebar {
  background: linear-gradient(180deg, #374151 0%, #1f2937 100%) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #ececf1 !important;
}
```

### 2. Scroll da Sidebar

#### Problema:
- O scroll da sidebar tinha cores fixas para tema escuro

#### Solução:
```css
/* Scroll para tema claro */
:root .ds-sidebar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2) !important;
}

/* Scroll para tema escuro */
[data-theme="dark"] .ds-sidebar::-webkit-scrollbar-thumb,
.dark .ds-sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2) !important;
}
```

### 3. Arquivo `client/src/components/Layout.tsx`

#### Problema:
- O header da sidebar tinha gradiente escuro fixo
- Os textos tinham cores fixas para tema escuro

#### Solução:
```tsx
// Header da sidebar - gradiente dinâmico
<div className="bg-gradient-to-r from-stone-100 via-stone-200 to-stone-300 dark:from-stone-800 dark:via-stone-900 dark:to-stone-950">

// Textos do header - cores dinâmicas
<h1 className="text-lg font-bold text-stone-800 dark:text-stone-100">ENSO</h1>
<p className="text-xs text-stone-600 dark:text-stone-300">Sistema de Qualidade</p>

// Botão de toggle - cores dinâmicas
<Button className="text-stone-600 hover:text-stone-800 hover:bg-stone-200/50 dark:text-stone-300 dark:hover:text-stone-100 dark:hover:bg-stone-700/50">
```

### 4. Correções Adicionais para Navegação

#### Problema:
- Os itens de navegação tinham cores que não funcionavam bem no tema claro

#### Solução:
```css
/* Correções específicas para tema claro */
:root .sidebar-responsive nav {
  color: #0d0d0d !important;
}

:root .sidebar-responsive .text-stone-700 {
  color: #0d0d0d !important;
}

/* Correções específicas para tema escuro */
[data-theme="dark"] .sidebar-responsive nav,
.dark .sidebar-responsive nav {
  color: #ececf1 !important;
}
```

## Resultado

Agora a sidebar funciona corretamente em ambos os temas:

### Tema Claro:
- Fundo: Gradiente claro (#ffffff → #f7f7f8)
- Texto: Escuro (#0d0d0d)
- Bordas: Cinza claro (#ececf1)
- Scroll: Cinza escuro transparente

### Tema Escuro:
- Fundo: Gradiente escuro (#374151 → #1f2937)
- Texto: Claro (#ececf1)
- Bordas: Branco transparente
- Scroll: Branco transparente

## Arquivos Modificados

1. `client/src/styles/globals.css` - Correções principais da sidebar
2. `client/src/components/Layout.tsx` - Correções do header da sidebar

## Teste

Para testar as correções:
1. Acesse a aplicação
2. Alterne entre tema claro e escuro
3. Verifique se a sidebar muda de cor corretamente
4. Confirme se o texto é legível em ambos os temas

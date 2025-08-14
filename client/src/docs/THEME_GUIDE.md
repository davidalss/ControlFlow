# Guia do Sistema de Temas - QualiHUB

## 🎨 Visão Geral

O QualiHUB agora possui um sistema de temas completo que permite alternar entre modo claro e escuro, com paletas de cores harmonizadas e animações suaves.

## 🌟 Paletas de Cores

### Modo Escuro
- **Fundo**: Gradiente `from-slate-950 via-slate-900 via-slate-850 via-slate-800 to-slate-750`
- **Cards**: `bg-slate-900/95`, `bg-slate-800/90`, `bg-slate-800/60`
- **Inputs**: `bg-slate-800/60`, `border-slate-700`, `text-slate-100`
- **Botões**: `from-slate-700 to-slate-800`, `text-slate-300`
- **Textos**: `text-slate-100`, `text-slate-300`, `text-slate-400`, `text-slate-500`

### Modo Claro
- **Fundo**: Gradiente `from-gray-100 via-slate-100 via-slate-200 via-slate-300 to-slate-400`
- **Cards**: `bg-white/85`, `bg-gray-100/75`, `bg-slate-100/65`
- **Inputs**: `bg-white/75`, `border-gray-300`, `text-slate-800`
- **Botões**: `from-slate-500 to-slate-600`, `text-slate-600`
- **Textos**: `text-slate-800`, `text-slate-600`, `text-slate-500`, `text-slate-400`

## 🎯 Classes CSS Disponíveis

### Backgrounds
```css
.theme-gradient-primary    /* Gradiente principal do tema */
.theme-card-primary        /* Card principal */
.theme-card-secondary      /* Card secundário */
```

### Inputs
```css
.theme-input              /* Estilo completo para inputs */
```

### Botões
```css
.theme-button-primary      /* Botão primário */
.theme-button-secondary    /* Botão secundário */
```

### Textos
```css
.theme-text-primary        /* Texto principal */
.theme-text-secondary      /* Texto secundário */
.theme-text-tertiary       /* Texto terciário */
.theme-text-muted          /* Texto mudo */
```

### Bordas
```css
.theme-border-primary      /* Borda primária */
.theme-border-secondary    /* Borda secundária */
```

### Sombras
```css
.theme-shadow-sm          /* Sombra pequena */
.theme-shadow-md          /* Sombra média */
.theme-shadow-lg          /* Sombra grande */
```

## 🔧 Como Usar

### 1. Importar o Hook
```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { isDark, toggleTheme } = useTheme();
  // ...
}
```

### 2. Aplicar Classes CSS
```tsx
<div className="theme-card-primary theme-text-primary">
  <h1 className="theme-text-primary">Título</h1>
  <input className="theme-input" />
  <button className="theme-button-primary">Ação</button>
</div>
```

### 3. Usar o Botão de Tema
```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

<ThemeToggle size="md" />
```

## 🎨 Animações

### Modo Escuro
- Orbs flutuantes com tons de slate
- Partículas com opacidade 10%
- Grid pattern com opacidade 20%

### Modo Claro
- Orbs flutuantes com tons mais suaves
- Partículas com opacidade 8%
- Grid pattern com opacidade 15%
- Ondas sutis e pontos flutuantes exclusivos

## 📱 Responsividade

O sistema de temas é totalmente responsivo e funciona em:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🔄 Transições

Todas as mudanças de tema incluem:
- Transições suaves (300ms)
- Animações de entrada/saída
- Efeitos de hover adaptativos
- Feedback visual imediato

## 🎯 Boas Práticas

1. **Sempre use as classes de tema** em vez de cores hardcoded
2. **Teste em ambos os temas** antes de finalizar
3. **Mantenha o contraste** adequado para acessibilidade
4. **Use animações sutis** para não distrair
5. **Considere a performance** ao adicionar animações

## 🚀 Exemplo Completo

```tsx
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ExamplePage() {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen theme-gradient-primary p-6">
      {/* Header */}
      <div className="theme-card-primary theme-shadow-md rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold theme-text-primary">
            Página de Exemplo
          </h1>
          <ThemeToggle size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="theme-card-secondary theme-shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold theme-text-secondary mb-4">
            Seção 1
          </h2>
          <p className="theme-text-tertiary">
            Conteúdo com tema adaptativo
          </p>
        </div>

        <div className="theme-card-secondary theme-shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold theme-text-secondary mb-4">
            Seção 2
          </h2>
          <input 
            className="theme-input w-full p-3 rounded-lg mb-4"
            placeholder="Input com tema"
          />
          <button className="theme-button-primary px-4 py-2 rounded-lg">
            Botão com Tema
          </button>
        </div>
      </div>
    </div>
  );
}
```

## 🎨 Personalização

Para adicionar novas cores ou modificar o tema:

1. Edite `src/styles/theme.ts`
2. Adicione as classes CSS em `src/styles/globals.css`
3. Teste em ambos os temas
4. Atualize a documentação

---

**Desenvolvido com ❤️ para o QualiHUB**

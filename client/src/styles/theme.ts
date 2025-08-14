export const themeConfig = {
  dark: {
    // Background gradients
    primary: 'from-slate-950 via-slate-900 via-slate-850 via-slate-800 to-slate-750',
    secondary: 'from-slate-900 via-slate-850 to-slate-950',
    
    // Card backgrounds
    card: {
      primary: 'bg-slate-900/95',
      secondary: 'bg-slate-800/90',
      tertiary: 'bg-slate-800/60'
    },
    
    // Input fields
    input: {
      background: 'bg-slate-800/60',
      border: 'border-slate-700',
      focus: 'focus:border-slate-600 focus:ring-slate-600/20',
      text: 'text-slate-100',
      placeholder: 'placeholder-slate-400'
    },
    
    // Buttons
    button: {
      primary: 'from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900',
      secondary: 'border-slate-700 hover:bg-slate-800 hover:border-slate-600',
      text: 'text-slate-300'
    },
    
    // Text colors
    text: {
      primary: 'text-slate-100',
      secondary: 'text-slate-300',
      tertiary: 'text-slate-400',
      muted: 'text-slate-500'
    },
    
    // Borders
    border: {
      primary: 'border-slate-700',
      secondary: 'border-slate-600',
      tertiary: 'border-slate-500'
    },
    
    // Shadows
    shadow: {
      sm: 'shadow-slate-900/20',
      md: 'shadow-slate-900/30',
      lg: 'shadow-slate-900/40'
    }
  },
  
  light: {
    // Background gradients
    primary: 'from-gray-100 via-slate-100 via-slate-200 via-slate-300 to-slate-400',
    secondary: 'from-slate-100 via-slate-200 to-slate-400',
    
    // Card backgrounds
    card: {
      primary: 'bg-white/85',
      secondary: 'bg-gray-100/75',
      tertiary: 'bg-slate-100/65'
    },
    
    // Input fields
    input: {
      background: 'bg-white/75',
      border: 'border-gray-300',
      focus: 'focus:border-slate-400 focus:ring-slate-400/20',
      text: 'text-slate-800',
      placeholder: 'placeholder-slate-500'
    },
    
    // Buttons
    button: {
      primary: 'from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700',
      secondary: 'border-gray-200 hover:bg-gray-50 hover:border-slate-300',
      text: 'text-slate-600'
    },
    
    // Text colors
    text: {
      primary: 'text-slate-800',
      secondary: 'text-slate-600',
      tertiary: 'text-slate-500',
      muted: 'text-slate-400'
    },
    
    // Borders
    border: {
      primary: 'border-gray-300',
      secondary: 'border-slate-400',
      tertiary: 'border-slate-500'
    },
    
    // Shadows
    shadow: {
      sm: 'shadow-gray-200/15',
      md: 'shadow-gray-200/25',
      lg: 'shadow-gray-200/35'
    }
  }
};

export type ThemeMode = 'dark' | 'light';
export type ThemeConfig = typeof themeConfig;

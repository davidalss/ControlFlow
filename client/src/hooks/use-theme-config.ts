import { useTheme } from '@/contexts/ThemeContext';
import { themeConfig } from '@/styles/theme';

export const useThemeConfig = () => {
  const { isDark } = useTheme();
  const theme = isDark ? 'dark' : 'light';
  
  return {
    theme,
    isDark,
    config: themeConfig[theme],
    colors: themeConfig[theme]
  };
};

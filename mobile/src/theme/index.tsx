import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { useState, createContext, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { designSystem, darkDesignSystem } from './designSystem';

// Exportations individuelles pour faciliter l'import
export { colors, spacing, typography };

// Constantes d'application
export const appConstants = {
  // Animations
  animations: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },

  // Dimensions
  dimensions: {
    screenPadding: spacing.screenPadding,
    cardPadding: spacing.cardPadding,
    buttonHeight: 48,
    inputHeight: 48,
    borderRadius: spacing.borderRadius.md,
  },

  // Ombres
  shadows: {
    small: {
      shadowColor: colors.app.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    medium: {
      shadowColor: colors.app.cardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    large: {
      shadowColor: colors.app.cardShadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 12,
    },
  },

  // Gradients
  gradients: {
    primary: [colors.app.gradientStart, colors.app.gradientEnd],
    secondary: [colors.secondary[400], colors.secondary[600]],
    success: [colors.success[400], colors.success[600]],
    warning: [colors.warning[400], colors.warning[600]],
    error: [colors.error[400], colors.error[600]],
  },
};

export const ThemeContext = createContext({
  mode: 'light',
  setMode: (mode: 'light' | 'dark') => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    AsyncStorage.getItem('themeMode').then((saved) => {
      if (saved === 'dark' || saved === 'light') setModeState(saved);
    });
  }, []);

  const setMode = (newMode: 'light' | 'dark') => {
    setModeState(newMode);
    AsyncStorage.setItem('themeMode', newMode);
  };

  const value = { mode, setMode };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const { mode } = useContext(ThemeContext);
  return mode === 'dark' ? darkDesignSystem : designSystem;
}

export function useThemeMode() {
  const { mode, setMode } = useContext(ThemeContext);
  return { mode, setMode };
}

export default designSystem;

import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

// Système de design unifié pour éliminer les redondances
export const designSystem = {
  // Couleurs sémantiques (remplace les couleurs hardcodées)
  semantic: {
    primary: colors.secondary[500], // #00B8D9
    secondary: colors.primary[500], // #1890FF
    success: colors.success[500],   // #52C41A
    warning: colors.warning[500],   // #FAAD14
    error: colors.error[500],       // #F5222D
    info: colors.primary[400],      // #40A9FF
  },

  // Couleurs de fond standardisées
  background: {
    primary: colors.background.primary,    // #FFFFFF
    secondary: colors.background.secondary, // #F8FAFC
    tertiary: colors.background.tertiary,  // #F1F5F9
    overlay: colors.app.overlay,           // rgba(0, 0, 0, 0.5)
  },

  // Couleurs de texte standardisées
  text: {
    primary: colors.text.primary,     // #1E293B
    secondary: colors.text.secondary, // #64748B
    tertiary: colors.text.tertiary,   // #94A3B8
    inverse: colors.text.inverse,     // #FFFFFF
    disabled: colors.text.disabled,   // #CBD5E1
  },

  // Couleurs d'état
  state: {
    available: colors.success[500],   // #52C41A
    busy: colors.error[500],          // #F5222D
    pending: colors.warning[500],     // #FAAD14
    offline: colors.neutral[400],     // #BFBFBF
  },

  // Couleurs d'urgence
  urgency: {
    high: colors.error[500],    // #F5222D
    medium: colors.warning[500], // #FAAD14
    low: colors.success[500],    // #52C41A
  },

  // Couleurs de matching
  matching: {
    excellent: colors.success[500], // #52C41A (90-100%)
    good: colors.warning[500],      // #FAAD14 (80-89%)
    average: colors.neutral[500],   // #8C8C8C (70-79%)
    poor: colors.error[500],        // #F5222D (<70%)
  },

  // Ombres standardisées
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

  // Bordures standardisées
  borders: {
    radius: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      full: 9999,
    },
    width: {
      thin: 1,
      normal: 2,
      thick: 3,
    },
    color: {
      light: colors.border.light,
      medium: colors.border.medium,
      dark: colors.border.dark,
    },
  },

  // Espacements standardisés
  spacing: {
    xs: spacing.xs,    // 4
    sm: spacing.sm,    // 8
    md: spacing.md,    // 12
    lg: spacing.lg,    // 16
    xl: spacing.xl,    // 20
    xxl: spacing.xxl,  // 24
    xxxl: spacing.xxxl, // 32
  },

  // Typographie standardisée
  typography: {
    sizes: {
      xs: typography.fontSize.xs,    // 12
      sm: typography.fontSize.sm,    // 14
      md: typography.fontSize.md,    // 16
      lg: typography.fontSize.lg,    // 18
      xl: typography.fontSize.xl,    // 20
      xxl: typography.fontSize.xxl,  // 24
      xxxl: typography.fontSize.xxxl, // 32
    },
    weights: {
      normal: typography.fontWeight.normal,
      medium: typography.fontWeight.medium,
      semibold: typography.fontWeight.semibold,
      bold: typography.fontWeight.bold,
    },
  },

  // Dimensions standardisées
  dimensions: {
    button: {
      height: {
        small: 36,
        medium: 44,
        large: 52,
      },
      padding: {
        horizontal: {
          small: spacing.md,
          medium: spacing.lg,
          large: spacing.xl,
        },
        vertical: {
          small: spacing.sm,
          medium: spacing.md,
          large: spacing.lg,
        },
      },
    },
    input: {
      height: 48,
      padding: spacing.md,
    },
    card: {
      padding: spacing.lg,
      borderRadius: spacing.borderRadius.md,
    },
    avatar: {
      small: 32,
      medium: 48,
      large: 64,
      xlarge: 80,
    },
  },

  // Animations standardisées
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
};

// Utilitaires pour les couleurs
export const getUrgencyColor = (urgency: 'high' | 'medium' | 'low') => {
  return designSystem.urgency[urgency];
};

export const getMatchingColor = (score: number) => {
  if (score >= 90) return designSystem.matching.excellent;
  if (score >= 80) return designSystem.matching.good;
  if (score >= 70) return designSystem.matching.average;
  return designSystem.matching.poor;
};

export const getStateColor = (state: 'available' | 'busy' | 'pending' | 'offline') => {
  return designSystem.state[state];
};

// Utilitaires pour les styles
export const createCardStyle = (variant: 'default' | 'elevated' | 'outlined' = 'default') => {
  const baseStyle = {
    backgroundColor: designSystem.background.primary,
    borderRadius: designSystem.borders.radius.md,
    padding: designSystem.dimensions.card.padding,
  };

  switch (variant) {
    case 'elevated':
      return { ...baseStyle, ...designSystem.shadows.medium };
    case 'outlined':
      return {
        ...baseStyle,
        borderWidth: designSystem.borders.width.thin,
        borderColor: designSystem.borders.color.light,
      };
    default:
      return { ...baseStyle, ...designSystem.shadows.small };
  }
};

export const createButtonStyle = (
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger',
  size: 'small' | 'medium' | 'large' = 'medium',
  disabled: boolean = false
) => {
  const baseStyle = {
    height: designSystem.dimensions.button.height[size],
    paddingHorizontal: designSystem.dimensions.button.padding.horizontal[size],
    paddingVertical: designSystem.dimensions.button.padding.vertical[size],
    borderRadius: designSystem.borders.radius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
  };

  if (disabled) {
    return {
      ...baseStyle,
      backgroundColor: designSystem.borders.color.light,
      opacity: 0.6,
    };
  }

  switch (variant) {
    case 'primary':
      return { ...baseStyle, backgroundColor: designSystem.semantic.primary };
    case 'secondary':
      return { ...baseStyle, backgroundColor: designSystem.semantic.secondary };
    case 'outline':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: designSystem.borders.width.thin,
        borderColor: designSystem.semantic.primary,
      };
    case 'ghost':
      return { ...baseStyle, backgroundColor: 'transparent' };
    case 'danger':
      return { ...baseStyle, backgroundColor: designSystem.semantic.error };
    default:
      return baseStyle;
  }
};

export const darkColors = {
  ...colors,
  background: {
    primary: '#20232a',
    secondary: '#23272f',
    tertiary: '#262a33',
    dark: '#18181b',
  },
  text: {
    primary: '#f4f4f5',
    secondary: '#b3b8c5',
    tertiary: '#8a8f9c',
    inverse: '#23232a',
    disabled: '#52525b',
  },
  border: {
    light: '#2d313a',
    medium: '#3f3f46',
    dark: '#52525b',
  },
  app: {
    ...colors.app,
    cardShadow: 'rgba(0,0,0,0.18)',
    overlay: 'rgba(0,0,0,0.7)',
  },
};

export const darkDesignSystem = {
  ...designSystem,
  colors: darkColors,
  background: {
    ...designSystem.background,
    primary: darkColors.background.primary,
    secondary: darkColors.background.secondary,
    tertiary: darkColors.background.tertiary,
    overlay: darkColors.app.overlay,
  },
  text: darkColors.text,
  borders: {
    ...designSystem.borders,
    color: darkColors.border,
  },
};

export default designSystem;

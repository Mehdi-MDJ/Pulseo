export const spacing = {
  // Espacement de base (4px)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,

  // Espacement spécifique
  screenPadding: 20,
  cardPadding: 16,
  buttonPadding: 12,
  inputPadding: 16,

  // Marges
  margin: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  // Padding
  padding: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  // Rayons de bordure
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
};

export type SpacingScheme = typeof spacing;

export const colors = {
  // Couleurs principales (cohérentes avec le web)
  primary: {
    50: '#E6F7FF',
    100: '#BAE7FF',
    200: '#91D5FF',
    300: '#69C0FF',
    400: '#40A9FF',
    500: '#1890FF',
    600: '#096DD9',
    700: '#0050B3',
    800: '#003A8C',
    900: '#002766',
  },

  // Couleurs secondaires (turquoise pour différenciation)
  secondary: {
    50: '#E6FFFB',
    100: '#B5F5EC',
    200: '#87E8DE',
    300: '#5CDBD3',
    400: '#36CFC9',
    500: '#00B8D9', // Couleur principale de l'app
    600: '#08979C',
    700: '#006D75',
    800: '#00474F',
    900: '#002329',
  },

  // Couleurs de succès
  success: {
    50: '#F6FFED',
    100: '#D9F7BE',
    200: '#B7EB8F',
    300: '#95DE64',
    400: '#73D13D',
    500: '#52C41A',
    600: '#389E0D',
    700: '#237804',
    800: '#135200',
    900: '#092B00',
  },

  // Couleurs d'avertissement
  warning: {
    50: '#FFFBE6',
    100: '#FFF1B8',
    200: '#FFE58F',
    300: '#FFD666',
    400: '#FFC53D',
    500: '#FAAD14',
    600: '#D48806',
    700: '#AD6800',
    800: '#874D00',
    900: '#613400',
  },

  // Couleurs d'erreur
  error: {
    50: '#FFF2F0',
    100: '#FFCCC7',
    200: '#FFA39E',
    300: '#FF7875',
    400: '#FF4D4F',
    500: '#F5222D',
    600: '#CF1322',
    700: '#A8071A',
    800: '#820014',
    900: '#5C0011',
  },

  // Couleurs neutres
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#F0F0F0',
    300: '#D9D9D9',
    400: '#BFBFBF',
    500: '#8C8C8C',
    600: '#595959',
    700: '#434343',
    800: '#262626',
    900: '#1F1F1F',
  },

  // Couleurs de fond
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    dark: '#0F172A',
  },

  // Couleurs de texte
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    tertiary: '#94A3B8',
    inverse: '#FFFFFF',
    disabled: '#CBD5E1',
  },

  // Couleurs de bordure
  border: {
    light: '#E2E8F0',
    medium: '#CBD5E1',
    dark: '#94A3B8',
  },

  // Couleurs spéciales pour l'app
  app: {
    gradientStart: '#00B8D9',
    gradientEnd: '#1890FF',
    cardShadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
};

export type ColorScheme = typeof colors;

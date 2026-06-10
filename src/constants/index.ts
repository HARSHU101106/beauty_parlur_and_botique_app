// Centralised design system for BeautyApp.
// Palette is intentionally soft, warm and playful to appeal to women & kids,
// while keeping a polished, premium feel for the boutique side.

export const COLORS = {
  // Primary – warm rose / blush (feminine, inviting)
  primary: '#F4519A',
  primaryDark: '#D6357E',
  primaryLight: '#FFC2DD',
  primarySoft: '#FFF0F6',

  // Secondary – playful lavender (loved by kids, elegant for women)
  secondary: '#A66CFF',
  secondaryDark: '#8A4DEC',
  secondaryLight: '#E7D8FF',
  secondarySoft: '#F5EEFF',

  // Admin – deep plum (kept distinct from the customer experience)
  admin: '#6B2F8A',
  adminDark: '#542373',
  adminLight: '#C9A9DE',

  // Cheerful accent set for chips, badges & illustrations
  accentPeach: '#FF9E80',
  accentMint: '#3FD1A8',
  accentSky: '#5FC6FF',
  accentSunny: '#FFD166',
  accentCoral: '#FF7A8A',

  // Neutrals
  background: '#FFFFFF',
  surface: '#FFF7FB',
  surfaceAlt: '#F6F1FB',
  card: '#FFFFFF',
  text: '#241A2E',
  textMuted: '#7A7287',
  border: '#F1E2EC',

  // Status
  error: '#E5484D',
  success: '#16A34A',
  warning: '#F59E0B',
  info: '#2563EB',

  white: '#FFFFFF',
  black: '#000000',
};

// Gradient stops (use with expo-linear-gradient `colors` prop).
export const GRADIENTS = {
  primary: ['#FF9CC6', '#F4519A', '#D6357E'] as const,
  lavender: ['#B98CFF', '#A66CFF', '#8A4DEC'] as const,
  sunset: ['#FFB199', '#FF7A8A', '#F4519A'] as const,
  candy: ['#FFC3E1', '#E7D8FF'] as const,
  admin: ['#8E4FB0', '#6B2F8A', '#542373'] as const,
  mint: ['#6FE3C2', '#3FD1A8'] as const,
};

// Reusable elevation presets (iOS shadow + Android elevation).
export const SHADOWS = {
  sm: {
    shadowColor: '#9B2C66',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#9B2C66',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#5B1A45',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 9,
  },
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  radius: 16,
  radiusLg: 24,
  radiusFull: 999,
};

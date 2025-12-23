// Design System Tokens for RemindWell
// Consistent design values across the application

export const colors = {
  // Primary Colors - Purple/Indigo gradient theme
  primary: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6', // Main primary - Vibrant purple
    600: '#7C3AED', // Hover state
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },

  // Accent Colors
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },

  warning: {
    50: '#FEF3C7',
    100: '#FDE68A',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },

  error: {
    50: '#FEE2E2',
    100: '#FECACA',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },

  info: {
    50: '#E0F2FE',
    100: '#BAE6FD',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
  },

  // Neutral Colors
  gray: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
  },

  // Semantic Colors
  background: '#FFFFFF',
  foreground: '#18181B',
  muted: '#FAFAFA',
  border: '#E4E4E7',
} as const;

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['ui-monospace', 'monospace'],
  },

  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },

  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

export const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
  '4xl': '6rem',  // 96px
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  none: 'none',
} as const;

export const animation = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Component-specific tokens
export const components = {
  button: {
    height: {
      sm: '2.25rem',   // 36px
      base: '2.5rem',  // 40px
      lg: '2.75rem',   // 44px
    },
    padding: {
      sm: '0.5rem 1rem',
      base: '0.625rem 1.25rem',
      lg: '0.75rem 1.5rem',
    },
  },

  input: {
    height: '2.5rem', // 40px
    padding: '0.5rem 0.75rem',
  },

  card: {
    padding: '1.5rem', // 24px
    borderRadius: borderRadius.lg,
  },

  modal: {
    padding: '1.5rem', // 24px
    maxWidth: '28rem', // 448px
  },

  avatar: {
    size: {
      sm: '2rem',    // 32px
      base: '2.5rem', // 40px
      lg: '3rem',    // 48px
      xl: '4rem',    // 64px
    },
  },
} as const;

// Helper function to get color value
export function getColor(path: string): string {
  const parts = path.split('.');
  let value: any = colors;

  for (const part of parts) {
    value = value[part];
    if (value === undefined) return path;
  }

  return value;
}

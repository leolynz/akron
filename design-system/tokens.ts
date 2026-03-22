// Design System — Single Source of Truth
// REGRA: nunca usar hex hardcoded nos componentes. Sempre tokens semânticos.

export interface DesignTokens {
  colors: {
    primary: string
    primaryForeground: string
    primaryHover: string
    accent: string
    accentForeground: string
    accentHover: string
    background: string
    foreground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    muted: string
    mutedForeground: string
    border: string
    input: string
    ring: string
    destructive: string
    destructiveForeground: string
    warning: string
    warningForeground: string
    success: string
    successForeground: string
    // Severity colors for alerts
    severityHigh: string
    severityMedium: string
    severityLow: string
  }
  sidebar: {
    background: string
    foreground: string
    border: string
    accent: string
    accentForeground: string
    width: string
  }
  radius: {
    sm: string
    md: string
    lg: string
    xl: string
    full: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
  }
  typography: {
    fontSans: string
    fontMono: string
    sizeXs: string
    sizeSm: string
    sizeBase: string
    sizeLg: string
    sizeXl: string
    size2xl: string
    size3xl: string
    size4xl: string
    weightNormal: string
    weightMedium: string
    weightSemibold: string
    weightBold: string
    lineHeightTight: string
    lineHeightNormal: string
    lineHeightRelaxed: string
  }
}

export const tokens: DesignTokens = {
  colors: {
    // Primary — azul dados/performance
    primary: '#1D4ED8',
    primaryForeground: '#FFFFFF',
    primaryHover: '#1e40af',
    // Accent — verde performance positiva/otimização
    accent: '#10B981',
    accentForeground: '#FFFFFF',
    accentHover: '#059669',
    // Backgrounds
    background: '#F9FAFB',
    foreground: '#111827',
    card: '#FFFFFF',
    cardForeground: '#111827',
    popover: '#FFFFFF',
    popoverForeground: '#111827',
    // Neutral
    muted: '#F3F4F6',
    mutedForeground: '#6B7280',
    border: '#E5E7EB',
    input: '#E5E7EB',
    ring: '#1D4ED8',
    // Semantic
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    warning: '#F59E0B',
    warningForeground: '#FFFFFF',
    success: '#10B981',
    successForeground: '#FFFFFF',
    // Alert severity
    severityHigh: '#EF4444',
    severityMedium: '#F59E0B',
    severityLow: '#6B7280',
  },
  sidebar: {
    background: '#1E293B',
    foreground: '#F1F5F9',
    border: '#334155',
    accent: '#1D4ED8',
    accentForeground: '#FFFFFF',
    width: '16rem',
  },
  radius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  typography: {
    fontSans: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
    fontMono: 'var(--font-geist-mono), ui-monospace, monospace',
    sizeXs: '0.75rem',
    sizeSm: '0.875rem',
    sizeBase: '1rem',
    sizeLg: '1.125rem',
    sizeXl: '1.25rem',
    size2xl: '1.5rem',
    size3xl: '1.875rem',
    size4xl: '2.25rem',
    weightNormal: '400',
    weightMedium: '500',
    weightSemibold: '600',
    weightBold: '700',
    lineHeightTight: '1.25',
    lineHeightNormal: '1.5',
    lineHeightRelaxed: '1.75',
  },
}

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
    // Primary — azul royal (referência dashboard)
    primary: '#2563EB',
    primaryForeground: '#FFFFFF',
    primaryHover: '#1D4ED8',
    // Accent — verde sucesso/positivo
    accent: '#22C55E',
    accentForeground: '#FFFFFF',
    accentHover: '#16A34A',
    // Backgrounds — dark navy profundo
    background: '#0A0D1A',
    foreground: '#F1F5F9',
    card: '#111827',
    cardForeground: '#F1F5F9',
    popover: '#111827',
    popoverForeground: '#F1F5F9',
    // Neutral
    muted: '#1E293B',
    mutedForeground: '#94A3B8',
    border: '#1E293B',
    input: '#1E293B',
    ring: '#2563EB',
    // Semantic
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    warning: '#F59E0B',
    warningForeground: '#FFFFFF',
    success: '#22C55E',
    successForeground: '#FFFFFF',
    // Alert severity
    severityHigh: '#EF4444',
    severityMedium: '#F59E0B',
    severityLow: '#94A3B8',
  },
  sidebar: {
    background: '#080B17',
    foreground: '#E2E8F0',
    border: '#1A2235',
    accent: '#2563EB',
    accentForeground: '#FFFFFF',
    width: '15rem',
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

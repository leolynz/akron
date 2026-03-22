import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { tokens } from '../../design-system/tokens'

const meta: Meta = {
  title: 'Design System/Color Palette',
  parameters: {
    layout: 'padded',
  },
}

export default meta

function Swatch({ name, value, cssVar }: { name: string; value: string; cssVar: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '140px' }}>
      <div
        style={{
          width: '100%',
          height: '64px',
          borderRadius: '8px',
          background: value,
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      />
      <div style={{ color: 'var(--color-foreground)', fontSize: '12px', fontWeight: 600 }}>{name}</div>
      <div style={{ color: 'var(--color-muted-foreground)', fontSize: '11px', fontFamily: 'monospace' }}>{value}</div>
      <div style={{ color: 'var(--color-muted-foreground)', fontSize: '10px', fontFamily: 'monospace', opacity: 0.7 }}>
        {cssVar}
      </div>
    </div>
  )
}

function toKebab(str: string) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

export const Colors: StoryObj = {
  render: () => (
    <div style={{ background: 'var(--color-background)', padding: '32px', minHeight: '100vh' }}>
      <h1 style={{ color: 'var(--color-foreground)', marginBottom: '8px', fontSize: '24px', fontWeight: 700 }}>
        Color Palette
      </h1>
      <p style={{ color: 'var(--color-muted-foreground)', marginBottom: '40px', fontSize: '14px' }}>
        Todas as cores do design system — extraídas de <code>design-system/tokens.ts</code>
      </p>

      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ color: 'var(--color-foreground)', marginBottom: '24px', fontSize: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Brand
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          {(['primary', 'primaryForeground', 'primaryHover', 'accent', 'accentForeground', 'accentHover'] as const).map((key) => (
            <Swatch key={key} name={key} value={tokens.colors[key]} cssVar={`--color-${toKebab(key)}`} />
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ color: 'var(--color-foreground)', marginBottom: '24px', fontSize: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Backgrounds & Surfaces
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          {(['background', 'foreground', 'card', 'cardForeground', 'popover', 'popoverForeground'] as const).map((key) => (
            <Swatch key={key} name={key} value={tokens.colors[key]} cssVar={`--color-${toKebab(key)}`} />
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ color: 'var(--color-foreground)', marginBottom: '24px', fontSize: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Neutral
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          {(['muted', 'mutedForeground', 'border', 'input', 'ring'] as const).map((key) => (
            <Swatch key={key} name={key} value={tokens.colors[key]} cssVar={`--color-${toKebab(key)}`} />
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ color: 'var(--color-foreground)', marginBottom: '24px', fontSize: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Semantic
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          {(['destructive', 'destructiveForeground', 'warning', 'warningForeground', 'success', 'successForeground'] as const).map((key) => (
            <Swatch key={key} name={key} value={tokens.colors[key]} cssVar={`--color-${toKebab(key)}`} />
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ color: 'var(--color-foreground)', marginBottom: '24px', fontSize: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Alert Severity
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          {(['severityHigh', 'severityMedium', 'severityLow'] as const).map((key) => (
            <Swatch key={key} name={key} value={tokens.colors[key]} cssVar={`--color-${toKebab(key)}`} />
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ color: 'var(--color-foreground)', marginBottom: '24px', fontSize: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Sidebar
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          {(Object.entries(tokens.sidebar) as [string, string][])
            .filter(([, v]) => v.startsWith('#'))
            .map(([key, value]) => (
              <Swatch key={key} name={key} value={value} cssVar={`--sidebar-${toKebab(key)}`} />
            ))}
        </div>
      </section>
    </div>
  ),
}

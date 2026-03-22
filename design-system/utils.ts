// Design System Utils — CSS variable helpers

/**
 * Converts a token key to a CSS variable name.
 * e.g. "primary" → "var(--color-primary)"
 */
export function tokenKeyToCssVar(key: string): string {
  const kebab = key.replace(/([A-Z])/g, '-$1').toLowerCase()
  return `var(--color-${kebab})`
}

/**
 * Converts a sidebar token key to a CSS variable name.
 * e.g. "background" → "var(--sidebar-background)"
 */
export function sidebarKeyToCssVar(key: string): string {
  const kebab = key.replace(/([A-Z])/g, '-$1').toLowerCase()
  return `var(--sidebar-${kebab})`
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, GitBranch, Users, ScrollText, LayoutDashboard, Settings, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/alerts', label: 'Feed Sentinela', icon: Bell },
  { href: '/app/clusters', label: 'Clusters', icon: GitBranch },
  { href: '/app/clients', label: 'Clientes', icon: Users },
  { href: '/app/logs', label: 'Log de Execução', icon: ScrollText },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="flex flex-col h-screen border-r"
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--sidebar-background)',
        borderColor: 'var(--sidebar-border)',
        color: 'var(--sidebar-foreground)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)]"
          style={{ background: 'var(--color-primary)' }}
        >
          <Zap className="h-4 w-4" style={{ color: 'var(--color-primary-foreground)' }} />
        </div>
        <span className="text-[length:var(--typography-size-lg)] font-[var(--typography-weight-bold)]">
          Akron
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[length:var(--typography-size-sm)] transition-colors',
                active
                  ? 'font-[var(--typography-weight-medium)]'
                  : 'opacity-70 hover:opacity-100'
              )}
              style={
                active
                  ? { background: 'var(--sidebar-accent)', color: 'var(--sidebar-accent-foreground)' }
                  : {}
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Settings */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
        <Link
          href="/settings/billing"
          className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[length:var(--typography-size-sm)] opacity-70 hover:opacity-100 transition-colors"
        >
          <Settings className="h-4 w-4 shrink-0" />
          Configurações
        </Link>
      </div>
    </aside>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Bell, Plug, Users, ScrollText,
  Settings, Zap, Target, Lightbulb, LayoutList, FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

interface NavGroup {
  label?: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    items: [
      { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Performance',
    items: [
      { href: '/app/alerts', label: 'Insights', icon: Bell },
      { href: '/app/otimizacoes', label: 'Otimizações', icon: Lightbulb },
      { href: '/app/visao-unificada', label: 'Visão Unificada', icon: LayoutList },
      { href: '/app/clusters', label: 'Grupos (Clusters)', icon: Target },
      { href: '/app/logs', label: 'Log de Execução', icon: ScrollText },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { href: '/app/clients', label: 'Clientes', icon: Users },
      { href: '/app/integrations', label: 'Integrações', icon: Plug },
      { href: '/app/relatorios', label: 'Relatórios', icon: FileText },
    ],
  },
]

const bottomItems: NavItem[] = [
  { href: '/settings/billing', label: 'Configurações', icon: Settings },
]

function NavLink({ href, label, icon: Icon }: NavItem) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={cn(
        'relative flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-[length:var(--typography-size-sm)] transition-all',
        active
          ? 'font-[var(--typography-weight-medium)]'
          : 'opacity-60 hover:opacity-90 hover:bg-white/5'
      )}
      style={active ? { color: '#FFFFFF', background: 'rgba(37,99,235,0.15)' } : { color: 'var(--sidebar-foreground)' }}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
          style={{ background: 'var(--sidebar-accent)' }}
        />
      )}
      <Icon className="h-4 w-4 shrink-0" style={active ? { color: 'var(--sidebar-accent)' } : {}} />
      {label}
    </Link>
  )
}

export function Sidebar() {
  return (
    <aside
      className="flex flex-col h-screen border-r shrink-0"
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--sidebar-background)',
        borderColor: 'var(--sidebar-border)',
        color: 'var(--sidebar-foreground)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)]"
          style={{ background: 'var(--sidebar-accent)' }}
        >
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="text-[length:var(--typography-size-base)] font-[var(--typography-weight-bold)] text-white">
          Akron
        </span>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {navGroups.map((group, i) => (
          <div key={i} className="space-y-0.5">
            {group.label && (
              <p className="px-3 pb-1 text-[10px] font-[var(--typography-weight-semibold)] uppercase tracking-wider opacity-40">
                {group.label}
              </p>
            )}
            {group.items.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t space-y-0.5" style={{ borderColor: 'var(--sidebar-border)' }}>
        {bottomItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </div>
    </aside>
  )
}

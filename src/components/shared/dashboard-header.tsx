'use client'

import { Bell, Search } from 'lucide-react'

interface ApiStatus {
  name: string
  online: boolean
}

const apiStatuses: ApiStatus[] = [
  { name: 'Meta', online: false },
  { name: 'Google', online: false },
  { name: 'TikTok', online: false },
]

interface DashboardHeaderProps {
  userName?: string | null
  userRole?: string
  userImage?: string | null
}

export function DashboardHeader({ userName, userRole = 'Gestor de Tráfego', userImage }: DashboardHeaderProps) {
  return (
    <header
      className="flex items-center justify-between border-b px-6 py-3 shrink-0"
      style={{
        background: 'var(--color-card)',
        borderColor: 'var(--color-border)',
        height: '56px',
      }}
    >
      {/* Search */}
      <div
        className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-1.5 text-[length:var(--typography-size-sm)]"
        style={{ background: 'var(--color-muted)', color: 'var(--color-muted-foreground)', width: '260px' }}
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span>Buscar campanhas, alertas…</span>
      </div>

      <div className="flex items-center gap-6">
        {/* API Health */}
        <div className="flex items-center gap-1.5 text-[length:var(--typography-size-xs)]" style={{ color: 'var(--color-muted-foreground)' }}>
          <span className="font-[var(--typography-weight-medium)] uppercase tracking-wider">Saúde da API</span>
          {apiStatuses.map(({ name, online }) => (
            <span key={name} className="flex items-center gap-1 ml-1">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: online ? '#22C55E' : '#94A3B8' }}
              />
              <span>{name}</span>
            </span>
          ))}
        </div>

        {/* Bell */}
        <button
          className="relative rounded-[var(--radius-md)] p-1.5 transition-colors hover:bg-white/5"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <p className="text-[length:var(--typography-size-xs)] font-[var(--typography-weight-medium)] text-white leading-tight">
              {userName ?? 'Usuário'}
            </p>
            <p className="text-[10px] leading-tight" style={{ color: 'var(--color-muted-foreground)' }}>
              {userRole}
            </p>
          </div>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-[length:var(--typography-size-xs)] font-[var(--typography-weight-bold)] text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userImage} alt={userName ?? ''} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              (userName ?? 'U').charAt(0).toUpperCase()
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

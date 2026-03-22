'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bell, BarChart3, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Types ────────────────────────────────────────────────────────────────────
type Canal = 'ALL' | 'META' | 'GOOGLE' | 'TIKTOK' | 'LINKEDIN'
type Status = 'all' | 'NOVO' | 'APLICADO' | 'IGNORADO'
type Days = '7' | '14' | '30'

interface AlertStats {
  total: number
  aplicados: number
  canaisConectados: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function downloadCsv(url: string) {
  const a = document.createElement('a')
  a.href = url
  a.click()
}

function buildAlertsUrl(canal: Canal, status: Status, days: Days) {
  const params = new URLSearchParams({ type: 'alerts', canal, status, days })
  return `/api/reports/export?${params.toString()}`
}

function buildCampaignsUrl(days: Days) {
  const params = new URLSearchParams({ type: 'campaigns', days })
  return `/api/reports/export?${params.toString()}`
}

// ─── Select Component ─────────────────────────────────────────────────────────
function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as T)}
      className="rounded-[var(--radius-md)] border px-3 py-1.5 text-[length:var(--typography-size-xs)] outline-none transition-colors focus:border-white/20"
      style={{
        background: 'var(--color-background)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-muted-foreground)',
      }}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="flex flex-col gap-1 rounded-[var(--radius-lg)] border p-5"
      style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <span
        className="text-[length:var(--typography-size-xs)] font-[var(--typography-weight-medium)] uppercase tracking-wider"
        style={{ color: 'var(--color-muted-foreground)' }}
      >
        {label}
      </span>
      <span className="text-[length:var(--typography-size-2xl)] font-[var(--typography-weight-bold)] text-white">
        {value}
      </span>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RelatoriosPage() {
  // Alerts card state
  const [alertsCanal, setAlertsCanal] = useState<Canal>('ALL')
  const [alertsStatus, setAlertsStatus] = useState<Status>('all')
  const [alertsDays, setAlertsDays] = useState<Days>('30')

  // Campaigns card state
  const [campaignsDays, setCampaignsDays] = useState<Days>('30')

  const { data: stats } = useQuery<AlertStats>({
    queryKey: ['relatorios-stats'],
    queryFn: async () => {
      const res = await fetch('/api/alerts')
      if (!res.ok) throw new Error('Failed to fetch')
      const alerts: { status: string; canal: string }[] = await res.json()
      const total = alerts.length
      const aplicados = alerts.filter(a => a.status === 'APLICADO').length
      const canaisConectados = new Set(alerts.map(a => a.canal)).size
      return { total, aplicados, canaisConectados }
    },
  })

  const taxaAplicacao =
    stats && stats.total > 0
      ? `${Math.round((stats.aplicados / stats.total) * 100)}%`
      : '—'

  const canalOptions: { value: Canal; label: string }[] = [
    { value: 'ALL', label: 'Todos os canais' },
    { value: 'GOOGLE', label: 'Google Ads' },
    { value: 'META', label: 'Meta Ads' },
    { value: 'TIKTOK', label: 'TikTok' },
    { value: 'LINKEDIN', label: 'LinkedIn' },
  ]

  const statusOptions: { value: Status; label: string }[] = [
    { value: 'all', label: 'Todos os status' },
    { value: 'NOVO', label: 'Novo' },
    { value: 'APLICADO', label: 'Aplicado' },
    { value: 'IGNORADO', label: 'Ignorado' },
  ]

  const daysOptions: { value: Days; label: string }[] = [
    { value: '7', label: '7 dias' },
    { value: '14', label: '14 dias' },
    { value: '30', label: '30 dias' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[length:var(--typography-size-2xl)] font-[var(--typography-weight-bold)] text-white">
          Relatórios
        </h1>
        <p className="mt-1 text-[length:var(--typography-size-sm)]" style={{ color: 'var(--color-muted-foreground)' }}>
          Exporte e analise o desempenho das suas campanhas.
        </p>
      </div>

      {/* Export cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Card 1: Alertas e Otimizações */}
        <div
          className="flex flex-col gap-5 rounded-[var(--radius-lg)] border p-6"
          style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
              style={{ background: 'rgba(37,99,235,0.15)' }}
            >
              <Bell className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h2 className="text-[length:var(--typography-size-base)] font-[var(--typography-weight-semibold)] text-white">
                Alertas e Otimizações
              </h2>
              <p className="mt-0.5 text-[length:var(--typography-size-xs)]" style={{ color: 'var(--color-muted-foreground)' }}>
                Exporte todos os alertas detectados com diagnóstico, impacto e status.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="text-[10px] font-[var(--typography-weight-semibold)] uppercase tracking-wider"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              Filtros
            </label>
            <div className="flex flex-wrap gap-2">
              <Select value={alertsCanal} onChange={setAlertsCanal} options={canalOptions} />
              <Select value={alertsStatus} onChange={setAlertsStatus} options={statusOptions} />
              <Select value={alertsDays} onChange={setAlertsDays} options={daysOptions} />
            </div>
          </div>

          <Button
            onClick={() => downloadCsv(buildAlertsUrl(alertsCanal, alertsStatus, alertsDays))}
            className="gap-2 self-start"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        {/* Card 2: Performance de Campanhas */}
        <div
          className="flex flex-col gap-5 rounded-[var(--radius-lg)] border p-6"
          style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
              style={{ background: 'rgba(34,197,94,0.12)' }}
            >
              <BarChart3 className="h-5 w-5" style={{ color: '#22C55E' }} />
            </div>
            <div>
              <h2 className="text-[length:var(--typography-size-base)] font-[var(--typography-weight-semibold)] text-white">
                Performance de Campanhas
              </h2>
              <p className="mt-0.5 text-[length:var(--typography-size-xs)]" style={{ color: 'var(--color-muted-foreground)' }}>
                Métricas consolidadas por campanha: ROAS, CPA, CTR, Gasto e Conversões.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="text-[10px] font-[var(--typography-weight-semibold)] uppercase tracking-wider"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              Filtros
            </label>
            <div className="flex flex-wrap gap-2">
              <Select value={campaignsDays} onChange={setCampaignsDays} options={daysOptions} />
            </div>
          </div>

          <Button
            onClick={() => downloadCsv(buildCampaignsUrl(campaignsDays))}
            className="gap-2 self-start"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div>
        <h2
          className="mb-3 text-[length:var(--typography-size-sm)] font-[var(--typography-weight-semibold)] uppercase tracking-wider"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          Resumo — últimos 30 dias
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Total de alertas" value={stats?.total ?? '—'} />
          <StatCard label="Ações aplicadas" value={stats?.aplicados ?? '—'} />
          <StatCard label="Taxa de aplicação" value={taxaAplicacao} />
          <StatCard label="Canais conectados" value={stats?.canaisConectados ?? '—'} />
        </div>
      </div>
    </div>
  )
}

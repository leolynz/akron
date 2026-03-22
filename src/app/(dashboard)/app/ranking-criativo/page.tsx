'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
type Performance = 'DESTAQUE' | 'ESTAVEL' | 'FADIGA'

interface RankingItem {
  campanhaId: string
  canal: 'META' | 'GOOGLE' | 'TIKTOK' | 'LINKEDIN'
  ctrAtual: number
  ctrDelta: number
  roasAtual: number
  roasDelta: number
  gastoTotal: number
  impressoes7d: number
  performance: Performance
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CANAL_COLORS: Record<string, string> = {
  GOOGLE: '#4285F4',
  META: '#1877F2',
  TIKTOK: '#010101',
  LINKEDIN: '#0A66C2',
}

const CANAL_LETTERS: Record<string, string> = {
  GOOGLE: 'G',
  META: 'f',
  TIKTOK: '♪',
  LINKEDIN: 'in',
}

const PERF_CONFIG: Record<Performance, { label: string; color: string; bg: string; border: string }> = {
  DESTAQUE: {
    label: 'DESTAQUE',
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.12)',
    border: '#22C55E',
  },
  ESTAVEL: {
    label: 'ESTÁVEL',
    color: '#2563EB',
    bg: 'rgba(37,99,235,0.12)',
    border: 'transparent',
  },
  FADIGA: {
    label: 'FADIGA',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
    border: '#EF4444',
  },
}

type FilterTab = 'TODOS' | Performance

const FILTER_TABS: FilterTab[] = ['TODOS', 'DESTAQUE', 'ESTAVEL', 'FADIGA']

const FILTER_LABELS: Record<FilterTab, string> = {
  TODOS: 'TODOS',
  DESTAQUE: 'DESTAQUE',
  ESTAVEL: 'ESTÁVEL',
  FADIGA: 'FADIGA',
}

function fmtGasto(v: number): string {
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(1)}k`
  return `R$ ${v}`
}

function fmtImpressoes(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`
  return `${v}`
}

function DeltaBadge({ delta }: { delta: number }) {
  const isPos = delta >= 0
  const color = isPos ? '#22C55E' : '#EF4444'
  const arrow = isPos ? '▲' : '▼'
  return (
    <span className="text-[10px] font-semibold" style={{ color }}>
      {arrow}{Math.abs(delta).toFixed(1)}%
    </span>
  )
}

// ─── Platform Icon ─────────────────────────────────────────────────────────────
function PlatformIcon({ canal }: { canal: string }) {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold"
      style={{ background: CANAL_COLORS[canal] ?? '#6366F1' }}
    >
      {CANAL_LETTERS[canal] ?? canal[0]}
    </div>
  )
}

// ─── Creative Card ─────────────────────────────────────────────────────────────
function CreativeCard({ item, maxCtr }: { item: RankingItem; maxCtr: number }) {
  const perf = PERF_CONFIG[item.performance]
  const hasLeftBorder = item.performance === 'DESTAQUE' || item.performance === 'FADIGA'
  const ctrPct = maxCtr > 0 ? (item.ctrAtual / maxCtr) * 100 : 0

  const truncated = item.campanhaId.length > 24
    ? item.campanhaId.slice(0, 24) + '…'
    : item.campanhaId

  return (
    <div
      className="rounded-[var(--radius-lg)] border px-5 py-4 transition-colors hover:border-white/10"
      style={{
        background: 'var(--color-card)',
        borderColor: 'var(--color-border)',
        borderLeft: hasLeftBorder ? `3px solid ${perf.border}` : undefined,
      }}
    >
      {/* Row 1: icon + id + badge */}
      <div className="flex items-center gap-3">
        <PlatformIcon canal={item.canal} />
        <span
          className="flex-1 text-[length:var(--typography-size-sm)] font-[var(--typography-weight-semibold)] text-white truncate"
          title={item.campanhaId}
        >
          {truncated}
        </span>
        <span
          className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-[var(--typography-weight-semibold)] shrink-0"
          style={{ color: perf.color, background: perf.bg }}
        >
          {perf.label}
        </span>
      </div>

      {/* Row 2: metrics */}
      <div className="mt-3 flex items-center gap-6 flex-wrap">
        {/* CTR */}
        <div className="flex items-center gap-1.5">
          <span className="text-[length:var(--typography-size-xs)]" style={{ color: 'var(--color-muted-foreground)' }}>
            CTR:
          </span>
          <span className="text-[length:var(--typography-size-xs)] font-[var(--typography-weight-semibold)] text-white">
            {item.ctrAtual.toFixed(1)}%
          </span>
          <DeltaBadge delta={item.ctrDelta} />
        </div>

        {/* ROAS */}
        <div className="flex items-center gap-1.5">
          <span className="text-[length:var(--typography-size-xs)]" style={{ color: 'var(--color-muted-foreground)' }}>
            ROAS:
          </span>
          <span className="text-[length:var(--typography-size-xs)] font-[var(--typography-weight-semibold)] text-white">
            {item.roasAtual.toFixed(1)}x
          </span>
          <DeltaBadge delta={item.roasDelta} />
        </div>

        {/* Gasto */}
        <div className="flex items-center gap-1.5">
          <span className="text-[length:var(--typography-size-xs)]" style={{ color: 'var(--color-muted-foreground)' }}>
            Gasto:
          </span>
          <span className="text-[length:var(--typography-size-xs)] font-[var(--typography-weight-semibold)] text-white">
            {fmtGasto(item.gastoTotal)}
          </span>
        </div>

        {/* Impressões */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[length:var(--typography-size-xs)]" style={{ color: 'var(--color-muted-foreground)' }}>
            Impressões:
          </span>
          <span className="text-[length:var(--typography-size-xs)] text-white">
            {fmtImpressoes(item.impressoes7d)}
          </span>
        </div>
      </div>

      {/* Row 3: progress bar */}
      <div className="mt-3">
        <div
          className="h-1.5 w-full rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(ctrPct, 100)}%`,
              background: perf.color,
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Summary Card ─────────────────────────────────────────────────────────────
function SummaryCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color?: string
}) {
  return (
    <div
      className="rounded-[var(--radius-lg)] border px-5 py-4"
      style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <p className="text-[length:var(--typography-size-xs)]" style={{ color: 'var(--color-muted-foreground)' }}>
        {label}
      </p>
      <p
        className="mt-1 text-[length:var(--typography-size-2xl)] font-[var(--typography-weight-bold)]"
        style={{ color: color ?? 'white' }}
      >
        {value}
      </p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RankingCriativoPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('TODOS')

  const { data: items = [], isLoading } = useQuery<RankingItem[]>({
    queryKey: ['ranking-criativo'],
    queryFn: async () => {
      const res = await fetch('/api/ranking-criativo')
      if (!res.ok) throw new Error('Failed to fetch ranking')
      return res.json()
    },
  })

  const destaqueCount = items.filter(i => i.performance === 'DESTAQUE').length
  const fadigaCount = items.filter(i => i.performance === 'FADIGA').length

  const filtered = activeFilter === 'TODOS'
    ? items
    : items.filter(i => i.performance === activeFilter)

  const maxCtr = Math.max(...items.map(i => i.ctrAtual), 0)

  const counts: Record<FilterTab, number> = {
    TODOS: items.length,
    DESTAQUE: destaqueCount,
    ESTAVEL: items.filter(i => i.performance === 'ESTAVEL').length,
    FADIGA: fadigaCount,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[length:var(--typography-size-2xl)] font-[var(--typography-weight-bold)] text-white">
          Ranking Criativo
        </h1>
        <p className="mt-1 text-[length:var(--typography-size-sm)]" style={{ color: 'var(--color-muted-foreground)' }}>
          Analise a performance e fadiga dos seus criativos por campanha.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Total Criativos" value={items.length} />
        <SummaryCard label="Em Destaque" value={destaqueCount} color="#22C55E" />
        <SummaryCard label="Com Fadiga" value={fadigaCount} color="#EF4444" />
      </div>

      {/* Filter tabs */}
      <div
        className="flex items-center gap-1 rounded-[var(--radius-lg)] border p-1"
        style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={cn(
              'rounded-[var(--radius-md)] px-3 py-1.5 text-[length:var(--typography-size-xs)] font-[var(--typography-weight-medium)] transition-all',
              activeFilter === tab ? 'text-white' : 'hover:text-white'
            )}
            style={
              activeFilter === tab
                ? { background: 'var(--color-primary)', color: '#fff' }
                : { color: 'var(--color-muted-foreground)' }
            }
          >
            {FILTER_LABELS[tab]}
            {counts[tab] > 0 && (
              <span
                className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]"
                style={{
                  background: activeFilter === tab ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)',
                }}
              >
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--color-muted-foreground)' }} />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div
          className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border py-16 text-center"
          style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <Star className="h-10 w-10 mb-3" style={{ color: 'var(--color-muted-foreground)' }} />
          <p className="text-[length:var(--typography-size-base)] font-[var(--typography-weight-semibold)] text-white mb-1">
            Nenhum criativo encontrado
          </p>
          <p className="text-[length:var(--typography-size-sm)] max-w-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            {items.length === 0
              ? 'Carregue dados demo para ver o ranking dos seus criativos.'
              : `Nenhum criativo com status ${FILTER_LABELS[activeFilter]}.`}
          </p>
        </div>
      )}

      {/* Cards list */}
      {!isLoading && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map(item => (
            <CreativeCard key={item.campanhaId} item={item} maxCtr={maxCtr} />
          ))}
        </div>
      )}
    </div>
  )
}

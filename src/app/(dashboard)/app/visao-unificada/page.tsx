'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Zap, ChevronDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Campaign {
  campanhaId: string
  canal: 'META' | 'GOOGLE' | 'TIKTOK' | 'LINKEDIN'
  nome: string
  gasto: number
  roas: number
  cpa: number
  ctr: number
  impressoes: number
  cliques: number
  conversoes: number
  ultimaAtualizacao: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CANAL_LABELS: Record<string, string> = {
  META: 'Meta',
  GOOGLE: 'Google',
  TIKTOK: 'TikTok',
  LINKEDIN: 'LinkedIn',
}

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

type SortKey = 'gasto' | 'roas' | 'cpa' | 'ctr'
type SortOption = { label: string; key: SortKey; dir: 'asc' | 'desc' }

const SORT_OPTIONS: SortOption[] = [
  { label: 'Gasto ↓', key: 'gasto', dir: 'desc' },
  { label: 'ROAS ↓', key: 'roas', dir: 'desc' },
  { label: 'CPA ↑', key: 'cpa', dir: 'asc' },
  { label: 'CTR ↓', key: 'ctr', dir: 'desc' },
]

const CANAIS = ['ALL', 'GOOGLE', 'META', 'TIKTOK', 'LINKEDIN'] as const
type CanalFilter = typeof CANAIS[number]

function fmtGasto(v: number): string {
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(1)}k`
  return `R$ ${v}`
}

function fmtImpressoes(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`
  return `${v}`
}

function fmtRoas(v: number): string {
  return `${v.toFixed(1)}x`
}

function fmtCpa(v: number): string {
  return `R$ ${v.toFixed(0)}`
}

function fmtCtr(v: number): string {
  return `${v.toFixed(1)}%`
}

function getCtrColor(v: number): string {
  if (v > 3) return '#22C55E'
  if (v >= 1) return '#F59E0B'
  return '#EF4444'
}

function getRoasColor(v: number): string {
  if (v > 4) return '#22C55E'
  if (v >= 2) return '#F59E0B'
  return '#EF4444'
}

function getStatusLabel(roas: number): { label: string; color: string; bg: string } {
  if (roas > 4) return { label: 'Ótimo', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' }
  if (roas >= 2) return { label: 'Atenção', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' }
  return { label: 'Crítico', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' }
}

// ─── Platform Icon ────────────────────────────────────────────────────────────
function PlatformIcon({ canal }: { canal: string }) {
  return (
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold"
      style={{ background: CANAL_COLORS[canal] ?? '#6366F1' }}
    >
      {CANAL_LETTERS[canal] ?? canal[0]}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VisaoUnificadaPage() {
  const [canalFilter, setCanalFilter] = useState<CanalFilter>('ALL')
  const [sortOption, setSortOption] = useState<SortOption>(SORT_OPTIONS[0])
  const [sortOpen, setSortOpen] = useState(false)

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const res = await fetch('/api/campaigns')
      if (!res.ok) throw new Error('Failed to fetch campaigns')
      return res.json()
    },
  })

  const counts: Record<string, number> = { ALL: campaigns.length }
  for (const c of ['GOOGLE', 'META', 'TIKTOK', 'LINKEDIN']) {
    counts[c] = campaigns.filter(c2 => c2.canal === c).length
  }

  const filtered = (canalFilter === 'ALL' ? campaigns : campaigns.filter(c => c.canal === canalFilter))
    .slice()
    .sort((a, b) => {
      const aVal = a[sortOption.key]
      const bVal = b[sortOption.key]
      return sortOption.dir === 'desc' ? bVal - aVal : aVal - bVal
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[length:var(--typography-size-2xl)] font-[var(--typography-weight-bold)] text-white">
          Visão Unificada
        </h1>
        <p className="mt-1 text-[length:var(--typography-size-sm)]" style={{ color: 'var(--color-muted-foreground)' }}>
          Todas as campanhas em um só lugar.
        </p>
      </div>

      {/* Filter bar */}
      <div
        className="flex items-center gap-2 rounded-[var(--radius-lg)] border p-1"
        style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        {/* Canal tabs */}
        <div className="flex items-center gap-1 flex-1">
          {CANAIS.map(canal => (
            <button
              key={canal}
              onClick={() => setCanalFilter(canal)}
              className={cn(
                'rounded-[var(--radius-md)] px-3 py-1.5 text-[length:var(--typography-size-xs)] font-[var(--typography-weight-medium)] transition-all',
                canalFilter === canal ? 'text-white' : 'hover:text-white'
              )}
              style={
                canalFilter === canal
                  ? { background: 'var(--color-primary)', color: '#fff' }
                  : { color: 'var(--color-muted-foreground)' }
              }
            >
              {canal === 'ALL' ? 'ALL' : CANAL_LABELS[canal]}
              {counts[canal] > 0 && (
                <span
                  className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]"
                  style={{
                    background: canalFilter === canal ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)',
                  }}
                >
                  {counts[canal]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="relative border-l pl-2" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setSortOpen(v => !v)}
            className="flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-1.5 text-[length:var(--typography-size-xs)] transition-colors hover:bg-white/5"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            {sortOption.label}
            <ChevronDown className="h-3 w-3" />
          </button>
          {sortOpen && (
            <div
              className="absolute right-0 top-full mt-1 z-10 min-w-[120px] rounded-[var(--radius-md)] border py-1 shadow-lg"
              style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.label}
                  onClick={() => { setSortOption(opt); setSortOpen(false) }}
                  className="flex w-full items-center px-3 py-1.5 text-[length:var(--typography-size-xs)] transition-colors hover:bg-white/5"
                  style={{
                    color: sortOption.label === opt.label ? '#fff' : 'var(--color-muted-foreground)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
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
          <Zap className="h-10 w-10 mb-3" style={{ color: 'var(--color-muted-foreground)' }} />
          <p className="text-[length:var(--typography-size-base)] font-[var(--typography-weight-semibold)] text-white mb-1">
            Nenhuma campanha encontrada
          </p>
          <p className="text-[length:var(--typography-size-sm)] max-w-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            {canalFilter === 'ALL'
              ? 'Conecte suas plataformas para visualizar as campanhas aqui.'
              : `Nenhuma campanha encontrada para ${CANAL_LABELS[canalFilter]}.`}
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && filtered.length > 0 && (
        <div
          className="rounded-[var(--radius-lg)] border overflow-hidden"
          style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <table className="w-full text-[length:var(--typography-size-sm)]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Canal', 'Campanha', 'Impressões', 'Cliques', 'CTR', 'Gasto', 'ROAS', 'CPA', 'Status'].map(col => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-[10px] font-[var(--typography-weight-semibold)] uppercase tracking-wider"
                    style={{ color: 'var(--color-muted-foreground)' }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((campaign, i) => {
                const status = getStatusLabel(campaign.roas)
                return (
                  <tr
                    key={campaign.campanhaId}
                    className="transition-colors hover:bg-white/[0.03] cursor-default"
                    style={i < filtered.length - 1 ? { borderBottom: '1px solid var(--color-border)' } : {}}
                  >
                    {/* Canal */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <PlatformIcon canal={campaign.canal} />
                        <span className="text-[length:var(--typography-size-xs)] font-[var(--typography-weight-medium)]" style={{ color: 'var(--color-muted-foreground)' }}>
                          {CANAL_LABELS[campaign.canal]}
                        </span>
                      </div>
                    </td>

                    {/* Campanha */}
                    <td className="px-4 py-3 max-w-[180px]">
                      <span
                        className="block truncate text-white text-[length:var(--typography-size-xs)] font-[var(--typography-weight-medium)]"
                        title={campaign.campanhaId}
                      >
                        {campaign.campanhaId}
                      </span>
                    </td>

                    {/* Impressões */}
                    <td className="px-4 py-3 text-white text-[length:var(--typography-size-xs)]">
                      {fmtImpressoes(campaign.impressoes)}
                    </td>

                    {/* Cliques */}
                    <td className="px-4 py-3 text-white text-[length:var(--typography-size-xs)]">
                      {fmtImpressoes(campaign.cliques)}
                    </td>

                    {/* CTR */}
                    <td className="px-4 py-3">
                      <span
                        className="text-[length:var(--typography-size-xs)] font-[var(--typography-weight-semibold)]"
                        style={{ color: getCtrColor(campaign.ctr) }}
                      >
                        {fmtCtr(campaign.ctr)}
                      </span>
                    </td>

                    {/* Gasto */}
                    <td className="px-4 py-3 text-white text-[length:var(--typography-size-xs)] font-[var(--typography-weight-semibold)]">
                      {fmtGasto(campaign.gasto)}
                    </td>

                    {/* ROAS */}
                    <td className="px-4 py-3">
                      <span
                        className="text-[length:var(--typography-size-xs)] font-[var(--typography-weight-semibold)]"
                        style={{ color: getRoasColor(campaign.roas) }}
                      >
                        {fmtRoas(campaign.roas)}
                      </span>
                    </td>

                    {/* CPA */}
                    <td className="px-4 py-3 text-white text-[length:var(--typography-size-xs)]">
                      {fmtCpa(campaign.cpa)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-[var(--radius-full)] px-2.5 py-0.5 text-[10px] font-[var(--typography-weight-semibold)]"
                        style={{ color: status.color, background: status.bg }}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

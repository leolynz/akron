'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Filter, Zap, ScrollText, Download, Folder, ChevronDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Alert {
  id: string
  canal: 'META' | 'GOOGLE' | 'TIKTOK' | 'LINKEDIN'
  campanhaId: string
  tipo: string
  diagnostico: string
  impactoProjetado?: string | null
  prioridade: number
  status: 'NOVO' | 'APLICADO' | 'IGNORADO'
  criadoEm: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CANAL_LABELS: Record<string, string> = {
  META: 'Meta Ads',
  GOOGLE: 'Google Ads',
  TIKTOK: 'TikTok',
  LINKEDIN: 'LinkedIn',
}

function getActionLabel(tipo: string): string {
  const t = tipo.toUpperCase()
  if (t.includes('BID') || t.includes('LANCE')) return 'Ajustar Bid'
  if (t.includes('BUDGET') || t.includes('ORÇAMENTO') || t.includes('ORCAMENTO')) return 'Escalar Orçamento'
  if (t.includes('PAUSE') || t.includes('PAUSAR') || t.includes('PALAVRA')) return 'Aplicar Correção'
  if (t.includes('CRIATIVO') || t.includes('FADIGA')) return 'Ver Substitutos'
  if (t.includes('AUDIENC') || t.includes('LOOKALIKE')) return 'Expandir Lookalike'
  return 'Aplicar Otimização'
}

function getImpactColor(impacto: string | null | undefined, prioridade: number): string {
  if (!impacto) return '#94A3B8'
  const lower = impacto.toLowerCase()
  if (lower.includes('-') || lower.includes('risco') || lower.includes('queda')) return '#EF4444'
  if (lower.includes('+') || lower.includes('receita') || lower.includes('escala')) return '#22C55E'
  return '#F59E0B'
}

function getClusterLabel(campanhaId: string): string {
  // Map campaign IDs to cluster names (placeholder until cluster join is implemented)
  const clusters: Record<string, string> = {}
  return clusters[campanhaId] ?? 'Sem grupo'
}

// ─── Platform Icon ────────────────────────────────────────────────────────────
function PlatformIcon({ canal }: { canal: string }) {
  const base = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold'
  const colors: Record<string, string> = {
    GOOGLE: '#4285F4',
    META: '#1877F2',
    TIKTOK: '#010101',
    LINKEDIN: '#0A66C2',
  }
  const labels: Record<string, string> = {
    GOOGLE: 'G',
    META: 'f',
    TIKTOK: '♪',
    LINKEDIN: 'in',
  }
  return (
    <div className={base} style={{ background: colors[canal] ?? '#6366F1' }}>
      {labels[canal] ?? canal[0]}
    </div>
  )
}

// ─── Optimization Card ────────────────────────────────────────────────────────
function OtimizacaoCard({ alert, onApply, onIgnore, loading }: {
  alert: Alert
  onApply: () => void
  onIgnore: () => void
  loading: boolean
}) {
  const impactColor = getImpactColor(alert.impactoProjetado, alert.prioridade)
  const actionLabel = getActionLabel(alert.tipo)
  const clusterLabel = getClusterLabel(alert.campanhaId)

  // Format tipo for display
  const tipoDisplay = alert.tipo
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div
      className="flex items-center gap-4 rounded-[var(--radius-lg)] border px-5 py-4 transition-colors hover:border-white/10"
      style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      {/* Platform icon */}
      <PlatformIcon canal={alert.canal} />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[length:var(--typography-size-sm)] font-[var(--typography-weight-semibold)] text-white">
            {tipoDisplay}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-[var(--typography-weight-medium)]"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-muted-foreground)' }}
          >
            <Folder className="h-2.5 w-2.5" />
            {clusterLabel}
          </span>
        </div>
        <p className="text-[length:var(--typography-size-xs)] leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
          {alert.diagnostico}
        </p>
      </div>

      {/* Impact metric */}
      {alert.impactoProjetado && (
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="inline-block h-2 w-2 rounded-full shrink-0" style={{ background: impactColor }} />
          <span className="text-[length:var(--typography-size-xs)] font-[var(--typography-weight-semibold)] whitespace-nowrap" style={{ color: impactColor }}>
            {alert.impactoProjetado}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onIgnore}
          disabled={loading}
          className="text-[length:var(--typography-size-xs)] transition-colors hover:text-white"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          Ignorar
        </button>
        <Button size="sm" onClick={onApply} disabled={loading} className="gap-1.5 text-xs h-8 px-4">
          {loading && <Loader2 className="h-3 w-3 animate-spin" />}
          {actionLabel}
        </Button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const CANAIS = ['ALL', 'META', 'GOOGLE', 'TIKTOK', 'LINKEDIN'] as const
type CanalFilter = typeof CANAIS[number]

export default function OtimizacoesPage() {
  const [canalFilter, setCanalFilter] = useState<CanalFilter>('ALL')
  const queryClient = useQueryClient()

  const { data: alerts = [], isLoading } = useQuery<Alert[]>({
    queryKey: ['alerts', 'NOVO'],
    queryFn: async () => {
      const res = await fetch('/api/alerts?status=NOVO')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const applyMutation = useMutation({
    mutationFn: async (alert: Alert) => {
      const tipo = alert.tipo.toUpperCase().includes('BID') ? 'BID'
        : alert.tipo.toUpperCase().includes('BUDGET') || alert.tipo.toUpperCase().includes('ORÇAMENTO') ? 'BUDGET'
        : 'PAUSE'
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId: alert.id,
          tipo,
          payload: { campanhaId: alert.campanhaId },
          canal: alert.canal,
        }),
      })
      if (!res.ok) throw new Error('Failed to apply')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Otimização aplicada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
    onError: () => toast.error('Erro ao aplicar otimização'),
  })

  const ignoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IGNORADO' }),
      })
      if (!res.ok) throw new Error('Failed to ignore')
      return res.json()
    },
    onSuccess: () => {
      toast.info('Alerta ignorado')
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })

  const filtered = canalFilter === 'ALL'
    ? alerts
    : alerts.filter(a => a.canal === canalFilter)

  const counts: Record<string, number> = { ALL: alerts.length }
  for (const c of ['META', 'GOOGLE', 'TIKTOK', 'LINKEDIN']) {
    counts[c] = alerts.filter(a => a.canal === c).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[length:var(--typography-size-2xl)] font-[var(--typography-weight-bold)] text-white">
            Otimizações Sugeridas
          </h1>
          <p className="mt-1 text-[length:var(--typography-size-sm)]" style={{ color: 'var(--color-muted-foreground)' }}>
            Ações táticas alinhadas às metas dos seus Grupos de Campanha.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-3.5 w-3.5" />
          Filtros
        </Button>
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
                canalFilter === canal
                  ? 'text-white'
                  : 'hover:text-white'
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

        {/* Right side controls */}
        <div className="flex items-center gap-1 border-l pl-2" style={{ borderColor: 'var(--color-border)' }}>
          <button
            className="flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-1.5 text-[length:var(--typography-size-xs)] transition-colors hover:bg-white/5"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            <Folder className="h-3.5 w-3.5" />
            Todos os Grupos
            <ChevronDown className="h-3 w-3" />
          </button>
          <button
            className="flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-1.5 text-[length:var(--typography-size-xs)] transition-colors hover:bg-white/5"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            <Zap className="h-3.5 w-3.5" />
            Ações
          </button>
          <button
            className="flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-1.5 text-[length:var(--typography-size-xs)] transition-colors hover:bg-white/5"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            <ScrollText className="h-3.5 w-3.5" />
            Log
          </button>
          <button
            className="rounded-[var(--radius-md)] p-1.5 transition-colors hover:bg-white/5"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--color-muted-foreground)' }} />
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div
          className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border py-16 text-center"
          style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <Zap className="h-10 w-10 mb-3" style={{ color: 'var(--color-muted-foreground)' }} />
          <p className="text-[length:var(--typography-size-base)] font-[var(--typography-weight-semibold)] text-white mb-1">
            Nenhuma otimização disponível
          </p>
          <p className="text-[length:var(--typography-size-sm)] max-w-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            {canalFilter === 'ALL'
              ? 'Conecte suas plataformas para que o Sentinela detecte oportunidades automaticamente.'
              : `Nenhuma otimização detectada para ${CANAL_LABELS[canalFilter]}.`}
          </p>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map(alert => (
            <OtimizacaoCard
              key={alert.id}
              alert={alert}
              loading={applyMutation.isPending || ignoreMutation.isPending}
              onApply={() => applyMutation.mutate(alert)}
              onIgnore={() => ignoreMutation.mutate(alert.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

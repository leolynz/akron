'use client'

import Link from 'next/link'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart
} from 'recharts'
import { AlertTriangle, Zap, TrendingUp, TrendingDown, Plus, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// ─── Dados mock de exemplo enquanto não há sync real ─────────────────────────
const revenueData = [
  { date: '03 Dez', receita: 3800, roas: 3.2 },
  { date: '07 Dez', receita: 4200, roas: 3.8 },
  { date: '11 Dez', receita: 5100, roas: 4.1 },
  { date: '15 Dez', receita: 6800, roas: 4.9 },
  { date: '19 Dez', receita: 7200, roas: 5.2 },
  { date: '22 Dez', receita: 7500, roas: 4.5 },
]

const allocationData = [
  { name: 'Google Ads', value: 45, color: '#2563EB' },
  { name: 'Meta Ads', value: 32, color: '#818CF8' },
  { name: 'LinkedIn', value: 15, color: '#06B6D4' },
  { name: 'TikTok', value: 8, color: '#F59E0B' },
]

// ─── Types ────────────────────────────────────────────────────────────────────
interface AlertItem {
  id: string
  canal: string
  tipo: string
  diagnostico: string
  impactoProjetado: string | null
  prioridade: number
  criadoEm: string
}

interface Props {
  alertsTotal: number
  alertsNovo: number
  alertsAplicado: number
  taxaAplicacao: number
  recentAlerts: AlertItem[]
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, delta, deltaPositive, icon: Icon, iconColor,
}: {
  label: string; value: string; delta?: string; deltaPositive?: boolean
  icon: React.ElementType; iconColor: string
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-3 border-r last:border-r-0" style={{ borderColor: 'var(--color-border)' }}>
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
        style={{ background: `${iconColor}18` }}
      >
        <Icon className="h-4 w-4" style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider font-[var(--typography-weight-semibold)]" style={{ color: 'var(--color-muted-foreground)' }}>
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-[length:var(--typography-size-xl)] font-[var(--typography-weight-bold)] text-white leading-tight">
            {value}
          </span>
          {delta && (
            <span
              className="text-[10px] font-[var(--typography-weight-medium)]"
              style={{ color: deltaPositive ? '#22C55E' : '#EF4444' }}
            >
              {deltaPositive ? '+' : ''}{delta}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Alert card ───────────────────────────────────────────────────────────────
function SentinelaCard({ alert }: { alert: AlertItem }) {
  const isHigh = alert.prioridade >= 3
  const borderColor = isHigh ? '#F59E0B' : '#2563EB'
  const iconBg = isHigh ? 'rgba(245,158,11,0.12)' : 'rgba(37,99,235,0.12)'
  const labelColor = isHigh ? '#F59E0B' : '#22C55E'
  const labelText = isHigh ? 'ALERTA DO SISTEMA' : 'OPORTUNIDADE DE OTIMIZAÇÃO'

  return (
    <div
      className="rounded-[var(--radius-lg)] p-4 space-y-2 border-l-2"
      style={{
        background: 'var(--color-card)',
        border: `1px solid var(--color-border)`,
        borderLeftColor: borderColor,
        borderLeftWidth: '3px',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded" style={{ background: iconBg }}>
            {isHigh
              ? <AlertTriangle className="h-3.5 w-3.5" style={{ color: '#F59E0B' }} />
              : <Zap className="h-3.5 w-3.5" style={{ color: '#2563EB' }} />
            }
          </div>
          <span className="text-[10px] font-[var(--typography-weight-bold)] uppercase tracking-wider" style={{ color: labelColor }}>
            {labelText}
          </span>
        </div>
        <span className="text-[10px]" style={{ color: 'var(--color-muted-foreground)' }}>
          {new Date(alert.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <p className="text-[length:var(--typography-size-sm)] font-[var(--typography-weight-semibold)] text-white">
        {alert.tipo.replace(/_/g, ' ')}
      </p>
      <p className="text-[length:var(--typography-size-xs)] leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
        {alert.diagnostico}
      </p>

      {alert.impactoProjetado && (
        <div className="flex items-center gap-1.5 pt-1">
          <span
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-[var(--typography-weight-medium)]"
            style={{
              background: isHigh ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
              color: isHigh ? '#EF4444' : '#22C55E',
            }}
          >
            {isHigh ? <TrendingDown className="h-2.5 w-2.5" /> : <TrendingUp className="h-2.5 w-2.5" />}
            {alert.impactoProjetado}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function DashboardClient({ alertsTotal, alertsNovo, alertsAplicado, taxaAplicacao, recentAlerts }: Props) {
  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center">
          {/* Live badge */}
          <div className="flex items-center gap-2 px-5 py-3 border-r shrink-0" style={{ borderColor: 'var(--color-border)' }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#22C55E' }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#22C55E' }} />
            </span>
            <span className="text-[10px] uppercase tracking-wider font-[var(--typography-weight-bold)]" style={{ color: '#22C55E' }}>
              Dados ao vivo
            </span>
          </div>

          <KpiCard label="Total de Alertas" value={String(alertsTotal)} icon={AlertTriangle} iconColor="#F59E0B" />
          <KpiCard label="Alertas Novos" value={String(alertsNovo)} icon={AlertTriangle} iconColor="#EF4444" delta={alertsNovo > 0 ? String(alertsNovo) : undefined} deltaPositive={false} />
          <KpiCard label="Ações Aplicadas" value={String(alertsAplicado)} icon={TrendingUp} iconColor="#22C55E" />
          <KpiCard label="Taxa de Aplicação" value={`${taxaAplicacao}%`} icon={TrendingUp} iconColor="#2563EB" delta={taxaAplicacao > 0 ? `${taxaAplicacao}%` : undefined} deltaPositive={taxaAplicacao >= 50} />
        </div>
      </Card>

      {/* Sala de Situação header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[length:var(--typography-size-2xl)] font-[var(--typography-weight-bold)] text-white">
            Sala de Situação
          </h1>
          <p className="mt-1 text-[length:var(--typography-size-sm)]" style={{ color: 'var(--color-muted-foreground)' }}>
            Centro de comando em tempo real para desempenho de campanha e inteligência.
          </p>
        </div>
        <Link href="/app/alerts">
          <Button size="lg" className="gap-2 font-[var(--typography-weight-semibold)]">
            <Plus className="h-4 w-4" />
            Ver todos os alertas
          </Button>
        </Link>
      </div>

      {/* Sentinela */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-[length:var(--typography-size-lg)] font-[var(--typography-weight-bold)] text-white">
            Sentinela
          </h2>
          <Badge variant="secondary" className="text-[10px]">
            {alertsNovo} Insight{alertsNovo !== 1 ? 's' : ''} Ativo{alertsNovo !== 1 ? 's' : ''}
          </Badge>
          <Link href="/app/alerts" className="ml-auto text-[length:var(--typography-size-xs)] flex items-center gap-1 hover:text-white transition-colors" style={{ color: 'var(--color-primary)' }}>
            Ver mais <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentAlerts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Zap className="h-8 w-8 mb-3" style={{ color: 'var(--color-muted-foreground)' }} />
              <p className="text-[length:var(--typography-size-sm)] font-[var(--typography-weight-medium)] text-white mb-1">
                Nenhum alerta ativo
              </p>
              <p className="text-[length:var(--typography-size-xs)]" style={{ color: 'var(--color-muted-foreground)' }}>
                Conecte suas plataformas para começar a detectar anomalias.
              </p>
              <Link href="/app/integrations" className="mt-4">
                <Button size="sm" variant="outline" className="gap-2">
                  Conectar plataformas
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {recentAlerts.map((alert) => (
              <SentinelaCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </div>

      {/* Performance Intelligence */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[length:var(--typography-size-lg)] font-[var(--typography-weight-bold)] text-white">
              Performance Intelligence
            </h2>
            <p className="text-[length:var(--typography-size-xs)]" style={{ color: 'var(--color-muted-foreground)' }}>
              Monitoramento em tempo real de KPIs críticos e eficiência de mídia.
            </p>
          </div>
          <Button variant="outline" size="sm">Exportar Relatório</Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          {/* Revenue + ROAS chart — 3 cols */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[length:var(--typography-size-sm)]">Tendência de Receita e ROAS</CardTitle>
                <div className="flex items-center gap-3 text-[10px]" style={{ color: 'var(--color-muted-foreground)' }}>
                  <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: '#2563EB' }} />Receita</span>
                  <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: '#22C55E' }} />ROAS</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}x`} />
                  <Tooltip
                    contentStyle={{ background: '#111827', border: '1px solid #1E293B', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#F1F5F9' }}
                  />
                  <Bar yAxisId="left" dataKey="receita" fill="#2563EB" opacity={0.8} radius={[3, 3, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="roas" stroke="#22C55E" strokeWidth={2} dot={{ fill: '#22C55E', r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Investment allocation — 2 cols */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-[length:var(--typography-size-sm)]">Alocação de Investimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {allocationData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize={18} fontWeight={700}>
                      100%
                    </text>
                    <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" fill="#94A3B8" fontSize={10}>
                      TOTAL
                    </text>
                  </PieChart>
                </ResponsiveContainer>

                <div className="w-full space-y-2 mt-2">
                  {allocationData.map(({ name, value, color }) => (
                    <div key={name} className="flex items-center justify-between text-[length:var(--typography-size-xs)]">
                      <span className="flex items-center gap-1.5" style={{ color: 'var(--color-muted-foreground)' }}>
                        <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
                        {name}
                      </span>
                      <span className="font-[var(--typography-weight-semibold)] text-white">{value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PaywallGate } from '@/components/shared/paywall-gate'
import { ScrollText } from 'lucide-react'

interface ExecutionLog {
  id: string
  canal: string
  campanha: string
  acao: string
  delta?: number
  status: string
  criadoEm: string
  action: { tipo: string; alert: { diagnostico: string } }
}

function LogTable({ logs }: { logs: ExecutionLog[] }) {
  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-start gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="outline">{log.canal}</Badge>
              <Badge variant={log.status === 'SUCCESS' ? 'accent' : 'destructive'}>
                {log.status}
              </Badge>
              <span className="text-[length:var(--typography-size-xs)] font-[var(--typography-weight-medium)]">
                {log.acao}
              </span>
            </div>
            <p className="text-[length:var(--typography-size-sm)] text-[var(--color-muted-foreground)] truncate">
              Campanha: {log.campanha}
            </p>
            {log.delta !== null && log.delta !== undefined && (
              <p
                className="text-[length:var(--typography-size-xs)] mt-1"
                style={{ color: log.delta >= 0 ? 'var(--color-accent)' : 'var(--color-destructive)' }}
              >
                Delta: {log.delta >= 0 ? '+' : ''}{log.delta.toFixed(2)}%
              </p>
            )}
          </div>
          <span className="text-[length:var(--typography-size-xs)] text-[var(--color-muted-foreground)] shrink-0">
            {new Date(log.criadoEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function LogsPage() {
  const { data, isLoading, error } = useQuery<ExecutionLog[]>({
    queryKey: ['execution-logs'],
    queryFn: async () => {
      const res = await fetch('/api/execution-logs')
      if (res.status === 403) throw new Error('paywall')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const isPaywalled = error?.message === 'paywall'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[length:var(--typography-size-3xl)] font-[var(--typography-weight-bold)]">
          Log de Execução
        </h1>
        <p className="text-[length:var(--typography-size-sm)] text-[var(--color-muted-foreground)] mt-1">
          Histórico auditável de todas as ações aplicadas
        </p>
      </div>

      <PaywallGate
        feature="Log de Execução Completo"
        description="Veja o histórico completo de ações, quem executou, quando e o impacto real vs. projetado."
        locked={isPaywalled}
      >
        <Card>
          <CardContent className="pt-6">
            {isLoading && (
              <p className="text-center py-8 text-[var(--color-muted-foreground)]">Carregando logs...</p>
            )}
            {data && data.length === 0 && (
              <div className="flex flex-col items-center py-12 text-center">
                <ScrollText className="h-12 w-12 text-[var(--color-muted-foreground)] mb-4" />
                <p className="text-[length:var(--typography-size-base)] font-[var(--typography-weight-medium)]">
                  Nenhuma ação registrada ainda
                </p>
                <p className="text-[length:var(--typography-size-sm)] text-[var(--color-muted-foreground)] mt-1">
                  Aplique otimizações no Feed Sentinela para ver o histórico aqui.
                </p>
              </div>
            )}
            {data && data.length > 0 && <LogTable logs={data} />}
          </CardContent>
        </Card>
      </PaywallGate>
    </div>
  )
}

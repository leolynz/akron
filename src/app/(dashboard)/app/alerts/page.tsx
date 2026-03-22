'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react'

interface Alert {
  id: string
  canal: string
  campanhaId: string
  tipo: string
  diagnostico: string
  impactoProjetado?: string
  prioridade: number
  status: 'NOVO' | 'APLICADO' | 'IGNORADO'
  criadoEm: string
}

function useAlerts(status?: string) {
  return useQuery<Alert[]>({
    queryKey: ['alerts', status],
    queryFn: async () => {
      const url = status ? `/api/alerts?status=${status}` : '/api/alerts'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch alerts')
      return res.json()
    },
  })
}

function AlertCard({ alert }: { alert: Alert }) {
  const queryClient = useQueryClient()

  const applyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId: alert.id,
          tipo: 'PAUSE',
          payload: { campanhaId: alert.campanhaId },
          canal: alert.canal,
        }),
      })
      if (!res.ok) throw new Error('Failed to apply action')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Ação aplicada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
    onError: () => toast.error('Erro ao aplicar ação'),
  })

  const ignoreMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/alerts/${alert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IGNORADO' }),
      })
      if (!res.ok) throw new Error('Failed to ignore alert')
      return res.json()
    },
    onSuccess: () => {
      toast.info('Alerta ignorado')
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })

  const severityVariant = alert.prioridade >= 7 ? 'high' : alert.prioridade >= 4 ? 'medium' : 'low'

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{alert.canal}</Badge>
            <Badge variant={severityVariant}>
              {alert.prioridade >= 7 ? 'Alta' : alert.prioridade >= 4 ? 'Média' : 'Baixa'}
            </Badge>
            <span className="text-[length:var(--typography-size-xs)] text-[var(--color-muted-foreground)]">
              {alert.tipo}
            </span>
          </div>
          <Badge
            variant={alert.status === 'NOVO' ? 'warning' : alert.status === 'APLICADO' ? 'accent' : 'secondary'}
            className="shrink-0"
          >
            {alert.status}
          </Badge>
        </div>
        <CardTitle className="text-[length:var(--typography-size-base)] mt-2 leading-snug">
          {alert.diagnostico}
        </CardTitle>
        {alert.impactoProjetado && (
          <CardDescription className="flex items-center gap-1 text-[var(--color-accent)]">
            <AlertTriangle className="h-3.5 w-3.5" />
            Impacto projetado: {alert.impactoProjetado}
          </CardDescription>
        )}
      </CardHeader>

      {alert.status === 'NOVO' && (
        <CardContent className="flex gap-2">
          <Button
            size="sm"
            onClick={() => applyMutation.mutate()}
            disabled={applyMutation.isPending}
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Aplicar otimização
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => ignoreMutation.mutate()}
            disabled={ignoreMutation.isPending}
          >
            <EyeOff className="h-3.5 w-3.5 mr-1" />
            Ignorar
          </Button>
        </CardContent>
      )}
    </Card>
  )
}

export default function AlertsPage() {
  const { data: alerts, isLoading, error } = useAlerts('NOVO')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[length:var(--typography-size-3xl)] font-[var(--typography-weight-bold)]">
          Feed Sentinela
        </h1>
        <p className="text-[length:var(--typography-size-sm)] text-[var(--color-muted-foreground)] mt-1">
          Alertas detectados automaticamente, priorizados por impacto
        </p>
      </div>

      {isLoading && (
        <div className="text-center py-12 text-[var(--color-muted-foreground)]">
          Carregando alertas...
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-[var(--color-destructive)]">
          Erro ao carregar alertas.
        </div>
      )}

      {alerts && alerts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Eye className="h-12 w-12 text-[var(--color-muted-foreground)] mb-4" />
            <CardTitle className="text-[length:var(--typography-size-xl)] mb-2">
              Nenhum alerta ativo
            </CardTitle>
            <CardDescription>
              O Sentinela está monitorando suas campanhas. Alertas aparecerão aqui quando detectados.
            </CardDescription>
          </CardContent>
        </Card>
      )}

      {alerts && alerts.length > 0 && (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  )
}

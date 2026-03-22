import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()

  const [alertsTotal, alertsNovo, alertsAplicado, recentAlerts] = await Promise.all([
    prisma.alert.count({ where: { userId: session!.user!.id! } }),
    prisma.alert.count({ where: { userId: session!.user!.id!, status: 'NOVO' } }),
    prisma.alert.count({ where: { userId: session!.user!.id!, status: 'APLICADO' } }),
    prisma.alert.findMany({
      where: { userId: session!.user!.id! },
      orderBy: { criadoEm: 'desc' },
      take: 5,
    }),
  ])

  const stats = [
    { label: 'Total de Alertas', value: alertsTotal, icon: Bell, color: 'var(--color-primary)' },
    { label: 'Alertas Novos', value: alertsNovo, icon: AlertTriangle, color: 'var(--color-warning)' },
    { label: 'Ações Aplicadas', value: alertsAplicado, icon: CheckCircle, color: 'var(--color-accent)' },
    {
      label: 'Taxa de Aplicação',
      value: alertsTotal > 0 ? `${Math.round((alertsAplicado / alertsTotal) * 100)}%` : '—',
      icon: TrendingUp,
      color: 'var(--color-primary)',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[length:var(--typography-size-3xl)] font-[var(--typography-weight-bold)]">
          Dashboard
        </h1>
        <p className="text-[length:var(--typography-size-sm)] text-[var(--color-muted-foreground)] mt-1">
          Visão geral das suas campanhas e alertas
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[length:var(--typography-size-sm)] font-[var(--typography-weight-medium)] text-[var(--color-muted-foreground)]">
                {label}
              </CardTitle>
              <Icon className="h-4 w-4" style={{ color }} />
            </CardHeader>
            <CardContent>
              <div className="text-[length:var(--typography-size-2xl)] font-[var(--typography-weight-bold)]">
                {value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAlerts.length === 0 ? (
            <p className="text-[length:var(--typography-size-sm)] text-[var(--color-muted-foreground)] text-center py-8">
              Nenhum alerta encontrado. Conecte seus canais para começar.
            </p>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={alert.canal === 'META' ? 'default' : 'secondary'}>
                        {alert.canal}
                      </Badge>
                      <span className="text-[length:var(--typography-size-xs)] text-[var(--color-muted-foreground)] truncate">
                        {alert.tipo}
                      </span>
                    </div>
                    <p className="text-[length:var(--typography-size-sm)] line-clamp-2">
                      {alert.diagnostico}
                    </p>
                  </div>
                  <Badge
                    variant={
                      alert.status === 'NOVO' ? 'warning' : alert.status === 'APLICADO' ? 'accent' : 'secondary'
                    }
                    className="shrink-0"
                  >
                    {alert.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

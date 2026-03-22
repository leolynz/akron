import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const [alertsTotal, alertsNovo, alertsAplicado, recentAlerts] = await Promise.all([
    prisma.alert.count({ where: { userId } }),
    prisma.alert.count({ where: { userId, status: 'NOVO' } }),
    prisma.alert.count({ where: { userId, status: 'APLICADO' } }),
    prisma.alert.findMany({
      where: { userId, status: 'NOVO' },
      orderBy: [{ prioridade: 'desc' }, { criadoEm: 'desc' }],
      take: 4,
    }),
  ])

  const taxaAplicacao = alertsTotal > 0 ? Math.round((alertsAplicado / alertsTotal) * 100) : 0

  return (
    <DashboardClient
      alertsTotal={alertsTotal}
      alertsNovo={alertsNovo}
      alertsAplicado={alertsAplicado}
      taxaAplicacao={taxaAplicacao}
      recentAlerts={recentAlerts.map(a => ({
        id: a.id,
        canal: a.canal,
        tipo: a.tipo,
        diagnostico: a.diagnostico,
        impactoProjetado: a.impactoProjetado,
        prioridade: a.prioridade,
        criadoEm: a.criadoEm.toISOString(),
      }))}
    />
  )
}

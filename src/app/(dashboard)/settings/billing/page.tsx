import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { isSubscribed, isTrialActive, daysLeftInTrial } from '@/lib/subscription'
import { BillingActions } from './billing-actions'

export default async function BillingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      trialEndsAt: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
    },
  })

  if (!user) redirect('/login')

  const subscribed = isSubscribed(user)
  const trialActive = isTrialActive(user)
  const daysLeft = daysLeftInTrial(user)

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-[length:var(--typography-size-3xl)] font-[var(--typography-weight-bold)]">
          Faturamento
        </h1>
        <p className="text-[length:var(--typography-size-sm)] text-[var(--color-muted-foreground)] mt-1">
          Gerencie seu plano e assinatura
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Plano atual</CardTitle>
            <Badge variant={subscribed ? 'accent' : trialActive ? 'default' : 'secondary'}>
              {subscribed ? 'PRO' : trialActive ? 'TRIAL' : 'FREE'}
            </Badge>
          </div>
          <CardDescription>
            {subscribed && user.stripeCurrentPeriodEnd && (
              <>Renova em {new Date(user.stripeCurrentPeriodEnd).toLocaleDateString('pt-BR')}</>
            )}
            {trialActive && <>Trial expira em {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}</>}
            {!subscribed && !trialActive && <>Sem plano ativo</>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BillingActions
            isSubscribed={subscribed}
            hasCustomer={!!user.stripeCustomerId}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plano PRO</CardTitle>
          <CardDescription>
            Acesso ilimitado a todos os recursos da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-[length:var(--typography-size-sm)]">
            {[
              'Canais ilimitados (Meta, Google, TikTok, LinkedIn)',
              'Alertas ilimitados com detecção automática',
              'Log de execução auditável com impact tracker',
              'Clusters de campanhas cross-canal',
              'Multi-cliente com visão consolidada',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <span style={{ color: 'var(--color-accent)' }}>✓</span>
                {feature}
              </div>
            ))}
          </div>
          <div className="mt-4 text-[length:var(--typography-size-2xl)] font-[var(--typography-weight-bold)]">
            R$ 97<span className="text-[length:var(--typography-size-base)] font-[var(--typography-weight-normal)] text-[var(--color-muted-foreground)]">/mês</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

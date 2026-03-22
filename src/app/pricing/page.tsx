import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Zap } from 'lucide-react'

const features = [
  'Canais ilimitados (Meta, Google, TikTok, LinkedIn)',
  'Alertas automáticos ilimitados',
  'Executor de ações com um clique',
  'Log de execução auditável completo',
  'Clusters de campanhas cross-canal',
  'Multi-cliente com visão consolidada',
  'Impact tracker T+24h/48h',
  'Suporte por email',
]

interface PricingPageProps {
  searchParams: Promise<{ reason?: string }>
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const params = await searchParams

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'var(--color-background)' }}
    >
      <div className="w-full max-w-md space-y-6">
        {params.reason === 'trial_expired' && (
          <div
            className="rounded-[var(--radius-md)] p-4 text-center text-[length:var(--typography-size-sm)]"
            style={{ background: 'var(--color-warning)', color: 'var(--color-warning-foreground)' }}
          >
            Seu trial de 14 dias expirou. Assine para continuar usando o Akron.
          </div>
        )}

        <div className="flex items-center justify-center gap-2 mb-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)]"
            style={{ background: 'var(--color-primary)' }}
          >
            <Zap className="h-4 w-4" style={{ color: 'var(--color-primary-foreground)' }} />
          </div>
          <span className="text-[length:var(--typography-size-xl)] font-[var(--typography-weight-bold)]">Akron</span>
        </div>

        <Card className="border-2" style={{ borderColor: 'var(--color-primary)' }}>
          <CardHeader className="text-center">
            <Badge className="mx-auto mb-2 w-fit">PRO</Badge>
            <CardTitle>
              <span className="text-[length:var(--typography-size-4xl)] font-[var(--typography-weight-bold)]">
                R$ 97
              </span>
              <span className="text-[length:var(--typography-size-base)] font-[var(--typography-weight-normal)] text-[var(--color-muted-foreground)]">
                /mês
              </span>
            </CardTitle>
            <CardDescription>por workspace · cancele quando quiser</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-[length:var(--typography-size-sm)]">
                <CheckCircle className="h-4 w-4 shrink-0" style={{ color: 'var(--color-accent)' }} />
                {f}
              </div>
            ))}
            <div className="pt-4 space-y-2">
              <Link href="/settings/billing" className="block">
                <Button className="w-full" size="lg">
                  Assinar agora
                </Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="ghost" className="w-full" size="sm">
                  Voltar para o início
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

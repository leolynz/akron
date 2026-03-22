import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedShaderHero } from '@/components/ui/animated-shader-hero'
import { Bell, Zap, GitBranch, ScrollText, Users, CheckCircle, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: Bell,
    title: 'Feed Sentinela',
    description:
      'Painel centralizado com alertas priorizados detectados automaticamente por canal (Meta, Google, TikTok, LinkedIn) com diagnóstico em linguagem natural e impacto projetado.',
  },
  {
    icon: Zap,
    title: 'Motor de Detecção',
    description:
      'Identifica automaticamente fadiga criativa, orçamento subutilizado, anomalias de ROAS/CPA e CTR crescente. Classifica alertas por severidade e impacto estimado.',
  },
  {
    icon: CheckCircle,
    title: 'Executor de Ações',
    description:
      'Aplica otimizações (pausar, ajustar lance, aumentar orçamento) diretamente via API nativa após confirmação com preview do impacto esperado.',
  },
  {
    icon: ScrollText,
    title: 'Log Auditável',
    description:
      'Histórico completo de todas as ações com quem executou, quando, canal e delta de métricas antes/depois. Impact tracker compara projetado vs. realizado.',
  },
  {
    icon: GitBranch,
    title: 'Clusters de Campanhas',
    description:
      'Agrupe campanhas cross-canal em portfólios estratégicos, filtre alertas por cluster e visualize health summary com métricas agregadas.',
  },
  {
    icon: Users,
    title: 'Multi-cliente',
    description:
      'Gerencie múltiplos clientes em um único workspace com visão consolidada de métricas e canais conectados.',
  },
]

const pricingFeatures = [
  'Canais ilimitados (Meta, Google, TikTok, LinkedIn)',
  'Alertas automáticos ilimitados',
  'Executor de ações com um clique',
  'Log de execução auditável completo',
  'Clusters de campanhas cross-canal',
  'Multi-cliente com visão consolidada',
  'Impact tracker T+24h/48h',
  'Suporte por email',
]

export default function HomePage() {
  return (
    <div style={{ background: 'var(--color-background)', color: 'var(--color-foreground)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-card)]/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)]"
                style={{ background: 'var(--color-primary)' }}
              >
                <Zap className="h-4 w-4" style={{ color: 'var(--color-primary-foreground)' }} />
              </div>
              <span className="text-[length:var(--typography-size-lg)] font-[var(--typography-weight-bold)]">
                Akron
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm">Começar grátis</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero — Animated Shader */}
      <AnimatedShaderHero />

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-[length:var(--typography-size-3xl)] font-[var(--typography-weight-bold)]">
            Tudo que você precisa para otimizar campanhas
          </h2>
          <p className="mt-4 text-[length:var(--typography-size-base)] text-[var(--color-muted-foreground)]">
            Da detecção automática à execução de ações, sem sair da plataforma.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]"
                  style={{ background: 'var(--color-muted)' }}
                >
                  <Icon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                </div>
                <CardTitle className="text-[length:var(--typography-size-lg)]">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[length:var(--typography-size-sm)] leading-relaxed">
                  {description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-[length:var(--typography-size-3xl)] font-[var(--typography-weight-bold)]">
              Um plano, tudo incluso
            </h2>
            <p className="mt-4 text-[length:var(--typography-size-base)] text-[var(--color-muted-foreground)]">
              Sem surpresas. Cancele quando quiser.
            </p>
          </div>

          <div className="mx-auto max-w-md">
            <Card className="border-2" style={{ borderColor: 'var(--color-primary)' }}>
              <CardHeader className="text-center pb-4">
                <Badge className="mx-auto mb-2 w-fit">PRO</Badge>
                <div className="text-[length:var(--typography-size-4xl)] font-[var(--typography-weight-bold)]">
                  R$ 97
                  <span className="text-[length:var(--typography-size-lg)] font-[var(--typography-weight-normal)] text-[var(--color-muted-foreground)]">
                    /mês
                  </span>
                </div>
                <CardDescription>por workspace · cancele quando quiser</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pricingFeatures.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[length:var(--typography-size-sm)]">
                    <CheckCircle className="h-4 w-4 shrink-0" style={{ color: 'var(--color-accent)' }} />
                    {f}
                  </div>
                ))}
                <div className="pt-4">
                  <Link href="/login" className="block">
                    <Button className="w-full" size="lg">
                      Começar 14 dias grátis
                    </Button>
                  </Link>
                  <p className="mt-2 text-center text-[length:var(--typography-size-xs)] text-[var(--color-muted-foreground)]">
                    Sem cartão de crédito para começar
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)]"
                style={{ background: 'var(--color-primary)' }}
              >
                <Zap className="h-3.5 w-3.5" style={{ color: 'var(--color-primary-foreground)' }} />
              </div>
              <span className="font-[var(--typography-weight-semibold)]">Akron</span>
            </div>
            <p className="text-[length:var(--typography-size-sm)] text-[var(--color-muted-foreground)]">
              © 2026 Akron. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

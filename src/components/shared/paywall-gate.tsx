'use client'

import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PaywallGateProps {
  feature: string
  description?: string
  children: React.ReactNode
  locked: boolean
}

export function PaywallGate({ feature, description, children, locked }: PaywallGateProps) {
  const router = useRouter()

  if (!locked) return <>{children}</>

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-50">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <Card className="max-w-sm w-full shadow-lg border-[var(--color-border)]">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-muted)]">
              <Lock className="h-6 w-6 text-[var(--color-muted-foreground)]" />
            </div>
            <CardTitle className="text-[length:var(--typography-size-xl)]">
              {feature}
            </CardTitle>
            <CardDescription>
              {description ?? 'Este recurso está disponível apenas no plano PRO.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              className="w-full"
              onClick={() => router.push('/pricing')}
            >
              Ver planos — R$ 97/mês
            </Button>
            <p className="text-center text-[length:var(--typography-size-xs)] text-[var(--color-muted-foreground)]">
              Cancele quando quiser. Sem taxas ocultas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

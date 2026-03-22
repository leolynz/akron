'use client'

import { useRouter } from 'next/navigation'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TrialBannerProps {
  daysLeft: number
}

export function TrialBanner({ daysLeft }: TrialBannerProps) {
  const router = useRouter()

  return (
    <div className="flex items-center justify-between gap-4 bg-[var(--color-primary)] px-4 py-2 text-[var(--color-primary-foreground)]">
      <div className="flex items-center gap-2 text-[length:var(--typography-size-sm)]">
        <Clock className="h-4 w-4 shrink-0" />
        <span>
          {daysLeft > 0
            ? `Seu trial gratuito expira em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}.`
            : 'Seu trial gratuito expirou.'}
          {' '}Assine agora para manter acesso a todos os recursos.
        </span>
      </div>
      <Button
        size="sm"
        variant="accent"
        onClick={() => router.push('/pricing')}
        className="shrink-0"
      >
        Assinar agora
      </Button>
    </div>
  )
}

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/shared/sidebar'
import { TrialBanner } from '@/components/shared/trial-banner'
import { isTrialActive, daysLeftInTrial, hasAccess } from '@/lib/subscription'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, trialEndsAt: true, stripeCurrentPeriodEnd: true },
  })

  if (!user) redirect('/login')

  const trialActive = isTrialActive(user)
  const access = hasAccess(user)
  const daysLeft = daysLeftInTrial(user)

  // Trial expirado e sem PRO → bloquear
  if (!access) {
    redirect('/pricing?reason=trial_expired')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-background)' }}>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {trialActive && <TrialBanner daysLeft={daysLeft} />}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

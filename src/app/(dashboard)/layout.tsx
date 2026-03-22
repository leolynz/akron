import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/shared/sidebar'
import { TrialBanner } from '@/components/shared/trial-banner'
import { DashboardHeader } from '@/components/shared/dashboard-header'
import { isTrialActive, daysLeftInTrial, hasAccess } from '@/lib/subscription'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, trialEndsAt: true, stripeCurrentPeriodEnd: true, name: true, image: true },
  })

  if (!user) redirect('/login')

  const trialActive = isTrialActive(user)
  const access = hasAccess(user)
  const daysLeft = daysLeftInTrial(user)

  if (!access) redirect('/pricing?reason=trial_expired')

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-background)' }}>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <DashboardHeader userName={user.name} userImage={user.image} />
        {trialActive && <TrialBanner daysLeft={daysLeft} />}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

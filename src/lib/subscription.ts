import type { User } from '@prisma/client'

type UserLike = Pick<User, 'plan' | 'trialEndsAt' | 'stripeCurrentPeriodEnd'>

export function isTrialActive(user: UserLike): boolean {
  if (user.plan !== 'TRIAL') return false
  if (!user.trialEndsAt) return false
  return user.trialEndsAt > new Date()
}

export function isSubscribed(user: UserLike): boolean {
  if (user.plan !== 'PRO') return false
  if (!user.stripeCurrentPeriodEnd) return false
  return user.stripeCurrentPeriodEnd > new Date()
}

export function hasAccess(user: UserLike): boolean {
  return isTrialActive(user) || isSubscribed(user)
}

export function daysLeftInTrial(user: UserLike): number {
  if (!isTrialActive(user) || !user.trialEndsAt) return 0
  const diff = user.trialEndsAt.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

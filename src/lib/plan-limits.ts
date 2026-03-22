import type { Plan } from '@prisma/client'
import type { User } from '@prisma/client'
import { hasAccess } from './subscription'

export const PLAN_LIMITS = {
  FREE: {
    canais: 1,
    alertas: 10,
    executionLog: false,
    clusters: false,
    multiCliente: false,
  },
  TRIAL: {
    canais: Infinity,
    alertas: Infinity,
    executionLog: true,
    clusters: true,
    multiCliente: true,
  },
  PRO: {
    canais: Infinity,
    alertas: Infinity,
    executionLog: true,
    clusters: true,
    multiCliente: true,
  },
} satisfies Record<Plan, Record<string, number | boolean>>

export type LimitResource = keyof (typeof PLAN_LIMITS)[Plan]

export function checkUsageLimit(
  user: Pick<User, 'plan' | 'trialEndsAt' | 'stripeCurrentPeriodEnd'>,
  resource: LimitResource,
  currentUsage = 0
): { allowed: boolean; limit: number | boolean; reason?: string } {
  const plan = hasAccess(user) ? user.plan : 'FREE'
  const limits = PLAN_LIMITS[plan]
  const limit = limits[resource]

  if (typeof limit === 'boolean') {
    return { allowed: limit, limit, reason: limit ? undefined : `Recurso disponível apenas no plano PRO` }
  }

  const allowed = currentUsage < limit
  return {
    allowed,
    limit,
    reason: allowed ? undefined : `Limite de ${limit} ${resource} atingido no plano ${plan}`,
  }
}

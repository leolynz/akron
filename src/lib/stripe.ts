// Stripe client — lazy init (proxy pattern para evitar crash no build)
import Stripe from 'stripe'

let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    })
  }
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe]
  },
})

export async function createCheckoutSession({
  userId,
  email,
  customerId,
}: {
  userId: string
  email: string
  customerId?: string | null
}) {
  const s = getStripe()

  // Cria ou usa customer existente
  let customer = customerId
  if (!customer) {
    const c = await s.customers.create({ email, metadata: { userId } })
    customer = c.id
  }

  return s.checkout.sessions.create({
    customer,
    mode: 'subscription',
    // NÃO define trial_period_days — upgrade durante trial vira PRO imediatamente
    line_items: [
      {
        price: process.env.STRIPE_PRO_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
    metadata: { userId },
  })
}

export async function createPortalSession(customerId: string) {
  const s = getStripe()
  return s.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  })
}

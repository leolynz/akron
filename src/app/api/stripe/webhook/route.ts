import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

// Stripe SDK v20: current_period_end removido de Subscription.
// Usar invoice.period_end via latest_invoice.
// API version: 2026-02-25.clover

function getStripeInstance() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
    typescript: true,
  })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const stripe = getStripeInstance()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        if (!userId || !session.customer) break

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: 'PRO',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        })
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })
        if (!user) break

        // Usar invoice.period_end para current_period_end (Stripe v20 mudança)
        const periodEnd = invoice.lines?.data?.[0]?.period?.end
          ? new Date((invoice.lines.data[0].period.end as number) * 1000)
          : null

        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: 'PRO',
            stripePriceId: (invoice.lines?.data?.[0] as { pricing?: { price_details?: { price?: string } } })?.pricing?.price_details?.price ?? user.stripePriceId,
            stripeCurrentPeriodEnd: periodEnd,
          },
        })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })
        if (!user) break

        const isActive = ['active', 'trialing'].includes(subscription.status)

        // Buscar period_end via latest_invoice
        let periodEnd: Date | null = null
        if (subscription.latest_invoice) {
          try {
            const stripe = getStripeInstance()
            const inv = await stripe.invoices.retrieve(subscription.latest_invoice as string)
            if (inv.lines?.data?.[0]?.period?.end) {
              periodEnd = new Date((inv.lines.data[0].period.end as number) * 1000)
            }
          } catch {}
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: isActive ? 'PRO' : 'FREE',
            stripeCurrentPeriodEnd: periodEnd,
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })
        if (!user) break

        // Acesso até fim do período atual
        await prisma.user.update({
          where: { id: user.id },
          data: { plan: 'FREE' },
        })
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

// App Router reads raw body via req.text() — no config needed

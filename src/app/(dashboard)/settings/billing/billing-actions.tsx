'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface BillingActionsProps {
  isSubscribed: boolean
  hasCustomer: boolean
}

export function BillingActions({ isSubscribed, hasCustomer }: BillingActionsProps) {
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setLoading(false)
  }

  async function handlePortal() {
    setLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setLoading(false)
  }

  if (isSubscribed && hasCustomer) {
    return (
      <Button variant="outline" onClick={handlePortal} disabled={loading}>
        {loading ? 'Redirecionando...' : 'Gerenciar assinatura'}
      </Button>
    )
  }

  return (
    <Button onClick={handleCheckout} disabled={loading}>
      {loading ? 'Redirecionando...' : 'Assinar — R$ 97/mês'}
    </Button>
  )
}

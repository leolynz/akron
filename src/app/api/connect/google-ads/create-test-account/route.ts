import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getValidToken } from '@/lib/google-ads-oauth'
import { listAccessibleCustomers } from '@/lib/google-ads-client'

const API_VERSION = 'v19'
const BASE_URL = `https://googleads.googleapis.com/${API_VERSION}`
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? ''

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const cred = await prisma.googleAdsCredential.findUnique({ where: { userId } })
  if (!cred) return NextResponse.json({ error: 'Google Ads not connected' }, { status: 400 })

  try {
    const accessToken = await getValidToken(userId)

    // 1. Descobre o MCC customer ID
    const customers = await listAccessibleCustomers(accessToken)
    if (!customers.length) {
      return NextResponse.json({ error: 'Nenhuma conta MCC encontrada.' }, { status: 400 })
    }

    // Pega o ID limpo (sem "customers/")
    const mccId = customers[0].replace('customers/', '').replace(/-/g, '')

    // 2. Cria a conta de teste dentro do MCC
    const res = await fetch(`${BASE_URL}/customers/${mccId}:createCustomerClient`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': DEVELOPER_TOKEN,
        'login-customer-id': mccId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerClient: {
          descriptiveName: 'Akron Test Account',
          currencyCode: 'BRL',
          timeZone: 'America/Sao_Paulo',
          testAccount: true,
        },
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Google Ads create test account error:', JSON.stringify(data))
      return NextResponse.json({
        error: data?.error?.message ?? data?.error?.details?.[0]?.errors?.[0]?.message ?? JSON.stringify(data),
      }, { status: 400 })
    }

    // Extrai o novo customer ID: "customers/1234567890"
    const newCustomerId = (data.resourceName as string).replace('customers/', '')

    // 3. Atualiza a credencial com o novo test account ID
    await prisma.googleAdsCredential.update({
      where: { userId },
      data: {
        customerId: newCustomerId,
        loginCustomerId: mccId,
      },
    })

    return NextResponse.json({
      ok: true,
      customerId: newCustomerId,
      mccId,
      message: `Conta de teste criada! ID: ${newCustomerId}`,
    })
  } catch (err) {
    console.error('create-test-account error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

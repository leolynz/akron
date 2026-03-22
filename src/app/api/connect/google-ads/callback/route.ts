import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { exchangeCode } from '@/lib/google-ads-oauth'
import { listAccessibleCustomers as getCustomers } from '@/lib/google-ads-client'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const userId = searchParams.get('state')
  const error = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (error || !code || !userId) {
    return NextResponse.redirect(`${appUrl}/app/integrations?error=oauth_cancelled`)
  }

  try {
    const { accessToken, refreshToken, expiresAt } = await exchangeCode(code)

    // Busca a primeira conta acessível para definir o customerId padrão
    let customerId = ''
    try {
      const customers = await getCustomers(accessToken)
      customerId = customers[0] ?? ''
    } catch {
      // Continua mesmo se não conseguir listar (pode ser conta sem campanhas ainda)
    }

    await prisma.googleAdsCredential.upsert({
      where: { userId },
      create: { userId, accessToken, refreshToken, expiresAt, customerId },
      update: { accessToken, refreshToken, expiresAt, customerId },
    })

    return NextResponse.redirect(`${appUrl}/app/integrations?connected=google`)
  } catch (err) {
    console.error('Google Ads OAuth callback error:', err)
    return NextResponse.redirect(`${appUrl}/app/integrations?error=oauth_failed`)
  }
}

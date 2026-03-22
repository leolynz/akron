import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { exchangeMetaCode, getMetaAdAccounts } from '@/lib/meta-ads-oauth'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const userId = searchParams.get('state')
  const error = searchParams.get('error')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (error || !code || !userId) {
    return NextResponse.redirect(`${appUrl}/app/integrations?error=meta_cancelled`)
  }

  try {
    const { accessToken, expiresAt } = await exchangeMetaCode(code)

    let adAccountId = ''
    try {
      const accounts = await getMetaAdAccounts(accessToken)
      adAccountId = accounts[0] ?? ''
    } catch {
      // Continue even if we can't list ad accounts yet
    }

    await prisma.metaAdsCredential.upsert({
      where: { userId },
      create: { userId, accessToken, adAccountId, expiresAt },
      update: { accessToken, adAccountId, expiresAt },
    })

    return NextResponse.redirect(`${appUrl}/app/integrations?connected=meta`)
  } catch (err) {
    console.error('Meta OAuth callback error:', err)
    return NextResponse.redirect(`${appUrl}/app/integrations?error=meta_failed`)
  }
}

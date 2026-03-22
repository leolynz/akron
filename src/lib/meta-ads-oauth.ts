import { prisma } from '@/lib/prisma'

const META_AUTH_URL = 'https://www.facebook.com/v19.0/dialog/oauth'
const META_TOKEN_URL = 'https://graph.facebook.com/v19.0/oauth/access_token'
const SCOPES = ['ads_read', 'ads_management', 'business_management', 'read_insights']

const clientId = process.env.META_APP_ID!
const clientSecret = process.env.META_APP_SECRET!
const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/connect/meta-ads/callback`

export function getMetaAuthUrl(userId: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: SCOPES.join(','),
    response_type: 'code',
    state: userId,
  })
  return `${META_AUTH_URL}?${params}`
}

export async function exchangeMetaCode(code: string): Promise<{ accessToken: string; expiresAt: Date }> {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  })
  const res = await fetch(`${META_TOKEN_URL}?${params}`)
  if (!res.ok) throw new Error(`Meta token exchange failed: ${await res.text()}`)
  const data = await res.json()
  // Exchange for long-lived token
  const llRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${data.access_token}`)
  const llData = await llRes.json()
  const expiresAt = new Date(Date.now() + (llData.expires_in ?? 5184000) * 1000)
  return { accessToken: llData.access_token ?? data.access_token, expiresAt }
}

export async function getMetaAdAccounts(accessToken: string): Promise<string[]> {
  const res = await fetch(`https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name&access_token=${accessToken}`)
  if (!res.ok) throw new Error(`Failed to get ad accounts: ${await res.text()}`)
  const data = await res.json()
  return (data.data ?? []).map((a: { id: string }) => a.id)
}

export async function getValidMetaToken(userId: string): Promise<string> {
  const cred = await prisma.metaAdsCredential.findUnique({ where: { userId } })
  if (!cred) throw new Error('Meta Ads not connected')
  return cred.accessToken
}

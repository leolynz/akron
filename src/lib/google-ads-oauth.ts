import { prisma } from '@/lib/prisma'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SCOPES = ['https://www.googleapis.com/auth/adwords']

const clientId = process.env.AUTH_GOOGLE_ID!
const clientSecret = process.env.AUTH_GOOGLE_SECRET!
const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/connect/google-ads/callback`

export function getAuthUrl(userId: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: userId,
  })
  return `${GOOGLE_AUTH_URL}?${params}`
}

export async function exchangeCode(code: string): Promise<{
  accessToken: string
  refreshToken: string
  expiresAt: Date
}> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to exchange code: ${err}`)
  }

  const data = await res.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  }
}

export async function refreshAccessToken(userId: string): Promise<string> {
  const cred = await prisma.googleAdsCredential.findUnique({ where: { userId } })
  if (!cred) throw new Error('No Google Ads credential found')

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: cred.refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) throw new Error('Failed to refresh access token')

  const data = await res.json()
  const expiresAt = new Date(Date.now() + data.expires_in * 1000)

  await prisma.googleAdsCredential.update({
    where: { userId },
    data: { accessToken: data.access_token, expiresAt },
  })

  return data.access_token
}

export async function getValidToken(userId: string): Promise<string> {
  const cred = await prisma.googleAdsCredential.findUnique({ where: { userId } })
  if (!cred) throw new Error('Google Ads not connected')

  // Renova se expira em menos de 5 minutos
  if (cred.expiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
    return refreshAccessToken(userId)
  }

  return cred.accessToken
}

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getAuthUrl } from '@/lib/google-ads-oauth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const url = getAuthUrl(session.user.id)
  redirect(url)
}

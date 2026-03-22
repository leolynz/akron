import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getMetaAuthUrl } from '@/lib/meta-ads-oauth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  redirect(getMetaAuthUrl(session.user.id))
}

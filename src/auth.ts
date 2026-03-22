import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Resend from 'next-auth/providers/resend'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.EMAIL_FROM ?? 'noreply@akron.app',
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  events: {
    async createUser({ user }) {
      // Primeiro login → TRIAL por 14 dias
      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: 'TRIAL',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      })
    },
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // Attach plan info to session
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { plan: true, trialEndsAt: true, stripeCurrentPeriodEnd: true },
        })
        if (dbUser) {
          ;(session.user as typeof session.user & { plan: string; trialEndsAt: Date | null }).plan =
            dbUser.plan
          ;(
            session.user as typeof session.user & {
              trialEndsAt: Date | null
            }
          ).trialEndsAt = dbUser.trialEndsAt
        }
      }
      return session
    },
  },
})

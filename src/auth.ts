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
  session: {
    strategy: 'database',
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return
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
      // Com database adapter, `user` é o registro do banco — sempre presente
      session.user.id = user.id

      // Anexa plan/trialEndsAt à sessão para uso no client
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { plan: true, trialEndsAt: true },
      })

      if (dbUser) {
        Object.assign(session.user, {
          plan: dbUser.plan,
          trialEndsAt: dbUser.trialEndsAt,
        })
      }

      return session
    },
  },
})

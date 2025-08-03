import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { accounts, sessions, users, verifications } from '../db/schema/users'
import { db } from './index'

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
    schema: { users, accounts, sessions, verifications },
  }),
})

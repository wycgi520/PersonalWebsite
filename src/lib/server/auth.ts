import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { db } from './db';
export function createAuth() {
  if (!process.env.BETTER_AUTH_SECRET || !process.env.BETTER_AUTH_URL) throw new Error('Auth is not configured');
  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL, secret: process.env.BETTER_AUTH_SECRET,
    database: prismaAdapter(db(), { provider: 'postgresql' }),
    emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 12 },
    user: { additionalFields: { role: { type: 'string', defaultValue: 'user', input: false } } },
    advanced: { ipAddress: { ipAddressHeaders: process.env.TRUST_PROXY === '1' ? ['x-real-ip'] : [] } },
    rateLimit: { enabled: true, storage: 'database', modelName: 'authRateLimit', window: 60, max: 30,
      customRules: { '/sign-in/email': { window: 60, max: 5 } } },
  });
}
export async function administrator(headers: Headers) {
  const session = await createAuth().api.getSession({ headers });
  return session?.user.role === 'admin' ? session.user : null;
}

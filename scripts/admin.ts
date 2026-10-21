import { randomUUID } from 'node:crypto';
import { hashPassword } from 'better-auth/crypto';
import { db } from '../src/lib/server/db';
// Secrets are read from environment rather than argv (shell history/process list).
async function main() {
  const [command, rawEmail] = process.argv.slice(2);
  const email = rawEmail?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!['create', 'reset-password'].includes(command) || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12 || password.length > 128) {
    throw new Error('Usage: ADMIN_PASSWORD=<12+ chars> pnpm admin <create|reset-password> <email>');
  }
  const hashed = await hashPassword(password);
  await db().$transaction(async tx => {
    let user = await tx.user.findUnique({where: {email}});
    if (command === 'create') {
      if (user) throw new Error('User already exists; use reset-password for an existing administrator');
      user = await tx.user.create({data: {id: randomUUID(), email, name: 'Administrator', emailVerified: true, role: 'admin'}});
      await tx.account.create({data: {id: randomUUID(), userId: user.id, accountId: user.id, providerId: 'credential', password: hashed}});
    } else {
      if (!user || user.role !== 'admin') throw new Error('Administrator not found');
      const result = await tx.account.updateMany({where: {userId: user.id, providerId: 'credential'}, data: {password: hashed}});
      if (result.count !== 1) throw new Error('Expected one administrator credential account');
      await tx.session.deleteMany({where: {userId: user.id}});
    }
  });
  console.log('Administrator updated.');
}
main().catch(() => { console.error('Administrator command failed. Check configuration, account and password length.'); process.exitCode = 1; }).finally(async () => {if (process.env.DATABASE_URL) await db().$disconnect();});

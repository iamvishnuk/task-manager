import { db } from './index';
import { users } from './schema/index';
import { eq } from 'drizzle-orm';

const email = process.argv[2] as string;
if (!email) {
  console.error('Please provide a user email: pnpm db:promote <email>');
  process.exit(1);
}

async function promote() {
  const [updated] = await db
    .update(users)
    .set({ role: 'ADMIN' })
    .where(eq(users.email, email))
    .returning();

  if (!updated) {
    console.error(`User with email "${email}" not found.`);
  } else {
    console.log(`Successfully promoted "${email}" to ADMIN!`);
  }
  process.exit(0);
}

promote().catch((err) => {
  console.error('Promotion error:', err);
  process.exit(1);
});

/**
 * One-off helper for the demo recording.
 * Creates (or updates) two accounts with KNOWN passwords:
 *   - Admin    : admin.demo@example.com    / Admin@1234
 *   - Customer : customer.demo@example.com / Customer@1234
 * Sets the matching users/{uid} profile + role and admin custom claim.
 */
import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const keyPath = path.resolve(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
  console.error('Missing scripts/serviceAccountKey.json');
  process.exit(1);
}
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require(keyPath);
initializeApp({ credential: cert(serviceAccount) });
const auth = getAuth();
const db = getFirestore();

interface DemoUser {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'admin' | 'customer';
}

const users: DemoUser[] = [
  { email: 'admin.demo@example.com', password: 'Admin@1234', name: 'Demo Admin', phone: '9000000001', role: 'admin' },
  { email: 'customer.demo@example.com', password: 'Customer@1234', name: 'Demo Customer', phone: '9000000002', role: 'customer' },
];

async function upsert(u: DemoUser): Promise<void> {
  let uid: string;
  try {
    const existing = await auth.getUserByEmail(u.email);
    uid = existing.uid;
    await auth.updateUser(uid, { password: u.password, displayName: u.name });
    console.log(`  updated auth user ${u.email}`);
  } catch {
    const created = await auth.createUser({
      email: u.email,
      password: u.password,
      displayName: u.name,
    });
    uid = created.uid;
    console.log(`  created auth user ${u.email}`);
  }

  await auth.setCustomUserClaims(uid, { admin: u.role === 'admin' });

  await db.collection('users').doc(uid).set(
    {
      uid,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  console.log(`  set users/${uid} role=${u.role}`);
}

async function main(): Promise<void> {
  for (const u of users) {
    console.log(`\n[demo-accounts] ${u.role.toUpperCase()} -> ${u.email}`);
    await upsert(u);
  }
  console.log('\n[demo-accounts] Done.');
  console.log('  Admin   : admin.demo@example.com    / Admin@1234');
  console.log('  Customer: customer.demo@example.com / Customer@1234');
  process.exit(0);
}
main().catch((e) => {
  console.error('[demo-accounts] Failed:', e);
  process.exit(1);
});

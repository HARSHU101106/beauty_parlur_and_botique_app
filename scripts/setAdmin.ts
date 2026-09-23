/**
 * Promote (or demote) a user to admin by email.
 *
 * Usage:
 *   1. Ensure scripts/serviceAccountKey.json exists (same key the seed
 *      script uses). Download it from Firebase Console -> Project Settings
 *      -> Service accounts -> Generate new private key.
 *   2. The user must have signed up in the app at least once.
 *   3. Run:
 *        npm run set-admin -- someone@example.com
 *      To demote back to customer:
 *        npm run set-admin -- someone@example.com customer
 *
 * This sets `users/{uid}.role` (which drives navigation and Firestore
 * rules) and also sets the matching `{ admin: boolean }` custom auth claim.
 * The Admin SDK bypasses security rules, so this works with locked-down rules.
 */
import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const keyPath = path.resolve(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(keyPath)) {
  console.error(
    '\n[set-admin] Missing scripts/serviceAccountKey.json\n' +
      'Download it from Firebase Console -> Project Settings -> Service accounts ' +
      '-> Generate new private key, and save it at scripts/serviceAccountKey.json\n',
  );
  process.exit(1);
}

const identifier = process.argv[2];
const role = (process.argv[3] ?? 'admin').toLowerCase();

if (!identifier) {
  console.error(
    '\n[set-admin] Usage: npm run set-admin -- <email|uid> [admin|customer]\n',
  );
  process.exit(1);
}

// Treat the argument as a UID if it has no "@", otherwise as an email.
const isUid = !identifier.includes('@');

if (role !== 'admin' && role !== 'customer') {
  console.error(`\n[set-admin] Invalid role "${role}". Use "admin" or "customer".\n`);
  process.exit(1);
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require(keyPath);
initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db = getFirestore();

async function main(): Promise<void> {
  let user;
  try {
    user = isUid
      ? await auth.getUser(identifier)
      : await auth.getUserByEmail(identifier);
  } catch {
    console.error(
      `\n[set-admin] No auth user found for "${identifier}". ` +
        'Make sure they have signed up in the app first.\n',
    );
    process.exit(1);
  }

  const isAdmin = role === 'admin';

  // 1. Update the Firestore role (creates/merges the users doc).
  await db
    .collection('users')
    .doc(user.uid)
    .set(
      {
        role,
        email: user.email ?? identifier,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

  // 2. Set the matching custom auth claim.
  await auth.setCustomUserClaims(user.uid, { admin: isAdmin });

  console.log(
    `\n[set-admin] ✓ ${user.email ?? identifier} (uid: ${user.uid}) is now "${role}".\n` +
      'Ask them to sign out and back in for the change to take effect.\n',
  );
  process.exit(0);
}

main().catch((err) => {
  console.error('\n[set-admin] Failed:', err);
  process.exit(1);
});

/**
 * One-off helper for the demo: list all users and their roles.
 */
import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const keyPath = path.resolve(__dirname, 'serviceAccountKey.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require(keyPath);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function main(): Promise<void> {
  const snap = await db.collection('users').get();
  snap.forEach((d) => {
    const u = d.data();
    console.log(`${u.role ?? 'customer'}\t${u.email ?? '(no email)'}\t${u.name ?? ''}`);
  });
  if (snap.empty) console.log('(no users)');
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});

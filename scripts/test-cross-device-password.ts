import bcrypt from 'bcryptjs';
import { getOwnerRecord, saveOwnerPassword, createOwnerSession, verifyOwnerSession } from '../lib/auth';

async function testCrossDevicePasswordManagement() {
  console.log('================================================================');
  console.log('🧪 RUNNING ARONA MOBILES CROSS-DEVICE OWNER PASSWORD TEST SUITE');
  console.log('================================================================\n');

  const phone1 = '9787061617';
  const phone2 = '9659458606';
  const phone3 = '9994235672';

  // ── STEP 1: Device 1 resets password to "AronaTest@2026" ─────
  console.log('Step 1: Device 1 resets password to "AronaTest@2026"...');
  const hash1 = await bcrypt.hash('AronaTest@2026', 10);
  const saveRes1 = await saveOwnerPassword(phone1, hash1);
  if (!saveRes1.success) throw new Error('Step 1 failed: saveOwnerPassword returned false');
  console.log('   ✓ Step 1 Passed: Password hash updated to backend.');

  // ── STEP 2: Device 1 logs in with "AronaTest@2026" ────────────
  console.log('\nStep 2: Device 1 logs in with "AronaTest@2026"...');
  const recordDev1 = await getOwnerRecord(phone1);
  if (!recordDev1) throw new Error('Step 2 failed: getOwnerRecord returned null on Device 1');
  const validDev1 = await bcrypt.compare('AronaTest@2026', recordDev1.password_hash);
  if (!validDev1) throw new Error('Step 2 failed: Password comparison failed on Device 1');
  const sessionToken1 = await createOwnerSession(recordDev1.id, phone1);
  const session1 = await verifyOwnerSession(sessionToken1);
  if (!session1) throw new Error('Step 2 failed: Session creation/verification failed');
  console.log('   ✓ Step 2 Passed: Device 1 login successful. Session ID:', session1.sessionId);

  // ── STEP 3: Device 2 logs in with "AronaTest@2026" ────────────
  console.log('\nStep 3: Device 2 (Android) logs in with "AronaTest@2026"...');
  const recordDev2 = await getOwnerRecord(phone2);
  if (!recordDev2) throw new Error('Step 3 failed: getOwnerRecord returned null on Device 2');
  const validDev2 = await bcrypt.compare('AronaTest@2026', recordDev2.password_hash);
  if (!validDev2) throw new Error('Step 3 failed: Password comparison failed on Device 2');
  const sessionToken2 = await createOwnerSession(recordDev2.id, phone2);
  const session2 = await verifyOwnerSession(sessionToken2);
  if (!session2) throw new Error('Step 3 failed: Session creation/verification failed on Device 2');
  console.log('   ✓ Step 3 Passed: Device 2 login successful. Session ID:', session2.sessionId);

  // ── STEP 4: Laptop logs in with "AronaTest@2026" ──────────────
  console.log('\nStep 4: Laptop logs in with "AronaTest@2026"...');
  const recordLaptop = await getOwnerRecord(phone3);
  if (!recordLaptop) throw new Error('Step 4 failed: getOwnerRecord returned null on Laptop');
  const validLaptop = await bcrypt.compare('AronaTest@2026', recordLaptop.password_hash);
  if (!validLaptop) throw new Error('Step 4 failed: Password comparison failed on Laptop');
  const sessionToken3 = await createOwnerSession(recordLaptop.id, phone3);
  const session3 = await verifyOwnerSession(sessionToken3);
  if (!session3) throw new Error('Step 4 failed: Session creation/verification failed on Laptop');
  console.log('   ✓ Step 4 Passed: Laptop login successful. Session ID:', session3.sessionId);

  // ── STEP 5: Device 2 resets password to "AronaNew#789" ─────────
  console.log('\nStep 5: Device 2 resets password to "AronaNew#789"...');
  const hash2 = await bcrypt.hash('AronaNew#789', 10);
  const saveRes2 = await saveOwnerPassword(phone2, hash2);
  if (!saveRes2.success) throw new Error('Step 5 failed: saveOwnerPassword returned false');
  console.log('   ✓ Step 5 Passed: New password hash updated to backend from Device 2.');

  // ── STEP 6: Device 1 logs in with "AronaNew#789" ──────────────
  console.log('\nStep 6: Device 1 logs in with "AronaNew#789"...');
  const recordDev1New = await getOwnerRecord(phone1);
  if (!recordDev1New) throw new Error('Step 6 failed: getOwnerRecord returned null on Device 1');
  const validDev1New = await bcrypt.compare('AronaNew#789', recordDev1New.password_hash);
  if (!validDev1New) throw new Error('Step 6 failed: Password comparison failed on Device 1');
  console.log('   ✓ Step 6 Passed: Device 1 successfully logs in with new password.');

  // ── STEP 7: Laptop logs in with "AronaNew#789" ────────────────
  console.log('\nStep 7: Laptop logs in with "AronaNew#789"...');
  const recordLaptopNew = await getOwnerRecord(phone3);
  if (!recordLaptopNew) throw new Error('Step 7 failed: getOwnerRecord returned null on Laptop');
  const validLaptopNew = await bcrypt.compare('AronaNew#789', recordLaptopNew.password_hash);
  if (!validLaptopNew) throw new Error('Step 7 failed: Password comparison failed on Laptop');
  console.log('   ✓ Step 7 Passed: Laptop successfully logs in with new password.');

  // ── STEP 8: Old password "AronaTest@2026" rejected across all devices
  console.log('\nStep 8: Verifying OLD password "AronaTest@2026" is strictly rejected on ALL devices...');
  const testOldDev1 = await bcrypt.compare('AronaTest@2026', recordDev1New.password_hash);
  const testOldDev2 = await bcrypt.compare('AronaTest@2026', (await getOwnerRecord(phone2))!.password_hash);
  const testOldLaptop = await bcrypt.compare('AronaTest@2026', recordLaptopNew.password_hash);

  if (testOldDev1 || testOldDev2 || testOldLaptop) {
    throw new Error('Step 8 failed: Old password was incorrectly accepted!');
  }
  console.log('   ✓ Step 8 Passed: Old password strictly REJECTED on Device 1, Device 2, and Laptop.');

  console.log('\n================================================================');
  console.log('🎉 ALL CROSS-DEVICE OWNER PASSWORD TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================\n');
}

testCrossDevicePasswordManagement().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});

import bcrypt from 'bcryptjs';
import { getOwnerRecord, saveOwnerPassword, createOwnerSession, verifyOwnerSession, revokeOwnerSessionById } from '../lib/auth';

async function runComprehensiveOwnerPasswordTestSuite() {
  console.log('========================================================================');
  console.log('🧪 ARONA MOBILES: GLOBAL OWNER PASSWORD PERSISTENCE & CROSS-DEVICE TEST');
  console.log('========================================================================\n');

  const dev1Phone = '9787061617'; // Device 1 (Mobile 1)
  const dev2Phone = '9659458606'; // Device 2 (Mobile 2)
  const laptopPhone = '9994235672'; // Device 3 (Laptop)

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 1: Password Reset on Device 1
  // ──────────────────────────────────────────────────────────────────────────
  console.log('TEST 1: Resetting Owner Password to "Arona@2026" from Device 1...');
  const hashPass1 = await bcrypt.hash('Arona@2026', 10);
  const saveResult1 = await saveOwnerPassword(dev1Phone, hashPass1);
  if (!saveResult1.success) throw new Error('Test 1 Failed: saveOwnerPassword returned false');
  console.log('   ✅ Password hash successfully saved to backend.');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 2: Device 1 Initial Login with "Arona@2026"
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 2: Device 1 Initial Login with "Arona@2026"...');
  const owner1 = await getOwnerRecord(dev1Phone);
  if (!owner1) throw new Error('Test 2 Failed: Could not get owner record for Device 1');
  const passMatchDev1 = await bcrypt.compare('Arona@2026', owner1.password_hash);
  if (!passMatchDev1) throw new Error('Test 2 Failed: Password did not match on Device 1');
  const tokenDev1 = await createOwnerSession(owner1.id, dev1Phone);
  const sessionDev1 = await verifyOwnerSession(tokenDev1);
  if (!sessionDev1) throw new Error('Test 2 Failed: Session verification failed on Device 1');
  console.log('   ✅ Device 1 login SUCCESS. Session ID:', sessionDev1.sessionId);

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 3: Device 1 Logout & Repeated Login with SAME password
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 3: Device 1 Logout & Repeated Login with SAME password "Arona@2026"...');
  // Logout
  await revokeOwnerSessionById(sessionDev1.sessionId, dev1Phone);
  const revokedSession = await verifyOwnerSession(tokenDev1);
  if (revokedSession) throw new Error('Test 3 Failed: Session should have been revoked upon logout');
  console.log('   ✅ Old session successfully revoked on logout.');

  // Login again with SAME password
  const owner1Repeat = await getOwnerRecord(dev1Phone);
  if (!owner1Repeat) throw new Error('Test 3 Failed: Could not get owner record on repeated login');
  const passMatchDev1Repeat = await bcrypt.compare('Arona@2026', owner1Repeat.password_hash);
  if (!passMatchDev1Repeat) throw new Error('Test 3 Failed: Password became invalid on repeated login!');
  const tokenDev1Repeat = await createOwnerSession(owner1Repeat.id, dev1Phone);
  const sessionDev1Repeat = await verifyOwnerSession(tokenDev1Repeat);
  if (!sessionDev1Repeat) throw new Error('Test 3 Failed: New session verification failed on repeated login');
  console.log('   ✅ Device 1 Repeated Login SUCCESS with SAME password.');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 4: Cross-Device Login on Device 2 (Android) with SAME password "Arona@2026"
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 4: Cross-Device Login on Device 2 (Android) with "Arona@2026"...');
  const owner2 = await getOwnerRecord(dev2Phone);
  if (!owner2) throw new Error('Test 4 Failed: Could not get owner record for Device 2');
  const passMatchDev2 = await bcrypt.compare('Arona@2026', owner2.password_hash);
  if (!passMatchDev2) throw new Error('Test 4 Failed: Password mismatch on Device 2');
  const tokenDev2 = await createOwnerSession(owner2.id, dev2Phone);
  const sessionDev2 = await verifyOwnerSession(tokenDev2);
  if (!sessionDev2) throw new Error('Test 4 Failed: Session verification failed on Device 2');
  console.log('   ✅ Device 2 (Android) Login SUCCESS with global password.');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 5: Cross-Device Login on Laptop with SAME password "Arona@2026"
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 5: Cross-Device Login on Laptop with "Arona@2026"...');
  const ownerLaptop = await getOwnerRecord(laptopPhone);
  if (!ownerLaptop) throw new Error('Test 5 Failed: Could not get owner record for Laptop');
  const passMatchLaptop = await bcrypt.compare('Arona@2026', ownerLaptop.password_hash);
  if (!passMatchLaptop) throw new Error('Test 5 Failed: Password mismatch on Laptop');
  const tokenLaptop = await createOwnerSession(ownerLaptop.id, laptopPhone);
  const sessionLaptop = await verifyOwnerSession(tokenLaptop);
  if (!sessionLaptop) throw new Error('Test 5 Failed: Session verification failed on Laptop');
  console.log('   ✅ Laptop Login SUCCESS with global password.');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 6: Simulated Browser Restart & Re-Login
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 6: Browser Restart simulation (New Browser Session with SAME password)...');
  const ownerRestart = await getOwnerRecord(dev1Phone);
  const passMatchRestart = await bcrypt.compare('Arona@2026', ownerRestart!.password_hash);
  if (!passMatchRestart) throw new Error('Test 6 Failed: Password failed after restart simulation');
  const tokenRestart = await createOwnerSession(ownerRestart!.id, dev1Phone);
  const sessionRestart = await verifyOwnerSession(tokenRestart);
  if (!sessionRestart) throw new Error('Test 6 Failed: Post-restart session failed');
  console.log('   ✅ Browser Restart Login SUCCESS.');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 7: Password Reset Again from Device 2 to "AronaNew#789"
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 7: Resetting Owner Password to "AronaNew#789" from Device 2...');
  const hashPass2 = await bcrypt.hash('AronaNew#789', 10);
  const saveResult2 = await saveOwnerPassword(dev2Phone, hashPass2);
  if (!saveResult2.success) throw new Error('Test 7 Failed: saveOwnerPassword returned false for new password');
  console.log('   ✅ New password hash permanently saved to backend.');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 8: Verify Old Password "Arona@2026" is STRICTLY REJECTED everywhere
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 8: Verifying OLD password "Arona@2026" is REJECTED across all devices...');
  const dev1Rec = await getOwnerRecord(dev1Phone);
  const dev2Rec = await getOwnerRecord(dev2Phone);
  const laptopRec = await getOwnerRecord(laptopPhone);

  const oldMatchDev1 = await bcrypt.compare('Arona@2026', dev1Rec!.password_hash);
  const oldMatchDev2 = await bcrypt.compare('Arona@2026', dev2Rec!.password_hash);
  const oldMatchLaptop = await bcrypt.compare('Arona@2026', laptopRec!.password_hash);

  if (oldMatchDev1 || oldMatchDev2 || oldMatchLaptop) {
    throw new Error('Test 8 Failed: Old password was accepted after reset!');
  }
  console.log('   ✅ Old password "Arona@2026" REJECTED on Device 1, Device 2, and Laptop.');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 9: Verify NEW Password "AronaNew#789" is ACCEPTED across all devices
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 9: Verifying NEW password "AronaNew#789" is ACCEPTED across all devices...');
  const newMatchDev1 = await bcrypt.compare('AronaNew#789', dev1Rec!.password_hash);
  const newMatchDev2 = await bcrypt.compare('AronaNew#789', dev2Rec!.password_hash);
  const newMatchLaptop = await bcrypt.compare('AronaNew#789', laptopRec!.password_hash);

  if (!newMatchDev1 || !newMatchDev2 || !newMatchLaptop) {
    throw new Error('Test 9 Failed: New password was not accepted across all devices!');
  }
  console.log('   ✅ Device 1 -> "AronaNew#789" -> SUCCESS');
  console.log('   ✅ Device 2 -> "AronaNew#789" -> SUCCESS');
  console.log('   ✅ Laptop   -> "AronaNew#789" -> SUCCESS');

  console.log('\n========================================================================');
  console.log('🎉 ALL 9 TESTS PASSED: GLOBAL PASSWORD PERSISTENCE & CROSS-DEVICE VERIFIED!');
  console.log('========================================================================\n');
}

runComprehensiveOwnerPasswordTestSuite().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});

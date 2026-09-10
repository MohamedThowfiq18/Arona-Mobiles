import {
  createOwnerSession,
  verifyOwnerSession,
  getOwnerActiveSessions,
  revokeOwnerSessionById,
  revokeAllOtherOwnerSessions,
  isSessionRevoked,
} from '../lib/auth';

async function runMultiDeviceSessionTests() {
  console.log('========================================================');
  console.log('🧪 RUNNING ARONA MOBILES MULTI-DEVICE SESSION TEST SUITE');
  console.log('========================================================\n');

  const ownerPhone = '9787061617';
  const ownerId = 'owner-main';

  // Step 1: Create 3 distinct device sessions
  console.log('1. Creating 3 concurrent device sessions...');
  
  const tokenDev1 = await createOwnerSession(ownerId, ownerPhone);
  const sessionDev1 = await verifyOwnerSession(tokenDev1);
  if (!sessionDev1) throw new Error('Device 1 session verification failed');
  console.log('   ✓ Device 1 (Desktop) created. Session ID:', sessionDev1.sessionId);

  const tokenDev2 = await createOwnerSession(ownerId, ownerPhone);
  const sessionDev2 = await verifyOwnerSession(tokenDev2);
  if (!sessionDev2) throw new Error('Device 2 session verification failed');
  console.log('   ✓ Device 2 (Android) created. Session ID:', sessionDev2.sessionId);

  const tokenDev3 = await createOwnerSession(ownerId, ownerPhone);
  const sessionDev3 = await verifyOwnerSession(tokenDev3);
  if (!sessionDev3) throw new Error('Device 3 session verification failed');
  console.log('   ✓ Device 3 (iPhone) created. Session ID:', sessionDev3.sessionId);

  // Step 2: Fetch active sessions from Device 1's perspective
  console.log('\n2. Fetching active sessions from Device 1 perspective...');
  const activeSessions = await getOwnerActiveSessions(ownerPhone, sessionDev1.sessionId);
  console.log(`   Found ${activeSessions.length} active session(s):`);
  activeSessions.forEach((s, idx) => {
    console.log(`   [${idx + 1}] ${s.browser} · ${s.operatingSystem} (${s.deviceType}) | ID: ${s.id} | Current: ${s.isCurrent ? 'YES (✓)' : 'NO'}`);
  });

  const currentDev = activeSessions.find(s => s.id === sessionDev1.sessionId);
  if (!currentDev || !currentDev.isCurrent) {
    throw new Error('Device 1 was not correctly marked as current device!');
  }
  console.log('   ✓ Device 1 is correctly identified as Current Device.');

  // Step 3: From Device 1, revoke Device 2
  console.log('\n3. Device 1 revokes Device 2...');
  const revokeRes = await revokeOwnerSessionById(sessionDev2.sessionId, ownerPhone);
  if (!revokeRes.success) throw new Error('Revocation failed: ' + revokeRes.error);
  console.log('   ✓ Revoke API returned success for Device 2.');

  // Step 4: Verify Device 2 session is rejected on server verification
  console.log('\n4. Verifying Device 2 authorization status...');
  const isDev2Revoked = await isSessionRevoked(sessionDev2.sessionId, ownerPhone);
  const verifiedDev2 = await verifyOwnerSession(tokenDev2);
  console.log('   Device 2 isSessionRevoked:', isDev2Revoked);
  console.log('   Device 2 verifyOwnerSession returned:', verifiedDev2);

  if (!isDev2Revoked || verifiedDev2 !== null) {
    throw new Error('Security flaw: Device 2 session was not rejected after revocation!');
  }
  console.log('   ✓ Device 2 is strictly UNAUTHORIZED (returns null / 401).');

  // Step 5: Verify Device 1 and Device 3 are still fully authorized
  console.log('\n5. Verifying Device 1 and Device 3 remain logged in...');
  const verifiedDev1 = await verifyOwnerSession(tokenDev1);
  const verifiedDev3 = await verifyOwnerSession(tokenDev3);
  if (!verifiedDev1 || !verifiedDev3) {
    throw new Error('Device 1 or Device 3 was incorrectly logged out!');
  }
  console.log('   ✓ Device 1 is still authorized:', verifiedDev1.sessionId);
  console.log('   ✓ Device 3 is still authorized:', verifiedDev3.sessionId);

  // Step 6: Test "Sign Out All Other Devices" from Device 1
  console.log('\n6. Device 1 triggers "Sign Out All Other Devices"...');
  const revokeAllOthersRes = await revokeAllOtherOwnerSessions(sessionDev1.sessionId, ownerPhone);
  console.log('   Revoked other devices count:', revokeAllOthersRes.count);

  const verifiedDev3After = await verifyOwnerSession(tokenDev3);
  const verifiedDev1After = await verifyOwnerSession(tokenDev1);

  if (verifiedDev3After !== null) {
    throw new Error('Device 3 was not revoked by revokeAllOtherOwnerSessions!');
  }
  if (!verifiedDev1After) {
    throw new Error('Device 1 was accidentally revoked by revokeAllOtherOwnerSessions!');
  }
  console.log('   ✓ Device 3 is now revoked.');
  console.log('   ✓ Device 1 (current) remains active and authorized.');

  console.log('\n========================================================');
  console.log('🎉 ALL MULTI-DEVICE SESSION TESTS PASSED SUCCESSFULLY!');
  console.log('========================================================\n');
}

runMultiDeviceSessionTests().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});

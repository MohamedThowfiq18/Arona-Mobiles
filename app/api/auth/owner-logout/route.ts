import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie, getOwnerSessionFromRequest, revokeOwnerSessionById } from '@/lib/auth';
import { getClientIP, getDeviceFingerprint } from '@/lib/security';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const { userAgent } = getDeviceFingerprint(request);
  const session = await getOwnerSessionFromRequest(request);

  if (session) {
    if (session.sessionId) {
      await revokeOwnerSessionById(session.sessionId, session.phone || session.ownerId);
    }
    await logAuditEvent({
      ownerId: session.ownerId,
      action: 'LOGOUT',
      ipAddress: ip,
      userAgent,
      note: 'Owner logged out successfully',
    });
  }

  await clearSessionCookie();

  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  response.cookies.delete('arona_owner_session');
  return response;
}

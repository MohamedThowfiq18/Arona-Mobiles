import { NextRequest, NextResponse } from 'next/server';
import { getOwnerSessionFromRequest, revokeAllOtherOwnerSessions } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { getClientIP, getDeviceFingerprint } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getOwnerSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const res = await revokeAllOtherOwnerSessions(session.sessionId, session.phone || session.ownerId);

    const ip = getClientIP(request);
    const { userAgent } = getDeviceFingerprint(request);
    await logAuditEvent({
      ownerId: session.ownerId,
      action: 'ALL_OTHER_DEVICES_REVOKED',
      ipAddress: ip,
      userAgent,
      note: `Revoked ${res.count} other session(s)`,
    });

    return NextResponse.json({
      success: true,
      message: 'All other device sessions have been revoked.',
      count: res.count,
    });
  } catch (error: any) {
    console.error('[API /owner/sessions/revoke-others POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke other sessions.' },
      { status: 500 }
    );
  }
}

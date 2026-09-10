import { NextRequest, NextResponse } from 'next/server';
import { getOwnerSessionFromRequest, revokeOwnerSessionById } from '@/lib/auth';
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

    const body = await request.json().catch(() => ({}));
    const { sessionId } = body;

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'Session ID is required.' },
        { status: 400 }
      );
    }

    // Protection: do not allow normal remote revoke button to revoke current session
    // (Current session should use normal Sign Out)
    if (sessionId === session.sessionId) {
      return NextResponse.json(
        { error: 'To sign out your current device, please use the Sign Out button.' },
        { status: 400 }
      );
    }

    const res = await revokeOwnerSessionById(sessionId, session.phone || session.ownerId);

    if (!res.success) {
      return NextResponse.json(
        { error: res.error || 'Failed to revoke session.' },
        { status: 400 }
      );
    }

    const ip = getClientIP(request);
    const { userAgent } = getDeviceFingerprint(request);
    await logAuditEvent({
      ownerId: session.ownerId,
      action: 'DEVICE_REVOKED',
      ipAddress: ip,
      userAgent,
      note: `Revoked session ${sessionId}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Device session successfully revoked.',
    });
  } catch (error: any) {
    console.error('[API /owner/sessions/revoke POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke session.' },
      { status: 500 }
    );
  }
}

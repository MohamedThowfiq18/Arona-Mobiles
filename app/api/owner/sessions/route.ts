import { NextRequest, NextResponse } from 'next/server';
import { getOwnerSessionFromRequest, getOwnerActiveSessions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getOwnerSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const sessions = await getOwnerActiveSessions(
      session.phone || session.ownerId,
      session.sessionId
    );

    return NextResponse.json({
      success: true,
      currentSessionId: session.sessionId,
      sessions,
    });
  } catch (error: any) {
    console.error('[API /owner/sessions GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve active sessions.' },
      { status: 500 }
    );
  }
}

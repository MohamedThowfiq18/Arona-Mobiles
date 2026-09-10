import { NextRequest, NextResponse } from 'next/server';
import { getOwnerSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getOwnerSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { valid: false, reason: 'revoked', message: 'Session is invalid or has been revoked.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      sessionId: session.sessionId,
      ownerId: session.ownerId,
    });
  } catch {
    return NextResponse.json(
      { valid: false, reason: 'error', message: 'Session check failed.' },
      { status: 401 }
    );
  }
}

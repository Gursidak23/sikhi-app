/**
 * POST /api/community/user - Create a chat user (persisted to DB)
 * PUT /api/community/user - Update user presence (online/offline)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createOrGetUser, updateUserPresence, verifySessionToken } from '@/lib/api/chat-handlers';
import { createChatUserSchema, updatePresenceSchema } from '@/lib/validation/chat-schemas';
import { logApiError } from '@/lib/error-tracking';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createChatUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const user = await createOrGetUser(
      parsed.data.displayName,
      parsed.data.displayNameGurmukhi,
      parsed.data.avatarColor
    );

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    logApiError('POST /api/community/user', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = updatePresenceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'userId and isOnline are required' },
        { status: 400 }
      );
    }

    // Verify session token for presence update
    const sessionToken = request.headers.get('X-Session-Token') || body.sessionToken;
    if (sessionToken && !verifySessionToken(parsed.data.userId, sessionToken)) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const user = await updateUserPresence(parsed.data.userId, parsed.data.isOnline);
    return NextResponse.json({ user });
  } catch (error) {
    logApiError('PUT /api/community/user', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to update presence' },
      { status: 500 }
    );
  }
}

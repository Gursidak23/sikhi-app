/**
 * GET /api/community/rooms - List all active chat rooms
 * POST /api/community/rooms - Create a new chat room (requires auth)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getRooms, createRoom, ensureDefaultRooms, verifySessionToken } from '@/lib/api/chat-handlers';
import { createRoomSchema } from '@/lib/validation/chat-schemas';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { logApiError } from '@/lib/error-tracking';

let defaultRoomsEnsured = false;

export async function GET(request: NextRequest) {
  try {
    // Rate limit room listing
    const ip = getClientIdentifier(request);
    const rl = rateLimit(`chat-rooms-list:${ip}`, { limit: 60, windowSeconds: 60 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    if (!defaultRoomsEnsured) {
      await ensureDefaultRooms();
      defaultRoomsEnsured = true;
    }
    const rooms = await getRooms();
    return NextResponse.json({ rooms }, {
      headers: { 'Cache-Control': 's-maxage=10, stale-while-revalidate=30' },
    });
  } catch (error) {
    logApiError('GET /api/community/rooms', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit room creation: 3 per minute per IP
    const ip = getClientIdentifier(request);
    const rl = rateLimit(`chat-create-room:${ip}`, { limit: 3, windowSeconds: 60 });
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many room creation attempts.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = createRoomSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Require auth for room creation
    const sessionToken = request.headers.get('X-Session-Token') || body.sessionToken;
    const userId = body.userId;
    if (!sessionToken || !userId || !(await verifySessionToken(userId, sessionToken))) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const room = await createRoom(parsed.data);
    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    logApiError('POST /api/community/rooms', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}

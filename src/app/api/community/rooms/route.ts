/**
 * GET /api/community/rooms - List all active chat rooms
 * POST /api/community/rooms - Create a new chat room
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getRooms, createRoom, ensureDefaultRooms } from '@/lib/api/chat-handlers';
import { createRoomSchema } from '@/lib/validation/chat-schemas';
import { logApiError } from '@/lib/error-tracking';

export async function GET() {
  try {
    await ensureDefaultRooms();
    const rooms = await getRooms();
    return NextResponse.json({ rooms });
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
    const body = await request.json();
    const parsed = createRoomSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
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

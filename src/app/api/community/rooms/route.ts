/**
 * GET /api/community/rooms - List all active chat rooms
 * POST /api/community/rooms - Create a new chat room
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRooms, createRoom, ensureDefaultRooms } from '@/lib/api/chat-handlers';
import { createRoomSchema } from '@/lib/validation/chat-schemas';

export async function GET() {
  try {
    // Ensure default rooms exist on first call
    await ensureDefaultRooms();
    
    const rooms = await getRooms();
    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
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
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'A room with this name already exists' },
        { status: 409 }
      );
    }
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}

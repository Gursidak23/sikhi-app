/**
 * GET /api/community/rooms/[roomId] - Get room details + members
 * POST /api/community/rooms/[roomId] - Join room
 * DELETE /api/community/rooms/[roomId] - Leave room
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getRoomById, joinRoom, leaveRoom, getOnlineUsers } from '@/lib/api/chat-handlers';

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const room = await getRoomById(params.roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const members = await getOnlineUsers(params.roomId);
    return NextResponse.json({ room, members });
  } catch (error: any) {
    console.error('Error fetching room:', error?.message || error);
    return NextResponse.json({ error: 'Failed to fetch room details' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const body = await request.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const membership = await joinRoom(userId, params.roomId);
    return NextResponse.json({ membership }, { status: 200 });
  } catch (error: any) {
    const message = error?.message || 'Failed to join room';
    return NextResponse.json(
      { error: message },
      { status: message.includes('full') ? 409 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    await leaveRoom(userId, params.roomId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error leaving room:', error);
    return NextResponse.json({ error: 'Failed to leave room' }, { status: 500 });
  }
}

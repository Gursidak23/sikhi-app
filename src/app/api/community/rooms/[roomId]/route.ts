/**
 * GET /api/community/rooms/[roomId] - Get room details + members
 * POST /api/community/rooms/[roomId] - Join room
 * DELETE /api/community/rooms/[roomId] - Leave room
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getRoomById, joinRoom, leaveRoom, getRoomMembers, verifySessionToken } from '@/lib/api/chat-handlers';
import { logApiError } from '@/lib/error-tracking';

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const roomId = params.roomId;
    if (!roomId || roomId.length > 100) {
      return NextResponse.json({ error: 'Invalid room ID' }, { status: 400 });
    }

    const room = await getRoomById(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const members = await getRoomMembers(roomId);
    return NextResponse.json({ room, members });
  } catch (error) {
    logApiError('GET /api/community/rooms/[roomId]', error instanceof Error ? error : new Error(String(error)));
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

    // Verify session token
    const sessionToken = request.headers.get('X-Session-Token') || body.sessionToken;
    if (!sessionToken || !(await verifySessionToken(userId, sessionToken))) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const membership = await joinRoom(userId, params.roomId);
    return NextResponse.json({ membership }, { status: 200 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    const status = msg.includes('full') ? 409 : msg.includes('not found') ? 404 : 500;
    if (status === 500) {
      logApiError('POST /api/community/rooms/[roomId]', error instanceof Error ? error : new Error(String(error)));
    }
    return NextResponse.json(
      { error: status === 500 ? 'Failed to join room' : msg },
      { status }
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

    // Verify session token for leaving room
    const sessionToken = request.headers.get('X-Session-Token') || searchParams.get('sessionToken');
    if (!sessionToken || !(await verifySessionToken(userId, sessionToken))) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await leaveRoom(userId, params.roomId);
    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError('DELETE /api/community/rooms/[roomId]', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to leave room' }, { status: 500 });
  }
}

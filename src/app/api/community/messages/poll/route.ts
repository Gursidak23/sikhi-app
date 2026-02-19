/**
 * GET /api/community/messages/poll - Poll for new messages (in-memory)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { pollNewMessages, getOnlineUsers } from '@/lib/api/chat-handlers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const roomId = searchParams.get('roomId');
    const since = searchParams.get('since');

    if (!roomId || !since) {
      return NextResponse.json(
        { error: 'roomId and since parameters are required' },
        { status: 400 }
      );
    }

    const sinceDate = new Date(since);
    if (isNaN(sinceDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid since parameter. Use ISO 8601 format.' },
        { status: 400 }
      );
    }

    const [messages, members] = await Promise.all([
      pollNewMessages(roomId, sinceDate),
      getOnlineUsers(roomId),
    ]);

    return NextResponse.json({
      messages,
      members,
      serverTime: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error polling messages:', error?.message || error);
    return NextResponse.json({ error: 'Failed to poll messages' }, { status: 500 });
  }
}

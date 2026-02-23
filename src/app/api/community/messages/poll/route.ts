/**
 * GET /api/community/messages/poll - Poll for new messages
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { pollNewMessages, getRoomMembers, getTypingUsers, setTyping, clearTyping, verifySessionToken } from '@/lib/api/chat-handlers';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { logApiError } from '@/lib/error-tracking';

/** Max lookback for polling: 5 minutes. Prevents fetching entire room history. */
const MAX_POLL_LOOKBACK_MS = 5 * 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    // Rate limit polling: 120 per minute per IP (2/sec — generous for adaptive polling)
    const ip = getClientIdentifier(request);
    const rl = rateLimit(`chat-poll:${ip}`, { limit: 120, windowSeconds: 60 });
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Polling too fast. Please slow down.' },
        { status: 429, headers: { 'Retry-After': '2' } }
      );
    }

    const { searchParams } = request.nextUrl;
    const roomId = searchParams.get('roomId');
    const since = searchParams.get('since');

    if (!roomId || !since) {
      return NextResponse.json(
        { error: 'roomId and since parameters are required' },
        { status: 400 }
      );
    }

    let sinceDate = new Date(since);
    if (isNaN(sinceDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid since parameter. Use ISO 8601 format.' },
        { status: 400 }
      );
    }

    // Clamp: don't allow lookback older than MAX_POLL_LOOKBACK_MS
    const minSince = new Date(Date.now() - MAX_POLL_LOOKBACK_MS);
    if (sinceDate < minSince) {
      sinceDate = minSince;
    }

    const [messages, members] = await Promise.all([
      pollNewMessages(roomId, sinceDate),
      getRoomMembers(roomId),
    ]);

    // Get typing indicators (exclude requesting user)
    const userId = searchParams.get('userId') || undefined;
    const typing = getTypingUsers(roomId, userId);

    // If client is sending typing status, set/clear it (requires auth)
    const typingStatus = searchParams.get('typing');
    const typingName = searchParams.get('typingName');
    if (userId && typingStatus !== null) {
      const sessionToken = request.headers.get('X-Session-Token');
      if (sessionToken && (await verifySessionToken(userId, sessionToken))) {
        if (typingStatus === '1' && typingName) {
          setTyping(roomId, userId, typingName);
        } else if (typingStatus === '0') {
          clearTyping(roomId, userId);
        }
      }
    }

    return NextResponse.json({
      messages,
      members,
      typing,
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    logApiError('GET /api/community/messages/poll', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to poll messages' }, { status: 500 });
  }
}

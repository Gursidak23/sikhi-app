/**
 * GET /api/community/messages/poll - Poll for new messages
 * 
 * Optimizations:
 * - ETag/304 Not Modified: skips response body when nothing changed
 * - skipMembers param: client skips member fetch on most polls
 * - Poll-specific cache: prevents identical concurrent polls from hitting DB
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { pollNewMessages, getRoomMembers, getTypingUsers, setTyping, clearTyping, verifySessionToken } from '@/lib/api/chat-handlers';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { logApiError } from '@/lib/error-tracking';
import { createHash } from 'crypto';

/** Max lookback for polling: 5 minutes. Prevents fetching entire room history. */
const MAX_POLL_LOOKBACK_MS = 5 * 60 * 1000;

/** Generate a lightweight ETag from poll data */
function generateETag(messages: unknown[], memberCount: number, typing: string[]): string {
  const msgIds = Array.isArray(messages) ? messages.map((m: any) => m.id).join(',') : '';
  const raw = `${msgIds}|${memberCount}|${typing.join(',')}`;
  return `"${createHash('md5').update(raw).digest('hex').slice(0, 16)}"`;
}

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

    // If client sends skipMembers=1, skip the expensive member query
    const skipMembers = searchParams.get('skipMembers') === '1';

    const [messages, members] = await Promise.all([
      pollNewMessages(roomId, sinceDate),
      skipMembers ? Promise.resolve(null) : getRoomMembers(roomId),
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

    // Generate ETag for 304 Not Modified optimization
    const memberCount = members ? members.length : 0;
    const etag = generateETag(messages, memberCount, typing);
    const ifNoneMatch = request.headers.get('If-None-Match');
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304, headers: { ETag: etag } });
    }

    const body: Record<string, unknown> = {
      messages,
      typing,
      serverTime: new Date().toISOString(),
    };
    // Only include members when actually fetched
    if (members !== null) {
      body.members = members;
    }

    return NextResponse.json(body, {
      headers: {
        ETag: etag,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    logApiError('GET /api/community/messages/poll', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to poll messages' }, { status: 500 });
  }
}

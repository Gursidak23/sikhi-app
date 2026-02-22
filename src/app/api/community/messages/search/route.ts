/**
 * GET /api/community/messages/search - Search messages within a room
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { searchMessages, getPinnedMessages } from '@/lib/api/chat-handlers';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { logApiError } from '@/lib/error-tracking';

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIdentifier(request);
    const rl = rateLimit(`chat-search:${ip}`, { limit: 30, windowSeconds: 60 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = request.nextUrl;
    const roomId = searchParams.get('roomId');
    const query = searchParams.get('q');
    const pinned = searchParams.get('pinned');

    if (!roomId) {
      return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
    }

    // Return pinned messages if ?pinned=true
    if (pinned === 'true') {
      const results = await getPinnedMessages(roomId);
      return NextResponse.json({ pinned: results, total: results.length });
    }

    // Search messages
    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }
    if (query.length > 200) {
      return NextResponse.json({ error: 'Query too long' }, { status: 400 });
    }

    const limitStr = searchParams.get('limit');
    const limit = limitStr ? Math.min(parseInt(limitStr, 10) || 20, 50) : 20;

    const results = await searchMessages(roomId, query, limit);
    return NextResponse.json(results);
  } catch (error) {
    logApiError('GET /api/community/messages/search', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

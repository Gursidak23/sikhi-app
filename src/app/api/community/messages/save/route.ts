/**
 * POST /api/community/messages/save - Save a message (bookmark)
 * DELETE /api/community/messages/save - Unsave a message
 * GET /api/community/messages/save?userId=... - Get all saved messages
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { saveMessage, unsaveMessage, getSavedMessages, verifySessionToken } from '@/lib/api/chat-handlers';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { logApiError } from '@/lib/error-tracking';
import { z } from 'zod';

const saveSchema = z.object({
  userId: z.string().min(1),
  messageId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Verify session token
    const sessionToken = request.headers.get('X-Session-Token');
    if (!sessionToken || !(await verifySessionToken(userId, sessionToken))) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const saved = await getSavedMessages(userId);
    return NextResponse.json({ saved });
  } catch (error) {
    logApiError('GET /api/community/messages/save', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to fetch saved messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIdentifier(request);
    const rl = rateLimit(`chat-save:${ip}`, { limit: 60, windowSeconds: 60 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'userId and messageId are required' }, { status: 400 });
    }

    const sessionToken = request.headers.get('X-Session-Token');
    if (!sessionToken || !(await verifySessionToken(parsed.data.userId, sessionToken))) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const result = await saveMessage(parsed.data.userId, parsed.data.messageId);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('not found')) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    logApiError('POST /api/community/messages/save', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'userId and messageId are required' }, { status: 400 });
    }

    const sessionToken = request.headers.get('X-Session-Token');
    if (!sessionToken || !(await verifySessionToken(parsed.data.userId, sessionToken))) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const result = await unsaveMessage(parsed.data.userId, parsed.data.messageId);
    return NextResponse.json(result);
  } catch (error) {
    logApiError('DELETE /api/community/messages/save', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to unsave message' }, { status: 500 });
  }
}

/**
 * POST /api/community/messages/react - Toggle a reaction on a message
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, toggleReaction } from '@/lib/api/chat-handlers';
import { toggleReactionSchema } from '@/lib/validation/chat-schemas';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { logApiError } from '@/lib/error-tracking';

export async function POST(request: NextRequest) {
  try {
    // Rate limit reactions
    const ip = getClientIdentifier(request);
    const rl = rateLimit(`chat-react:${ip}`, { limit: 60, windowSeconds: 60 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const sessionToken = request.headers.get('X-Session-Token');

    const parsed = toggleReactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify session token
    if (!sessionToken || !(await verifySessionToken(parsed.data.userId, sessionToken))) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const result = await toggleReaction(parsed.data.userId, parsed.data.messageId, parsed.data.emoji);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to toggle reaction';
    logApiError('POST /api/community/messages/react', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/community/user - Create a chat user (persisted to DB)
 * PUT /api/community/user - Update user presence (online/offline)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createOrGetUser, updateUserPresence, updateUserProfile, verifySessionToken } from '@/lib/api/chat-handlers';
import { createChatUserSchema, updatePresenceSchema, updateProfileSchema } from '@/lib/validation/chat-schemas';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { logApiError } from '@/lib/error-tracking';

export async function POST(request: NextRequest) {
  try {
    // Rate limit user registration: 5 per minute per IP
    const ip = getClientIdentifier(request);
    const rl = rateLimit(`chat-register:${ip}`, { limit: 5, windowSeconds: 60 });
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please wait.' },
        { status: 429, headers: { 'Retry-After': Math.ceil((rl.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await request.json();
    const parsed = createChatUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const user = await createOrGetUser(
      parsed.data.displayName,
      parsed.data.displayNameGurmukhi,
      parsed.data.avatarColor,
      parsed.data.existingUserId,
      parsed.data.email
    );

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    logApiError('POST /api/community/user', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = updatePresenceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'userId and isOnline are required' },
        { status: 400 }
      );
    }

    // Verify session token for presence update (REQUIRED, not optional)
    const sessionToken = request.headers.get('X-Session-Token') || body.sessionToken;
    if (!sessionToken || !(await verifySessionToken(parsed.data.userId, sessionToken))) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await updateUserPresence(parsed.data.userId, parsed.data.isOnline);
    return NextResponse.json({ user });
  } catch (error) {
    logApiError('PUT /api/community/user', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to update presence' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ip = getClientIdentifier(request);
    const rl = rateLimit(`chat-profile:${ip}`, { limit: 10, windowSeconds: 60 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify session token
    const sessionToken = request.headers.get('X-Session-Token') || body.sessionToken;
    if (!sessionToken || !(await verifySessionToken(parsed.data.userId, sessionToken))) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { userId, ...profileData } = parsed.data;
    const user = await updateUserProfile(userId, profileData);
    return NextResponse.json({ user });
  } catch (error) {
    logApiError('PATCH /api/community/user', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

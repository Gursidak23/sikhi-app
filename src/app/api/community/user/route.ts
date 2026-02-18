/**
 * POST /api/community/user - Create or register a chat user
 * PUT /api/community/user - Update user presence (online/offline)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOrGetUser, updateUserPresence } from '@/lib/api/chat-handlers';
import { createChatUserSchema, updatePresenceSchema } from '@/lib/validation/chat-schemas';

export async function POST(request: NextRequest) {
  try {
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
      parsed.data.avatarColor
    );

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
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

    const user = await updateUserPresence(parsed.data.userId, parsed.data.isOnline);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating presence:', error);
    return NextResponse.json(
      { error: 'Failed to update presence' },
      { status: 500 }
    );
  }
}

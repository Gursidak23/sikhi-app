/**
 * POST /api/community/user - Create or register a chat user
 * PUT /api/community/user - Update user presence (online/offline)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOrGetUser, updateUserPresence } from '@/lib/api/chat-handlers';
import { createChatUserSchema, updatePresenceSchema } from '@/lib/validation/chat-schemas';

export async function POST(request: NextRequest) {
  try {
    // Check DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL environment variable is not set');
      return NextResponse.json(
        { error: 'Database not configured. Please set DATABASE_URL in environment variables.' },
        { status: 503 }
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
      parsed.data.avatarColor
    );

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);

    // Provide specific error messages for common Prisma/DB issues
    const message = error?.code === 'P1001'
      ? 'Cannot connect to database. Please check DATABASE_URL and ensure database is accessible.'
      : error?.code === 'P2021' || error?.code === 'P2002'
        ? 'Database schema not up to date. Run: npx prisma db push'
        : error?.message?.includes('Can\'t reach database')
          ? 'Database server unreachable. Check your connection string and network.'
          : 'Failed to create user. Check server logs for details.';

    return NextResponse.json(
      { error: message },
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

/**
 * POST /api/community/user - Create or register a chat user
 * PUT /api/community/user - Update user presence (online/offline)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createOrGetUser, updateUserPresence } from '@/lib/api/chat-handlers';
import { createChatUserSchema, updatePresenceSchema } from '@/lib/validation/chat-schemas';

export async function POST(request: NextRequest) {
  try {
    // Check DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL environment variable is not set');
      return NextResponse.json(
        { error: 'Database not configured. The DATABASE_URL environment variable must be set in Vercel project settings.' },
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
    console.error('Error creating user:', error?.message || error, 'Code:', error?.code);

    // Provide specific error messages for common Prisma/DB issues
    let message: string;
    let status = 500;

    if (error?.code === 'P1001' || error?.message?.includes('Can\'t reach database')) {
      message = 'Cannot connect to database. Please verify DATABASE_URL is correctly set in Vercel environment variables and the database is accessible.';
      status = 503;
    } else if (error?.code === 'P1002') {
      message = 'Database connection timed out. The database server may be unreachable from this deployment.';
      status = 503;
    } else if (error?.code === 'P2021') {
      message = 'Database table not found. Run: npx prisma db push';
      status = 503;
    } else if (error?.code === 'P2002') {
      message = 'A user with this name already exists. Please choose a different name.';
      status = 409;
    } else if (error?.code === 'P2010' || error?.message?.includes('Raw query failed')) {
      message = 'Database query failed. The database may need migration: npx prisma db push';
      status = 503;
    } else if (error?.message?.includes('ENOTFOUND') || error?.message?.includes('ECONNREFUSED')) {
      message = 'Database host not found. Check that DATABASE_URL contains the correct hostname.';
      status = 503;
    } else if (error?.message?.includes('SSL') || error?.message?.includes('certificate')) {
      message = 'Database SSL connection failed. Ensure your DATABASE_URL includes ?sslmode=require';
      status = 503;
    } else {
      message = `Failed to create user: ${error?.message || 'Unknown error'}. Check Vercel function logs for details.`;
    }

    return NextResponse.json(
      { error: message },
      { status }
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

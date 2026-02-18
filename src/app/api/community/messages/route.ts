/**
 * GET /api/community/messages - Get messages for a room (paginated)
 * POST /api/community/messages - Send a new message
 * DELETE /api/community/messages - Delete a message
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { sendMessage, getMessages, deleteMessage } from '@/lib/api/chat-handlers';
import { sendMessageSchema, editMessageSchema } from '@/lib/validation/chat-schemas';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const roomId = searchParams.get('roomId');
    const cursor = searchParams.get('cursor') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    if (!roomId) {
      return NextResponse.json(
        { error: 'roomId is required' },
        { status: 400 }
      );
    }

    const result = await getMessages(roomId, cursor, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 30 messages per minute per IP
    const ip = getClientIdentifier(request);
    const rateLimitResult = rateLimit(`chat-send:${ip}`, { limit: 30, windowSeconds: 60 });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many messages. Please slow down.' },
        { status: 429, headers: { 'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await request.json();
    const parsed = sendMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const message = await sendMessage(parsed.data);
    return NextResponse.json({ message }, { status: 201 });
  } catch (error: any) {
    const errorMsg = error?.message || 'Failed to send message';
    const status = errorMsg.includes('join') ? 403 : 500;
    return NextResponse.json({ error: errorMsg }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = editMessageSchema.omit({ content: true }).safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'messageId and userId are required' },
        { status: 400 }
      );
    }

    await deleteMessage(parsed.data.messageId, parsed.data.userId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to delete message' },
      { status: 403 }
    );
  }
}

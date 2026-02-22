/**
 * Admin API Routes for Community Management
 * 
 * POST /api/community/admin - Admin actions (ban, unban, delete message, pin, set role)
 * All actions require admin/moderator session token
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  verifySessionToken,
  banUser,
  unbanUser,
  adminDeleteMessage,
  togglePinMessage,
  setUserRole,
  isAdminOrModerator,
} from '@/lib/api/chat-handlers';
import {
  adminBanUserSchema,
  adminDeleteMessageSchema,
  adminPinMessageSchema,
} from '@/lib/validation/chat-schemas';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { logApiError } from '@/lib/error-tracking';

export async function POST(request: NextRequest) {
  try {
    // Rate limit admin actions
    const ip = getClientIdentifier(request);
    const rl = rateLimit(`admin-action:${ip}`, { limit: 30, windowSeconds: 60 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { action, userId, sessionToken, ...payload } = body;

    // Verify session token
    if (!userId || !sessionToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const tokenValid = await verifySessionToken(userId, sessionToken);
    if (!tokenValid) {
      return NextResponse.json({ error: 'Invalid session token' }, { status: 401 });
    }

    // Verify admin/moderator role
    const hasPermission = await isAdminOrModerator(userId);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Admin or moderator privileges required' }, { status: 403 });
    }

    switch (action) {
      case 'ban': {
        const parsed = adminBanUserSchema.safeParse(payload);
        if (!parsed.success) {
          return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const result = await banUser(userId, parsed.data.targetUserId, parsed.data.reason, parsed.data.durationHours);
        return NextResponse.json({ success: true, ...result });
      }

      case 'unban': {
        if (!payload.targetUserId) {
          return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 });
        }
        const result = await unbanUser(userId, payload.targetUserId);
        return NextResponse.json({ success: true, ...result });
      }

      case 'deleteMessage': {
        const parsed = adminDeleteMessageSchema.safeParse(payload);
        if (!parsed.success) {
          return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const result = await adminDeleteMessage(userId, parsed.data.messageId, parsed.data.reason);
        return NextResponse.json({ success: true, ...result });
      }

      case 'pin': {
        const parsed = adminPinMessageSchema.safeParse(payload);
        if (!parsed.success) {
          return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const result = await togglePinMessage(userId, parsed.data.messageId);
        return NextResponse.json({ success: true, ...result });
      }

      case 'setRole': {
        const { targetUserId, role } = payload;
        if (!targetUserId || !['member', 'moderator', 'admin'].includes(role)) {
          return NextResponse.json({ error: 'targetUserId and valid role required' }, { status: 400 });
        }
        const result = await setUserRole(userId, targetUserId, role);
        return NextResponse.json({ success: true, ...result });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Admin action failed';
    logApiError('POST /api/community/admin', error instanceof Error ? error : new Error(String(error)));

    // Return specific error messages for known cases
    if (message.includes('privileges required') || message.includes('Only admins')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.includes('not found') || message.includes('Cannot ban')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Community Chat API Handlers — PostgreSQL via Prisma
 *
 * All chat state is persisted to the database using the ChatUser, ChatRoom,
 * ChatMessage, and ChatRoomMember Prisma models.
 *
 * Storage strategy: auto-prune to keep DB lightweight.
 *   - Max 200 messages per room (oldest deleted automatically)
 *   - Inactive users cleaned up after 7 days
 *   - Soft-deleted messages hard-deleted after 24 hours
 *   Total max footprint: ~5 rooms × 200 msgs ≈ 1,000 rows ≈ 500KB
 *
 * Session tokens provide lightweight authentication — the token is generated
 * on user creation and must accompany all mutating requests.
 */

import { prisma } from '@/lib/db/prisma';
import { randomBytes, createHash } from 'crypto';

// ============================================================================
// Auto-Pruning — keeps DB small
// ============================================================================

/** Max messages kept per room before oldest are hard-deleted */
const MAX_MESSAGES_PER_ROOM = 200;

/** Hard-delete messages beyond the cap for a given room */
async function pruneRoomMessages(roomId: string) {
  try {
    const count = await prisma.chatMessage.count({ where: { roomId } });
    if (count <= MAX_MESSAGES_PER_ROOM) return;

    // Find the cutoff: the Nth newest message's createdAt
    const keepBoundary = await prisma.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
      skip: MAX_MESSAGES_PER_ROOM,
      take: 1,
      select: { createdAt: true },
    });

    if (keepBoundary.length > 0) {
      await prisma.chatMessage.deleteMany({
        where: {
          roomId,
          createdAt: { lte: keepBoundary[0].createdAt },
        },
      });
    }
  } catch {
    // Non-critical — will retry on next message send
  }
}

/** Periodic cleanup: hard-delete soft-deleted messages older than 24h,
 *  and remove users inactive for 7+ days (and their memberships). */
let lastCleanup = 0;
async function maybeRunCleanup() {
  const now = Date.now();
  // Run at most once every 10 minutes
  if (now - lastCleanup < 10 * 60 * 1000) return;
  lastCleanup = now;

  try {
    // Hard-delete soft-deleted messages older than 24 hours
    await prisma.chatMessage.deleteMany({
      where: {
        isDeleted: true,
        updatedAt: { lt: new Date(now - 24 * 60 * 60 * 1000) },
      },
    });

    // Mark users offline if not seen in 2 minutes
    await prisma.chatUser.updateMany({
      where: {
        isOnline: true,
        lastSeenAt: { lt: new Date(now - 2 * 60 * 1000) },
      },
      data: { isOnline: false },
    });

    // Delete users inactive for 7+ days (cascades to memberships & messages)
    await prisma.chatUser.deleteMany({
      where: {
        lastSeenAt: { lt: new Date(now - 7 * 24 * 60 * 60 * 1000) },
      },
    });
  } catch {
    // Non-critical background cleanup
  }
}

// ============================================================================
// Session Token Management
// ============================================================================

/**
 * Generate a cryptographically secure session token.
 * Returns { raw, hashed } — raw is sent to client, hashed is stored.
 */
function generateSessionToken(): { raw: string; hashed: string } {
  const raw = randomBytes(32).toString('hex');
  const hashed = createHash('sha256').update(raw).digest('hex');
  return { raw, hashed };
}

/**
 * Hash a raw token for comparison against stored hash.
 */
function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

// Session token hashes: userId -> hashed token.
// Lives in memory — if serverless cold-starts, user re-registers
// (chat history persists in DB regardless).
const sessionTokens = new Map<string, string>();

/**
 * Verify that a raw session token matches the stored hash for a userId.
 */
export function verifySessionToken(userId: string, rawToken: string): boolean {
  const stored = sessionTokens.get(userId);
  if (!stored) return false;
  return stored === hashToken(rawToken);
}

// ============================================================================
// HTML / XSS Sanitization
// ============================================================================

/**
 * Robust text sanitizer — strips ALL HTML, script URIs, event handlers,
 * and control characters. Much safer than a single regex strip.
 */
function sanitizeContent(input: string): string {
  let text = input;

  // 1. Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // 2. Remove all HTML tags (including malformed ones)
  text = text.replace(/<\/?[a-zA-Z][^>]*?\/?>/g, '');
  text = text.replace(/<[a-zA-Z][^>]*$/gm, ''); // unclosed tags at end of line

  // 3. Remove javascript: and data: URIs
  text = text.replace(/\b(javascript|data|vbscript)\s*:/gi, '');

  // 4. Remove event handler patterns (onXxx=...)
  text = text.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '');
  text = text.replace(/\bon\w+\s*=\s*\S+/gi, '');

  // 5. Decode HTML entities that could hide payloads, then re-strip
  text = text.replace(/&#x([0-9a-f]+);?/gi, (_, hex: string) =>
    String.fromCharCode(parseInt(hex, 16))
  );
  text = text.replace(/&#(\d+);?/g, (_, dec: string) =>
    String.fromCharCode(parseInt(dec, 10))
  );
  text = text.replace(/<\/?[a-zA-Z][^>]*?\/?>/g, '');

  // 6. Remove null bytes and control chars (except newlines/tabs)
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return text.trim();
}

// ============================================================================
// Default Rooms Seeding
// ============================================================================

const DEFAULT_ROOMS = [
  {
    name: 'General',
    nameGurmukhi: 'ਆਮ ਗੱਲਬਾਤ',
    description: 'General discussion for the Sangat',
    descriptionGurmukhi: 'ਸੰਗਤ ਲਈ ਆਮ ਵਿਚਾਰ',
    icon: '🏠',
    isDefault: true,
    isActive: true,
    maxMembers: 500,
  },
  {
    name: 'Gurbani Vichar',
    nameGurmukhi: 'ਗੁਰਬਾਣੀ ਵਿਚਾਰ',
    description: 'Discuss Gurbani meanings and interpretations',
    descriptionGurmukhi: 'ਗੁਰਬਾਣੀ ਦੇ ਅਰਥ ਅਤੇ ਵਿਆਖਿਆ ਬਾਰੇ ਗੱਲਬਾਤ',
    icon: '📖',
    isDefault: true,
    isActive: true,
    maxMembers: 500,
  },
  {
    name: 'Sikh History',
    nameGurmukhi: 'ਸਿੱਖ ਇਤਿਹਾਸ',
    description: 'Discuss Sikh history and events',
    descriptionGurmukhi: 'ਸਿੱਖ ਇਤਿਹਾਸ ਅਤੇ ਘਟਨਾਵਾਂ ਬਾਰੇ ਵਿਚਾਰ',
    icon: '📜',
    isDefault: true,
    isActive: true,
    maxMembers: 500,
  },
  {
    name: 'Kirtan & Sangeet',
    nameGurmukhi: 'ਕੀਰਤਨ ਤੇ ਸੰਗੀਤ',
    description: 'Share and discuss Kirtan, Raags, and Sikh music',
    descriptionGurmukhi: 'ਕੀਰਤਨ, ਰਾਗ, ਅਤੇ ਸਿੱਖ ਸੰਗੀਤ ਬਾਰੇ ਸਾਂਝਾ ਕਰੋ',
    icon: '🎵',
    isDefault: false,
    isActive: true,
    maxMembers: 500,
  },
  {
    name: 'Newcomers',
    nameGurmukhi: 'ਨਵੇਂ ਆਏ',
    description: 'Welcome area for those new to Sikhi',
    descriptionGurmukhi: 'ਸਿੱਖੀ ਵਿੱਚ ਨਵੇਂ ਆਏ ਲਈ ਸੁਆਗਤ',
    icon: '🌱',
    isDefault: false,
    isActive: true,
    maxMembers: 500,
  },
];

let defaultRoomsEnsured = false;

/**
 * Ensure default rooms exist in the database (upsert by name).
 * Runs once per server instance then skips.
 */
export async function ensureDefaultRooms() {
  if (defaultRoomsEnsured) return;
  for (const room of DEFAULT_ROOMS) {
    await prisma.chatRoom.upsert({
      where: { name: room.name },
      update: {},
      create: room,
    });
  }
  defaultRoomsEnsured = true;
}

// ============================================================================
// Response Builders
// ============================================================================

function userToResponse(u: {
  id: string;
  displayName: string;
  displayNameGurmukhi: string | null;
  avatarColor: string;
  isOnline: boolean;
  lastSeenAt: Date;
}) {
  return {
    id: u.id,
    displayName: u.displayName,
    displayNameGurmukhi: u.displayNameGurmukhi,
    avatarColor: u.avatarColor,
    isOnline: u.isOnline,
    lastSeenAt: u.lastSeenAt.toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function messageToResponse(m: any) {
  const user = m.user || {};
  let replyTo = null;
  if (m.replyTo) {
    replyTo = {
      id: m.replyTo.id,
      content: m.replyTo.content,
      user: { displayName: m.replyTo.user?.displayName || 'Unknown' },
    };
  }

  return {
    id: m.id,
    content: m.content,
    userId: m.userId,
    roomId: m.roomId,
    isEdited: m.isEdited,
    isDeleted: m.isDeleted,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
    updatedAt: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
    user: {
      id: user.id || m.userId,
      displayName: user.displayName || 'Unknown',
      displayNameGurmukhi: user.displayNameGurmukhi || null,
      avatarColor: user.avatarColor || '#888',
    },
    replyTo,
  };
}

// ============================================================================
// User Handlers
// ============================================================================

export async function createOrGetUser(
  displayName: string,
  displayNameGurmukhi?: string,
  avatarColor?: string
) {
  const color = avatarColor || getRandomColor();

  const user = await prisma.chatUser.create({
    data: {
      displayName,
      displayNameGurmukhi: displayNameGurmukhi || null,
      avatarColor: color,
      isOnline: true,
      lastSeenAt: new Date(),
    },
  });

  // Generate session token
  const { raw, hashed } = generateSessionToken();
  sessionTokens.set(user.id, hashed);

  // Auto-join default rooms
  const defaultRooms = await prisma.chatRoom.findMany({
    where: { isDefault: true, isActive: true },
  });

  for (const room of defaultRooms) {
    await prisma.chatRoomMember.upsert({
      where: { userId_roomId: { userId: user.id, roomId: room.id } },
      update: {},
      create: { userId: user.id, roomId: room.id },
    });
  }

  return {
    ...userToResponse(user),
    sessionToken: raw, // sent ONCE to client on creation
  };
}

export async function updateUserPresence(userId: string, isOnline: boolean) {
  try {
    const user = await prisma.chatUser.update({
      where: { id: userId },
      data: { isOnline, lastSeenAt: new Date() },
    });
    return userToResponse(user);
  } catch {
    return null;
  }
}

export async function getOnlineUsers(roomId: string) {
  const members = await prisma.chatRoomMember.findMany({
    where: { roomId },
    include: { user: true },
  });

  return members.map((m) => userToResponse(m.user));
}

// ============================================================================
// Room Handlers
// ============================================================================

export async function getRooms() {
  const rooms = await prisma.chatRoom.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { members: true, messages: true } },
    },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  });

  return rooms.map((r) => ({
    id: r.id,
    name: r.name,
    nameGurmukhi: r.nameGurmukhi,
    description: r.description,
    descriptionGurmukhi: r.descriptionGurmukhi,
    icon: r.icon,
    isDefault: r.isDefault,
    isActive: r.isActive,
    _count: {
      members: r._count.members,
      messages: r._count.messages,
    },
  }));
}

export async function getRoomById(roomId: string) {
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: {
      _count: { select: { members: true, messages: true } },
    },
  });

  if (!room) return null;

  return {
    id: room.id,
    name: room.name,
    nameGurmukhi: room.nameGurmukhi,
    description: room.description,
    descriptionGurmukhi: room.descriptionGurmukhi,
    icon: room.icon,
    isDefault: room.isDefault,
    isActive: room.isActive,
    _count: {
      members: room._count.members,
      messages: room._count.messages,
    },
  };
}

export async function createRoom(data: {
  name: string;
  nameGurmukhi?: string;
  description?: string;
  descriptionGurmukhi?: string;
  icon?: string;
}) {
  const room = await prisma.chatRoom.create({
    data: {
      name: data.name,
      nameGurmukhi: data.nameGurmukhi || null,
      description: data.description || null,
      descriptionGurmukhi: data.descriptionGurmukhi || null,
      icon: data.icon || '💬',
      isDefault: false,
      isActive: true,
      maxMembers: 500,
    },
    include: {
      _count: { select: { members: true, messages: true } },
    },
  });

  return {
    id: room.id,
    name: room.name,
    nameGurmukhi: room.nameGurmukhi,
    description: room.description,
    descriptionGurmukhi: room.descriptionGurmukhi,
    icon: room.icon,
    isDefault: room.isDefault,
    isActive: room.isActive,
    _count: {
      members: room._count.members,
      messages: room._count.messages,
    },
  };
}

export async function joinRoom(userId: string, roomId: string) {
  const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
  if (!room || !room.isActive) {
    throw new Error('Room not found or inactive');
  }

  const memberCount = await prisma.chatRoomMember.count({ where: { roomId } });
  if (memberCount >= room.maxMembers) {
    throw new Error('Room is full');
  }

  await prisma.chatRoomMember.upsert({
    where: { userId_roomId: { userId, roomId } },
    update: {},
    create: { userId, roomId },
  });

  return { userId, roomId };
}

export async function leaveRoom(userId: string, roomId: string) {
  const result = await prisma.chatRoomMember.deleteMany({
    where: { userId, roomId },
  });
  return { count: result.count };
}

// ============================================================================
// Message Handlers
// ============================================================================

export async function sendMessage(data: {
  content: string;
  userId: string;
  roomId: string;
  replyToId?: string;
}) {
  // Verify membership
  const membership = await prisma.chatRoomMember.findUnique({
    where: { userId_roomId: { userId: data.userId, roomId: data.roomId } },
  });
  if (!membership) {
    throw new Error('You must join this room to send messages');
  }

  const sanitizedContent = sanitizeContent(data.content);
  if (!sanitizedContent) {
    throw new Error('Message cannot be empty after sanitization');
  }

  const message = await prisma.chatMessage.create({
    data: {
      content: sanitizedContent,
      userId: data.userId,
      roomId: data.roomId,
      replyToId: data.replyToId || null,
    },
    include: {
      user: true,
      replyTo: { include: { user: true } },
    },
  });

  // Update user presence (non-critical)
  await prisma.chatUser.update({
    where: { id: data.userId },
    data: { lastSeenAt: new Date(), isOnline: true },
  }).catch(() => {});

  // Auto-prune: keep DB small by removing old messages beyond cap
  // Runs async — doesn't block the response
  pruneRoomMessages(data.roomId).catch(() => {});

  // Periodic background cleanup (stale users, soft-deleted messages)
  maybeRunCleanup().catch(() => {});

  return messageToResponse(message);
}

export async function getMessages(roomId: string, cursor?: string, limit = 50) {
  const safeLimit = Math.min(limit, 100);

  if (cursor) {
    const cursorMsg = await prisma.chatMessage.findUnique({ where: { id: cursor } });
    if (cursorMsg) {
      const msgs = await prisma.chatMessage.findMany({
        where: {
          roomId,
          isDeleted: false,
          createdAt: { lt: cursorMsg.createdAt },
        },
        orderBy: { createdAt: 'desc' },
        take: safeLimit,
        include: {
          user: true,
          replyTo: { include: { user: true } },
        },
      });

      const sorted = msgs.reverse();
      const hasMore = msgs.length === safeLimit;

      return {
        messages: sorted.map(messageToResponse),
        nextCursor: hasMore ? sorted[0]?.id : undefined,
        hasMore,
      };
    }
  }

  // Default: fetch latest messages
  const msgs = await prisma.chatMessage.findMany({
    where: { roomId, isDeleted: false },
    orderBy: { createdAt: 'desc' },
    take: safeLimit,
    include: {
      user: true,
      replyTo: { include: { user: true } },
    },
  });

  const sorted = msgs.reverse();
  const hasMore = msgs.length === safeLimit;

  return {
    messages: sorted.map(messageToResponse),
    nextCursor: hasMore ? sorted[0]?.id : undefined,
    hasMore,
  };
}

export async function pollNewMessages(roomId: string, since: Date) {
  const msgs = await prisma.chatMessage.findMany({
    where: {
      roomId,
      isDeleted: false,
      createdAt: { gt: since },
    },
    orderBy: { createdAt: 'asc' },
    take: 100,
    include: {
      user: true,
      replyTo: { include: { user: true } },
    },
  });

  return msgs.map(messageToResponse);
}

export async function deleteMessage(messageId: string, userId: string) {
  const msg = await prisma.chatMessage.findUnique({ where: { id: messageId } });
  if (!msg || msg.userId !== userId) {
    throw new Error('Message not found or unauthorized');
  }

  const updated = await prisma.chatMessage.update({
    where: { id: messageId },
    data: {
      isDeleted: true,
      content: '[Message deleted]',
    },
    include: {
      user: true,
      replyTo: { include: { user: true } },
    },
  });

  return messageToResponse(updated);
}

// ============================================================================
// Helpers
// ============================================================================

const AVATAR_COLORS = [
  '#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#F97316', '#14B8A6', '#6366F1', '#84CC16',
  '#06B6D4', '#A855F7', '#E11D48', '#0EA5E9', '#D946EF',
];

function getRandomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

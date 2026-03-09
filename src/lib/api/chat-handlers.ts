/**
 * Community Chat API Handlers — PostgreSQL via Prisma
 *
 * All chat state is persisted to the database using the ChatUser, ChatRoom,
 * ChatMessage, SavedMessage, and ChatRoomMember Prisma models.
 *
 * Storage strategy: EPHEMERAL messages (Snapchat-style).
 *   - Messages auto-expire after 12 hours
 *   - Users can "save" messages to preserve them beyond expiry
 *   - Inactive users cleaned up after 7 days
 *   - Max 200 messages per room (oldest deleted automatically)
 *
 * Session tokens provide lightweight authentication — the token is generated
 * on user creation and must accompany all mutating requests.
 */

import { prisma } from '@/lib/db/prisma';
import { randomBytes, createHash } from 'crypto';
import { cacheGet, cacheSet, cacheDel, CACHE_KEYS, CACHE_TTL } from '@/lib/db/redis';

/** Default message lifetime in hours */
const MESSAGE_LIFETIME_HOURS = 12;

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

/** Periodic cleanup: delete expired messages, stale users, etc.
 *  Runs at most once every 5 minutes. */
let lastCleanup = 0;
async function maybeRunCleanup() {
  const now = Date.now();
  // Run at most once every 5 minutes
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;

  try {
    // 1. Delete expired messages (past expiresAt) that are NOT saved by anyone
    const expiredMessages = await prisma.chatMessage.findMany({
      where: {
        expiresAt: { lt: new Date() },
        savedBy: { none: {} },
      },
      select: { id: true },
    });
    if (expiredMessages.length > 0) {
      await prisma.chatMessage.deleteMany({
        where: { id: { in: expiredMessages.map((m) => m.id) } },
      });
    }

    // 2. Hard-delete soft-deleted messages older than 1 hour
    await prisma.chatMessage.deleteMany({
      where: {
        isDeleted: true,
        updatedAt: { lt: new Date(now - 60 * 60 * 1000) },
      },
    });

    // 3. Mark users offline if not seen in 2 minutes
    await prisma.chatUser.updateMany({
      where: {
        isOnline: true,
        lastSeenAt: { lt: new Date(now - 2 * 60 * 1000) },
      },
      data: { isOnline: false },
    });

    // 4. Delete users inactive for 7+ days (cascades to memberships & messages)
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

// In-memory session cache: userId -> { hash, timestamp }.
// Bounded to prevent unbounded memory growth. TTL = 30 min.
const SESSION_CACHE_MAX = 500;
const SESSION_CACHE_TTL_MS = 30 * 60 * 1000;
const sessionTokenCache = new Map<string, { hash: string; ts: number }>();

function sessionCacheSet(userId: string, hash: string) {
  // Evict oldest entry if at capacity
  if (sessionTokenCache.size >= SESSION_CACHE_MAX) {
    const firstKey = sessionTokenCache.keys().next().value;
    if (firstKey) sessionTokenCache.delete(firstKey);
  }
  sessionTokenCache.set(userId, { hash, ts: Date.now() });
}

function sessionCacheGet(userId: string): string | null {
  const entry = sessionTokenCache.get(userId);
  if (!entry) return null;
  if (Date.now() - entry.ts > SESSION_CACHE_TTL_MS) {
    sessionTokenCache.delete(userId);
    return null;
  }
  return entry.hash;
}

/**
 * Verify that a raw session token matches the stored hash for a userId.
 * Checks in-memory cache first, falls back to DB lookup (survives cold starts).
 */
export async function verifySessionToken(userId: string, rawToken: string): Promise<boolean> {
  const hashed = hashToken(rawToken);

  // Fast path: check in-memory cache
  const cached = sessionCacheGet(userId);
  if (cached) {
    return cached === hashed;
  }

  // Slow path: check DB (survives cold starts)
  try {
    const user = await prisma.chatUser.findUnique({
      where: { id: userId },
      select: { sessionTokenHash: true },
    });
    if (user?.sessionTokenHash) {
      // Populate cache for next time
      sessionCacheSet(userId, user.sessionTokenHash);
      return user.sessionTokenHash === hashed;
    }
  } catch {
    // DB error — deny
  }

  return false;
}

// ============================================================================
// HTML / XSS Sanitization
// ============================================================================

/**
 * Robust text sanitizer — strips ALL HTML, script URIs, event handlers,
 * and control characters. Much safer than a single regex strip.
 */
function sanitizeContent(input: string): string {
  // Preserve image data URLs — only sanitize the caption text
  const imgMatch = input.match(/^(\[IMG\])(data:image\/[a-zA-Z+]+;base64,[A-Za-z0-9+/=]+)(\[\/IMG\])([\s\S]*)$/);
  if (imgMatch) {
    const [, open, dataUrl, close, caption] = imgMatch;
    return open + dataUrl + close + sanitizeText(caption);
  }
  return sanitizeText(input);
}

function sanitizeText(input: string): string {
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

/**
 * Basic content moderation filter.
 * Returns { safe: true } if the message is acceptable,
 * or { safe: false, reason: string } if it should be rejected.
 * This is a lightweight first-pass — not a substitute for human moderation.
 */
function moderateContent(text: string): { safe: boolean; reason?: string } {
  const lower = text.toLowerCase();

  // Block common profanity / slurs (partial list; expand as needed)
  const blockedPatterns = [
    /\bf+u+c+k+/i,
    /\bs+h+i+t+(?!kar)/i, // "shitkar" could be Gurmukhi transliteration edge case
    /\bb+i+t+c+h+/i,
    /\ba+s+s+h+o+l+e/i,
    /\bn+i+g+g+/i,
    /\bf+a+g+(?:g+o+t+)?/i,
    /\bc+u+n+t+/i,
    /\bretard/i,
    /\bkill\s+(your|my|him|her|them)self/i,
  ];

  for (const pattern of blockedPatterns) {
    if (pattern.test(lower)) {
      return { safe: false, reason: 'Message contains inappropriate language' };
    }
  }

  // Block excessive caps (spam indicator) — more than 70% caps in messages > 10 chars
  if (text.length > 10) {
    const capsCount = (text.match(/[A-Z]/g) || []).length;
    const letterCount = (text.match(/[a-zA-Z]/g) || []).length;
    if (letterCount > 0 && capsCount / letterCount > 0.7) {
      return { safe: false, reason: 'Please avoid excessive use of capital letters' };
    }
  }

  // Block spam-like repetition (same char repeated 10+ times)
  if (/(.)\1{9,}/i.test(text)) {
    return { safe: false, reason: 'Message contains repetitive content' };
  }

  return { safe: true };
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
 * Runs once per server instance then skips. Uses $transaction for speed.
 */
export async function ensureDefaultRooms() {
  if (defaultRoomsEnsured) return;
  await prisma.$transaction(
    DEFAULT_ROOMS.map((room) =>
      prisma.chatRoom.upsert({
        where: { name: room.name },
        update: {},
        create: room,
      })
    )
  );
  defaultRoomsEnsured = true;
}

// ============================================================================
// Response Builders
// ============================================================================

/**
 * Reusable Prisma select for ChatUser to avoid leaking sessionTokenHash
 * and other sensitive fields. Use as `include: { user: { select: SAFE_USER_SELECT } }`.
 */
const SAFE_USER_SELECT = {
  id: true,
  displayName: true,
  displayNameGurmukhi: true,
  email: true,
  bio: true,
  role: true,
  avatarColor: true,
  isOnline: true,
  isBanned: true,
  lastSeenAt: true,
} as const;

function userToResponse(u: {
  id: string;
  displayName: string;
  displayNameGurmukhi: string | null;
  email?: string | null;
  bio?: string | null;
  role?: string;
  avatarColor: string;
  isOnline: boolean;
  isBanned?: boolean;
  lastSeenAt: Date;
}) {
  return {
    id: u.id,
    displayName: u.displayName,
    displayNameGurmukhi: u.displayNameGurmukhi,
    email: u.email || null,
    bio: u.bio || null,
    role: u.role || 'member',
    avatarColor: u.avatarColor,
    isOnline: u.isOnline,
    isBanned: u.isBanned || false,
    lastSeenAt: u.lastSeenAt.toISOString(),
  };
}

// ============================================================================
// Typing Indicators — in-memory, no DB needed
// ============================================================================

/** roomId -> Map<userId, { displayName, expiresAt }> */
const typingUsers = new Map<string, Map<string, { displayName: string; expiresAt: number }>>();

const TYPING_EXPIRY_MS = 4000; // Typing indicator expires after 4s

export function setTyping(roomId: string, userId: string, displayName: string) {
  if (!typingUsers.has(roomId)) {
    typingUsers.set(roomId, new Map());
  }
  typingUsers.get(roomId)!.set(userId, {
    displayName,
    expiresAt: Date.now() + TYPING_EXPIRY_MS,
  });
}

export function clearTyping(roomId: string, userId: string) {
  typingUsers.get(roomId)?.delete(userId);
}

export function getTypingUsers(roomId: string, excludeUserId?: string): string[] {
  const room = typingUsers.get(roomId);
  if (!room) return [];

  const now = Date.now();
  const names: string[] = [];
  for (const [uid, data] of Array.from(room.entries())) {
    if (data.expiresAt < now) {
      room.delete(uid);
      continue;
    }
    if (uid !== excludeUserId) {
      names.push(data.displayName);
    }
  }
  return names;
}

// ============================================================================
// Response Builders (continued)
// ============================================================================

interface MessageWithRelations {
  id: string;
  content: string;
  userId: string;
  roomId: string;
  isEdited: boolean;
  isDeleted: boolean;
  isPinned?: boolean;
  editedAt?: Date | string | null;
  expiresAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  savedBy?: { id: string }[];
  reactions?: { emoji: string; userId: string }[];
  user?: {
    id: string;
    displayName: string;
    displayNameGurmukhi: string | null;
    avatarColor: string;
  } | null;
  replyTo?: {
    id: string;
    content: string;
    user?: { displayName: string } | null;
  } | null;
}

function messageToResponse(m: MessageWithRelations, requestUserId?: string) {
  const user = m.user || {} as { id?: string; displayName?: string; displayNameGurmukhi?: string | null; avatarColor?: string };
  let replyTo = null;
  if (m.replyTo) {
    replyTo = {
      id: m.replyTo.id,
      content: m.replyTo.content,
      user: { displayName: m.replyTo.user?.displayName || 'Unknown' },
    };
  }

  const expiresAt = m.expiresAt instanceof Date ? m.expiresAt.toISOString() : m.expiresAt;
  // Check if this message has been saved (by anyone or by requesting user)
  const isSaved = m.savedBy ? m.savedBy.length > 0 : false;

  // Aggregate reactions: { emoji: string, count: number, userIds: string[] }
  const reactionMap = new Map<string, string[]>();
  if (m.reactions) {
    for (const r of m.reactions) {
      const list = reactionMap.get(r.emoji) || [];
      list.push(r.userId);
      reactionMap.set(r.emoji, list);
    }
  }
  const reactions = Array.from(reactionMap.entries()).map(([emoji, userIds]) => ({
    emoji,
    count: userIds.length,
    userIds,
    reacted: requestUserId ? userIds.includes(requestUserId) : false,
  }));

  return {
    id: m.id,
    content: m.content,
    userId: m.userId,
    roomId: m.roomId,
    isEdited: m.isEdited,
    isDeleted: m.isDeleted,
    isPinned: m.isPinned || false,
    expiresAt,
    isSaved,
    reactions,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
    updatedAt: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
    editedAt: m.editedAt ? (m.editedAt instanceof Date ? m.editedAt.toISOString() : m.editedAt) : null,
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
  avatarColor?: string,
  existingUserId?: string,
  email?: string
) {
  const color = avatarColor || getRandomColor();

  // RECOVERY PATH: If an existing userId is provided, reissue a session token
  // for the same user instead of creating a duplicate.
  if (existingUserId) {
    const existing = await prisma.chatUser.findUnique({
      where: { id: existingUserId },
    });
    if (existing) {
      // Check if banned
      if (existing.isBanned) {
        const permBan = !existing.bannedUntil;
        const stillBanned = permBan || existing.bannedUntil! > new Date();
        if (stillBanned) {
          throw new Error(permBan ? 'Your account has been permanently banned' : `You are banned until ${existing.bannedUntil!.toISOString()}`);
        }
        // Ban expired — auto-unban
        await prisma.chatUser.update({
          where: { id: existing.id },
          data: { isBanned: false, banReason: null, bannedUntil: null },
        });
      }

      const { raw, hashed } = generateSessionToken();
      sessionCacheSet(existing.id, hashed);
      await prisma.chatUser.update({
        where: { id: existing.id },
        data: {
          sessionTokenHash: hashed,
          isOnline: true,
          lastSeenAt: new Date(),
          ...(email && { email }),
        },
      });
      return {
        ...userToResponse(existing),
        sessionToken: raw,
      };
    }
    // User not found — fall through to create new
  }

  const user = await prisma.chatUser.create({
    data: {
      displayName,
      displayNameGurmukhi: displayNameGurmukhi || null,
      email: email || null,
      avatarColor: color,
      isOnline: true,
      lastSeenAt: new Date(),
    },
  });

  // Generate session token and persist hash to DB
  const { raw, hashed } = generateSessionToken();
  sessionCacheSet(user.id, hashed);
  await prisma.chatUser.update({
    where: { id: user.id },
    data: { sessionTokenHash: hashed },
  });

  // Auto-join default rooms (parallel for speed)
  const defaultRooms = await prisma.chatRoom.findMany({
    where: { isDefault: true, isActive: true },
    select: { id: true },
  });

  if (defaultRooms.length > 0) {
    await prisma.$transaction(
      defaultRooms.map((room) =>
        prisma.chatRoomMember.upsert({
          where: { userId_roomId: { userId: user.id, roomId: room.id } },
          update: {},
          create: { userId: user.id, roomId: room.id },
        })
      )
    );
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

/**
 * Get all members of a room (online AND offline).
 * Returns full member list; callers can filter by isOnline client-side.
 */
export async function getRoomMembers(roomId: string) {
  // Try Redis cache first
  const cacheKey = CACHE_KEYS.members(roomId);
  const cached = await cacheGet<ReturnType<typeof userToResponse>[]>(cacheKey);
  if (cached) return cached;

  const members = await prisma.chatRoomMember.findMany({
    where: { roomId },
    include: { user: { select: SAFE_USER_SELECT } },
  });

  const result = members.map((m) => userToResponse(m.user));

  // Cache for 15s
  await cacheSet(cacheKey, result, CACHE_TTL.members);

  return result;
}

// ============================================================================
// Room Handlers
// ============================================================================

export async function getRooms() {
  // Try Redis cache first
  const cacheKey = CACHE_KEYS.rooms();
  const cached = await cacheGet<ReturnType<typeof roomToResponse>[]>(cacheKey);
  if (cached) return cached;

  const rooms = await prisma.chatRoom.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { members: true, messages: true } },
    },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  });

  const result = rooms.map((r) => roomToResponse(r));

  // Cache for 60s
  await cacheSet(cacheKey, result, CACHE_TTL.rooms);

  return result;
}

/** Helper to format room response (used by getRooms + getRoomById) */
function roomToResponse(r: {
  id: string;
  name: string;
  nameGurmukhi: string | null;
  description: string | null;
  descriptionGurmukhi: string | null;
  icon: string;
  isDefault: boolean;
  isActive: boolean;
  _count: { members: number; messages: number };
}) {
  return {
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
  };
}

export async function getRoomById(roomId: string) {
  // Try Redis cache first
  const cacheKey = CACHE_KEYS.room(roomId);
  const cached = await cacheGet<ReturnType<typeof roomToResponse>>(cacheKey);
  if (cached) return cached;

  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: {
      _count: { select: { members: true, messages: true } },
    },
  });

  if (!room) return null;

  const result = roomToResponse(room);
  await cacheSet(cacheKey, result, CACHE_TTL.room);
  return result;
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

  const result = roomToResponse(room);

  // Invalidate rooms list cache
  await cacheDel(CACHE_KEYS.rooms());

  return result;
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

  // Invalidate members + rooms cache (member count changed)
  await cacheDel(CACHE_KEYS.members(roomId), CACHE_KEYS.rooms(), CACHE_KEYS.room(roomId));

  return { userId, roomId };
}

export async function leaveRoom(userId: string, roomId: string) {
  const result = await prisma.chatRoomMember.deleteMany({
    where: { userId, roomId },
  });

  // Invalidate members + rooms cache
  await cacheDel(CACHE_KEYS.members(roomId), CACHE_KEYS.rooms(), CACHE_KEYS.room(roomId));

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
  // Run ban check + membership check in parallel (saves ~10-40ms)
  const [sender, membership] = await Promise.all([
    prisma.chatUser.findUnique({
      where: { id: data.userId },
      select: { isBanned: true, bannedUntil: true },
    }),
    prisma.chatRoomMember.findUnique({
      where: { userId_roomId: { userId: data.userId, roomId: data.roomId } },
    }),
  ]);

  if (sender?.isBanned) {
    const permBan = !sender.bannedUntil;
    const stillBanned = permBan || sender.bannedUntil! > new Date();
    if (stillBanned) throw new Error('You are banned from sending messages');
    // Auto-unban if expired (fire-and-forget)
    prisma.chatUser.update({
      where: { id: data.userId },
      data: { isBanned: false, banReason: null, bannedUntil: null },
    }).catch(() => {});
  }

  if (!membership) {
    throw new Error('You must join this room to send messages');
  }

  const sanitizedContent = sanitizeContent(data.content);
  if (!sanitizedContent) {
    throw new Error('Message cannot be empty after sanitization');
  }

  // Content moderation check
  const moderation = moderateContent(sanitizedContent);
  if (!moderation.safe) {
    throw new Error(moderation.reason || 'Message rejected by content filter');
  }

  const expiresAt = new Date(Date.now() + MESSAGE_LIFETIME_HOURS * 60 * 60 * 1000);

  const message = await prisma.chatMessage.create({
    data: {
      content: sanitizedContent,
      userId: data.userId,
      roomId: data.roomId,
      replyToId: data.replyToId || null,
      expiresAt,
    },
    include: {
      user: { select: SAFE_USER_SELECT },
      replyTo: { include: { user: { select: SAFE_USER_SELECT } } },
      savedBy: { select: { id: true } },
      reactions: { select: { emoji: true, userId: true } },
    },
  });

  // Fire-and-forget: presence update, pruning, cleanup, cache invalidation
  // None of these need to block the response
  prisma.chatUser.update({
    where: { id: data.userId },
    data: { lastSeenAt: new Date(), isOnline: true },
  }).catch(() => {});

  pruneRoomMessages(data.roomId).catch(() => {});
  maybeRunCleanup().catch(() => {});
  cacheDel(CACHE_KEYS.messages(data.roomId), CACHE_KEYS.rooms(), CACHE_KEYS.room(data.roomId)).catch(() => {});

  return messageToResponse(message);
}

export async function getMessages(roomId: string, cursor?: string, limit = 50) {
  const safeLimit = Math.min(limit, 100);

  // Only show non-expired messages (or expired ones that are saved)
  const baseWhere = {
    roomId,
    isDeleted: false,
    OR: [
      { expiresAt: { gt: new Date() } },
      { savedBy: { some: {} } },
    ],
  };

  // Paginated (cursor) requests bypass cache — only first page is cached
  if (cursor) {
    const cursorMsg = await prisma.chatMessage.findUnique({ where: { id: cursor } });
    if (cursorMsg) {
      const msgs = await prisma.chatMessage.findMany({
        where: {
          ...baseWhere,
          createdAt: { lt: cursorMsg.createdAt },
        },
        orderBy: { createdAt: 'desc' },
        take: safeLimit,
        include: {
          user: { select: SAFE_USER_SELECT },
          replyTo: { include: { user: { select: SAFE_USER_SELECT } } },
          savedBy: { select: { id: true } },
          reactions: { select: { emoji: true, userId: true } },
        },
      });

      const sorted = msgs.reverse();
      const hasMore = msgs.length === safeLimit;

      return {
        messages: sorted.map((m) => messageToResponse(m)),
        nextCursor: hasMore ? sorted[0]?.id : undefined,
        hasMore,
      };
    }
  }

  // First page: try cache
  const cacheKey = CACHE_KEYS.messages(roomId);
  const cached = await cacheGet<{ messages: ReturnType<typeof messageToResponse>[]; nextCursor?: string; hasMore: boolean }>(cacheKey);
  if (cached) return cached;

  // Default: fetch latest non-expired messages
  const msgs = await prisma.chatMessage.findMany({
    where: baseWhere,
    orderBy: { createdAt: 'desc' },
    take: safeLimit,
    include: {
      user: { select: SAFE_USER_SELECT },
      replyTo: { include: { user: { select: SAFE_USER_SELECT } } },
      savedBy: { select: { id: true } },
      reactions: { select: { emoji: true, userId: true } },
    },
  });

  const sorted = msgs.reverse();
  const hasMore = msgs.length === safeLimit;

  const result = {
    messages: sorted.map((m) => messageToResponse(m)),
    nextCursor: hasMore ? sorted[0]?.id : undefined,
    hasMore,
  };

  // Cache first page for 5s
  await cacheSet(cacheKey, result, CACHE_TTL.messages);

  return result;
}

export async function pollNewMessages(roomId: string, since: Date) {
  // Fast path: check if ANY messages exist since the timestamp before doing the heavy query
  const count = await prisma.chatMessage.count({
    where: {
      roomId,
      isDeleted: false,
      createdAt: { gt: since },
    },
    // Stop counting after 1 — we only need to know if any exist
  });

  if (count === 0) return [];

  const msgs = await prisma.chatMessage.findMany({
    where: {
      roomId,
      isDeleted: false,
      createdAt: { gt: since },
      OR: [
        { expiresAt: { gt: new Date() } },
        { savedBy: { some: {} } },
      ],
    },
    orderBy: { createdAt: 'asc' },
    take: 100,
    include: {
      user: { select: SAFE_USER_SELECT },
      replyTo: { include: { user: { select: SAFE_USER_SELECT } } },
      savedBy: { select: { id: true } },
      reactions: { select: { emoji: true, userId: true } },
    },
  });

  return msgs.map((m) => messageToResponse(m));
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
      user: { select: SAFE_USER_SELECT },
      replyTo: { include: { user: { select: SAFE_USER_SELECT } } },
      savedBy: { select: { id: true } },
      reactions: { select: { emoji: true, userId: true } },
    },
  });

  // Invalidate messages cache for the room
  await cacheDel(CACHE_KEYS.messages(msg.roomId));

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

// ============================================================================
// Save / Unsave Messages (Snapchat-style bookmark)
// ============================================================================

/**
 * Save a message — preserves it beyond the 12h ephemeral window.
 * Stores a content snapshot so it survives even if the original is deleted.
 */
export async function saveMessage(userId: string, messageId: string) {
  const msg = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    select: { content: true, isDeleted: true },
  });
  if (!msg || msg.isDeleted) {
    throw new Error('Message not found');
  }

  const saved = await prisma.savedMessage.upsert({
    where: { userId_messageId: { userId, messageId } },
    update: {},
    create: {
      userId,
      messageId,
      savedContent: msg.content,
    },
  });

  // Invalidate cache for the room so isSaved reflects
  const fullMsg = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    select: { roomId: true },
  });
  if (fullMsg) {
    await cacheDel(CACHE_KEYS.messages(fullMsg.roomId));
  }

  return { id: saved.id, messageId, savedAt: saved.savedAt.toISOString() };
}

/**
 * Unsave a message — removes the bookmark. If the message is expired,
 * it becomes eligible for cleanup deletion.
 */
export async function unsaveMessage(userId: string, messageId: string) {
  const result = await prisma.savedMessage.deleteMany({
    where: { userId, messageId },
  });

  // Invalidate cache
  const msg = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    select: { roomId: true },
  });
  if (msg) {
    await cacheDel(CACHE_KEYS.messages(msg.roomId));
  }

  return { count: result.count };
}

/**
 * Get all saved messages for a user — across all rooms.
 */
export async function getSavedMessages(userId: string) {
  const saved = await prisma.savedMessage.findMany({
    where: { userId },
    include: {
      message: {
        include: {
          user: { select: SAFE_USER_SELECT },
          room: { select: { id: true, name: true, nameGurmukhi: true, icon: true } },
        },
      },
    },
    orderBy: { savedAt: 'desc' },
  });

  return saved.map((s) => ({
    id: s.id,
    savedAt: s.savedAt.toISOString(),
    savedContent: s.savedContent,
    message: {
      id: s.message.id,
      content: s.message.isDeleted ? s.savedContent : s.message.content,
      userId: s.message.userId,
      roomId: s.message.roomId,
      isDeleted: s.message.isDeleted,
      expiresAt: s.message.expiresAt.toISOString(),
      createdAt: s.message.createdAt.toISOString(),
      user: {
        id: s.message.user.id,
        displayName: s.message.user.displayName,
        displayNameGurmukhi: s.message.user.displayNameGurmukhi,
        avatarColor: s.message.user.avatarColor,
      },
      room: s.message.room,
    },
  }));
}

/**
 * Clear all chat records — messages, saved messages, members, rooms (except defaults).
 * Used for maintenance / fresh start.
 */
export async function clearAllChats() {
  await prisma.$transaction([
    prisma.savedMessage.deleteMany({}),
    prisma.chatMessage.deleteMany({}),
    prisma.chatRoomMember.deleteMany({}),
  ]);
  
  // Reset rooms flag so defaults get re-seeded
  defaultRoomsEnsured = false;
  
  return { cleared: true };
}

// ============================================================================
// Profile Update
// ============================================================================

export async function updateUserProfile(
  userId: string,
  data: { displayName?: string; displayNameGurmukhi?: string; email?: string; bio?: string; avatarColor?: string }
) {
  const updateData: Record<string, unknown> = {};
  if (data.displayName) updateData.displayName = data.displayName;
  if (data.displayNameGurmukhi !== undefined) updateData.displayNameGurmukhi = data.displayNameGurmukhi || null;
  if (data.email !== undefined) updateData.email = data.email || null;
  if (data.bio !== undefined) updateData.bio = data.bio || null;
  if (data.avatarColor) updateData.avatarColor = data.avatarColor;

  const user = await prisma.chatUser.update({
    where: { id: userId },
    data: updateData,
  });

  // Update in-memory type
  return userToResponse(user);
}

// ============================================================================
// Message Editing
// ============================================================================

export async function editMessage(messageId: string, userId: string, newContent: string) {
  const msg = await prisma.chatMessage.findUnique({ where: { id: messageId } });
  if (!msg) throw new Error('Message not found');
  if (msg.userId !== userId) throw new Error('You can only edit your own messages');
  if (msg.isDeleted) throw new Error('Cannot edit a deleted message');

  // Must be within 15 minutes of creation
  const editWindow = 15 * 60 * 1000;
  if (Date.now() - msg.createdAt.getTime() > editWindow) {
    throw new Error('Messages can only be edited within 15 minutes of sending');
  }

  const sanitized = sanitizeContent(newContent);
  if (!sanitized) throw new Error('Message cannot be empty after sanitization');

  // Content moderation check
  const moderation = moderateContent(sanitized);
  if (!moderation.safe) {
    throw new Error(moderation.reason || 'Message rejected by content filter');
  }

  const updated = await prisma.chatMessage.update({
    where: { id: messageId },
    data: {
      content: sanitized,
      isEdited: true,
      editedAt: new Date(),
    },
    include: {
      user: { select: SAFE_USER_SELECT },
      replyTo: { include: { user: { select: SAFE_USER_SELECT } } },
      savedBy: { select: { id: true } },
      reactions: { select: { emoji: true, userId: true } },
    },
  });

  await cacheDel(CACHE_KEYS.messages(msg.roomId));
  return messageToResponse(updated);
}

// ============================================================================
// Reaction Toggle (add or remove)
// ============================================================================

export async function toggleReaction(userId: string, messageId: string, emoji: string) {
  const msg = await prisma.chatMessage.findUnique({ where: { id: messageId } });
  if (!msg || msg.isDeleted) throw new Error('Message not found');

  // Check if already reacted with this emoji
  const existing = await prisma.messageReaction.findUnique({
    where: { userId_messageId_emoji: { userId, messageId, emoji } },
  });

  if (existing) {
    // Remove reaction
    await prisma.messageReaction.delete({ where: { id: existing.id } });
  } else {
    // Add reaction (max 20 reactions per message from same user)
    const userReactionCount = await prisma.messageReaction.count({
      where: { userId, messageId },
    });
    if (userReactionCount >= 20) throw new Error('Too many reactions on this message');

    await prisma.messageReaction.create({
      data: { userId, messageId, emoji },
    });
  }

  // Invalidate cache
  await cacheDel(CACHE_KEYS.messages(msg.roomId));

  // Return updated reaction counts
  const reactions = await prisma.messageReaction.findMany({
    where: { messageId },
    select: { emoji: true, userId: true },
  });

  const reactionMap = new Map<string, string[]>();
  for (const r of reactions) {
    const list = reactionMap.get(r.emoji) || [];
    list.push(r.userId);
    reactionMap.set(r.emoji, list);
  }

  return {
    messageId,
    reactions: Array.from(reactionMap.entries()).map(([em, uIds]) => ({
      emoji: em,
      count: uIds.length,
      userIds: uIds,
      reacted: uIds.includes(userId),
    })),
    action: existing ? 'removed' : 'added',
  };
}

// ============================================================================
// Admin Functions
// ============================================================================

/**
 * Check if a user has admin or moderator role (global or room-level).
 */
export async function isAdminOrModerator(userId: string, roomId?: string): Promise<boolean> {
  const user = await prisma.chatUser.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'moderator') return true;

  // Check room-level moderator role
  if (roomId) {
    const membership = await prisma.chatRoomMember.findUnique({
      where: { userId_roomId: { userId, roomId } },
      select: { role: true },
    });
    return membership?.role === 'moderator';
  }

  return false;
}

/**
 * Ban a user (admin/moderator only).
 */
export async function banUser(
  adminUserId: string,
  targetUserId: string,
  reason?: string,
  durationHours?: number
) {
  const isAdmin = await isAdminOrModerator(adminUserId);
  if (!isAdmin) throw new Error('Admin or moderator privileges required');

  // Cannot ban other admins
  const target = await prisma.chatUser.findUnique({
    where: { id: targetUserId },
    select: { role: true, displayName: true },
  });
  if (!target) throw new Error('User not found');
  if (target.role === 'admin') throw new Error('Cannot ban an admin');

  const bannedUntil = durationHours && durationHours > 0
    ? new Date(Date.now() + durationHours * 60 * 60 * 1000)
    : null; // null = permanent

  await prisma.chatUser.update({
    where: { id: targetUserId },
    data: {
      isBanned: true,
      banReason: reason || null,
      bannedUntil,
      isOnline: false,
    },
  });

  return {
    targetUserId,
    displayName: target.displayName,
    banned: true,
    reason: reason || null,
    bannedUntil: bannedUntil?.toISOString() || 'permanent',
  };
}

/**
 * Unban a user (admin only).
 */
export async function unbanUser(adminUserId: string, targetUserId: string) {
  const isAdmin = await isAdminOrModerator(adminUserId);
  if (!isAdmin) throw new Error('Admin or moderator privileges required');

  await prisma.chatUser.update({
    where: { id: targetUserId },
    data: { isBanned: false, banReason: null, bannedUntil: null },
  });

  return { targetUserId, banned: false };
}

/**
 * Admin delete a message (moderator can delete in rooms they moderate).
 */
export async function adminDeleteMessage(adminUserId: string, messageId: string, reason?: string) {
  const msg = await prisma.chatMessage.findUnique({ where: { id: messageId } });
  if (!msg) throw new Error('Message not found');

  const isAdmin = await isAdminOrModerator(adminUserId, msg.roomId);
  if (!isAdmin) throw new Error('Admin or moderator privileges required');

  const updated = await prisma.chatMessage.update({
    where: { id: messageId },
    data: {
      isDeleted: true,
      content: reason ? `[Removed by moderator: ${reason}]` : '[Removed by moderator]',
    },
  });

  await cacheDel(CACHE_KEYS.messages(msg.roomId));
  return { messageId, deleted: true, roomId: msg.roomId };
}

/**
 * Pin/unpin a message (moderator+).
 */
export async function togglePinMessage(adminUserId: string, messageId: string) {
  const msg = await prisma.chatMessage.findUnique({ where: { id: messageId } });
  if (!msg) throw new Error('Message not found');
  if (msg.isDeleted) throw new Error('Cannot pin a deleted message');

  const isAdmin = await isAdminOrModerator(adminUserId, msg.roomId);
  if (!isAdmin) throw new Error('Admin or moderator privileges required');

  // If already pinned, unpin. Otherwise pin.
  const updated = await prisma.chatMessage.update({
    where: { id: messageId },
    data: {
      isPinned: !msg.isPinned,
      pinnedById: msg.isPinned ? null : adminUserId,
    },
  });

  await cacheDel(CACHE_KEYS.messages(msg.roomId));
  return { messageId, isPinned: updated.isPinned, roomId: msg.roomId };
}

/**
 * Get pinned messages for a room.
 */
export async function getPinnedMessages(roomId: string) {
  const pinned = await prisma.chatMessage.findMany({
    where: { roomId, isPinned: true, isDeleted: false },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      user: { select: SAFE_USER_SELECT },
      replyTo: { include: { user: { select: SAFE_USER_SELECT } } },
      savedBy: { select: { id: true } },
      reactions: { select: { emoji: true, userId: true } },
    },
  });

  return pinned.map((m) => messageToResponse(m));
}

/**
 * Search messages within a room.
 */
export async function searchMessages(roomId: string, query: string, limit = 20) {
  const safeLimit = Math.min(limit, 50);

  const messages = await prisma.chatMessage.findMany({
    where: {
      roomId,
      isDeleted: false,
      content: { contains: query, mode: 'insensitive' },
      OR: [
        { expiresAt: { gt: new Date() } },
        { savedBy: { some: {} } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: safeLimit,
    include: {
      user: { select: SAFE_USER_SELECT },
      replyTo: { include: { user: { select: SAFE_USER_SELECT } } },
      savedBy: { select: { id: true } },
      reactions: { select: { emoji: true, userId: true } },
    },
  });

  return {
    query,
    results: messages.map((m) => messageToResponse(m)),
    total: messages.length,
  };
}

/**
 * Set a user's role (admin only — cannot set someone to admin unless you're admin).
 */
export async function setUserRole(adminUserId: string, targetUserId: string, role: 'member' | 'moderator' | 'admin') {
  const admin = await prisma.chatUser.findUnique({
    where: { id: adminUserId },
    select: { role: true },
  });
  if (!admin || admin.role !== 'admin') throw new Error('Only admins can set roles');

  await prisma.chatUser.update({
    where: { id: targetUserId },
    data: { role },
  });

  return { targetUserId, role };
}

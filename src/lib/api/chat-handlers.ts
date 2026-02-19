/**
 * Community Chat API Handlers — IN-MEMORY (no database)
 * 
 * All chat state lives in server memory for maximum performance.
 * Messages, users, rooms, and memberships reset on server restart.
 * This is intentional — performance over persistence.
 */

// ============================================================================
// In-Memory Data Stores
// ============================================================================

interface MemChatUser {
  id: string;
  displayName: string;
  displayNameGurmukhi: string | null;
  avatarColor: string;
  isOnline: boolean;
  lastSeenAt: Date;
}

interface MemChatRoom {
  id: string;
  name: string;
  nameGurmukhi: string | null;
  description: string | null;
  descriptionGurmukhi: string | null;
  icon: string;
  isDefault: boolean;
  isActive: boolean;
  maxMembers: number;
}

interface MemChatMessage {
  id: string;
  content: string;
  userId: string;
  roomId: string;
  replyToId: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MemChatRoomMember {
  userId: string;
  roomId: string;
  joinedAt: Date;
}

// ---------- Stores ----------
const users = new Map<string, MemChatUser>();
const rooms = new Map<string, MemChatRoom>();
const roomMembers: MemChatRoomMember[] = [];
const messages: MemChatMessage[] = [];

// ---------- Counters ----------
let idCounter = 0;
function genId(): string {
  return `mem_${Date.now()}_${++idCounter}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------- Seed default rooms on first import ----------
const DEFAULT_ROOMS: Omit<MemChatRoom, 'id'>[] = [
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

// Seed once at module init
for (const r of DEFAULT_ROOMS) {
  const id = genId();
  rooms.set(id, { id, ...r });
}

// Message cap per room
const MAX_MESSAGES_PER_ROOM = 500;

function pruneMessages(roomId: string) {
  let count = 0;
  for (const m of messages) {
    if (m.roomId === roomId) count++;
  }
  if (count <= MAX_MESSAGES_PER_ROOM) return;
  
  let toRemove = count - MAX_MESSAGES_PER_ROOM;
  for (let i = 0; i < messages.length && toRemove > 0; i++) {
    if (messages[i].roomId === roomId) {
      messages.splice(i, 1);
      toRemove--;
      i--;
    }
  }
}

// Auto-cleanup: mark users offline if not seen in 2 min
function cleanupOfflineUsers() {
  const cutoff = Date.now() - 2 * 60 * 1000;
  for (const u of Array.from(users.values())) {
    if (u.isOnline && u.lastSeenAt.getTime() < cutoff) {
      u.isOnline = false;
    }
  }
}

if (typeof setInterval !== 'undefined') {
  setInterval(cleanupOfflineUsers, 30000);
}

// ============================================================================
// Response Builders (match the shapes Prisma used to return)
// ============================================================================

function userToResponse(u: MemChatUser) {
  return {
    id: u.id,
    displayName: u.displayName,
    displayNameGurmukhi: u.displayNameGurmukhi,
    avatarColor: u.avatarColor,
    isOnline: u.isOnline,
    lastSeenAt: u.lastSeenAt.toISOString(),
  };
}

function messageToResponse(m: MemChatMessage) {
  const u = users.get(m.userId);
  let replyTo = null;
  if (m.replyToId) {
    const rm = messages.find((msg) => msg.id === m.replyToId);
    if (rm) {
      const ru = users.get(rm.userId);
      replyTo = {
        id: rm.id,
        content: rm.content,
        user: { displayName: ru?.displayName || 'Unknown' },
      };
    }
  }

  return {
    id: m.id,
    content: m.content,
    userId: m.userId,
    roomId: m.roomId,
    isEdited: m.isEdited,
    isDeleted: m.isDeleted,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
    user: {
      id: u?.id || m.userId,
      displayName: u?.displayName || 'Unknown',
      displayNameGurmukhi: u?.displayNameGurmukhi || null,
      avatarColor: u?.avatarColor || '#888',
    },
    replyTo,
  };
}

function roomToResponse(r: MemChatRoom) {
  const memberCount = roomMembers.filter((m) => m.roomId === r.id).length;
  const msgCount = messages.filter((m) => m.roomId === r.id && !m.isDeleted).length;
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
      members: memberCount,
      messages: msgCount,
    },
  };
}

// ============================================================================
// User Handlers
// ============================================================================

export async function createOrGetUser(displayName: string, displayNameGurmukhi?: string, avatarColor?: string) {
  const id = genId();
  const user: MemChatUser = {
    id,
    displayName,
    displayNameGurmukhi: displayNameGurmukhi || null,
    avatarColor: avatarColor || getRandomColor(),
    isOnline: true,
    lastSeenAt: new Date(),
  };
  users.set(id, user);

  // Auto-join default rooms
  for (const r of Array.from(rooms.values())) {
    if (r.isDefault && r.isActive) {
      const already = roomMembers.some((m) => m.userId === id && m.roomId === r.id);
      if (!already) {
        roomMembers.push({ userId: id, roomId: r.id, joinedAt: new Date() });
      }
    }
  }

  return userToResponse(user);
}

export async function updateUserPresence(userId: string, isOnline: boolean) {
  const user = users.get(userId);
  if (!user) return null;
  user.isOnline = isOnline;
  user.lastSeenAt = new Date();
  return userToResponse(user);
}

export async function getOnlineUsers(roomId: string) {
  const memberIds = new Set(
    roomMembers.filter((m) => m.roomId === roomId).map((m) => m.userId)
  );

  const result = [];
  for (const id of Array.from(memberIds)) {
    const u = users.get(id);
    if (u) result.push(userToResponse(u));
  }
  return result;
}

// ============================================================================
// Room Handlers
// ============================================================================

export async function getRooms() {
  return Array.from(rooms.values())
    .filter((r) => r.isActive)
    .sort((a, b) => {
      if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
      return a.name.localeCompare(b.name);
    })
    .map(roomToResponse);
}

export async function getRoomById(roomId: string) {
  const room = rooms.get(roomId);
  return room ? roomToResponse(room) : null;
}

export async function createRoom(data: {
  name: string;
  nameGurmukhi?: string;
  description?: string;
  descriptionGurmukhi?: string;
  icon?: string;
}) {
  const id = genId();
  const room: MemChatRoom = {
    id,
    name: data.name,
    nameGurmukhi: data.nameGurmukhi || null,
    description: data.description || null,
    descriptionGurmukhi: data.descriptionGurmukhi || null,
    icon: data.icon || '💬',
    isDefault: false,
    isActive: true,
    maxMembers: 500,
  };
  rooms.set(id, room);
  return roomToResponse(room);
}

export async function joinRoom(userId: string, roomId: string) {
  const room = rooms.get(roomId);
  if (!room || !room.isActive) {
    throw new Error('Room not found or inactive');
  }

  const memberCount = roomMembers.filter((m) => m.roomId === roomId).length;
  if (memberCount >= room.maxMembers) {
    throw new Error('Room is full');
  }

  const already = roomMembers.some((m) => m.userId === userId && m.roomId === roomId);
  if (!already) {
    roomMembers.push({ userId, roomId, joinedAt: new Date() });
  }

  return { userId, roomId };
}

export async function leaveRoom(userId: string, roomId: string) {
  const idx = roomMembers.findIndex((m) => m.userId === userId && m.roomId === roomId);
  if (idx !== -1) roomMembers.splice(idx, 1);
  return { count: idx !== -1 ? 1 : 0 };
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
  const isMember = roomMembers.some((m) => m.userId === data.userId && m.roomId === data.roomId);
  if (!isMember) {
    throw new Error('You must join this room to send messages');
  }

  const sanitizedContent = data.content.replace(/<[^>]*>/g, '').trim();
  if (!sanitizedContent) {
    throw new Error('Message cannot be empty after sanitization');
  }

  const now = new Date();
  const msg: MemChatMessage = {
    id: genId(),
    content: sanitizedContent,
    userId: data.userId,
    roomId: data.roomId,
    replyToId: data.replyToId || null,
    isEdited: false,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };

  messages.push(msg);

  // Update user presence
  const user = users.get(data.userId);
  if (user) {
    user.lastSeenAt = now;
    user.isOnline = true;
  }

  pruneMessages(data.roomId);
  return messageToResponse(msg);
}

export async function getMessages(roomId: string, cursor?: string, limit = 50) {
  const roomMsgs = messages.filter((m) => m.roomId === roomId && !m.isDeleted);

  if (cursor) {
    const cursorIdx = roomMsgs.findIndex((m) => m.id === cursor);
    if (cursorIdx > 0) {
      const start = Math.max(0, cursorIdx - limit);
      const slice = roomMsgs.slice(start, cursorIdx);
      return {
        messages: slice.map(messageToResponse),
        nextCursor: start > 0 ? slice[0]?.id : undefined,
        hasMore: start > 0,
      };
    }
  }

  const total = roomMsgs.length;
  const start = Math.max(0, total - limit);
  const slice = roomMsgs.slice(start);
  return {
    messages: slice.map(messageToResponse),
    nextCursor: start > 0 ? slice[0]?.id : undefined,
    hasMore: start > 0,
  };
}

export async function pollNewMessages(roomId: string, since: Date) {
  return messages
    .filter(
      (m) =>
        m.roomId === roomId &&
        !m.isDeleted &&
        m.createdAt > since
    )
    .slice(0, 100)
    .map(messageToResponse);
}

export async function deleteMessage(messageId: string, userId: string) {
  const msg = messages.find((m) => m.id === messageId);
  if (!msg || msg.userId !== userId) {
    throw new Error('Message not found or unauthorized');
  }

  msg.isDeleted = true;
  msg.content = '[Message deleted]';
  msg.updatedAt = new Date();
  return messageToResponse(msg);
}

// ============================================================================
// Seed Default Rooms — no-op (seeded at module init)
// ============================================================================

export async function ensureDefaultRooms() {
  return;
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

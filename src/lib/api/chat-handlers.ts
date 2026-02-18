/**
 * Community Chat API Handlers
 * Server-side business logic for chat operations
 */

import prisma from '@/lib/db/prisma';

// ============================================================================
// User Handlers
// ============================================================================

export async function createOrGetUser(displayName: string, displayNameGurmukhi?: string, avatarColor?: string) {
  const user = await prisma.chatUser.create({
    data: {
      displayName,
      displayNameGurmukhi,
      avatarColor: avatarColor || getRandomColor(),
      isOnline: true,
      lastSeenAt: new Date(),
    },
  });

  // Auto-join default rooms
  const defaultRooms = await prisma.chatRoom.findMany({
    where: { isDefault: true, isActive: true },
  });

  if (defaultRooms.length > 0) {
    await prisma.chatRoomMember.createMany({
      data: defaultRooms.map((room) => ({
        userId: user.id,
        roomId: room.id,
      })),
      skipDuplicates: true,
    });
  }

  return user;
}

export async function updateUserPresence(userId: string, isOnline: boolean) {
  return prisma.chatUser.update({
    where: { id: userId },
    data: {
      isOnline,
      lastSeenAt: new Date(),
    },
  });
}

export async function getOnlineUsers(roomId: string) {
  const members = await prisma.chatRoomMember.findMany({
    where: { roomId },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          displayNameGurmukhi: true,
          avatarColor: true,
          isOnline: true,
          lastSeenAt: true,
        },
      },
    },
  });

  return members.map((m) => m.user);
}

// ============================================================================
// Room Handlers
// ============================================================================

export async function getRooms() {
  const rooms = await prisma.chatRoom.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          members: true,
          messages: true,
        },
      },
    },
    orderBy: [
      { isDefault: 'desc' },
      { name: 'asc' },
    ],
  });

  return rooms;
}

export async function getRoomById(roomId: string) {
  return prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: {
      _count: {
        select: {
          members: true,
          messages: true,
        },
      },
    },
  });
}

export async function createRoom(data: {
  name: string;
  nameGurmukhi?: string;
  description?: string;
  descriptionGurmukhi?: string;
  icon?: string;
}) {
  return prisma.chatRoom.create({
    data: {
      name: data.name,
      nameGurmukhi: data.nameGurmukhi,
      description: data.description,
      descriptionGurmukhi: data.descriptionGurmukhi,
      icon: data.icon || '💬',
    },
  });
}

export async function joinRoom(userId: string, roomId: string) {
  // Check room exists and has capacity
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: { _count: { select: { members: true } } },
  });

  if (!room || !room.isActive) {
    throw new Error('Room not found or inactive');
  }

  if (room._count.members >= room.maxMembers) {
    throw new Error('Room is full');
  }

  return prisma.chatRoomMember.upsert({
    where: {
      userId_roomId: { userId, roomId },
    },
    create: { userId, roomId },
    update: {},
  });
}

export async function leaveRoom(userId: string, roomId: string) {
  return prisma.chatRoomMember.deleteMany({
    where: { userId, roomId },
  });
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
  // Verify user is a member of the room
  const membership = await prisma.chatRoomMember.findUnique({
    where: {
      userId_roomId: { userId: data.userId, roomId: data.roomId },
    },
  });

  if (!membership) {
    throw new Error('You must join this room to send messages');
  }

  // Sanitize content - strip HTML tags
  const sanitizedContent = data.content
    .replace(/<[^>]*>/g, '')
    .trim();

  if (!sanitizedContent) {
    throw new Error('Message cannot be empty after sanitization');
  }

  const message = await prisma.chatMessage.create({
    data: {
      content: sanitizedContent,
      userId: data.userId,
      roomId: data.roomId,
      replyToId: data.replyToId,
    },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          displayNameGurmukhi: true,
          avatarColor: true,
        },
      },
      replyTo: {
        select: {
          id: true,
          content: true,
          user: {
            select: {
              displayName: true,
            },
          },
        },
      },
    },
  });

  // Update user last seen
  await prisma.chatUser.update({
    where: { id: data.userId },
    data: { lastSeenAt: new Date(), isOnline: true },
  });

  return message;
}

export async function getMessages(roomId: string, cursor?: string, limit = 50) {
  const messages = await prisma.chatMessage.findMany({
    where: {
      roomId,
      isDeleted: false,
    },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          displayNameGurmukhi: true,
          avatarColor: true,
        },
      },
      replyTo: {
        select: {
          id: true,
          content: true,
          user: {
            select: {
              displayName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1, // Fetch one extra to determine if there are more
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1, // Skip the cursor itself
        }
      : {}),
  });

  const hasMore = messages.length > limit;
  const items = hasMore ? messages.slice(0, limit) : messages;
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

  return {
    messages: items.reverse(), // Return in chronological order
    nextCursor,
    hasMore,
  };
}

export async function pollNewMessages(roomId: string, since: Date) {
  return prisma.chatMessage.findMany({
    where: {
      roomId,
      isDeleted: false,
      createdAt: { gt: since },
    },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          displayNameGurmukhi: true,
          avatarColor: true,
        },
      },
      replyTo: {
        select: {
          id: true,
          content: true,
          user: {
            select: {
              displayName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
    take: 100, // Cap to prevent abuse
  });
}

export async function deleteMessage(messageId: string, userId: string) {
  // Only the author can delete their messages
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
  });

  if (!message || message.userId !== userId) {
    throw new Error('Message not found or unauthorized');
  }

  return prisma.chatMessage.update({
    where: { id: messageId },
    data: { isDeleted: true, content: '[Message deleted]' },
  });
}

// ============================================================================
// Seed Default Rooms
// ============================================================================

export async function ensureDefaultRooms() {
  const defaultRooms = [
    {
      name: 'General',
      nameGurmukhi: 'ਆਮ ਗੱਲਬਾਤ',
      description: 'General discussion for the Sangat',
      descriptionGurmukhi: 'ਸੰਗਤ ਲਈ ਆਮ ਵਿਚਾਰ',
      icon: '🏠',
      isDefault: true,
    },
    {
      name: 'Gurbani Vichar',
      nameGurmukhi: 'ਗੁਰਬਾਣੀ ਵਿਚਾਰ',
      description: 'Discuss Gurbani meanings and interpretations',
      descriptionGurmukhi: 'ਗੁਰਬਾਣੀ ਦੇ ਅਰਥ ਅਤੇ ਵਿਆਖਿਆ ਬਾਰੇ ਗੱਲਬਾਤ',
      icon: '📖',
      isDefault: true,
    },
    {
      name: 'Sikh History',
      nameGurmukhi: 'ਸਿੱਖ ਇਤਿਹਾਸ',
      description: 'Discuss Sikh history and events',
      descriptionGurmukhi: 'ਸਿੱਖ ਇਤਿਹਾਸ ਅਤੇ ਘਟਨਾਵਾਂ ਬਾਰੇ ਵਿਚਾਰ',
      icon: '📜',
      isDefault: true,
    },
    {
      name: 'Kirtan & Sangeet',
      nameGurmukhi: 'ਕੀਰਤਨ ਤੇ ਸੰਗੀਤ',
      description: 'Share and discuss Kirtan, Raags, and Sikh music',
      descriptionGurmukhi: 'ਕੀਰਤਨ, ਰਾਗ, ਅਤੇ ਸਿੱਖ ਸੰਗੀਤ ਬਾਰੇ ਸਾਂਝਾ ਕਰੋ',
      icon: '🎵',
      isDefault: false,
    },
    {
      name: 'Newcomers',
      nameGurmukhi: 'ਨਵੇਂ ਆਏ',
      description: 'Welcome area for those new to Sikhi',
      descriptionGurmukhi: 'ਸਿੱਖੀ ਵਿੱਚ ਨਵੇਂ ਆਏ ਲਈ ਸੁਆਗਤ',
      icon: '🌱',
      isDefault: false,
    },
  ];

  for (const room of defaultRooms) {
    await prisma.chatRoom.upsert({
      where: { name: room.name },
      create: room,
      update: {
        nameGurmukhi: room.nameGurmukhi,
        description: room.description,
        descriptionGurmukhi: room.descriptionGurmukhi,
        icon: room.icon,
        isDefault: room.isDefault,
      },
    });
  }
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

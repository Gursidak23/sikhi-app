/**
 * Community Chat Validation Schemas
 */

import { z } from 'zod';

// ============================================================================
// Chat User Schemas
// ============================================================================

export const createChatUserSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(30, 'Display name must be at most 30 characters')
    .regex(/^[a-zA-Z0-9\s\u0A00-\u0A7F\u0900-\u097F_-]+$/, 'Display name contains invalid characters'),
  displayNameGurmukhi: z
    .string()
    .max(30)
    .optional(),
  email: z
    .string()
    .email('Invalid email address')
    .max(254)
    .optional(),
  avatarColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
    .optional(),
  // For session recovery: reissue token for existing user instead of creating duplicate
  existingUserId: z
    .string()
    .min(1)
    .optional(),
});

export const updatePresenceSchema = z.object({
  userId: z.string().min(1),
  isOnline: z.boolean(),
});

export const updateProfileSchema = z.object({
  userId: z.string().min(1),
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(30, 'Display name must be at most 30 characters')
    .regex(/^[a-zA-Z0-9\s\u0A00-\u0A7F\u0900-\u097F_-]+$/, 'Display name contains invalid characters')
    .optional(),
  displayNameGurmukhi: z.string().max(30).optional(),
  email: z.string().email('Invalid email address').max(254).optional(),
  bio: z.string().max(300, 'Bio must be at most 300 characters').optional(),
  avatarColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
});

// ============================================================================
// Chat Room Schemas
// ============================================================================

export const createRoomSchema = z.object({
  name: z
    .string()
    .min(2, 'Room name must be at least 2 characters')
    .max(50, 'Room name must be at most 50 characters')
    .regex(/^[a-zA-Z0-9\s\u0A00-\u0A7F\u0900-\u097F_-]+$/, 'Room name contains invalid characters'),
  nameGurmukhi: z.string().max(50).optional(),
  description: z.string().max(200).optional(),
  descriptionGurmukhi: z.string().max(200).optional(),
  icon: z.string().max(4).optional(),
});

// ============================================================================
// Chat Message Schemas
// ============================================================================

export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .transform((val) => val.trim())
    .refine(
      (val) => {
        // Image messages (contain base64 data) can be up to 150KB
        const isImage = val.startsWith('[IMG]') && val.includes('[/IMG]');
        const maxLen = isImage ? 150_000 : 2000;
        return val.length <= maxLen;
      },
      { message: 'Message is too large' }
    ),
  userId: z.string().min(1, 'User ID is required'),
  roomId: z.string().min(1, 'Room ID is required'),
  replyToId: z.string().optional(),
});

export const editMessageSchema = z.object({
  messageId: z.string().min(1),
  userId: z.string().min(1),
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be at most 2000 characters')
    .transform((val) => val.trim()),
});

export const getMessagesSchema = z.object({
  roomId: z.string().min(1),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

// ============================================================================
// Reaction Schemas
// ============================================================================

const ALLOWED_EMOJIS = ['🙏', '❤️', '👍', '✨', '😊', '📖', '🎵', 'ੴ'] as const;

export const toggleReactionSchema = z.object({
  messageId: z.string().min(1),
  userId: z.string().min(1),
  emoji: z.string().refine((e) => (ALLOWED_EMOJIS as readonly string[]).includes(e), {
    message: 'Invalid reaction emoji',
  }),
});

// ============================================================================
// Admin Schemas
// ============================================================================

export const adminBanUserSchema = z.object({
  targetUserId: z.string().min(1),
  reason: z.string().max(500).optional(),
  durationHours: z.number().min(0).max(8760).optional(), // 0 or omitted = permanent, max 1 year
});

export const adminDeleteMessageSchema = z.object({
  messageId: z.string().min(1),
  reason: z.string().max(500).optional(),
});

export const adminPinMessageSchema = z.object({
  messageId: z.string().min(1),
});

export const searchMessagesSchema = z.object({
  roomId: z.string().min(1),
  query: z.string().min(2).max(200),
  limit: z.coerce.number().min(1).max(50).default(20),
});

// ============================================================================
// Polling Schema
// ============================================================================

export const pollMessagesSchema = z.object({
  roomId: z.string().min(1),
  since: z.string().datetime({ message: 'Invalid datetime format' }),
});

export type CreateChatUser = z.infer<typeof createChatUserSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type SendMessage = z.infer<typeof sendMessageSchema>;
export type GetMessages = z.infer<typeof getMessagesSchema>;
export type PollMessages = z.infer<typeof pollMessagesSchema>;
export type ToggleReaction = z.infer<typeof toggleReactionSchema>;
export type AdminBanUser = z.infer<typeof adminBanUserSchema>;
export type SearchMessages = z.infer<typeof searchMessagesSchema>;

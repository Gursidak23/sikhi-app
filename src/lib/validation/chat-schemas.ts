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
    .max(2000, 'Message must be at most 2000 characters')
    .transform((val) => val.trim()),
  userId: z.string().min(1, 'User ID is required'),
  roomId: z.string().min(1, 'Room ID is required'),
  replyToId: z.string().optional(),
});

export const getMessagesSchema = z.object({
  roomId: z.string().min(1),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
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

// ============================================================================
// Polling Schema
// ============================================================================

export const pollMessagesSchema = z.object({
  roomId: z.string().min(1),
  since: z.string().datetime({ message: 'Invalid datetime format' }),
});

export type CreateChatUser = z.infer<typeof createChatUserSchema>;
export type SendMessage = z.infer<typeof sendMessageSchema>;
export type GetMessages = z.infer<typeof getMessagesSchema>;
export type PollMessages = z.infer<typeof pollMessagesSchema>;

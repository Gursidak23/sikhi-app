/**
 * Thread Replies View - Shows a message and all its replies in a focused view
 * 
 * Features:
 * - Original message displayed at top
 * - All replies shown below in chronological order
 * - Inline reply input at bottom
 * - Close to return to main chat
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';
import type { ChatMessage, ChatUser } from '../store/chatStore';
import { MessageBubble } from './MessageBubble';
import { parseImageMessage } from './ImageAttachment';

interface ThreadViewProps {
  parentMessage: ChatMessage;
  allMessages: ChatMessage[];
  currentUser: ChatUser | null;
  language: Language;
  onClose: () => void;
  onSendReply: (content: string) => Promise<void>;
  onDelete: (messageId: string) => void;
  onSave?: (messageId: string) => void;
  onUnsave?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
  onReply: (message: ChatMessage) => void;
}

export function ThreadView({
  parentMessage,
  allMessages,
  currentUser,
  language,
  onClose,
  onSendReply,
  onDelete,
  onSave,
  onUnsave,
  onEdit,
  onToggleReaction,
  onReply,
}: ThreadViewProps) {
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const repliesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';

  // Get all replies to this message
  const replies = allMessages.filter((m) => m.replyToId === parentMessage.id && !m.isDeleted);

  // Auto-scroll to bottom when replies change
  useEffect(() => {
    repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [replies.length]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '0';
      textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    }
  }, [replyText]);

  const handleSend = useCallback(async () => {
    if (!replyText.trim() || isSending) return;
    setIsSending(true);
    try {
      await onSendReply(replyText.trim());
      setReplyText('');
    } finally {
      setIsSending(false);
    }
  }, [replyText, isSending, onSendReply]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const parentImageData = parseImageMessage(parentMessage.content);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className={cn(
              'text-sm font-bold text-gray-900 dark:text-white',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}>
              {isPunjabi ? 'ਥਰੈੱਡ' : isHindi ? 'थ्रेड' : 'Thread'}
            </h3>
            <p className="text-[10px] text-gray-400">
              {replies.length} {isPunjabi ? 'ਜਵਾਬ' : isHindi ? 'जवाब' : replies.length === 1 ? 'reply' : 'replies'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Parent Message */}
      <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
        <div className="px-4 py-3">
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: parentMessage.user.avatarColor }}
            >
              {parentMessage.user.displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  'text-sm font-semibold text-gray-900 dark:text-white',
                  isPunjabi && 'font-gurmukhi',
                  isHindi && 'font-devanagari'
                )}>
                  {isPunjabi && parentMessage.user.displayNameGurmukhi
                    ? parentMessage.user.displayNameGurmukhi
                    : parentMessage.user.displayName}
                </span>
                <span className="text-[10px] text-gray-400">
                  {new Date(parentMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {parentImageData ? (
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={parentImageData.imageUrl} alt="" className="max-w-[200px] max-h-[150px] rounded-lg" />
                  {parentImageData.caption && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{parentImageData.caption}</p>
                  )}
                </div>
              ) : (
                <p className={cn(
                  'text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words',
                  isPunjabi && 'font-gurmukhi',
                  isHindi && 'font-devanagari'
                )}>
                  {parentMessage.content}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="flex-1 overflow-y-auto px-0 py-2">
        {replies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className={cn(
              'text-sm text-gray-400',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}>
              {isPunjabi ? 'ਕੋਈ ਜਵਾਬ ਨਹੀਂ ਹੈ। ਪਹਿਲਾ ਜਵਾਬ ਦਿਓ!' : isHindi ? 'कोई जवाब नहीं। पहला जवाब दें!' : 'No replies yet. Be the first!'}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {replies.map((reply) => (
              <MessageBubble
                key={reply.id}
                message={reply}
                currentUser={currentUser}
                language={language}
                onReply={onReply}
                onDelete={onDelete}
                onSave={onSave}
                onUnsave={onUnsave}
                onEdit={onEdit}
                onToggleReaction={onToggleReaction}
              />
            ))}
            <div ref={repliesEndRef} />
          </div>
        )}
      </div>

      {/* Reply Input */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isPunjabi ? 'ਜਵਾਬ ਲਿਖੋ...' : isHindi ? 'जवाब लिखें...' : 'Reply in thread...'}
            rows={1}
            maxLength={2000}
            className={cn(
              'flex-1 px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700',
              'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100',
              'placeholder-gray-400 resize-none',
              'focus:outline-none focus:ring-2 focus:ring-amber-400/50',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}
          />
          <button
            onClick={handleSend}
            disabled={!replyText.trim() || isSending}
            className={cn(
              'p-2.5 rounded-xl transition-all flex-shrink-0 active:scale-90',
              replyText.trim() && !isSending
                ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
            )}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

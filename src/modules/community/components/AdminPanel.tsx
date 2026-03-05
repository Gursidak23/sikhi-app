/**
 * Admin Panel - Moderation controls for community chat
 * 
 * Features:
 * - Ban/unban users (with duration)
 * - Pin/unpin messages
 * - Delete messages (with reason)
 * - Set user roles (admin/moderator/member)
 * - Member management list
 */

'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';
import type { ChatUser, ChatMessage } from '../store/chatStore';
import { useChatAdmin } from '../hooks/useChatAdmin';
import { useChatStore } from '../store/chatStore';

interface AdminPanelProps {
  language: Language;
  onClose: () => void;
}

type AdminTab = 'members' | 'pinned';

export function AdminPanel({ language, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [banDuration, setBanDuration] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'ban' | 'unban' | 'delete' | 'role';
    targetId: string;
    targetName: string;
    role?: string;
  } | null>(null);

  const { isAdmin, adminAction } = useChatAdmin();
  const members = useChatStore((s) => s.members);
  const messages = useChatStore((s) => s.messages);
  const user = useChatStore((s) => s.user);

  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';

  const filteredMembers = members.filter((m) =>
    m.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.displayNameGurmukhi && m.displayNameGurmukhi.includes(searchQuery))
  );

  const pinnedMessages = messages.filter((m) => m.isPinned);

  const handleBan = useCallback(async (targetUserId: string) => {
    setActionLoading(targetUserId);
    try {
      await adminAction('ban', {
        targetUserId,
        durationHours: banDuration || undefined,
      });
      setConfirmAction(null);
    } catch { /* error handled in hook */ }
    setActionLoading(null);
  }, [adminAction, banDuration]);

  const handleUnban = useCallback(async (targetUserId: string) => {
    setActionLoading(targetUserId);
    try {
      await adminAction('unban', { targetUserId });
      setConfirmAction(null);
    } catch { /* error handled in hook */ }
    setActionLoading(null);
  }, [adminAction]);

  const handlePinMessage = useCallback(async (messageId: string) => {
    setActionLoading(messageId);
    try {
      await adminAction('pin', { messageId });
      useChatStore.getState().updateMessage(messageId, { isPinned: true });
    } catch { /* error handled in hook */ }
    setActionLoading(null);
  }, [adminAction]);

  const handleUnpinMessage = useCallback(async (messageId: string) => {
    setActionLoading(messageId);
    try {
      await adminAction('unpin', { messageId });
      useChatStore.getState().updateMessage(messageId, { isPinned: false });
    } catch { /* error handled in hook */ }
    setActionLoading(null);
  }, [adminAction]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    setActionLoading(messageId);
    try {
      await adminAction('delete', { messageId });
      useChatStore.getState().updateMessage(messageId, {
        content: '[Message deleted by admin]',
        isDeleted: true,
      });
      setConfirmAction(null);
    } catch { /* error handled in hook */ }
    setActionLoading(null);
  }, [adminAction]);

  const handleSetRole = useCallback(async (targetUserId: string, role: string) => {
    setActionLoading(targetUserId);
    try {
      await adminAction('setRole', { targetUserId, role });
      setConfirmAction(null);
    } catch { /* error handled in hook */ }
    setActionLoading(null);
  }, [adminAction]);

  if (!isAdmin) return null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className={cn(
            'text-sm font-bold text-gray-900 dark:text-white',
            isPunjabi && 'font-gurmukhi',
            isHindi && 'font-devanagari'
          )}>
            {isPunjabi ? 'ਐਡਮਿਨ ਪੈਨਲ' : isHindi ? 'एडमिन पैनल' : 'Admin Panel'}
          </h3>
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

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-800">
        {([
          { key: 'members' as AdminTab, label: isPunjabi ? 'ਮੈਂਬਰ' : isHindi ? 'सदस्य' : 'Members', icon: '👥' },
          { key: 'pinned' as AdminTab, label: isPunjabi ? 'ਪਿੰਨ ਕੀਤੇ' : isHindi ? 'पिन किए' : 'Pinned', icon: '📌' },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors',
              activeTab === tab.key
                ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/50 dark:bg-amber-900/10'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <span>{tab.icon}</span>
            <span className={cn(isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Confirm Dialog */}
      {confirmAction && (
        <div className="mx-3 mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
          <p className={cn(
            'text-sm text-red-700 dark:text-red-300 mb-2',
            isPunjabi && 'font-gurmukhi',
            isHindi && 'font-devanagari'
          )}>
            {confirmAction.type === 'ban' && (
              isPunjabi
                ? `ਕੀ ਤੁਸੀਂ ${confirmAction.targetName} ਨੂੰ ਬੈਨ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?`
                : isHindi ? `क्या आप ${confirmAction.targetName} को बैन करना चाहते हैं?`
                : `Ban ${confirmAction.targetName}?`
            )}
            {confirmAction.type === 'unban' && (
              isPunjabi
                ? `ਕੀ ਤੁਸੀਂ ${confirmAction.targetName} ਨੂੰ ਅਣਬੈਨ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?`
                : isHindi ? `क्या आप ${confirmAction.targetName} को अनबैन करना चाहते हैं?`
                : `Unban ${confirmAction.targetName}?`
            )}
            {confirmAction.type === 'delete' && (
              isPunjabi ? 'ਕੀ ਤੁਸੀਂ ਇਹ ਸੁਨੇਹਾ ਮਿਟਾਉਣਾ ਚਾਹੁੰਦੇ ਹੋ?'
              : isHindi ? 'क्या आप यह संदेश हटाना चाहते हैं?'
              : 'Delete this message?'
            )}
            {confirmAction.type === 'role' && (
              isPunjabi
                ? `${confirmAction.targetName} ਦੀ ਭੂਮਿਕਾ ${confirmAction.role} ਵਿੱਚ ਬਦਲੋ?`
                : isHindi ? `${confirmAction.targetName} की भूमिका ${confirmAction.role} में बदलें?`
                : `Change ${confirmAction.targetName}'s role to ${confirmAction.role}?`
            )}
          </p>
          {confirmAction.type === 'ban' && (
            <div className="mb-2">
              <select
                value={banDuration}
                onChange={(e) => setBanDuration(Number(e.target.value))}
                className="w-full text-xs px-2 py-1.5 rounded-lg border border-red-200 dark:border-red-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value={0}>{isPunjabi ? 'ਪੱਕਾ ਬੈਨ' : isHindi ? 'स्थायी बैन' : 'Permanent'}</option>
                <option value={1}>1 {isPunjabi ? 'ਘੰਟਾ' : isHindi ? 'घंटा' : 'hour'}</option>
                <option value={24}>24 {isPunjabi ? 'ਘੰਟੇ' : isHindi ? 'घंटे' : 'hours'}</option>
                <option value={168}>7 {isPunjabi ? 'ਦਿਨ' : isHindi ? 'दिन' : 'days'}</option>
                <option value={720}>30 {isPunjabi ? 'ਦਿਨ' : isHindi ? 'दिन' : 'days'}</option>
              </select>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (confirmAction.type === 'ban') handleBan(confirmAction.targetId);
                else if (confirmAction.type === 'unban') handleUnban(confirmAction.targetId);
                else if (confirmAction.type === 'delete') handleDeleteMessage(confirmAction.targetId);
                else if (confirmAction.type === 'role') handleSetRole(confirmAction.targetId, confirmAction.role!);
              }}
              disabled={actionLoading === confirmAction.targetId}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {actionLoading === confirmAction.targetId
                ? (isPunjabi ? 'ਲੋਡ...' : isHindi ? 'लोड...' : 'Loading...')
                : (isPunjabi ? 'ਪੁਸ਼ਟੀ' : isHindi ? 'पुष्टि' : 'Confirm')
              }
            </button>
            <button
              onClick={() => setConfirmAction(null)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 transition-colors"
            >
              {isPunjabi ? 'ਰੱਦ' : isHindi ? 'रद्द' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'members' && (
          <div className="p-3 space-y-2">
            {/* Search */}
            <div className="relative mb-3">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isPunjabi ? 'ਮੈਂਬਰ ਲੱਭੋ...' : isHindi ? 'सदस्य खोजें...' : 'Search members...'}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.displayName.slice(0, 2).toUpperCase()}
                    </div>
                    {member.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={cn(
                      'text-sm font-medium text-gray-900 dark:text-white truncate',
                      isPunjabi && 'font-gurmukhi',
                      isHindi && 'font-devanagari'
                    )}>
                      {isPunjabi && member.displayNameGurmukhi ? member.displayNameGurmukhi : member.displayName}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {member.role && member.role !== 'member' && (
                        <span className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                          member.role === 'admin'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        )}>
                          {member.role}
                        </span>
                      )}
                      {member.isBanned && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-medium">
                          {isPunjabi ? 'ਬੈਨ' : isHindi ? 'बैन' : 'Banned'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Admin actions (don't show for self) */}
                {member.id !== user?.id && (
                  <div className="flex items-center gap-1">
                    {member.isBanned ? (
                      <button
                        onClick={() => setConfirmAction({
                          type: 'unban',
                          targetId: member.id,
                          targetName: member.displayName,
                        })}
                        className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        title={isPunjabi ? 'ਅਣਬੈਨ' : isHindi ? 'अनबैन' : 'Unban'}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmAction({
                          type: 'ban',
                          targetId: member.id,
                          targetName: member.displayName,
                        })}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title={isPunjabi ? 'ਬੈਨ' : isHindi ? 'बैन' : 'Ban'}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>
                    )}
                    {/* Role selector */}
                    <select
                      value={member.role || 'member'}
                      onChange={(e) => setConfirmAction({
                        type: 'role',
                        targetId: member.id,
                        targetName: member.displayName,
                        role: e.target.value,
                      })}
                      className="text-[10px] px-1.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    >
                      <option value="member">{isPunjabi ? 'ਮੈਂਬਰ' : isHindi ? 'सदस्य' : 'Member'}</option>
                      <option value="moderator">{isPunjabi ? 'ਮੌਡਰੇਟਰ' : isHindi ? 'मॉडरेटर' : 'Moderator'}</option>
                      <option value="admin">{isPunjabi ? 'ਐਡਮਿਨ' : isHindi ? 'एडमिन' : 'Admin'}</option>
                    </select>
                  </div>
                )}
              </div>
            ))}

            {filteredMembers.length === 0 && (
              <p className={cn(
                'text-sm text-gray-400 text-center py-8',
                isPunjabi && 'font-gurmukhi',
                isHindi && 'font-devanagari'
              )}>
                {isPunjabi ? 'ਕੋਈ ਮੈਂਬਰ ਨਹੀਂ ਮਿਲਿਆ' : isHindi ? 'कोई सदस्य नहीं मिला' : 'No members found'}
              </p>
            )}
          </div>
        )}

        {activeTab === 'pinned' && (
          <div className="p-3 space-y-2">
            {pinnedMessages.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-3xl mb-2 block">📌</span>
                <p className={cn(
                  'text-sm text-gray-400',
                  isPunjabi && 'font-gurmukhi',
                  isHindi && 'font-devanagari'
                )}>
                  {isPunjabi ? 'ਕੋਈ ਪਿੰਨ ਕੀਤਾ ਸੁਨੇਹਾ ਨਹੀਂ' : isHindi ? 'कोई पिन किया संदेश नहीं' : 'No pinned messages'}
                </p>
              </div>
            ) : (
              pinnedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        'text-xs font-medium text-amber-700 dark:text-amber-400 mb-1',
                        isPunjabi && 'font-gurmukhi',
                        isHindi && 'font-devanagari'
                      )}>
                        {msg.user.displayName}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                        {msg.content}
                      </p>
                    </div>
                    <button
                      onClick={() => handleUnpinMessage(msg.id)}
                      disabled={actionLoading === msg.id}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                      title={isPunjabi ? 'ਅਣਪਿੰਨ' : isHindi ? 'अनपिन' : 'Unpin'}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

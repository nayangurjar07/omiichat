'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import {
  getStoredNickname,
  getStoredInterests,
  getStoredLanguage,
} from '@/lib/session';
import { Navbar } from '@/components/ui/Navbar';
import { StatusBar } from '@/components/chat/StatusBar';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ChatInput } from '@/components/chat/ChatInput';
import { ReportModal } from '@/components/chat/ReportModal';
import { ReconnectModal } from '@/components/chat/ReconnectModal';
import { ReportReason, ChatMessage, RoomMessage } from '@/types';
import { saveLocalFriend } from '@/lib/friends';
import { ShieldAlert, RefreshCw, Home, Sparkles, UserPlus, Check, AlertCircle } from 'lucide-react';

function ChatView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reconnectQuery = searchParams.get('reconnect');

  const {
    connectionState,
    isConnected,
    retryConnection,
    status,
    partnerNickname,
    sharedInterests,
    messages,
    partnerTyping,
    banReason,
    errorMessage,
    rateLimitedNotice,
    reconnectInfo,
    friends,
    friendRequests,
    activePartnerFriendRequest,
    friendRequestFeedback,
    sendFriendRequest,
    respondFriendRequest,
    cancelFriendRequest,
    joinQueue,
    leaveQueue,
    sendMessage,
    sendTyping,
    skip,
    block,
    report,
    requestReconnect,
    joinByReconnectCode,
  } = useSocket();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReconnectModalOpen, setIsReconnectModalOpen] = useState(false);
  const [isFriendSent, setIsFriendSent] = useState(false);
  const [reportingMessage, setReportingMessage] = useState<ChatMessage | RoomMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (status === 'matched') {
      setIsFriendSent(false);
    }
  }, [status, partnerNickname]);

  const isAlreadyFriend = friends.some(
    (f) => (partnerNickname && f.nickname.toLowerCase() === partnerNickname.toLowerCase())
  );

  const friendState: 'none' | 'pending' | 'friend' = isAlreadyFriend
    ? 'friend'
    : isFriendSent
    ? 'pending'
    : 'none';

  // Mount effect: join queue or reconnect, with StrictMode-safe cleanup
  useEffect(() => {
    const nick = getStoredNickname() || 'Anonymous';
    const interests = getStoredInterests();
    const lang = getStoredLanguage();

    if (reconnectQuery) {
      joinByReconnectCode(reconnectQuery, nick);
    } else {
      joinQueue(nick, interests, lang);
    }

    return () => {
      if (statusRef.current === 'matched') {
        skip();
      } else {
        leaveQueue();
      }
    };
  }, [joinQueue, leaveQueue, skip, joinByReconnectCode, reconnectQuery]);

  useEffect(() => {
    if (reconnectInfo) {
      setIsReconnectModalOpen(true);
    }
  }, [reconnectInfo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (statusRef.current === 'matched') {
        skip();
      } else {
        leaveQueue();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [skip, leaveQueue]);

  const handleSkip = () => {
    skip();
    const nick = getStoredNickname() || 'Anonymous';
    const interests = getStoredInterests();
    const lang = getStoredLanguage();
    joinQueue(nick, interests, lang);
  };

  const handleBlock = () => {
    block();
    const nick = getStoredNickname() || 'Anonymous';
    const interests = getStoredInterests();
    const lang = getStoredLanguage();
    joinQueue(nick, interests, lang);
  };

  const handleReportSubmit = (reason: ReportReason, detail?: string) => {
    report(reason, detail);
    setReportingMessage(null);
  };

  const handleReportMessage = (msg: ChatMessage | RoomMessage) => {
    setReportingMessage(msg);
    setIsReportModalOpen(true);
  };

  const handleAddFriend = () => {
    sendFriendRequest({});
    setIsFriendSent(true);
  };

  const handleLeave = () => {
    if (statusRef.current === 'matched') {
      skip();
    }
    leaveQueue();
    router.push('/');
  };

  // Banned state
  if (status === 'banned') {
    return (
      <div className="min-h-screen bg-[var(--bg-paper)] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-alert)]/40 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 text-[var(--color-alert)] flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-ink)]">
            Session suspended
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {banReason || 'Your session has been suspended due to violations of community rules.'}
          </p>
          <button
            type="button"
            onClick={() => router.push('/rules')}
            className="w-full py-2.5 text-xs font-semibold rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--border-line)] text-[var(--text-ink)] transition-colors cursor-pointer"
          >
            Review rules
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[var(--bg-paper)] text-[var(--text-ink)] transition-colors overflow-hidden">
      <Navbar inChat={true} isConnected={isConnected} onRetryConnection={retryConnection} />

      {/* Disconnection Warning Banner */}
      {!isConnected && (
        <div className="bg-[var(--bg-subtle)] border-b border-[var(--border-line)] px-4 py-2 text-xs text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-[var(--color-alert)] shrink-0" />
          <span>Can't reach the server. Check your connection, then try again.</span>
          <button
            type="button"
            onClick={retryConnection}
            className="font-semibold text-[var(--accent-dial)] hover:underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Rate limit & general errors */}
      {(errorMessage || rateLimitedNotice) && (
        <div className="bg-[var(--color-alert)] text-white text-xs font-medium px-4 py-2 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{rateLimitedNotice || errorMessage}</span>
        </div>
      )}

      {/* Calm Wide Column Chat Container */}
      <div className="flex-1 flex flex-col min-h-0 w-full max-w-3xl mx-auto">
        {/* Switchboard Chat Header */}
        <StatusBar
          status={status}
          partnerNickname={partnerNickname}
          sharedInterests={sharedInterests}
          isConnected={isConnected}
          onSkip={handleSkip}
          onBlock={handleBlock}
          onReport={() => setIsReportModalOpen(true)}
          onLeave={handleLeave}
          onRequestReconnect={() => requestReconnect()}
          onAddFriend={handleAddFriend}
          friendState={friendState}
        />

        {/* Active In-Chat Mutual Friend Request Banner */}
        {activePartnerFriendRequest && (
          <div className="mx-4 mt-2.5 p-3 rounded-xl bg-[var(--bg-surface)] border border-emerald-500/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl p-1.5 rounded-lg bg-[var(--bg-subtle)] shrink-0">
                {activePartnerFriendRequest.fromAvatar || '🦊'}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--text-ink)] truncate">
                  {activePartnerFriendRequest.fromNickname || partnerNickname || 'Stranger'} sent you a friend request
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Only if you accept will you become friends and see live online / last seen status.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => respondFriendRequest(activePartnerFriendRequest.id, true)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-success)] hover:opacity-90 text-white transition-opacity cursor-pointer shadow-xs"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => respondFriendRequest(activePartnerFriendRequest.id, false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {/* Friend Request Toast Feedback */}
        {friendRequestFeedback && (
          <div
            className={`mx-4 mt-2 px-3.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in ${
              friendRequestFeedback.type === 'success'
                ? 'bg-emerald-500/10 text-[var(--color-success)] border border-emerald-500/20'
                : friendRequestFeedback.type === 'error'
                ? 'bg-rose-500/10 text-[var(--color-alert)] border border-rose-500/20'
                : 'bg-[var(--bg-subtle)] text-[var(--text-ink)] border border-[var(--border-line)]'
            }`}
          >
            <span>{friendRequestFeedback.message}</span>
          </div>
        )}

        {/* Messages and State Area */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-6 space-y-1">
          {/* SEARCHING STATE */}
          {status === 'searching' && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5">
              <div className="space-y-2 max-w-sm">
                <h2 className="font-display text-2xl font-bold text-[var(--text-ink)] tracking-tight">
                  {reconnectQuery ? 'Reconnecting...' : 'Finding someone...'}
                </h2>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {reconnectQuery
                    ? 'Waiting for your partner to redeem the reconnect code.'
                    : 'The line is searching for an available stranger with matching interests.'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleLeave}
                  className="px-4 py-2.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--bg-subtle)] border border-[var(--border-line)] rounded-lg transition-all duration-200 cursor-pointer active:scale-95 inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Home className="w-3.5 h-3.5 text-[var(--accent-dial)]" />
                  <span>Return Home</span>
                </button>
              </div>
            </div>
          )}

          {/* PARTNER LEFT STATE */}
          {status === 'partner_left' && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="space-y-1 max-w-sm">
                <h2 className="font-display text-xl font-bold text-[var(--text-ink)]">
                  Stranger left the line
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  The conversation has ended. You can find someone new or trade a reconnect code.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-[var(--accent-dial)] hover:bg-[var(--accent-dial-hover)] text-white shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Find someone</span>
                </button>

                <button
                  type="button"
                  onClick={() => requestReconnect()}
                  className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-ink)] border border-[var(--border-line)] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent-dial)]" />
                  <span>Trade reconnect code</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddFriend}
                  disabled={friendState !== 'none'}
                  className={`px-4 py-2.5 rounded-lg text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 ${
                    friendState === 'friend'
                      ? 'bg-emerald-500/10 text-[var(--color-success)] border-emerald-500/30 cursor-default'
                      : friendState === 'pending'
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 cursor-default'
                      : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-ink)] border-[var(--border-line)] cursor-pointer'
                  }`}
                >
                  {friendState === 'friend' ? (
                    <Check className="w-3.5 h-3.5 text-[var(--color-success)]" />
                  ) : friendState === 'pending' ? (
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {friendState === 'friend'
                      ? 'Mutual friends'
                      : friendState === 'pending'
                      ? 'Request sent'
                      : `Add ${partnerNickname || 'Stranger'}`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleLeave}
                  className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-ink)] border border-[var(--border-line)] transition-all duration-200 cursor-pointer inline-flex items-center gap-1.5 active:scale-95 shadow-xs"
                >
                  <Home className="w-3.5 h-3.5 text-[var(--accent-dial)]" />
                  <span>Home</span>
                </button>
              </div>
            </div>
          )}

          {/* MATCHED ACTIVE CONVERSATION */}
          {status === 'matched' && (
            <>
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-1 text-[var(--text-muted)] select-none">
                  <p className="text-sm font-semibold text-[var(--text-ink)]">
                    Connected with {partnerNickname || 'Stranger'}
                  </p>
                  <p className="text-xs">
                    Say hello, send a photo, or record a voice note.
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const prevMsg = index > 0 ? messages[index - 1] : null;
                  const isConsecutive =
                    !!prevMsg &&
                    prevMsg.senderId === msg.senderId &&
                    !prevMsg.isSystem &&
                    !msg.isSystem &&
                    msg.timestamp - prevMsg.timestamp < 60000;

                  return (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      partnerNickname={partnerNickname}
                      isConsecutive={isConsecutive}
                      onReportMessage={handleReportMessage}
                    />
                  );
                })
              )}

              {partnerTyping && <TypingIndicator partnerNickname={partnerNickname} />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Bar */}
        <ChatInput
          onSendMessage={sendMessage}
          onTyping={sendTyping}
          onDoubleEsc={handleSkip}
          disabled={status !== 'matched'}
          placeholder={
            status === 'matched'
              ? 'Message... (Enter to send, Esc twice to skip)'
              : status === 'searching'
              ? 'Connecting to the line...'
              : 'Conversation ended'
          }
        />
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportingMessage(null);
        }}
        onSubmit={handleReportSubmit}
        partnerNickname={reportingMessage?.senderNick || partnerNickname}
      />

      {/* Reconnect Modal */}
      <ReconnectModal
        isOpen={isReconnectModalOpen}
        onClose={() => setIsReconnectModalOpen(false)}
        reconnectInfo={reconnectInfo}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[100dvh] flex items-center justify-center bg-[var(--bg-paper)] text-[var(--text-muted)] text-sm font-body">
          Loading conversation...
        </div>
      }
    >
      <ChatView />
    </Suspense>
  );
}

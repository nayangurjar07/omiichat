'use client';

import { useState } from 'react';
import { ChatMessage, RoomMessage } from '@/types';
import { getSessionId } from '@/lib/session';
import { resolveMediaUrl } from '@/lib/endpoints';
import { VoiceNotePlayer } from './VoiceNotePlayer';
import { ImageViewerModal } from './ImageViewerModal';
import { Copy, Eye, EyeOff, Maximize2, ShieldAlert } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage | RoomMessage;
  partnerNickname?: string;
  isConsecutive?: boolean;
  onReportMessage?: (msg: ChatMessage | RoomMessage) => void;
}

export function MessageBubble({
  message,
  partnerNickname,
  isConsecutive = false,
  onReportMessage,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const currentSid = typeof window !== 'undefined' ? getSessionId() : '';
  const isSelf =
    'isSelf' in message && typeof message.isSelf === 'boolean'
      ? !!message.isSelf
      : !!currentSid && message.senderId === currentSid;

  const [isRevealed, setIsRevealed] = useState(isSelf);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const copyText = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const resolvedMediaUrl = message.mediaUrl ? resolveMediaUrl(message.mediaUrl) : undefined;

  // System notice
  if (message.isSystem) {
    return (
      <div className="flex justify-center my-2 select-none">
        <span className="px-3 py-0.5 text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-subtle)] rounded-full border border-[var(--border-line)]">
          {message.text}
        </span>
      </div>
    );
  }

  const senderDisplayName = isSelf
    ? 'You'
    : message.senderNick || partnerNickname || 'Stranger';

  return (
    <div
      className={`group relative flex flex-col ${
        isConsecutive ? 'mt-1' : 'mt-3'
      } ${isSelf ? 'items-end' : 'items-start'}`}
    >
      {/* Sender name & time on hover */}
      {!isConsecutive && (
        <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--text-ink)]">{senderDisplayName}</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[10px]">
            {formatTime(message.timestamp)}
          </span>
        </div>
      )}

      {/* Bubble Container */}
      <div className="relative max-w-[85%] sm:max-w-[70%]">
        <div
          className={`text-sm leading-relaxed break-words overflow-hidden ${
            message.mediaType === 'image'
              ? 'p-1.5 bg-[var(--bg-surface)] border border-[var(--border-line)] rounded-xl'
              : message.mediaType === 'audio'
              ? 'p-0.5'
              : isSelf
              ? 'px-4 py-2.5 bg-[var(--accent-dial)] text-white rounded-2xl rounded-br-xs shadow-xs'
              : 'px-4 py-2.5 bg-[var(--accent-stranger)] text-[var(--accent-stranger-ink)] rounded-2xl rounded-bl-xs shadow-xs font-medium'
          }`}
        >
          {/* IMAGE MEDIA */}
          {message.mediaType === 'image' && resolvedMediaUrl && (
            <div className="relative rounded-lg overflow-hidden bg-black/5">
              <img
                src={resolvedMediaUrl}
                alt="Shared attachment"
                onClick={() => {
                  if (isRevealed) setIsViewerOpen(true);
                }}
                className={`max-w-xs sm:max-w-sm max-h-80 w-auto h-auto object-cover rounded-lg transition-all duration-200 ${
                  isRevealed ? 'filter-none cursor-pointer hover:opacity-95' : 'filter blur-xl scale-105'
                }`}
              />

              {!isRevealed && (
                <div
                  onClick={() => setIsRevealed(true)}
                  className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-opacity hover:bg-black/60 select-none text-white"
                >
                  <Eye className="w-5 h-5 mb-1.5 opacity-90" />
                  <span className="text-xs font-bold">Image hidden</span>
                  <span className="text-[10px] opacity-75 mt-0.5">Click to view</span>
                </div>
              )}

              {isRevealed && (
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => setIsViewerOpen(true)}
                    title="View full screen"
                    className="p-1.5 rounded-md bg-black/70 text-white text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRevealed(false)}
                    title="Hide image"
                    className="p-1.5 rounded-md bg-black/70 text-white text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <EyeOff className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AUDIO MEDIA */}
          {message.mediaType === 'audio' && resolvedMediaUrl && (
            <VoiceNotePlayer audioUrl={resolvedMediaUrl} isSelf={isSelf} />
          )}

          {/* TEXT CONTENT */}
          {message.text && (
            <p className="whitespace-pre-wrap select-text">{message.text}</p>
          )}
        </div>

        {/* Hover Action Strip */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
            isSelf ? '-left-14 pr-1' : '-right-14 pl-1'
          }`}
        >
          {message.text && (
            <button
              type="button"
              onClick={copyText}
              title={copied ? 'Copied' : 'Copy message'}
              className="p-1.5 rounded-md bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-ink)] border border-[var(--border-line)] shadow-xs transition-colors cursor-pointer"
            >
              <Copy className="w-3 h-3" />
            </button>
          )}
          {!isSelf && onReportMessage && (
            <button
              type="button"
              onClick={() => onReportMessage(message)}
              title="Report message"
              className="p-1.5 rounded-md bg-[var(--bg-surface)] hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-[var(--color-alert)] border border-[var(--border-line)] shadow-xs transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Full-screen Viewer */}
      {resolvedMediaUrl && message.mediaType === 'image' && (
        <ImageViewerModal
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          imageUrl={resolvedMediaUrl}
        />
      )}
    </div>
  );
}

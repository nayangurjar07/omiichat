// web/src/components/chat/MessageBubble.tsx
'use client';

import React, { useState } from 'react';
import { resolveMediaUrl } from '@/lib/endpoints';
import { VoiceNotePlayer } from './VoiceNotePlayer';

export interface MessageBubbleProps {
  message: {
    id?: string;
    sender?: 'me' | 'stranger' | 'system' | string;
    senderId?: string;
    senderNick?: string;
    senderName?: string;
    isOwn?: boolean;
    isSelf?: boolean;
    type?: 'text' | 'image' | 'voice' | 'audio' | 'system' | string;
    content?: string;
    text?: string;
    imageUrl?: string;
    fileUrl?: string;
    url?: string;
    audioUrl?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'audio' | string;
    timestamp?: string | number | Date;
    [key: string]: any;
  };
  isOwn?: boolean;
  partnerNickname?: string;
  isConsecutive?: boolean;
  onImageClick?: (url: string) => void;
  onReportMessage?: (msg: any) => void;
  [key: string]: any;
}

function extractImageSource(msg: MessageBubbleProps['message']): string | null {
  if (!msg) return null;
  // 1. Direct explicit image fields
  if (msg.imageUrl) return msg.imageUrl;
  if (msg.mediaType === 'image' && msg.mediaUrl) return msg.mediaUrl;
  if (msg.type === 'image' && (msg.mediaUrl || msg.fileUrl || msg.url || msg.content)) {
    return (msg.mediaUrl || msg.fileUrl || msg.url || msg.content) as string;
  }
  // 2. Candidate from mediaUrl/fileUrl if not explicitly audio
  const candidate = (msg.mediaUrl || msg.fileUrl || msg.url || '').trim();
  if (candidate) {
    if (
      candidate.startsWith('data:image/') ||
      candidate.startsWith('/uploads/') ||
      /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(candidate) ||
      candidate.includes('/storage/v1/object/public/') ||
      candidate.includes('supabase.co') ||
      candidate.includes('neon.tech')
    ) {
      return candidate;
    }
    if (msg.mediaType !== 'audio' && !msg.audioUrl && !/\.(webm|ogg|wav|mp3|m4a)(\?.*)?$/i.test(candidate)) {
      return candidate;
    }
  }
  // 3. Fallback to raw text if it looks like an image URL or data URI
  const raw = (msg.content || msg.text || '').trim();
  if (
    raw.startsWith('data:image/') ||
    raw.startsWith('/uploads/') ||
    /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(raw)
  ) {
    return raw;
  }
  return null;
}

function extractAudioSource(msg: MessageBubbleProps['message']): string | null {
  if (!msg) return null;
  if (msg.audioUrl) return msg.audioUrl;
  if (msg.mediaType === 'audio' && msg.mediaUrl) return msg.mediaUrl;
  if (msg.type === 'voice' || msg.type === 'audio') {
    return (msg.mediaUrl || msg.fileUrl || msg.url || msg.content) as string;
  }
  const candidate = (msg.mediaUrl || msg.fileUrl || msg.url || '').trim();
  if (candidate && (candidate.startsWith('data:audio/') || /\.(webm|ogg|wav|mp3|m4a)(\?.*)?$/i.test(candidate))) {
    return candidate;
  }
  return null;
}

export function MessageBubble({
  message,
  isOwn: propIsOwn,
  partnerNickname,
  isConsecutive = false,
  onImageClick,
  onReportMessage,
}: MessageBubbleProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (message.type === 'system' || message.sender === 'system' || message.isSystem) {
    return (
      <div className="my-2 flex justify-center px-4">
        <span className="rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] px-3.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
          {message.content || message.text}
        </span>
      </div>
    );
  }

  const isSelf =
    propIsOwn ??
    message.isOwn ??
    message.isSelf ??
    (message.sender === 'me' || message.sender === 'self' || message.sender === 'user');

  const imageSrc = extractImageSource(message);
  const audioSrc = extractAudioSource(message);
  const rawText = (message.content || message.text || '').trim();
  const displayCaption =
    (imageSrc &&
      (rawText === imageSrc ||
        rawText.startsWith('data:image/') ||
        rawText === '[shared a photo]' ||
        rawText === 'Shared photo' ||
        rawText === '[photo]')) ||
    (audioSrc && (rawText === audioSrc || rawText.startsWith('data:audio/') || rawText === '[sent audio]'))
      ? ''
      : rawText;

  const displayName = message.senderName || message.senderNick || (isSelf ? 'You' : partnerNickname || 'Stranger');

  return (
    <>
      <div
        className={`flex w-full px-3 sm:px-4 ${isConsecutive ? 'mt-1' : 'mt-2.5'} ${
          isSelf ? 'justify-end' : 'justify-start'
        }`}
      >
        <div
          className={`group relative max-w-[85%] sm:max-w-[72%] rounded-2xl px-3.5 py-2.5 shadow-sm transition ${
            isSelf
              ? 'bg-[var(--bubble-self)] text-[var(--bubble-self-text)] rounded-br-sm'
              : 'bg-[var(--bubble-stranger)] text-[var(--bubble-stranger-text)] border border-[var(--border-subtle)] rounded-bl-sm'
          }`}
        >
          {!isSelf && !isConsecutive && (
            <div className="mb-1 flex items-center justify-between gap-2 text-[11px] font-semibold text-indigo-400">
              <span>{displayName}</span>
              {onReportMessage && (
                <button
                  type="button"
                  onClick={() => onReportMessage(message)}
                  className="opacity-0 group-hover:opacity-100 text-[10px] text-zinc-400 hover:text-red-400 transition"
                  title="Report message"
                >
                  Report
                </button>
              )}
            </div>
          )}

          {/* Photo Attachment */}
          {imageSrc && (
            <div className="mb-1.5 overflow-hidden rounded-xl border border-black/10 bg-black/20">
              <img
                src={resolveMediaUrl(imageSrc)}
                alt="Shared photo"
                loading="eager"
                decoding="async"
                onClick={() => {
                  const fullUrl = resolveMediaUrl(imageSrc);
                  if (onImageClick) onImageClick(fullUrl);
                  else setLightboxOpen(true);
                }}
                className="max-h-72 w-auto max-w-full cursor-zoom-in object-contain transition hover:opacity-95"
              />
            </div>
          )}

          {/* Voice Note Attachment */}
          {audioSrc && (
            <div className="mb-1.5">
              <VoiceNotePlayer audioUrl={resolveMediaUrl(audioSrc)} />
            </div>
          )}

          {/* Text Content */}
          {displayCaption && (
            <p className="whitespace-pre-wrap break-words text-[14.5px] leading-relaxed">
              {displayCaption}
            </p>
          )}
        </div>
      </div>

      {/* Built-in Fullscreen Image Lightbox */}
      {lightboxOpen && imageSrc && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm cursor-zoom-out"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 transition"
            aria-label="Close fullscreen preview"
          >
            ✕
          </button>
          <img
            src={resolveMediaUrl(imageSrc)}
            alt="Fullscreen view"
            className="max-h-[92dvh] max-w-[94vw] rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  );
}

export default MessageBubble;

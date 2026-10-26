'use client';

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { SendHorizonal, Mic, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { VoiceNoteRecorder } from './VoiceNoteRecorder';
import { getApiBase } from '@/lib/endpoints';

interface ChatInputProps {
  onSendMessage: (text?: string, mediaUrl?: string, mediaType?: 'image' | 'audio') => void;
  onTyping: (isTyping: boolean) => void;
  onDoubleEsc?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_LENGTH = 500;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3 MB

export function ChatInput({
  onSendMessage,
  onTyping,
  onDoubleEsc,
  disabled = false,
  placeholder,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const lastEscTimeRef = useRef<number>(0);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && !isRecording && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled, isRecording]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, MAX_LENGTH);
    setText(val);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTyping(true);
    }

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape' && onDoubleEsc) {
      const now = Date.now();
      if (now - lastEscTimeRef.current < 500) {
        onDoubleEsc();
        lastEscTimeRef.current = 0;
      } else {
        lastEscTimeRef.current = now;
      }
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    onSendMessage(trimmed);
    setText('');

    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTyping(false);
    }

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Image must be under 3 MB.');
      setTimeout(() => setImageError(null), 4000);
      return;
    }

    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      setImageError('Only JPEG, PNG, and WebP images are supported.');
      setTimeout(() => setImageError(null), 4000);
      return;
    }

    setIsUploadingImage(true);
    setImageError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let errMsg = 'Upload failed';
        try {
          const data = await res.json();
          errMsg = data.error || errMsg;
        } catch {
          const textMsg = await res.text().catch(() => '');
          if (textMsg) errMsg = textMsg.slice(0, 100);
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      onSendMessage(text.trim() || undefined, data.url, 'image');
      setText('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload image';
      setImageError(msg);
      setTimeout(() => setImageError(null), 5000);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleVoiceNoteReady = (audioUrl: string) => {
    onSendMessage(undefined, audioUrl, 'audio');
    setIsRecording(false);
  };

  const charsLeft = MAX_LENGTH - text.length;

  return (
    <div className="w-full bg-[var(--bg-surface)] border-t border-[var(--border-line)] p-2.5 sm:p-3 transition-colors pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {imageError && (
        <div className="max-w-4xl mx-auto mb-2 p-2 rounded-lg bg-rose-500/10 border border-[var(--color-alert)]/30 text-xs text-[var(--color-alert)] flex items-center justify-between">
          <span>{imageError}</span>
          <button type="button" onClick={() => setImageError(null)} className="cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto flex items-end gap-2">
        {isRecording ? (
          <VoiceNoteRecorder
            onAudioReady={handleVoiceNoteReady}
            onCancel={() => setIsRecording(false)}
          />
        ) : (
          <>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Media attachment buttons */}
            <div className="flex items-center gap-1 shrink-0 pb-0.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploadingImage}
                title="Send photo (JPEG, PNG, WebP)"
                aria-label="Send photo"
                className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer disabled:opacity-40"
              >
                {isUploadingImage ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-dial)]" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsRecording(true)}
                disabled={disabled}
                title="Record voice note"
                aria-label="Record voice note"
                className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer disabled:opacity-40"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            {/* Textarea */}
            <div className="relative flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                rows={1}
                maxLength={MAX_LENGTH}
                placeholder={
                  placeholder ||
                  (disabled
                    ? 'Connecting to the line...'
                    : 'Message... (Enter to send, Esc twice to skip)')
                }
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-lg bg-[var(--bg-paper)] border border-[var(--border-line)] text-[var(--text-ink)] placeholder-[var(--text-muted)] focus:border-[var(--accent-dial)] resize-none transition-colors disabled:opacity-50"
              />

              {text.length > 400 && (
                <span className="absolute right-3 bottom-2 text-[10px] font-mono text-[var(--text-muted)]">
                  {charsLeft}
                </span>
              )}
            </div>

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={disabled || !text.trim()}
              aria-label="Send message"
              className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg bg-[var(--accent-dial)] hover:bg-[var(--accent-dial-hover)] text-white disabled:opacity-40 transition-colors cursor-pointer shrink-0 pb-0.5 active:scale-95"
            >
              <SendHorizonal className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

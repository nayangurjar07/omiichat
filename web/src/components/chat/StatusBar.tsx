'use client';

import { useState } from 'react';
import { ChatStatus } from '@/types';
import { sounds } from '@/lib/sound';
import { SwitchboardLine } from './SwitchboardLine';
import {
  Volume2,
  VolumeX,
  ShieldAlert,
  Sparkles,
  UserPlus,
  Check,
  Home,
} from 'lucide-react';

interface StatusBarProps {
  status: ChatStatus;
  partnerNickname: string;
  sharedInterests: string[];
  isConnected?: boolean;
  onSkip: () => void;
  onBlock: () => void;
  onReport: () => void;
  onLeave: () => void;
  onRequestReconnect?: () => void;
  onAddFriend?: () => void;
  isFriendAdded?: boolean;
  friendState?: 'none' | 'pending' | 'friend';
}

export function StatusBar({
  status,
  partnerNickname,
  sharedInterests,
  isConnected = true,
  onSkip,
  onBlock,
  onReport,
  onLeave,
  onRequestReconnect,
  onAddFriend,
  isFriendAdded = false,
  friendState,
}: StatusBarProps) {
  const [soundEnabled, setSoundEnabled] = useState(sounds.isEnabled());

  const effectiveFriendState = friendState || (isFriendAdded ? 'friend' : 'none');

  const toggleSound = () => {
    const next = sounds.toggle();
    setSoundEnabled(next);
  };

  return (
    <header className="w-full px-4 py-2.5 bg-[var(--bg-surface)] border-b border-[var(--border-line)] transition-colors">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Switchboard signature line */}
        <div className="flex-1 min-w-0 pr-2">
          <SwitchboardLine
            status={status}
            partnerNickname={partnerNickname}
            isCompact={false}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
          {/* Home Button */}
          <button
            type="button"
            onClick={onLeave}
            title="Return to home page"
            className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--bg-subtle)] border border-[var(--border-line)] transition-all duration-200 cursor-pointer active:scale-95 shadow-xs"
          >
            <Home className="w-3.5 h-3.5 text-[var(--accent-dial)]" />
            <span className="hidden sm:inline">Home</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute sound alerts' : 'Enable sound alerts'}
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer active:scale-95"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Report (if in chat or recently left) */}
          {(status === 'matched' || status === 'partner_left') && (
            <button
              type="button"
              onClick={onReport}
              aria-label="Report conversation"
              title="Report user"
              className="min-h-[40px] inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-[var(--color-alert)] hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report</span>
            </button>
          )}

          {/* Add Friend (if matched) */}
          {status === 'matched' && onAddFriend && (
            <button
              type="button"
              onClick={effectiveFriendState === 'none' ? onAddFriend : undefined}
              disabled={effectiveFriendState !== 'none'}
              title={
                effectiveFriendState === 'friend'
                  ? 'Mutual friend'
                  : effectiveFriendState === 'pending'
                  ? 'Request pending recipient acceptance'
                  : 'Send friend request'
              }
              className={`min-h-[40px] inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                effectiveFriendState === 'friend'
                  ? 'bg-emerald-500/10 text-[var(--color-success)] border-emerald-500/30 cursor-default'
                  : effectiveFriendState === 'pending'
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 cursor-default'
                  : 'bg-[var(--bg-subtle)] hover:bg-[var(--border-line)] text-[var(--text-ink)] border-[var(--border-line)] cursor-pointer'
              }`}
            >
              {effectiveFriendState === 'friend' ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : effectiveFriendState === 'pending' ? (
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              ) : (
                <UserPlus className="w-3.5 h-3.5" />
              )}
              <span className="hidden md:inline">
                {effectiveFriendState === 'friend'
                  ? 'Friends'
                  : effectiveFriendState === 'pending'
                  ? 'Request sent'
                  : 'Add friend'}
              </span>
            </button>
          )}

          {/* Skip Button (always visible, primary action) */}
          <button
            type="button"
            onClick={onSkip}
            title="Press Esc twice to skip"
            className="min-h-[40px] inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent-dial)] hover:bg-[var(--accent-dial-hover)] text-white transition-colors cursor-pointer shadow-xs active:scale-95"
          >
            <span>Skip</span>
            <kbd className="hidden sm:inline-block ml-1 px-1 py-0.2 rounded text-[10px] font-mono bg-white/20">
              Esc
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
}

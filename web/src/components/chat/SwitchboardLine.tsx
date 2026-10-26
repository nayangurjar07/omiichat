'use client';

import { ChatStatus } from '@/types';

interface SwitchboardLineProps {
  status: ChatStatus;
  partnerNickname?: string;
  isCompact?: boolean;
}

export function SwitchboardLine({
  status,
  partnerNickname = 'Stranger',
  isCompact = false,
}: SwitchboardLineProps) {
  const isSearching = status === 'searching';
  const isMatched = status === 'matched';
  const isLeft = status === 'partner_left';

  return (
    <div
      role="status"
      aria-label={`Connection state: ${
        isMatched ? `Connected to ${partnerNickname}` : isSearching ? 'Searching for stranger' : isLeft ? 'Stranger disconnected' : 'Idle'
      }`}
      className={`flex items-center gap-2 select-none ${
        isCompact ? 'w-full max-w-md mx-auto' : 'w-full'
      }`}
    >
      {/* Self Jack / Marker */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
            isMatched
              ? 'bg-[var(--accent-dial)] shadow-[0_0_8px_var(--accent-dial)]'
              : isSearching
              ? 'bg-[var(--accent-dial)] animate-pulse'
              : 'bg-[var(--text-muted)]'
          }`}
        />
        <span className="text-xs font-semibold text-[var(--text-ink)] tracking-tight">You</span>
      </div>

      {/* Switchboard Physical Line Canvas / SVG */}
      <div className="flex-1 relative h-6 flex items-center min-w-[60px] sm:min-w-[120px]">
        {isSearching && (
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 200 24"
            preserveAspectRatio="none"
          >
            <path
              d="M 0,12 Q 30,4 60,12 T 120,12 T 180,12 L 200,12"
              fill="none"
              stroke="var(--line-switchboard)"
              strokeWidth="2"
              strokeDasharray="4 3"
              className="animate-[switchboardWave_1.8s_linear_infinite]"
            />
          </svg>
        )}

        {isMatched && (
          <div className="w-full flex items-center transition-all duration-300">
            <div className="w-full h-[2px] bg-[var(--line-switchboard)] rounded-full shadow-[0_0_6px_var(--line-switchboard)]" />
          </div>
        )}

        {isLeft && (
          <div className="w-full flex items-center gap-1 transition-all duration-300">
            <div className="flex-1 h-[2px] bg-[var(--color-alert)]/60 rounded-full" />
            <span className="text-[10px] uppercase font-mono px-1 py-0.5 rounded text-[var(--color-alert)] bg-rose-500/10">
              Cut
            </span>
            <div className="flex-1 h-[2px] bg-[var(--color-alert)]/60 rounded-full" />
          </div>
        )}

        {!isSearching && !isMatched && !isLeft && (
          <div className="w-full h-[1px] bg-[var(--border-line)]" />
        )}
      </div>

      {/* Stranger Jack / Marker */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs font-semibold text-[var(--text-ink)] tracking-tight truncate max-w-[110px] sm:max-w-[160px]">
          {isMatched ? partnerNickname : isLeft ? 'Left' : 'Stranger'}
        </span>
        <span
          className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
            isMatched
              ? 'bg-[var(--accent-stranger)] shadow-[0_0_8px_var(--accent-stranger)]'
              : isLeft
              ? 'bg-[var(--color-alert)]'
              : 'bg-[var(--border-line)]'
          }`}
        />
      </div>
    </div>
  );
}
